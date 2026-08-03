# Theory Content Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Theory concept content (`question`/`answer`) from the static `theory-content.ts` file into the database, hide blank-content concepts from due/overdue lists everywhere without breaking the backlog release gate, and add a "+ Add theory" flow to fill in blank slots from the running app.

**Architecture:** `theory_schedule` gains `category`/`question`/`answer` columns, seeded once from `theory-content.ts`'s existing day→category structure. Two new API routes (`next-blank`, `content`) let the frontend find and fill blank slots. `home-api.ts` and `TheoryApp.tsx` stop reading the static `theory-content.ts` schedule for display, since every `TheoryProgress` now carries its own content.

**Tech Stack:** Bun, `bun:sqlite`, TypeScript, React (via Bun's HTML-import bundling), `bun test`.

## Global Constraints

- `theory-content.ts` is untouched — it keeps generating the 150 day/category slots via `buildTheorySchedule()`, used only at seed/migration time from here on.
- Blank-content filtering (`question != ''`) applies only to display-facing queries (`listDueTheory`, `countOverdueTheory`). The backlog gate's own internal backlog count (`runTheoryReleaseGate`'s separate SQL query) must NOT filter on content — it needs to keep counting released-but-blank concepts as backlog, or gating will over-release.
- `PUT .../content` always allows overwriting existing content (no "only if blank" restriction) and rejects blank (trimmed-empty) `question` or `answer` with 400.
- No frontend test harness exists for `TheoryApp.tsx` — its task is verified manually, not with automated tests.
- Use `bun test <file>` to run tests; Bun only, no jest/vitest/node.

---

### Task 1: `theory-db.ts` — schema, content functions, blank-filtering

**Files:**
- Modify: `theory-db.ts`
- Test: `theory-db.test.ts`

**Interfaces:**
- Produces: `TheoryProgress` interface gains `category: string`, `question: string`, `answer: string`. New exports: `saveTheoryContent(db: Database, conceptDay: number, question: string, answer: string): TheoryProgress | null` and `getNextBlankConcept(db: Database): { conceptDay: number; category: string } | null`. Consumed by Task 2 (`theory-api.ts`) and Task 3 (`home-api.ts`).

- [ ] **Step 1: Rewrite `theory-db.test.ts` with the new expected behavior**

Replace the full contents of `theory-db.test.ts` with:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateTheory,
  listDueTheory,
  getTheoryConcept,
  saveTheoryAnswer,
  saveTheoryContent,
  getNextBlankConcept,
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

test("seeds 150 concepts with real categories and blank content, releasing the first 5 immediately under the backlog cap", () => {
  const first = getTheoryConcept(db, 1)!;
  expect(first.concept_day).toBe(1);
  expect(first.rung).toBe(-1);
  expect(first.next_review).toBe(TODAY);
  expect(first.your_answer).toBe("");
  expect(first.question).toBe("");
  expect(first.answer).toBe("");
  expect(first.category.length).toBeGreaterThan(0);

  expect(getTheoryConcept(db, 5)!.next_review).toBe(TODAY);
  // Not yet released — keeps its original calendar placeholder, unused until release.
  expect(getTheoryConcept(db, 6)!.next_review).toBe(addDays(TODAY, 5));
  expect(getTheoryConcept(db, 150)!.next_review).toBe(addDays(TODAY, 149));
  expect(getTheoryConcept(db, 150)!.category.length).toBeGreaterThan(0);
});

test("migrateTheory does not reseed (and doesn't reset progress) on a second call", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  migrateTheory(db, TODAY);
  expect(getTheoryConcept(db, 1)!.rung).toBe(0);
});

test("listDueTheory excludes released concepts that still have blank content", () => {
  expect(listDueTheory(db, TODAY)).toEqual([]);
});

test("listDueTheory shows released concepts once they have content, still capped at 5", () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});

test("listDueTheory a week later still caps at 5 if nothing has been reviewed", () => {
  // Time passing alone doesn't grow the pile — only clearing backlog does.
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const due = listDueTheory(db, addDays(TODAY, 7));
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});

test("reviewing a released concept lets the next one in, keeping the pile at the cap", () => {
  for (let day = 1; day <= 6; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  reviewTheoryConcept(db, 1, "correct", TODAY); // concept 1 now due in 3 days, drops off
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([2, 3, 4, 5, 6]);
});

test("a released-but-blank concept still counts toward the backlog gate, so missing content doesn't over-release", () => {
  // Nothing has content yet. If the gate ignored blanks when computing
  // backlog, it would see backlog=0 forever and release all 150 at once.
  expect(listDueTheory(db, TODAY)).toEqual([]);
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]); // not 1..150
});

