# Goals Tracker & Home Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Goals project/deadline tracker tab and a Home dashboard tab (unified due list + calendar) to the leetcode-srs app, alongside the existing LeetCode and Theory tabs.

**Architecture:** Two new domains follow the existing per-domain module split (`{domain}-scheduling.ts` for pure date/progress logic, `{domain}-db.ts` for SQLite migration + queries, `{domain}-api.ts` for HTTP routes, `{Domain}App.tsx` for the React tab). A third new file, `home-api.ts`, has no scheduling/db module of its own — it composes existing query functions from all three domains into one aggregated "due" endpoint. Goals is built and wired first; Home is built second because its aggregation reads `goals-db.ts`.

**Tech Stack:** Bun (`Bun.serve` with HTML imports, `bun:sqlite`), React 19, `bun test`.

## Global Constraints

- Weights on Goals steps are **not** validated to sum to 100 — the UI shows the allocated sum as a hint only.
- A project auto-archives (drops off the active board) once its done steps' weights sum to ≥100, and re-activates if you un-toggle back below 100.
- A step's `due_date` is never assigned in the past: the first step is due on the project's `created_at` date (clamped to `today` if `created_at` is already in the past by the time the first step is added), and each later step is due the day after the previous step's `due_date`, likewise clamped to `today` if that would be in the past.
- `DueItem.id` from `/api/home/due` is only unique **within its `source`** (a LeetCode problem id, a Theory `concept_day`, and a Goals step id can collide as the same number) — frontend list rendering must key rows on `` `${item.source}-${item.id}` ``, never `id` alone.
- Build order is fixed: Goals (Tasks 1–6) before Home (Tasks 7–9), since `home-api.ts` imports from `goals-db.ts`.
- No change to the existing `/api/problems` or `/api/theory/*` routes or their tables — Home reads them, it doesn't modify them.

---

### Task 1: `goals-scheduling.ts` — pure step-pacing and progress logic

**Files:**
- Create: `goals-scheduling.ts`
- Test: `goals-scheduling.test.ts`

**Interfaces:**
- Consumes: `addDays` from `./scheduling` (existing, signature `addDays(date: string, days: number): string`).
- Produces: `nextStepDueDate(project: {created_at: string}, existingSteps: {due_date: string}[], today: string): string`, `projectProgress(steps: {weight: number; done: boolean}[]): number` — both used by `goals-db.ts` in Task 2/3.

- [ ] **Step 1: Write the failing tests**

```ts
// goals-scheduling.test.ts
import { test, expect } from "bun:test";
import { nextStepDueDate, projectProgress } from "./goals-scheduling";

test("first step is due the project's creation date", () => {
  expect(nextStepDueDate({ created_at: "2026-07-31" }, [], "2026-07-31")).toBe("2026-07-31");
});

test("first step is clamped to today if the project's creation date is already in the past", () => {
  expect(nextStepDueDate({ created_at: "2026-07-01" }, [], "2026-07-31")).toBe("2026-07-31");
});

test("second step is due the day after the first step's due date", () => {
  expect(
    nextStepDueDate({ created_at: "2026-07-31" }, [{ due_date: "2026-07-31" }], "2026-07-31"),
  ).toBe("2026-08-01");
});

test("a step is never backdated — clamps to today if the naive next day is already past", () => {
  expect(
    nextStepDueDate({ created_at: "2026-07-01" }, [{ due_date: "2026-07-01" }], "2026-07-31"),
  ).toBe("2026-07-31");
});

test("uses the latest existing due date, not insertion order", () => {
  expect(
    nextStepDueDate(
      { created_at: "2026-07-31" },
      [{ due_date: "2026-08-02" }, { due_date: "2026-08-01" }],
      "2026-07-31",
    ),
  ).toBe("2026-08-03");
});

test("projectProgress sums weights of done steps only", () => {
  expect(
    projectProgress([
      { weight: 20, done: true },
      { weight: 30, done: false },
      { weight: 50, done: true },
    ]),
  ).toBe(70);
});

test("projectProgress is 0 for an empty or all-undone step list", () => {
  expect(projectProgress([])).toBe(0);
  expect(projectProgress([{ weight: 20, done: false }])).toBe(0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test goals-scheduling.test.ts`
Expected: FAIL — `goals-scheduling.ts` doesn't exist yet ("Cannot find module").

- [ ] **Step 3: Write the implementation**

```ts
// goals-scheduling.ts
import { addDays } from "./scheduling";

export function nextStepDueDate(
  project: { created_at: string },
  existingSteps: { due_date: string }[],
  today: string,
): string {
  if (existingSteps.length === 0) return project.created_at < today ? today : project.created_at;
  const lastDue = existingSteps.reduce(
    (max, s) => (s.due_date > max ? s.due_date : max),
    existingSteps[0]!.due_date,
  );
  const candidate = addDays(lastDue, 1);
  return candidate < today ? today : candidate;
}

export function projectProgress(steps: { weight: number; done: boolean }[]): number {
  return steps.filter((s) => s.done).reduce((sum, s) => sum + s.weight, 0);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test goals-scheduling.test.ts`
Expected: PASS — 6 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add goals-scheduling.ts goals-scheduling.test.ts
git commit -m "Add goals-scheduling.ts: pure step due-date and progress logic"
```

---

### Task 2: `goals-db.ts` — migration and project CRUD

**Files:**
- Create: `goals-db.ts`
- Test: `goals-db.test.ts`

**Interfaces:**
- Consumes: `projectProgress` from `./goals-scheduling` (Task 1).
- Produces: `migrateGoals(db: Database): void`, `createProject(db, title: string, deadline: string, today: string): Project`, `listProjects(db: Database): Project[]`, `getProjectDetail(db: Database, id: number): ProjectDetail | null`, and exported types `Project`, `ProjectStep`, `ProjectDetail` — all consumed by Task 3 (same file), Task 4 (`goals-api.ts`), Task 6 (`GoalsApp.tsx`), Task 7 (`home-api.ts`).

- [ ] **Step 1: Write the failing tests**

```ts
// goals-db.test.ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateGoals, createProject, listProjects, getProjectDetail } from "./goals-db";

const TODAY = "2026-07-31";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db);
});

