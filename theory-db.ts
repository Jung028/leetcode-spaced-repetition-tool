import type { Database } from "bun:sqlite";
import { buildTheorySchedule } from "./theory-content";
import { initialTheorySchedule, applyTheoryReview, type TheoryResult } from "./theory-scheduling";

export interface TheoryProgress {
  concept_day: number;
  rung: number;
  next_review: string;
  your_answer: string;
}

export function migrateTheory(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS theory_schedule (
      concept_day INTEGER PRIMARY KEY,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      your_answer TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS theory_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_day INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
  `);

  const { count } = db.query(`SELECT COUNT(*) AS count FROM theory_schedule`).get() as {
    count: number;
  };
  if (count === 0) seedSchedule(db, today);
}

function seedSchedule(db: Database, today: string): void {
  const insert = db.query(
    `INSERT INTO theory_schedule (concept_day, rung, next_review, your_answer) VALUES (?, ?, ?, '')`,
  );
  for (const concept of buildTheorySchedule()) {
    const { rung, nextReview } = initialTheorySchedule(today, concept.day);
    insert.run(concept.day, rung, nextReview);
  }
}

// Everything due today or overdue — there's no cap on how many can show up
// at once (e.g. after a few days away), same as the leetcode board.
export function listDueTheory(db: Database, today: string): TheoryProgress[] {
  return db
    .query(
      `SELECT concept_day, rung, next_review, your_answer FROM theory_schedule
       WHERE next_review <= ? ORDER BY next_review, concept_day`,
    )
    .all(today) as TheoryProgress[];
}

export function getTheoryConcept(db: Database, conceptDay: number): TheoryProgress | null {
  return db
    .query(
      `SELECT concept_day, rung, next_review, your_answer FROM theory_schedule WHERE concept_day = ?`,
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
  const row = db
    .query(`SELECT COUNT(*) AS n FROM theory_schedule WHERE next_review < ?`)
    .get(today) as { n: number };
  return row.n;
}

export function listTheoryCompletedToday(db: Database, today: string): TheoryProgress[] {
  return db
    .query(
      `SELECT DISTINCT ts.concept_day, ts.rung, ts.next_review, ts.your_answer
       FROM theory_schedule ts
       JOIN theory_reviews tr ON tr.concept_day = ts.concept_day
       WHERE tr.reviewed_at = ?
       ORDER BY ts.concept_day`,
    )
    .all(today) as TheoryProgress[];
}
