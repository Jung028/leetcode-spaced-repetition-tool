import type { Database } from "bun:sqlite";

export interface DeadlineCompletion {
  id: string;
  completed_at: string; // local 'YYYY-MM-DD'
}

// Completion state for the hand-compiled SEMESTER_DEADLINES list. A row's
// presence means "this assignment is done"; it is reversible and
// non-destructive (the source list in semester-deadlines.ts is untouched).
// `id` is deadlineId(course, title, dueDate).
export function migrateDeadlines(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS deadline_completions (
      id TEXT PRIMARY KEY,
      completed_at TEXT NOT NULL
    );
  `);
  // v2: deadlineId() dropped the trailing "|YYYY-MM-DD" so a rescanned due
  // date no longer orphans a completed row. Collapse any legacy id in place.
  // UPDATE OR IGNORE keeps the first row to claim a "course|title" slot; the
  // DELETE then clears any legacy row that lost a collision. Idempotent — the
  // GLOB matches nothing once every id is in the new form.
  db.exec(`
    UPDATE OR IGNORE deadline_completions
       SET id = substr(id, 1, length(id) - 11)
     WHERE id GLOB '*|[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';
    DELETE FROM deadline_completions
     WHERE id GLOB '*|[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';
  `);
}

export function completeDeadline(db: Database, id: string, today: string): void {
  db.query(
    `INSERT INTO deadline_completions (id, completed_at) VALUES (?, ?)
     ON CONFLICT (id) DO NOTHING`,
  ).run(id, today);
}

export function uncompleteDeadline(db: Database, id: string): boolean {
  return db.query(`DELETE FROM deadline_completions WHERE id = ?`).run(id).changes > 0;
}

export function listDeadlineCompletions(db: Database): DeadlineCompletion[] {
  return db
    .query(`SELECT id, completed_at FROM deadline_completions ORDER BY id`)
    .all() as DeadlineCompletion[];
}