test("createProject starts unarchived with no steps", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  expect(p.title).toBe("Complete tracely onboarding");
  expect(p.deadline).toBe("2026-08-10");
  expect(p.created_at).toBe(TODAY);
  expect(p.archived).toBe(false);
});

test("migrateGoals does not reset existing data on a second call", () => {
  createProject(db, "A", "2026-08-10", TODAY);
  migrateGoals(db);
  expect(listProjects(db).length).toBe(1);
});

test("listProjects returns only active (non-archived) projects, ordered by deadline", () => {
  createProject(db, "Later", "2026-09-01", TODAY);
  createProject(db, "Sooner", "2026-08-01", TODAY);
  expect(listProjects(db).map((p) => p.title)).toEqual(["Sooner", "Later"]);
});

test("getProjectDetail returns the project with an empty step list and 0 progress", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const detail = getProjectDetail(db, p.id)!;
  expect(detail.steps).toEqual([]);
  expect(detail.progress).toBe(0);
});

test("getProjectDetail on an unknown id returns null", () => {
  expect(getProjectDetail(db, 9999)).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test goals-db.test.ts`
Expected: FAIL — `goals-db.ts` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```ts
// goals-db.ts
import type { Database } from "bun:sqlite";
import { projectProgress } from "./goals-scheduling";

export interface Project {
  id: number;
  title: string;
  deadline: string;
  created_at: string;
  archived: boolean;
}

export interface ProjectStep {
  id: number;
  project_id: number;
  label: string;
  weight: number;
  due_date: string;
  done: boolean;
  done_at: string | null;
}

export interface ProjectDetail extends Project {
  steps: ProjectStep[];
  progress: number;
}

interface ProjectRow {
  id: number;
  title: string;
  deadline: string;
  created_at: string;
  archived: number;
}

interface ProjectStepRow {
  id: number;
  project_id: number;
  label: string;
  weight: number;
  due_date: string;
  done: number;
  done_at: string | null;
}

const toProject = (row: ProjectRow): Project => ({ ...row, archived: row.archived === 1 });
const toStep = (row: ProjectStepRow): ProjectStep => ({ ...row, done: row.done === 1 });

export function migrateGoals(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      deadline TEXT NOT NULL,
      created_at TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS project_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      weight INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT
    );
  `);
}

export function createProject(db: Database, title: string, deadline: string, today: string): Project {
  const row = db
    .query(`INSERT INTO projects (title, deadline, created_at, archived) VALUES (?, ?, ?, 0) RETURNING *`)
    .get(title, deadline, today) as ProjectRow;
  return toProject(row);
}

export function listProjects(db: Database): Project[] {
  return (db.query(`SELECT * FROM projects WHERE archived = 0 ORDER BY deadline, id`).all() as ProjectRow[]).map(
    toProject,
  );
}

function getProjectRow(db: Database, id: number): ProjectRow | null {
  return db.query(`SELECT * FROM projects WHERE id = ?`).get(id) as ProjectRow | null;
}

function listStepsForProject(db: Database, projectId: number): ProjectStep[] {
  return (
    db.query(`SELECT * FROM project_steps WHERE project_id = ? ORDER BY due_date, id`).all(projectId) as ProjectStepRow[]
  ).map(toStep);
}

export function getProjectDetail(db: Database, id: number): ProjectDetail | null {
  const row = getProjectRow(db, id);
  if (!row) return null;
  const steps = listStepsForProject(db, id);
  return { ...toProject(row), steps, progress: projectProgress(steps) };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test goals-db.test.ts`
Expected: PASS — 5 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add goals-db.ts goals-db.test.ts
git commit -m "Add goals-db.ts: migration and project CRUD"
```

---

### Task 3: `goals-db.ts` — step operations (add, toggle, list due)

**Files:**
- Modify: `goals-db.ts` (append to the file created in Task 2)
- Test: `goals-db.test.ts` (append)

**Interfaces:**
- Consumes: `nextStepDueDate` from `./goals-scheduling` (Task 1); `getProjectRow`, `listStepsForProject`, `toStep`, `ProjectStepRow`, `ProjectStep`, `projectProgress` (all already in `goals-db.ts` from Task 2).
- Produces: `createStep(db, projectId: number, label: string, weight: number, today: string): ProjectStep | null`, `toggleStep(db, stepId: number, today: string): ProjectStep | null`, `listDueSteps(db, today: string): (ProjectStep & {project_title: string})[]` — consumed by Task 4 (`goals-api.ts`) and Task 7 (`home-api.ts`).

- [ ] **Step 1: Write the failing tests**

Append to `goals-db.test.ts`:

```ts
import { migrateGoals, createProject, listProjects, getProjectDetail, createStep, toggleStep, listDueSteps } from "./goals-db";
// (replaces the Task 2 import line with this expanded one)

test("createStep assigns the project's created_at as the first step's due date", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const step = createStep(db, p.id, "Complete signup page", 20, TODAY)!;
  expect(step.due_date).toBe(TODAY);
  expect(step.weight).toBe(20);
  expect(step.done).toBe(false);
});

test("createStep assigns each subsequent step the day after the previous one", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  createStep(db, p.id, "Complete signup page", 20, TODAY);
  const second = createStep(db, p.id, "Complete full test in incognito", 20, TODAY)!;
  expect(second.due_date).toBe("2026-08-01");
});

test("createStep on an unknown project returns null", () => {
  expect(createStep(db, 9999, "x", 10, TODAY)).toBeNull();
});

test("toggleStep marks a step done and stamps done_at", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const step = createStep(db, p.id, "Complete signup page", 20, TODAY)!;
  const toggled = toggleStep(db, step.id, TODAY)!;
  expect(toggled.done).toBe(true);
  expect(toggled.done_at).toBe(TODAY);
});

test("toggleStep toggles back to undone and clears done_at", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const step = createStep(db, p.id, "Complete signup page", 20, TODAY)!;
  toggleStep(db, step.id, TODAY);
  const untoggled = toggleStep(db, step.id, TODAY)!;
  expect(untoggled.done).toBe(false);
  expect(untoggled.done_at).toBeNull();
});

test("toggleStep on an unknown step returns null", () => {
  expect(toggleStep(db, 9999, TODAY)).toBeNull();
});

