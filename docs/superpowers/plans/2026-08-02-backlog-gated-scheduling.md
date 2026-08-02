# Backlog-Gated Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed calendar-precomputed Theory/Goals schedules with a shared watermark-based release gate so new concepts/steps only unlock once the visible backlog drops below a cap, instead of piling up indefinitely.

**Architecture:** A single pure function (`releaseCount`) decides how many more items to release given a domain's current backlog and remaining un-released items. Theory tracks its watermark in a new `theory_state.released_up_to` row; each Goals project tracks its own in `projects.steps_released`. Both are advanced by a small "release gate" function called on every due-list read, and existing data is backfilled once on upgrade.

**Tech Stack:** Bun, `bun:sqlite`, TypeScript, `bun test`.

## Global Constraints

- Backlog cap is a single shared constant, `MAX_ACTIVE_BACKLOG = 5`, applied independently per domain (Theory overall; each Goals project separately) — not configurable via env var or UI.
- Gating applies only to Theory and Goals. LeetCode is unchanged (problems are added ad hoc, not auto-introduced).
- Existing `srs.db` data must be retroactively re-gated: on upgrade, compute each domain's starting watermark from real progress signals (Theory: furthest concept with `rung >= 0` or a review row; Goals: per-project count of already done/due steps, capped at `MAX_ACTIVE_BACKLOG`), then run the release gate once to top up toward the cap.
- Fresh installs release up to the cap immediately (Theory day one shows 5 concepts; a new Goals project's first 5 steps all release on creation), not a slow 1/day ramp — one rule governs both fresh-start and steady state.
- Use `bun test <file>` to run tests; this repo uses Bun exclusively (no Node/jest/vitest).

---

### Task 1: Shared release-gate primitive

**Files:**
- Modify: `scheduling.ts`
- Test: `scheduling.test.ts`

**Interfaces:**
- Produces: `export const MAX_ACTIVE_BACKLOG = 5;` and `export function releaseCount(backlog: number, remaining: number, cap: number = MAX_ACTIVE_BACKLOG): number` — used by Task 2 (theory-db.ts) and Task 4 (goals-db.ts).

- [ ] **Step 1: Write the failing tests**

Append to `scheduling.test.ts`:

```ts
import { MAX_ACTIVE_BACKLOG, releaseCount } from "./scheduling";

test("MAX_ACTIVE_BACKLOG is 5", () => {
  expect(MAX_ACTIVE_BACKLOG).toBe(5);
});

test("releaseCount releases nothing once backlog meets or exceeds the cap", () => {
  expect(releaseCount(5, 100, 5)).toBe(0);
  expect(releaseCount(8, 100, 5)).toBe(0);
});

test("releaseCount fills the gap between backlog and cap", () => {
  expect(releaseCount(0, 100, 5)).toBe(5);
  expect(releaseCount(3, 100, 5)).toBe(2);
});

test("releaseCount never releases more than what's remaining", () => {
  expect(releaseCount(0, 2, 5)).toBe(2);
  expect(releaseCount(3, 1, 5)).toBe(1);
});

test("releaseCount defaults to MAX_ACTIVE_BACKLOG when no cap is given", () => {
  expect(releaseCount(0, 100)).toBe(5);
});
```

(Add `MAX_ACTIVE_BACKLOG, releaseCount` to the existing top-of-file import from `./scheduling` instead of a second import statement — combine with the existing `import { LADDER, addDays, applyReview, initialSchedule, isDue, localToday } from "./scheduling";` line.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test scheduling.test.ts`
Expected: FAIL — `MAX_ACTIVE_BACKLOG` / `releaseCount` are not exported yet.

- [ ] **Step 3: Implement `releaseCount`**

Append to `scheduling.ts`:

```ts
// Shared backlog cap for the Theory and Goals release gates — see
// docs/superpowers/specs/2026-08-01-backlog-gated-scheduling-design.md.
export const MAX_ACTIVE_BACKLOG = 5;

// backlog: currently-visible due+overdue count for the domain (or project).
// remaining: items past the watermark, still waiting to be released.
// Returns how many of those `remaining` items to release now.
export function releaseCount(
  backlog: number,
  remaining: number,
  cap: number = MAX_ACTIVE_BACKLOG,
): number {
  return Math.min(Math.max(cap - backlog, 0), remaining);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test scheduling.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add scheduling.ts scheduling.test.ts
git commit -m "Add shared releaseCount primitive for backlog-gated scheduling"
```

---

### Task 2: Theory backlog gate

**Files:**
- Modify: `theory-content.ts` (export `TOTAL_DAYS`)
- Modify: `theory-db.ts`
- Test: `theory-db.test.ts`

**Interfaces:**
- Consumes: `releaseCount`, `MAX_ACTIVE_BACKLOG` from `./scheduling` (Task 1).
- Produces: `theory_state` table (`released_up_to INTEGER`); `listDueTheory` and `countOverdueTheory` now only return/count concepts with `concept_day <= released_up_to`. No public function signatures change. `TOTAL_DAYS` becomes an exported constant from `theory-content.ts` (consumed by Task 3).

- [ ] **Step 1: Export `TOTAL_DAYS` from `theory-content.ts`**

At the end of `theory-content.ts`, after the existing `buildTheorySchedule` function, add:

```ts
export const TOTAL_DAYS = buildTheorySchedule().length;
```

- [ ] **Step 2: Rewrite `theory-db.test.ts` with the new expected behavior**

Replace the full contents of `theory-db.test.ts` with:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateTheory,
  listDueTheory,
  getTheoryConcept,
  saveTheoryAnswer,
  reviewTheoryConcept,
  countTheoryReviewsToday,
  countOverdueTheory,
  listTheoryCompletedToday,
} from "./theory-db";
import { addDays } from "./scheduling";

const TODAY = "2026-07-20";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateTheory(db, TODAY);
});

test("seeds 150 concepts, releasing the first 5 immediately (today) under the backlog cap", () => {
  expect(getTheoryConcept(db, 1)).toEqual({
    concept_day: 1,
    rung: -1,
    next_review: TODAY,
    your_answer: "",
  });
  expect(getTheoryConcept(db, 5)!.next_review).toBe(TODAY);
  // Not yet released — keeps its original calendar placeholder, unused until release.
  expect(getTheoryConcept(db, 6)!.next_review).toBe(addDays(TODAY, 5));
  expect(getTheoryConcept(db, 150)!.next_review).toBe(addDays(TODAY, 149));
});

test("migrateTheory does not reseed (and doesn't reset progress) on a second call", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  migrateTheory(db, TODAY);
  expect(getTheoryConcept(db, 1)!.rung).toBe(0);
});

test("listDueTheory on day one returns the first 5 concepts released under the cap", () => {
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});

test("listDueTheory a week later still caps at 5 if nothing has been reviewed", () => {
  // Time passing alone doesn't grow the pile — only clearing backlog does.
  const due = listDueTheory(db, addDays(TODAY, 7));
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});

test("reviewing a released concept lets the next one in, keeping the pile at the cap", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY); // concept 1 now due in 3 days, drops off
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([2, 3, 4, 5, 6]);
});

test("saveTheoryAnswer stores a draft without affecting scheduling", () => {
  const updated = saveTheoryAnswer(db, 1, "my draft")!;
  expect(updated.your_answer).toBe("my draft");
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe(TODAY);
});

test("reviewTheoryConcept 'correct' advances the rung and reschedules 3 days out the first time", () => {
  const updated = reviewTheoryConcept(db, 1, "correct", TODAY)!;
  expect(updated).toEqual({
    concept_day: 1,
    rung: 0,
    next_review: "2026-07-23",
    your_answer: "",
  });
});

test("reviewTheoryConcept 'correct' twice climbs to 5 days on the second success", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  const updated = reviewTheoryConcept(db, 1, "correct", TODAY)!;
  expect(updated.rung).toBe(1);
  expect(updated.next_review).toBe("2026-07-25");
});

test("reviewTheoryConcept 'wrong' resets rung and schedules tomorrow", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  reviewTheoryConcept(db, 1, "correct", TODAY);
  const updated = reviewTheoryConcept(db, 1, "wrong", TODAY)!;
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe("2026-07-21");
});

test("reviewTheoryConcept on an unknown concept_day returns null", () => {
  expect(reviewTheoryConcept(db, 9999, "correct", TODAY)).toBeNull();
});

test("countTheoryReviewsToday only counts today's reviews", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  reviewTheoryConcept(db, 2, "wrong", TODAY);
  reviewTheoryConcept(db, 3, "correct", "2026-07-10");
  expect(countTheoryReviewsToday(db, TODAY)).toBe(2);
});

test("countOverdueTheory counts strictly-past next_review dates among released concepts only", () => {
  expect(countOverdueTheory(db, TODAY)).toBe(0);
  // Nothing reviewed, so the pile stays at the 5 released on day one — all overdue two days later.
  expect(countOverdueTheory(db, addDays(TODAY, 2))).toBe(5);
});

test("listTheoryCompletedToday returns concepts reviewed today, deduped, ordered by concept_day", () => {
  reviewTheoryConcept(db, 1, "wrong", TODAY);
  reviewTheoryConcept(db, 1, "correct", TODAY); // second review same day, shouldn't duplicate
  reviewTheoryConcept(db, 2, "correct", "2026-07-19"); // different day, shouldn't show up

  const completed = listTheoryCompletedToday(db, TODAY);
  expect(completed.map((c) => c.concept_day)).toEqual([1]);
});

test("listTheoryCompletedToday is empty when nothing was reviewed today", () => {
  expect(listTheoryCompletedToday(db, TODAY)).toEqual([]);
});

test("migrating a pre-existing db backfills the watermark to the furthest concept actually reached, then tops up to the cap", () => {
  // Simulate an old-format db exactly as pre-migration code would have left
  // it: 150 concepts seeded with calendar-offset next_review dates, only
  // concept 1 ever actually passed. Under the old model, letting 10 days
  // pass untouched would leave concepts 1 through 11 all cluttering the due
  // list (concept N due on day N-1).
  const legacy = new Database(":memory:");
  legacy.exec(`
    CREATE TABLE theory_schedule (
      concept_day INTEGER PRIMARY KEY,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      your_answer TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE theory_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_day INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
  `);
  const insert = legacy.query(
    `INSERT INTO theory_schedule (concept_day, rung, next_review, your_answer) VALUES (?, ?, ?, '')`,
  );
  for (let day = 1; day <= 150; day++) insert.run(day, -1, addDays(TODAY, day - 1));
  legacy
    .query(`UPDATE theory_schedule SET rung = 0, next_review = ? WHERE concept_day = 1`)
    .run(addDays(TODAY, 3));
  legacy
    .query(`INSERT INTO theory_reviews (concept_day, reviewed_at, result) VALUES (1, ?, 'correct')`)
    .run(TODAY);

  const laterToday = addDays(TODAY, 10);
  migrateTheory(legacy, laterToday);

  const due = listDueTheory(legacy, laterToday);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `bun test theory-db.test.ts`
Expected: FAIL — `theory_state` table doesn't exist yet, watermark logic isn't implemented.

- [ ] **Step 4: Implement the watermark gate in `theory-db.ts`**

Replace the top of `theory-db.ts` (imports and `migrateTheory`/`seedSchedule`) with:

```ts
import type { Database } from "bun:sqlite";
import { buildTheorySchedule, TOTAL_DAYS } from "./theory-content";
import { initialTheorySchedule, applyTheoryReview, type TheoryResult } from "./theory-scheduling";
import { releaseCount } from "./scheduling";

export interface TheoryProgress {
  concept_day: number;
  rung: number;
  next_review: string;
  your_answer: string;
}

export function migrateTheory(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS theory_schedule (
      concept_day INTEGER PRIMARY KEY,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      your_answer TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS theory_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_day INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE IF NOT EXISTS theory_state (
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);

  const { count } = db.query(`SELECT COUNT(*) AS count FROM theory_schedule`).get() as {
    count: number;
  };
  const { count: stateCount } = db.query(`SELECT COUNT(*) AS count FROM theory_state`).get() as {
    count: number;
  };

  if (count === 0) {
    seedSchedule(db, today);
    db.query(`INSERT INTO theory_state (released_up_to) VALUES (0)`).run();
    runTheoryReleaseGate(db, today);
  } else if (stateCount === 0) {
    backfillReleaseWatermark(db, today);
  }
}

function seedSchedule(db: Database, today: string): void {
  const insert = db.query(
    `INSERT INTO theory_schedule (concept_day, rung, next_review, your_answer) VALUES (?, ?, ?, '')`,
  );
  for (const concept of buildTheorySchedule()) {
    const { rung, nextReview } = initialTheorySchedule(today, concept.day);
    insert.run(concept.day, rung, nextReview);
  }
}

// Sets the watermark to the furthest concept genuinely engaged with (passed
// at least once, or attempted and reset to -1) — anything past that,
// including concepts that were just sitting in the due list untouched, is
// pulled back into the gated queue.
function backfillReleaseWatermark(db: Database, today: string): void {
  const { frontier } = db
    .query(
      `SELECT COALESCE(MAX(concept_day), 0) AS frontier FROM theory_schedule
       WHERE rung >= 0 OR concept_day IN (SELECT DISTINCT concept_day FROM theory_reviews)`,
    )
    .get() as { frontier: number };
  db.query(`INSERT INTO theory_state (released_up_to) VALUES (?)`).run(frontier);
  runTheoryReleaseGate(db, today);
}

// Advances the watermark to bring the visible backlog back up to the cap,
// stamping each newly-released concept's next_review as today. Idempotent —
// safe to call on every read.
function runTheoryReleaseGate(db: Database, today: string): void {
  const { released_up_to } = db.query(`SELECT released_up_to FROM theory_state`).get() as {
    released_up_to: number;
  };
  const { n: backlog } = db
    .query(`SELECT COUNT(*) AS n FROM theory_schedule WHERE concept_day <= ? AND next_review <= ?`)
    .get(released_up_to, today) as { n: number };
  const remaining = TOTAL_DAYS - released_up_to;
  const toRelease = releaseCount(backlog, remaining);
  if (toRelease === 0) return;

  const newUpTo = released_up_to + toRelease;
  db.query(`UPDATE theory_schedule SET next_review = ? WHERE concept_day > ? AND concept_day <= ?`).run(
    today,
    released_up_to,
    newUpTo,
  );
  db.query(`UPDATE theory_state SET released_up_to = ?`).run(newUpTo);
}
```

Then update `listDueTheory` and `countOverdueTheory` further down in the same file:

```ts
// Everything due today or overdue among *released* concepts — capped at
// MAX_ACTIVE_BACKLOG by the release gate, not unbounded.
export function listDueTheory(db: Database, today: string): TheoryProgress[] {
  runTheoryReleaseGate(db, today);
  return db
    .query(
      `SELECT concept_day, rung, next_review, your_answer FROM theory_schedule
       WHERE concept_day <= (SELECT released_up_to FROM theory_state) AND next_review <= ?
       ORDER BY next_review, concept_day`,
    )
    .all(today) as TheoryProgress[];
}
```

```ts
export function countOverdueTheory(db: Database, today: string): number {
  runTheoryReleaseGate(db, today);
  const row = db
    .query(
      `SELECT COUNT(*) AS n FROM theory_schedule
       WHERE concept_day <= (SELECT released_up_to FROM theory_state) AND next_review < ?`,
    )
    .get(today) as { n: number };
  return row.n;
}
```

Leave `getTheoryConcept`, `saveTheoryAnswer`, `reviewTheoryConcept`, `countTheoryReviewsToday`, and `listTheoryCompletedToday` unchanged — they operate on a specific `concept_day` or on review history, not on the watermark.

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test theory-db.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 6: Commit**

```bash
git add theory-content.ts theory-db.ts theory-db.test.ts
git commit -m "Gate Theory concept introduction on backlog via a watermark"
```

---

### Task 3: Theory API alignment

**Files:**
- Modify: `theory-api.ts`
- Test: `theory-api.test.ts`

**Interfaces:**
- Consumes: `TOTAL_DAYS` from `./theory-content` (Task 2).

- [ ] **Step 1: Use the shared `TOTAL_DAYS` in `theory-api.ts`**

In `theory-api.ts`, replace:

```ts
import { buildTheorySchedule } from "./theory-content";
import { localToday } from "./scheduling";

const TOTAL_DAYS = buildTheorySchedule().length;
```

with:

```ts
import { TOTAL_DAYS } from "./theory-content";
import { localToday } from "./scheduling";
```

- [ ] **Step 2: Update the failing assertions in `theory-api.test.ts`**

Replace the first test (`"GET /api/theory/due starts with only concept 1 due, no overdue, nothing completed"`) with:

```ts
test("GET /api/theory/due starts with the first 5 concepts released under the cap, no overdue, nothing completed", async () => {
  const body: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(body.due.map((d: any) => d.concept_day)).toEqual([1, 2, 3, 4, 5]);
  expect(body.stats).toEqual({ dueCount: 5, overdueCount: 0, completedToday: 0 });
});
```

Replace the third test (`"POST /api/theory/:day/review 'correct' advances rung 3 days out and drops off today's due list"`) with:

```ts
test("POST /api/theory/:day/review 'correct' advances rung 3 days out, and the next concept fills the vacated slot", async () => {
  const res = await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  expect(res.status).toBe(200);
  const updated: any = await res.json();
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(localToday(), 3));

  const due: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(due.due.map((d: any) => d.concept_day)).toEqual([2, 3, 4, 5, 6]);
  expect(due.stats.completedToday).toBe(1);
});
```

Leave every other test in the file unchanged (the "wrong" review test, the bad-result-value test, the completed-today test, and the out-of-range test don't depend on how many concepts are released).

- [ ] **Step 3: Run tests**

Run: `bun test theory-api.test.ts`
Expected: PASS, all tests green (this task is a pure alignment — Task 2 already implemented the underlying behavior).

- [ ] **Step 4: Commit**

```bash
git add theory-api.ts theory-api.test.ts
git commit -m "Align theory-api tests with backlog-gated due counts"
```

---

### Task 4: Goals backlog gate

**Files:**
- Modify: `goals-scheduling.ts` (remove `nextStepDueDate`)
- Modify: `goals-scheduling.test.ts` (remove its tests)
- Modify: `goals-db.ts`
- Test: `goals-db.test.ts`

**Interfaces:**
- Consumes: `releaseCount`, `MAX_ACTIVE_BACKLOG` from `./scheduling` (Task 1).
- Produces: `migrateGoals(db: Database, today: string): void` — **signature change**, now requires `today` (consumed by Task 5's call-site updates). `projects.steps_released` column. `listDueSteps` now only returns steps within each project's release watermark.

- [ ] **Step 1: Remove `nextStepDueDate` — it's replaced by the release gate**

Replace the full contents of `goals-scheduling.ts` with:

```ts
export function projectProgress(steps: { weight: number; done: boolean }[]): number {
  return steps.filter((s) => s.done).reduce((sum, s) => sum + s.weight, 0);
}
```

Replace the full contents of `goals-scheduling.test.ts` with:

```ts
import { test, expect } from "bun:test";
import { projectProgress } from "./goals-scheduling";

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

Run: `bun test goals-scheduling.test.ts`
Expected: PASS (this step is a pure deletion, nothing new to fail first).

- [ ] **Step 2: Write the failing tests for `goals-db.ts`**

In `goals-db.test.ts`:
1. Change the import line to add `addDays`: `import { addDays } from "./scheduling";` (new import, alongside the existing `goals-db` import).
2. Change every `migrateGoals(db)` call (in `beforeEach` and in the "does not reset existing data" test) to `migrateGoals(db, TODAY)`.
3. Replace the test `"createStep assigns each subsequent step the day after the previous one"` with:

```ts
test("createStep releases each subsequent step immediately too, while the project is under the backlog cap", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  createStep(db, p.id, "Complete signup page", 20, TODAY);
  const second = createStep(db, p.id, "Complete full test in incognito", 20, TODAY)!;
  expect(second.due_date).toBe(TODAY);
});
```

4. Add two new tests, after the `listDueSteps` tests:

```ts
test("a step past the backlog cap stays hidden from the due list until earlier steps clear", () => {
  const p = createProject(db, "Big project", "2026-09-01", TODAY);
  const steps = Array.from({ length: 6 }, (_, i) => createStep(db, p.id, `Step ${i + 1}`, 10, TODAY)!);

  const due = listDueSteps(db, TODAY);
  expect(due.map((s) => s.id)).toEqual(steps.slice(0, 5).map((s) => s.id));

  toggleStep(db, steps[0]!.id, TODAY);
  const dueAfter = listDueSteps(db, TODAY);
  expect(dueAfter.length).toBe(5);
  expect(dueAfter.map((s) => s.id)).toContain(steps[5]!.id);
});

test("migrating a pre-existing db backfills steps_released from already-due/done steps, capped at the backlog limit", () => {
  const legacy = new Database(":memory:");
  legacy.exec(`
    CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      deadline TEXT NOT NULL,
      created_at TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE project_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      weight INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT
    );
  `);
  const project = legacy
    .query(`INSERT INTO projects (title, deadline, created_at, archived) VALUES (?, ?, ?, 0) RETURNING *`)
    .get("Old project", "2026-09-01", "2026-07-01") as { id: number };
  const insertStep = legacy.query(
    `INSERT INTO project_steps (project_id, label, weight, due_date, done, done_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
  );
  // 8 steps, all already due under the old day-after-day model — exactly the
  // stuck pile this migration is meant to fix.
  const stepIds: number[] = [];
  for (let i = 1; i <= 8; i++) {
    const row = insertStep.get(project.id, `Step ${i}`, 10, addDays("2026-07-01", i - 1), 0, null) as {
      id: number;
    };
    stepIds.push(row.id);
  }

  migrateGoals(legacy, "2026-07-31");

  const due = listDueSteps(legacy, "2026-07-31");
  expect(due.map((s) => s.id)).toEqual(stepIds.slice(0, 5));
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `bun test goals-db.test.ts`
Expected: FAIL — `migrateGoals` doesn't accept a second argument yet, `steps_released` column doesn't exist, gating isn't implemented.

- [ ] **Step 4: Implement the watermark gate in `goals-db.ts`**

Replace the imports and `migrateGoals` at the top of `goals-db.ts`:

```ts
import type { Database } from "bun:sqlite";
import { projectProgress } from "./goals-scheduling";
import { releaseCount, MAX_ACTIVE_BACKLOG } from "./scheduling";
```

```ts
export function migrateGoals(db: Database, today: string): void {
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

  const columns = db.query(`PRAGMA table_info(projects)`).all() as { name: string }[];
  if (!columns.some((c) => c.name === "link")) {
    db.exec(`ALTER TABLE projects ADD COLUMN link TEXT`);
  }
  if (!columns.some((c) => c.name === "steps_released")) {
    db.exec(`ALTER TABLE projects ADD COLUMN steps_released INTEGER NOT NULL DEFAULT 0`);
    backfillStepsReleased(db, today);
  }
}

// Seeds each existing project's watermark from steps that were already
// done or already due under the old day-after-day model, capped at the
// backlog limit — anything beyond that was just sitting overdue and
// untouched, and is pulled back into the gated queue. Then tops up toward
// the cap with real backlog.
function backfillStepsReleased(db: Database, today: string): void {
  const projects = db.query(`SELECT id FROM projects`).all() as { id: number }[];
  for (const { id } of projects) {
    const steps = db
      .query(`SELECT due_date, done FROM project_steps WHERE project_id = ? ORDER BY id`)
      .all(id) as { due_date: string; done: number }[];
    let released = 0;
    for (const step of steps) {
      if (step.done === 1 || step.due_date <= today) released++;
      else break;
    }
    released = Math.min(released, MAX_ACTIVE_BACKLOG);
    db.query(`UPDATE projects SET steps_released = ? WHERE id = ?`).run(released, id);
    runGoalsReleaseGate(db, id, today);
  }
}

// Advances a project's watermark to bring its visible backlog back up to
// the cap, stamping each newly-released step's due_date as today.
// Idempotent — safe to call on every read and after every step creation.
function runGoalsReleaseGate(db: Database, projectId: number, today: string): void {
  const project = db.query(`SELECT steps_released FROM projects WHERE id = ?`).get(projectId) as
    | { steps_released: number }
    | null;
  if (!project) return;

  const stepIds = (
    db.query(`SELECT id FROM project_steps WHERE project_id = ? ORDER BY id`).all(projectId) as {
      id: number;
    }[]
  ).map((s) => s.id);

  const releasedIds = stepIds.slice(0, project.steps_released);
  const backlog =
    releasedIds.length === 0
      ? 0
      : ((
          db
            .query(
              `SELECT COUNT(*) AS n FROM project_steps
               WHERE id IN (${releasedIds.map(() => "?").join(",")}) AND due_date <= ? AND done = 0`,
            )
            .get(...releasedIds, today) as { n: number }
        ).n);

  const remaining = stepIds.length - project.steps_released;
  const toRelease = releaseCount(backlog, remaining);
  if (toRelease === 0) return;

  const newlyReleased = stepIds.slice(project.steps_released, project.steps_released + toRelease);
  for (const id of newlyReleased) {
    db.query(`UPDATE project_steps SET due_date = ? WHERE id = ?`).run(today, id);
  }
  db.query(`UPDATE projects SET steps_released = ? WHERE id = ?`).run(
    project.steps_released + toRelease,
    projectId,
  );
}
```

Update `createStep` to insert a placeholder due date and immediately run the gate:

```ts
export function createStep(
  db: Database,
  projectId: number,
  label: string,
  weight: number,
  today: string,
): ProjectStep | null {
  const project = getProjectRow(db, projectId);
  if (!project) return null;
  const row = db
    .query(
      `INSERT INTO project_steps (project_id, label, weight, due_date, done, done_at)
       VALUES (?, ?, ?, ?, 0, NULL) RETURNING *`,
    )
    .get(projectId, label, weight, project.created_at) as ProjectStepRow;
  runGoalsReleaseGate(db, projectId, today);
  return toStep(getStepRow(db, row.id)!);
}
```

Add a small shared row-lookup helper (and use it in `toggleStep` too, replacing its inline duplicate query):

```ts
function getStepRow(db: Database, id: number): ProjectStepRow | null {
  return db.query(`SELECT * FROM project_steps WHERE id = ?`).get(id) as ProjectStepRow | null;
}
```

In `toggleStep`, replace:

```ts
const stepRow = db.query(`SELECT * FROM project_steps WHERE id = ?`).get(stepId) as ProjectStepRow | null;
```

with:

```ts
const stepRow = getStepRow(db, stepId);
```

Finally, update `listDueSteps` to run the gate for every active project first, then filter by each project's watermark:

```ts
export function listDueSteps(db: Database, today: string): (ProjectStep & { project_title: string })[] {
  for (const { id } of listProjects(db)) {
    runGoalsReleaseGate(db, id, today);
  }
  const rows = db
    .query(
      `SELECT s.*, p.title AS project_title
       FROM project_steps s
       JOIN projects p ON p.id = s.project_id
       WHERE s.due_date <= ? AND s.done = 0 AND p.archived = 0
         AND (
           SELECT COUNT(*) FROM project_steps s2
           WHERE s2.project_id = s.project_id AND s2.id <= s.id
         ) <= p.steps_released
       ORDER BY s.due_date, s.id`,
    )
    .all(today) as (ProjectStepRow & { project_title: string })[];
  return rows.map((row) => ({ ...toStep(row), project_title: row.project_title }));
}
```

`nextStepDueDate` import at the top of the original file is removed as part of this rewrite (it's no longer used anywhere).

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test goals-db.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 6: Commit**

```bash
git add goals-scheduling.ts goals-scheduling.test.ts goals-db.ts goals-db.test.ts
git commit -m "Gate Goals step release on each project's own backlog via a watermark"
```

---

### Task 5: Wire up call sites across domains

**Files:**
- Modify: `index.ts`
- Modify: `goals-api.test.ts`
- Modify: `home-api.test.ts`

**Interfaces:**
- Consumes: `migrateGoals(db, today)` new signature (Task 4).

- [ ] **Step 1: Update `index.ts`**

Replace:

```ts
migrateGoals(db);
```

with:

```ts
migrateGoals(db, localToday());
```

- [ ] **Step 2: Update `goals-api.test.ts`**

Replace:

```ts
migrateGoals(db);
```

with:

```ts
migrateGoals(db, localToday());
```

(`localToday` is already imported in this file.)

- [ ] **Step 3: Update `home-api.test.ts`**

Replace:

```ts
migrateGoals(db);
```

with:

```ts
migrateGoals(db, TODAY);
```

Replace the test `"GET /api/home/stats starts with concept 1 due today, nothing overdue, nothing completed"` with:

```ts
test("GET /api/home/stats starts with the first 5 theory concepts due today, nothing overdue, nothing completed", async () => {
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: 5, overdue: 0, completedToday: 0 });
});
```

In the test `"GET /api/home/stats counts dueToday and overdue across all three sources"`, replace:

```ts
  expect(stats.dueToday).toBe(2); // leetcode problem + theory concept 1
  expect(stats.overdue).toBe(1); // the goals step
```

with:

```ts
  expect(stats.dueToday).toBe(6); // leetcode problem + 5 theory concepts released under the cap
  expect(stats.overdue).toBe(1); // the goals step
```

Every other test in `home-api.test.ts` is unaffected (they either check for the *existence* of a specific item rather than an exact count, or use single-step Goals projects where the cap never binds).

- [ ] **Step 4: Run the full test suite**

Run: `bun test`
Expected: PASS — every test file in the repo passes, including `db.test.ts`, `api.test.ts`, `highlight.test.ts`, `sydneyTime.test.ts`, `theory-content.test.ts`, which are untouched by this change and should be unaffected.

- [ ] **Step 5: Commit**

```bash
git add index.ts goals-api.test.ts home-api.test.ts
git commit -m "Wire migrateGoals' new today parameter through all call sites"
```

---

### Task 6: Manual verification against the real `srs.db`

This is the only step that touches your actual data, so it's manual rather than automated.

- [ ] **Step 1: Back up the real database**

```bash
cp srs.db srs.db.pre-backlog-gate-backup
```

- [ ] **Step 2: Run the app and let migration happen**

```bash
bun run dev
```

Check the terminal output for errors during startup (migration runs synchronously in `index.ts` before the server starts listening).

- [ ] **Step 3: Confirm the pile actually shrank**

With the server running, in another terminal:

```bash
curl -s http://localhost:3000/api/home/stats | bun -e "console.log(await new Response(Bun.stdin.stream()).json())"
```

Expected: `dueToday + overdue` for Theory is bounded (at most 5 more than before your last real review, not the full historical pile), not the large number you had before this change.

- [ ] **Step 4: Confirm new items trickle back in as you clear reviews**

In the running app's Theory tab, mark one due concept Correct or Wrong, then refresh — confirm exactly one more (previously-hidden) concept has appeared in its place, keeping the total at 5. Repeat once for a Goals project with more steps than fit under the cap, if you have one, marking a step done and confirming the next one appears.

- [ ] **Step 5: Clean up the backup once satisfied**

```bash
rm srs.db.pre-backlog-gate-backup
```

(No commit — `srs.db*` is gitignored.)

---

## Self-Review Notes

- **Spec coverage:** shared `releaseCount` primitive (Task 1) ✅; Theory watermark + migration backfill (Task 2) ✅; Theory API/due-count alignment (Task 3) ✅; Goals per-project watermark, `nextStepDueDate` removal, migration backfill (Task 4) ✅; call-site wiring (Task 5) ✅; real-data migration check (Task 6) ✅. LeetCode is explicitly out of scope per the design doc and untouched by every task.
- **Type consistency:** `releaseCount(backlog, remaining, cap?)` signature matches its one call site in `theory-db.ts` (2-arg, using the default cap) and two call sites in `goals-db.ts` (also 2-arg). `migrateGoals(db, today)`'s new signature is updated at all three call sites (`index.ts`, `goals-api.test.ts`, `home-api.test.ts`) in Task 5. `TOTAL_DAYS` is defined once in `theory-content.ts` and consumed identically by `theory-db.ts` (Task 2) and `theory-api.ts` (Task 3).
- **No placeholders:** every step above contains complete, runnable code — no TBDs or "similar to above" shortcuts.
