# LeetCode 150 Daily Due Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the LeetCode "Top Interview 150" daily pointer problem a real due item — it appears in both the LeetCode board tab's and the Home tab's due/overdue/completed-today stats and lists, goes overdue if missed, and credits "completed today" when solved.

**Architecture:** Two new nullable columns on `leetcode150_state` (`due_since`, `last_completed_date`) track when the current pointer position became due and when a solve last happened. `getCurrentLeetcode150` (already self-advancing on every read) is restructured to maintain these and return a richer shape. Both the Home tab (`home-api.ts`) and the LeetCode board tab (`frontend.tsx`'s `LeetCodeApp`) independently read this and merge a synthetic entry into their existing due-lists, with a sentinel id that routes clicks to the external LeetCode.com URL instead of a (nonexistent) detail view.

**Tech Stack:** Bun, `bun:sqlite`, React 19, `bun test`.

## Global Constraints

- No changes to `leetcode150-content.ts` (the curated list) or the core self-advance matching algorithm's logic (still: walk forward while the next position's slugified title matches a solved problem).
- No retroactive overdue backfill: `due_since` seeds to "today" (whichever day the migration first runs on a given db), never to some assumed past date.
- `getCurrentLeetcode150`'s existing self-advance behavior (mutates state on every read) is preserved — only its signature/return shape and the new due/completed bookkeeping are added.
- The existing `/api/leetcode150/current` response's `{ done: true }` shape when the list is exhausted must remain byte-for-byte unchanged (an existing test asserts this with strict `toEqual`).
- After every task: `bun test` must stay green and `bunx tsc` must stay clean. This repo has no PostToolUse test/typecheck hook configured yet (outstanding requirement per project CLAUDE.md, out of scope here) — run both manually after each task.

---

### Task 1: Schema + core pointer logic (`leetcode150-db.ts`)

**Files:**
- Modify: `leetcode150-db.ts` (whole file — migration + `getCurrentLeetcode150`)
- Modify: `leetcode150-db.test.ts` (update all 8 existing `getCurrentLeetcode150(db)` calls to the new signature/shape; add new tests)

**Interfaces:**
- Consumes: nothing new (existing `listProblems` from `db.ts`, `slugFromUrl` from `leetcode.ts`, `LEETCODE_150`/`slugify` from `leetcode150-content.ts`).
- Produces: `export interface CurrentLeetcode150 { item: (Leetcode150Item & { dueSince: string }) | null; completedCount: number; lastCompletedDate: string | null; }` and `export function getCurrentLeetcode150(db: Database, today: string): CurrentLeetcode150`. Tasks 2 and 3 both call this with the new signature and destructure `{ item, completedCount, lastCompletedDate }`.

- [ ] **Step 1: Update the existing 8 test calls to the new signature (write these as failing tests first — they'll fail to compile/run until Step 3's implementation lands)**

In `leetcode150-db.test.ts`, every occurrence of `getCurrentLeetcode150(db)` becomes `getCurrentLeetcode150(db, localToday()).item`. For example, the first test:

```ts
test("fresh db seeds completed_count at 29, so position 30 is current", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const current = getCurrentLeetcode150(db, localToday()).item;
  expect(current).not.toBeNull();
  expect(current!.position).toBe(30);
  expect(current!.number).toBe(209);
});
```

Apply the same `getCurrentLeetcode150(db, localToday()).item` substitution (in place of the old `getCurrentLeetcode150(db)`) to every one of the other 7 existing tests in this file — they keep their exact same assertions on `current!.position`/`current!.number`, only the call site changes.

- [ ] **Step 2: Add new tests for `due_since`/`last_completed_date`/`completedCount` behavior**

Append to `leetcode150-db.test.ts`:

```ts
test("due_since seeds to today on first read after migration", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const { item } = getCurrentLeetcode150(db, localToday());
  expect(item!.dueSince).toBe(localToday());
});

test("due_since stays unchanged across reads on later days with no advance", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const day1 = localToday();
  getCurrentLeetcode150(db, day1);
  const day3 = addDays(day1, 2);
  const { item } = getCurrentLeetcode150(db, day3);
  expect(item!.dueSince).toBe(day1); // still due since day1 — 2 days overdue by day3
});

test("due_since and last_completed_date reset to today when the pointer advances", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const day1 = localToday();
  getCurrentLeetcode150(db, day1); // due_since seeds to day1
  const day3 = addDays(day1, 2);
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    day3,
  );
  const { item, lastCompletedDate } = getCurrentLeetcode150(db, day3);
  expect(item!.position).toBe(31);
  expect(item!.dueSince).toBe(day3); // the new position just became due
  expect(lastCompletedDate).toBe(day3);
});

test("last_completed_date is null when no advance has ever happened", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const { lastCompletedDate } = getCurrentLeetcode150(db, localToday());
  expect(lastCompletedDate).toBeNull();
});

test("completedCount reflects how many positions are solved", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const before = getCurrentLeetcode150(db, localToday());
  expect(before.completedCount).toBe(29);
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    localToday(),
  );
  const after = getCurrentLeetcode150(db, localToday());
  expect(after.completedCount).toBe(30);
});

test("advancing past all 150 sets item to null but still reports lastCompletedDate and completedCount", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  db.query(`UPDATE leetcode150_state SET completed_count = 149 WHERE id = 1`).run();
  createProblem(
    db,
    { title: LEETCODE_150[149]!.title, url: leetcode150Url(LEETCODE_150[149]!), solution: "x" },
    localToday(),
  );
  const { item, completedCount, lastCompletedDate } = getCurrentLeetcode150(db, localToday());
  expect(item).toBeNull();
  expect(completedCount).toBe(150);
  expect(lastCompletedDate).toBe(localToday());
});
```

