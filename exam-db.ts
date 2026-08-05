import type { Database } from "bun:sqlite";
import { buildExamSchedule, totalPapersForCourse } from "./exam-content";
import { addDays, releaseCount } from "./scheduling";
import { applyExamReview, type ExamReviewResult } from "./exam-scheduling";

export interface ExamPaperRow {
  course: string;
  paper_day: number;
  next_review: string;
  submitted_at: string | null;
  score_correct: number | null;
  score_total: number | null;
}

export interface ExamAnswerRow {
  course: string;
  paper_day: number;
  question_index: number;
  your_answer: string;
  correct: number | null;
}

export interface ExamReviewItemRow {
  id: number;
  course: string;
  paper_day: number;
  question_index: number;
  rung: number;
  next_review: string;
}

export function migrateExam(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_papers (
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      next_review TEXT NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER,
      PRIMARY KEY (course, paper_day)
    );
    CREATE TABLE IF NOT EXISTS exam_answers (
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (course, paper_day, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(course, paper_day, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE IF NOT EXISTS exam_state (
      course TEXT PRIMARY KEY,
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);

  migrateLegacySingleCourseShape(db);

  const courses = new Set(buildExamSchedule().map((p) => p.course));
  for (const course of courses) {
    ensureExamStateRow(db, course);
    seedNewPapers(db, course, today);
    runExamReleaseGate(db, course, today);
  }
}

// One-time upgrade of a pre-existing single-course db (every exam_* table
// keyed without a `course` column) into the multi-course shape, backfilling
// course = 'INFO5995' — the only course that has ever existed before this
// migration, so every pre-existing paper_day value is already correctly
// "1-based within INFO5995" with no renumbering needed. SQLite can't ALTER
// a primary key, so this recreates each table and copies rows across.
function migrateLegacySingleCourseShape(db: Database): void {
  const columns = db.query(`PRAGMA table_info(exam_papers)`).all() as { name: string }[];
  const isLegacy = columns.length > 0 && !columns.some((c) => c.name === "course");
  if (!isLegacy) return;

  db.exec(`
    CREATE TABLE exam_papers_new (
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      next_review TEXT NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER,
      PRIMARY KEY (course, paper_day)
    );
    INSERT INTO exam_papers_new (course, paper_day, next_review, submitted_at, score_correct, score_total)
      SELECT 'INFO5995', paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers;
    DROP TABLE exam_papers;
    ALTER TABLE exam_papers_new RENAME TO exam_papers;

    CREATE TABLE exam_answers_new (
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (course, paper_day, question_index)
    );
    INSERT INTO exam_answers_new (course, paper_day, question_index, your_answer, correct)
      SELECT 'INFO5995', paper_day, question_index, your_answer, correct FROM exam_answers;
    DROP TABLE exam_answers;
    ALTER TABLE exam_answers_new RENAME TO exam_answers;

    CREATE TABLE exam_review_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(course, paper_day, question_index)
    );
    INSERT INTO exam_review_items_new (id, course, paper_day, question_index, rung, next_review)
      SELECT id, 'INFO5995', paper_day, question_index, rung, next_review FROM exam_review_items;
    DROP TABLE exam_review_items;
    ALTER TABLE exam_review_items_new RENAME TO exam_review_items;

    CREATE TABLE exam_review_log_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    INSERT INTO exam_review_log_new (id, course, paper_day, question_index, reviewed_at, result)
      SELECT id, 'INFO5995', paper_day, question_index, reviewed_at, result FROM exam_review_log;
    DROP TABLE exam_review_log;
    ALTER TABLE exam_review_log_new RENAME TO exam_review_log;

    CREATE TABLE exam_state_new (
      course TEXT PRIMARY KEY,
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO exam_state_new (course, released_up_to)
      SELECT 'INFO5995', released_up_to FROM exam_state;
    DROP TABLE exam_state;
    ALTER TABLE exam_state_new RENAME TO exam_state;
  `);
}

function ensureExamStateRow(db: Database, course: string): void {
  const { n } = db.query(`SELECT COUNT(*) AS n FROM exam_state WHERE course = ?`).get(course) as { n: number };
  if (n === 0) db.query(`INSERT INTO exam_state (course, released_up_to) VALUES (?, 0)`).run(course);
}

// Inserts any paper introduced since the last run (e.g. a new week's content
// was added for this course) without touching existing rows — placed far
// out on the calendar; the release gate below pulls each one forward once
// backlog clears, exactly like a paper that existed from day one.
function seedNewPapers(db: Database, course: string, today: string): void {
  const { maxDay } = db
    .query(`SELECT COALESCE(MAX(paper_day), 0) AS maxDay FROM exam_papers WHERE course = ?`)
    .get(course) as { maxDay: number };
  const insert = db.query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES (?, ?, ?)`);
  for (const paper of buildExamSchedule()) {
    if (paper.course !== course) continue;
    if (paper.paperDay <= maxDay) continue;
    insert.run(course, paper.paperDay, addDays(today, paper.paperDay));
  }
}

function runExamReleaseGate(db: Database, course: string, today: string): void {
  const { released_up_to } = db
    .query(`SELECT released_up_to FROM exam_state WHERE course = ?`)
    .get(course) as { released_up_to: number };
  const { n: backlog } = db
    .query(
      `SELECT COUNT(*) AS n FROM exam_papers WHERE course = ? AND paper_day <= ? AND next_review <= ? AND submitted_at IS NULL`,
    )
    .get(course, released_up_to, today) as { n: number };
  const remaining = totalPapersForCourse(course) - released_up_to;
  const toRelease = releaseCount(backlog, remaining);
  if (toRelease === 0) return;

  const newUpTo = released_up_to + toRelease;
  db.query(`UPDATE exam_papers SET next_review = ? WHERE course = ? AND paper_day > ? AND paper_day <= ?`).run(
    today,
    course,
    released_up_to,
    newUpTo,
  );
  db.query(`UPDATE exam_state SET released_up_to = ? WHERE course = ?`).run(newUpTo, course);
}

export function listDueExamPapers(db: Database, course: string, today: string): ExamPaperRow[] {
  runExamReleaseGate(db, course, today);
  return db
    .query(
      `SELECT course, paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers
       WHERE course = ? AND paper_day <= (SELECT released_up_to FROM exam_state WHERE course = ?) AND next_review <= ? AND submitted_at IS NULL
       ORDER BY next_review, paper_day`,
    )
    .all(course, course, today) as ExamPaperRow[];
}

export function getExamPaperRow(db: Database, course: string, paperDay: number): ExamPaperRow | null {
  return db
    .query(
      `SELECT course, paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers WHERE course = ? AND paper_day = ?`,
    )
    .get(course, paperDay) as ExamPaperRow | null;
}

export function listExamAnswers(db: Database, course: string, paperDay: number): ExamAnswerRow[] {
  return db
    .query(
      `SELECT course, paper_day, question_index, your_answer, correct FROM exam_answers WHERE course = ? AND paper_day = ?`,
    )
    .all(course, paperDay) as ExamAnswerRow[];
}

export function saveExamAnswer(
  db: Database,
  course: string,
  paperDay: number,
  questionIndex: number,
  yourAnswer: string,
): void {
  db.query(
    `INSERT INTO exam_answers (course, paper_day, question_index, your_answer) VALUES (?, ?, ?, ?)
     ON CONFLICT (course, paper_day, question_index) DO UPDATE SET your_answer = excluded.your_answer`,
  ).run(course, paperDay, questionIndex, yourAnswer);
}

// yourAnswer is optional: mcq/truefalse grade themselves on selection and
// pass the chosen option index here in the same call; short/scenario save
// their draft separately (saveExamAnswer, during the reveal step) and only
// call this once, with the self-reported verdict.
export function gradeExamAnswer(
  db: Database,
  course: string,
  paperDay: number,
  questionIndex: number,
  correct: boolean,
  yourAnswer?: string,
): void {
  if (yourAnswer !== undefined) {
    db.query(
      `INSERT INTO exam_answers (course, paper_day, question_index, your_answer, correct) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (course, paper_day, question_index) DO UPDATE SET your_answer = excluded.your_answer, correct = excluded.correct`,
    ).run(course, paperDay, questionIndex, yourAnswer, correct ? 1 : 0);
  } else {
    db.query(
      `INSERT INTO exam_answers (course, paper_day, question_index, your_answer, correct) VALUES (?, ?, ?, '', ?)
       ON CONFLICT (course, paper_day, question_index) DO UPDATE SET correct = excluded.correct`,
    ).run(course, paperDay, questionIndex, correct ? 1 : 0);
  }
}

export type SubmitExamResult =
  | { ok: true; scoreCorrect: number; scoreTotal: number }
  | { ok: false; reason: "not_found" | "already_submitted" | "incomplete" };

export function submitExamPaper(db: Database, course: string, paperDay: number, today: string): SubmitExamResult {
  const paper = getExamPaperRow(db, course, paperDay);
  if (!paper) return { ok: false, reason: "not_found" };
  if (paper.submitted_at) return { ok: false, reason: "already_submitted" };

  const content = buildExamSchedule().find((p) => p.course === course && p.paperDay === paperDay);
  if (!content) return { ok: false, reason: "not_found" };

  const answers = listExamAnswers(db, course, paperDay);
  const gradedByIndex = new Map(answers.map((a) => [a.question_index, a.correct]));
  for (let i = 0; i < content.questions.length; i++) {
    const c = gradedByIndex.get(i);
    if (c === null || c === undefined) return { ok: false, reason: "incomplete" };
  }

  const scoreCorrect = answers.filter((a) => a.correct === 1).length;
  const scoreTotal = content.questions.length;
  db.query(
    `UPDATE exam_papers SET submitted_at = ?, score_correct = ?, score_total = ? WHERE course = ? AND paper_day = ?`,
  ).run(today, scoreCorrect, scoreTotal, course, paperDay);

  const insertReview = db.query(
    `INSERT INTO exam_review_items (course, paper_day, question_index, rung, next_review) VALUES (?, ?, ?, -1, ?)
     ON CONFLICT (course, paper_day, question_index) DO NOTHING`,
  );
  for (const a of answers) {
    if (a.correct === 0) insertReview.run(course, paperDay, a.question_index, addDays(today, 1));
  }

  return { ok: true, scoreCorrect, scoreTotal };
}

export function countOverdueExamPapers(db: Database, course: string, today: string): number {
  runExamReleaseGate(db, course, today);
  const row = db
    .query(
      `SELECT COUNT(*) AS n FROM exam_papers
       WHERE course = ? AND paper_day <= (SELECT released_up_to FROM exam_state WHERE course = ?) AND next_review < ? AND submitted_at IS NULL`,
    )
    .get(course, course, today) as { n: number };
  return row.n;
}

export function countExamPapersSubmittedToday(db: Database, course: string, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM exam_papers WHERE course = ? AND submitted_at = ?`)
    .get(course, today) as { n: number };
  return row.n;
}

export function listExamPapersSubmittedToday(db: Database, course: string, today: string): ExamPaperRow[] {
  return db
    .query(
      `SELECT course, paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers WHERE course = ? AND submitted_at = ? ORDER BY paper_day`,
    )
    .all(course, today) as ExamPaperRow[];
}

export function listDueExamReviewItems(db: Database, course: string, today: string): ExamReviewItemRow[] {
  return db
    .query(
      `SELECT id, course, paper_day, question_index, rung, next_review FROM exam_review_items WHERE course = ? AND next_review <= ? ORDER BY next_review, id`,
    )
    .all(course, today) as ExamReviewItemRow[];
}

export function countOverdueExamReviewItems(db: Database, course: string, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM exam_review_items WHERE course = ? AND next_review < ?`)
    .get(course, today) as { n: number };
  return row.n;
}

export function countExamReviewsToday(db: Database, course: string, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM exam_review_log WHERE course = ? AND reviewed_at = ?`)
    .get(course, today) as { n: number };
  return row.n;
}

export function listExamReviewsCompletedToday(
  db: Database,
  course: string,
  today: string,
): { paper_day: number; question_index: number }[] {
  return db
    .query(`SELECT paper_day, question_index FROM exam_review_log WHERE course = ? AND reviewed_at = ?`)
    .all(course, today) as { paper_day: number; question_index: number }[];
}

export function reviewExamItem(
  db: Database,
  course: string,
  paperDay: number,
  questionIndex: number,
  result: ExamReviewResult,
  today: string,
): ExamReviewItemRow | null {
  const current = db
    .query(
      `SELECT id, course, paper_day, question_index, rung, next_review FROM exam_review_items WHERE course = ? AND paper_day = ? AND question_index = ?`,
    )
    .get(course, paperDay, questionIndex) as ExamReviewItemRow | null;
  if (!current) return null;

  db.query(
    `INSERT INTO exam_review_log (course, paper_day, question_index, reviewed_at, result) VALUES (?, ?, ?, ?, ?)`,
  ).run(course, paperDay, questionIndex, today, result);

  const { rung, nextReview } = applyExamReview(current.rung, result, today);
  db.query(`UPDATE exam_review_items SET rung = ?, next_review = ? WHERE id = ?`).run(rung, nextReview, current.id);
  return { ...current, rung, next_review: nextReview };
}
