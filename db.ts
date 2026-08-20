import { Database } from "bun:sqlite";
import {
  applyReview,
  initialSchedule,
  nextAvailableDate,
  addDays,
  MAX_DAILY_LEETCODE_REVIEWS,
  type ReviewResult,
} from "./scheduling";
import { slugFromUrl } from "./leetcode";

const DEFAULT_LANGUAGE = "java";

export interface ProblemInput {
  title: string;
  url: string;
  solution: string;
  language?: string;
  // Short label for the technique the solution relies on (e.g. "Sliding
  // Window", "Two Pointers", "Greedy") and why it applies to this specific
  // problem — both optional, filled in by hand via the edit form.
  pattern?: string;
  patternWhy?: string;
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

export type Problem = ProblemSummary & { solution: string; pattern: string; pattern_why: string };
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
  if (!has("pattern")) {
    db.exec(`ALTER TABLE problems ADD COLUMN pattern TEXT NOT NULL DEFAULT ''`);
  }
  if (!has("pattern_why")) {
    db.exec(`ALTER TABLE problems ADD COLUMN pattern_why TEXT NOT NULL DEFAULT ''`);
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
  const pattern = input.pattern ?? "";
  const patternWhy = input.patternWhy ?? "";
  const row = db
    .query(
      `INSERT INTO problems (title, url, solution, language, slug, pattern, pattern_why, rung, next_review, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .get(input.title, input.url, input.solution, language, slug, pattern, patternWhy, rung, nextReview, today);
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
  const pattern = input.pattern ?? "";
  const patternWhy = input.patternWhy ?? "";
  return db
    .query(
      `UPDATE problems SET title = ?, url = ?, solution = ?, language = ?, slug = ?, pattern = ?, pattern_why = ?
       WHERE id = ? RETURNING *`,
    )
    .get(input.title, input.url, input.solution, language, slug, pattern, patternWhy, id) as Problem | null;
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
  input: Required<Pick<ProblemInput, "title" | "url" | "solution" | "language">> & Pick<ProblemInput, "pattern" | "patternWhy">,
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

// Caps how many LeetCode reviews can be "due" (next_review <= today) at
// once, at MAX_DAILY_LEETCODE_REVIEWS — nothing previously stopped an
// unreviewed backlog from piling up unbounded on the due list (this was
// explicitly out of scope in
// docs/superpowers/specs/2026-08-01-backlog-gated-scheduling-design.md).
// The `cap` most-overdue items are left completely untouched, so their
// real next_review date — and therefore their "Xd late" badge — is
// preserved. Only the overflow (the least-overdue items past the cap)
// gets pushed forward, cascading day-by-day via nextAvailableDate onto
// the earliest day at or after tomorrow with room, so it doesn't just
// dump everything onto a single already-full day.
// Self-healing: call at the top of any due-list read, no need to hook it
// into every mutation path — same pattern as the Theory/Goals release
// gates in that design doc.
export function levelDueLeetcode(db: Database, today: string): void {
  const due = db
    .query(`SELECT id, next_review FROM problems WHERE next_review <= ? ORDER BY next_review ASC, id ASC`)
    .all(today) as { id: number; next_review: string }[];
  const overflow = due.slice(MAX_DAILY_LEETCODE_REVIEWS);
  if (overflow.length === 0) return;

  const tomorrow = addDays(today, 1);
  const update = db.query(`UPDATE problems SET next_review = ? WHERE id = ?`);
  for (const row of overflow) {
    const slot = nextAvailableDate(tomorrow, (d) => countScheduledOn(db, d, row.id));
    update.run(slot, row.id);
  }
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