test("saveTheoryAnswer stores a draft without affecting scheduling or content", () => {
  const updated = saveTheoryAnswer(db, 1, "my draft")!;
  expect(updated.your_answer).toBe("my draft");
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe(TODAY);
  expect(updated.question).toBe("");
});

test("saveTheoryContent sets question and answer, leaving scheduling untouched", () => {
  const updated = saveTheoryContent(db, 1, "What is a load balancer?", "Distributes traffic.")!;
  expect(updated.question).toBe("What is a load balancer?");
  expect(updated.answer).toBe("Distributes traffic.");
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe(TODAY);
});

test("saveTheoryContent can overwrite existing content", () => {
  saveTheoryContent(db, 1, "Old question", "Old answer");
  const updated = saveTheoryContent(db, 1, "New question", "New answer")!;
  expect(updated.question).toBe("New question");
  expect(updated.answer).toBe("New answer");
});

test("saveTheoryContent on an unknown concept_day returns null", () => {
  expect(saveTheoryContent(db, 9999, "Q", "A")).toBeNull();
});

test("getNextBlankConcept returns the lowest-numbered concept still missing content", () => {
  saveTheoryContent(db, 1, "Q1", "A1");
  saveTheoryContent(db, 2, "Q2", "A2");
  const next = getNextBlankConcept(db)!;
  expect(next.conceptDay).toBe(3);
  expect(next.category.length).toBeGreaterThan(0);
});

