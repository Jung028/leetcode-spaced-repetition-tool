import type { Database } from "bun:sqlite";
import {
  listExamPaperRows,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  retakeExamPaper,
  retakeWrongOnlyExamPaper,
  countExamPapersSubmittedToday,
  listExamPapersSubmittedToday,
  listExamAttemptHistory,
  listVisibleCourses,
  listAllCoursesWithOverrides,
  renameCourse,
  setCourseHidden,
  hideExamWeek,
  unhideExamWeek,
  listHiddenExamWeeks,
  type ExamPaperRow,
  type ExamAttemptSummary,
} from "./db";
import {
  buildExamSchedule,
  listExamCourses,
  weekStartDate,
  weekDueDate,
  groupExamPapersByWeek,
  type ExamWeekView,
  type ExamWeekPaperSummary,
} from "./content";
import { findPendingWeeks } from "./sync";
import { resolveWeekDir, startGenerateJob, readJobStatus, defaultGenerateDeps, type StartJobDeps } from "./generate";
import type { ExamQuestionType } from "../exam-content/types";
import { localToday } from "../shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

function isKnownCourse(course: string): boolean {
  return listExamCourses().some((c) => c.code === course);
}

function parseWeek(raw: string): number | null {
  const week = Number(raw);
  if (!Number.isInteger(week) || week < 1) return null;
  return week;
}

// A week "exists" for hide/unhide purposes if the board could ever show it:
// either it has authored static content, or it still has exam_papers rows
// (e.g. a week whose week-N.ts was removed but whose progress rows remain).
function weekExistsForCourse(db: Database, course: string, week: number): boolean {
  if (buildExamSchedule().some((p) => p.course === course && p.week === week)) return true;
  return listExamPaperRows(db, course).some((r) => r.week === week);
}

function parsePaperNumber(raw: string, course: string, week: number): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return null;
  const exists = buildExamSchedule().some((p) => p.course === course && p.week === week && p.paperNumber === n);
  return exists ? n : null;
}

function parseQuestionIndex(raw: string, course: string, week: number, paperNumber: number): number | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.week === week && p.paperNumber === paperNumber);
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
  promptImage: string | null;
  promptDiagram: string | null;
  answerDiagram: string | null;
  requiresDrawing: boolean;
  yourAnswer: string;
  correct: number | null;
}

export interface ExamPaperView {
  week: number;
  paperNumber: number;
  title: string;
  topics: string;
  dueDate: string;
  submittedAt: string | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  questions: ExamQuestionView[];
}

function paperView(db: Database, course: string, row: ExamPaperRow): ExamPaperView | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.week === row.week && p.paperNumber === row.paper_number);
  if (!content) return null;
  const answers = new Map(listExamAnswers(db, course, row.week, row.paper_number).map((a) => [a.question_index, a]));
  return {
    week: row.week,
    paperNumber: row.paper_number,
    title: content.title,
    topics: content.topics,
    dueDate: weekDueDate(row.week),
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
      promptImage: q.promptImage ?? null,
      promptDiagram: q.promptDiagram ?? null,
      answerDiagram: q.answerDiagram ?? null,
      requiresDrawing: q.requiresDrawing ?? false,
      yourAnswer: answers.get(index)?.your_answer ?? "",
      correct: answers.get(index)?.correct ?? null,
    })),
  };
}

export interface ExamHistoryPaper extends ExamWeekPaperSummary {
  pastAttempts: ExamAttemptSummary[];
}

export interface ExamHistoryWeek {
  week: number;
  dueDate: string;
  papers: ExamHistoryPaper[];
}

