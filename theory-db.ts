import type { Database } from "bun:sqlite";
import { buildTheorySchedule, TOTAL_DAYS } from "./theory-content";
import { initialTheorySchedule, applyTheoryReview, type TheoryResult } from "./theory-scheduling";
import { releaseCount } from "./scheduling";

export type TheoryAnswerFormat = "text" | "image" | "link";

export interface TheoryProgress {
  concept_day: number;
  category: string;
  rung: number;
  next_review: string;
  your_answer: string;
  question: string;
  answer: string;
  answer_format: TheoryAnswerFormat;
}

export function migrateTheory(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS theory_schedule (
      concept_day INTEGER PRIMARY KEY,
      category TEXT NOT NULL DEFAULT '',
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      question TEXT NOT NULL DEFAULT '',
      answer TEXT NOT NULL DEFAULT '',
      answer_format TEXT NOT NULL DEFAULT 'text'
    );
    CREATE TABLE IF NOT EXISTS theory_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_day INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE IF NOT EXISTS theory_state (
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);

  const columns = db.query(`PRAGMA table_info(theory_schedule)`).all() as { name: string }[];
  const needsContentColumns = !columns.some((c) => c.name === "category");
  if (needsContentColumns) {
    db.exec(`
      ALTER TABLE theory_schedule ADD COLUMN category TEXT NOT NULL DEFAULT '';
      ALTER TABLE theory_schedule ADD COLUMN question TEXT NOT NULL DEFAULT '';
      ALTER TABLE theory_schedule ADD COLUMN answer TEXT NOT NULL DEFAULT '';
    `);
    backfillCategories(db);
  }

  const needsFormatColumn = !columns.some((c) => c.name === "answer_format");
  if (needsFormatColumn) {
    db.exec(`ALTER TABLE theory_schedule ADD COLUMN answer_format TEXT NOT NULL DEFAULT 'text';`);
  }

  const { count } = db.query(`SELECT COUNT(*) AS count FROM theory_schedule`).get() as {
    count: number;
  };
  const { count: stateCount } = db.query(`SELECT COUNT(*) AS count FROM theory_state`).get() as {
    count: number;
  };

  if (count === 0) {
    seedSchedule(db, today);
    db.query(`INSERT INTO theory_state (released_up_to) VALUES (0)`).run();
    runTheoryReleaseGate(db, today);
  } else if (stateCount === 0) {
    backfillReleaseWatermark(db, today);
  }
}

function seedSchedule(db: Database, today: string): void {
  const insert = db.query(
    `INSERT INTO theory_schedule (concept_day, category, rung, next_review, your_answer) VALUES (?, ?, ?, ?, '')`,
  );
  for (const concept of buildTheorySchedule()) {
    const { rung, nextReview } = initialTheorySchedule(today, concept.day);
    insert.run(concept.day, concept.category, rung, nextReview);
  }
}

// Sets each row's category from the static day->category structure. Used
// when upgrading a pre-existing db that predates the category/question/
// answer columns — every row already exists, it just needs its category
// filled in (question/answer stay blank via the column default).
function backfillCategories(db: Database): void {
  const update = db.query(`UPDATE theory_schedule SET category = ? WHERE concept_day = ?`);
  const runAll = db.transaction(() => {
    for (const concept of buildTheorySchedule()) {
      update.run(concept.category, concept.day);
    }
  });
  runAll();
}

// Sets the watermark to the furthest concept genuinely engaged with (passed
// at least once, or attempted and reset to -1) — anything past that,
// including concepts that were just sitting in the due list untouched, is
// pulled back into the gated queue.
function backfillReleaseWatermark(db: Database, today: string): void {
  const { frontier } = db
    .query(
      `SELECT COALESCE(MAX(concept_day), 0) AS frontier FROM theory_schedule
       WHERE rung >= 0 OR concept_day IN (SELECT DISTINCT concept_day FROM theory_reviews)`,
    )
    .get() as { frontier: number };
  db.query(`INSERT INTO theory_state (released_up_to) VALUES (?)`).run(frontier);
  runTheoryReleaseGate(db, today);
}

// Advances the watermark to bring the visible backlog back up to the cap,
// stamping each newly-released concept's next_review as today. Idempotent —
// safe to call on every read.
function runTheoryReleaseGate(db: Database, today: string): void {
  const { released_up_to } = db.query(`SELECT released_up_to FROM theory_state`).get() as {
    released_up_to: number;
  };
  const { n: backlog } = db
    .query(`SELECT COUNT(*) AS n FROM theory_schedule WHERE concept_day <= ? AND next_review <= ?`)
    .get(released_up_to, today) as { n: number };
  const remaining = TOTAL_DAYS - released_up_to;
  const toRelease = releaseCount(backlog, remaining);
  if (toRelease === 0) return;

  const newUpTo = released_up_to + toRelease;
  db.query(`UPDATE theory_schedule SET next_review = ? WHERE concept_day > ? AND concept_day <= ?`).run(
    today,
    released_up_to,
    newUpTo,
  );
  db.query(`UPDATE theory_state SET released_up_to = ?`).run(newUpTo);
}

