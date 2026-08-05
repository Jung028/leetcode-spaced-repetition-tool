import type { Database } from "bun:sqlite";
import {
  listDueExamPapers,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countOverdueExamPapers,
  countExamPapersSubmittedToday,
  listExamPapersSubmittedToday,
  listDueExamReviewItems,
  countOverdueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
  type ExamPaperRow,
  type ExamReviewItemRow,
} from "./exam-db";
import { buildExamSchedule, totalPapersForCourse, listExamCourses } from "./exam-content";
import type { ExamQuestionType } from "./exam-content/types";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

function isKnownCourse(course: string): boolean {
  return listExamCourses().some((c) => c.code === course);
}

function parsePaperDay(raw: string, course: string): number | null {
  const day = Number(raw);
  if (!Number.isInteger(day) || day < 1 || day > totalPapersForCourse(course)) return null;
  return day;
}

function parseQuestionIndex(raw: string, course: string, paperDay: number): number | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.paperDay === paperDay);
  if (!content) return null;
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0 || index >= content.questions.length) return null;
  return index;
}

export interface ExamQuestionView {
  index: number;
  type: ExamQuestionType;
  prompt: string;
  options: string[] | null;
  correctIndex: number | null;
  modelAnswer: string;
  yourAnswer: string;
  correct: number | null;
}

export interface ExamPaperView {
  paperDay: number;
  week: number;
  paperNumber: number;
  title: string;
  topics: string;
  nextReview: string;
  submittedAt: string | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  questions: ExamQuestionView[];
}

function paperView(db: Database, course: string, row: ExamPaperRow): ExamPaperView | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.paperDay === row.paper_day);
  if (!content) return null;
  const answers = new Map(listExamAnswers(db, course, row.paper_day).map((a) => [a.question_index, a]));
  return {
    paperDay: row.paper_day,
    week: content.week,
    paperNumber: content.paperNumber,
    title: content.title,
    topics: content.topics,
    nextReview: row.next_review,
    submittedAt: row.submitted_at,
    scoreCorrect: row.score_correct,
    scoreTotal: row.score_total,
    questions: content.questions.map((q, index) => ({
      index,
      type: q.type,
      prompt: q.prompt,
      options: q.options ?? null,
      correctIndex: q.correctIndex ?? null,
      modelAnswer: q.modelAnswer,
      yourAnswer: answers.get(index)?.your_answer ?? "",
      correct: answers.get(index)?.correct ?? null,
    })),
  };
}

export interface ExamReviewView {
  paperDay: number;
  questionIndex: number;
  rung: number;
  nextReview: string;
  prompt: string;
  modelAnswer: string;
  options: string[] | null;
  correctIndex: number | null;
}

function reviewView(course: string, item: ExamReviewItemRow): ExamReviewView | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.paperDay === item.paper_day);
  const question = content?.questions[item.question_index];
  if (!content || !question) return null;
  return {
    paperDay: item.paper_day,
    questionIndex: item.question_index,
    rung: item.rung,
    nextReview: item.next_review,
    prompt: question.prompt,
    modelAnswer: question.modelAnswer,
    options: question.options ?? null,
    correctIndex: question.correctIndex ?? null,
  };
}

export function examApiRoutes(db: Database) {
  return {
    "/api/exam/courses": {
      GET: () => json(listExamCourses()),
    },
    "/api/exam/:course/due": {
      GET: (req: Request & { params: { course: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const today = localToday();
        const papers = listDueExamPapers(db, course, today);
        const reviewItems = listDueExamReviewItems(db, course, today);
        const paper = papers.length > 0 ? paperView(db, course, papers[0]!) : null;
        const reviewDue = reviewItems
          .map((item) => reviewView(course, item))
          .filter((r): r is ExamReviewView => r !== null);
        return json({
          paper,
          reviewDue,
          stats: {
            dueCount: papers.length + reviewItems.length,
            overdueCount: countOverdueExamPapers(db, course, today) + countOverdueExamReviewItems(db, course, today),
            completedToday: countExamPapersSubmittedToday(db, course, today) + countExamReviewsToday(db, course, today),
          },
        });
      },
    },
    "/api/exam/:course/completed-today": {
      GET: (req: Request & { params: { course: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const today = localToday();
        const papers = listExamPapersSubmittedToday(db, course, today)
          .map((row) => paperView(db, course, row))
          .filter((p): p is ExamPaperView => p !== null);
        return json({ papers });
      },
    },
    "/api/exam/:course/:day/answer": {
      POST: async (req: Request & { params: { course: string; day: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const day = parsePaperDay(req.params.day, course);
        if (day === null) return json({ error: `day must be between 1 and ${totalPapersForCourse(course)}` }, 400);
        const body = (await req.json().catch(() => null)) as
          | { questionIndex?: unknown; yourAnswer?: unknown }
          | null;
        // typeof-guard first: Number("") is 0, not NaN, so falling through to
        // parseQuestionIndex on a missing/non-numeric questionIndex would
        // silently accept it as index 0 instead of rejecting it.
        const questionIndex =
          typeof body?.questionIndex === "number"
            ? parseQuestionIndex(String(body.questionIndex), course, day)
            : null;
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : "";
        saveExamAnswer(db, course, day, questionIndex, yourAnswer);
        return json(paperView(db, course, getExamPaperRow(db, course, day)!));
      },
    },
    "/api/exam/:course/:day/:questionIndex/grade": {
      POST: async (req: Request & { params: { course: string; day: string; questionIndex: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const day = parsePaperDay(req.params.day, course);
        if (day === null) return json({ error: `day must be between 1 and ${totalPapersForCourse(course)}` }, 400);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, course, day);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as
          | { correct?: unknown; yourAnswer?: unknown }
          | null;
        if (typeof body?.correct !== "boolean") return json({ error: "correct must be a boolean" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : undefined;
        gradeExamAnswer(db, course, day, questionIndex, body.correct, yourAnswer);
        return json(paperView(db, course, getExamPaperRow(db, course, day)!));
      },
    },
    "/api/exam/:course/:day/submit": {
      POST: (req: Request & { params: { course: string; day: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const day = parsePaperDay(req.params.day, course);
        if (day === null) return json({ error: `day must be between 1 and ${totalPapersForCourse(course)}` }, 400);
        const result = submitExamPaper(db, course, day, localToday());
        if (!result.ok) {
          const status = result.reason === "not_found" ? 404 : 400;
          const message =
            result.reason === "not_found"
              ? "not found"
              : result.reason === "already_submitted"
                ? "paper already submitted"
                : "grade every question before submitting";
          return json({ error: message }, status);
        }
        return json({ scoreCorrect: result.scoreCorrect, scoreTotal: result.scoreTotal });
      },
    },
    "/api/exam/review/:course/:day/:questionIndex": {
      POST: async (req: Request & { params: { course: string; day: string; questionIndex: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const day = parsePaperDay(req.params.day, course);
        if (day === null) return json({ error: `day must be between 1 and ${totalPapersForCourse(course)}` }, 400);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, course, day);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as { result?: string } | null;
        if (body?.result !== "correct" && body?.result !== "wrong") {
          return json({ error: "result must be 'correct' or 'wrong'" }, 400);
        }
        const updated = reviewExamItem(db, course, day, questionIndex, body.result, localToday());
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
  };
}