export function examApiRoutes(
  db: Database,
  generateDeps: StartJobDeps & { courseDirs?: Record<string, string> } = defaultGenerateDeps,
) {
  return {
    "/api/exam/courses": {
      GET: (req: Request) => {
        const includeHidden = new URL(req.url).searchParams.get("includeHidden") === "1";
        return json(includeHidden ? listAllCoursesWithOverrides(db) : listVisibleCourses(db));
      },
    },
    "/api/exam/courses/:course": {
      PATCH: async (req: Request & { params: { course: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const body = (await req.json().catch(() => null)) as { name?: string; hidden?: boolean } | null;
        if (!body || (body.name === undefined && body.hidden === undefined)) {
          return json({ error: "name or hidden required" }, 400);
        }
        if (body.name !== undefined) {
          const name = body.name.trim();
          if (!name) return json({ error: "name cannot be empty" }, 400);
          renameCourse(db, course, name);
        }
        if (body.hidden !== undefined) setCourseHidden(db, course, body.hidden);
        return json(listAllCoursesWithOverrides(db).find((c) => c.code === course));
      },
    },
    "/api/exam/courses/:course/:week": {
      // Per-week reversible hide, one level down from the course-level hide
      // on /api/exam/courses/:course. A hidden week keeps all its papers,
      // answers, scores and attempt history — it just drops out of the
      // board due-list, the History list and the Home due-list.
      PATCH: async (req: Request & { params: { course: string; week: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null || !weekExistsForCourse(db, course, week)) return json({ error: "week not found" }, 404);
        const body = (await req.json().catch(() => null)) as { hidden?: unknown } | null;
        if (typeof body?.hidden !== "boolean") return json({ error: "hidden must be a boolean" }, 400);
        if (body.hidden) hideExamWeek(db, course, week);
        else unhideExamWeek(db, course, week);
        return json({ hiddenWeeks: listHiddenExamWeeks(db, course) });
      },
    },
    "/api/exam/sync": {
      GET: () => json({ pending: findPendingWeeks() }),
    },
    "/api/exam/:course/:week/generate": {
      POST: async (req: Request & { params: { course: string; week: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const weekDir = resolveWeekDir(course, week, generateDeps.courseDirs);
        if (!weekDir) return json({ error: "no material found for this week" }, 404);
        const result = await startGenerateJob(course, week, weekDir, generateDeps);
        if (!result.ok) return json({ error: result.reason }, 409);
        return json({}, 202);
      },
    },
    "/api/exam/:course/:week/generate/status": {
      GET: async (req: Request & { params: { course: string; week: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        return json(await readJobStatus(course, week, generateDeps.root));
      },
    },
    "/api/exam/:course/:week/update": {
      POST: async (req: Request & { params: { course: string; week: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const alreadyAuthored = buildExamSchedule().some((p) => p.course === course && p.week === week);
        if (!alreadyAuthored) return json({ error: "week not yet generated — use Generate instead" }, 400);
        const weekDir = resolveWeekDir(course, week, generateDeps.courseDirs);
        if (!weekDir) return json({ error: "no material found for this week" }, 404);
        const result = await startGenerateJob(course, week, weekDir, { ...generateDeps, mode: "update" });
        if (!result.ok) return json({ error: result.reason }, 409);
        return json({}, 202);
      },
    },
    "/api/exam/:course/due": {
      GET: (req: Request & { params: { course: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const today = localToday();
        const hiddenWeeks = listHiddenExamWeeks(db, course);
        const hidden = new Set(hiddenWeeks);
        const visibleRows = listExamPaperRows(db, course).filter(
          (r) => weekStartDate(r.week) <= today && !hidden.has(r.week),
        );
        const weeksDue: ExamWeekView[] = groupExamPapersByWeek(course, visibleRows, today).filter((w) =>
          w.papers.some((p) => !p.submitted),
        );
        const dueWeekCount = weeksDue.filter((w) => !w.overdue).length;
        const overdueWeekCount = weeksDue.filter((w) => w.overdue).length;
        return json({
          weeksDue,
          hiddenWeeks,
          stats: {
            dueCount: dueWeekCount,
            overdueCount: overdueWeekCount,
            completedToday: countExamPapersSubmittedToday(db, course, today),
          },
        });
      },
    },
    "/api/exam/:course/history": {
      GET: (req: Request & { params: { course: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const today = localToday();
        const hidden = new Set(listHiddenExamWeeks(db, course));
        const visibleRows = listExamPaperRows(db, course).filter(
          (r) => weekStartDate(r.week) <= today && !hidden.has(r.week),
        );
        const weeks: ExamHistoryWeek[] = groupExamPapersByWeek(course, visibleRows, today)
          .sort((a, b) => b.week - a.week)
          .map((w) => ({
            week: w.week,
            dueDate: w.dueDate,
            papers: w.papers.map((p) => ({
              ...p,
              pastAttempts: listExamAttemptHistory(db, course, w.week, p.paperNumber),
            })),
          }));
        return json({ weeks });
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
    "/api/exam/:course/:week/:paperNumber": {
      GET: (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const row = getExamPaperRow(db, course, week, paperNumber);
        if (!row) return json({ error: "not found" }, 404);
        return json(paperView(db, course, row));
      },
    },
    "/api/exam/:course/:week/:paperNumber/answer": {
      POST: async (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const body = (await req.json().catch(() => null)) as
          | { questionIndex?: unknown; yourAnswer?: unknown }
          | null;
        // typeof-guard first: Number("") is 0, not NaN, so falling through to
        // parseQuestionIndex on a missing/non-numeric questionIndex would
        // silently accept it as index 0 instead of rejecting it.
        const questionIndex =
          typeof body?.questionIndex === "number"
            ? parseQuestionIndex(String(body.questionIndex), course, week, paperNumber)
            : null;
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : "";
        saveExamAnswer(db, course, week, paperNumber, questionIndex, yourAnswer);
        return json(paperView(db, course, getExamPaperRow(db, course, week, paperNumber)!));
      },
    },
    "/api/exam/:course/:week/:paperNumber/:questionIndex/grade": {
      POST: async (
        req: Request & { params: { course: string; week: string; paperNumber: string; questionIndex: string } },
      ) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, course, week, paperNumber);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as
          | { correct?: unknown; yourAnswer?: unknown }
          | null;
        if (typeof body?.correct !== "boolean") return json({ error: "correct must be a boolean" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : undefined;
        gradeExamAnswer(db, course, week, paperNumber, questionIndex, body.correct, yourAnswer);
        return json(paperView(db, course, getExamPaperRow(db, course, week, paperNumber)!));
      },
    },
    "/api/exam/:course/:week/:paperNumber/submit": {
      POST: (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const result = submitExamPaper(db, course, week, paperNumber, localToday());
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
    "/api/exam/:course/:week/:paperNumber/retake": {
      POST: (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const result = retakeExamPaper(db, course, week, paperNumber);
        if (!result.ok) {
          const status = result.reason === "not_found" ? 404 : 400;
          const message = result.reason === "not_found" ? "not found" : "paper not yet submitted";
          return json({ error: message }, status);
        }
        return json({ ok: true });
      },
    },
    "/api/exam/:course/:week/:paperNumber/retake-wrong": {
      POST: (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const result = retakeWrongOnlyExamPaper(db, course, week, paperNumber);
        if (!result.ok) {
          const status = result.reason === "not_found" ? 404 : 400;
          const message = result.reason === "not_found" ? "not found" : "paper not yet submitted";
          return json({ error: message }, status);
        }
        return json({ ok: true });
      },
    },
  };
}
