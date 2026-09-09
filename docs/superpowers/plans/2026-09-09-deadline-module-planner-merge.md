# Deadline / Module Planner Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the hard-coded `SEMESTER_DEADLINES` list and the Module Planner into one editable, DB-backed planner on the Home page, with editable modules, a weight field, a flat sortable view, and an announcement→deadline quick-add.

**Architecture:** A new `modules` table (seeded with the 4 core subjects) becomes the source of truth for planner subjects. `module_items` gains a `weight` column and two new kinds, and a one-time seed copies the 12 legacy deadlines in (carrying over existing tick-offs, guarded by a `module_item_seeds` log). The standalone `/api/deadlines` backend is deleted. The React `ModulePlanner` component moves from the exam board to the Home page, gains module CRUD and a grouped/flat view toggle, and `AnnouncementsBoard` gains an inline "add to deadlines" form.

**Tech Stack:** Bun, `Bun.serve` route objects, `bun:sqlite`, React 19 (no build step — HTML imports), `bun test`.

**Spec:** `docs/superpowers/specs/2026-09-09-deadline-module-planner-merge-design.md`

## Global Constraints

- **Bun only.** `bun <file>`, `bun test`, `bun install`. Never node/npm/npx/jest/vitest. Use `bunx tsc --noEmit` for type checks.
- **Continuous testing is already wired.** `.claude/settings.json` has a `PostToolUse` hook on `Write|Edit` that runs `bun test` then `bunx tsc --noEmit`. After every file save you will see the tail of both. If either fails, fix it before moving on — do not hand back a red tree.
- **No frontend component-test framework exists** (no happy-dom, no testing-library, zero `.test.tsx` files). Frontend tasks are verified by `bunx tsc --noEmit` plus a scripted claude-in-chrome browser check. All behavioural assertions live in backend `*.test.ts` files that hit `Bun.serve` routes with `fetch` — follow that existing pattern.
- **Dev server:** `PORT=3005 bun --hot index.ts`. `bun --hot` does NOT rebuild the `Bun.serve` route table — after any change to a route object or `index.ts`, kill and restart the server before browser-testing.
- **Commit trailers** — every commit message ends with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v
  ```
- **Do not touch exam content** (`exam-content/**`). `scripts/check-mcq-lengths.test.ts` must stay green (it will, untouched).
- **`localToday()`** comes from `./shared/scheduling` and returns local `'YYYY-MM-DD'`. Use it for every "today" argument.
- **Migrations must be re-runnable.** Guard `ALTER TABLE` with a `PRAGMA table_info` check; use `INSERT OR IGNORE` / `ON CONFLICT DO NOTHING` for seeds.

---

## File Structure

**New files:**
- `modules-db.ts` — `modules` table: migration + seed + CRUD + `moduleExists`.
- `modules-api.ts` — `moduleApiRoutes(db, deps)`: REST for `/api/modules`.
- `modules-db.test.ts`, `modules-api.test.ts` — coverage for the above.

**Modified files:**
- `module-items-db.ts` — `weight` column/field; `quiz`+`exam` kinds; `module_item_seeds` table; `seedDeadlineItems`; `countItemsForModule`; `deleteItemsForModule`; `migrateModuleItems` takes `today`.
- `module-items-api.ts` — accept `weight`; validate `course` against `modules`.
- `module-items-db.test.ts`, `module-items-api.test.ts` — extend.
- `index.ts` — wire `migrateModules` + `moduleApiRoutes`; drop `migrateDeadlines` + `deadlineApiRoutes`.
- `HomeApp.tsx` — drop `DeadlinesPanel` + `semester-deadlines`/`deadline-api` imports; later mount `<ModulePlanner>`; add `openItemId` prop.
- `ModulePlanner.tsx` — modules-driven groups; module CRUD UI; `weight` field; grouped/flat view toggle + sort; shared `PlannerRow`.
- `AnnouncementsBoard.tsx` — inline "add to deadlines" form; fetch `/api/modules`.
- `exam/App.tsx` — remove `ModulePlanner` mount + `openItemId`/`onOpened` props + import.
- `frontend.tsx` — `module-item` deep link routes to Home; pass `openItemId` to `<HomeApp>` not `<ExamApp>`.
- `index.css` — planner view/sort/module-head/subject-tag styles; retire unused `.deadline*`.

**Deleted files:**
- `deadline-db.ts`, `deadline-api.ts`, `deadline-db.test.ts`, `deadline-api.test.ts`.

**Untouched (kept as-is):** `semester-deadlines.ts` (becomes seed-only; still exports `COURSE_NAMES`, `courseNameFor`, `SEMESTER_DEADLINES`, `deadlineId`, `noteFor`). `deadline_completions` table is left in the DB (read once by the seed) — not dropped.

---

## Task 1: `modules` table + `modules-db.ts`

**Files:**
- Create: `modules-db.ts`
- Test: `modules-db.test.ts`

**Interfaces:**
- Consumes: `Database` from `bun:sqlite`; `COURSE_NAMES` (`Record<string,string>`) from `./semester-deadlines`.
- Produces:
  ```ts
  export interface Module {
    code: string;
    name: string;
    hidden: boolean;
    sort_order: number;
    created_at: string;
  }
  export const MODULE_CODE_RE: RegExp;               // /^[A-Za-z0-9-]{2,16}$/
  export function normalizeModuleCode(raw: string): string;          // trim + toUpperCase
  export function migrateModules(db: Database, today?: string): void; // defaults today to localToday()
  export function listModules(db: Database): Module[];               // ORDER BY sort_order, code
  export function getModule(db: Database, code: string): Module | null;
  export function moduleExists(db: Database, code: string): boolean;
  export function createModule(db: Database, code: string, name: string, today?: string): Module; // throws Error on invalid code / empty name / duplicate
  export function renameModule(db: Database, code: string, name: string): Module | null;
  export function setModuleHidden(db: Database, code: string, hidden: boolean): Module | null;
  export function setModuleSortOrder(db: Database, code: string, sortOrder: number): Module | null;
  export function deleteModule(db: Database, code: string): boolean;  // deletes the modules row only
  ```

- [ ] **Step 1: Write the failing test**

Create `modules-db.test.ts`:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateModules,
  listModules,
  getModule,
  moduleExists,
  createModule,
  renameModule,
  setModuleHidden,
  setModuleSortOrder,
  deleteModule,
  normalizeModuleCode,
} from "./modules-db";

let db: Database;
beforeEach(() => {
  db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
});

test("seeds exactly the four core subjects, ordered", () => {
  const mods = listModules(db);
  expect(mods.map((m) => m.code)).toEqual(["INFO5995", "COMP5348", "INFO6007", "INFO5990"]);
  expect(mods.map((m) => m.sort_order)).toEqual([0, 1, 2, 3]);
  expect(mods.every((m) => m.hidden === false)).toBe(true);
  expect(getModule(db, "INFO5995")!.name).toBe("Introduction to Cybersecurity");
});

test("re-running the migration is a no-op", () => {
  migrateModules(db, "2026-09-09");
  migrateModules(db, "2026-09-09");
  expect(listModules(db)).toHaveLength(4);
});

test("normalizeModuleCode trims and uppercases", () => {
  expect(normalizeModuleCode("  my-course ")).toBe("MY-COURSE");
});

test("createModule adds a row at the end", () => {
  const m = createModule(db, "MY-COURSE", "My Course", "2026-09-09");
  expect(m).toMatchObject({ code: "MY-COURSE", name: "My Course", hidden: false, sort_order: 4 });
  expect(moduleExists(db, "MY-COURSE")).toBe(true);
});

test("createModule rejects a duplicate code (case-insensitive)", () => {
  expect(() => createModule(db, "info5995", "Dupe")).toThrow(/exists/i);
});

test("createModule rejects a bad code or empty name", () => {
  expect(() => createModule(db, "a", "Too short")).toThrow(/code/i);
  expect(() => createModule(db, "OK2", "   ")).toThrow(/name/i);
});

test("rename / hide / reorder / delete", () => {
  expect(renameModule(db, "INFO6007", "PM in IT")!.name).toBe("PM in IT");
  expect(setModuleHidden(db, "INFO6007", true)!.hidden).toBe(true);
  expect(setModuleSortOrder(db, "INFO6007", 9)!.sort_order).toBe(9);
  expect(deleteModule(db, "INFO6007")).toBe(true);
  expect(getModule(db, "INFO6007")).toBeNull();
  expect(renameModule(db, "NOPE", "x")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test modules-db.test.ts`
Expected: FAIL — `Cannot find module './modules-db'`.

- [ ] **Step 3: Write minimal implementation**

Create `modules-db.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test modules-db.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add modules-db.ts modules-db.test.ts
git commit -m "$(printf 'feat: add modules table with seed + CRUD\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 2: `module_items` — `weight`, new kinds, deadline seed

**Files:**
- Modify: `module-items-db.ts`
- Test: `module-items-db.test.ts` (extend)

**Interfaces:**
- Consumes: `Module` machinery from Task 1 is NOT imported here; `SEMESTER_DEADLINES`, `deadlineId`, `noteFor` from `./semester-deadlines`; `localToday` from `./shared/scheduling`.
- Produces (changed / new):
  ```ts
  export type ModuleItemKind = "assignment" | "presentation" | "viva" | "quiz" | "exam" | "other";
  export const MODULE_ITEM_KINDS: ModuleItemKind[];  // the six above, in that order
  export interface ModuleItem { /* …existing… */ weight: string | null }
  export interface ModuleItemInput { /* …existing… */ weight?: string }
  export function migrateModuleItems(db: Database, today?: string): void; // now seeds; today defaults to localToday()
  export function seedDeadlineItems(db: Database, today?: string): void;  // idempotent; exported for tests
  export function countItemsForModule(db: Database, course: string): number;
  export function deleteItemsForModule(db: Database, course: string): ModuleItem[]; // returns deleted rows
  ```
  `createModuleItem` / `updateModuleItem` keep their signatures but now persist `input.weight ?? null`.

- [ ] **Step 1: Write the failing test**

Append to `module-items-db.test.ts` (keep existing imports; add the new names):

```ts
import {
  migrateModuleItems,
  seedDeadlineItems,
  createModuleItem,
  updateModuleItem,
  listModuleItems,
  countItemsForModule,
  deleteItemsForModule,
  MODULE_ITEM_KINDS,
} from "./module-items-db";
import { Database } from "bun:sqlite";
import { test, expect } from "bun:test";
import { SEMESTER_DEADLINES, deadlineId } from "./semester-deadlines";

