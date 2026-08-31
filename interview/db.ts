import type { Database } from "bun:sqlite";
import { getProblem, listProblems } from "../leetcode/db";
import { isDue } from "../shared/scheduling";
import { allSystemDesignQuestions } from "./content";

export interface InterviewSessionRow {
  date: string;
  leetcode_problem_id: number | null;
  sd_question_id: string;
  coding_started_at: string | null;
  design_started_at: string | null;
  coding_elapsed_seconds: number;
  coding_running_since: string | null;
  design_elapsed_seconds: number;
  design_running_since: string | null;
  sd_answer: string;
  sd_excalidraw_scene: string | null;
  sd_rubric_checked: string;
  sd_revealed_at: string | null;
  completed_at: string | null;
}

export function migrateInterview(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      date TEXT PRIMARY KEY,
      leetcode_problem_id INTEGER,
      sd_question_id TEXT NOT NULL,
      coding_started_at TEXT,
      design_started_at TEXT,
      sd_answer TEXT NOT NULL DEFAULT '',
      sd_excalidraw_scene TEXT,
      sd_rubric_checked TEXT NOT NULL DEFAULT '[]',
      sd_revealed_at TEXT,
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS interview_sd_seen (
      question_id TEXT PRIMARY KEY
    );
  `);

  const columns = db.query(`PRAGMA table_info(interview_sessions)`).all() as { name: string }[];
  const has = (name: string) => columns.some((c) => c.name === name);
  if (!has("coding_elapsed_seconds")) {
    db.exec(`ALTER TABLE interview_sessions ADD COLUMN coding_elapsed_seconds INTEGER NOT NULL DEFAULT 0`);
  }
  if (!has("coding_running_since")) {
    db.exec(`ALTER TABLE interview_sessions ADD COLUMN coding_running_since TEXT`);
  }
  if (!has("design_elapsed_seconds")) {
    db.exec(`ALTER TABLE interview_sessions ADD COLUMN design_elapsed_seconds INTEGER NOT NULL DEFAULT 0`);
  }
  if (!has("design_running_since")) {
    db.exec(`ALTER TABLE interview_sessions ADD COLUMN design_running_since TEXT`);
  }
}

function isCodingPartDone(db: Database, row: InterviewSessionRow, today: string): boolean {
  if (row.leetcode_problem_id === null) return true;
  const problem = getProblem(db, row.leetcode_problem_id);
  return problem === null || problem.next_review > today;
}

function isDesignPartDone(row: InterviewSessionRow): boolean {
  return row.sd_answer.trim().length > 0 && row.sd_revealed_at !== null;
}

function recomputeCompletion(db: Database, row: InterviewSessionRow, today: string): InterviewSessionRow {
  if (row.completed_at) return row;
  if (isCodingPartDone(db, row, today) && isDesignPartDone(row)) {
    db.query(`UPDATE interview_sessions SET completed_at = ? WHERE date = ?`).run(today, row.date);
    return { ...row, completed_at: today };
  }
  return row;
}

export function getTodaySession(db: Database, today: string): InterviewSessionRow | null {
  const row = db.query(`SELECT * FROM interview_sessions WHERE date = ?`).get(today) as InterviewSessionRow | null;
  if (!row) return null;
  return recomputeCompletion(db, row, today);
}

export function getOrCreateTodaySession(db: Database, today: string): InterviewSessionRow {
  const existing = getTodaySession(db, today);
  if (existing) return existing;

  const nextProblem = listProblems(db).find((p) => isDue(p.next_review, today));
  const seenRows = db.query(`SELECT question_id FROM interview_sd_seen`).all() as { question_id: string }[];
  const seen = new Set(seenRows.map((r) => r.question_id));
  const allQuestions = allSystemDesignQuestions();
  if (allQuestions.length === 0) throw new Error("no system design questions are seeded");
  // Once every seeded question has been assigned at least once, reuse the
  // first one rather than throwing — with only a handful of seed companies
  // this repeats sooner than it will once the full ~20-30 company roster
  // (see spec, "Scope for the implementation plan") is authored.
  const question = allQuestions.find((q) => !seen.has(q.id)) ?? allQuestions[0]!;

  db.query(`INSERT INTO interview_sessions (date, leetcode_problem_id, sd_question_id) VALUES (?, ?, ?)`).run(
    today,
    nextProblem?.id ?? null,
    question.id,
  );
  db.query(`INSERT OR IGNORE INTO interview_sd_seen (question_id) VALUES (?)`).run(question.id);

  return getTodaySession(db, today)!;
}

export function startOrResumeCoding(db: Database, today: string): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET coding_running_since = ? WHERE date = ? AND coding_running_since IS NULL`).run(
    new Date().toISOString(),
    today,
  );
  return getTodaySession(db, today)!;
}

export function pauseCoding(db: Database, today: string): InterviewSessionRow {
  const row = getOrCreateTodaySession(db, today);
  if (row.coding_running_since !== null) {
    const elapsed = row.coding_elapsed_seconds + Math.floor((Date.now() - new Date(row.coding_running_since).getTime()) / 1000);
    db.query(`UPDATE interview_sessions SET coding_elapsed_seconds = ?, coding_running_since = NULL WHERE date = ?`).run(elapsed, today);
  }
  return getTodaySession(db, today)!;
}

export function startOrResumeDesign(db: Database, today: string): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET design_running_since = ? WHERE date = ? AND design_running_since IS NULL`).run(
    new Date().toISOString(),
    today,
  );
  return getTodaySession(db, today)!;
}

export function pauseDesign(db: Database, today: string): InterviewSessionRow {
  const row = getOrCreateTodaySession(db, today);
  if (row.design_running_since !== null) {
    const elapsed = row.design_elapsed_seconds + Math.floor((Date.now() - new Date(row.design_running_since).getTime()) / 1000);
    db.query(`UPDATE interview_sessions SET design_elapsed_seconds = ?, design_running_since = NULL WHERE date = ?`).run(elapsed, today);
  }
  return getTodaySession(db, today)!;
}

export function saveDesignAnswer(db: Database, today: string, answer: string, scene: string | null): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET sd_answer = ?, sd_excalidraw_scene = ? WHERE date = ?`).run(answer, scene, today);
  return getTodaySession(db, today)!;
}

export function revealModelAnswer(db: Database, today: string): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET sd_revealed_at = ? WHERE date = ? AND sd_revealed_at IS NULL`).run(today, today);
  return getTodaySession(db, today)!;
}

export function saveRubricChecked(db: Database, today: string, checked: boolean[]): InterviewSessionRow {
  getOrCreateTodaySession(db, today);
  db.query(`UPDATE interview_sessions SET sd_rubric_checked = ? WHERE date = ?`).run(JSON.stringify(checked), today);
  return getTodaySession(db, today)!;
}
