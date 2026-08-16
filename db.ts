import { Database } from "bun:sqlite";
import { applyReview, initialSchedule, nextAvailableDate, type ReviewResult } from "./scheduling";
import { slugFromUrl } from "./leetcode";

const DEFAULT_LANGUAGE = "java";

export interface ProblemInput {
  title: string;
  url: string;
  solution: string;
  language?: string;
}

export interface ProblemSummary {
  id: number;
  title: string;
  url: string;
  language: string;
  rung: number;
  next_review: string;
  created_at: string;
}

export interface Review {
  id: number;
  problem_id: number;
  reviewed_at: string;
  result: ReviewResult;
}

export type Problem = ProblemSummary & { solution: string };
export type ProblemDetail = Problem & { reviews: Review[] };

export function openDb(path = "srs.db"): Database {
  const db = new Database(path, { create: true });
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      solution TEXT NOT NULL,
      rung INTEGER NOT NULL DEFAULT 0,
      next_review TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('pass','fail'))
    );
  `);
  migrate(db);
  return db;
}

function migrate(db: Database) {
  const columns = db.query(`PRAGMA table_info(problems)`).all() as { name: string }[];
  const has = (name: string) => columns.some((c) => c.name === name);

  if (!has("language")) {
    db.exec(`ALTER TABLE problems ADD COLUMN language TEXT NOT NULL DEFAULT '${DEFAULT_LANGUAGE}'`);
  }
  if (!has("slug")) {
    db.exec(`ALTER TABLE problems ADD COLUMN slug TEXT`);
    const rows = db.query(`SELECT id, url FROM problems WHERE slug IS NULL`).all() as {
      id: number;
      url: string;
    }[];
    const setSlug = db.query(`UPDATE problems SET slug = ? WHERE id = ?`);
    for (const row of rows) setSlug.run(slugFromUrl(row.url), row.id);
  }
}

// How many problems already have next_review = date — used to cap how
// many LeetCode reviews can land on the same day (see scheduling.ts's
// nextAvailableDate). `excludeId` lets a problem being rescheduled ignore
// its own current slot on that date.
function countScheduledOn(db: Database, date: string, excludeId?: number): number {
  const row = (
    excludeId !== undefined
      ? db.query(`SELECT COUNT(*) AS n FROM problems WHERE next_review = ? AND id != ?`).get(date, excludeId)
      : db.query(`SELECT COUNT(*) AS n FROM problems WHERE next_review = ?`).get(date)
  ) as { n: number };
  return row.n;
}

export function createProblem(
  db: Database,
  input: ProblemInput,
  today: string,
): Problem {
  const proposed = initialSchedule(today);
  const rung = proposed.rung;
  const nextReview = nextAvailableDate(proposed.nextReview, (d) => countScheduledOn(db, d));
  const language = input.language ?? DEFAULT_LANGUAGE;
  const slug = slugFromUrl(input.url);
  const row = db
    .query(
      `INSERT INTO problems (title, url, solution, language, slug, rung, next_review, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .get(input.title, input.url, input.solution, language, slug, rung, nextReview, today);
  return row as Problem;
}

export function listProblems(db: Database): ProblemSummary[] {
  return db
    .query(
      `SELECT id, title, url, language, rung, next_review, created_at
       FROM problems ORDER BY next_review, id`,
    )
    .all() as ProblemSummary[];
}

export function findProblemBySlug(db: Database, slug: string): ProblemSummary | null {
  return db
    .query(
      `SELECT id, title, url, language, rung, next_review, created_at
       FROM problems WHERE slug = ?`,
    )
    .get(slug) as ProblemSummary | null;
}

export function getProblem(db: Database, id: number): ProblemDetail | null {
  const row = db.query(`SELECT * FROM problems WHERE id = ?`).get(id) as
    | Problem
    | null;
  if (!row) return null;
  const reviews = db
    .query(`SELECT * FROM reviews WHERE problem_id = ? ORDER BY id DESC`)
    .all(id) as Review[];
  return { ...row, reviews };
}

export function reviewProblem(
  db: Database,
  id: number,
  result: ReviewResult,
  today: string,
): Problem | null {
  const row = db.query(`SELECT rung FROM problems WHERE id = ?`).get(id) as
    | { rung: number }
    | null;
  if (!row) return null;
  const proposed = applyReview(row.rung, result, today);
  const rung = proposed.rung;
  const nextReview = nextAvailableDate(proposed.nextReview, (d) => countScheduledOn(db, d, id));
  db.query(
    `INSERT INTO reviews (problem_id, reviewed_at, result) VALUES (?, ?, ?)`,
  ).run(id, today, result);
  return db
    .query(
      `UPDATE problems SET rung = ?, next_review = ? WHERE id = ? RETURNING *`,
    )
    .get(rung, nextReview, id) as Problem;
}

export function updateProblem(
  db: Database,
  id: number,
  input: ProblemInput,
): Problem | null {
  const language = input.language ?? DEFAULT_LANGUAGE;
  const slug = slugFromUrl(input.url);
  return db
    .query(
      `UPDATE problems SET title = ?, url = ?, solution = ?, language = ?, slug = ?
       WHERE id = ? RETURNING *`,
    )
    .get(input.title, input.url, input.solution, language, slug, id) as Problem | null;
}

export function deleteProblem(db: Database, id: number): boolean {
  return db.query(`DELETE FROM problems WHERE id = ?`).run(id).changes > 0;
}

// `result` undefined = plain "Add problem" save: create or update fields only,
// never touching the schedule. `result` "pass"/"fail" = "Completed"/"Failed":
// create the problem if it's new, then always apply that result immediately
// (a first-time pass advances past the initial rung, not just tomorrow's
// default — a successful first solve IS the first spaced-repetition review).
export function captureSubmission(
  db: Database,
  input: Required<ProblemInput>,
  today: string,
  result?: ReviewResult,
): { problem: Problem; created: boolean } {
  const slug = slugFromUrl(input.url);
  const existing = slug ? findProblemBySlug(db, slug) : null;

  if (!existing) {
    const created = createProblem(db, input, today);
    if (!result) return { problem: created, created: true };
    return { problem: reviewProblem(db, created.id, result, today)!, created: true };
  }

  const updated = updateProblem(db, existing.id, input)!;
  if (!result) return { problem: updated, created: false };
  return { problem: reviewProblem(db, existing.id, result, today)!, created: false };
}

export function countReviewsToday(db: Database, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM reviews WHERE reviewed_at = ?`)
    .get(today) as { n: number };
  return row.n;
}

export function listCompletedToday(db: Database, today: string): ProblemSummary[] {
  return db
    .query(
      `SELECT p.id, p.title, p.url, p.language, p.rung, p.next_review, p.created_at
       FROM problems p
       JOIN reviews r ON r.problem_id = p.id
       WHERE r.reviewed_at = ?
       GROUP BY p.id
       ORDER BY p.id`,
    )
    .all(today) as ProblemSummary[];
}