test("MODULE_ITEM_KINDS includes quiz and exam", () => {
  expect(MODULE_ITEM_KINDS).toEqual(["assignment", "presentation", "viva", "quiz", "exam", "other"]);
});

test("weight round-trips through create and update", () => {
  const db = new Database(":memory:");
  migrateModuleItems(db, "2026-09-09");
  const made = createModuleItem(
    db,
    { course: "INFO5995", kind: "assignment", title: "P1", due_at: "2026-09-13", weight: "20%" },
    "2026-09-09",
  );
  expect(made.weight).toBe("20%");
  const upd = updateModuleItem(
    db,
    made.id,
    { course: "INFO5995", kind: "assignment", title: "P1", due_at: "2026-09-13" }, // no weight
    "2026-09-10",
  )!;
  expect(upd.weight).toBeNull();
});

test("seedDeadlineItems inserts every SEMESTER_DEADLINES row once, with weight + kind", () => {
  const db = new Database(":memory:");
  migrateModuleItems(db, "2026-09-09"); // calls the seed internally
  const items = listModuleItems(db);
  expect(items).toHaveLength(SEMESTER_DEADLINES.length);
  const viva = items.find((i) => i.title.includes("Viva"))!;
  expect(viva.kind).toBe("viva");
  const quiz = items.find((i) => i.title.includes("feedback quiz"))!;
  expect(quiz.kind).toBe("quiz");
  const p1 = items.find((i) => i.title === "Project 1")!;
  expect(p1.kind).toBe("assignment");
  expect(p1.weight).toBe("20%");
  // re-running does not duplicate
  seedDeadlineItems(db, "2026-09-09");
  expect(listModuleItems(db)).toHaveLength(SEMESTER_DEADLINES.length);
});

test("seed carries over an existing deadline_completions tick", () => {
  const db = new Database(":memory:");
  db.exec(`CREATE TABLE deadline_completions (id TEXT PRIMARY KEY, completed_at TEXT NOT NULL)`);
  const done = SEMESTER_DEADLINES[0]!;
  db.query(`INSERT INTO deadline_completions (id, completed_at) VALUES (?, ?)`).run(
    deadlineId(done),
    "2026-08-29",
  );
  migrateModuleItems(db, "2026-09-09");
  const seeded = listModuleItems(db).find((i) => i.title === done.title)!;
  expect(seeded.completed).toBe(true);
});

test("deleting a seeded item then re-seeding does NOT resurrect it", () => {
  const db = new Database(":memory:");
  migrateModuleItems(db, "2026-09-09");
  const target = listModuleItems(db)[0]!;
  deleteItemsForModule(db, target.course); // nukes at least that row
  const remaining = listModuleItems(db).length;
  seedDeadlineItems(db, "2026-09-09");
  expect(listModuleItems(db)).toHaveLength(remaining);
});