Find the existing scheduling import at the top of `leetcode150-db.test.ts`:

```ts
import { localToday } from "./scheduling";
```

Replace with:

```ts
import { addDays, localToday } from "./scheduling";
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `bun test leetcode150-db.test.ts`
Expected: FAIL — `getCurrentLeetcode150` doesn't accept a `today` argument yet and doesn't return `{ item, completedCount, lastCompletedDate }`.

- [ ] **Step 4: Implement the migration and pointer logic**

Replace the full contents of `leetcode150-db.ts` with:

```ts
import type { Database } from "bun:sqlite";
import { listProblems } from "./db";
import { slugFromUrl } from "./leetcode";
import { LEETCODE_150, slugify } from "./leetcode150-content";
import type { Leetcode150Item } from "./leetcode150-content";

const SEED_COMPLETED_COUNT = 29;

export function migrateLeetcode150(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leetcode150_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      completed_count INTEGER NOT NULL
    );
  `);
  const columns = db.query(`PRAGMA table_info(leetcode150_state)`).all() as { name: string }[];
  if (!columns.some((c) => c.name === "due_since")) {
    db.exec(`ALTER TABLE leetcode150_state ADD COLUMN due_since TEXT`);
  }
  if (!columns.some((c) => c.name === "last_completed_date")) {
    db.exec(`ALTER TABLE leetcode150_state ADD COLUMN last_completed_date TEXT`);
  }
  const existing = db.query(`SELECT completed_count FROM leetcode150_state WHERE id = 1`).get() as
    | { completed_count: number }
    | null;
  if (!existing) {
    db.query(`INSERT INTO leetcode150_state (id, completed_count) VALUES (1, ?)`).run(SEED_COMPLETED_COUNT);
  }
}

export interface CurrentLeetcode150 {
  item: (Leetcode150Item & { dueSince: string }) | null;
  completedCount: number;
  lastCompletedDate: string | null;
}

// Self-advances on every read: walks the pointer forward past any entries
// that already have a matching solved `problems` row, persisting the new
// position. This is the only place the pointer moves — there is no hook
// into createProblem/captureSubmission in db.ts/api.ts.
//
// due_since tracks when the CURRENT pointer position became due (seeds to
// `today` on first read, resets to `today` whenever the pointer advances —
// this is what lets callers compute overdueDays for a daily quota with no
// calendar date of its own). last_completed_date tracks the most recent
// day an advance happened (one credit per day, not one per position, even
// if multiple positions advance in a single call).
export function getCurrentLeetcode150(db: Database, today: string): CurrentLeetcode150 {
  const row = db
    .query(`SELECT completed_count, due_since, last_completed_date FROM leetcode150_state WHERE id = 1`)
    .get() as {
    completed_count: number;
    due_since: string | null;
    last_completed_date: string | null;
  };
  let completedCount = row.completed_count;
  let dueSince = row.due_since ?? today;

  const solvedSlugs = new Set(
    listProblems(db)
      .map((p) => slugFromUrl(p.url)?.toLowerCase() ?? null)
      .filter((s): s is string => s !== null),
  );

  const startCount = completedCount;
  while (
    completedCount < LEETCODE_150.length &&
    solvedSlugs.has(slugify(LEETCODE_150[completedCount]!.title))
  ) {
    completedCount++;
  }

  let lastCompletedDate = row.last_completed_date;
  if (completedCount > startCount) {
    dueSince = today;
    lastCompletedDate = today;
  }

  if (
    completedCount !== row.completed_count ||
    dueSince !== row.due_since ||
    lastCompletedDate !== row.last_completed_date
  ) {
    db.query(
      `UPDATE leetcode150_state SET completed_count = ?, due_since = ?, last_completed_date = ? WHERE id = 1`,
    ).run(completedCount, dueSince, lastCompletedDate);
  }

  return {
    item: completedCount < LEETCODE_150.length ? { ...LEETCODE_150[completedCount]!, dueSince } : null,
    completedCount,
    lastCompletedDate,
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bun test leetcode150-db.test.ts`
Expected: PASS, all tests (existing + new).

