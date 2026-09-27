# Training: Goals + Races Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** add two new, DB-backed, self-serve pages under Training — **Goals**
(PB/target tracking) and **Races Calendar** (a sorted list of races, each
optionally supporting one or more goals) — with the existing Training
schedule tab, plus these two new tabs, folded into a `Training` NavGroup
dropdown.

**Architecture:** two new SQLite-backed feature modules under `training/`
(`races-db.ts`+`races-api.ts`, `goals-db.ts`+`goals-api.ts`), each following
`todo/db.ts`+`todo/api.ts`'s exact shape (migrate function, boundary
validation in the API layer only, `bun:sqlite` `RETURNING *`). Two new React
board-style pages (`RacesCalendar.tsx`, `GoalsApp.tsx`) matching
`todo/App.tsx`'s `TodoBoard`/`NewTodoForm`/`EditTodoForm` pattern. One-time
seed data from `~/Desktop/USYD/Personal/Training/powerman-classic-plan.md`.

**Tech Stack:** Bun, `bun:sqlite`, React 19, existing `index.css` utility
classes (`.board`, `.board-row`, `.tag`, `.goal-deadline`, `.form`, `.btn`) —
no new CSS classes needed.

**Spec:** `docs/superpowers/specs/2026-09-27-training-goals-races-design.md`

## Global Constraints

- Bun runtime throughout — `bun:sqlite` for storage (never `better-sqlite3`), `bun test` for tests (flat `test()`, no `describe`), `bunx tsc --noEmit` must pass with zero errors after every task.
- Boundary validation lives in `*-api.ts` only; `*-db.ts` functions trust their inputs (`~/VSCodeProjects/leetcode-srs/CLAUDE.md` "Boundaries validate, internals trust").
- New tables use `CREATE TABLE IF NOT EXISTS` — migrations are never destructive, matching every existing `migrate*` function (`migrateTodo`, `migrateJobs`, etc.).
- Seed data is one-time-guarded via a `*_meta` table with a `seeded` key (matching `jobs/db.ts`'s `seedJobsOnce`) — never re-inserted on server restart.
- `current_value`/`target_value` on `Goal` are free-text strings, never parsed or converted as numbers — nothing in this feature computes with them (per the spec's Data Model section).
- No component-level UI tests — none exist for `TodoBoard`/`JobsApp` either. UI changes are verified live in the browser, per this project's standing rule (see the final task's manual verification step).
- Every new/changed file passes `bunx tsc --noEmit` and `bun test` before its task's commit.

## Review Focus

- **A race with neither `date` nor `approx_year` set** should sort to the end of the list, not crash or produce a `NaN` comparison. Covered in Task 1's `listRaces` sort tests.
- **Seeding runs more than once** (e.g. the server restarts before ever handling a request, then restarts again) must never duplicate rows. Covered in Task 1 and Task 3's `seed*Once` tests.
- **`approxYear` sent as a non-numeric value** (e.g. `"soon"`, `12.5`) via the API must be rejected with 400, not silently coerced into a garbage `approx_year`. Covered in Task 2's validation tests.
- **A goal's `race_id` pointing at a race that no longer exists** (the race was deleted after the goal was created — there's no `ON DELETE CASCADE`) must not crash `listGoals`, and the UI's "supports: `<name>`" lookup must simply omit the tag rather than render "supports: undefined". Covered at the db level in Task 3, and by construction in Task 7 (the lookup is a `Map.get` with a fallback, not a throwing accessor).
- **Editing a race or goal to clear a previously-set optional field** (e.g. removing a `date` to make a race year-only again) must work — `updateRace`/`updateGoal` take the full input object and must accept an explicit `null`, not just an omitted key (this project's `PUT` routes replace, they don't merge, matching `updateTodo`). Covered in Task 1 and Task 3's update tests.

---

### Task 1: Races data layer

