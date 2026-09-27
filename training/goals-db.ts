import type { Database } from "bun:sqlite";
import type { Race } from "./races-db";

export interface Goal {
  id: number;
  title: string;
  current_value: string;
  target_value: string;
  target_date: string | null;
  race_id: number | null;
  notes: string | null;
  created_at: string;
}

export interface GoalInput {
  title: string;
  currentValue: string;
  targetValue: string;
  targetDate?: string | null;
  raceId?: number | null;
  notes?: string | null;
}

export interface GoalSeedInput {
  title: string;
  currentValue: string;
  targetValue: string;
  targetDate?: string | null;
  raceName?: string | null;
  notes?: string | null;
}

export function migrateGoals(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      current_value TEXT NOT NULL,
      target_value TEXT NOT NULL,
      target_date TEXT,
      race_id INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function createGoal(db: Database, input: GoalInput, today: string): Goal {
  return db
    .query(
      `INSERT INTO goals (title, current_value, target_value, target_date, race_id, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .get(
      input.title,
      input.currentValue,
      input.targetValue,
      input.targetDate ?? null,
      input.raceId ?? null,
      input.notes ?? null,
      today,
    ) as Goal;
}

export function listGoals(db: Database): Goal[] {
  return db.query(`SELECT * FROM goals ORDER BY created_at, id`).all() as Goal[];
}

export function updateGoal(db: Database, id: number, input: GoalInput): Goal | null {
  const row = db
    .query(
      `UPDATE goals SET title = ?, current_value = ?, target_value = ?, target_date = ?, race_id = ?, notes = ?
       WHERE id = ? RETURNING *`,
    )
    .get(
      input.title,
      input.currentValue,
      input.targetValue,
      input.targetDate ?? null,
      input.raceId ?? null,
      input.notes ?? null,
      id,
    ) as Goal | undefined;
  return row ?? null;
}

export function deleteGoal(db: Database, id: number): boolean {
  return db.query(`DELETE FROM goals WHERE id = ?`).run(id).changes > 0;
}

export function resolveGoalSeed(seed: GoalSeedInput[], races: Race[]): GoalInput[] {
  const idByName = new Map(races.map((r) => [r.name, r.id]));
  return seed.map(({ raceName, ...rest }) => ({
    ...rest,
    raceId: raceName ? idByName.get(raceName) ?? null : null,
  }));
}

export function seedGoalsOnce(db: Database, rows: GoalInput[], today: string): number {
  const seeded = db.query(`SELECT value FROM goals_meta WHERE key = 'seeded'`).get();
  if (seeded) return 0;
  const tx = db.transaction(() => {
    for (const row of rows) createGoal(db, row, today);
    db.query(`INSERT INTO goals_meta (key, value) VALUES ('seeded', ?)`).run(today);
  });
  tx();
  return rows.length;
}