test("getNextBlankConcept returns null once every concept has content", () => {
  for (let day = 1; day <= 150; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  expect(getNextBlankConcept(db)).toBeNull();
});

test("reviewTheoryConcept 'correct' advances the rung and reschedules 3 days out the first time", () => {
  const updated = reviewTheoryConcept(db, 1, "correct", TODAY)!;
  expect(updated.concept_day).toBe(1);
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe("2026-07-23");
  expect(updated.your_answer).toBe("");
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

test("countOverdueTheory counts strictly-past next_review dates among released, content-filled concepts only", () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  expect(countOverdueTheory(db, TODAY)).toBe(0);
  // Nothing reviewed, so the pile stays at the 5 released on day one — all overdue two days later.
  expect(countOverdueTheory(db, addDays(TODAY, 2))).toBe(5);
});

test("countOverdueTheory excludes blank-content concepts even though they're released and overdue", () => {
  saveTheoryContent(db, 1, "Q1", "A1");
  // concepts 2-5 are released but left blank
  expect(countOverdueTheory(db, addDays(TODAY, 2))).toBe(1);
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

test("migrating a pre-existing db (old schema, no content columns) backfills categories and the watermark", () => {
  // Simulate an old-format db exactly as pre-migration code would have left
  // it: 150 concepts seeded with calendar-offset next_review dates, no
  // category/question/answer columns at all, only concept 1 ever actually
  // passed.
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

  const { released_up_to } = legacy
    .query(`SELECT released_up_to FROM theory_state`)
    .get() as { released_up_to: number };
  expect(released_up_to).toBe(5);

  // Categories were backfilled for every row, even ones far past the watermark.
  for (const day of [1, 5, 75, 150]) {
    const row = legacy.query(`SELECT category FROM theory_schedule WHERE concept_day = ?`).get(day) as {
      category: string;
    };
    expect(row.category.length).toBeGreaterThan(0);
  }

  // Content stays blank on an upgrade — nothing shows up in the due list
  // until content is added, even though the watermark is correctly 5.
  expect(listDueTheory(legacy, laterToday)).toEqual([]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test theory-db.test.ts`
Expected: FAIL — `category`/`question`/`answer` columns and `saveTheoryContent`/`getNextBlankConcept` don't exist yet.

- [ ] **Step 3: Implement the schema and functions in `theory-db.ts`**

Replace the top of `theory-db.ts` (imports, interface, and `migrateTheory`/`seedSchedule`) with:

```ts
import type { Database } from "bun:sqlite";
import { buildTheorySchedule, TOTAL_DAYS } from "./theory-content";
import { initialTheorySchedule, applyTheoryReview, type TheoryResult } from "./theory-scheduling";
import { releaseCount } from "./scheduling";

export interface TheoryProgress {
  concept_day: number;
  category: string;
  rung: number;
  next_review: string;
  your_answer: string;
  question: string;
  answer: string;
}

export function migrateTheory(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS theory_schedule (
      concept_day INTEGER PRIMARY KEY,
      category TEXT NOT NULL DEFAULT '',
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      question TEXT NOT NULL DEFAULT '',
      answer TEXT NOT NULL DEFAULT ''
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

  const columns = db.query(`PRAGMA table_info(theory_schedule)`).all() as { name: string }[];
  const needsContentColumns = !columns.some((c) => c.name === "category");
  if (needsContentColumns) {
    db.exec(`
      ALTER TABLE theory_schedule ADD COLUMN category TEXT NOT NULL DEFAULT '';
      ALTER TABLE theory_schedule ADD COLUMN question TEXT NOT NULL DEFAULT '';
      ALTER TABLE theory_schedule ADD COLUMN answer TEXT NOT NULL DEFAULT '';
    `);
    backfillCategories(db);
  }

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
    `INSERT INTO theory_schedule (concept_day, category, rung, next_review, your_answer) VALUES (?, ?, ?, ?, '')`,
  );
  for (const concept of buildTheorySchedule()) {
    const { rung, nextReview } = initialTheorySchedule(today, concept.day);
    insert.run(concept.day, concept.category, rung, nextReview);
  }
}

// Sets each row's category from the static day->category structure. Used
// when upgrading a pre-existing db that predates the category/question/
// answer columns — every row already exists, it just needs its category
// filled in (question/answer stay blank via the column default).
function backfillCategories(db: Database): void {
  const update = db.query(`UPDATE theory_schedule SET category = ? WHERE concept_day = ?`);
  for (const concept of buildTheorySchedule()) {
    update.run(concept.category, concept.day);
  }
}
```

Leave `backfillReleaseWatermark` and `runTheoryReleaseGate` exactly as they
are — they're unaffected by content, and `runTheoryReleaseGate`'s own
backlog query must keep counting blank concepts (see Global Constraints).

- [ ] **Step 4: Add the blank-content filter to the display-facing queries**

Replace `listDueTheory` and `countOverdueTheory`:

```ts
// Everything due today or overdue among *released, content-filled*
// concepts — capped at MAX_ACTIVE_BACKLOG by the release gate, and hidden
// entirely if content hasn't been added yet. The gate itself (above) does
// NOT apply this filter — it must keep counting blank concepts as backlog,
// or it would see an artificially-empty backlog and release everything at
// once.
export function listDueTheory(db: Database, today: string): TheoryProgress[] {
  runTheoryReleaseGate(db, today);
  return db
    .query(
      `SELECT concept_day, category, rung, next_review, your_answer, question, answer FROM theory_schedule
       WHERE concept_day <= (SELECT released_up_to FROM theory_state) AND next_review <= ? AND question != ''
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
       WHERE concept_day <= (SELECT released_up_to FROM theory_state) AND next_review < ? AND question != ''`,
    )
    .get(today) as { n: number };
  return row.n;
}
```

- [ ] **Step 5: Update the remaining read/write functions to select the new columns**

Replace `getTheoryConcept` and `listTheoryCompletedToday`:

```ts
export function getTheoryConcept(db: Database, conceptDay: number): TheoryProgress | null {
  return db
    .query(
      `SELECT concept_day, category, rung, next_review, your_answer, question, answer
       FROM theory_schedule WHERE concept_day = ?`,
    )
    .get(conceptDay) as TheoryProgress | null;
}
```

```ts
export function listTheoryCompletedToday(db: Database, today: string): TheoryProgress[] {
  return db
    .query(
      `SELECT DISTINCT ts.concept_day, ts.category, ts.rung, ts.next_review, ts.your_answer, ts.question, ts.answer
       FROM theory_schedule ts
       JOIN theory_reviews tr ON tr.concept_day = ts.concept_day
       WHERE tr.reviewed_at = ?
       ORDER BY ts.concept_day`,
    )
    .all(today) as TheoryProgress[];
}
```

(`saveTheoryAnswer` and `reviewTheoryConcept` don't need changes — they
already return their result via `getTheoryConcept`, which now includes the
new columns automatically.)

- [ ] **Step 6: Add `saveTheoryContent` and `getNextBlankConcept`**

Append to `theory-db.ts`:

```ts
export function saveTheoryContent(
  db: Database,
  conceptDay: number,
  question: string,
  answer: string,
): TheoryProgress | null {
  db.query(`UPDATE theory_schedule SET question = ?, answer = ? WHERE concept_day = ?`).run(
    question,
    answer,
    conceptDay,
  );
  return getTheoryConcept(db, conceptDay);
}

export interface NextBlankConcept {
  conceptDay: number;
  category: string;
}

export function getNextBlankConcept(db: Database): NextBlankConcept | null {
  const row = db
    .query(`SELECT concept_day, category FROM theory_schedule WHERE question = '' ORDER BY concept_day LIMIT 1`)
    .get() as { concept_day: number; category: string } | null;
  return row ? { conceptDay: row.concept_day, category: row.category } : null;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `bun test theory-db.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 8: Commit**

```bash
git add theory-db.ts theory-db.test.ts
git commit -m "Move Theory content into the database, hide blank concepts from due lists"
```

---

### Task 2: `theory-api.ts` — next-blank and content routes

**Files:**
- Modify: `theory-api.ts`
- Test: `theory-api.test.ts`

**Interfaces:**
- Consumes: `saveTheoryContent`, `getNextBlankConcept` from `./theory-db` (Task 1). `TheoryProgress` now includes `category`/`question`/`answer` (Task 1) — every existing route's JSON response automatically carries these.
- Produces: `GET /api/theory/next-blank -> { conceptDay: number; category: string } | null`, `PUT /api/theory/:day/content -> TheoryProgress` (consumed by Task 4, `TheoryApp.tsx`).

- [ ] **Step 1: Rewrite `theory-api.test.ts` with the new expected behavior**

Replace the full contents of `theory-api.test.ts` with:

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { localToday, addDays } from "./scheduling";

let server: ReturnType<typeof Bun.serve>;
let base: string;

const putContent = (day: number | string, question: string, answer: string) =>
  fetch(`${base}/api/theory/${day}/content`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, answer }),
  });

beforeEach(() => {
  const db = new Database(":memory:");
  migrateTheory(db, localToday());
  server = Bun.serve({ port: 0, routes: theoryApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/theory/due starts empty until concepts have content, even though 5 are released under the cap", async () => {
  const body: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(body.due).toEqual([]);
  expect(body.stats).toEqual({ dueCount: 0, overdueCount: 0, completedToday: 0 });
});

test("GET /api/theory/due shows released concepts once they have content", async () => {
  await putContent(1, "Q1", "A1");
  await putContent(2, "Q2", "A2");
  const body: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(body.due.map((d: any) => d.concept_day)).toEqual([1, 2]);
  expect(body.stats.dueCount).toBe(2);
});

test("POST /api/theory/:day/answer saves a draft without touching scheduling", async () => {
  const res = await fetch(`${base}/api/theory/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ yourAnswer: "draft" }),
  });
  expect(res.status).toBe(200);
  const saved: any = await res.json();
  expect(saved.your_answer).toBe("draft");
  expect(saved.rung).toBe(-1);
});

test("POST /api/theory/:day/review 'correct' advances rung 3 days out, and the next concept fills the vacated slot", async () => {
  for (let day = 1; day <= 6; day++) await putContent(day, `Q${day}`, `A${day}`);

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

test("POST /api/theory/:day/review 'wrong' reschedules tomorrow and stays off today's list", async () => {
  const res = await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "wrong" }),
  });
  const updated: any = await res.json();
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe(addDays(localToday(), 1));
});