**Files:**
- Create: `training/races-db.ts`
- Create: `training/races-seed.ts`
- Test: `training/races-db.test.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces (for Task 2, Task 5, Task 3, Task 7):
  - `interface Race { id: number; name: string; discipline: string | null; location: string | null; date: string | null; approx_year: number | null; notes: string | null; created_at: string }`
  - `interface RaceInput { name: string; discipline?: string | null; location?: string | null; date?: string | null; approxYear?: number | null; notes?: string | null }`
  - `migrateRaces(db: Database): void`
  - `createRace(db: Database, input: RaceInput, today: string): Race`
  - `listRaces(db: Database): Race[]` — sorted: dated races by `date` ascending, then year-only races by `approx_year` ascending, then races with neither, by `id` ascending.
  - `updateRace(db: Database, id: number, input: RaceInput): Race | null`
  - `deleteRace(db: Database, id: number): boolean`
  - `seedRacesOnce(db: Database, rows: RaceInput[], today: string): number`
  - `RACE_SEED: RaceInput[]` (in `training/races-seed.ts`)

- [ ] **Step 1: Write the failing tests**

Create `training/races-db.test.ts`:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateRaces,
  createRace,
  listRaces,
  updateRace,
  deleteRace,
  seedRacesOnce,
  type RaceInput,
} from "./races-db";

const TODAY = "2026-09-28";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateRaces(db);
});

test("createRace stores all fields and defaults optionals to null", () => {
  const r = createRace(db, { name: "Powerman Classic" }, TODAY);
  expect(r.name).toBe("Powerman Classic");
  expect(r.discipline).toBeNull();
  expect(r.location).toBeNull();
  expect(r.date).toBeNull();
  expect(r.approx_year).toBeNull();
  expect(r.notes).toBeNull();
  expect(r.created_at).toBe(TODAY);
});

test("createRace stores all fields when given", () => {
  const r = createRace(
    db,
    {
      name: "Powerman Classic",
      discipline: "10km run / 60km bike / 10km run",
      location: "Zell am See",
      date: "2028-06-04",
      approxYear: 2028,
      notes: "Target race",
    },
    TODAY,
  );
  expect(r.discipline).toBe("10km run / 60km bike / 10km run");
  expect(r.location).toBe("Zell am See");
  expect(r.date).toBe("2028-06-04");
  expect(r.approx_year).toBe(2028);
  expect(r.notes).toBe("Target race");
});

test("migrateRaces does not reset existing data on a second call", () => {
  createRace(db, { name: "A" }, TODAY);
  migrateRaces(db);
  expect(listRaces(db).length).toBe(1);
});

test("listRaces sorts dated races before year-only races, both ascending", () => {
  createRace(db, { name: "Year 2030", approxYear: 2030 }, TODAY);
  createRace(db, { name: "Dated later", date: "2027-08-01" }, TODAY);
  createRace(db, { name: "Year 2027", approxYear: 2027 }, TODAY);
  createRace(db, { name: "Dated sooner", date: "2027-03-01" }, TODAY);
  const names = listRaces(db).map((r) => r.name);
  expect(names).toEqual(["Dated sooner", "Dated later", "Year 2027", "Year 2030"]);
});

test("listRaces sorts races with neither date nor year to the end, by id", () => {
  const first = createRace(db, { name: "No date at all" }, TODAY);
  createRace(db, { name: "Dated", date: "2027-01-01" }, TODAY);
  const second = createRace(db, { name: "Also no date" }, TODAY);
  const names = listRaces(db).map((r) => r.name);
  expect(names).toEqual(["Dated", "No date at all", "Also no date"]);
  expect(first.id).toBeLessThan(second.id);
});

test("updateRace replaces all fields, accepting explicit null to clear one", () => {
  const r = createRace(db, { name: "Original", date: "2027-01-01" }, TODAY);
  const updated = updateRace(db, r.id, { name: "Renamed", date: null, approxYear: 2027 });
  expect(updated).toEqual({
    id: r.id,
    name: "Renamed",
    discipline: null,
    location: null,
    date: null,
    approx_year: 2027,
    notes: null,
    created_at: TODAY,
  });
});

test("updateRace on an unknown id returns null", () => {
  expect(updateRace(db, 9999, { name: "X" })).toBeNull();
});

test("deleteRace removes the row and returns true", () => {
  const r = createRace(db, { name: "Delete me" }, TODAY);
  expect(deleteRace(db, r.id)).toBe(true);
  expect(listRaces(db)).toEqual([]);
});

test("deleteRace on an unknown id returns false and does not throw", () => {
  expect(deleteRace(db, 9999)).toBe(false);
});

test("seedRacesOnce inserts rows and guards against a second call", () => {
  const rows: RaceInput[] = [{ name: "Seed A" }, { name: "Seed B" }];
  expect(seedRacesOnce(db, rows, TODAY)).toBe(2);
  expect(seedRacesOnce(db, rows, TODAY)).toBe(0);
  expect(listRaces(db).length).toBe(2);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test training/races-db.test.ts`
Expected: FAIL — `Cannot find module './races-db'` (the file doesn't exist yet).

- [ ] **Step 3: Implement `training/races-db.ts`**

```ts
import type { Database } from "bun:sqlite";

export interface Race {
  id: number;
  name: string;
  discipline: string | null;
  location: string | null;
  date: string | null;
  approx_year: number | null;
  notes: string | null;
  created_at: string;
}

export interface RaceInput {
  name: string;
  discipline?: string | null;
  location?: string | null;
  date?: string | null;
  approxYear?: number | null;
  notes?: string | null;
}

export function migrateRaces(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      discipline TEXT,
      location TEXT,
      date TEXT,
      approx_year INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS races_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function createRace(db: Database, input: RaceInput, today: string): Race {
  return db
    .query(
      `INSERT INTO races (name, discipline, location, date, approx_year, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .get(
      input.name,
      input.discipline ?? null,
      input.location ?? null,
      input.date ?? null,
      input.approxYear ?? null,
      input.notes ?? null,
      today,
    ) as Race;
}

function raceSortKey(r: Race): [number, string] {
  if (r.date) return [0, r.date];
  if (r.approx_year != null) return [1, String(r.approx_year).padStart(4, "0")];
  return [2, ""];
}

function compareRaces(a: Race, b: Race): number {
  const [tierA, keyA] = raceSortKey(a);
  const [tierB, keyB] = raceSortKey(b);
  if (tierA !== tierB) return tierA - tierB;
  if (keyA !== keyB) return keyA < keyB ? -1 : 1;
  return a.id - b.id;
}

export function listRaces(db: Database): Race[] {
  const rows = db.query(`SELECT * FROM races`).all() as Race[];
  return rows.sort(compareRaces);
}

export function updateRace(db: Database, id: number, input: RaceInput): Race | null {
  const row = db
    .query(
      `UPDATE races SET name = ?, discipline = ?, location = ?, date = ?, approx_year = ?, notes = ?
       WHERE id = ? RETURNING *`,
    )
    .get(
      input.name,
      input.discipline ?? null,
      input.location ?? null,
      input.date ?? null,
      input.approxYear ?? null,
      input.notes ?? null,
      id,
    ) as Race | undefined;
  return row ?? null;
}

export function deleteRace(db: Database, id: number): boolean {
  return db.query(`DELETE FROM races WHERE id = ?`).run(id).changes > 0;
}

export function seedRacesOnce(db: Database, rows: RaceInput[], today: string): number {
  const seeded = db.query(`SELECT value FROM races_meta WHERE key = 'seeded'`).get();
  if (seeded) return 0;
  const tx = db.transaction(() => {
    for (const row of rows) createRace(db, row, today);
    db.query(`INSERT INTO races_meta (key, value) VALUES ('seeded', ?)`).run(today);
  });
  tx();
  return rows.length;
}
```

- [ ] **Step 4: Create the seed data file**

Create `training/races-seed.ts`. Both entries are copied verbatim from
`~/Desktop/USYD/Personal/Training/powerman-classic-plan.md` (target race
name and the "2027 as the rehearsal, 2028 as the real attempt" line) —
nothing here is invented:

```ts
import type { RaceInput } from "./races-db";

export const RACE_SEED: RaceInput[] = [
  {
    name: "Powerman Classic — rehearsal",
    discipline: "10km run / 60km bike / 10km run",
    approxYear: 2027,
  },
  {
    name: "Powerman Classic — target attempt",
    discipline: "10km run / 60km bike / 10km run",
    approxYear: 2028,
  },
];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test training/races-db.test.ts`
Expected: PASS, all 10 tests.

- [ ] **Step 6: Type-check**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add training/races-db.ts training/races-seed.ts training/races-db.test.ts
git commit -m "feat(training): add races data layer"
```

---

### Task 2: Races API layer

**Files:**
- Create: `training/races-api.ts`
- Test: `training/races-api.test.ts`

**Interfaces:**
- Consumes: `Race`, `RaceInput`, `migrateRaces`, `createRace`, `listRaces`, `updateRace`, `deleteRace` from `training/races-db.ts` (Task 1).
- Produces (for Task 5): `racesApiRoutes(db: Database)` — an object of Bun route handlers: `GET/POST /api/races`, `PUT/DELETE /api/races/:id`.

- [ ] **Step 1: Write the failing tests**

Create `training/races-api.test.ts`:

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateRaces } from "./races-db";
import { racesApiRoutes } from "./races-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateRaces(db);
  server = Bun.serve({ port: 0, routes: racesApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("POST /api/races creates a race and returns 201", async () => {
  const res = await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Powerman Classic", approxYear: 2027 }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.name).toBe("Powerman Classic");
  expect(body.approx_year).toBe(2027);
});

test("POST /api/races requires a non-blank name", async () => {
  const res = await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "   " }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/races rejects a non-numeric approxYear", async () => {
  const res = await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Race", approxYear: "soon" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/races rejects a malformed date", async () => {
  const res = await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Race", date: "not-a-date" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/races returns created races", async () => {
  await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Race A" }),
  });
  const res = await fetch(`${base}/api/races`);
  const body = await res.json();
  expect(body.length).toBe(1);
  expect(body[0].name).toBe("Race A");
});

test("PUT /api/races/:id updates a race", async () => {
  const created = await (
    await fetch(`${base}/api/races`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Original" }),
    })
  ).json();
  const res = await fetch(`${base}/api/races/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Renamed" }),
  });
  expect(res.status).toBe(200);
  expect((await res.json()).name).toBe("Renamed");
});

test("PUT /api/races/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/races/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "X" }),
  });
  expect(res.status).toBe(404);
});

test("DELETE /api/races/:id removes a race", async () => {
  const created = await (
    await fetch(`${base}/api/races`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Delete me" }),
    })
  ).json();
  const res = await fetch(`${base}/api/races/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);
  expect((await (await fetch(`${base}/api/races`)).json()).length).toBe(0);
});