test("countItemsForModule / deleteItemsForModule", () => {
  const db = new Database(":memory:");
  migrateModuleItems(db, "2026-09-09");
  createModuleItem(
    db,
    { course: "COMP5348", kind: "other", title: "X", due_at: "2026-10-01" },
    "2026-09-09",
  );
  const before = countItemsForModule(db, "COMP5348");
  expect(before).toBeGreaterThanOrEqual(1);
  const deleted = deleteItemsForModule(db, "COMP5348");
  expect(deleted).toHaveLength(before);
  expect(countItemsForModule(db, "COMP5348")).toBe(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test module-items-db.test.ts`
Expected: FAIL — `seedDeadlineItems` / `countItemsForModule` / `deleteItemsForModule` not exported; `weight` undefined on results.

- [ ] **Step 3: Write minimal implementation**

In `module-items-db.ts`:

1. Update the kind type + list:

```ts
export type ModuleItemKind = "assignment" | "presentation" | "viva" | "quiz" | "exam" | "other";
export const MODULE_ITEM_KINDS: ModuleItemKind[] = [
  "assignment",
  "presentation",
  "viva",
  "quiz",
  "exam",
  "other",
];
```

2. Add `weight` to `ModuleItem`, `ModuleItemInput`, `ModuleItemRow`:

```ts
// ModuleItem
weight: string | null;
// ModuleItemInput
weight?: string;
// ModuleItemRow
weight: string | null;
```

3. `toModuleItem`: add `weight: row.weight,`.

4. Add imports at the top:

```ts
import { localToday } from "./shared/scheduling";
import { SEMESTER_DEADLINES, deadlineId, noteFor } from "./semester-deadlines";
```

5. In `migrateModuleItems`, change the signature and add the column + seed:

```ts
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
      gcal_event_id TEXT,
      sync_state TEXT NOT NULL DEFAULT 'pending',
      sync_error TEXT,
      synced_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  const cols = db.query(`PRAGMA table_info(module_items)`).all() as { name: string }[];
  if (!cols.some((c) => c.name === "weight")) {
    db.exec(`ALTER TABLE module_items ADD COLUMN weight TEXT`);
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS module_item_seeds (
      seed_key  TEXT PRIMARY KEY,
      seeded_at TEXT NOT NULL
    );
  `);
  seedDeadlineItems(db, today);
}
```

6. Add the seed + helpers:

```ts
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
    db.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='deadline_completions'`).get() !=
    null;
  const doneIds = hasCompletions
    ? new Set(
        (db.query(`SELECT id FROM deadline_completions`).all() as { id: string }[]).map((r) => r.id),
      )
    : new Set<string>();

  const insertItem = db.query(
    `INSERT INTO module_items
       (course, kind, title, description, due_at, links, completed, weight, sync_state, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, '[]', ?, ?, 'pending', ?, ?)`,
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
```

7. `createModuleItem`: add `weight` to the column list + values:

```ts
`INSERT INTO module_items (course, kind, title, description, due_at, links, completed, weight, sync_state, created_at, updated_at)
 VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'pending', ?, ?) RETURNING *`,
// .get(input.course, input.kind, input.title, input.description ?? "", normalizeDueAt(input.due_at),
//      JSON.stringify(input.links ?? []), input.weight ?? null, today, today)
```

8. `updateModuleItem`: add `weight = ?` to the SET list and `input.weight ?? null` to the params (before `updated_at`).

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test module-items-db.test.ts`
Expected: PASS (existing tests + 7 new).

- [ ] **Step 5: Commit**

```bash
git add module-items-db.ts module-items-db.test.ts
git commit -m "$(printf 'feat: add weight + quiz/exam kinds + legacy-deadline seed to module_items\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 3: `modules-api.ts` — `/api/modules` routes

**Files:**
- Create: `modules-api.ts`
- Test: `modules-api.test.ts`

**Interfaces:**
- Consumes: `migrateModules`, `listModules`, `getModule`, `createModule`, `renameModule`, `setModuleHidden`, `setModuleSortOrder`, `deleteModule`, `moduleExists` (Task 1); `migrateModuleItems`, `createModuleItem`, `countItemsForModule`, `deleteItemsForModule` (Task 2); `deleteCalendarEvent`, `type SyncDeps` from `./gcal/sync`; `localToday` from `./shared/scheduling`.
- Produces:
  ```ts
  export function moduleApiRoutes(db: Database, deps?: { sync?: SyncDeps }): Record<string, unknown>;
  ```
  Routes:
  - `GET /api/modules` → `Module[]` (200)
  - `POST /api/modules` `{code,name}` → `Module` (201) | `{error}` 400 | `{error}` 409 (duplicate)
  - `PUT /api/modules/:code` `{name}` → `Module` (200) | `{error}` 400 | `{error:"not found"}` 404
  - `PATCH /api/modules/:code` `{hidden?:boolean, sort_order?:number}` → `Module` (200) | `{error}` 400 | 404
  - `DELETE /api/modules/:code` (optional `?cascade=1`) → `{ok:true}` (200) | `{error:"module has items", count}` 409 | `{error:"not found"}` 404

- [ ] **Step 1: Write the failing test**

Create `modules-api.test.ts`:

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateModules } from "./modules-db";
import { migrateModuleItems, createModuleItem } from "./module-items-db";
import { moduleApiRoutes } from "./modules-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
  migrateModuleItems(db, "2026-09-09");
  server = Bun.serve({ port: 0, routes: moduleApiRoutes(db) });
  base = server.url.origin;
});
afterEach(() => server.stop(true));

test("GET lists seeded modules", async () => {
  const rows = await (await fetch(`${base}/api/modules`)).json();
  expect(rows.map((r: { code: string }) => r.code)).toEqual([
    "INFO5995",
    "COMP5348",
    "INFO6007",
    "INFO5990",
  ]);
});

test("POST creates, rejects duplicate and bad code", async () => {
  const ok = await fetch(`${base}/api/modules`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "MY-COURSE", name: "My Course" }),
  });
  expect(ok.status).toBe(201);

  const dup = await fetch(`${base}/api/modules`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "INFO5995", name: "x" }),
  });
  expect(dup.status).toBe(409);

  const bad = await fetch(`${base}/api/modules`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "a", name: "x" }),
  });
  expect(bad.status).toBe(400);
});

test("PUT renames, PATCH hides, 404 for unknown", async () => {
  const put = await fetch(`${base}/api/modules/INFO6007`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "PM" }),
  });
  expect((await put.json()).name).toBe("PM");

  const patch = await fetch(`${base}/api/modules/INFO6007`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hidden: true }),
  });
  expect((await patch.json()).hidden).toBe(true);

  const miss = await fetch(`${base}/api/modules/NOPE`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "x" }),
  });
  expect(miss.status).toBe(404);
});

test("DELETE blocks a module with items unless cascade=1", async () => {
  createModuleItem(
    db,
    { course: "INFO5990", kind: "other", title: "T", due_at: "2026-10-01" },
    "2026-09-09",
  );
  const blocked = await fetch(`${base}/api/modules/INFO5990`, { method: "DELETE" });
  expect(blocked.status).toBe(409);
  expect((await blocked.json()).count).toBeGreaterThanOrEqual(1);

  const forced = await fetch(`${base}/api/modules/INFO5990?cascade=1`, { method: "DELETE" });
  expect(forced.status).toBe(200);
  expect(await (await fetch(`${base}/api/modules`)).json()).toHaveLength(3);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test modules-api.test.ts`
Expected: FAIL — `Cannot find module './modules-api'`.

- [ ] **Step 3: Write minimal implementation**

Create `modules-api.ts`:

```ts
import type { Database } from "bun:sqlite";
import {
  createModule,
  deleteModule,
  getModule,
  listModules,
  renameModule,
  setModuleHidden,
  setModuleSortOrder,
} from "./modules-db";
import { countItemsForModule, deleteItemsForModule } from "./module-items-db";
import { deleteCalendarEvent, type SyncDeps } from "./gcal/sync";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function moduleApiRoutes(db: Database, deps: { sync?: SyncDeps } = {}) {
  const sync = deps.sync;
  return {
    "/api/modules": {
      GET: () => json(listModules(db)),
      POST: async (req: Request) => {
        const b = (await req.json().catch(() => null)) as { code?: unknown; name?: unknown } | null;
        const code = typeof b?.code === "string" ? b.code : "";
        const name = typeof b?.name === "string" ? b.name : "";
        try {
          return json(createModule(db, code, name), 201);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "bad request";
          return json({ error: msg }, /exists/i.test(msg) ? 409 : 400);
        }
      },
    },
    "/api/modules/:code": {
      PUT: async (req: Request & { params: { code: string } }) => {
        const b = (await req.json().catch(() => null)) as { name?: unknown } | null;
        const name = typeof b?.name === "string" ? b.name : "";
        try {
          const m = renameModule(db, req.params.code, name);
          return m ? json(m) : json({ error: "not found" }, 404);
        } catch (err) {
          return json({ error: err instanceof Error ? err.message : "bad request" }, 400);
        }
      },
      PATCH: async (req: Request & { params: { code: string } }) => {
        const b = (await req.json().catch(() => null)) as
          | { hidden?: unknown; sort_order?: unknown }
          | null;
        let m = getModule(db, req.params.code);
        if (!m) return json({ error: "not found" }, 404);
        if (typeof b?.hidden === "boolean") m = setModuleHidden(db, req.params.code, b.hidden);
        if (typeof b?.sort_order === "number")
          m = setModuleSortOrder(db, req.params.code, b.sort_order);
        return json(m);
      },
      DELETE: async (req: Request & { params: { code: string } }) => {
        const code = req.params.code;
        if (!getModule(db, code)) return json({ error: "not found" }, 404);
        const count = countItemsForModule(db, code);
        const cascade = new URL(req.url).searchParams.get("cascade") === "1";
        if (count > 0 && !cascade) return json({ error: "module has items", count }, 409);
        if (count > 0) {
          for (const it of deleteItemsForModule(db, code)) {
            if (it.gcal_event_id) await deleteCalendarEvent(it.gcal_event_id, sync).catch(() => {});
          }
        }
        deleteModule(db, code);
        return json({ ok: true });
      },
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test modules-api.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add modules-api.ts modules-api.test.ts
git commit -m "$(printf 'feat: add /api/modules CRUD routes with cascade delete\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 4: `module-items-api.ts` — accept `weight`, validate against `modules`

**Files:**
- Modify: `module-items-api.ts`
- Test: `module-items-api.test.ts` (extend)

**Interfaces:**
- Consumes: `moduleExists` from `./modules-db` (Task 1); `migrateModules` in the test setup.
- Produces: `parseInput(db, body)` (signature gains `db` as first arg — internal); route responses now include `weight: string | null`. `POST` / `PUT` reject `{error:"unknown module"}` (400) when `course` is not a `modules` row, and accept an optional `weight` string (≤ 12 chars, else `{error:"weight too long"}` 400).

- [ ] **Step 1: Write the failing test**

Add to `module-items-api.test.ts`. Ensure the `beforeEach` sets up modules — if the existing setup only calls `migrateModuleItems`, add `migrateModules(db, ...)` alongside it and pass `moduleItemsApiRoutes(db)` as today. New cases:

```ts
import { migrateModules } from "./modules-db";
// …in beforeEach, before migrateModuleItems(db, ...):
//   migrateModules(db, "2026-09-09");

test("POST accepts an optional weight", async () => {
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      course: "INFO5995",
      kind: "assignment",
      title: "Weighted",
      due_at: "2026-09-20",
      weight: "15%",
    }),
  });
  expect(res.status).toBe(201);
  expect((await res.json()).weight).toBe("15%");
});

