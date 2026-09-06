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

// Picks a LeetCode problem (if one is due) and a system-design question the
// user hasn't seen yet (reusing the first one once every seeded question has
// been assigned at least once — with only a handful of seed companies this
// repeats sooner than it will once the full ~20-30 company roster, see spec
// "Scope for the implementation plan", is authored).
function pickFreshAssignment(db: Database, today: string): { problemId: number | null; questionId: string } {
  const nextProblem = listProblems(db).find((p) => isDue(p.next_review, today));
  const seenRows = db.query(`SELECT question_id FROM interview_sd_seen`).all() as { question_id: string }[];
  const seen = new Set(seenRows.map((r) => r.question_id));
  const allQuestions = allSystemDesignQuestions();
  if (allQuestions.length === 0) throw new Error("no system design questions are seeded");
  const question = allQuestions.find((q) => !seen.has(q.id)) ?? allQuestions[0]!;
  return { problemId: nextProblem?.id ?? null, questionId: question.id };
}

export function getOrCreateTodaySession(db: Database, today: string): InterviewSessionRow {
  const existing = getTodaySession(db, today);
  if (existing) return existing;

  // Never roll to a new question just because the date changed — not even
  // once both parts look complete. The question only changes when the user
  // explicitly clicks "Next question" (see advanceToNextQuestion). If a
  // session already exists from an earlier day, carry it forward to today
  // unchanged — same coding problem, same system-design question, same
  // in-progress answer, scene and rubric. Any timer left running is stopped
  // so it doesn't accrue time across the days the session sat untouched.
  const latest = db
    .query(`SELECT * FROM interview_sessions ORDER BY date DESC LIMIT 1`)
    .get() as InterviewSessionRow | null;
  if (latest && latest.date < today) {
    db.query(
      `UPDATE interview_sessions
         SET date = ?,
             coding_running_since = NULL,
             design_running_since = NULL
       WHERE date = ?`,
    ).run(today, latest.date);
    return getTodaySession(db, today)!;
  }

  const { problemId, questionId } = pickFreshAssignment(db, today);
  db.query(`INSERT INTO interview_sessions (date, leetcode_problem_id, sd_question_id) VALUES (?, ?, ?)`).run(
    today,
    problemId,
    questionId,
  );
  db.query(`INSERT OR IGNORE INTO interview_sd_seen (question_id) VALUES (?)`).run(questionId);

  return getTodaySession(db, today)!;
}

// Explicitly requested by the user (a "Next question" click) — the only way
// today's coding problem and system-design question are ever replaced.
// Resets every part of today's session so it starts fresh, same as a brand
// new day would, but on demand rather than on a timer or auto-detected
// completion.
export function advanceToNextQuestion(db: Database, today: string): InterviewSessionRow {
  getOrCreateTodaySession(db, today);

  const { problemId, questionId } = pickFreshAssignment(db, today);
  db.query(
    `UPDATE interview_sessions
       SET leetcode_problem_id = ?,
           sd_question_id = ?,
           coding_started_at = NULL,
           design_started_at = NULL,
           coding_elapsed_seconds = 0,
           coding_running_since = NULL,
           design_elapsed_seconds = 0,
           design_running_since = NULL,
           sd_answer = '',
           sd_excalidraw_scene = NULL,
           sd_rubric_checked = '[]',
           sd_revealed_at = NULL,
           completed_at = NULL
     WHERE date = ?`,
  ).run(problemId, questionId, today);
  db.query(`INSERT OR IGNORE INTO interview_sd_seen (question_id) VALUES (?)`).run(questionId);

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
