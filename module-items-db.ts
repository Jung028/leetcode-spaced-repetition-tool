import type { Database } from "bun:sqlite";
import { localToday } from "./shared/scheduling";
import { SEMESTER_DEADLINES, deadlineId, noteFor } from "./semester-deadlines";

export type ModuleItemKind =
  | "assignment"
  | "presentation"
  | "viva"
  | "quiz"
  | "exam"
  | "other";
export const MODULE_ITEM_KINDS: ModuleItemKind[] = [
  "assignment",
  "presentation",
  "viva",
  "quiz",
  "exam",
  "other",
];

export interface ModuleItemLink {
  label: string;
  url: string;
}

export interface ModuleItem {
  id: number;
  course: string;
  kind: ModuleItemKind;
  title: string;
  description: string;
  due_at: string; // 'YYYY-MM-DDTHH:MM'
  links: ModuleItemLink[];
  weight: string | null;
  completed: boolean;
  created_at: string; // local 'YYYY-MM-DD'
  updated_at: string; // local 'YYYY-MM-DD'
}

export interface ModuleItemInput {
  course: string;
  kind: ModuleItemKind;
  title: string;
  description?: string;
  due_at: string; // date or datetime; normalised on write
  links?: ModuleItemLink[];
  weight?: string;
}

interface ModuleItemRow {
  id: number;
  course: string;
  kind: string;
  title: string;
  description: string;
  due_at: string;
  links: string;
  weight: string | null;
  completed: number;
  created_at: string;
  updated_at: string;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function normalizeDueAt(input: string): string {
  if (DATE_ONLY.test(input)) return `${input}T23:59`;
  if (DATE_TIME.test(input)) return input;
  throw new Error("due_at must be YYYY-MM-DD or YYYY-MM-DDTHH:MM");
}

const toModuleItem = (row: ModuleItemRow): ModuleItem => ({
  id: row.id,
  course: row.course,
  kind: row.kind as ModuleItemKind,
  title: row.title,
  description: row.description,
  due_at: row.due_at,
  links: JSON.parse(row.links) as ModuleItemLink[],
  weight: row.weight,
  completed: row.completed === 1,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function migrateModuleItems(db: Database, today: string = localToday()): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_at TEXT NOT NULL,
      links TEXT NOT NULL DEFAULT '[]',
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  const cols = db.query(`PRAGMA table_info(module_items)`).all() as { name: string }[];
  if (!cols.some((c) => c.name === "weight")) {
    db.exec(`ALTER TABLE module_items ADD COLUMN weight TEXT`);
  }
  for (const col of ["gcal_event_id", "sync_state", "sync_error", "synced_at"]) {
    if (cols.some((c) => c.name === col)) db.exec(`ALTER TABLE module_items DROP COLUMN ${col}`);
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_item_seeds (
      seed_key  TEXT PRIMARY KEY,
      seeded_at TEXT NOT NULL
    );
  `);
  seedDeadlineItems(db, today);
}

function seedKind(title: string): ModuleItemKind {
  const t = title.toLowerCase();
  if (t.includes("quiz") || t.includes("feedback task")) return "quiz";
  if (t.includes("viva") || t.includes("interactive oral")) return "viva";
  if (t.includes("presentation")) return "presentation";
  return "assignment";
}

export function seedDeadlineItems(db: Database, today: string = localToday()): void {
  const alreadySeeded = new Set(
    (db.query(`SELECT seed_key FROM module_item_seeds`).all() as { seed_key: string }[]).map(
      (r) => r.seed_key,
    ),
  );
  const hasCompletions =
    db
      .query(`SELECT name FROM sqlite_master WHERE type='table' AND name='deadline_completions'`)
      .get() != null;
  const doneIds = hasCompletions
    ? new Set(
        (db.query(`SELECT id FROM deadline_completions`).all() as { id: string }[]).map((r) => r.id),
      )
    : new Set<string>();

  const insertItem = db.query(
    `INSERT INTO module_items
       (course, kind, title, description, due_at, links, completed, weight, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, '[]', ?, ?, ?, ?)`,
  );
  const markSeeded = db.query(
    `INSERT OR IGNORE INTO module_item_seeds (seed_key, seeded_at) VALUES (?, ?)`,
  );

  const tx = db.transaction(() => {
    for (const d of SEMESTER_DEADLINES) {
      const key = deadlineId(d);
      if (alreadySeeded.has(key)) continue;
      insertItem.run(
        d.course,
        seedKind(d.title),
        d.title,
        noteFor(d),
        `${d.dueDate}T23:59`,
        doneIds.has(key) ? 1 : 0,
        d.weight,
        today,
        today,
      );
      markSeeded.run(key, today);
    }
  });
  tx();
}

export function countItemsForModule(db: Database, course: string): number {
  return (
    db.query(`SELECT COUNT(*) AS n FROM module_items WHERE course = ?`).get(course) as { n: number }
  ).n;
}

export function deleteItemsForModule(db: Database, course: string): ModuleItem[] {
  return (
    db.query(`DELETE FROM module_items WHERE course = ? RETURNING *`).all(course) as ModuleItemRow[]
  ).map(toModuleItem);
}

export function createModuleItem(db: Database, input: ModuleItemInput, today: string): ModuleItem {
  const row = db
    .query(
      `INSERT INTO module_items (course, kind, title, description, due_at, links, completed, weight, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?) RETURNING *`,
    )
    .get(
      input.course,
      input.kind,
      input.title,
      input.description ?? "",
      normalizeDueAt(input.due_at),
      JSON.stringify(input.links ?? []),
      input.weight ?? null,
      today,
      today,
    ) as ModuleItemRow;
  return toModuleItem(row);
}

export function listModuleItems(db: Database): ModuleItem[] {
  return (
    db
      .query(`SELECT * FROM module_items ORDER BY completed ASC, due_at ASC, id ASC`)
      .all() as ModuleItemRow[]
  ).map(toModuleItem);
}

export function getModuleItem(db: Database, id: number): ModuleItem | null {
  const row = db.query(`SELECT * FROM module_items WHERE id = ?`).get(id) as ModuleItemRow | null;
  return row ? toModuleItem(row) : null;
}

export function updateModuleItem(
  db: Database,
  id: number,
  input: ModuleItemInput,
  today: string,
): ModuleItem | null {
  const row = db
    .query(
      `UPDATE module_items
          SET course = ?, kind = ?, title = ?, description = ?, due_at = ?, links = ?, weight = ?,
              updated_at = ?
        WHERE id = ? RETURNING *`,
    )
    .get(
      input.course,
      input.kind,
      input.title,
      input.description ?? "",
      normalizeDueAt(input.due_at),
      JSON.stringify(input.links ?? []),
      input.weight ?? null,
      today,
      id,
    ) as ModuleItemRow | null;
  return row ? toModuleItem(row) : null;
}

export function toggleModuleItem(db: Database, id: number, today: string): ModuleItem | null {
  const current = db.query(`SELECT completed FROM module_items WHERE id = ?`).get(id) as
    | { completed: number }
    | null;
  if (!current) return null;
  const row = db
    .query(
      `UPDATE module_items
          SET completed = ?, updated_at = ?
        WHERE id = ? RETURNING *`,
    )
    .get(current.completed === 0 ? 1 : 0, today, id) as ModuleItemRow;
  return toModuleItem(row);
}

export function deleteModuleItem(db: Database, id: number): ModuleItem | null {
  const row = db
    .query(`DELETE FROM module_items WHERE id = ? RETURNING *`)
    .get(id) as ModuleItemRow | null;
  return row ? toModuleItem(row) : null;
}