test("POST rejects an unknown module", async () => {
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ course: "ZZZ0000", kind: "other", title: "x", due_at: "2026-09-20" }),
  });
  expect(res.status).toBe(400);
  expect((await res.json()).error).toMatch(/unknown module/i);
});

test("POST rejects an over-long weight", async () => {
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      course: "INFO5995",
      kind: "other",
      title: "x",
      due_at: "2026-09-20",
      weight: "way too long to be a weight",
    }),
  });
  expect(res.status).toBe(400);
});

test("POST still works for a hidden module", async () => {
  // hide INFO5990 directly, then post to it
  const { setModuleHidden } = await import("./modules-db");
  setModuleHidden(db, "INFO5990", true);
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ course: "INFO5990", kind: "other", title: "x", due_at: "2026-09-20" }),
  });
  expect(res.status).toBe(201);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test module-items-api.test.ts`
Expected: FAIL — unknown-module case returns 201 (old `COURSE_NAMES` check still passes for INFO5990/etc but `ZZZ0000` was already rejected as "unknown course"… the *weight* cases fail: `weight` is dropped, over-long weight is accepted).

- [ ] **Step 3: Write minimal implementation**

In `module-items-api.ts`:

1. Replace the `COURSE_NAMES` import with `moduleExists`:

```ts
import { moduleExists } from "./modules-db";
```
(remove `import { COURSE_NAMES } from "./semester-deadlines";` — now unused.)

2. `parseInput` takes `db` and swaps the course check + adds weight:

```ts
function parseInput(db: Database, body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) return { error: "invalid body" };
  const b = body as Record<string, unknown>;

  const course = typeof b.course === "string" ? b.course : "";
  if (!moduleExists(db, course)) return { error: "unknown module" };

  const kind = typeof b.kind === "string" ? b.kind : "";
  if (!MODULE_ITEM_KINDS.includes(kind as ModuleItemKind)) {
    return { error: `kind must be one of ${MODULE_ITEM_KINDS.join(", ")}` };
  }

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return { error: "title is required" };

  const dueRaw = typeof b.due_at === "string" ? b.due_at.trim() : "";
  let due_at: string;
  try {
    due_at = normalizeDueAt(dueRaw);
  } catch {
    return { error: "due_at must be YYYY-MM-DD or YYYY-MM-DDTHH:MM" };
  }

  const description = typeof b.description === "string" ? b.description : "";

  const weightRaw = typeof b.weight === "string" ? b.weight.trim() : "";
  if (weightRaw.length > 12) return { error: "weight too long" };
  const weight = weightRaw || undefined;

  const links = parseLinks(b.links);
  if ("error" in links) return { error: links.error };

  return { input: { course, kind: kind as ModuleItemKind, title, description, due_at, links, weight } };
}
```

3. Both call sites: `parseInput(await req.json().catch(() => null))` → `parseInput(db, await req.json().catch(() => null))`.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test module-items-api.test.ts`
Expected: PASS (existing + 4 new).

- [ ] **Step 5: Commit**

```bash
git add module-items-api.ts module-items-api.test.ts
git commit -m "$(printf 'feat: module-items API accepts weight, validates course against modules table\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 5: Wire `index.ts`, retire the deadline backend, strip `DeadlinesPanel`

**Files:**
- Modify: `index.ts:8-9,33,54` (imports, migrate call, routes)
- Modify: `HomeApp.tsx:5-6,27-...,371` (drop `DeadlinesPanel` + its imports + mount)
- Delete: `deadline-db.ts`, `deadline-api.ts`, `deadline-db.test.ts`, `deadline-api.test.ts`
- Test: new `modules-wiring.test.ts` (smoke)

**Interfaces:**
- Consumes: `migrateModules`, `moduleApiRoutes` (Tasks 1, 3).
- Produces: running server exposes `/api/modules` + `/api/module-items` (with seeded rows) and no longer exposes `/api/deadlines`.

- [ ] **Step 1: Write the failing test**

Create `modules-wiring.test.ts`:

```ts
import { test, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateModules } from "./modules-db";
import { migrateModuleItems, listModuleItems } from "./module-items-db";
import { moduleApiRoutes } from "./modules-api";
import { moduleItemsApiRoutes } from "./module-items-api";
import { SEMESTER_DEADLINES } from "./semester-deadlines";

test("boot order seeds modules then the 12 legacy deadlines as items", () => {
  const db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
  migrateModuleItems(db, "2026-09-09");
  expect(listModuleItems(db)).toHaveLength(SEMESTER_DEADLINES.length);
});

