import type { Database } from "bun:sqlite";
import { buildExamSchedule, TOTAL_PAPERS } from "./exam-content";
import { addDays, releaseCount } from "./scheduling";
import { applyExamReview, type ExamReviewResult } from "./exam-scheduling";

export interface ExamPaperRow {
  paper_day: number;
  next_review: string;
  submitted_at: string | null;
  score_correct: number | null;
  score_total: number | null;
}

export interface ExamAnswerRow {
  paper_day: number;
  question_index: number;
  your_answer: string;
  correct: number | null;
}

export interface ExamReviewItemRow {
  id: number;
  paper_day: number;
  question_index: number;
  rung: number;
  next_review: string;
}

export function migrateExam(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_papers (
      paper_day INTEGER PRIMARY KEY,
      next_review TEXT NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER
    );
    CREATE TABLE IF NOT EXISTS exam_answers (
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (paper_day, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(paper_day, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE IF NOT EXISTS exam_state (
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);

  const { stateCount } = db.query(`SELECT COUNT(*) AS stateCount FROM exam_state`).get() as {
    stateCount: number;
  };
  if (stateCount === 0) {
    db.query(`INSERT INTO exam_state (released_up_to) VALUES (0)`).run();
  }

  seedNewPapers(db, today);
  runExamReleaseGate(db, today);
}

// Inserts any paper introduced since the last run (e.g. a new week's content
// was added and TOTAL_PAPERS grew) without touching existing rows — placed
// far out on the calendar; the release gate below pulls each one forward
// once backlog clears, exactly like a paper that existed from day one.
function seedNewPapers(db: Database, today: string): void {
  const { maxDay } = db.query(`SELECT COALESCE(MAX(paper_day), 0) AS maxDay FROM exam_papers`).get() as {
    maxDay: number;
  };
  const insert = db.query(`INSERT INTO exam_papers (paper_day, next_review) VALUES (?, ?)`);
  for (const paper of buildExamSchedule()) {
    if (paper.paperDay <= maxDay) continue;
    insert.run(paper.paperDay, addDays(today, paper.paperDay));
  }
}

function runExamReleaseGate(db: Database, today: string): void {
  const { released_up_to } = db.query(`SELECT released_up_to FROM exam_state`).get() as {
    released_up_to: number;
  };
  const { n: backlog } = db
    .query(
      `SELECT COUNT(*) AS n FROM exam_papers WHERE paper_day <= ? AND next_review <= ? AND submitted_at IS NULL`,
    )
    .get(released_up_to, today) as { n: number };
  const remaining = TOTAL_PAPERS - released_up_to;
  const toRelease = releaseCount(backlog, remaining);
  if (toRelease === 0) return;

  const newUpTo = released_up_to + toRelease;
  db.query(`UPDATE exam_papers SET next_review = ? WHERE paper_day > ? AND paper_day <= ?`).run(
    today,
    released_up_to,
    newUpTo,
  );
  db.query(`UPDATE exam_state SET released_up_to = ?`).run(newUpTo);
}

export function listDueExamPapers(db: Database, today: string): ExamPaperRow[] {
  runExamReleaseGate(db, today);
  return db
    .query(
      `SELECT paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers
       WHERE paper_day <= (SELECT released_up_to FROM exam_state) AND next_review <= ? AND submitted_at IS NULL
       ORDER BY next_review, paper_day`,
    )
    .all(today) as ExamPaperRow[];
}

export function getExamPaperRow(db: Database, paperDay: number): ExamPaperRow | null {
  return db
    .query(
      `SELECT paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers WHERE paper_day = ?`,
    )
    .get(paperDay) as ExamPaperRow | null;
}

export function listExamAnswers(db: Database, paperDay: number): ExamAnswerRow[] {
  return db
    .query(`SELECT paper_day, question_index, your_answer, correct FROM exam_answers WHERE paper_day = ?`)
    .all(paperDay) as ExamAnswerRow[];
}

export function saveExamAnswer(db: Database, paperDay: number, questionIndex: number, yourAnswer: string): void {
  db.query(
    `INSERT INTO exam_answers (paper_day, question_index, your_answer) VALUES (?, ?, ?)
     ON CONFLICT (paper_day, question_index) DO UPDATE SET your_answer = excluded.your_answer`,
  ).run(paperDay, questionIndex, yourAnswer);
}

// yourAnswer is optional: mcq/truefalse grade themselves on selection and
// pass the chosen option index here in the same call; short/scenario save
// their draft separately (saveExamAnswer, during the reveal step) and only
// call this once, with the self-reported verdict.
export function gradeExamAnswer(
  db: Database,
  paperDay: number,
  questionIndex: number,
  correct: boolean,
  yourAnswer?: string,
): void {
  if (yourAnswer !== undefined) {
    db.query(
      `INSERT INTO exam_answers (paper_day, question_index, your_answer, correct) VALUES (?, ?, ?, ?)
       ON CONFLICT (paper_day, question_index) DO UPDATE SET your_answer = excluded.your_answer, correct = excluded.correct`,
    ).run(paperDay, questionIndex, yourAnswer, correct ? 1 : 0);
  } else {
    db.query(
      `INSERT INTO exam_answers (paper_day, question_index, your_answer, correct) VALUES (?, ?, '', ?)
       ON CONFLICT (paper_day, question_index) DO UPDATE SET correct = excluded.correct`,
    ).run(paperDay, questionIndex, correct ? 1 : 0);
  }
}

export type SubmitExamResult =
  | { ok: true; scoreCorrect: number; scoreTotal: number }
  | { ok: false; reason: "not_found" | "already_submitted" | "incomplete" };

export function submitExamPaper(db: Database, paperDay: number, today: string): SubmitExamResult {
  const paper = getExamPaperRow(db, paperDay);
  if (!paper) return { ok: false, reason: "not_found" };
  if (paper.submitted_at) return { ok: false, reason: "already_submitted" };

  const content = buildExamSchedule().find((p) => p.paperDay === paperDay);
  if (!content) return { ok: false, reason: "not_found" };

  const answers = listExamAnswers(db, paperDay);
  const gradedByIndex = new Map(answers.map((a) => [a.question_index, a.correct]));
  for (let i = 0; i < content.questions.length; i++) {
    const c = gradedByIndex.get(i);
    if (c === null || c === undefined) return { ok: false, reason: "incomplete" };
  }

  const scoreCorrect = answers.filter((a) => a.correct === 1).length;
  const scoreTotal = content.questions.length;
  db.query(`UPDATE exam_papers SET submitted_at = ?, score_correct = ?, score_total = ? WHERE paper_day = ?`).run(
    today,
    scoreCorrect,
    scoreTotal,
    paperDay,
  );

  const insertReview = db.query(
    `INSERT INTO exam_review_items (paper_day, question_index, rung, next_review) VALUES (?, ?, -1, ?)
     ON CONFLICT (paper_day, question_index) DO NOTHING`,
  );
  for (const a of answers) {
    if (a.correct === 0) insertReview.run(paperDay, a.question_index, addDays(today, 1));
  }

  return { ok: true, scoreCorrect, scoreTotal };
}

export function countOverdueExamPapers(db: Database, today: string): number {
  runExamReleaseGate(db, today);
  const row = db
    .query(
      `SELECT COUNT(*) AS n FROM exam_papers
       WHERE paper_day <= (SELECT released_up_to FROM exam_state) AND next_review < ? AND submitted_at IS NULL`,
    )
    .get(today) as { n: number };
  return row.n;
}

export function countExamPapersSubmittedToday(db: Database, today: string): number {
  const row = db.query(`SELECT COUNT(*) AS n FROM exam_papers WHERE submitted_at = ?`).get(today) as { n: number };
  return row.n;
}

export function listExamPapersSubmittedToday(db: Database, today: string): ExamPaperRow[] {
  return db
    .query(
      `SELECT paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers WHERE submitted_at = ? ORDER BY paper_day`,
    )
    .all(today) as ExamPaperRow[];
}

export function listDueExamReviewItems(db: Database, today: string): ExamReviewItemRow[] {
  return db
    .query(
      `SELECT id, paper_day, question_index, rung, next_review FROM exam_review_items WHERE next_review <= ? ORDER BY next_review, id`,
    )
    .all(today) as ExamReviewItemRow[];
}

export function countOverdueExamReviewItems(db: Database, today: string): number {
  const row = db.query(`SELECT COUNT(*) AS n FROM exam_review_items WHERE next_review < ?`).get(today) as {
    n: number;
  };
  return row.n;
}

export function countExamReviewsToday(db: Database, today: string): number {
  const row = db.query(`SELECT COUNT(*) AS n FROM exam_review_log WHERE reviewed_at = ?`).get(today) as {
    n: number;
  };
  return row.n;
}

export function listExamReviewsCompletedToday(
  db: Database,
  today: string,
): { paper_day: number; question_index: number }[] {
  return db
    .query(`SELECT paper_day, question_index FROM exam_review_log WHERE reviewed_at = ?`)
    .all(today) as { paper_day: number; question_index: number }[];
}

export function reviewExamItem(
  db: Database,
  paperDay: number,
  questionIndex: number,
  result: ExamReviewResult,
  today: string,
): ExamReviewItemRow | null {
  const current = db
    .query(
      `SELECT id, paper_day, question_index, rung, next_review FROM exam_review_items WHERE paper_day = ? AND question_index = ?`,
    )
    .get(paperDay, questionIndex) as ExamReviewItemRow | null;
  if (!current) return null;

  db.query(`INSERT INTO exam_review_log (paper_day, question_index, reviewed_at, result) VALUES (?, ?, ?, ?)`).run(
    paperDay,
    questionIndex,
    today,
    result,
  );

  const { rung, nextReview } = applyExamReview(current.rung, result, today);
  db.query(`UPDATE exam_review_items SET rung = ?, next_review = ? WHERE id = ?`).run(rung, nextReview, current.id);
  return { ...current, rung, next_review: nextReview };
}