test("a project auto-archives once done steps' weights reach 100 and drops off listProjects", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Complete signup page", 60, TODAY)!;
  const s2 = createStep(db, p.id, "Complete full test in incognito", 40, TODAY)!;
  toggleStep(db, s1.id, TODAY);
  toggleStep(db, s2.id, TODAY);
  expect(listProjects(db)).toEqual([]);
  expect(getProjectDetail(db, p.id)!.archived).toBe(true);
});

test("un-toggling a step below 100 re-activates the project", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Complete signup page", 100, TODAY)!;
  toggleStep(db, s1.id, TODAY);
  expect(listProjects(db)).toEqual([]);
  toggleStep(db, s1.id, TODAY);
  expect(listProjects(db).length).toBe(1);
});

test("listDueSteps returns undone steps due today or earlier, joined with project title", () => {
  const p1 = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  createStep(db, p1.id, "Complete signup page", 20, TODAY);
  const p2 = createProject(db, "Later project", "2026-09-01", "2026-08-05");
  createStep(db, p2.id, "Not due yet", 20, "2026-08-05");

  const due = listDueSteps(db, TODAY);
  expect(due.length).toBe(1);
  expect(due[0]!.project_title).toBe("Complete tracely onboarding");
});

test("listDueSteps excludes steps already marked done", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const step = createStep(db, p.id, "Complete signup page", 20, TODAY)!;
  toggleStep(db, step.id, TODAY);
  expect(listDueSteps(db, TODAY)).toEqual([]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test goals-db.test.ts`
Expected: FAIL — `createStep`, `toggleStep`, `listDueSteps` are not exported yet.

- [ ] **Step 3: Write the implementation**

Append to `goals-db.ts`, and add `nextStepDueDate` to the existing import from `./goals-scheduling`:

```ts
import { nextStepDueDate, projectProgress } from "./goals-scheduling";
// (replaces the Task 2 import line)

export function createStep(
  db: Database,
  projectId: number,
  label: string,
  weight: number,
  today: string,
): ProjectStep | null {
  const project = getProjectRow(db, projectId);
  if (!project) return null;
  const existing = listStepsForProject(db, projectId);
  const dueDate = nextStepDueDate({ created_at: project.created_at }, existing, today);
  const row = db
    .query(
      `INSERT INTO project_steps (project_id, label, weight, due_date, done, done_at)
       VALUES (?, ?, ?, ?, 0, NULL) RETURNING *`,
    )
    .get(projectId, label, weight, dueDate) as ProjectStepRow;
  return toStep(row);
}

export function toggleStep(db: Database, stepId: number, today: string): ProjectStep | null {
  const stepRow = db.query(`SELECT * FROM project_steps WHERE id = ?`).get(stepId) as ProjectStepRow | null;
  if (!stepRow) return null;

  const nowDone = stepRow.done === 0;
  const updated = db
    .query(`UPDATE project_steps SET done = ?, done_at = ? WHERE id = ? RETURNING *`)
    .get(nowDone ? 1 : 0, nowDone ? today : null, stepId) as ProjectStepRow;

  const steps = listStepsForProject(db, stepRow.project_id);
  const progress = projectProgress(steps);
  db.query(`UPDATE projects SET archived = ? WHERE id = ?`).run(progress >= 100 ? 1 : 0, stepRow.project_id);

  return toStep(updated);
}

export function listDueSteps(db: Database, today: string): (ProjectStep & { project_title: string })[] {
  const rows = db
    .query(
      `SELECT s.*, p.title AS project_title
       FROM project_steps s
       JOIN projects p ON p.id = s.project_id
       WHERE s.due_date <= ? AND s.done = 0
       ORDER BY s.due_date, s.id`,
    )
    .all(today) as (ProjectStepRow & { project_title: string })[];
  return rows.map((row) => ({ ...toStep(row), project_title: row.project_title }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test goals-db.test.ts`
Expected: PASS — 14 tests total, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add goals-db.ts goals-db.test.ts
git commit -m "Add goals-db.ts step operations: createStep, toggleStep, listDueSteps"
```

---

### Task 4: `goals-api.ts` — HTTP routes

**Files:**
- Create: `goals-api.ts`
- Test: `goals-api.test.ts`

**Interfaces:**
- Consumes: `createProject`, `listProjects`, `getProjectDetail`, `createStep`, `toggleStep` from `./goals-db` (Tasks 2–3); `localToday` from `./scheduling` (existing).
- Produces: `goalsApiRoutes(db: Database)` — a Bun.serve routes object, consumed by `index.ts` (Task 5).

- [ ] **Step 1: Write the failing tests**

```ts
// goals-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";
import { localToday } from "./scheduling";

let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = new Database(":memory:");
  migrateGoals(db);
  server = Bun.serve({ port: 0, routes: goalsApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

const createProjectBody = { title: "Complete tracely onboarding", deadline: "2026-08-10" };

test("POST /api/goals creates a project due today with no steps", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(createProjectBody),
  });
  expect(res.status).toBe(201);
  const created: any = await res.json();
  expect(created.title).toBe("Complete tracely onboarding");
  expect(created.created_at).toBe(localToday());
});

test("POST /api/goals rejects a missing title or deadline", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "", deadline: "2026-08-10" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/goals lists active projects", async () => {
  await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(createProjectBody),
  });
  const body: any = await (await fetch(`${base}/api/goals`)).json();
  expect(body.length).toBe(1);
});

test("GET /api/goals/:id returns project detail with steps and progress", async () => {
  const created: any = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createProjectBody),
    })
  ).json();
  const detail: any = await (await fetch(`${base}/api/goals/${created.id}`)).json();
  expect(detail.steps).toEqual([]);
  expect(detail.progress).toBe(0);
});

test("GET /api/goals/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999`);
  expect(res.status).toBe(404);
});

test("POST /api/goals/:id/steps adds a step due today (the first step)", async () => {
  const created: any = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createProjectBody),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}/steps`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: "Complete signup page", weight: 20 }),
  });
  expect(res.status).toBe(201);
  const step: any = await res.json();
  expect(step.due_date).toBe(localToday());
  expect(step.weight).toBe(20);
});

test("POST /api/goals/:id/steps rejects a missing label or non-positive weight", async () => {
  const created: any = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createProjectBody),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}/steps`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: "x", weight: 0 }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/goals/:id/steps on an unknown project returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999/steps`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: "x", weight: 10 }),
  });
  expect(res.status).toBe(404);
});

test("POST /api/goals/steps/:stepId/toggle flips a step to done", async () => {
  const created: any = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createProjectBody),
    })
  ).json();
  const step: any = await (
    await fetch(`${base}/api/goals/${created.id}/steps`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: "Complete signup page", weight: 20 }),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/steps/${step.id}/toggle`, { method: "POST" });
  expect(res.status).toBe(200);
  const toggled: any = await res.json();
  expect(toggled.done).toBe(true);
});