test("review rejects a bad result value", async () => {
  const res = await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "meh" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/theory/completed-today lists concepts reviewed today only", async () => {
  expect(await (await fetch(`${base}/api/theory/completed-today`)).json()).toEqual([]);

  await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  const completed: any = await (await fetch(`${base}/api/theory/completed-today`)).json();
  expect(completed.length).toBe(1);
  expect(completed[0].concept_day).toBe(1);
});

test("day out of range (0, 151, non-numeric) is rejected with 400 on all per-day routes", async () => {
  for (const bad of ["0", "151", "abc"]) {
    const answerRes = await fetch(`${base}/api/theory/${bad}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ yourAnswer: "x" }),
    });
    expect(answerRes.status).toBe(400);

    const reviewRes = await fetch(`${base}/api/theory/${bad}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result: "correct" }),
    });
    expect(reviewRes.status).toBe(400);

    const contentRes = await putContent(bad, "Q", "A");
    expect(contentRes.status).toBe(400);
  }
});

test("GET /api/theory/next-blank returns concept 1 with its category on a fresh install", async () => {
  const next: any = await (await fetch(`${base}/api/theory/next-blank`)).json();
  expect(next.conceptDay).toBe(1);
  expect(typeof next.category).toBe("string");
  expect(next.category.length).toBeGreaterThan(0);
});

