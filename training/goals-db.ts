import type { Database } from "bun:sqlite";

export interface Goal {
  id: number;
  text: string;
  done: boolean;
  done_at: string | null;
  created_at: string;
}

interface GoalRow {
  id: number;
  text: string;
  done: number;
  done_at: string | null;
  created_at: string;
}

const toGoal = (row: GoalRow): Goal => ({ ...row, done: row.done === 1 });

export function migrateGoals(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  // One-time rebuild from the earlier structured (title/current/target/race)
  // shape into a single notepad line, preserving every existing goal's text.
  const cols = db.query(`PRAGMA table_info(goals)`).all() as { name: string }[];
  if (cols.some((c) => c.name === "title")) {
    db.exec(`
      CREATE TABLE goals_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,
        done_at TEXT,
        created_at TEXT NOT NULL
      );
      INSERT INTO goals_new (id, text, done, done_at, created_at)
        SELECT id, title || ': ' || current_value || ' → ' || target_value, 0, NULL, created_at FROM goals;
      DROP TABLE goals;
      ALTER TABLE goals_new RENAME TO goals;
    `);
  }
}

export function createGoal(db: Database, text: string, today: string): Goal {
  const row = db
    .query(`INSERT INTO goals (text, done, done_at, created_at) VALUES (?, 0, NULL, ?) RETURNING *`)
    .get(text, today) as GoalRow;
  return toGoal(row);
}

export function listGoals(db: Database): Goal[] {
  return (db.query(`SELECT * FROM goals ORDER BY created_at, id`).all() as GoalRow[]).map(toGoal);
}

export function updateGoal(db: Database, id: number, text: string): Goal | null {
  const row = db.query(`UPDATE goals SET text = ? WHERE id = ? RETURNING *`).get(text, id) as
    | GoalRow
    | undefined;
  return row ? toGoal(row) : null;
}

export function deleteGoal(db: Database, id: number): boolean {
  return db.query(`DELETE FROM goals WHERE id = ?`).run(id).changes > 0;
}

export function toggleGoal(db: Database, id: number, today: string): Goal | null {
  const current = db.query(`SELECT * FROM goals WHERE id = ?`).get(id) as GoalRow | null;
  if (!current) return null;
  const nowDone = current.done === 0;
  const row = db
    .query(`UPDATE goals SET done = ?, done_at = ? WHERE id = ? RETURNING *`)
    .get(nowDone ? 1 : 0, nowDone ? today : null, id) as GoalRow;
  return toGoal(row);
}

export function seedGoalsOnce(db: Database, rows: string[], today: string): number {
  const seeded = db.query(`SELECT value FROM goals_meta WHERE key = 'seeded'`).get();
  if (seeded) return 0;
  const tx = db.transaction(() => {
    for (const text of rows) createGoal(db, text, today);
    db.query(`INSERT INTO goals_meta (key, value) VALUES ('seeded', ?)`).run(today);
  });
  tx();
  return rows.length;
}