- [ ] **Step 6: Run the full suite and type checker**

Run: `bun test`
Expected: other files will now fail to compile/type-check (`leetcode150-api.ts` and its test still call the old signature) — this is expected and fixed in Task 2. Confirm the failures are ONLY in `leetcode150-api.ts`/`leetcode150-api.test.ts` (type errors calling `getCurrentLeetcode150(db)` with one argument, or treating the return value as the item directly) and not anywhere else.

Run: `bunx tsc`
Expected: type errors only in `leetcode150-api.ts` (the one remaining call site with the old signature) — confirms this task's own file is otherwise clean.

- [ ] **Step 7: Commit**

```bash
git add leetcode150-db.ts leetcode150-db.test.ts
git commit -m "feat: track due_since/last_completed_date for the LeetCode150 pointer"
```

---

### Task 2: Wire `dueSince`/`overdueDays` into the LeetCode150 API route

**Files:**
- Modify: `leetcode150-api.ts`
- Modify: `leetcode150-api.test.ts`

**Interfaces:**
- Consumes: `getCurrentLeetcode150(db, today)` returning `CurrentLeetcode150` (Task 1). `overdueDays` — this step ALSO moves this helper from `home-api.ts` into `scheduling.ts` as part of this task, since it's needed here first.
- Produces: `/api/leetcode150/current`'s JSON response, when not done, gains `dueSince: string` and `overdueDays: number` fields alongside the existing `position`/`number`/`title`/`topic`/`difficulty`/`url`. The `{ done: true }` shape is unchanged.

- [ ] **Step 1: Move `overdueDays` from `home-api.ts` to `scheduling.ts`**

In `scheduling.ts`, add at the end of the file:

```ts

export function overdueDays(dueDate: string, today: string): number {
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(dueDate)) / 86_400_000));
}
```

In `home-api.ts`, remove the local definition:

```ts
function overdueDays(dueDate: string, today: string): number {
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(dueDate)) / 86_400_000));
}
```

and add `overdueDays` to the existing scheduling import at the top of `home-api.ts`:

Find:
```ts
import { isDue, localToday } from "./scheduling";
```

Replace with:
```ts
import { isDue, localToday, overdueDays } from "./scheduling";
```

- [ ] **Step 2: Write the failing test for the enriched response**

Append to `leetcode150-api.test.ts`:

