import { Database } from "bun:sqlite";
import { applyReview, initialSchedule, type ReviewResult } from "./scheduling";

export interface ProblemInput {
  title: string;
  url: string;
  solution: string;
}

export interface ProblemSummary {
  id: number;
  title: string;
  url: string;
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
  return db;
}

export function createProblem(
  db: Database,
  input: ProblemInput,
  today: string,
): Problem {
  const { rung, nextReview } = initialSchedule(today);
  const row = db
    .query(
      `INSERT INTO problems (title, url, solution, rung, next_review, created_at)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .get(input.title, input.url, input.solution, rung, nextReview, today);
  return row as Problem;
}

export function listProblems(db: Database): ProblemSummary[] {
  return db
    .query(
      `SELECT id, title, url, rung, next_review, created_at
       FROM problems ORDER BY next_review, id`,
    )
    .all() as ProblemSummary[];
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
  const { rung, nextReview } = applyReview(row.rung, result, today);
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
  return db
    .query(
      `UPDATE problems SET title = ?, url = ?, solution = ? WHERE id = ? RETURNING *`,
    )
    .get(input.title, input.url, input.solution, id) as Problem | null;
}

export function deleteProblem(db: Database, id: number): boolean {
  return db.query(`DELETE FROM problems WHERE id = ?`).run(id).changes > 0;
}