test("DELETE /api/races/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/races/9999`, { method: "DELETE" });
  expect(res.status).toBe(404);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test training/races-api.test.ts`
Expected: FAIL — `Cannot find module './races-api'`.

- [ ] **Step 3: Implement `training/races-api.ts`**

```ts
import type { Database } from "bun:sqlite";
import { createRace, deleteRace, listRaces, updateRace, type RaceInput } from "./races-db";
import { localToday } from "../shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseRaceBody(body: unknown): { input: RaceInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "JSON body required" };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { error: "name is required" };

  const discipline = typeof b.discipline === "string" && b.discipline.trim() ? b.discipline.trim() : null;
  const location = typeof b.location === "string" && b.location.trim() ? b.location.trim() : null;
  const notes = typeof b.notes === "string" && b.notes.trim() ? b.notes.trim() : null;

  let date: string | null = null;
  if (b.date !== undefined && b.date !== null && b.date !== "") {
    if (typeof b.date !== "string" || !DATE_RE.test(b.date)) return { error: "date must be YYYY-MM-DD" };
    date = b.date;
  }

  let approxYear: number | null = null;
  if (b.approxYear !== undefined && b.approxYear !== null && b.approxYear !== "") {
    if (typeof b.approxYear !== "number" || !Number.isInteger(b.approxYear)) {
      return { error: "approxYear must be an integer" };
    }
    approxYear = b.approxYear;
  }

  return { input: { name, discipline, location, date, approxYear, notes } };
}

export function racesApiRoutes(db: Database) {
  return {
    "/api/races": {
      GET: () => json(listRaces(db)),
      POST: async (req: Request) => {
        const body = await req.json().catch(() => null);
        const parsed = parseRaceBody(body);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        return json(createRace(db, parsed.input, localToday()), 201);
      },
    },
    "/api/races/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const body = await req.json().catch(() => null);
        const parsed = parseRaceBody(body);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const updated = updateRace(db, Number(req.params.id), parsed.input);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
      DELETE: (req: { params: { id: string } }) => {
        const deleted = deleteRace(db, Number(req.params.id));
        return deleted ? json({ ok: true }) : json({ error: "not found" }, 404);
      },
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test training/races-api.test.ts`
Expected: PASS, all 9 tests.

- [ ] **Step 5: Type-check**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add training/races-api.ts training/races-api.test.ts
git commit -m "feat(training): add races API layer"
```

---

### Task 3: Goals data layer

**Files:**
- Create: `training/goals-db.ts`
- Create: `training/goals-seed.ts`
- Test: `training/goals-db.test.ts`

**Interfaces:**
- Consumes: `type Race` from `training/races-db.ts` (Task 1) — used only as the input type of `resolveGoalSeed`.
- Produces (for Task 4, Task 5, Task 7):
  - `interface Goal { id: number; title: string; current_value: string; target_value: string; target_date: string | null; race_id: number | null; notes: string | null; created_at: string }`
  - `interface GoalInput { title: string; currentValue: string; targetValue: string; targetDate?: string | null; raceId?: number | null; notes?: string | null }`
  - `interface GoalSeedInput { title: string; currentValue: string; targetValue: string; targetDate?: string | null; raceName?: string | null; notes?: string | null }`
  - `migrateGoals(db: Database): void`
  - `createGoal(db: Database, input: GoalInput, today: string): Goal`
  - `listGoals(db: Database): Goal[]` — ordered by `created_at, id` (creation order).
  - `updateGoal(db: Database, id: number, input: GoalInput): Goal | null`
  - `deleteGoal(db: Database, id: number): boolean`
  - `resolveGoalSeed(seed: GoalSeedInput[], races: Race[]): GoalInput[]` — maps each seed row's `raceName` to the matching race's real `id` (looked up by exact name match; `undefined`/no match → `raceId: null`).
  - `seedGoalsOnce(db: Database, rows: GoalInput[], today: string): number`
  - `GOAL_SEED: GoalSeedInput[]` (in `training/goals-seed.ts`)

- [ ] **Step 1: Write the failing tests**

Create `training/goals-db.test.ts`:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateGoals,
  createGoal,
  listGoals,
  updateGoal,
  deleteGoal,
  resolveGoalSeed,
  seedGoalsOnce,
  type GoalInput,
  type GoalSeedInput,
} from "./goals-db";
import type { Race } from "./races-db";

const TODAY = "2026-09-28";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db);
});