test("combined routes serve modules and module-items, not deadlines", async () => {
  const db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
  migrateModuleItems(db, "2026-09-09");
  const server = Bun.serve({
    port: 0,
    routes: { ...moduleApiRoutes(db), ...moduleItemsApiRoutes(db) },
    fetch: () => new Response("no", { status: 404 }),
  });
  try {
    expect((await fetch(`${server.url.origin}/api/modules`)).status).toBe(200);
    expect((await fetch(`${server.url.origin}/api/module-items`)).status).toBe(200);
    expect((await fetch(`${server.url.origin}/api/deadlines`)).status).toBe(404);
  } finally {
    server.stop(true);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test modules-wiring.test.ts`
Expected: PASS actually for the first test; the file compiles. If `deadline-*` deletion hasn't happened the whole suite still passes. Treat this step as: run `bun test` — expect the existing `deadline-api.test.ts` / `deadline-db.test.ts` to be the ones we are about to remove. Proceed.

- [ ] **Step 3: Apply the wiring changes**

`index.ts`:
- Delete lines: `import { migrateDeadlines } from "./deadline-db";` and `import { deadlineApiRoutes } from "./deadline-api";`.
- Add: `import { migrateModules } from "./modules-db";` and `import { moduleApiRoutes } from "./modules-api";`.
- Replace `migrateDeadlines(db);` with `migrateModules(db, localToday());`, and make sure it runs **before** `migrateModuleItems(...)`. Change `migrateModuleItems(db);` → `migrateModuleItems(db, localToday());`.
- In the `routes` object: remove `...deadlineApiRoutes(db),`; add `...moduleApiRoutes(db),`.

Delete the files:

```bash
git rm deadline-db.ts deadline-api.ts deadline-db.test.ts deadline-api.test.ts
```

`HomeApp.tsx`:
- Remove `import { SEMESTER_DEADLINES, deadlineId, courseNameFor, noteFor } from "./semester-deadlines";` and `import type { DeadlineView } from "./deadline-api";`. (If `courseNameFor` is used elsewhere in the file, keep just that one: `import { courseNameFor } from "./semester-deadlines";` — grep first.)
- Delete `fallbackDeadlineViews` (function, ~lines 27–42) and the whole `DeadlinesPanel` component (~lines 44–160, ends at its closing `}`).
- Delete the `<DeadlinesPanel />` element (~line 371). Leave a comment placeholder: `{/* Module planner mounts here — Task 8 */}`.
- Keep `SOURCE_LABEL["module-item"] = "Deadline"` and `SOURCE_COLOR["module-item"]` untouched.

- [ ] **Step 4: Run the full suite + typecheck**

Run: `bun test && bunx tsc --noEmit`
Expected: PASS. `bun test` no longer collects `deadline-*.test.ts`. `tsc` clean (no dangling `DeadlineView` / `deadline-api` references anywhere — grep to be sure: `grep -rn "deadline-api\|deadline-db\|/api/deadlines\|DeadlinesPanel\|fallbackDeadlineViews" --include=*.ts --include=*.tsx .` returns nothing).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(printf 'refactor: retire standalone /api/deadlines, wire /api/modules into the server\n\nThe 12 legacy deadlines now seed into module_items on boot. HomeApp\nloses the read-only DeadlinesPanel; the editable planner mounts there\nin a later task.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 6: `ModulePlanner.tsx` — modules-driven groups, module CRUD, weight field

**Files:**
- Modify: `ModulePlanner.tsx`
- Modify: `index.css` (append planner-module-head + form styles)
- Verify: `bunx tsc --noEmit` + browser

**Interfaces:**
- Consumes: `GET/POST/PUT/PATCH/DELETE /api/modules` (Task 3); `POST/PUT /api/module-items` now takes `weight` (Task 4); `Module` type from `./modules-db`.
- Produces: `ModulePlanner` still takes `{ openItemId?: number | null; onOpened?: () => void }`. Internally it now renders groups from `/api/modules` and offers add/rename/hide/delete of modules and a `weight` input on the item form.

- [ ] **Step 1: Add the module API client + state**

At the top of `ModulePlanner.tsx`, add to the `api` object:

```ts
import type { Module } from "./modules-db";

const api = {
  list: () => fetch("/api/module-items").then((r) => json<ModuleItem[]>(r)),
  // …existing create/update/toggle/remove…
  modules: () => fetch("/api/modules").then((r) => json<Module[]>(r)),
  createModule: (code: string, name: string) =>
    fetch("/api/modules", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, name }),
    }).then((r) => json<Module>(r)),
  renameModule: (code: string, name: string) =>
    fetch(`/api/modules/${code}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => json<Module>(r)),
  setModuleHidden: (code: string, hidden: boolean) =>
    fetch(`/api/modules/${code}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hidden }),
    }).then((r) => json<Module>(r)),
  deleteModule: (code: string, cascade: boolean) =>
    fetch(`/api/modules/${code}${cascade ? "?cascade=1" : ""}`, { method: "DELETE" }).then((r) =>
      json<{ ok: true }>(r),
    ),
};
```

In the `ModulePlanner` component body add:

```ts
const [modules, setModules] = useState<Module[]>([]);
const [addingModule, setAddingModule] = useState(false);
const [renamingModule, setRenamingModule] = useState<string | null>(null);
const [confirmDeleteModule, setConfirmDeleteModule] = useState<string | null>(null);
const [showHiddenModules, setShowHiddenModules] = useState(false);
```

Change `refresh` to load both:

```ts
const refresh = () => {
  setError(null);
  return Promise.all([api.list(), api.modules()])
    .then(([items, mods]) => {
      setItems(items);
      setModules(mods);
    })
    .catch((err) => setError(errorMessage(err)));
};
```

- [ ] **Step 2: Replace the hard-coded course list**

Delete `const COURSE_CODES = Object.keys(COURSE_NAMES);` (and the `COURSE_NAMES` import if now unused; keep `courseNameFor` only if still referenced — replace its uses with a `modules` lookup as below).

```ts
const visibleModules = useMemo(
  () => modules.filter((m) => !m.hidden).sort((a, b) => a.sort_order - b.sort_order),
  [modules],
);
const hiddenModules = useMemo(() => modules.filter((m) => m.hidden), [modules]);
const nameOf = (code: string) => modules.find((m) => m.code === code)?.name ?? code;
```

`byCourse` memo: iterate `visibleModules` for the keys instead of `COURSE_CODES`:

```ts
const byCourse = useMemo(() => {
  const map: Record<string, ModuleItem[]> = {};
  for (const m of visibleModules) map[m.code] = [];
  for (const item of items) (map[item.course] ??= []).push(item);
  return map;
}, [items, visibleModules]);
```

Replace `COURSE_CODES.map((code) => …)` with `visibleModules.map((m) => { const code = m.code; … })` and every `courseNameFor(code)` with `nameOf(code)`.

- [ ] **Step 3: Add the module-head controls + "New module" + hidden reveal**

In each module's `.mp-course-head`, after the existing toggle button, add rename + hide:

```tsx
{renamingModule === code ? (
  <input
    className="mp-module-rename"
    defaultValue={nameOf(code)}
    autoFocus
    onBlur={(e) => {
      const v = e.target.value.trim();
      setRenamingModule(null);
      if (v && v !== nameOf(code)) api.renameModule(code, v).then(refresh).catch((err) => setError(errorMessage(err)));
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      if (e.key === "Escape") setRenamingModule(null);
    }}
  />
) : (
  <button type="button" className="board-row-review" title="Rename module" onClick={() => setRenamingModule(code)}>✎</button>
)}
<button type="button" className="board-row-review" title="Hide module" onClick={() => api.setModuleHidden(code, true).then(refresh).catch((err) => setError(errorMessage(err)))}>×</button>
```

Above the module list (near the `<p className="rule-note">`), add:

```tsx
<div className="btn-row mp-module-tools">
  <button type="button" className="btn" onClick={() => setAddingModule(true)}>+ New module</button>
  {hiddenModules.length > 0 && (
    <button type="button" className="btn" onClick={() => setShowHiddenModules((v) => !v)}>
      {showHiddenModules ? "Hide" : "Show"} hidden modules ({hiddenModules.length})
    </button>
  )}
</div>
{addingModule && (
  <form
    className="form mp-form"
    onSubmit={(e) => {
      e.preventDefault();
      const f = e.currentTarget as HTMLFormElement;
      const code = (f.elements.namedItem("code") as HTMLInputElement).value;
      const name = (f.elements.namedItem("name") as HTMLInputElement).value;
      api.createModule(code, name).then(() => { setAddingModule(false); return refresh(); }).catch((err) => setError(errorMessage(err)));
    }}
  >
    <div className="mp-form-row">
      <label>Code<input name="code" placeholder="e.g. INFO5993" autoFocus /></label>
      <label>Name<input name="name" placeholder="Full module name" /></label>
    </div>
    <div className="btn-row">
      <button type="submit" className="btn btn-primary">Add module</button>
      <button type="button" className="btn" onClick={() => setAddingModule(false)}>Cancel</button>
    </div>
  </form>
)}
{showHiddenModules && hiddenModules.map((m) => (
  <div className="mp-course mp-course-hidden" key={m.code}>
    <div className="mp-course-head">
      <span>{m.name} <span className="mp-course-code">{m.code}</span></span>
      <button type="button" className="btn" onClick={() => api.setModuleHidden(m.code, false).then(refresh).catch((err) => setError(errorMessage(err)))}>Unhide</button>
      {confirmDeleteModule === m.code ? (
        <>
          <span className="mp-confirm">Delete module &amp; its items?</span>
          <button type="button" className="btn btn-danger" onClick={() => api.deleteModule(m.code, true).then(() => { setConfirmDeleteModule(null); return refresh(); }).catch((err) => setError(errorMessage(err)))}>Yes</button>
          <button type="button" className="btn" onClick={() => setConfirmDeleteModule(null)}>No</button>
        </>
      ) : (
        <button type="button" className="btn btn-danger" onClick={() => setConfirmDeleteModule(m.code)}>Delete</button>
      )}
    </div>
  </div>
))}
```

- [ ] **Step 4: Add the `weight` field to `ItemForm`**

`ItemDraft`: add `weight: string;`. `emptyDraft`: add `weight: ""`. `draftFrom`: add `weight: item.weight ?? ""`. `toPayload`: add `weight: d.weight.trim() || undefined`.

In `ItemForm`'s first `.mp-form-row`, after the Kind `<label>`:

```tsx
<label>
  Weight (optional)
  <input type="text" value={draft.weight} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 20%" />
</label>
```

- [ ] **Step 5: Append CSS**

Add to `index.css`:

```css
.mp-module-tools { margin: 0.5rem 0 1rem; }
.mp-module-rename { font: inherit; padding: 2px 6px; }
.mp-course-hidden { opacity: 0.7; }
```

- [ ] **Step 6: Typecheck + browser verification**

Run: `bunx tsc --noEmit` → clean.

Restart the dev server, then in claude-in-chrome (`http://localhost:3005`, Modules tab for now — it still hosts the planner until Task 8):
1. Planner groups render from `/api/modules` (4 subjects). Seeded deadlines appear under the right subject with their weight shown once Task 7 renders it — for now confirm items exist per group.
2. `+ New module` → code `TEST1`, name `Test Module` → new empty group appears.
3. Add an item to `TEST1` with Weight `10%` → saved; GET `/api/module-items` (network tab) shows `weight:"10%"`.
4. `✎` on `TEST1` → rename to `Test Module 2` → persists after reload.
5. `×` on `TEST1` → drops out; `Show hidden modules (1)` → `Unhide` brings it back; hide again → `Delete` → confirm → gone, its item gone too.