test("POST /api/goals/steps/:stepId/toggle on an unknown step returns 404", async () => {
  const res = await fetch(`${base}/api/goals/steps/9999/toggle`, { method: "POST" });
  expect(res.status).toBe(404);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test goals-api.test.ts`
Expected: FAIL — `goals-api.ts` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```ts
// goals-api.ts
import type { Database } from "bun:sqlite";
import { createProject, listProjects, getProjectDetail, createStep, toggleStep } from "./goals-db";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function goalsApiRoutes(db: Database) {
  return {
    "/api/goals": {
      GET: () => json(listProjects(db)),
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { title?: unknown; deadline?: unknown } | null;
        const title = typeof body?.title === "string" ? body.title.trim() : "";
        const deadline = typeof body?.deadline === "string" ? body.deadline.trim() : "";
        if (!title || !deadline) return json({ error: "title and deadline are required" }, 400);
        return json(createProject(db, title, deadline, localToday()), 201);
      },
    },
    "/api/goals/:id": {
      GET: (req: { params: { id: string } }) => {
        const detail = getProjectDetail(db, Number(req.params.id));
        return detail ? json(detail) : json({ error: "not found" }, 404);
      },
    },
    "/api/goals/:id/steps": {
      POST: async (req: Request & { params: { id: string } }) => {
        const body = (await req.json().catch(() => null)) as { label?: unknown; weight?: unknown } | null;
        const label = typeof body?.label === "string" ? body.label.trim() : "";
        const weight = typeof body?.weight === "number" ? body.weight : NaN;
        if (!label || !Number.isFinite(weight) || weight <= 0) {
          return json({ error: "label is required and weight must be a positive number" }, 400);
        }
        const step = createStep(db, Number(req.params.id), label, weight, localToday());
        return step ? json(step, 201) : json({ error: "project not found" }, 404);
      },
    },
    "/api/goals/steps/:stepId/toggle": {
      POST: (req: { params: { stepId: string } }) => {
        const step = toggleStep(db, Number(req.params.stepId), localToday());
        return step ? json(step) : json({ error: "not found" }, 404);
      },
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test goals-api.test.ts`
Expected: PASS — 10 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add goals-api.ts goals-api.test.ts
git commit -m "Add goals-api.ts: HTTP routes for the Goals tab"
```

---

### Task 5: Wire Goals into `index.ts`

**Files:**
- Modify: `index.ts`

**Interfaces:**
- Consumes: `migrateGoals` from `./goals-db` (Task 2), `goalsApiRoutes` from `./goals-api` (Task 4).

- [ ] **Step 1: Modify `index.ts`**

Current content:

```ts
import index from "./index.html";
import { openDb } from "./db";
import { apiRoutes } from "./api";
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { localToday } from "./scheduling";

const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
migrateTheory(db, localToday());
const userscriptPath = new URL("./userscript/leetcode-sync.user.js", import.meta.url);

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    "/": index,
    "/leetcode-sync.user.js": () =>
      new Response(Bun.file(userscriptPath), {
        headers: { "content-type": "text/javascript; charset=utf-8" },
      }),
    ...apiRoutes(db),
    ...theoryApiRoutes(db),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`leetcode-srs running at ${server.url}`);
```

New content:

```ts
import index from "./index.html";
import { openDb } from "./db";
import { apiRoutes } from "./api";
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";
import { localToday } from "./scheduling";

const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
migrateTheory(db, localToday());
migrateGoals(db);
const userscriptPath = new URL("./userscript/leetcode-sync.user.js", import.meta.url);

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    "/": index,
    "/leetcode-sync.user.js": () =>
      new Response(Bun.file(userscriptPath), {
        headers: { "content-type": "text/javascript; charset=utf-8" },
      }),
    ...apiRoutes(db),
    ...theoryApiRoutes(db),
    ...goalsApiRoutes(db),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`leetcode-srs running at ${server.url}`);
```

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

Run: `bun test`
Expected: PASS — all existing tests plus Tasks 1–4's new tests, 0 failures.

- [ ] **Step 3: Smoke-test the route manually**

Run: `bun index.ts &` then `curl -s localhost:3000/api/goals` (adjust port if `PORT` is set)
Expected: `[]` (empty array — no projects yet). Then `kill %1` to stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add index.ts
git commit -m "Wire Goals routes and migration into index.ts"
```

---

### Task 6: `GoalsApp.tsx` — the Goals tab UI

**Files:**
- Create: `GoalsApp.tsx`
- Modify: `frontend.tsx`
- Modify: `index.css`

**Interfaces:**
- Consumes: types `Project`, `ProjectStep`, `ProjectDetail` from `./goals-db` (Task 2/3, type-only import — same pattern `frontend.tsx` already uses for `./db` and `TheoryApp.tsx` uses for `./theory-db`); `localToday` from `./scheduling`.
- Produces: `export default function GoalsApp()` — a React component, wired into `frontend.tsx`'s tab switch. (No deep-link props yet — those are added in Task 9.)

- [ ] **Step 1: Write `GoalsApp.tsx`**

```tsx
// GoalsApp.tsx
import React, { useEffect, useState } from "react";
import type { Project, ProjectStep, ProjectDetail } from "./goals-db";
import { localToday } from "./scheduling";

type View = { name: "board" } | { name: "add" } | { name: "detail"; projectId: number };

const api = {
  list: () => fetch("/api/goals").then((r) => r.json() as Promise<Project[]>),
  get: (id: number) => fetch(`/api/goals/${id}`).then((r) => r.json() as Promise<ProjectDetail>),
  create: (title: string, deadline: string) =>
    fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, deadline }),
    }).then((r) => r.json() as Promise<Project>),
  addStep: (projectId: number, label: string, weight: number) =>
    fetch(`/api/goals/${projectId}/steps`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label, weight }),
    }).then((r) => r.json() as Promise<ProjectStep>),
  toggleStep: (stepId: number) =>
    fetch(`/api/goals/steps/${stepId}/toggle`, { method: "POST" }).then((r) => r.json() as Promise<ProjectStep>),
};