const raceRow = (overrides: Partial<Race>): Race => ({
  id: 1,
  name: "Race",
  discipline: null,
  location: null,
  date: null,
  approx_year: null,
  notes: null,
  created_at: TODAY,
  ...overrides,
});

test("createGoal stores required fields and defaults optionals to null", () => {
  const g = createGoal(db, { title: "5k PB", currentValue: "17:36", targetValue: "16:30" }, TODAY);
  expect(g.title).toBe("5k PB");
  expect(g.current_value).toBe("17:36");
  expect(g.target_value).toBe("16:30");
  expect(g.target_date).toBeNull();
  expect(g.race_id).toBeNull();
  expect(g.notes).toBeNull();
  expect(g.created_at).toBe(TODAY);
});

test("createGoal stores raceId and targetDate when given", () => {
  const g = createGoal(
    db,
    { title: "Run 1", currentValue: "40:00", targetValue: "33:30", targetDate: "2028-06-04", raceId: 7 },
    TODAY,
  );
  expect(g.target_date).toBe("2028-06-04");
  expect(g.race_id).toBe(7);
});

test("migrateGoals does not reset existing data on a second call", () => {
  createGoal(db, { title: "A", currentValue: "1", targetValue: "2" }, TODAY);
  migrateGoals(db);
  expect(listGoals(db).length).toBe(1);
});

test("listGoals orders by creation order", () => {
  createGoal(db, { title: "First", currentValue: "1", targetValue: "2" }, TODAY);
  createGoal(db, { title: "Second", currentValue: "1", targetValue: "2" }, TODAY);
  expect(listGoals(db).map((g) => g.title)).toEqual(["First", "Second"]);
});

test("listGoals does not throw when race_id points at a deleted race", () => {
  createGoal(db, { title: "Orphaned", currentValue: "1", targetValue: "2", raceId: 999 }, TODAY);
  expect(listGoals(db)[0]!.race_id).toBe(999);
});

test("updateGoal replaces all fields, accepting explicit null to clear one", () => {
  const g = createGoal(
    db,
    { title: "Original", currentValue: "1", targetValue: "2", targetDate: "2027-01-01" },
    TODAY,
  );
  const updated = updateGoal(db, g.id, { title: "Renamed", currentValue: "1", targetValue: "2", targetDate: null });
  expect(updated).toEqual({
    id: g.id,
    title: "Renamed",
    current_value: "1",
    target_value: "2",
    target_date: null,
    race_id: null,
    notes: null,
    created_at: TODAY,
  });
});

test("updateGoal on an unknown id returns null", () => {
  expect(updateGoal(db, 9999, { title: "X", currentValue: "1", targetValue: "2" })).toBeNull();
});

test("deleteGoal removes the row and returns true", () => {
  const g = createGoal(db, { title: "Delete me", currentValue: "1", targetValue: "2" }, TODAY);
  expect(deleteGoal(db, g.id)).toBe(true);
  expect(listGoals(db)).toEqual([]);
});

test("deleteGoal on an unknown id returns false and does not throw", () => {
  expect(deleteGoal(db, 9999)).toBe(false);
});

test("resolveGoalSeed maps raceName to the matching race's real id", () => {
  const races = [raceRow({ id: 5, name: "Powerman Classic — target attempt" }), raceRow({ id: 6, name: "Other race" })];
  const seed: GoalSeedInput[] = [
    { title: "Run 1", currentValue: "40:00", targetValue: "33:30", raceName: "Powerman Classic — target attempt" },
    { title: "Standalone", currentValue: "1", targetValue: "2" },
  ];
  const resolved = resolveGoalSeed(seed, races);
  expect(resolved[0]!.raceId).toBe(5);
  expect(resolved[1]!.raceId).toBeNull();
});

test("resolveGoalSeed sets raceId to null when the named race isn't found", () => {
  const resolved = resolveGoalSeed(
    [{ title: "Orphan", currentValue: "1", targetValue: "2", raceName: "Nonexistent race" }],
    [],
  );
  expect(resolved[0]!.raceId).toBeNull();
});

