import type { Database } from "bun:sqlite";
import { buildExamSchedule } from "./exam-content";
import { addDays } from "./scheduling";
import { applyExamReview, type ExamReviewResult } from "./exam-scheduling";

export interface ExamPaperRow {
  course: string;
  week: number;
  paper_number: number;
  submitted_at: string | null;
  score_correct: number | null;
  score_total: number | null;
}

export interface ExamAnswerRow {
  course: string;
  week: number;
  paper_number: number;
  question_index: number;
  your_answer: string;
  correct: number | null;
}

export interface ExamReviewItemRow {
  id: number;
  course: string;
  week: number;
  paper_number: number;
  question_index: number;
  rung: number;
  next_review: string;
}

export function migrateExam(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_papers (
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER,
      PRIMARY KEY (course, week, paper_number)
    );
    CREATE TABLE IF NOT EXISTS exam_answers (
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (course, week, paper_number, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(course, week, paper_number, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE IF NOT EXISTS exam_attempt_history (
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      attempt_number INTEGER NOT NULL,
      submitted_at TEXT NOT NULL,
      score_correct INTEGER NOT NULL,
      score_total INTEGER NOT NULL,
      PRIMARY KEY (course, week, paper_number, attempt_number)
    );
  `);

  migrateLegacySingleCourseShape(db);
  migrateFromPaperDayShape(db);
  // exam_state has no successor in the weekly-pacing schema — the backlog
  // gate it tracked is gone. Drop it unconditionally rather than nesting
  // this inside either migration tier: the real running srs.db already
  // has a course column (it went through the multi-course migration
  // already), so migrateLegacySingleCourseShape's isLegacy check is false
  // and never fires there — an exam_state drop nested only inside that
  // tier would leave the table behind forever on exactly that database.
  db.exec(`DROP TABLE IF EXISTS exam_state;`);
  seedNewPapers(db);
}

// One-time upgrade of a pre-existing single-course db (every exam_* table
// keyed without a `course` column) into a course+paper_day shape, backfilling
// course = 'INFO5995'. This predates the weekly-pacing model entirely; its
// job is only to produce the shape migrateFromPaperDayShape (below) expects
// to find and convert further — the two migrations compose independently,
// each firing only on its own specific legacy shape.
function migrateLegacySingleCourseShape(db: Database): void {
  const columns = db.query(`PRAGMA table_info(exam_papers)`).all() as { name: string }[];
  const isLegacy = columns.length > 0 && !columns.some((c) => c.name === "course");
  if (!isLegacy) return;

  db.exec("BEGIN");
  try {
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
    `);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// One-time upgrade of a course+paper_day-keyed db (the shape every exam_*
// table was in immediately before this plan) into the course+week+paper_number
// shape. paper_day was assigned by array position within a course under the
// old buildExamSchedule(); reconstructing that same position against today's
// content (buildExamSchedule() filtered by course, indexed by paper_day - 1)
// recovers each row's real (week, paperNumber) — no hardcoded guessing.
function migrateFromPaperDayShape(db: Database): void {
  const columns = db.query(`PRAGMA table_info(exam_papers)`).all() as { name: string }[];
  const isPaperDayShape = columns.length > 0 && columns.some((c) => c.name === "paper_day");
  if (!isPaperDayShape) return;

  const schedule = buildExamSchedule();
  const lookup = (course: string, paperDay: number) => {
    const coursePapers = schedule.filter((p) => p.course === course);
    return coursePapers[paperDay - 1]; // undefined if content shrank since this row was created
  };

  db.exec("BEGIN");
  try {
    const oldPapers = db
      .query(`SELECT course, paper_day, submitted_at, score_correct, score_total FROM exam_papers`)
      .all() as {
      course: string;
      paper_day: number;
      submitted_at: string | null;
      score_correct: number | null;
      score_total: number | null;
    }[];
    const oldAnswers = db
      .query(`SELECT course, paper_day, question_index, your_answer, correct FROM exam_answers`)
      .all() as {
      course: string;
      paper_day: number;
      question_index: number;
      your_answer: string;
      correct: number | null;
    }[];
    const oldReviewItems = db
      .query(`SELECT id, course, paper_day, question_index, rung, next_review FROM exam_review_items`)
      .all() as {
      id: number;
      course: string;
      paper_day: number;
      question_index: number;
      rung: number;
      next_review: string;
    }[];
    const oldReviewLog = db
      .query(`SELECT id, course, paper_day, question_index, reviewed_at, result FROM exam_review_log`)
      .all() as {
      id: number;
      course: string;
      paper_day: number;
      question_index: number;
      reviewed_at: string;
      result: string;
    }[];

    db.exec(`
      CREATE TABLE exam_papers_new (
        course TEXT NOT NULL, week INTEGER NOT NULL, paper_number INTEGER NOT NULL,
        submitted_at TEXT, score_correct INTEGER, score_total INTEGER,
        PRIMARY KEY (course, week, paper_number)
      );
      CREATE TABLE exam_answers_new (
        course TEXT NOT NULL, week INTEGER NOT NULL, paper_number INTEGER NOT NULL, question_index INTEGER NOT NULL,
        your_answer TEXT NOT NULL DEFAULT '', correct INTEGER,
        PRIMARY KEY (course, week, paper_number, question_index)
      );
      CREATE TABLE exam_review_items_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, week INTEGER NOT NULL,
        paper_number INTEGER NOT NULL, question_index INTEGER NOT NULL,
        rung INTEGER NOT NULL DEFAULT -1, next_review TEXT NOT NULL,
        UNIQUE(course, week, paper_number, question_index)
      );
      CREATE TABLE exam_review_log_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, week INTEGER NOT NULL,
        paper_number INTEGER NOT NULL, question_index INTEGER NOT NULL,
        reviewed_at TEXT NOT NULL, result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
      );
    `);

    const insertPaper = db.query(
      `INSERT INTO exam_papers_new (course, week, paper_number, submitted_at, score_correct, score_total) VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const row of oldPapers) {
      const content = lookup(row.course, row.paper_day);
      if (!content) continue;
      insertPaper.run(row.course, content.week, content.paperNumber, row.submitted_at, row.score_correct, row.score_total);
    }
    const insertAnswer = db.query(
      `INSERT INTO exam_answers_new (course, week, paper_number, question_index, your_answer, correct) VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const row of oldAnswers) {
      const content = lookup(row.course, row.paper_day);
      if (!content) continue;
      insertAnswer.run(row.course, content.week, content.paperNumber, row.question_index, row.your_answer, row.correct);
    }
    const insertReviewItem = db.query(
      `INSERT INTO exam_review_items_new (id, course, week, paper_number, question_index, rung, next_review) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const row of oldReviewItems) {
      const content = lookup(row.course, row.paper_day);
      if (!content) continue;
      insertReviewItem.run(row.id, row.course, content.week, content.paperNumber, row.question_index, row.rung, row.next_review);
    }
    const insertReviewLog = db.query(
      `INSERT INTO exam_review_log_new (id, course, week, paper_number, question_index, reviewed_at, result) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const row of oldReviewLog) {
      const content = lookup(row.course, row.paper_day);
      if (!content) continue;
      insertReviewLog.run(row.id, row.course, content.week, content.paperNumber, row.question_index, row.reviewed_at, row.result);
    }

    db.exec(`
      DROP TABLE exam_papers;
      ALTER TABLE exam_papers_new RENAME TO exam_papers;
      DROP TABLE exam_answers;
      ALTER TABLE exam_answers_new RENAME TO exam_answers;
      DROP TABLE exam_review_items;
      ALTER TABLE exam_review_items_new RENAME TO exam_review_items;
      DROP TABLE exam_review_log;
      ALTER TABLE exam_review_log_new RENAME TO exam_review_log;
    `);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// Inserts any (course, week, paperNumber) paper from the current content
// that isn't in exam_papers yet — idempotent, no date/gating logic: a paper
// simply exists once authored, and whether it's currently visible is a
// read-time question (weekStartDate), not something seeding decides.
function seedNewPapers(db: Database): void {
  const insert = db.query(
    `INSERT INTO exam_papers (course, week, paper_number) VALUES (?, ?, ?)
     ON CONFLICT (course, week, paper_number) DO NOTHING`,
  );
  for (const paper of buildExamSchedule()) {
    insert.run(paper.course, paper.week, paper.paperNumber);
  }
}

export function listExamPaperRows(db: Database, course: string): ExamPaperRow[] {
  return db
    .query(
      `SELECT course, week, paper_number, submitted_at, score_correct, score_total FROM exam_papers
       WHERE course = ? ORDER BY week, paper_number`,
    )
    .all(course) as ExamPaperRow[];
}

export function getExamPaperRow(db: Database, course: string, week: number, paperNumber: number): ExamPaperRow | null {
  return db
    .query(
      `SELECT course, week, paper_number, submitted_at, score_correct, score_total FROM exam_papers
       WHERE course = ? AND week = ? AND paper_number = ?`,
    )
    .get(course, week, paperNumber) as ExamPaperRow | null;
}

export function listExamAnswers(db: Database, course: string, week: number, paperNumber: number): ExamAnswerRow[] {
  return db
    .query(
      `SELECT course, week, paper_number, question_index, your_answer, correct FROM exam_answers
       WHERE course = ? AND week = ? AND paper_number = ?`,
    )
    .all(course, week, paperNumber) as ExamAnswerRow[];
}

export function saveExamAnswer(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
  questionIndex: number,
  yourAnswer: string,
): void {
  db.query(
    `INSERT INTO exam_answers (course, week, paper_number, question_index, your_answer) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (course, week, paper_number, question_index) DO UPDATE SET your_answer = excluded.your_answer`,
  ).run(course, week, paperNumber, questionIndex, yourAnswer);
}

// yourAnswer is optional: mcq/truefalse grade themselves on selection and
// pass the chosen option index here in the same call; short/scenario save
// their draft separately (saveExamAnswer, during the reveal step) and only
// call this once, with the self-reported verdict.
export function gradeExamAnswer(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
  questionIndex: number,
  correct: boolean,
  yourAnswer?: string,
): void {
  if (yourAnswer !== undefined) {
    db.query(
      `INSERT INTO exam_answers (course, week, paper_number, question_index, your_answer, correct) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (course, week, paper_number, question_index) DO UPDATE SET your_answer = excluded.your_answer, correct = excluded.correct`,
    ).run(course, week, paperNumber, questionIndex, yourAnswer, correct ? 1 : 0);
  } else {
    db.query(
      `INSERT INTO exam_answers (course, week, paper_number, question_index, your_answer, correct) VALUES (?, ?, ?, ?, '', ?)
       ON CONFLICT (course, week, paper_number, question_index) DO UPDATE SET correct = excluded.correct`,
    ).run(course, week, paperNumber, questionIndex, correct ? 1 : 0);
  }
}

export type SubmitExamResult =
  | { ok: true; scoreCorrect: number; scoreTotal: number }
  | { ok: false; reason: "not_found" | "already_submitted" | "incomplete" };

export function submitExamPaper(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
  today: string,
): SubmitExamResult {
  const paper = getExamPaperRow(db, course, week, paperNumber);
  if (!paper) return { ok: false, reason: "not_found" };
  if (paper.submitted_at) return { ok: false, reason: "already_submitted" };

  const content = buildExamSchedule().find((p) => p.course === course && p.week === week && p.paperNumber === paperNumber);
  if (!content) return { ok: false, reason: "not_found" };

  const answers = listExamAnswers(db, course, week, paperNumber);
  const gradedByIndex = new Map(answers.map((a) => [a.question_index, a.correct]));
  for (let i = 0; i < content.questions.length; i++) {
    const c = gradedByIndex.get(i);
    if (c === null || c === undefined) return { ok: false, reason: "incomplete" };
  }

  const scoreCorrect = answers.filter((a) => a.correct === 1).length;
  const scoreTotal = content.questions.length;
  db.query(
    `UPDATE exam_papers SET submitted_at = ?, score_correct = ?, score_total = ? WHERE course = ? AND week = ? AND paper_number = ?`,
  ).run(today, scoreCorrect, scoreTotal, course, week, paperNumber);

  const insertReview = db.query(
    `INSERT INTO exam_review_items (course, week, paper_number, question_index, rung, next_review) VALUES (?, ?, ?, ?, -1, ?)
     ON CONFLICT (course, week, paper_number, question_index) DO NOTHING`,
  );
  for (const a of answers) {
    if (a.correct === 0) insertReview.run(course, week, paperNumber, a.question_index, addDays(today, 1));
  }

  return { ok: true, scoreCorrect, scoreTotal };
}

export interface ExamAttemptSummary {
  attemptNumber: number;
  submittedAt: string;
  scoreCorrect: number;
  scoreTotal: number;
}

export type RetakeResult = { ok: true } | { ok: false; reason: "not_found" | "not_submitted" };

export function retakeExamPaper(db: Database, course: string, week: number, paperNumber: number): RetakeResult {
  const paper = getExamPaperRow(db, course, week, paperNumber);
  if (!paper) return { ok: false, reason: "not_found" };
  if (!paper.submitted_at) return { ok: false, reason: "not_submitted" };

  const { n: attemptCount } = db
    .query(`SELECT COUNT(*) AS n FROM exam_attempt_history WHERE course = ? AND week = ? AND paper_number = ?`)
    .get(course, week, paperNumber) as { n: number };

  db.query(
    `INSERT INTO exam_attempt_history (course, week, paper_number, attempt_number, submitted_at, score_correct, score_total)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(course, week, paperNumber, attemptCount + 1, paper.submitted_at, paper.score_correct!, paper.score_total!);

  db.query(
    `UPDATE exam_papers SET submitted_at = NULL, score_correct = NULL, score_total = NULL
     WHERE course = ? AND week = ? AND paper_number = ?`,
  ).run(course, week, paperNumber);

  db.query(`DELETE FROM exam_answers WHERE course = ? AND week = ? AND paper_number = ?`).run(course, week, paperNumber);

  return { ok: true };
}

export function listExamAttemptHistory(db: Database, course: string, week: number, paperNumber: number): ExamAttemptSummary[] {
  const rows = db
    .query(
      `SELECT attempt_number, submitted_at, score_correct, score_total FROM exam_attempt_history
       WHERE course = ? AND week = ? AND paper_number = ? ORDER BY attempt_number`,
    )
    .all(course, week, paperNumber) as { attempt_number: number; submitted_at: string; score_correct: number; score_total: number }[];
  return rows.map((r) => ({
    attemptNumber: r.attempt_number,
    submittedAt: r.submitted_at,
    scoreCorrect: r.score_correct,
    scoreTotal: r.score_total,
  }));
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
      `SELECT course, week, paper_number, submitted_at, score_correct, score_total FROM exam_papers
       WHERE course = ? AND submitted_at = ? ORDER BY week, paper_number`,
    )
    .all(course, today) as ExamPaperRow[];
}

export function listDueExamReviewItems(db: Database, course: string, today: string): ExamReviewItemRow[] {
  return db
    .query(
      `SELECT id, course, week, paper_number, question_index, rung, next_review FROM exam_review_items
       WHERE course = ? AND next_review <= ? ORDER BY next_review, id`,
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
): { week: number; paper_number: number; question_index: number }[] {
  return db
    .query(`SELECT week, paper_number, question_index FROM exam_review_log WHERE course = ? AND reviewed_at = ?`)
    .all(course, today) as { week: number; paper_number: number; question_index: number }[];
}

export function reviewExamItem(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
  questionIndex: number,
  result: ExamReviewResult,
  today: string,
): ExamReviewItemRow | null {
  const current = db
    .query(
      `SELECT id, course, week, paper_number, question_index, rung, next_review FROM exam_review_items
       WHERE course = ? AND week = ? AND paper_number = ? AND question_index = ?`,
    )
    .get(course, week, paperNumber, questionIndex) as ExamReviewItemRow | null;
  if (!current) return null;

  db.query(
    `INSERT INTO exam_review_log (course, week, paper_number, question_index, reviewed_at, result) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(course, week, paperNumber, questionIndex, today, result);

  const { rung, nextReview } = applyExamReview(current.rung, result, today);
  db.query(`UPDATE exam_review_items SET rung = ?, next_review = ? WHERE id = ?`).run(rung, nextReview, current.id);
  return { ...current, rung, next_review: nextReview };
}