```ts
test("GET /api/leetcode150/current includes dueSince and overdueDays", async () => {
  const body: any = await (await fetch(`${base}/api/leetcode150/current`)).json();
  expect(body.dueSince).toBe(localToday());
  expect(body.overdueDays).toBe(0);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `bun test leetcode150-api.test.ts`
Expected: FAIL — `body.dueSince` is `undefined`, and the existing tests also fail to compile since `getCurrentLeetcode150` now takes a `today` argument and returns `{ item, ... }`.

- [ ] **Step 4: Update the route implementation**

Replace the full contents of `leetcode150-api.ts` with:

```ts
import type { Database } from "bun:sqlite";
import { getCurrentLeetcode150 } from "./leetcode150-db";
import { leetcode150Url } from "./leetcode150-content";
import { localToday, overdueDays } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function leetcode150ApiRoutes(db: Database) {
  return {
    "/api/leetcode150/current": {
      GET: () => {
        const today = localToday();
        const { item } = getCurrentLeetcode150(db, today);
        if (!item) return json({ done: true });
        return json({
          ...item,
          url: leetcode150Url(item),
          overdueDays: overdueDays(item.dueSince, today),
        });
      },
    },
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bun test leetcode150-api.test.ts`
Expected: PASS, all tests (existing + new).

- [ ] **Step 6: Run the full suite and type checker**

Run: `bun test`
Expected: failures now isolated to `home-api.ts`/`home-api.test.ts` (Task 3) — confirm nothing else newly fails.

Run: `bunx tsc`
Expected: type errors only in `home-api.ts` at this point.

- [ ] **Step 7: Commit**

```bash
git add leetcode150-api.ts leetcode150-api.test.ts scheduling.ts home-api.ts
git commit -m "feat: expose dueSince/overdueDays from the LeetCode150 API route"
```

---

### Task 3: Wire the daily pointer into Home tab due/overdue/completed stats

**Files:**
- Modify: `home-api.ts`
- Modify: `home-api.test.ts`

**Interfaces:**
- Consumes: `getCurrentLeetcode150(db, today)` (Task 1), `overdueDays` from `scheduling.ts` (Task 2), `leetcode150Url` from `leetcode150-content.ts`, `LEETCODE_150` from `leetcode150-content.ts`.
- Produces: `DueItem` interface gains `externalUrl?: string`. New functions `leetcode150Due(db, today): DueItem[]` and `leetcode150CompletedToday(db, today): DueItem[]`, unioned into `homeStats()`, `/api/home/due`, and `/api/home/completed-today`.

- [ ] **Step 1: Update `home-api.test.ts`'s fixtures for the new source**

Find the import block at the top of `home-api.test.ts`:

```ts
import { openDb, createProblem, reviewProblem } from "./db";
import { migrateTheory, reviewTheoryConcept, saveTheoryContent } from "./theory-db";
import { migrateGoals, createProject, createStep, toggleStep } from "./goals-db";
import { migrateExam, gradeExamAnswer, submitExamPaper, reviewExamItem } from "./exam-db";
import { buildExamSchedule, weekDueDate, listExamCourses } from "./exam-content";
import { homeApiRoutes } from "./home-api";
import { localToday, addDays } from "./scheduling";
```

Replace with:

```ts
import { openDb, createProblem, reviewProblem } from "./db";
import { migrateTheory, reviewTheoryConcept, saveTheoryContent } from "./theory-db";
import { migrateGoals, createProject, createStep, toggleStep } from "./goals-db";
import { migrateExam, gradeExamAnswer, submitExamPaper, reviewExamItem } from "./exam-db";
import { buildExamSchedule, weekDueDate, listExamCourses } from "./exam-content";
import { migrateLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";
import { homeApiRoutes } from "./home-api";
import { localToday, addDays } from "./scheduling";
```

Find:

```ts
const EXAM_WEEK1_OVERDUE = TODAY > weekDueDate(1);
// Every course with content gets its own collapsed "Week 1" due-item, so
// stats scale with however many courses currently have papers, not a fixed 1.
const EXAM_WEEK1_ITEM_COUNT = listExamCourses().length;
```

Replace with:

```ts
const EXAM_WEEK1_OVERDUE = TODAY > weekDueDate(1);
// Every course with content gets its own collapsed "Week 1" due-item, so
// stats scale with however many courses currently have papers, not a fixed 1.
const EXAM_WEEK1_ITEM_COUNT = listExamCourses().length;
// A freshly migrated db always has exactly one LeetCode150 pointer item due
// today (due_since seeds to TODAY, so it's never overdue and never
// completed unless a test explicitly solves LEETCODE_150[29] itself — none
// of the existing tests below do, they all use "Two Sum" as their generic
// mock problem, which is never the current pointer's title).
const LEETCODE150_DAILY_DUE = 1;
```

Find:

```ts
beforeEach(() => {
  db = openDb(":memory:");
  migrateTheory(db, TODAY);
  migrateGoals(db, TODAY);
  migrateExam(db, TODAY);
  server = Bun.serve({ port: 0, routes: homeApiRoutes(db) });
  base = server.url.origin;
});
```

Replace with:

```ts
beforeEach(() => {
  db = openDb(":memory:");
  migrateTheory(db, TODAY);
  migrateGoals(db, TODAY);
  migrateExam(db, TODAY);
  migrateLeetcode150(db);
  server = Bun.serve({ port: 0, routes: homeApiRoutes(db) });
  base = server.url.origin;
});
```

- [ ] **Step 2: Fix the now-ambiguous existing assertions**

Find (in the `"GET /api/home/due includes a due LeetCode problem"` test):

```ts
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const item = items.find((i) => i.source === "leetcode");
  expect(item).toBeTruthy();
  expect(item.title).toBe("Two Sum");
  expect(item.subtitle).toBe("java");
```

Replace with:

```ts
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const item = items.find((i) => i.source === "leetcode" && i.title === "Two Sum");
  expect(item).toBeTruthy();
  expect(item.title).toBe("Two Sum");
  expect(item.subtitle).toBe("java");
```

(`.find` without a title filter would now be ambiguous — there can be two `source: "leetcode"` items once the daily pointer is wired in: the real solved-problem review and the daily pointer.)

Find (in `"GET /api/home/stats starts with one exam item per course..."`):

```ts
  expect(stats).toEqual({
    dueToday: EXAM_WEEK1_OVERDUE ? 0 : EXAM_WEEK1_ITEM_COUNT,
    overdue: EXAM_WEEK1_OVERDUE ? EXAM_WEEK1_ITEM_COUNT : 0,
    completedToday: 0,
  }); // one grouped week-item per course, in whichever bucket today's date currently falls into
```

Replace with:

```ts
  expect(stats).toEqual({
    dueToday: (EXAM_WEEK1_OVERDUE ? 0 : EXAM_WEEK1_ITEM_COUNT) + LEETCODE150_DAILY_DUE,
    overdue: EXAM_WEEK1_OVERDUE ? EXAM_WEEK1_ITEM_COUNT : 0,
    completedToday: 0,
  }); // one grouped week-item per course + the daily LeetCode150 pointer, in whichever bucket today's date currently falls into
```

Find (in `"GET /api/home/stats counts theory concepts once they have content..."`):

```ts
  expect(stats).toEqual({
    dueToday: 5 + (EXAM_WEEK1_OVERDUE ? 0 : EXAM_WEEK1_ITEM_COUNT),
    overdue: EXAM_WEEK1_OVERDUE ? EXAM_WEEK1_ITEM_COUNT : 0,
    completedToday: 0,
  }); // 5 theory + one exam week-item per course, in whichever bucket today's date currently falls into
```

Replace with:

```ts
  expect(stats).toEqual({
    dueToday: 5 + (EXAM_WEEK1_OVERDUE ? 0 : EXAM_WEEK1_ITEM_COUNT) + LEETCODE150_DAILY_DUE,
    overdue: EXAM_WEEK1_OVERDUE ? EXAM_WEEK1_ITEM_COUNT : 0,
    completedToday: 0,
  }); // 5 theory + one exam week-item per course + the daily LeetCode150 pointer, in whichever bucket today's date currently falls into
```

Find (in `"GET /api/home/stats counts dueToday and overdue across all four sources"`):

```ts
  expect(stats.dueToday).toBe(6 + (EXAM_WEEK1_OVERDUE ? 0 : EXAM_WEEK1_ITEM_COUNT)); // leetcode problem + 5 theory concepts + one exam week-item per course, date-dependent
```

Replace with:

```ts
  expect(stats.dueToday).toBe(6 + (EXAM_WEEK1_OVERDUE ? 0 : EXAM_WEEK1_ITEM_COUNT) + LEETCODE150_DAILY_DUE); // leetcode problem + 5 theory concepts + one exam week-item per course + the daily LeetCode150 pointer, date-dependent
```

Note: this test's title says "across all four sources" — it's still four *distinct* sources semantically (the daily pointer is the same `"leetcode"` source, not a fifth), so the title doesn't need changing.

- [ ] **Step 3: Write the new failing tests for the daily pointer's own behavior**

Append to `home-api.test.ts`:

```ts
test("GET /api/home/due includes the LeetCode150 daily pointer with an externalUrl", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const pointer = items.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(pointer).toBeTruthy();
  expect(pointer.title).toBe("209. Minimum Size Subarray Sum");
  expect(pointer.subtitle).toBe("Sliding Window · Medium");
  expect(pointer.overdueDays).toBe(0);
  expect(pointer.externalUrl).toBe("https://leetcode.com/problems/minimum-size-subarray-sum/");
});

test("GET /api/home/due shows the LeetCode150 daily pointer as overdue after a missed day", async () => {
  db.query(`UPDATE leetcode150_state SET due_since = ? WHERE id = 1`).run(addDays(TODAY, -2));
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const pointer = items.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(pointer.overdueDays).toBe(2);
});

test("solving the LeetCode150 daily pointer removes it from due and credits completedToday", async () => {
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    TODAY,
  );
  const dueItems: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const stillPending = dueItems.find(
    (i) => i.source === "leetcode" && i.title.startsWith("209."),
  );
  expect(stillPending).toBeFalsy(); // pointer advanced past position 30, so it's no longer today's due item

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.completedToday).toBe(1);

  const completedItems: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const solved = completedItems.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(solved).toBeTruthy();
  expect(solved.title).toBe(LEETCODE_150[29]!.number + ". " + LEETCODE_150[29]!.title);
});
```

- [ ] **Step 4: Run the tests to verify the new ones fail and confirm the ripple-effect ones are understood**

Run: `bun test home-api.test.ts`
Expected: the 3 new tests FAIL (feature not implemented yet). The pre-existing 5 baseline failures (unrelated date-dependent assertions — `EXAM_WEEK1_OVERDUE` having flipped against the real calendar, tracked throughout this project's history as a known pre-existing issue, not something this task fixes) may still show as failing even after Step 2's `LEETCODE150_DAILY_DUE` adjustment — that's expected; Step 2 only fixes the *new* +1 ripple this task introduces, not the pre-existing unrelated date drift. Confirm no *additional* tests beyond the 3 new ones and the pre-existing baseline set are failing at this point (a broader failure means Step 2's edits were applied somewhere incorrectly).

- [ ] **Step 5: Implement `leetcode150Due`/`leetcode150CompletedToday` and wire them in**

Find the top of `home-api.ts`:

```ts
// home-api.ts
import type { Database } from "bun:sqlite";
import { listProblems, countReviewsToday, listCompletedToday } from "./db";
import { listDueTheory, countTheoryReviewsToday, listTheoryCompletedToday } from "./theory-db";
import { listDueSteps, countStepsCompletedToday, listStepsCompletedOn } from "./goals-db";
import {
  listExamPaperRows,
  listDueExamReviewItems,
  countExamPapersSubmittedToday,
  countExamReviewsToday,
  listExamPapersSubmittedToday,
  listExamReviewsCompletedToday,
} from "./exam-db";
import { buildExamSchedule, listExamCourses, COURSES, weekStartDate, groupExamPapersByWeek } from "./exam-content";
import { isDue, localToday, overdueDays } from "./scheduling";
```

Replace with:

```ts
// home-api.ts
import type { Database } from "bun:sqlite";
import { listProblems, countReviewsToday, listCompletedToday } from "./db";
import { listDueTheory, countTheoryReviewsToday, listTheoryCompletedToday } from "./theory-db";
import { listDueSteps, countStepsCompletedToday, listStepsCompletedOn } from "./goals-db";
import {
  listExamPaperRows,
  listDueExamReviewItems,
  countExamPapersSubmittedToday,
  countExamReviewsToday,
  listExamPapersSubmittedToday,
  listExamReviewsCompletedToday,
} from "./exam-db";
import { buildExamSchedule, listExamCourses, COURSES, weekStartDate, groupExamPapersByWeek } from "./exam-content";
import { getCurrentLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";
import { isDue, localToday, overdueDays } from "./scheduling";
```

Find:

```ts
export interface DueItem {
  source: DueSource;
  id: number;
  title: string;
  subtitle: string;
  dueDate: string;
  overdueDays: number;
  linkId: number;
  course?: string;
}
```

Replace with:

```ts
export interface DueItem {
  source: DueSource;
  id: number;
  title: string;
  subtitle: string;
  dueDate: string;
  overdueDays: number;
  linkId: number;
  course?: string;
  // Set only for the LeetCode150 daily pointer item, which has no
  // `problems`-table row to deep-link to — clients should open this URL
  // directly instead of dispatching the normal source-based navigation.
  externalUrl?: string;
}
```

Find the end of the `leetcodeDue` function (right before `theoryDue`):

```ts
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
```

Directly after it (before `function theoryDue`), add:

```ts
function leetcode150Due(db: Database, today: string): DueItem[] {
  const { item } = getCurrentLeetcode150(db, today);
  if (!item) return [];
  return [
    {
      source: "leetcode" as const,
      id: -1,
      title: `${item.number}. ${item.title}`,
      subtitle: `${item.topic} · ${item.difficulty}`,
      dueDate: item.dueSince,
      overdueDays: overdueDays(item.dueSince, today),
      linkId: -1,
      externalUrl: leetcode150Url(item),
    },
  ];
}
```

Find the end of the `leetcodeCompletedToday` function (right before `theoryCompletedToday`):

```ts
function leetcodeCompletedToday(db: Database, today: string): DueItem[] {
  return listCompletedToday(db, today).map((p) => ({
    source: "leetcode" as const,
    id: p.id,
    title: p.title,
    subtitle: p.language,
    dueDate: today,
    overdueDays: 0,
    linkId: p.id,
  }));
}
```

Directly after it (before `function theoryCompletedToday`), add:

```ts
function leetcode150CompletedToday(db: Database, today: string): DueItem[] {
  const { completedCount, lastCompletedDate } = getCurrentLeetcode150(db, today);
  if (lastCompletedDate !== today || completedCount === 0) return [];
  const solved = LEETCODE_150[completedCount - 1]!;
  return [
    {
      source: "leetcode" as const,
      id: -1,
      title: `${solved.number}. ${solved.title}`,
      subtitle: `${solved.topic} · ${solved.difficulty}`,
      dueDate: today,
      overdueDays: 0,
      linkId: -1,
      externalUrl: leetcode150Url(solved),
    },
  ];
}
```

Find `homeStats`:

```ts
function homeStats(db: Database, today: string): HomeStats {
  const items = [...leetcodeDue(db, today), ...theoryDue(db, today), ...goalsDue(db, today), ...examDue(db, today)];
  const examSubmittedToday = listExamCourses().reduce(
    (sum, { code }) => sum + countExamPapersSubmittedToday(db, code, today),
    0,
  );
  const examReviewsToday = listExamCourses().reduce((sum, { code }) => sum + countExamReviewsToday(db, code, today), 0);
  return {
    dueToday: items.filter((i) => i.overdueDays === 0).length,
    overdue: items.filter((i) => i.overdueDays > 0).length,
    completedToday:
      countReviewsToday(db, today) + countTheoryReviewsToday(db, today) + countStepsCompletedToday(db, today) + examSubmittedToday + examReviewsToday,
  };
}
```

Replace with:

```ts
function homeStats(db: Database, today: string): HomeStats {
  const items = [
    ...leetcodeDue(db, today),
    ...leetcode150Due(db, today),
    ...theoryDue(db, today),
    ...goalsDue(db, today),
    ...examDue(db, today),
  ];
  const examSubmittedToday = listExamCourses().reduce(
    (sum, { code }) => sum + countExamPapersSubmittedToday(db, code, today),
    0,
  );
  const examReviewsToday = listExamCourses().reduce((sum, { code }) => sum + countExamReviewsToday(db, code, today), 0);
  const leetcode150CompletedCredit = leetcode150CompletedToday(db, today).length;
  return {
    dueToday: items.filter((i) => i.overdueDays === 0).length,
    overdue: items.filter((i) => i.overdueDays > 0).length,
    completedToday:
      countReviewsToday(db, today) +
      countTheoryReviewsToday(db, today) +
      countStepsCompletedToday(db, today) +
      examSubmittedToday +
      examReviewsToday +
      leetcode150CompletedCredit,
  };
}
```

Find the `/api/home/due` handler:

```ts
    "/api/home/due": {
      GET: () => {
        const today = localToday();
        const items = [
          ...leetcodeDue(db, today),
          ...theoryDue(db, today),
          ...goalsDue(db, today),
          ...examDue(db, today),
        ];
        items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        return Response.json(items);
      },
    },
```

Replace with:

```ts
    "/api/home/due": {
      GET: () => {
        const today = localToday();
        const items = [
          ...leetcodeDue(db, today),
          ...leetcode150Due(db, today),
          ...theoryDue(db, today),
          ...goalsDue(db, today),
          ...examDue(db, today),
        ];
        items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        return Response.json(items);
      },
    },
```

Find the `/api/home/completed-today` handler:

```ts
    "/api/home/completed-today": {
      GET: () => {
        const today = localToday();
        const items = [
          ...leetcodeCompletedToday(db, today),
          ...theoryCompletedToday(db, today),
          ...goalsCompletedToday(db, today),
          ...examCompletedToday(db, today),
        ];
        items.sort((a, b) => a.source.localeCompare(b.source) || a.title.localeCompare(b.title));
        return Response.json(items);
      },
    },
```

Replace with:

```ts
    "/api/home/completed-today": {
      GET: () => {
        const today = localToday();
        const items = [
          ...leetcodeCompletedToday(db, today),
          ...leetcode150CompletedToday(db, today),
          ...theoryCompletedToday(db, today),
          ...goalsCompletedToday(db, today),
          ...examCompletedToday(db, today),
        ];
        items.sort((a, b) => a.source.localeCompare(b.source) || a.title.localeCompare(b.title));
        return Response.json(items);
      },
    },
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `bun test home-api.test.ts`
Expected: PASS for all tests except the same 5 pre-existing baseline failures tracked throughout this project (unrelated date drift) — confirm the count of failures is exactly 5, all pre-existing, none of them any of the 3 new tests from Step 3.

- [ ] **Step 7: Run the full suite and type checker**

Run: `bun test`
Expected: 289 tests total (unchanged test *file* count, more tests within `leetcode150-db.test.ts`/`leetcode150-api.test.ts`/`home-api.test.ts`), 5 pre-existing baseline failures, everything else passing.

Run: `bunx tsc`
Expected: clean, no errors anywhere.

- [ ] **Step 8: Commit**

```bash
git add home-api.ts home-api.test.ts
git commit -m "feat: include the LeetCode150 daily pointer in Home tab due/overdue/completed stats"
```

---

### Task 4: Home tab click routing for the external-URL pointer item

**Files:**
- Modify: `frontend.tsx` (the `navigate` function inside `App()`)

**Interfaces:**
- Consumes: `DueItem.externalUrl` (Task 3), `openExternal` (already defined at `frontend.tsx:113`).
- Produces: nothing new consumed by later tasks — this is a leaf change.

- [ ] **Step 1: Add the external-URL guard to `navigate`**

Find in `frontend.tsx` (inside `function App()`):

```tsx
  const navigate = (item: { source: "leetcode" | "theory" | "goals" | "exam"; linkId: number; course?: string }) => {
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "theory") setDeepLink({ tab: "theory", conceptDay: item.linkId });
    else if (item.source === "goals") setDeepLink({ tab: "goals", projectId: item.linkId });
    else setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
    setTab(item.source);
  };
```

Replace with:

```tsx
  const navigate = (item: {
    source: "leetcode" | "theory" | "goals" | "exam";
    linkId: number;
    course?: string;
    externalUrl?: string;
  }) => {
    if (item.source === "leetcode" && item.externalUrl) {
      openExternal(item.externalUrl);
      return;
    }
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "theory") setDeepLink({ tab: "theory", conceptDay: item.linkId });
    else if (item.source === "goals") setDeepLink({ tab: "goals", projectId: item.linkId });
    else setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
    setTab(item.source);
  };
```

- [ ] **Step 2: Run the full suite and type checker**

Run: `bun test`
Expected: unchanged from Task 3's end state (this is a UI-only change with no test coverage of its own — `navigate` isn't unit tested, it's exercised via the browser; the 5 pre-existing baseline failures remain, nothing new breaks).

Run: `bunx tsc`
Expected: clean.

- [ ] **Step 3: Manual verification**

Run: `bun run dev`. On the Home tab, confirm the daily LeetCode150 item appears in the due list (or overdue list, if you manipulate `due_since` via a DB tool to simulate a missed day) with the right title/subtitle. Click it — confirm it opens the LeetCode.com problem page in a new tab, not a broken "detail view" for a nonexistent problem.

- [ ] **Step 4: Commit**

```bash
git add frontend.tsx
git commit -m "feat: route Home tab clicks on the LeetCode150 pointer to its external URL"
```

---

### Task 5: LeetCode board tab's own Stats/DueBoard wiring

**Files:**
- Modify: `frontend.tsx` (the `LeetCodeApp` function)

**Interfaces:**
- Consumes: `leetcode150Api.current()` (already defined at `frontend.tsx:96-101`), `Leetcode150Current` interface (needs `dueSince` added), `openExternal`, `ProblemSummary` type (from `db.ts`, already imported).
- Produces: nothing new consumed by later tasks — this is the last task.

- [ ] **Step 1: Add `dueSince` to the `Leetcode150Current` interface**

Find:

```tsx
interface Leetcode150Current {
  position: number;
  number: number;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
}
```

Replace with:

```tsx
interface Leetcode150Current {
  position: number;
  number: number;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
  dueSince: string;
  overdueDays: number;
}
```

- [ ] **Step 2: Merge the synthetic entry into `LeetCodeApp`'s `problems` state and guard `open`**

Find:

```tsx
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
```

Replace with:

```tsx
  const today = localToday();
  const [view, setView] = useState<View>({ name: "board" });
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [completedToday, setCompletedToday] = useState(0);

  const refresh = async () => {
    const [list, stats, current] = await Promise.all([
      api.list(),
      api.stats(),
      leetcode150Api.current(),
    ]);
    setCompletedToday(stats.completedToday);
    if ("done" in current) {
      setProblems(list);
    } else {
      setProblems([
        {
          id: -1,
          title: `${current.number}. ${current.title}`,
          url: current.url,
          language: "—",
          rung: 0,
          next_review: current.dueSince,
          created_at: current.dueSince,
        },
        ...list,
      ]);
    }
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (openProblemId != null) {
      setView({ name: "detail", id: openProblemId });
      onOpened?.();
    }
  }, [openProblemId]);

  const open = (id: number) => {
    if (id === -1) {
      const pointer = problems.find((p) => p.id === -1);
      if (pointer) openExternal(pointer.url);
      return;
    }
    setView({ name: "detail", id });
  };
```

(`board-row-main`/the row-title click in both `DueBoard` and `TrackedListModal` already call `openExternal(p.url)` directly for every row regardless of id, so those need no changes — only the "⋯" button's `onOpen(p.id)` path needs the `id === -1` guard, which lives in `open` itself.)

- [ ] **Step 3: Run the full suite and type checker**

Run: `bun test`
Expected: unchanged from Task 4's end state (no test coverage of `LeetCodeApp`'s rendering — it's exercised via the browser; same 5 pre-existing baseline failures, nothing new breaks).

Run: `bunx tsc`
Expected: clean.

- [ ] **Step 4: Manual verification**

Run: `bun run dev`, open the LeetCode tab. Confirm the Stats panel's "Due today" count includes the daily pointer problem, and it appears in the "Due today" board list below with a `due` (or `Nd late`) badge, a `—` language tag, and an empty rung meter. Click its title — confirm it opens LeetCode.com. Click its "⋯" button — confirm it also opens LeetCode.com (not a broken detail view). Add the problem via "Add problem" with a title/URL matching the pointer's current problem — confirm after the form submits and the board refreshes, the pointer item is gone from "Due today" and "Completed today" incremented by one.

- [ ] **Step 5: Commit**

```bash
git add frontend.tsx
git commit -m "feat: show the LeetCode150 daily pointer in the LeetCode board tab's own stats"
```

---

## Self-Review Notes

**Spec coverage:** Schema + core logic → Task 1. `dueSince`/`overdueDays` API exposure → Task 2. Home tab aggregate stats (due/overdue/completed-today) → Task 3. Home tab click routing → Task 4. LeetCode board tab's own stats/due-list/click routing → Task 5. The spec's "Implementation note on double-advance" is resolved concretely in Task 1's single-UPDATE design (one `getCurrentLeetcode150` call per request already naturally happens once per Task 3's `leetcode150Due`/`leetcode150CompletedToday` pair of calls within the same request — each call is idempotent if nothing new to advance, so calling it twice per request, once from each function, is correctness-neutral and was left as the simpler two-call design rather than over-engineering a shared single call within one request).

**Placeholder scan:** every step has literal, complete code; every command is real and runnable for this stack.

**Type consistency:** `CurrentLeetcode150`'s shape (`{ item, completedCount, lastCompletedDate }`) is defined once in Task 1 and consumed identically (via destructuring) in Task 2 (`{ item }`) and Task 3 (`{ item }` in `leetcode150Due`, `{ completedCount, lastCompletedDate }` in `leetcode150CompletedToday`) — verified no field name drift. `DueItem.externalUrl` is defined in Task 3 and consumed identically in Task 4 (`item.externalUrl`). The sentinel `id: -1`/`linkId: -1` convention is used identically in Task 3 (backend) and Task 5 (frontend synthetic `ProblemSummary`), and `open()`'s guard in Task 5 checks the same `-1` value.