test("seedGoalsOnce inserts rows and guards against a second call", () => {
  const rows: GoalInput[] = [{ title: "A", currentValue: "1", targetValue: "2" }];
  expect(seedGoalsOnce(db, rows, TODAY)).toBe(1);
  expect(seedGoalsOnce(db, rows, TODAY)).toBe(0);
  expect(listGoals(db).length).toBe(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test training/goals-db.test.ts`
Expected: FAIL — `Cannot find module './goals-db'`.

- [ ] **Step 3: Implement `training/goals-db.ts`**

```ts
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
```

- [ ] **Step 4: Create the seed data file**

Create `training/goals-seed.ts`. All four entries are copied verbatim from
`~/Desktop/USYD/Personal/Training/powerman-classic-plan.md`'s "honest math"
table and FTP paragraph — nothing here is invented:

```ts
import type { GoalSeedInput } from "./goals-db";

export const GOAL_SEED: GoalSeedInput[] = [
  {
    title: "Run 1 (10km)",
    currentValue: "40:00",
    targetValue: "33:30",
    raceName: "Powerman Classic — target attempt",
  },
  {
    title: "Bike (60km)",
    currentValue: "1:45",
    targetValue: "1:28",
    raceName: "Powerman Classic — target attempt",
  },
  {
    title: "Run 2 (10km)",
    currentValue: "44:00+",
    targetValue: "35:00",
    raceName: "Powerman Classic — target attempt",
  },
  {
    title: "FTP (bike power)",
    currentValue: "~215–230W (est.)",
    targetValue: "280–300W",
  },
];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test training/goals-db.test.ts`
Expected: PASS, all 13 tests.

- [ ] **Step 6: Type-check**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add training/goals-db.ts training/goals-seed.ts training/goals-db.test.ts
git commit -m "feat(training): add goals data layer"
```

---

### Task 4: Goals API layer

**Files:**
- Create: `training/goals-api.ts`
- Test: `training/goals-api.test.ts`

**Interfaces:**
- Consumes: `Goal`, `GoalInput`, `migrateGoals`, `createGoal`, `listGoals`, `updateGoal`, `deleteGoal` from `training/goals-db.ts` (Task 3).
- Produces (for Task 5): `goalsApiRoutes(db: Database)` — `GET/POST /api/goals`, `PUT/DELETE /api/goals/:id`.

- [ ] **Step 1: Write the failing tests**

Create `training/goals-api.test.ts`:

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db);
  server = Bun.serve({ port: 0, routes: goalsApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("POST /api/goals creates a goal and returns 201", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "5k PB", currentValue: "17:36", targetValue: "16:30" }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.title).toBe("5k PB");
  expect(body.current_value).toBe("17:36");
});

test("POST /api/goals requires title, currentValue and targetValue", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "5k PB", currentValue: "", targetValue: "16:30" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/goals rejects a malformed targetDate", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "A", currentValue: "1", targetValue: "2", targetDate: "not-a-date" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/goals rejects a non-numeric raceId", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "A", currentValue: "1", targetValue: "2", raceId: "seven" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/goals returns created goals", async () => {
  await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Goal A", currentValue: "1", targetValue: "2" }),
  });
  const res = await fetch(`${base}/api/goals`);
  const body = await res.json();
  expect(body.length).toBe(1);
  expect(body[0].title).toBe("Goal A");
});

test("PUT /api/goals/:id updates a goal", async () => {
  const created = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Original", currentValue: "1", targetValue: "2" }),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Renamed", currentValue: "1", targetValue: "2" }),
  });
  expect(res.status).toBe(200);
  expect((await res.json()).title).toBe("Renamed");
});

test("PUT /api/goals/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "X", currentValue: "1", targetValue: "2" }),
  });
  expect(res.status).toBe(404);
});

test("DELETE /api/goals/:id removes a goal", async () => {
  const created = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Delete me", currentValue: "1", targetValue: "2" }),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);
  expect((await (await fetch(`${base}/api/goals`)).json()).length).toBe(0);
});

test("DELETE /api/goals/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999`, { method: "DELETE" });
  expect(res.status).toBe(404);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test training/goals-api.test.ts`
Expected: FAIL — `Cannot find module './goals-api'`.

- [ ] **Step 3: Implement `training/goals-api.ts`**

```ts
import type { Database } from "bun:sqlite";
import { createGoal, deleteGoal, listGoals, updateGoal, type GoalInput } from "./goals-db";
import { localToday } from "../shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseGoalBody(body: unknown): { input: GoalInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "JSON body required" };
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  const currentValue = typeof b.currentValue === "string" ? b.currentValue.trim() : "";
  const targetValue = typeof b.targetValue === "string" ? b.targetValue.trim() : "";
  if (!title || !currentValue || !targetValue) {
    return { error: "title, currentValue and targetValue are required" };
  }

  const notes = typeof b.notes === "string" && b.notes.trim() ? b.notes.trim() : null;

  let targetDate: string | null = null;
  if (b.targetDate !== undefined && b.targetDate !== null && b.targetDate !== "") {
    if (typeof b.targetDate !== "string" || !DATE_RE.test(b.targetDate)) {
      return { error: "targetDate must be YYYY-MM-DD" };
    }
    targetDate = b.targetDate;
  }

  let raceId: number | null = null;
  if (b.raceId !== undefined && b.raceId !== null && b.raceId !== "") {
    if (typeof b.raceId !== "number" || !Number.isInteger(b.raceId)) {
      return { error: "raceId must be an integer" };
    }
    raceId = b.raceId;
  }

  return { input: { title, currentValue, targetValue, targetDate, raceId, notes } };
}

