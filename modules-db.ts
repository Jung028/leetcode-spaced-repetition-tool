import type { Database } from "bun:sqlite";
import { COURSE_NAMES } from "./semester-deadlines";
import { localToday } from "./shared/scheduling";

export interface Module {
  code: string;
  name: string;
  hidden: boolean;
  sort_order: number;
  created_at: string;
}

interface ModuleRow {
  code: string;
  name: string;
  hidden: number;
  sort_order: number;
  created_at: string;
}

export const MODULE_CODE_RE = /^[A-Za-z0-9-]{2,16}$/;

export function normalizeModuleCode(raw: string): string {
  return raw.trim().toUpperCase();
}

const toModule = (r: ModuleRow): Module => ({
  code: r.code,
  name: r.name,
  hidden: r.hidden === 1,
  sort_order: r.sort_order,
  created_at: r.created_at,
});

export function migrateModules(db: Database, today: string = localToday()): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      code       TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      hidden     INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
  const insert = db.query(
    `INSERT OR IGNORE INTO modules (code, name, hidden, sort_order, created_at)
     VALUES (?, ?, 0, ?, ?)`,
  );
  Object.entries(COURSE_NAMES).forEach(([code, name], i) => insert.run(code, name, i, today));
}

export function listModules(db: Database): Module[] {
  return (
    db.query(`SELECT * FROM modules ORDER BY sort_order ASC, code ASC`).all() as ModuleRow[]
  ).map(toModule);
}

export function getModule(db: Database, code: string): Module | null {
  const r = db.query(`SELECT * FROM modules WHERE code = ?`).get(code) as ModuleRow | null;
  return r ? toModule(r) : null;
}

export function moduleExists(db: Database, code: string): boolean {
  return db.query(`SELECT 1 FROM modules WHERE code = ?`).get(code) != null;
}

export function createModule(
  db: Database,
  code: string,
  name: string,
  today: string = localToday(),
): Module {
  const c = normalizeModuleCode(code);
  const n = name.trim();
  if (!MODULE_CODE_RE.test(c)) throw new Error("code must be 2–16 chars: letters, digits, hyphen");
  if (!n) throw new Error("name is required");
  if (moduleExists(db, c)) throw new Error(`module ${c} already exists`);
  const nextOrder =
    (db.query(`SELECT COALESCE(MAX(sort_order), -1) AS m FROM modules`).get() as { m: number }).m + 1;
  const r = db
    .query(
      `INSERT INTO modules (code, name, hidden, sort_order, created_at)
       VALUES (?, ?, 0, ?, ?) RETURNING *`,
    )
    .get(c, n, nextOrder, today) as ModuleRow;
  return toModule(r);
}

export function renameModule(db: Database, code: string, name: string): Module | null {
  const n = name.trim();
  if (!n) throw new Error("name is required");
  const r = db
    .query(`UPDATE modules SET name = ? WHERE code = ? RETURNING *`)
    .get(n, code) as ModuleRow | null;
  return r ? toModule(r) : null;
}

export function setModuleHidden(db: Database, code: string, hidden: boolean): Module | null {
  const r = db
    .query(`UPDATE modules SET hidden = ? WHERE code = ? RETURNING *`)
    .get(hidden ? 1 : 0, code) as ModuleRow | null;
  return r ? toModule(r) : null;
}

export function setModuleSortOrder(db: Database, code: string, sortOrder: number): Module | null {
  const r = db
    .query(`UPDATE modules SET sort_order = ? WHERE code = ? RETURNING *`)
    .get(sortOrder, code) as ModuleRow | null;
  return r ? toModule(r) : null;
}

export function deleteModule(db: Database, code: string): boolean {
  return db.query(`DELETE FROM modules WHERE code = ?`).run(code).changes > 0;
}
