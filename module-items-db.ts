import type { Database } from "bun:sqlite";

export type ModuleItemKind = "assignment" | "presentation" | "viva" | "other";
export const MODULE_ITEM_KINDS: ModuleItemKind[] = ["assignment", "presentation", "viva", "other"];

export interface ModuleItemLink {
  label: string;
  url: string;
}

export type SyncState = "pending" | "synced" | "error";

export interface ModuleItem {
  id: number;
  course: string;
  kind: ModuleItemKind;
  title: string;
  description: string;
  due_at: string; // 'YYYY-MM-DDTHH:MM'
  links: ModuleItemLink[];
  completed: boolean;
  gcal_event_id: string | null;
  sync_state: SyncState;
  sync_error: string | null;
  synced_at: string | null;
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
}

interface ModuleItemRow {
  id: number;
  course: string;
  kind: string;
  title: string;
  description: string;
  due_at: string;
  links: string;
  completed: number;
  gcal_event_id: string | null;
  sync_state: string;
  sync_error: string | null;
  synced_at: string | null;
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
  completed: row.completed === 1,
  gcal_event_id: row.gcal_event_id,
  sync_state: row.sync_state as SyncState,
  sync_error: row.sync_error,
  synced_at: row.synced_at,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function migrateModuleItems(db: Database): void {
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
      gcal_event_id TEXT,
      sync_state TEXT NOT NULL DEFAULT 'pending',
      sync_error TEXT,
      synced_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function createModuleItem(db: Database, input: ModuleItemInput, today: string): ModuleItem {
  const row = db
    .query(
      `INSERT INTO module_items (course, kind, title, description, due_at, links, completed, sync_state, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 'pending', ?, ?) RETURNING *`,
    )
    .get(
      input.course,
      input.kind,
      input.title,
      input.description ?? "",
      normalizeDueAt(input.due_at),
      JSON.stringify(input.links ?? []),
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
          SET course = ?, kind = ?, title = ?, description = ?, due_at = ?, links = ?,
              sync_state = 'pending', sync_error = NULL, updated_at = ?
        WHERE id = ? RETURNING *`,
    )
    .get(
      input.course,
      input.kind,
      input.title,
      input.description ?? "",
      normalizeDueAt(input.due_at),
      JSON.stringify(input.links ?? []),
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
          SET completed = ?, sync_state = 'pending', sync_error = NULL, updated_at = ?
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

export function markItemSynced(db: Database, id: number, eventId: string, now: string): void {
  db.query(
    `UPDATE module_items
        SET gcal_event_id = ?, sync_state = 'synced', sync_error = NULL, synced_at = ?
      WHERE id = ?`,
  ).run(eventId, now, id);
}

export function markItemSyncError(db: Database, id: number, message: string): void {
  db.query(`UPDATE module_items SET sync_state = 'error', sync_error = ? WHERE id = ?`).run(message, id);
}

export function listItemsNeedingSync(db: Database): ModuleItem[] {
  return (
    db
      .query(`SELECT * FROM module_items WHERE sync_state != 'synced' ORDER BY id ASC`)
      .all() as ModuleItemRow[]
  ).map(toModuleItem);
}