- [ ] **Step 7: Commit**

```bash
git add ModulePlanner.tsx index.css
git commit -m "$(printf 'feat: modules-driven planner groups with add/rename/hide/delete + weight field\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 7: `ModulePlanner.tsx` — grouped / flat views + sorting + aging

**Files:**
- Modify: `ModulePlanner.tsx`
- Modify: `index.css`
- Verify: `bunx tsc --noEmit` + browser

**Interfaces:**
- Consumes: `items: ModuleItem[]`, `modules: Module[]` already in component state (Task 6).
- Produces: a `viewMode: "grouped" | "flat"` + `sort` control persisted to `localStorage` (`modulePlanner.view`, `modulePlanner.sort`); a shared `PlannerRow` component used by both renderers; a `visibleItems` memo applying the 3-day aging rule.

- [ ] **Step 1: Extract `PlannerRow`**

Pull the existing per-item `<li className="mp-row …">…</li>` body (the non-editing branch inside `list.map`) into a component so grouped + flat share it:

```tsx
function PlannerRow({
  item,
  moduleName,
  showModuleTag,
  onEdit,
  onToggle,
  onDelete,
  confirmingDelete,
  setConfirmingDelete,
  onRetrySync,
}: {
  item: ModuleItem;
  moduleName: string;
  showModuleTag: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  confirmingDelete: boolean;
  setConfirmingDelete: (v: number | null) => void;
  onRetrySync: () => void;
}) {
  return (
    <li id={`mp-item-${item.id}`} className={item.completed ? "mp-row mp-row-done" : "mp-row"}>
      <div className="mp-row-main">
        <input type="checkbox" checked={item.completed} onChange={onToggle}
          aria-label={item.completed ? "Mark not done" : "Mark done"} />
        <span className={`mp-kind mp-kind-${item.kind}`}>{KIND_LABEL[item.kind]}</span>
        {showModuleTag && <span className="mp-mod">{moduleName}</span>}
        <span className="mp-title">{item.title}</span>
        {item.weight && <span className="mp-weight">{item.weight}</span>}
        <span className="mp-due">{item.due_at.replace("T", " ")}</span>
        <SyncBadge item={item} />
        <span className="mp-actions">
          {item.sync_state === "error" && (
            <button type="button" className="btn" onClick={onRetrySync}>Retry sync</button>
          )}
          <button type="button" className="btn" onClick={onEdit}>Edit</button>
          {confirmingDelete ? (
            <>
              <span className="mp-confirm">Delete?</span>
              <button type="button" className="btn btn-danger" onClick={onDelete}>Yes</button>
              <button type="button" className="btn" onClick={() => setConfirmingDelete(null)}>No</button>
            </>
          ) : (
            <button type="button" className="btn btn-danger" onClick={() => setConfirmingDelete(item.id)}>Delete</button>
          )}
        </span>
      </div>
      {item.description && <p className="mp-desc">{item.description}</p>}
      {item.links.length > 0 && (
        <div className="mp-link-chips">
          {item.links.map((l, i) => (
            <a key={i} className="mp-chip" href={l.url} target="_blank" rel="noopener noreferrer">{l.label || l.url}</a>
          ))}
        </div>
      )}
    </li>
  );
}
```

Update `KIND_LABEL` to cover the new kinds: `quiz: "Quiz", exam: "Exam"`.

Rewire the grouped renderer to use `<PlannerRow>` (keeping the `editingId === item.id ? <ItemForm…> : <PlannerRow…>` branch).

- [ ] **Step 2: Add view + sort state and the aging memo**

```ts
type ViewMode = "grouped" | "flat";
type SortKey = "due-asc" | "due-desc" | "module" | "weight";

const [viewMode, setViewMode] = useState<ViewMode>(
  () => ((localStorage.getItem("modulePlanner.view") as ViewMode) ?? "grouped"),
);
const [sortKey, setSortKey] = useState<SortKey>(
  () => ((localStorage.getItem("modulePlanner.sort") as SortKey) ?? "due-asc"),
);
useEffect(() => { try { localStorage.setItem("modulePlanner.view", viewMode); } catch {} }, [viewMode]);
useEffect(() => { try { localStorage.setItem("modulePlanner.sort", sortKey); } catch {} }, [sortKey]);

const todayStr = new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

const visibleItems = useMemo(
  () =>
    items.filter((it) => {
      const due = it.due_at.slice(0, 10);
      if (!it.completed) return daysBetween(due, todayStr) <= 3;
      return daysBetween(it.updated_at, todayStr) <= 3;
    }),
  [items, todayStr],
);

const orderOf = (code: string) => modules.find((m) => m.code === code)?.sort_order ?? 999;
const weightNum = (w: string | null) => (w ? parseInt(w, 10) || 0 : -1);

const flatItems = useMemo(() => {
  const arr = [...visibleItems];
  const byDue = (a: ModuleItem, b: ModuleItem) => a.due_at.localeCompare(b.due_at) || a.id - b.id;
  arr.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    switch (sortKey) {
      case "due-asc": return byDue(a, b);
      case "due-desc": return -byDue(a, b);
      case "module": return orderOf(a.course) - orderOf(b.course) || byDue(a, b);
      case "weight": return weightNum(b.weight) - weightNum(a.weight) || byDue(a, b);
    }
  });
  return arr;
}, [visibleItems, sortKey, modules]);
```

Use `visibleItems` (not raw `items`) when building `byCourse` for the grouped view.

- [ ] **Step 3: Render the toggle + flat list**

In the `.section-head` area add:

```tsx
<div className="mp-view-toggle">
  <button type="button" className={viewMode === "grouped" ? "btn btn-primary" : "btn"} onClick={() => setViewMode("grouped")}>Grouped by subject</button>
  <button type="button" className={viewMode === "flat" ? "btn btn-primary" : "btn"} onClick={() => setViewMode("flat")}>All items</button>
  {viewMode === "flat" && (
    <select className="mp-sort" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
      <option value="due-asc">Due date — nearest first</option>
      <option value="due-desc">Due date — furthest first</option>
      <option value="module">Subject</option>
      <option value="weight">Weight</option>
    </select>
  )}