export function goalsApiRoutes(db: Database) {
  return {
    "/api/goals": {
      GET: () => json(listGoals(db)),
      POST: async (req: Request) => {
        const body = await req.json().catch(() => null);
        const parsed = parseGoalBody(body);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        return json(createGoal(db, parsed.input, localToday()), 201);
      },
    },
    "/api/goals/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const body = await req.json().catch(() => null);
        const parsed = parseGoalBody(body);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const updated = updateGoal(db, Number(req.params.id), parsed.input);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
      DELETE: (req: { params: { id: string } }) => {
        const deleted = deleteGoal(db, Number(req.params.id));
        return deleted ? json({ ok: true }) : json({ error: "not found" }, 404);
      },
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test training/goals-api.test.ts`
Expected: PASS, all 9 tests.

- [ ] **Step 5: Type-check**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add training/goals-api.ts training/goals-api.test.ts
git commit -m "feat(training): add goals API layer"
```

---

### Task 5: Wire migrations, seeding and routes into the server

**Files:**
- Modify: `index.ts`

**Interfaces:**
- Consumes: `migrateRaces`, `seedRacesOnce`, `listRaces` from `training/races-db.ts`; `RACE_SEED` from `training/races-seed.ts`; `racesApiRoutes` from `training/races-api.ts`; `migrateGoals`, `seedGoalsOnce`, `resolveGoalSeed` from `training/goals-db.ts`; `GOAL_SEED` from `training/goals-seed.ts`; `goalsApiRoutes` from `training/goals-api.ts` (Tasks 1-4).
- Produces: nothing new for later tasks — this is the final wiring point for the server side. Task 6/7's UI pages call `/api/races` and `/api/goals`, which now exist.

- [ ] **Step 1: Add the imports**

In `index.ts`, after the existing `import { JOB_SEED } from "./jobs/seed";` line, add:

```ts
import { migrateRaces, seedRacesOnce, listRaces } from "./training/races-db";
import { racesApiRoutes } from "./training/races-api";
import { RACE_SEED } from "./training/races-seed";
import { migrateGoals, seedGoalsOnce, resolveGoalSeed } from "./training/goals-db";
import { goalsApiRoutes } from "./training/goals-api";
import { GOAL_SEED } from "./training/goals-seed";
```

- [ ] **Step 2: Migrate and seed**

Immediately after the existing `seedJobsOnce(db, JOB_SEED, localToday());` line, add:

```ts
migrateRaces(db);
migrateGoals(db);
seedRacesOnce(db, RACE_SEED, localToday());
seedGoalsOnce(db, resolveGoalSeed(GOAL_SEED, listRaces(db)), localToday());
```

Races are seeded and re-read before goals are seeded, so `resolveGoalSeed`
sees the seeded races' real autoincrement ids (whether they were just
inserted this call or already existed from a prior server start) —
`GOAL_SEED`'s `raceName: "Powerman Classic — target attempt"` entries
resolve to that race's actual `id`, never a hardcoded guess.

- [ ] **Step 3: Add the routes**

In the `routes: { ... }` object passed to `Bun.serve`, after the existing
`...jobsApiRoutes(db),` line, add:

```ts
    ...racesApiRoutes(db),
    ...goalsApiRoutes(db),
```

- [ ] **Step 4: Verify by hand**

Run: `bun test` (full suite) and `bunx tsc --noEmit`
Expected: all existing tests still pass (the new `*-db.test.ts`/`*-api.test.ts`
files from Tasks 1-4 also run as part of the full suite), zero type errors.

Then, with the dev server running (`bun --hot index.ts` or the one already
running on port 3005), confirm the new endpoints respond:

```bash
curl -s http://localhost:3005/api/races | head -c 300
curl -s http://localhost:3005/api/goals | head -c 300
```

Expected: two JSON arrays — `races` has the two seeded Powerman Classic
entries, `goals` has the four seeded goals, and the three race-linked
goals' `race_id` matches the "target attempt" race's real `id` from the
first response (not `null`, not a guessed number).

- [ ] **Step 5: Commit**

```bash
git add index.ts
git commit -m "feat(training): wire goals+races migrations, seeding and routes into the server"
```

---

### Task 6: Races Calendar page

**Files:**
- Create: `training/RacesCalendar.tsx`

**Interfaces:**
- Consumes: `type Race` from `training/races-db.ts` (Task 1); `GET/POST /api/races`, `PUT/DELETE /api/races/:id` from Task 2/5.
- Produces (for Task 8): `export default function RacesCalendar(): JSX.Element` — a self-contained page component taking no props (fetches its own data), matching `TodoApp`'s and `TrainingApp`'s shape.

- [ ] **Step 1: Implement `training/RacesCalendar.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import type { Race } from "./races-db";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong.";

interface RaceFields {
  name: string;
  discipline: string;
  location: string;
  date: string;
  approxYear: string;
  notes: string;
}

const EMPTY_FIELDS: RaceFields = { name: "", discipline: "", location: "", date: "", approxYear: "", notes: "" };

const toFields = (r: Race): RaceFields => ({
  name: r.name,
  discipline: r.discipline ?? "",
  location: r.location ?? "",
  date: r.date ?? "",
  approxYear: r.approx_year != null ? String(r.approx_year) : "",
  notes: r.notes ?? "",
});

function toBody(f: RaceFields) {
  return {
    name: f.name.trim(),
    discipline: f.discipline.trim() || null,
    location: f.location.trim() || null,
    date: f.date.trim() || null,
    approxYear: f.approxYear.trim() ? Number(f.approxYear.trim()) : null,
    notes: f.notes.trim() || null,
  };
}

const api = {
  list: () => fetch("/api/races").then((r) => json<Race[]>(r)),
  create: (f: RaceFields) =>
    fetch("/api/races", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(f)),
    }).then((r) => json<Race>(r)),
  update: (id: number, f: RaceFields) =>
    fetch(`/api/races/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(f)),
    }).then((r) => json<Race>(r)),
  remove: (id: number) => fetch(`/api/races/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
};

function dateLabel(r: Race): string {
  if (r.date) return r.date;
  if (r.approx_year != null) return `Year: ${r.approx_year} (date TBD)`;
  return "Date TBD";
}

function RaceForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: RaceFields;
  submitLabel: string;
  onSubmit: (f: RaceFields) => Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const set = (k: keyof RaceFields) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <form
      className="form"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.name.trim()) {
          setError("Name is required.");
          return;
        }
        if (f.approxYear.trim() && !/^\d{4}$/.test(f.approxYear.trim())) {
          setError("Year must be a 4-digit number.");
          return;
        }
        try {
          await onSubmit(f);
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <label>
        Name
        <input value={f.name} onChange={set("name")} placeholder="Powerman Classic" autoFocus />
      </label>
      <label>
        Discipline
        <input value={f.discipline} onChange={set("discipline")} placeholder="10km run / 60km bike / 10km run" />
      </label>
      <label>
        Location
        <input value={f.location} onChange={set("location")} placeholder="Zell am See, Austria" />
      </label>
      <label>
        Date (if known)
        <input value={f.date} onChange={set("date")} type="date" />
      </label>
      <label>
        Year (if the exact date isn't set yet)
        <input value={f.approxYear} onChange={set("approxYear")} placeholder="2027" inputMode="numeric" />
      </label>
      <label>
        Notes
        <input value={f.notes} onChange={set("notes")} placeholder="Optional" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function RacesCalendar() {
  const [races, setRaces] = useState<Race[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return api.list().then(setRaces).catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  const remove = (id: number) => {
    if (!confirm("Delete this race?")) return;
    setError(null);
    api.remove(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  return (
    <div className="races-calendar">
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add race</button>
      </div>
      {adding && (
        <RaceForm
          initial={EMPTY_FIELDS}
          submitLabel="Add race"
          onCancel={() => setAdding(false)}
          onSubmit={async (f) => {
            await api.create(f);
            setAdding(false);
            await refresh();
          }}
        />
      )}
      <section className="board" aria-label="Races">
        <div className="section-head">
          <h2>Races</h2>
          <span className="board-count">{races.length}</span>
        </div>
        {races.length === 0 ? (
          <p className="board-empty">No races yet. Add one to get started.</p>
        ) : (
          <ul className="board-rows">
            {races.map((r, i) => {
              if (r.id === editingId) {
                return (
                  <li key={r.id} style={{ animationDelay: `${i * 60}ms` }}>
                    <RaceForm
                      initial={toFields(r)}
                      submitLabel="Save"
                      onCancel={() => setEditingId(null)}
                      onSubmit={async (f) => {
                        await api.update(r.id, f);
                        setEditingId(null);
                        await refresh();
                      }}
                    />
                  </li>
                );
              }
              return (
                <li key={r.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="board-row board-row-main">
                    <span className="tag">{dateLabel(r)}</span>
                    <span className="board-title">{r.name}</span>
                    {r.discipline && <span className="goal-deadline">{r.discipline}</span>}
                    {r.location && <span className="goal-deadline">{r.location}</span>}
                    <button type="button" className="btn" onClick={() => setEditingId(r.id)}>Edit</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(r.id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Type-check and run the full test suite**

Run: `bunx tsc --noEmit`
Expected: no errors.

Run: `bun test`
Expected: all tests still pass (this task adds no new test file, but the
full suite confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add training/RacesCalendar.tsx
git commit -m "feat(training): add Races Calendar page"
```

---

### Task 7: Goals page

**Files:**
- Create: `training/GoalsApp.tsx`

**Interfaces:**
- Consumes: `type Goal` from `training/goals-db.ts` (Task 3); `type Race` from `training/races-db.ts` (Task 1); `GET/POST /api/goals`, `PUT/DELETE /api/goals/:id` from Task 4/5; `GET /api/races` from Task 2/5 (read-only, to resolve each goal's `race_id` to a display name — this page never writes to `/api/races`).
- Produces (for Task 8): `export default function GoalsApp(): JSX.Element`.

- [ ] **Step 1: Implement `training/GoalsApp.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import type { Goal } from "./goals-db";
import type { Race } from "./races-db";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong.";

interface GoalFields {
  title: string;
  currentValue: string;
  targetValue: string;
  targetDate: string;
  raceId: string;
  notes: string;
}

const EMPTY_FIELDS: GoalFields = { title: "", currentValue: "", targetValue: "", targetDate: "", raceId: "", notes: "" };

const toFields = (g: Goal): GoalFields => ({
  title: g.title,
  currentValue: g.current_value,
  targetValue: g.target_value,
  targetDate: g.target_date ?? "",
  raceId: g.race_id != null ? String(g.race_id) : "",
  notes: g.notes ?? "",
});

function toBody(f: GoalFields) {
  return {
    title: f.title.trim(),
    currentValue: f.currentValue.trim(),
    targetValue: f.targetValue.trim(),
    targetDate: f.targetDate.trim() || null,
    raceId: f.raceId.trim() ? Number(f.raceId.trim()) : null,
    notes: f.notes.trim() || null,
  };
}

const api = {
  listGoals: () => fetch("/api/goals").then((r) => json<Goal[]>(r)),
  listRaces: () => fetch("/api/races").then((r) => json<Race[]>(r)),
  create: (f: GoalFields) =>
    fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(f)),
    }).then((r) => json<Goal>(r)),
  update: (id: number, f: GoalFields) =>
    fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(f)),
    }).then((r) => json<Goal>(r)),
  remove: (id: number) => fetch(`/api/goals/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
};

function GoalForm({
  initial,
  races,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: GoalFields;
  races: Race[];
  submitLabel: string;
  onSubmit: (f: GoalFields) => Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const set = (k: keyof GoalFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <form
      className="form"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.title.trim() || !f.currentValue.trim() || !f.targetValue.trim()) {
          setError("Title, current value and target value are all required.");
          return;
        }
        try {
          await onSubmit(f);
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <label>
        Title
        <input value={f.title} onChange={set("title")} placeholder="10km run leg" autoFocus />
      </label>
      <label>
        Current
        <input value={f.currentValue} onChange={set("currentValue")} placeholder="40:00" />
      </label>
      <label>
        Target
        <input value={f.targetValue} onChange={set("targetValue")} placeholder="33:30" />
      </label>
      <label>
        Target date (optional)
        <input value={f.targetDate} onChange={set("targetDate")} type="date" />
      </label>
      <label>
        Supports race (optional)
        <select value={f.raceId} onChange={set("raceId")}>
          <option value="">None</option>
          {races.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>
      <label>
        Notes
        <input value={f.notes} onChange={set("notes")} placeholder="Optional" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function GoalsApp() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return Promise.all([api.listGoals(), api.listRaces()])
      .then(([g, r]) => {
        setGoals(g);
        setRaces(r);
      })
      .catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  const raceNameById = new Map(races.map((r) => [r.id, r.name]));

  const remove = (id: number) => {
    if (!confirm("Delete this goal?")) return;
    setError(null);
    api.remove(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  return (
    <div className="goals">
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add goal</button>
      </div>
      {adding && (
        <GoalForm
          initial={EMPTY_FIELDS}
          races={races}
          submitLabel="Add goal"
          onCancel={() => setAdding(false)}
          onSubmit={async (f) => {
            await api.create(f);
            setAdding(false);
            await refresh();
          }}
        />
      )}
      <section className="board" aria-label="Goals">
        <div className="section-head">
          <h2>Goals</h2>
          <span className="board-count">{goals.length}</span>
        </div>
        {goals.length === 0 ? (
          <p className="board-empty">No goals yet. Add one to get started.</p>
        ) : (
          <ul className="board-rows">
            {goals.map((g, i) => {
              if (g.id === editingId) {
                return (
                  <li key={g.id} style={{ animationDelay: `${i * 60}ms` }}>
                    <GoalForm
                      initial={toFields(g)}
                      races={races}
                      submitLabel="Save"
                      onCancel={() => setEditingId(null)}
                      onSubmit={async (f) => {
                        await api.update(g.id, f);
                        setEditingId(null);
                        await refresh();
                      }}
                    />
                  </li>
                );
              }
              const raceName = g.race_id != null ? raceNameById.get(g.race_id) : undefined;
              return (
                <li key={g.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="board-row board-row-main">
                    <span className="board-title">{g.title}</span>
                    <span className="goal-deadline">{g.current_value} → {g.target_value}</span>
                    {g.target_date && <span className="tag">{g.target_date}</span>}
                    {raceName && <span className="goal-deadline">supports: {raceName}</span>}
                    <button type="button" className="btn" onClick={() => setEditingId(g.id)}>Edit</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(g.id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
```

Note on the Review Focus item about a stale `race_id`: `raceNameById.get(g.race_id)`
returns `undefined` for a `race_id` that no longer matches any fetched race
(deleted race), and `{raceName && ...}` simply skips rendering the tag —
no crash, no "supports: undefined".

- [ ] **Step 2: Type-check and run the full test suite**

Run: `bunx tsc --noEmit`
Expected: no errors.

Run: `bun test`
Expected: all tests still pass (this task adds no new test file, but the
full suite confirms nothing else broke).

- [ ] **Step 3: Commit**

```bash
git add training/GoalsApp.tsx
git commit -m "feat(training): add Goals page"
```

---

### Task 8: Fold Training into a NavGroup and wire up the two new tabs

**Files:**
- Modify: `frontend.tsx`

**Interfaces:**
- Consumes: `RacesCalendar` (default export) from `training/RacesCalendar.tsx` (Task 6); `GoalsApp` (default export) from `training/GoalsApp.tsx` (Task 7); the existing `NavGroup` component already defined in `frontend.tsx` (built in the earlier nav-redesign work this same session — the `Uni`/`Jobs` dropdowns).
- Produces: nothing further — this is the final integration task.

- [ ] **Step 1: Extend the `Tab` type**

Find this line in `frontend.tsx`:

```ts
type Tab = "home" | "deadlines" | "leetcode" | "todo" | "exam" | "interview" | "jobs" | "training" | "calendar";
```

Replace it with:

```ts
type Tab = "home" | "deadlines" | "leetcode" | "todo" | "exam" | "interview" | "jobs" | "training" | "calendar" | "goals" | "races";
```

- [ ] **Step 2: Add the lazy imports**

Near the top of `frontend.tsx`, alongside the existing lazy imports:

```ts
const InterviewApp = React.lazy(() => import("./interview/App"));
const JobsApp = React.lazy(() => import("./jobs/App"));
const TrainingApp = React.lazy(() => import("./training/App"));
```

add two more:

```ts
const GoalsApp = React.lazy(() => import("./training/GoalsApp"));
const RacesCalendar = React.lazy(() => import("./training/RacesCalendar"));
```

- [ ] **Step 3: Replace the plain Training button with a `NavGroup`**

Find this block inside `TabBar`:

```tsx
      <button
        className={tab === "training" ? "tab tab-active" : "tab"}
        onClick={() => onChange("training")}
      >
        Training
      </button>
      <ThemeToggle />
```

Replace it with:

```tsx
      <NavGroup
        label="Training"
        tabs={[
          { id: "training", label: "Schedule" },
          { id: "goals", label: "Goals" },
          { id: "races", label: "Races Calendar" },
        ]}
        activeTab={tab}
        onChange={onChange}
      />
      <ThemeToggle />
```

- [ ] **Step 4: Render the two new tabs**

Find this block inside `App`'s render:

```tsx
      {tab === "training" && (
        <Suspense fallback={<p className="board-empty">Loading…</p>}>
          <TrainingApp />
        </Suspense>
      )}
```

Add immediately after it:

```tsx
      {tab === "goals" && (
        <Suspense fallback={<p className="board-empty">Loading…</p>}>
          <GoalsApp />
        </Suspense>
      )}
      {tab === "races" && (
        <Suspense fallback={<p className="board-empty">Loading…</p>}>
          <RacesCalendar />
        </Suspense>
      )}
```

- [ ] **Step 5: Type-check and run the full test suite**

Run: `bunx tsc --noEmit`
Expected: no errors.

Run: `bun test`
Expected: all tests pass (existing suite plus the new files from Tasks 1-4).

- [ ] **Step 6: Manual verification in the browser**

Per this project's standing rule, UI changes are verified live before being
called done — there is no component-level test for this step. With the dev
server running:

1. Load the app, hover/click "Training ▾" — confirm the dropdown shows
   Schedule, Goals, Races Calendar.
2. Click **Schedule** — confirm the existing weekly plan still renders
   exactly as before (this task didn't touch `training/App.tsx` or
   `training/plan.ts`).
3. Click **Goals** — confirm the four seeded goals render (Run 1, Bike,
   Run 2 all tagged "supports: Powerman Classic — target attempt"; FTP
   with no supports tag). Add a goal, edit it, delete it — confirm each
   round-trips (the list updates without a manual page reload).
4. Click **Races Calendar** — confirm the two seeded races render
   ("Year: 2027 (date TBD)" and "Year: 2028 (date TBD)", in that order).
   Add a race with a real date — confirm it sorts before the two year-only
   ones. Edit and delete a race — confirm each round-trips.
5. Confirm the "Training" group's own tab label highlights (active style)
   while on any of Schedule/Goals/Races Calendar, matching how "Uni"/"Jobs"
   already behave.

- [ ] **Step 7: Commit**

```bash
git add frontend.tsx
git commit -m "feat(training): fold Training into a NavGroup with Goals and Races Calendar tabs"
```