test("GET /api/theory/next-blank advances as content is added", async () => {
  await putContent(1, "Q1", "A1");
  const next: any = await (await fetch(`${base}/api/theory/next-blank`)).json();
  expect(next.conceptDay).toBe(2);
});

test("GET /api/theory/next-blank returns null once all 150 concepts have content", async () => {
  for (let day = 1; day <= 150; day++) await putContent(day, `Q${day}`, `A${day}`);
  const next = await (await fetch(`${base}/api/theory/next-blank`)).json();
  expect(next).toBeNull();
});

test("PUT /api/theory/:day/content saves question and answer", async () => {
  const res = await putContent(3, "What is CAP theorem?", "Consistency, Availability, Partition tolerance.");
  expect(res.status).toBe(200);
  const updated: any = await res.json();
  expect(updated.concept_day).toBe(3);
  expect(updated.question).toBe("What is CAP theorem?");
  expect(updated.answer).toBe("Consistency, Availability, Partition tolerance.");
});

test("PUT /api/theory/:day/content rejects a blank question or answer", async () => {
  const res1 = await putContent(1, "", "An answer");
  expect(res1.status).toBe(400);
  const res2 = await putContent(1, "A question", "");
  expect(res2.status).toBe(400);
});

test("PUT /api/theory/:day/content can overwrite existing content", async () => {
  await putContent(1, "Old Q", "Old A");
  const res = await putContent(1, "New Q", "New A");
  const updated: any = await res.json();
  expect(updated.question).toBe("New Q");
  expect(updated.answer).toBe("New A");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test theory-api.test.ts`
Expected: FAIL — `/api/theory/next-blank` and `PUT /api/theory/:day/content` don't exist yet, and the first two tests' expectations don't match the pre-Task-1-alignment route (this file is being fully replaced, so failures come from the missing routes).

- [ ] **Step 3: Add the two new routes**

In `theory-api.ts`, change the import line:

```ts
import {
  countOverdueTheory,
  countTheoryReviewsToday,
  getNextBlankConcept,
  listDueTheory,
  listTheoryCompletedToday,
  reviewTheoryConcept,
  saveTheoryAnswer,
  saveTheoryContent,
} from "./theory-db";
```

Then add two new route entries inside the object returned by `theoryApiRoutes` (alongside the existing `/api/theory/due`, `/api/theory/completed-today`, `/api/theory/:day/answer`, `/api/theory/:day/review`):

```ts
    "/api/theory/next-blank": {
      GET: () => json(getNextBlankConcept(db)),
    },
    "/api/theory/:day/content": {
      PUT: async (req: Request & { params: { day: string } }) => {
        const day = parseConceptDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_DAYS}` }, 400);
        const body = (await req.json().catch(() => null)) as { question?: unknown; answer?: unknown } | null;
        const question = typeof body?.question === "string" ? body.question.trim() : "";
        const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
        if (!question || !answer) {
          return json({ error: "question and answer are required" }, 400);
        }
        const updated = saveTheoryContent(db, day, question, answer);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test theory-api.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add theory-api.ts theory-api.test.ts
git commit -m "Add next-blank and content routes for authoring Theory concepts"
```

---

### Task 3: `home-api.ts` — drop the static schedule lookup

**Files:**
- Modify: `home-api.ts`
- Test: `home-api.test.ts`

**Interfaces:**
- Consumes: `TheoryProgress.category`/`.question`/`.answer` from `./theory-db` (Task 1) and `saveTheoryContent` for test fixtures.

- [ ] **Step 1: Update `home-api.test.ts`**

Change the import line from:

```ts
import { migrateTheory, reviewTheoryConcept } from "./theory-db";
```

to:

```ts
import { migrateTheory, reviewTheoryConcept, saveTheoryContent } from "./theory-db";
```

Replace the test `"GET /api/home/due includes concept 1 by default (Theory seeds due-today on day one)"` with:

```ts
test("GET /api/home/due includes a theory concept once it has content", async () => {
  saveTheoryContent(db, 1, "Q1", "A1");
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "theory" && i.linkId === 1)).toBe(true);
});
```

Replace the test `"GET /api/home/stats starts with the first 5 theory concepts due today, nothing overdue, nothing completed"` with two tests:

```ts
test("GET /api/home/stats starts with 0 due when theory concepts are all blank", async () => {
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: 0, overdue: 0, completedToday: 0 });
});

test("GET /api/home/stats counts theory concepts once they have content, up to the released cap", async () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: 5, overdue: 0, completedToday: 0 });
});
```

In the test `"GET /api/home/stats counts dueToday and overdue across all three sources"`, add a content-seeding line and update the comment:

```ts
test("GET /api/home/stats counts dueToday and overdue across all three sources", async () => {
  createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  ); // due today
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const overdueProject = createProject(db, "Overdue project", addDays(TODAY, 10), addDays(TODAY, -3));
  createStep(db, overdueProject.id, "Overdue step", 20, addDays(TODAY, -3)); // overdue

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.dueToday).toBe(6); // leetcode problem + 5 theory concepts (now with content)
  expect(stats.overdue).toBe(1); // the goals step
});
```

Replace the test `"overdueDays is 0 for an item due today and positive for an overdue item"` with:

```ts
test("overdueDays is 0 for an item due today and positive for an overdue item", async () => {
  saveTheoryContent(db, 1, "Q1", "A1");
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

Every other test in the file is unaffected: the LeetCode-only, Goals-only,
and completed-today tests don't depend on Theory content (`countTheoryReviewsToday`
and review-based completions work regardless of a concept's content, and
none of them assert on Theory's `title`/`subtitle` text).

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test home-api.test.ts`
Expected: FAIL — `home-api.ts` still imports `SCHEDULE` and filters/maps
through it, so a blank-content concept currently gets silently dropped
by the OLD `.filter((entry) => SCHEDULE[entry.concept_day - 1])` check
in a way inconsistent with the new tests' expectations (and the new tests
themselves expect content seeded via `saveTheoryContent` to show up, which
the current `theoryDue`/`theoryCompletedToday` still resolve via `SCHEDULE`
rather than the row's own columns).

- [ ] **Step 3: Simplify `theoryDue` and `theoryCompletedToday`**

Remove this line near the top of `home-api.ts`:

```ts
import { buildTheorySchedule } from "./theory-content";

const SCHEDULE = buildTheorySchedule();
```

(Delete both the import and the `SCHEDULE` constant entirely — nothing else
in this file needs them after this task.)

Replace `theoryDue`:

```ts
function theoryDue(db: Database, today: string): DueItem[] {
  return listDueTheory(db, today).map((entry) => ({
    source: "theory" as const,
    id: entry.concept_day,
    title: entry.question,
    subtitle: entry.category,
    dueDate: entry.next_review,
    overdueDays: overdueDays(entry.next_review, today),
    linkId: entry.concept_day,
  }));
}
```

Replace `theoryCompletedToday`:

```ts
function theoryCompletedToday(db: Database, today: string): DueItem[] {
  return listTheoryCompletedToday(db, today).map((entry) => ({
    source: "theory" as const,
    id: entry.concept_day,
    title: entry.question,
    subtitle: entry.category,
    dueDate: today,
    overdueDays: 0,
    linkId: entry.concept_day,
  }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test home-api.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add home-api.ts home-api.test.ts
git commit -m "Read Theory content from the database in Home aggregation"
```

---

### Task 4: `TheoryApp.tsx` — drop the static schedule lookup, add the "+ Add theory" flow

**Files:**
- Modify: `TheoryApp.tsx`

**Interfaces:**
- Consumes: `GET /api/theory/next-blank`, `PUT /api/theory/:day/content` (Task 2). `TheoryProgress` objects from `/api/theory/due` now carry `category`/`question`/`answer` (Task 1) — no per-file interface produced, this is the last task in the plan.

- [ ] **Step 1: Drop the static schedule import and lookups**

Replace:

```ts
import { buildTheorySchedule, type Category } from "./theory-content";
```

with:

```ts
import type { Category } from "./theory-content";
```

Delete this line entirely (no longer needed):

```ts
const SCHEDULE = buildTheorySchedule();
```

In `TheoryListModal`, replace the `sorted.map` block:

```tsx
            {sorted.map((entry) => {
              const concept = SCHEDULE[entry.concept_day - 1];
              if (!concept) return null;
              return (
                <li key={entry.concept_day}>
                  <button
                    className="modal-row"
                    onClick={() => {
                      onOpen(entry.concept_day);
                      onClose();
                    }}
                  >
                    <span className="modal-row-date">{entry.next_review}</span>
                    <span
                      className="cat-tag"
                      style={{ "--cat-color": CATEGORY_COLORS[concept.category] } as React.CSSProperties}
                    >
                      {concept.category}
                    </span>
                    <span className="modal-row-title">{concept.question}</span>
                    <TheoryRungMeter rung={entry.rung} />
                  </button>
                </li>
              );
            })}
```

with:

```tsx
            {sorted.map((entry) => (
              <li key={entry.concept_day}>
                <button
                  className="modal-row"
                  onClick={() => {
                    onOpen(entry.concept_day);
                    onClose();
                  }}
                >
                  <span className="modal-row-date">{entry.next_review}</span>
                  <span
                    className="cat-tag"
                    style={{ "--cat-color": CATEGORY_COLORS[entry.category as Category] } as React.CSSProperties}
                  >
                    {entry.category}
                  </span>
                  <span className="modal-row-title">{entry.question}</span>
                  <TheoryRungMeter rung={entry.rung} />
                </button>
              </li>
            ))}
```

In `TheoryDueBoard`, replace the `due.map` block:

```tsx
          {due.map((entry, i) => {
            const concept = SCHEDULE[entry.concept_day - 1]!;
            const overdue = daysBetween(entry.next_review, today);
            const color = overdue > 0 ? "red" : "gold";
            return (
              <li key={entry.concept_day} style={{ animationDelay: `${i * 60}ms` }}>
                <button
                  className="board-row board-row-main"
                  style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                  onClick={() => onOpen(entry.concept_day)}
                >
                  <span className="tag">{overdue > 0 ? `${overdue}d late` : "due"}</span>
                  <span
                    className="cat-tag"
                    style={{ "--cat-color": CATEGORY_COLORS[concept.category] } as React.CSSProperties}
                  >
                    {concept.category}
                  </span>
                  <span className="board-title">{concept.question}</span>
                  <TheoryRungMeter rung={entry.rung} />
                </button>
              </li>
            );
          })}
```

with:

```tsx
          {due.map((entry, i) => {
            const overdue = daysBetween(entry.next_review, today);
            const color = overdue > 0 ? "red" : "gold";
            return (
              <li key={entry.concept_day} style={{ animationDelay: `${i * 60}ms` }}>
                <button
                  className="board-row board-row-main"
                  style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                  onClick={() => onOpen(entry.concept_day)}
                >
                  <span className="tag">{overdue > 0 ? `${overdue}d late` : "due"}</span>
                  <span
                    className="cat-tag"
                    style={{ "--cat-color": CATEGORY_COLORS[entry.category as Category] } as React.CSSProperties}
                  >
                    {entry.category}
                  </span>
                  <span className="board-title">{entry.question}</span>
                  <TheoryRungMeter rung={entry.rung} />
                </button>
              </li>
            );
          })}
```

In `TheoryDetail`, remove this line:

```ts
  const concept = SCHEDULE[entry.concept_day - 1]!;
```

and replace every remaining `concept.category` / `concept.question` /
`concept.answer` reference in the same function with `entry.category` /
`entry.question` / `entry.answer` respectively — that's the `review`
function's `openTheoryCalendarAdd(concept.category, concept.question, ...)`
call, the header's `cat-tag` span, the `<h2 className="theory-question">`,
and the model-answer `<p>`. The header's `CATEGORY_COLORS` lookup becomes
`CATEGORY_COLORS[entry.category as Category]`.

- [ ] **Step 2: Add the "+ Add theory" API calls**

In the `api` object near the top of the file, add two entries:

```ts
const api = {
  due: () =>
    fetch("/api/theory/due").then(
      (r) => r.json() as Promise<{ due: TheoryProgress[]; stats: Stats }>,
    ),
  nextBlank: () =>
    fetch("/api/theory/next-blank").then(
      (r) => r.json() as Promise<{ conceptDay: number; category: string } | null>,
    ),
  saveContent: (conceptDay: number, question: string, answer: string) =>
    fetch(`/api/theory/${conceptDay}/content`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, answer }),
    }).then((r) => r.json() as Promise<TheoryProgress>),
  saveAnswer: (conceptDay: number, yourAnswer: string) =>
    fetch(`/api/theory/${conceptDay}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ yourAnswer }),
    }).then((r) => r.json() as Promise<TheoryProgress>),
  review: (conceptDay: number, result: Result) =>
    fetch(`/api/theory/${conceptDay}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }).then((r) => r.json() as Promise<TheoryProgress>),
};
```

- [ ] **Step 3: Add the `AddTheoryContentForm` component**

Add this new function anywhere between `TheoryDueBoard` and `TheoryDetail`:

```tsx
function AddTheoryContentForm({
  conceptDay,
  category,
  onCancel,
  onSaved,
}: {
  conceptDay: number;
  category: string;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) {
          setError("Question and answer are both required.");
          return;
        }
        await api.saveContent(conceptDay, question.trim(), answer.trim());
        await onSaved();
      }}
    >
      <span
        className="cat-tag"
        style={{ "--cat-color": CATEGORY_COLORS[category as Category] } as React.CSSProperties}
      >
        {category}
      </span>
      <label>
        Question
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} autoFocus />
      </label>
      <label>
        Answer
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Save concept {conceptDay}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Wire the "+ Add theory" button into `TheoryApp`**

Change the `View` type:

```ts
type View = { name: "board" } | { name: "detail"; conceptDay: number } | { name: "addContent"; conceptDay: number; category: string };
```

In the `TheoryApp` component, add state for the "all filled" notice:

```ts
  const [nextBlankNotice, setNextBlankNotice] = useState<string | null>(null);

  const startAddingContent = async () => {
    const slot = await api.nextBlank();
    if (slot === null) {
      setNextBlankNotice("All 150 concepts have content.");
      return;
    }
    setNextBlankNotice(null);
    setView({ name: "addContent", conceptDay: slot.conceptDay, category: slot.category });
  };
```

Replace the board-view render block:

```tsx
      {view.name === "board" && (
        <TheoryDueBoard due={due} today={today} onOpen={(conceptDay) => setView({ name: "detail", conceptDay })} />
      )}
```

with:

```tsx
      {view.name === "board" && (
        <>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={startAddingContent}>+ Add theory</button>
          </div>
          {nextBlankNotice && <p className="board-empty">{nextBlankNotice}</p>}
          <TheoryDueBoard due={due} today={today} onOpen={(conceptDay) => setView({ name: "detail", conceptDay })} />
        </>
      )}

      {view.name === "addContent" && (
        <AddTheoryContentForm
          conceptDay={view.conceptDay}
          category={view.category}
          onCancel={() => setView({ name: "board" })}
          onSaved={async () => {
            await refresh();
            setView({ name: "board" });
          }}
        />
      )}
```

- [ ] **Step 5: Type-check**

Run: `bunx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Manual verification**

Run: `bun --hot index.ts` (set `PORT` if the default is busy).

On the Theory tab:
1. Confirm the Due board is empty (all content is blank right now) except
   for any concepts you may have already filled in.
2. Click "+ Add theory" — confirm it opens a form showing concept 1's
   category, with empty question/answer fields.
3. Fill in both fields and save — confirm the form closes, and if concept 1
   is within the released backlog, it now appears on the Due board with
   your content.
4. Click "+ Add theory" again — confirm it now offers concept 2 (or
   whichever is the next blank slot).
5. Open a due concept from the board and confirm the detail view still
   shows the right category/question/answer and the review flow (Correct/
   Wrong, calendar quick-add) still works.

- [ ] **Step 7: Commit**

```bash
git add TheoryApp.tsx
git commit -m "Add + Add theory flow, read content directly from the API instead of the static schedule"
```

---

## Self-Review Notes

- **Spec coverage:** schema + blank-filtering + gate-safety (Task 1) ✅;
  next-blank/content routes (Task 2) ✅; Home aggregation simplification
  (Task 3) ✅; Theory tab simplification + "+ Add theory" UI (Task 4) ✅.
  Out-of-scope items from the design doc (Goals finish button, editing
  already-filled content from the due board, extending past 150 days) are
  untouched by every task, as intended.
- **Type consistency:** `saveTheoryContent(db, conceptDay, question, answer)`
  and `getNextBlankConcept(db)` signatures match between their Task 1
  definition and Task 2's/Task 4's usage. `TheoryProgress`'s new fields
  (`category`, `question`, `answer`) are consumed identically by Task 2's
  routes (pass-through), Task 3's `home-api.ts` mapping, and Task 4's
  frontend rendering.
- **No placeholders:** every step contains complete, runnable code.