</div>
```

Wrap the existing per-module rendering in `{viewMode === "grouped" && ( … )}`, and add:

```tsx
{viewMode === "flat" && (
  <ul className="board-rows">
    {flatItems.length === 0 ? (
      <p className="board-empty">Nothing due. Add an item in the grouped view.</p>
    ) : (
      flatItems.map((item) =>
        editingId === item.id ? (
          <li key={item.id} id={`mp-item-${item.id}`}>
            <ItemForm
              initial={draftFrom(item)}
              submitLabel="Save changes"
              onCancel={() => setEditingId(null)}
              onSubmit={async (d) => { await api.update(item.id, d); setEditingId(null); await refresh(); }}
            />
          </li>
        ) : (
          <PlannerRow
            key={item.id}
            item={item}
            moduleName={nameOf(item.course)}
            showModuleTag
            confirmingDelete={confirmingDelete === item.id}
            setConfirmingDelete={setConfirmingDelete}
            onEdit={() => { setEditingId(item.id); setAddingCourse(null); }}
            onToggle={() => api.toggle(item.id).then(refresh).catch((e) => setError(errorMessage(e)))}
            onDelete={() => api.remove(item.id).then(() => { setConfirmingDelete(null); return refresh(); }).catch((e) => setError(errorMessage(e)))}
            onRetrySync={() => api.update(item.id, draftFrom(item)).then(refresh).catch((e) => setError(errorMessage(e)))}
          />
        ),
      )
    )}
  </ul>
)}
```

- [ ] **Step 4: CSS**

```css
.mp-view-toggle { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; margin-left: auto; }
.mp-sort { font: inherit; padding: 3px 6px; }
.mp-mod { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 6px; border-radius: 4px; background: var(--cat-src-goals, #c084fc); color: #1a1526; }
.mp-weight { font-size: 0.78rem; opacity: 0.75; }
```

- [ ] **Step 5: Typecheck + browser verification**

Run: `bunx tsc --noEmit` → clean. Restart dev server.

In the browser (Modules tab, planner):
1. Default view = **Grouped by subject** (or whatever was last set).
2. Click **All items** → one flat list; each row has a subject tag; nearest-due first.
3. Sort → **Due date — furthest first** → order reverses. **Weight** → 25%/35% items rise. **Subject** → grouped by module order.
4. Reload page → the flat view + chosen sort persist.
5. Tick an item done → it sinks below incomplete ones in both views.
6. An item due > 3 days ago and not done is absent from both views (seed data: the Aug-30 quizzes are already past — confirm they're hidden unless completed within 3 days).

- [ ] **Step 6: Commit**

```bash
git add ModulePlanner.tsx index.css
git commit -m "$(printf 'feat: grouped/flat planner views with sort + 3-day aging window\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 8: Move the planner to Home; strip it from the exam board; fix the deep link

**Files:**
- Modify: `HomeApp.tsx` (mount `<ModulePlanner>`, add `openItemId` prop)
- Modify: `frontend.tsx:631,709-744` (deep-link variant + prop routing)
- Modify: `exam/App.tsx:7,1130-1140,1376-1378` (remove ModulePlanner)
- Modify: `index.css` (remove now-dead `.deadline*` rules)
- Verify: `bunx tsc --noEmit` + browser

**Interfaces:**
- Consumes: `ModulePlanner` (Tasks 6–7) with `{ openItemId, onOpened }`.
- Produces: `HomeApp` gains `openItemId?: number | null`. `DeepLink`'s `module-item` case becomes `{ tab: "home"; moduleItemId: number }`. `ExamApp` loses `openItemId` / `onOpened`.

- [ ] **Step 1: Mount `ModulePlanner` on Home**

`HomeApp.tsx`:
- Add `import ModulePlanner from "./ModulePlanner";`.
- Change the component signature to accept the prop, e.g.:
  ```tsx
  export default function HomeApp({ onNavigate, openItemId }: { onNavigate: (item: DueItem) => void; openItemId?: number | null }) {
  ```
  (match the existing prop style in the file).
- Replace the `{/* Module planner mounts here — Task 8 */}` placeholder with:
  ```tsx
  <ModulePlanner openItemId={openItemId ?? null} onOpened={() => {}} />
  ```

- [ ] **Step 2: Route the deep link to Home**

`frontend.tsx`:
- `DeepLink` type: change `| { tab: "exam"; moduleItemId: number }` → `| { tab: "home"; moduleItemId: number }`.
- In `navigate`: `else if (item.source === "module-item") setDeepLink({ tab: "home", moduleItemId: item.linkId });` and update the `setTab(...)` line so `module-item` → `"home"`:
  ```ts
  setTab(item.source === "module-item" ? "home" : item.source);
  ```
- `<HomeApp>` render: add
  ```tsx
  openItemId={deepLink?.tab === "home" && "moduleItemId" in deepLink ? deepLink.moduleItemId : null}
  ```
- `<ExamApp>` render: delete the `openItemId={deepLink?.tab === "exam" && "moduleItemId" in deepLink ? deepLink.moduleItemId : null}` line.

- [ ] **Step 3: Remove `ModulePlanner` from the exam board**

`exam/App.tsx`:
- Delete `import ModulePlanner from "../ModulePlanner";` (line ~7).
- In `ExamApp`'s props type + destructure, remove `openItemId` and `onOpened` (keep `openCourse`, `openWeek`). Remove any `onOpened?.()` call that referenced the item deep link (the `openCourse`/`openWeek` effect keeps its own `onOpened?.()` — leave that; if `onOpened` is now entirely unused, drop it from the type and that effect too).
- Delete the `<ModulePlanner openItemId={openItemId ?? null} onOpened={onOpened} />` element (line ~1378) and, if it leaves an empty `<>…</>` fragment wrapping only `<section className="board" aria-label="Weeks due">`, unwrap the fragment.

- [ ] **Step 4: Remove dead CSS**

`grep -n "deadlines-panel\|deadlines-summary\|deadlines-chevron\|deadline-done\|deadline-main\|deadline-sub\|deadline-title" index.css` — delete each rule block found. **Keep** `.goal-deadline` (used by `home-api` due rows) and `.deadline-done` only if `grep -rn "deadline-done" --include=*.tsx .` still finds a use (it should not — `DeadlinesPanel` is gone).

- [ ] **Step 5: Typecheck + browser verification**

Run: `bunx tsc --noEmit` → clean. Restart dev server.

Browser:
1. **Home** page: the planner renders where "Semester deadlines" used to be, above "Everything due". Seeded deadlines show, grouped, with weights.
2. **Modules** tab: exam course tabs + "This week's papers" only — no planner section, no "paper not found".
3. On Home, open "Everything due" (or the Due-today modal) → click a row whose source is a module item (a seeded deadline) → stays on Home and the planner scrolls to + flashes that item (`mp-flash`).
4. Toggle the planner's flat view on Home → still works.

- [ ] **Step 6: Commit**

```bash
git add HomeApp.tsx frontend.tsx exam/App.tsx index.css
git commit -m "$(printf 'feat: move the module planner to the Home page\n\nExam board is exam papers only again; the "Deadline" deep link now\nlands on Home and scrolls to the item.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 9: `AnnouncementsBoard.tsx` — "＋ Add to deadlines"

**Files:**
- Modify: `AnnouncementsBoard.tsx`
- Modify: `index.css` (minor)
- Verify: `bunx tsc --noEmit` + browser

**Interfaces:**
- Consumes: `GET /api/modules` (Task 3); `POST /api/module-items` with `{course,kind,title,due_at,weight?,description}` (Task 4); `MODULE_ITEM_KINDS` from `./module-items-db`; `Module` from `./modules-db`.
- Produces: no exported API change; each announcement row gains an inline deadline form. The announcement itself is never modified.

- [ ] **Step 1: Add the modules fetch + kind labels**

In `AnnouncementsBoard.tsx`:

```ts
import { MODULE_ITEM_KINDS, type ModuleItemKind } from "./module-items-db";
import type { Module } from "./modules-db";

const KIND_LABEL: Record<ModuleItemKind, string> = {
  assignment: "Assignment", presentation: "Presentation", viva: "Viva",
  quiz: "Quiz", exam: "Exam", other: "Other",
};

// inside AnnouncementsBoard():
const [modules, setModules] = useState<Module[]>([]);
const [modulesError, setModulesError] = useState(false);
const [deadlineFor, setDeadlineFor] = useState<number | null>(null);
const [addedFor, setAddedFor] = useState<number | null>(null);

useEffect(() => {
  fetch("/api/modules")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((m: Module[]) => setModules(m.filter((x) => !x.hidden)))
    .catch(() => setModulesError(true));
}, []);
```

- [ ] **Step 2: Add the `DeadlineQuickForm` component**

```tsx
function DeadlineQuickForm({
  announcement,
  modules,
  onDone,
  onCancel,
}: {
  announcement: Announcement;
  modules: Module[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const firstLine = announcement.message.split("\n")[0]!.slice(0, 80);
  const [course, setCourse] = useState(modules[0]?.code ?? "");
  const [kind, setKind] = useState<ModuleItemKind>("assignment");
  const [title, setTitle] = useState(firstLine);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState(announcement.message);
  const [error, setError] = useState("");

  return (
    <form
      className="form mp-form announcement-deadline-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!course) return setError("Pick a module.");
        if (!title.trim()) return setError("Title is required.");
        if (!date) return setError("Due date is required.");
        try {
          const res = await fetch("/api/module-items", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              course,
              kind,
              title: title.trim(),
              due_at: time ? `${date}T${time}` : date,
              weight: weight.trim() || undefined,
              description: notes,
            }),
          });
          if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Failed");
          onDone();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      }}
    >
      <div className="mp-form-row">
        <label>Module
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            {modules.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
          </select>
        </label>
        <label>Type
          <select value={kind} onChange={(e) => setKind(e.target.value as ModuleItemKind)}>
            {MODULE_ITEM_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
        </label>
        <label>Weight<input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 10%" /></label>
      </div>
      <div className="mp-form-row">
        <label>Due date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label>Time<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
      </div>
      <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label>Notes<textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Add to deadlines</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Wire the button into each row**

In the non-editing row `<label className="board-row …">`, after the Edit/Delete buttons, add a third button and render the form + confirmation below the row:

```tsx
<button
  type="button"
  className="btn"
  disabled={modulesError}
  title={modulesError ? "Couldn't load modules" : "Add this as a deadline"}
  onClick={(e) => { e.preventDefault(); setDeadlineFor(a.id); }}
>
  + Add to deadlines
</button>
```

And just after the `</label>` (still inside the `<li>`):

```tsx
{deadlineFor === a.id && (
  <DeadlineQuickForm
    announcement={a}
    modules={modules}
    onCancel={() => setDeadlineFor(null)}
    onDone={() => { setDeadlineFor(null); setAddedFor(a.id); setTimeout(() => setAddedFor(null), 2500); }}
  />
)}
{addedFor === a.id && <p className="announcement-added">✓ Added to deadlines</p>}
```

- [ ] **Step 4: CSS**

```css
.announcement-deadline-form { margin: 0.5rem 0 0.25rem; }
.announcement-added { color: var(--ok, #3fb950); font-size: 0.85rem; margin: 0.25rem 0 0; }
```

- [ ] **Step 5: Typecheck + browser verification**

Run: `bunx tsc --noEmit` → clean. Restart dev server.

Browser (Home):
1. Each announcement row shows **＋ Add to deadlines**.
2. Click it on the "13th September is the submission for report…" row → form opens, Title pre-filled with that text (truncated), Notes pre-filled with the full message.
3. Pick module **Enterprise Scale…**, type **Presentation**, date `2026-09-13`, weight blank → **Add to deadlines**.
4. Form collapses, "✓ Added to deadlines" shows briefly.
5. Scroll to the planner → the new presentation item is under Enterprise Scale, due 2026-09-13.
6. The announcement row itself is unchanged (still there, not ticked).
7. `GET /api/announcements` (network) unchanged count.

- [ ] **Step 6: Commit**

```bash
git add AnnouncementsBoard.tsx index.css
git commit -m "$(printf 'feat: add an announcement to the deadlines from an inline form\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

---

## Task 10: End-to-end verification + cleanup sweep

**Files:**
- Possibly modify: `index.css` (residual dead rules), any file with a stray reference
- No new behaviour

- [ ] **Step 1: Reference sweep**

Run each; every one must return nothing (except `semester-deadlines.ts` itself and the seed usage inside `module-items-db.ts`):

```bash
grep -rn "deadline-api\|deadline-db\|/api/deadlines\|DeadlinesPanel\|fallbackDeadlineViews\|DeadlineView" --include=*.ts --include=*.tsx . | grep -v node_modules
grep -rn "COURSE_NAMES" --include=*.ts --include=*.tsx . | grep -v node_modules   # expect: semester-deadlines.ts (def), modules-db.ts (seed), maybe exam code — NOT ModulePlanner/HomeApp
```

Fix any leftover.

- [ ] **Step 2: Full suite + typecheck**

```bash
bun test && bunx tsc --noEmit
```
Expected: all green. Note the counts.

- [ ] **Step 3: Fresh-DB migration check**

```bash
mv leetcode.sqlite leetcode.sqlite.bak 2>/dev/null || true
PORT=3099 bun index.ts &   # fresh DB
sleep 3
curl -s localhost:3099/api/modules | head -c 300; echo
curl -s localhost:3099/api/module-items | head -c 300; echo
kill %1
mv leetcode.sqlite.bak leetcode.sqlite 2>/dev/null || true
```
Expected: 4 modules; 12 seeded items (minus any already aged out of `/api/module-items`? — `/api/module-items` returns all, so 12). Confirm weights and kinds look right.

- [ ] **Step 4: Full browser walkthrough (spec §8.3)**

Restart the real dev server (`PORT=3005`). In claude-in-chrome, run the whole checklist:
1. Home shows the planner where "Semester deadlines" was; 12 seeded deadlines grouped correctly with weights.
2. Flat view → nearest-first; change sort → reorders; reload → view + sort remembered.
3. Add an item; edit its weight; delete it; tick one off → sinks.
4. `+ New module` "TEST1 / Test Module" → appears; add an item to it; rename; hide → gone from both views; unhide; delete with its item → gone.
5. Announcement → "＋ Add to deadlines" on the "13th September…" row → pre-filled → pick subject + date → save → item appears in the planner; announcement unchanged.
6. Modules tab: exam papers only; no planner; no "paper not found".
7. Google Calendar sync still degrades gracefully with no creds (`sync_state: "error"`, no crash) — check a newly added item's badge shows "⚠ not synced", app does not error.

Capture a screenshot of the Home planner (grouped) and one of the flat view for the summary.

- [ ] **Step 5: Final commit (if any cleanup was needed)**

```bash
git add -A
git commit -m "$(printf 'chore: remove residual deadline-panel styles and references\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01DPCpgYPU82w8LYj1w6dH6v')"
```

If nothing needed changing, skip this step.

---

## Self-Review

**1. Spec coverage**

| Spec section | Task(s) |
|---|---|
| §4.1 `modules` table + seed | Task 1 |
| §4.2 `weight` column, `quiz`/`exam` kinds | Task 2 (db), Task 4 (api), Task 6 (form), Task 7 (`KIND_LABEL`) |
| §4.3 one-time seed of 12 deadlines + completion carry-over + delete-safe | Task 2 (`seedDeadlineItems` + `module_item_seeds`) |
| §4.4 retire deadline store, keep `deadline_completions` table, keep `semester-deadlines.ts` | Task 5 |
| §5.1 module-items API weight + module validation | Task 4 |
| §5.2 `/api/modules` CRUD + cascade | Task 3 |
| §6.1 planner to Home, off the exam board, deep link | Task 8 |
| §6.2 two views + sort + module CRUD + weight field + aging | Tasks 6 (CRUD, weight) + 7 (views, sort, aging) |
| §6.3 announcement → deadline inline form | Task 9 |
| §6.4 CSS (`.mp-view-toggle`, `.mp-sort`, `.mp-mod`, module-head, retire `.deadline*`) | Tasks 6, 7, 8 |
| §7 migration order (`migrateModules` before `migrateModuleItems`) | Task 5 Step 3 |
| §8.1 unit/integration tests | Tasks 1–5 (each ships its tests); `deadline-*` tests deleted in Task 5 |
| §8.2 tsc + check-mcq-lengths unaffected | every frontend task Step; exam content untouched |
| §8.3 browser verification | Task 10 Step 4 |
| §9 hooks / continuous testing / autonomous correction | Global Constraints — already wired in `.claude/settings.json`; every task relies on it |
| §10 file-by-file | File Structure section |
| §11 follow-ups | out of scope, not planned (correct) |

No gaps.

**2. Placeholder scan** — no "TBD"/"add error handling"/"similar to Task N". Every code step has real code. Browser-verification steps are enumerated, not "test it works".

**3. Type consistency**
- `migrateModules(db, today?)` / `migrateModuleItems(db, today?)` — both default `today` so Task 2/3 don't break `index.ts` before Task 5. ✓
- `Module` shape identical in Tasks 1, 3, 6, 9. ✓
- `ModuleItemKind` six-value union defined in Task 2, consumed as `MODULE_ITEM_KINDS` in Tasks 4/6/7/9. `KIND_LABEL` extended to all six in Task 7 (and re-declared locally in Task 9 with all six). ✓
- `seedDeadlineItems` / `countItemsForModule` / `deleteItemsForModule` defined in Task 2, consumed in Task 3. ✓
- `parseInput(db, body)` new signature — both call sites updated in Task 4. ✓
- Deep-link `{ tab: "home"; moduleItemId }` — produced in `frontend.tsx` and consumed by `<HomeApp openItemId=…>` in Task 8; `ExamApp` prop removed in the same task. ✓
- `weight` is `string | null` on `ModuleItem`, `string | undefined` on `ModuleItemInput` — API coerces `"" → undefined`, DB stores `undefined → null`. Consistent across Tasks 2/4/6/9. ✓