const daysUntil = (deadline: string, today: string) =>
  Math.round((Date.parse(deadline) - Date.parse(today)) / 86_400_000);

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

function ProjectBoard({
  projects,
  today,
  onOpen,
  onAdd,
}: {
  projects: Project[];
  today: string;
  onOpen: (id: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className="board" aria-label="Active projects">
      <div className="section-head">
        <h2>Active projects</h2>
        <button className="btn btn-primary" onClick={onAdd}>+ New project</button>
      </div>
      {projects.length === 0 ? (
        <p className="board-empty">No active projects. Start one with "+ New project".</p>
      ) : (
        <ul className="board-rows">
          {projects.map((p, i) => {
            const daysLeft = daysUntil(p.deadline, today);
            const color = daysLeft < 0 ? "red" : daysLeft <= 3 ? "gold" : "green";
            return (
              <li key={p.id} style={{ animationDelay: `${i * 60}ms` }}>
                <button
                  className="board-row board-row-main"
                  style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                  onClick={() => onOpen(p.id)}
                >
                  <span className="tag">
                    {daysLeft < 0 ? `${-daysLeft}d late` : daysLeft === 0 ? "today" : `${daysLeft}d left`}
                  </span>
                  <span className="board-title">{p.title}</span>
                  <span className="goal-deadline">{p.deadline}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function NewProjectForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim() || !deadline) {
          setError("Title and deadline are both required.");
          return;
        }
        await api.create(title.trim(), deadline);
        onCreated();
      }}
    >
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Complete tracely onboarding" autoFocus />
      </label>
      <label>
        Deadline
        <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Create project</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function NewStepForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (label: string, weight: number) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        const w = Number(weight);
        if (!label.trim() || !Number.isFinite(w) || w <= 0) {
          setError("Label and a positive weight are both required.");
          return;
        }
        await onCreated(label.trim(), w);
        setLabel("");
        setWeight("");
        setError("");
      }}
    >
      <label>
        Step
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Complete signup page" autoFocus />
      </label>
      <label>
        Weight (%)
        <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="20" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">+ Add step</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ProjectDetailView({
  projectId,
  today,
  onBack,
  onChanged,
}: {
  projectId: number;
  today: string;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [addingStep, setAddingStep] = useState(false);

  const load = () => api.get(projectId).then(setDetail);
  useEffect(() => { load(); }, [projectId]);

  if (!detail) return <p className="board-empty">Loading…</p>;

  const allocated = detail.steps.reduce((sum, s) => sum + s.weight, 0);

  return (
    <article className="detail theory-card">
      <header className="detail-head">
        <h2>{detail.title}</h2>
        <span className="tag">{detail.deadline}</span>
      </header>
      <p className="detail-meta">
        <span>{detail.progress}% complete</span>
        <span>
          {allocated}% allocated across {detail.steps.length} step{detail.steps.length === 1 ? "" : "s"}
        </span>
      </p>

      <ul className="board-rows">
        {detail.steps.map((s) => {
          const overdue = !s.done && s.due_date < today;
          const color = s.done ? "green" : overdue ? "red" : "gold";
          const status = s.done
            ? "done"
            : overdue
            ? `${daysBetween(s.due_date, today)}d late`
            : s.due_date === today
            ? "today"
            : "upcoming";
          return (
            <li key={s.id}>
              <label
                className="board-row board-row-main step-row"
                style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
              >
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={async () => {
                    await api.toggleStep(s.id);
                    await load();
                    onChanged();
                  }}
                />
                <span className="tag">{status}</span>
                <span className="board-title">{s.label}</span>
                <span className="goal-weight">{s.weight}%</span>
                <span className="goal-deadline">{s.due_date}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {addingStep ? (
        <NewStepForm
          onCancel={() => setAddingStep(false)}
          onCreated={async (label, weight) => {
            await api.addStep(projectId, label, weight);
            await load();
          }}
        />
      ) : (
        <div className="btn-row">
          <button className="btn" onClick={() => setAddingStep(true)}>+ Add step</button>
          <span className="btn-spacer" />
          <button className="btn" onClick={onBack}>Back</button>
        </div>
      )}
    </article>
  );
}

export default function GoalsApp() {
  const today = localToday();
  const [view, setView] = useState<View>({ name: "board" });
  const [projects, setProjects] = useState<Project[]>([]);

  const refresh = () => api.list().then(setProjects);
  useEffect(() => { refresh(); }, []);

  return (
    <div className="goals">
      {view.name === "board" && (
        <ProjectBoard
          projects={projects}
          today={today}
          onOpen={(projectId) => setView({ name: "detail", projectId })}
          onAdd={() => setView({ name: "add" })}
        />
      )}

      {view.name === "add" && (
        <NewProjectForm
          onCancel={() => setView({ name: "board" })}
          onCreated={async () => {
            await refresh();
            setView({ name: "board" });
          }}
        />
      )}

      {view.name === "detail" && (
        <ProjectDetailView
          projectId={view.projectId}
          today={today}
          onBack={() => setView({ name: "board" })}
          onChanged={refresh}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add Goals CSS**

Append to `index.css`:

```css
/* Goals tab */
.goal-weight {
  font-family: var(--mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--dim);
  flex-shrink: 0;
}

.goal-deadline {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--dim);
  flex-shrink: 0;
}

.step-row {
  gap: 0.75rem;
  cursor: pointer;
}

.step-row input[type="checkbox"] {
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
  accent-color: var(--orange);
}
```

- [ ] **Step 3: Wire the Goals tab into `frontend.tsx`**

Add the import near the top (after the `TheoryApp` import):

```tsx
import GoalsApp from "./GoalsApp";
```

Change `type Tab = "leetcode" | "theory";` to:

```tsx
type Tab = "leetcode" | "theory" | "goals";
```

In `TabBar`, add a third button after the Theory button:

```tsx
      <button
        className={tab === "goals" ? "tab tab-active" : "tab"}
        onClick={() => onChange("goals")}
      >
        Goals
      </button>
```

Change `App`'s render from the `? :` ternary to a three-way conditional:

```tsx
function App() {
  const [tab, setTab] = useState<Tab>("leetcode");
  return (
    <div className="app">
      <TabBar tab={tab} onChange={setTab} />
      {tab === "leetcode" && <LeetCodeApp />}
      {tab === "theory" && <TheoryApp />}
      {tab === "goals" && <GoalsApp />}
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `bun test`
Expected: PASS — all tests still passing (no new automated tests for this UI task).

Run: `bun --hot index.ts` (or `bun run dev`), then open `http://localhost:3000` (or your configured `PORT`) in a browser. Click the "Goals" tab, click "+ New project", create a project with a deadline a week out, open it, add two steps (e.g. "Complete signup page" 20%, "Complete full test in incognito" 20%), and check one off — confirm the progress percentage and allocated-% hint update. Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add GoalsApp.tsx frontend.tsx index.css
git commit -m "Add Goals tab UI: project board, detail view, step tracking"
```

---

### Task 7: `home-api.ts` — unified due-item aggregation

**Files:**
- Create: `home-api.ts`
- Test: `home-api.test.ts`
- Modify: `index.ts`

**Interfaces:**
- Consumes: `listProblems` from `./db`; `listDueTheory` from `./theory-db`; `listDueSteps` from `./goals-db` (Task 3); `isDue`, `localToday` from `./scheduling`; `buildTheorySchedule` from `./theory-content`.
- Produces: `homeApiRoutes(db: Database)` and exported type `DueItem` (`{source, id, title, subtitle, dueDate, overdueDays, linkId}`), consumed by `HomeApp.tsx` (Task 8, as a locally-redeclared matching type, same as other frontend files do for server types) and `index.ts`.

- [ ] **Step 1: Write the failing tests**

```ts
// home-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem } from "./db";
import { migrateTheory } from "./theory-db";
import { migrateGoals, createProject, createStep } from "./goals-db";
import { homeApiRoutes } from "./home-api";
import { localToday, addDays } from "./scheduling";

const TODAY = localToday();
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateTheory(db, TODAY);
  migrateGoals(db);
  server = Bun.serve({ port: 0, routes: homeApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/home/due includes concept 1 by default (Theory seeds due-today on day one)", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "theory" && i.linkId === 1)).toBe(true);
});

test("GET /api/home/due includes a due LeetCode problem", async () => {
  createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const item = items.find((i) => i.source === "leetcode");
  expect(item).toBeTruthy();
  expect(item.title).toBe("Two Sum");
  expect(item.subtitle).toBe("java");
});

test("GET /api/home/due includes a due Goals step, with the project title as subtitle", async () => {
  const project = createProject(db, "Complete tracely onboarding", addDays(TODAY, 10), TODAY);
  createStep(db, project.id, "Complete signup page", 20, TODAY);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const item = items.find((i) => i.source === "goals");
  expect(item).toBeTruthy();
  expect(item.title).toBe("Complete signup page");
  expect(item.subtitle).toBe("Complete tracely onboarding");
  expect(item.linkId).toBe(project.id);
});

test("GET /api/home/due excludes a Goals step that isn't due yet", async () => {
  const project = createProject(db, "Later project", addDays(TODAY, 30), addDays(TODAY, 20));
  createStep(db, project.id, "Not due yet", 20, addDays(TODAY, 20));
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "goals")).toBe(false);
});

test("GET /api/home/due sorts all sources together by due date ascending", async () => {
  const project = createProject(db, "Complete tracely onboarding", addDays(TODAY, 10), addDays(TODAY, -5));
  createStep(db, project.id, "Overdue step", 20, addDays(TODAY, -5));
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const dueDates = items.map((i) => i.dueDate);
  expect(dueDates).toEqual([...dueDates].sort());
  expect(items[0]!.source).toBe("goals");
});

test("overdueDays is 0 for an item due today and positive for an overdue item", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const conceptOne = items.find((i) => i.source === "theory" && i.linkId === 1)!;
  expect(conceptOne.overdueDays).toBe(0);

  const project = createProject(db, "Overdue project", addDays(TODAY, 10), addDays(TODAY, -3));
  createStep(db, project.id, "Overdue step", 20, addDays(TODAY, -3));
  const items2: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const overdueItem = items2.find((i) => i.source === "goals")!;
  expect(overdueItem.overdueDays).toBe(3);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test home-api.test.ts`
Expected: FAIL — `home-api.ts` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```ts
// home-api.ts
import type { Database } from "bun:sqlite";
import { listProblems } from "./db";
import { listDueTheory } from "./theory-db";
import { listDueSteps } from "./goals-db";
import { isDue, localToday } from "./scheduling";
import { buildTheorySchedule } from "./theory-content";

const SCHEDULE = buildTheorySchedule();

export type DueSource = "leetcode" | "theory" | "goals";

export interface DueItem {
  source: DueSource;
  id: number;
  title: string;
  subtitle: string;
  dueDate: string;
  overdueDays: number;
  linkId: number;
}

function overdueDays(dueDate: string, today: string): number {
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(dueDate)) / 86_400_000));
}

function leetcodeDue(db: Database, today: string): DueItem[] {
  return listProblems(db)
    .filter((p) => isDue(p.next_review, today))
    .map((p) => ({
      source: "leetcode" as const,
      id: p.id,
      title: p.title,
      subtitle: p.language,
      dueDate: p.next_review,
      overdueDays: overdueDays(p.next_review, today),
      linkId: p.id,
    }));
}

function theoryDue(db: Database, today: string): DueItem[] {
  return listDueTheory(db, today).map((entry) => {
    const concept = SCHEDULE[entry.concept_day - 1]!;
    return {
      source: "theory" as const,
      id: entry.concept_day,
      title: concept.question,
      subtitle: concept.category,
      dueDate: entry.next_review,
      overdueDays: overdueDays(entry.next_review, today),
      linkId: entry.concept_day,
    };
  });
}

function goalsDue(db: Database, today: string): DueItem[] {
  return listDueSteps(db, today).map((step) => ({
    source: "goals" as const,
    id: step.id,
    title: step.label,
    subtitle: step.project_title,
    dueDate: step.due_date,
    overdueDays: overdueDays(step.due_date, today),
    linkId: step.project_id,
  }));
}

export function homeApiRoutes(db: Database) {
  return {
    "/api/home/due": {
      GET: () => {
        const today = localToday();
        const items = [...leetcodeDue(db, today), ...theoryDue(db, today), ...goalsDue(db, today)];
        items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        return Response.json(items);
      },
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test home-api.test.ts`
Expected: PASS — 6 tests, 0 failures.

- [ ] **Step 5: Wire into `index.ts`**

Add the import:

```ts
import { homeApiRoutes } from "./home-api";
```

Add to the routes spread, after `...goalsApiRoutes(db)`:

```ts
    ...goalsApiRoutes(db),
    ...homeApiRoutes(db),
```

- [ ] **Step 6: Run the full suite**

Run: `bun test`
Expected: PASS — all tests, 0 failures.

- [ ] **Step 7: Commit**

```bash
git add home-api.ts home-api.test.ts index.ts
git commit -m "Add home-api.ts: unified due-item aggregation across LeetCode, Theory, and Goals"
```

---

### Task 8: `HomeApp.tsx` — the Home tab UI, and move the calendar embed

**Files:**
- Create: `HomeApp.tsx`
- Modify: `frontend.tsx`

**Interfaces:**
- Consumes: `GET /api/home/due` (Task 7).
- Produces: `export default function HomeApp({onNavigate}: {onNavigate: (item: DueItem) => void})`, wired as the new default tab in `frontend.tsx`.

- [ ] **Step 1: Write `HomeApp.tsx`**

```tsx
// HomeApp.tsx
import React, { useEffect, useMemo, useState } from "react";

type DueSource = "leetcode" | "theory" | "goals";

interface DueItem {
  source: DueSource;
  id: number;
  title: string;
  subtitle: string;
  dueDate: string;
  overdueDays: number;
  linkId: number;
}

const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  theory: "Theory",
  goals: "Goals",
};

const SOURCE_COLOR: Record<DueSource, string> = {
  leetcode: "#ffa116",
  theory: "#00b8a3",
  goals: "#c084fc",
};

// Same two calendars leetcode-srs already overlays elsewhere: Adam's
// primary calendar and his university timetable import.
const EMBEDDED_CALENDARS = [
  { id: "aedamjung@gmail.com", color: "#F4511E" },
  { id: "crc3t59ndtkt77bdu0j6tv35ant0erjl@import.calendar.google.com", color: "#039BE5" },
];

function GoogleCalendarEmbed() {
  const src = useMemo(() => {
    const params = new URLSearchParams({
      mode: "MONTH",
      wkst: "2",
      ctz: "Australia/Sydney",
      showTitle: "0",
      showNav: "1",
      showDate: "1",
      showPrint: "0",
      showTabs: "1",
      showCalendars: "1",
      showTz: "0",
    });
    for (const cal of EMBEDDED_CALENDARS) {
      params.append("src", cal.id);
      params.append("color", cal.color);
    }
    return `https://calendar.google.com/calendar/embed?${params.toString()}`;
  }, []);

  return (
    <section className="calendar" aria-label="Review calendar">
      <div className="section-head">
        <h2>Calendar</h2>
      </div>
      <p className="rule-note">
        Add/Passed/Failed opens a one-click Google Calendar quick-add tab — click Save there to add it.
      </p>
      <div className="gcal-frame">
        <iframe src={src} title="Google Calendar — LeetCode reviews and study timetable" />
      </div>
    </section>
  );
}

export default function HomeApp({ onNavigate }: { onNavigate: (item: DueItem) => void }) {
  const [items, setItems] = useState<DueItem[]>([]);

  useEffect(() => {
    fetch("/api/home/due").then((r) => r.json()).then(setItems);
  }, []);

  return (
    <div className="home">
      <section className="board" aria-label="Everything due">
        <div className="section-head">
          <h2>Everything due</h2>
          <span className="board-count">{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="board-empty">Nothing due — you're all caught up.</p>
        ) : (
          <ul className="board-rows">
            {items.map((item, i) => {
              const color = item.overdueDays > 0 ? "red" : "gold";
              return (
                <li key={`${item.source}-${item.id}`} style={{ animationDelay: `${i * 60}ms` }}>
                  <button
                    className="board-row board-row-main"
                    style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                    onClick={() => onNavigate(item)}
                  >
                    <span className="tag">{item.overdueDays > 0 ? `${item.overdueDays}d late` : "due"}</span>
                    <span className="cat-tag" style={{ "--cat-color": SOURCE_COLOR[item.source] } as React.CSSProperties}>
                      {SOURCE_LABEL[item.source]}
                    </span>
                    <span className="board-title">{item.title}</span>
                    <span className="goal-deadline">{item.subtitle}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <GoogleCalendarEmbed />
    </div>
  );
}
```

- [ ] **Step 2: Remove the calendar embed from `frontend.tsx`, add the Home tab**

Delete the `EMBEDDED_CALENDARS` const and the `GoogleCalendarEmbed` function (the block starting `// Each entry is overlaid...` through the closing `}` of `GoogleCalendarEmbed`, currently just before `function ProblemForm`).

Remove the `<GoogleCalendarEmbed />` line from `LeetCodeApp`'s board-view JSX (inside the `view.name === "board"` block, right after `<DueBoard ... />`).

Add the import near the top:

```tsx
import HomeApp from "./HomeApp";
```

Change `type Tab = "leetcode" | "theory" | "goals";` to:

```tsx
type Tab = "home" | "leetcode" | "theory" | "goals";
```

In `TabBar`, add a Home button as the **first** button (before LeetCode):

```tsx
      <button
        className={tab === "home" ? "tab tab-active" : "tab"}
        onClick={() => onChange("home")}
      >
        Home
      </button>
```

Update `App` to default to Home and render it:

```tsx
function App() {
  const [tab, setTab] = useState<Tab>("home");
  return (
    <div className="app">
      <TabBar tab={tab} onChange={setTab} />
      {tab === "home" && <HomeApp onNavigate={(item) => setTab(item.source)} />}
      {tab === "leetcode" && <LeetCodeApp />}
      {tab === "theory" && <TheoryApp />}
      {tab === "goals" && <GoalsApp />}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `bun test`
Expected: PASS — all tests still passing.

Run: `bun --hot index.ts`, open the app in a browser. It should load on the Home tab, showing the calendar and a due list (at minimum concept 1 from Theory on a fresh database). Click a due item — confirm it switches to the matching tab (LeetCode/Theory/Goals). It won't yet open the specific detail view — that's Task 9. Stop the dev server afterward.

- [ ] **Step 4: Commit**

```bash
git add HomeApp.tsx frontend.tsx
git commit -m "Add Home tab: unified due list and relocated calendar embed"
```

---

### Task 9: Deep-link navigation from Home into each tab's detail view

**Files:**
- Modify: `frontend.tsx` (both `LeetCodeApp` and `App`)
- Modify: `TheoryApp.tsx`
- Modify: `GoalsApp.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `DueItem` shape from `HomeApp.tsx`'s `onNavigate` callback (Task 8).
- Produces: `LeetCodeApp({openProblemId?, onOpened?})`, `TheoryApp({openConceptDay?, onOpened?})`, `GoalsApp({openProjectId?, onOpened?})` — each opens directly to the matching detail view when the prop is set, then calls `onOpened()`.

- [ ] **Step 1: Add deep-link props to `LeetCodeApp` in `frontend.tsx`**

Change the function signature and add an effect (right after the existing `useEffect(() => { refresh(); }, []);` line):

```tsx
function LeetCodeApp({
  openProblemId,
  onOpened,
}: {
  openProblemId?: number | null;
  onOpened?: () => void;
} = {}) {
  const today = localToday();
  const [view, setView] = useState<View>({ name: "board" });
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [completedToday, setCompletedToday] = useState(0);

  const refresh = () => {
    api.list().then(setProblems);
    api.stats().then((s) => setCompletedToday(s.completedToday));
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (openProblemId != null) {
      setView({ name: "detail", id: openProblemId });
      onOpened?.();
    }
  }, [openProblemId]);

  const open = (id: number) => setView({ name: "detail", id });
  // ...rest of the function is unchanged
```

- [ ] **Step 2: Add deep-link props to `TheoryApp.tsx`**

Change `export default function TheoryApp() {` to:

```tsx
export default function TheoryApp({
  openConceptDay,
  onOpened,
}: {
  openConceptDay?: number | null;
  onOpened?: () => void;
} = {}) {
```

Add this effect right after the existing `useEffect(() => { refresh(); }, []);` line in `TheoryApp`:

```tsx
  useEffect(() => {
    if (openConceptDay != null) {
      setView({ name: "detail", conceptDay: openConceptDay });
      onOpened?.();
    }
  }, [openConceptDay]);
```

- [ ] **Step 3: Add deep-link props to `GoalsApp.tsx`**

Change `export default function GoalsApp() {` to:

```tsx
export default function GoalsApp({
  openProjectId,
  onOpened,
}: {
  openProjectId?: number | null;
  onOpened?: () => void;
} = {}) {
```

Add this effect right after the existing `useEffect(() => { refresh(); }, []);` line in `GoalsApp`:

```tsx
  useEffect(() => {
    if (openProjectId != null) {
      setView({ name: "detail", projectId: openProjectId });
      onOpened?.();
    }
  }, [openProjectId]);
```

- [ ] **Step 4: Wire deep-link state into `App` in `frontend.tsx`**

Add this type above `function App()`:

```tsx
type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "theory"; conceptDay: number }
  | { tab: "goals"; projectId: number };
```

Replace `App`'s body with:

```tsx
function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [deepLink, setDeepLink] = useState<DeepLink | null>(null);

  const navigate = (item: { source: "leetcode" | "theory" | "goals"; linkId: number }) => {
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "theory") setDeepLink({ tab: "theory", conceptDay: item.linkId });
    else setDeepLink({ tab: "goals", projectId: item.linkId });
    setTab(item.source);
  };

  return (
    <div className="app">
      <TabBar tab={tab} onChange={setTab} />
      {tab === "home" && <HomeApp onNavigate={navigate} />}
      {tab === "leetcode" && (
        <LeetCodeApp
          openProblemId={deepLink?.tab === "leetcode" ? deepLink.problemId : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
      {tab === "theory" && (
        <TheoryApp
          openConceptDay={deepLink?.tab === "theory" ? deepLink.conceptDay : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
      {tab === "goals" && (
        <GoalsApp
          openProjectId={deepLink?.tab === "goals" ? deepLink.projectId : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Document the new tabs in `README.md`**

Add, after the existing "## Theory tab" section and before "## LeetCode → Review Board userscript":

```markdown
## Goals tab

A project/deadline tracker, independent of the spaced-repetition decks.
Create a project with a title and a deadline (e.g. "Complete tracely
onboarding", due in two weeks), then break it into weighted steps (e.g.
"Complete signup page" — 20%). Each step gets its own due date
automatically — the first step is due the day you create it, and each
later step is due the day after the previous one (never backdated: if
that would land in the past, it's due today instead). Check steps off as
you finish them; a project's progress is the sum of its done steps'
weights, and it drops off the active board once that reaches 100%.
Weights aren't forced to sum to 100 — the detail view just shows how much
is allocated as a hint.

## Home tab

The default tab when the app loads. Shows the Google Calendar embed
(previously only on the LeetCode tab) plus one unified "Everything due"
list merging due/overdue items from LeetCode, Theory, and Goals, sorted
together by due date. Clicking an item jumps straight to its detail view
in the right tab, so you don't have to check three tabs separately to see
what needs attention.
```

- [ ] **Step 6: Verify**

Run: `bun test`
Expected: PASS — all tests, 0 failures.

Run: `bun --hot index.ts`, open the app. On a fresh database: from Home, click the Theory due item (concept 1) — confirm it lands directly on that concept's review screen, not just the Theory board. Create a Goals project with one step due today, go back to Home, click it — confirm it opens that project's detail view directly. Add a LeetCode problem dated so it's due today, go back to Home, click it — confirm it opens that problem's detail view directly. Stop the dev server afterward.

- [ ] **Step 7: Commit**

```bash
git add frontend.tsx TheoryApp.tsx GoalsApp.tsx README.md
git commit -m "Wire Home tab deep-linking into LeetCode, Theory, and Goals detail views"
```