// Everything due today or overdue among *released, content-filled*
// concepts — capped at MAX_ACTIVE_BACKLOG by the release gate, and hidden
// entirely if content hasn't been added yet. The gate itself (above) does
// NOT apply this filter — it must keep counting blank concepts as backlog,
// or it would see an artificially-empty backlog and release everything at
// once.
export function listDueTheory(db: Database, today: string): TheoryProgress[] {
  runTheoryReleaseGate(db, today);
  return db
    .query(
      `SELECT concept_day, category, rung, next_review, your_answer, question, answer, answer_format FROM theory_schedule
       WHERE concept_day <= (SELECT released_up_to FROM theory_state) AND next_review <= ? AND question != ''
       ORDER BY next_review, concept_day`,
    )
    .all(today) as TheoryProgress[];
}

export function getTheoryConcept(db: Database, conceptDay: number): TheoryProgress | null {
  return db
    .query(
      `SELECT concept_day, category, rung, next_review, your_answer, question, answer, answer_format
       FROM theory_schedule WHERE concept_day = ?`,
    )
    .get(conceptDay) as TheoryProgress | null;
}

export function saveTheoryAnswer(
  db: Database,
  conceptDay: number,
  yourAnswer: string,
): TheoryProgress | null {
  db.query(`UPDATE theory_schedule SET your_answer = ? WHERE concept_day = ?`).run(
    yourAnswer,
    conceptDay,
  );
  return getTheoryConcept(db, conceptDay);
}

export function reviewTheoryConcept(
  db: Database,
  conceptDay: number,
  result: TheoryResult,
  today: string,
): TheoryProgress | null {
  const current = getTheoryConcept(db, conceptDay);
  if (!current) return null;

  db.query(
    `INSERT INTO theory_reviews (concept_day, reviewed_at, result) VALUES (?, ?, ?)`,
  ).run(conceptDay, today, result);

  const { rung, nextReview } = applyTheoryReview(current.rung, result, today);
  db.query(`UPDATE theory_schedule SET rung = ?, next_review = ? WHERE concept_day = ?`).run(
    rung,
    nextReview,
    conceptDay,
  );
  return getTheoryConcept(db, conceptDay);
}

export function countTheoryReviewsToday(db: Database, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM theory_reviews WHERE reviewed_at = ?`)
    .get(today) as { n: number };
  return row.n;
}

export function countOverdueTheory(db: Database, today: string): number {
  runTheoryReleaseGate(db, today);
  const row = db
    .query(
      `SELECT COUNT(*) AS n FROM theory_schedule
       WHERE concept_day <= (SELECT released_up_to FROM theory_state) AND next_review < ? AND question != ''`,
    )
    .get(today) as { n: number };
  return row.n;
}

export function listTheoryCompletedToday(db: Database, today: string): TheoryProgress[] {
  return db
    .query(
      `SELECT DISTINCT ts.concept_day, ts.category, ts.rung, ts.next_review, ts.your_answer, ts.question, ts.answer, ts.answer_format
       FROM theory_schedule ts
       JOIN theory_reviews tr ON tr.concept_day = ts.concept_day
       WHERE tr.reviewed_at = ?
       ORDER BY ts.concept_day`,
    )
    .all(today) as TheoryProgress[];
}

export function saveTheoryContent(
  db: Database,
  conceptDay: number,
  question: string,
  answer: string,
  answerFormat: TheoryAnswerFormat = "text",
): TheoryProgress | null {
  db.query(`UPDATE theory_schedule SET question = ?, answer = ?, answer_format = ? WHERE concept_day = ?`).run(
    question,
    answer,
    answerFormat,
    conceptDay,
  );
  return getTheoryConcept(db, conceptDay);
}

export interface NextBlankConcept {
  conceptDay: number;
  category: string;
}

export function getNextBlankConcept(db: Database): NextBlankConcept | null {
  const row = db
    .query(`SELECT concept_day, category FROM theory_schedule WHERE question = '' ORDER BY concept_day LIMIT 1`)
    .get() as { concept_day: number; category: string } | null;
  return row ? { conceptDay: row.concept_day, category: row.category } : null;
}
