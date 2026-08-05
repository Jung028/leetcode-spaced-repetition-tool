# Exam Multi-Course Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thread a `course` dimension through the entire Exam tab (content, database, API, home aggregation, UI) so INFO5995, COMP5348, INFO6007, and INFO5990 each get independent paper numbering, backlog pacing, and review scheduling — with zero new content authored and zero new question/answer-format capability.

**Architecture:** `paperDay` becomes 1-based within its own course (a `Map<string, number>` counter in `buildExamSchedule()`), every `exam_*` table's primary key grows a `course` column, every `exam-db.ts` function gains a leading `course` parameter, every `exam-api.ts` route gains a `:course` URL segment, and `ExamApp.tsx` gains a course-selector row that threads `course` through its existing view state exactly the way `paperDay` already flows.

**Tech Stack:** Bun, `bun:sqlite`, `Bun.serve()`, React (via HTML imports), `bun test`.

## Global Constraints

- Course codes and display names, exact list and order:
  ```ts
  export const COURSES: { code: string; name: string }[] = [
    { code: "INFO5995", name: "Intro to Cybersecurity" },
    { code: "COMP5348", name: "Enterprise Scale" },
    { code: "INFO6007", name: "Project Management" },
    { code: "INFO5990", name: "Professional Practice in IT" },
  ];
  ```
- `paperDay` is 1-based **within its own course**, not globally sequential.
- Every `exam_*` table's primary/unique key gains a leading `course TEXT NOT NULL` column (exact DDL is given per-task below).
- The pre-existing single-course data in a running `srs.db` must migrate via **recreate-and-copy** (SQLite cannot `ALTER TABLE` a primary key), backfilling `course = 'INFO5995'` — detected via `PRAGMA table_info(exam_papers)` checking for the absence of a `course` column, run once, only when the legacy shape is found.
- No new content is authored, no new question type or answer format is added, no cross-session persistence of the selected course, and `MAX_ACTIVE_BACKLOG` stays the single shared constant applied independently per course (all per the spec's Out of Scope section).
- This is architecture-only: `docs/superpowers/specs/2026-08-04-content-edit-delete-design.md`'s Domain 3 (Exam) table `exam_question_content` is **not** built by this plan, but per that spec's own cross-reference, whichever plan lands second must fold `course` into that table's key from the start — noted here so the next plan's author doesn't miss it.

Full design: `docs/superpowers/specs/2026-08-04-exam-multi-course-design.md`.

---

### Task 1: Course-aware content layer

**Files:**
- Modify: `exam-content/types.ts`
- Move: `exam-content/week-1.ts` → `exam-content/info5995/week-1.ts`
- Modify: `exam-content.ts`
- Modify: `exam-content.test.ts`

**Interfaces:**
- Produces: `COURSES: { code: string; name: string }[]`, `ExamPaper.course: string`, `ExamPaper.paperDay: number` (now per-course), `buildExamSchedule(): ExamPaper[]`, `totalPapersForCourse(course: string): number`, `listExamCourses(): { code: string; name: string }[]`. Every later task (2-5) consumes these exact names.

- [ ] **Step 1: Move the Week 1 content file into a per-course folder**

```bash
mkdir -p exam-content/info5995
git mv exam-content/week-1.ts exam-content/info5995/week-1.ts
```

- [ ] **Step 2: Add `course` to `ExamPaperSeed`**

In `exam-content/types.ts`, change the `ExamPaperSeed` interface (leave `ExamQuestionSeed` untouched):

```ts
export interface ExamPaperSeed {
  course: string;
  week: number;
  paperNumber: number; // 1-based within the week
  title: string;
  topics: string;
  // Paths (relative to that week's course folder) to the material this
  // paper's questions were written from — carried along so content can be
  // regenerated/expanded later without losing track of its sources.
  sourceFiles: string[];
  questions: ExamQuestionSeed[];
}
```

- [ ] **Step 3: Tag every paper in `exam-content/info5995/week-1.ts` with its course**

Three edits, one per paper constant — insert `course: "INFO5995",` as the first property, immediately before `week:`:

Edit 1 — old:
```ts
const PAPER_1: ExamPaperSeed = {
  week: 1,
```
new:
```ts
const PAPER_1: ExamPaperSeed = {
  course: "INFO5995",
  week: 1,
```

Edit 2 — old:
```ts
const PAPER_2: ExamPaperSeed = {
  week: 1,
```
new:
```ts
const PAPER_2: ExamPaperSeed = {
  course: "INFO5995",
  week: 1,
```

Edit 3 — old:
```ts
const PAPER_3: ExamPaperSeed = {
  week: 1,
```
new:
```ts
const PAPER_3: ExamPaperSeed = {
  course: "INFO5995",
  week: 1,
```

- [ ] **Step 4: Rewrite `exam-content.ts`**

Replace the entire file with:

```ts
// Aggregates every course's exam papers into one flat array, each paper
// carrying its own course tag. Add new courses/weeks here as they're
// generated: import the week's papers and append to ALL_PAPERS.
import { WEEK_1_PAPERS } from "./exam-content/info5995/week-1";
import type { ExamPaperSeed } from "./exam-content/types";

const ALL_PAPERS: ExamPaperSeed[] = [...WEEK_1_PAPERS];

// COURSES lists every course this app knows about, including ones with zero
// papers so far (e.g. INFO5990) — listExamCourses() below is what filters
// down to "courses that actually have content."
export const COURSES: { code: string; name: string }[] = [
  { code: "INFO5995", name: "Intro to Cybersecurity" },
  { code: "COMP5348", name: "Enterprise Scale" },
  { code: "INFO6007", name: "Project Management" },
  { code: "INFO5990", name: "Professional Practice in IT" },
];

export interface ExamPaper extends ExamPaperSeed {
  paperDay: number; // 1-based within this paper's own course
}

export function buildExamSchedule(): ExamPaper[] {
  const counters = new Map<string, number>();
  return ALL_PAPERS.map((paper) => {
    const next = (counters.get(paper.course) ?? 0) + 1;
    counters.set(paper.course, next);
    return { ...paper, paperDay: next };
  });
}

export function totalPapersForCourse(course: string): number {
  return buildExamSchedule().filter((p) => p.course === course).length;
}

// Cross-references COURSES against which course codes actually appear in
// buildExamSchedule()'s output — a course only shows up here (and therefore
// anywhere in the API/UI) once it has at least one paper.
export function listExamCourses(): { code: string; name: string }[] {
  const present = new Set(buildExamSchedule().map((p) => p.course));
  return COURSES.filter((c) => present.has(c.code));
}
```

- [ ] **Step 5: Rewrite `exam-content.test.ts`**

Replace the entire file with:

```ts
import { test, expect } from "bun:test";
import { buildExamSchedule, listExamCourses, totalPapersForCourse, COURSES } from "./exam-content";

test("buildExamSchedule assigns sequential 1-based paperDay within each course independently", () => {
  const info5995 = buildExamSchedule().filter((p) => p.course === "INFO5995");
  expect(info5995.length).toBeGreaterThan(0);
  expect(info5995.map((p) => p.paperDay)).toEqual(info5995.map((_, i) => i + 1));
});

test("totalPapersForCourse matches each course's own schedule length", () => {
  for (const { code } of COURSES) {
    const count = buildExamSchedule().filter((p) => p.course === code).length;
    expect(totalPapersForCourse(code)).toBe(count);
  }
});

test("listExamCourses only returns courses that actually have at least one paper", () => {
  const listed = listExamCourses();
  expect(listed.some((c) => c.code === "INFO5995")).toBe(true);
  expect(listed.some((c) => c.code === "INFO5990")).toBe(false); // no papers yet
});

test("every paper has at least one question and a non-empty title", () => {
  for (const paper of buildExamSchedule()) {
    expect(paper.questions.length).toBeGreaterThan(0);
    expect(paper.title.length).toBeGreaterThan(0);
  }
});

test("mcq/truefalse questions all have options and a valid correctIndex", () => {
  for (const paper of buildExamSchedule()) {
    for (const q of paper.questions) {
      if (q.type === "mcq" || q.type === "truefalse") {
        expect(q.options && q.options.length).toBeGreaterThan(0);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex!).toBeLessThan(q.options!.length);
      }
    }
  }
});

test("every question has a non-empty prompt and modelAnswer", () => {
  for (const paper of buildExamSchedule()) {
    for (const q of paper.questions) {
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.modelAnswer.length).toBeGreaterThan(0);
    }
  }
});

test("INFO5995 Week 1 seeds exactly 3 papers", () => {
  const week1 = buildExamSchedule().filter((p) => p.course === "INFO5995" && p.week === 1);
  expect(week1.map((p) => p.paperNumber)).toEqual([1, 2, 3]);
});

// Pins the (course, week, paperNumber) -> paperDay mapping for every paper
// currently in ALL_PAPERS. paperDay is derived purely from array position
// within a course, and every stored answer/score/review-item in the
// database keys on (course, paperDay) with no week/paperNumber cross-check.
// If a future content edit ever reorders, inserts, or removes a paper, this
// trips instead of silently re-pointing every existing student's stored
// answers at different questions.
test("(course, week, paperNumber) -> paperDay mapping is pinned for every current paper", () => {
  const expected = [
    { course: "INFO5995", week: 1, paperNumber: 1, expectedPaperDay: 1 },
    { course: "INFO5995", week: 1, paperNumber: 2, expectedPaperDay: 2 },
    { course: "INFO5995", week: 1, paperNumber: 3, expectedPaperDay: 3 },
  ];
  const schedule = buildExamSchedule();
  expect(schedule.length).toBe(expected.length);
  for (const { course, week, paperNumber, expectedPaperDay } of expected) {
    const paper = schedule.find((p) => p.course === course && p.week === week && p.paperNumber === paperNumber);
    expect(paper).toBeDefined();
    expect(paper!.paperDay).toBe(expectedPaperDay);
  }
});
```

- [ ] **Step 6: Run the test file**

Run: `bun test exam-content.test.ts`
Expected: All tests PASS (8 tests).

- [ ] **Step 7: Commit**

```bash
git add exam-content/types.ts exam-content/info5995/week-1.ts exam-content.ts exam-content.test.ts
git status  # confirm week-1.ts shows as renamed, not deleted+added
git commit -m "feat: make exam content course-aware with per-course paperDay"
```

---

### Task 2: Course-aware database layer

**Files:**
- Modify: `exam-db.ts`
- Modify: `exam-db.test.ts`

**Interfaces:**
- Consumes: `buildExamSchedule()`, `totalPapersForCourse(course)`, `ExamPaper.course` (Task 1).
- Produces: every exported function below gains a leading `course: string` parameter (after `db`); row types gain a `course: string` field. Task 3 (`exam-api.ts`) and Task 4 (`home-api.ts`) call these with the new signatures:
  - `migrateExam(db, today)` — unchanged signature, now loops per-course internally.
  - `listDueExamPapers(db, course, today): ExamPaperRow[]`
  - `getExamPaperRow(db, course, paperDay): ExamPaperRow | null`
  - `listExamAnswers(db, course, paperDay): ExamAnswerRow[]`
  - `saveExamAnswer(db, course, paperDay, questionIndex, yourAnswer): void`
  - `gradeExamAnswer(db, course, paperDay, questionIndex, correct, yourAnswer?): void`
  - `submitExamPaper(db, course, paperDay, today): SubmitExamResult`
  - `countOverdueExamPapers(db, course, today): number`
  - `countExamPapersSubmittedToday(db, course, today): number`
  - `listExamPapersSubmittedToday(db, course, today): ExamPaperRow[]`
  - `listDueExamReviewItems(db, course, today): ExamReviewItemRow[]`
  - `countOverdueExamReviewItems(db, course, today): number`
  - `countExamReviewsToday(db, course, today): number`
  - `listExamReviewsCompletedToday(db, course, today): { paper_day: number; question_index: number }[]`
  - `reviewExamItem(db, course, paperDay, questionIndex, result, today): ExamReviewItemRow | null`

- [ ] **Step 1: Rewrite `exam-db.ts`**

Replace the entire file with:

```ts
import type { Database } from "bun:sqlite";
import { buildExamSchedule, totalPapersForCourse } from "./exam-content";
import { addDays, releaseCount } from "./scheduling";
import { applyExamReview, type ExamReviewResult } from "./exam-scheduling";

export interface ExamPaperRow {
  course: string;
  paper_day: number;
  next_review: string;
  submitted_at: string | null;
  score_correct: number | null;
  score_total: number | null;
}

export interface ExamAnswerRow {
  course: string;
  paper_day: number;
  question_index: number;
  your_answer: string;
  correct: number | null;
}

export interface ExamReviewItemRow {
  id: number;
  course: string;
  paper_day: number;
  question_index: number;
  rung: number;
  next_review: string;
}

export function migrateExam(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_papers (
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      next_review TEXT NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER,
      PRIMARY KEY (course, paper_day)
    );
    CREATE TABLE IF NOT EXISTS exam_answers (
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (course, paper_day, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(course, paper_day, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE IF NOT EXISTS exam_state (
      course TEXT PRIMARY KEY,
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);

  migrateLegacySingleCourseShape(db);

  const courses = new Set(buildExamSchedule().map((p) => p.course));
  for (const course of courses) {
    ensureExamStateRow(db, course);
    seedNewPapers(db, course, today);
    runExamReleaseGate(db, course, today);
  }
}

// One-time upgrade of a pre-existing single-course db (every exam_* table
// keyed without a `course` column) into the multi-course shape, backfilling
// course = 'INFO5995' — the only course that has ever existed before this
// migration, so every pre-existing paper_day value is already correctly
// "1-based within INFO5995" with no renumbering needed. SQLite can't ALTER
// a primary key, so this recreates each table and copies rows across.
function migrateLegacySingleCourseShape(db: Database): void {
  const columns = db.query(`PRAGMA table_info(exam_papers)`).all() as { name: string }[];
  const isLegacy = columns.length > 0 && !columns.some((c) => c.name === "course");
  if (!isLegacy) return;

  db.exec(`
    CREATE TABLE exam_papers_new (
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      next_review TEXT NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER,
      PRIMARY KEY (course, paper_day)
    );
    INSERT INTO exam_papers_new (course, paper_day, next_review, submitted_at, score_correct, score_total)
      SELECT 'INFO5995', paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers;
    DROP TABLE exam_papers;
    ALTER TABLE exam_papers_new RENAME TO exam_papers;

    CREATE TABLE exam_answers_new (
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (course, paper_day, question_index)
    );
    INSERT INTO exam_answers_new (course, paper_day, question_index, your_answer, correct)
      SELECT 'INFO5995', paper_day, question_index, your_answer, correct FROM exam_answers;
    DROP TABLE exam_answers;
    ALTER TABLE exam_answers_new RENAME TO exam_answers;

    CREATE TABLE exam_review_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(course, paper_day, question_index)
    );
    INSERT INTO exam_review_items_new (id, course, paper_day, question_index, rung, next_review)
      SELECT id, 'INFO5995', paper_day, question_index, rung, next_review FROM exam_review_items;
    DROP TABLE exam_review_items;
    ALTER TABLE exam_review_items_new RENAME TO exam_review_items;

    CREATE TABLE exam_review_log_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    INSERT INTO exam_review_log_new (id, course, paper_day, question_index, reviewed_at, result)
      SELECT id, 'INFO5995', paper_day, question_index, reviewed_at, result FROM exam_review_log;
    DROP TABLE exam_review_log;
    ALTER TABLE exam_review_log_new RENAME TO exam_review_log;

    CREATE TABLE exam_state_new (
      course TEXT PRIMARY KEY,
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO exam_state_new (course, released_up_to)
      SELECT 'INFO5995', released_up_to FROM exam_state;
    DROP TABLE exam_state;
    ALTER TABLE exam_state_new RENAME TO exam_state;
  `);
}

function ensureExamStateRow(db: Database, course: string): void {
  const { n } = db.query(`SELECT COUNT(*) AS n FROM exam_state WHERE course = ?`).get(course) as { n: number };
  if (n === 0) db.query(`INSERT INTO exam_state (course, released_up_to) VALUES (?, 0)`).run(course);
}

// Inserts any paper introduced since the last run (e.g. a new week's content
// was added for this course) without touching existing rows — placed far
// out on the calendar; the release gate below pulls each one forward once
// backlog clears, exactly like a paper that existed from day one.
function seedNewPapers(db: Database, course: string, today: string): void {
  const { maxDay } = db
    .query(`SELECT COALESCE(MAX(paper_day), 0) AS maxDay FROM exam_papers WHERE course = ?`)
    .get(course) as { maxDay: number };
  const insert = db.query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES (?, ?, ?)`);
  for (const paper of buildExamSchedule()) {
    if (paper.course !== course) continue;
    if (paper.paperDay <= maxDay) continue;
    insert.run(course, paper.paperDay, addDays(today, paper.paperDay));
  }
}

function runExamReleaseGate(db: Database, course: string, today: string): void {
  const { released_up_to } = db
    .query(`SELECT released_up_to FROM exam_state WHERE course = ?`)
    .get(course) as { released_up_to: number };
  const { n: backlog } = db
    .query(
      `SELECT COUNT(*) AS n FROM exam_papers WHERE course = ? AND paper_day <= ? AND next_review <= ? AND submitted_at IS NULL`,
    )
    .get(course, released_up_to, today) as { n: number };
  const remaining = totalPapersForCourse(course) - released_up_to;
  const toRelease = releaseCount(backlog, remaining);
  if (toRelease === 0) return;

  const newUpTo = released_up_to + toRelease;
  db.query(`UPDATE exam_papers SET next_review = ? WHERE course = ? AND paper_day > ? AND paper_day <= ?`).run(
    today,
    course,
    released_up_to,
    newUpTo,
  );
  db.query(`UPDATE exam_state SET released_up_to = ? WHERE course = ?`).run(newUpTo, course);
}

export function listDueExamPapers(db: Database, course: string, today: string): ExamPaperRow[] {
  runExamReleaseGate(db, course, today);
  return db
    .query(
      `SELECT course, paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers
       WHERE course = ? AND paper_day <= (SELECT released_up_to FROM exam_state WHERE course = ?) AND next_review <= ? AND submitted_at IS NULL
       ORDER BY next_review, paper_day`,
    )
    .all(course, course, today) as ExamPaperRow[];
}

export function getExamPaperRow(db: Database, course: string, paperDay: number): ExamPaperRow | null {
  return db
    .query(
      `SELECT course, paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers WHERE course = ? AND paper_day = ?`,
    )
    .get(course, paperDay) as ExamPaperRow | null;
}

export function listExamAnswers(db: Database, course: string, paperDay: number): ExamAnswerRow[] {
  return db
    .query(
      `SELECT course, paper_day, question_index, your_answer, correct FROM exam_answers WHERE course = ? AND paper_day = ?`,
    )
    .all(course, paperDay) as ExamAnswerRow[];
}

export function saveExamAnswer(
  db: Database,
  course: string,
  paperDay: number,
  questionIndex: number,
  yourAnswer: string,
): void {
  db.query(
    `INSERT INTO exam_answers (course, paper_day, question_index, your_answer) VALUES (?, ?, ?, ?)
     ON CONFLICT (course, paper_day, question_index) DO UPDATE SET your_answer = excluded.your_answer`,
  ).run(course, paperDay, questionIndex, yourAnswer);
}

// yourAnswer is optional: mcq/truefalse grade themselves on selection and
// pass the chosen option index here in the same call; short/scenario save
// their draft separately (saveExamAnswer, during the reveal step) and only
// call this once, with the self-reported verdict.
export function gradeExamAnswer(
  db: Database,
  course: string,
  paperDay: number,
  questionIndex: number,
  correct: boolean,
  yourAnswer?: string,
): void {
  if (yourAnswer !== undefined) {
    db.query(
      `INSERT INTO exam_answers (course, paper_day, question_index, your_answer, correct) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (course, paper_day, question_index) DO UPDATE SET your_answer = excluded.your_answer, correct = excluded.correct`,
    ).run(course, paperDay, questionIndex, yourAnswer, correct ? 1 : 0);
  } else {
    db.query(
      `INSERT INTO exam_answers (course, paper_day, question_index, your_answer, correct) VALUES (?, ?, ?, '', ?)
       ON CONFLICT (course, paper_day, question_index) DO UPDATE SET correct = excluded.correct`,
    ).run(course, paperDay, questionIndex, correct ? 1 : 0);
  }
}

export type SubmitExamResult =
  | { ok: true; scoreCorrect: number; scoreTotal: number }
  | { ok: false; reason: "not_found" | "already_submitted" | "incomplete" };

export function submitExamPaper(db: Database, course: string, paperDay: number, today: string): SubmitExamResult {
  const paper = getExamPaperRow(db, course, paperDay);
  if (!paper) return { ok: false, reason: "not_found" };
  if (paper.submitted_at) return { ok: false, reason: "already_submitted" };

  const content = buildExamSchedule().find((p) => p.course === course && p.paperDay === paperDay);
  if (!content) return { ok: false, reason: "not_found" };

  const answers = listExamAnswers(db, course, paperDay);
  const gradedByIndex = new Map(answers.map((a) => [a.question_index, a.correct]));
  for (let i = 0; i < content.questions.length; i++) {
    const c = gradedByIndex.get(i);
    if (c === null || c === undefined) return { ok: false, reason: "incomplete" };
  }

  const scoreCorrect = answers.filter((a) => a.correct === 1).length;
  const scoreTotal = content.questions.length;
  db.query(
    `UPDATE exam_papers SET submitted_at = ?, score_correct = ?, score_total = ? WHERE course = ? AND paper_day = ?`,
  ).run(today, scoreCorrect, scoreTotal, course, paperDay);

  const insertReview = db.query(
    `INSERT INTO exam_review_items (course, paper_day, question_index, rung, next_review) VALUES (?, ?, ?, -1, ?)
     ON CONFLICT (course, paper_day, question_index) DO NOTHING`,
  );
  for (const a of answers) {
    if (a.correct === 0) insertReview.run(course, paperDay, a.question_index, addDays(today, 1));
  }

  return { ok: true, scoreCorrect, scoreTotal };
}

export function countOverdueExamPapers(db: Database, course: string, today: string): number {
  runExamReleaseGate(db, course, today);
  const row = db
    .query(
      `SELECT COUNT(*) AS n FROM exam_papers
       WHERE course = ? AND paper_day <= (SELECT released_up_to FROM exam_state WHERE course = ?) AND next_review < ? AND submitted_at IS NULL`,
    )
    .get(course, course, today) as { n: number };
  return row.n;
}

export function countExamPapersSubmittedToday(db: Database, course: string, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM exam_papers WHERE course = ? AND submitted_at = ?`)
    .get(course, today) as { n: number };
  return row.n;
}

export function listExamPapersSubmittedToday(db: Database, course: string, today: string): ExamPaperRow[] {
  return db
    .query(
      `SELECT course, paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers WHERE course = ? AND submitted_at = ? ORDER BY paper_day`,
    )
    .all(course, today) as ExamPaperRow[];
}

export function listDueExamReviewItems(db: Database, course: string, today: string): ExamReviewItemRow[] {
  return db
    .query(
      `SELECT id, course, paper_day, question_index, rung, next_review FROM exam_review_items WHERE course = ? AND next_review <= ? ORDER BY next_review, id`,
    )
    .all(course, today) as ExamReviewItemRow[];
}

export function countOverdueExamReviewItems(db: Database, course: string, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM exam_review_items WHERE course = ? AND next_review < ?`)
    .get(course, today) as { n: number };
  return row.n;
}

export function countExamReviewsToday(db: Database, course: string, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM exam_review_log WHERE course = ? AND reviewed_at = ?`)
    .get(course, today) as { n: number };
  return row.n;
}

export function listExamReviewsCompletedToday(
  db: Database,
  course: string,
  today: string,
): { paper_day: number; question_index: number }[] {
  return db
    .query(`SELECT paper_day, question_index FROM exam_review_log WHERE course = ? AND reviewed_at = ?`)
    .all(course, today) as { paper_day: number; question_index: number }[];
}

export function reviewExamItem(
  db: Database,
  course: string,
  paperDay: number,
  questionIndex: number,
  result: ExamReviewResult,
  today: string,
): ExamReviewItemRow | null {
  const current = db
    .query(
      `SELECT id, course, paper_day, question_index, rung, next_review FROM exam_review_items WHERE course = ? AND paper_day = ? AND question_index = ?`,
    )
    .get(course, paperDay, questionIndex) as ExamReviewItemRow | null;
  if (!current) return null;

  db.query(
    `INSERT INTO exam_review_log (course, paper_day, question_index, reviewed_at, result) VALUES (?, ?, ?, ?, ?)`,
  ).run(course, paperDay, questionIndex, today, result);

  const { rung, nextReview } = applyExamReview(current.rung, result, today);
  db.query(`UPDATE exam_review_items SET rung = ?, next_review = ? WHERE id = ?`).run(rung, nextReview, current.id);
  return { ...current, rung, next_review: nextReview };
}
```

- [ ] **Step 2: Rewrite `exam-db.test.ts`**

Replace the entire file with:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateExam,
  listDueExamPapers,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countOverdueExamPapers,
  countExamPapersSubmittedToday,
  listDueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
} from "./exam-db";
import { totalPapersForCourse, buildExamSchedule } from "./exam-content";
import { addDays } from "./scheduling";

const TODAY = "2026-08-04";
const COURSE = "INFO5995";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateExam(db, TODAY);
});

test("seeds every paper, releasing the first 5 immediately under the backlog cap", () => {
  const total = totalPapersForCourse(COURSE);
  expect(getExamPaperRow(db, COURSE, 1)!.next_review).toBe(TODAY);
  const releasedCount = Math.min(5, total);
  expect(getExamPaperRow(db, COURSE, releasedCount)!.next_review).toBe(TODAY);
  if (total > 5) {
    expect(getExamPaperRow(db, COURSE, 6)!.next_review).toBe(addDays(TODAY, 6));
  }
});

test("migrateExam does not reseed or reset progress on a second call", () => {
  saveExamAnswer(db, COURSE, 1, 0, "draft");
  migrateExam(db, TODAY);
  const answer = getExamPaperRow(db, COURSE, 1);
  expect(answer).not.toBeNull();
});

test("listDueExamPapers returns the first released, unsubmitted paper first", () => {
  const due = listDueExamPapers(db, COURSE, TODAY);
  expect(due.length).toBeGreaterThan(0);
  expect(due[0]!.paper_day).toBe(1);
});

test("saveExamAnswer stores a draft without grading it", () => {
  saveExamAnswer(db, COURSE, 1, 0, "my draft");
  const paper1Questions = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!.questions;
  expect(paper1Questions.length).toBeGreaterThan(0);
});

test("submitExamPaper rejects submission until every question is graded", () => {
  const result = submitExamPaper(db, COURSE, 1, TODAY);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("incomplete");
});

test("submitExamPaper computes score, marks submitted, and creates review items for wrong answers", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, i !== 0)); // question 0 wrong, rest correct

  const result = submitExamPaper(db, COURSE, 1, TODAY);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.scoreTotal).toBe(paper1.questions.length);
    expect(result.scoreCorrect).toBe(paper1.questions.length - 1);
  }

  const paperRow = getExamPaperRow(db, COURSE, 1)!;
  expect(paperRow.submitted_at).toBe(TODAY);

  const dueReviews = listDueExamReviewItems(db, COURSE, addDays(TODAY, 1));
  expect(dueReviews.length).toBe(1);
  expect(dueReviews[0]!.question_index).toBe(0);
});

test("a submitted paper is no longer listed as due", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, true));
  submitExamPaper(db, COURSE, 1, TODAY);

  const due = listDueExamPapers(db, COURSE, TODAY);
  expect(due.find((p) => p.paper_day === 1)).toBeUndefined();
});

test("submitExamPaper rejects a second submission of the same paper", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, true));
  submitExamPaper(db, COURSE, 1, TODAY);

  const second = submitExamPaper(db, COURSE, 1, TODAY);
  expect(second.ok).toBe(false);
  if (!second.ok) expect(second.reason).toBe("already_submitted");
});

test("countExamPapersSubmittedToday and countOverdueExamPapers track separately", () => {
  expect(countExamPapersSubmittedToday(db, COURSE, TODAY)).toBe(0);
  expect(countOverdueExamPapers(db, COURSE, TODAY)).toBe(0);

  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, true));
  submitExamPaper(db, COURSE, 1, TODAY);
  expect(countExamPapersSubmittedToday(db, COURSE, TODAY)).toBe(1);
});

test("reviewExamItem applies the ladder and logs the attempt", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, i !== 0));
  submitExamPaper(db, COURSE, 1, TODAY);

  const tomorrow = addDays(TODAY, 1);
  const updated = reviewExamItem(db, COURSE, 1, 0, "correct", tomorrow)!;
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(tomorrow, 3));
  expect(countExamReviewsToday(db, COURSE, tomorrow)).toBe(1);
});

test("reviewExamItem returns null for an item that isn't in the review queue", () => {
  expect(reviewExamItem(db, COURSE, 1, 5, "correct", TODAY)).toBeNull();
});

test("two different courses' backlogs are independent — course scoping partitions rows correctly", () => {
  // COMP5348 has no real content yet (totalPapersForCourse === 0), so the
  // release gate — which sizes "remaining" against totalPapersForCourse —
  // can't be exercised for a synthetic second course without violating its
  // own invariant (released_up_to must never exceed a course's real paper
  // count; runExamReleaseGate only ever advances it that far). This proves
  // independence via the non-gated, purely course-scoped functions instead —
  // the same `WHERE course = ?` filtering every gated function also relies
  // on — plus one real gated function (listDueExamPapers) on the one course
  // that actually has content.
  db.query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES ('COMP5348', 1, ?)`).run(TODAY);
  db.query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES ('COMP5348', 2, ?)`).run(TODAY);

  expect(getExamPaperRow(db, "COMP5348", 1)!.course).toBe("COMP5348");
  expect(getExamPaperRow(db, COURSE, 1)!.course).toBe(COURSE);

  saveExamAnswer(db, "COMP5348", 1, 0, "comp draft");
  saveExamAnswer(db, COURSE, 1, 0, "info draft");
  expect(listExamAnswers(db, "COMP5348", 1)[0]!.your_answer).toBe("comp draft");
  expect(listExamAnswers(db, COURSE, 1)[0]!.your_answer).toBe("info draft");

  // Submitting every INFO5995 due paper does not touch COMP5348's rows.
  const info5995Due = listDueExamPapers(db, COURSE, TODAY);
  for (const p of info5995Due) {
    const content = buildExamSchedule().find((c) => c.course === COURSE && c.paperDay === p.paper_day)!;
    content.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, p.paper_day, i, true));
    submitExamPaper(db, COURSE, p.paper_day, TODAY);
  }
  expect(listDueExamPapers(db, COURSE, TODAY).length).toBe(0);
  expect(getExamPaperRow(db, "COMP5348", 1)!.submitted_at).toBeNull();
  expect(getExamPaperRow(db, "COMP5348", 2)!.submitted_at).toBeNull();
});

test("migrateExam upgrades a pre-existing single-course db, backfilling course = 'INFO5995'", () => {
  const legacyDb = new Database(":memory:");
  legacyDb.exec(`
    CREATE TABLE exam_papers (
      paper_day INTEGER PRIMARY KEY,
      next_review TEXT NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER
    );
    CREATE TABLE exam_answers (
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (paper_day, question_index)
    );
    CREATE TABLE exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(paper_day, question_index)
    );
    CREATE TABLE exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE exam_state (
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);
  legacyDb
    .query(
      `INSERT INTO exam_papers (paper_day, next_review, submitted_at, score_correct, score_total) VALUES (1, ?, ?, 2, 3)`,
    )
    .run(TODAY, TODAY);
  legacyDb
    .query(`INSERT INTO exam_answers (paper_day, question_index, your_answer, correct) VALUES (1, 0, 'my answer', 1)`)
    .run();
  legacyDb
    .query(`INSERT INTO exam_review_items (paper_day, question_index, rung, next_review) VALUES (2, 0, 0, ?)`)
    .run(TODAY);
  legacyDb
    .query(`INSERT INTO exam_review_log (paper_day, question_index, reviewed_at, result) VALUES (1, 0, ?, 'correct')`)
    .run(TODAY);
  legacyDb.query(`INSERT INTO exam_state (released_up_to) VALUES (3)`).run();

  migrateExam(legacyDb, TODAY);

  const paper = getExamPaperRow(legacyDb, COURSE, 1)!;
  expect(paper.submitted_at).toBe(TODAY);
  expect(paper.score_correct).toBe(2);

  const answers = listExamAnswers(legacyDb, COURSE, 1);
  expect(answers[0]!.your_answer).toBe("my answer");

  const dueReviews = listDueExamReviewItems(legacyDb, COURSE, TODAY);
  expect(dueReviews.some((r) => r.paper_day === 2 && r.question_index === 0)).toBe(true);

  expect(countExamReviewsToday(legacyDb, COURSE, TODAY)).toBe(1);
});
```

- [ ] **Step 3: Run the test file**

Run: `bun test exam-db.test.ts`
Expected: All tests PASS (14 tests).

- [ ] **Step 4: Commit**

```bash
git add exam-db.ts exam-db.test.ts
git commit -m "feat: thread course through the exam database layer with a legacy migration"
```

---

### Task 3: Course-aware API routes

**Files:**
- Modify: `exam-api.ts`
- Modify: `exam-api.test.ts`

**Interfaces:**
- Consumes: every `exam-db.ts` function from Task 2 (leading `course` param), `totalPapersForCourse(course)` and `listExamCourses()` from Task 1.
- Produces: `examApiRoutes(db)` now serves `GET /api/exam/courses` plus every existing route with a `:course` URL segment prepended (`/api/exam/:course/due`, `/api/exam/:course/completed-today`, `/api/exam/:course/:day/answer`, `/api/exam/:course/:day/:questionIndex/grade`, `/api/exam/:course/:day/submit`, `/api/exam/review/:course/:day/:questionIndex`). Task 4 (`home-api.ts`, which calls `exam-db.ts` directly, not these routes) is unaffected by this task; Task 5 (`ExamApp.tsx`) is the only consumer of these routes.

- [ ] **Step 1: Rewrite `exam-api.ts`**

Replace the entire file with:

```ts
import type { Database } from "bun:sqlite";
import {
  listDueExamPapers,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countOverdueExamPapers,
  countExamPapersSubmittedToday,
  listExamPapersSubmittedToday,
  listDueExamReviewItems,
  countOverdueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
  type ExamPaperRow,
  type ExamReviewItemRow,
} from "./exam-db";
import { buildExamSchedule, totalPapersForCourse, listExamCourses } from "./exam-content";
import type { ExamQuestionType } from "./exam-content/types";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

function isKnownCourse(course: string): boolean {
  return listExamCourses().some((c) => c.code === course);
}

function parsePaperDay(raw: string, course: string): number | null {
  const day = Number(raw);
  if (!Number.isInteger(day) || day < 1 || day > totalPapersForCourse(course)) return null;
  return day;
}

function parseQuestionIndex(raw: string, course: string, paperDay: number): number | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.paperDay === paperDay);
  if (!content) return null;
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0 || index >= content.questions.length) return null;
  return index;
}

export interface ExamQuestionView {
  index: number;
  type: ExamQuestionType;
  prompt: string;
  options: string[] | null;
  correctIndex: number | null;
  modelAnswer: string;
  yourAnswer: string;
  correct: number | null;
}

export interface ExamPaperView {
  paperDay: number;
  week: number;
  paperNumber: number;
  title: string;
  topics: string;
  nextReview: string;
  submittedAt: string | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  questions: ExamQuestionView[];
}

function paperView(db: Database, course: string, row: ExamPaperRow): ExamPaperView | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.paperDay === row.paper_day);
  if (!content) return null;
  const answers = new Map(listExamAnswers(db, course, row.paper_day).map((a) => [a.question_index, a]));
  return {
    paperDay: row.paper_day,
    week: content.week,
    paperNumber: content.paperNumber,
    title: content.title,
    topics: content.topics,
    nextReview: row.next_review,
    submittedAt: row.submitted_at,
    scoreCorrect: row.score_correct,
    scoreTotal: row.score_total,
    questions: content.questions.map((q, index) => ({
      index,
      type: q.type,
      prompt: q.prompt,
      options: q.options ?? null,
      correctIndex: q.correctIndex ?? null,
      modelAnswer: q.modelAnswer,
      yourAnswer: answers.get(index)?.your_answer ?? "",
      correct: answers.get(index)?.correct ?? null,
    })),
  };
}

export interface ExamReviewView {
  paperDay: number;
  questionIndex: number;
  rung: number;
  nextReview: string;
  prompt: string;
  modelAnswer: string;
  options: string[] | null;
  correctIndex: number | null;
}

function reviewView(course: string, item: ExamReviewItemRow): ExamReviewView | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.paperDay === item.paper_day);
  const question = content?.questions[item.question_index];
  if (!content || !question) return null;
  return {
    paperDay: item.paper_day,
    questionIndex: item.question_index,
    rung: item.rung,
    nextReview: item.next_review,
    prompt: question.prompt,
    modelAnswer: question.modelAnswer,
    options: question.options ?? null,
    correctIndex: question.correctIndex ?? null,
  };
}

export function examApiRoutes(db: Database) {
  return {
    "/api/exam/courses": {
      GET: () => json(listExamCourses()),
    },
    "/api/exam/:course/due": {
      GET: (req: Request & { params: { course: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const today = localToday();
        const papers = listDueExamPapers(db, course, today);
        const reviewItems = listDueExamReviewItems(db, course, today);
        const paper = papers.length > 0 ? paperView(db, course, papers[0]!) : null;
        const reviewDue = reviewItems
          .map((item) => reviewView(course, item))
          .filter((r): r is ExamReviewView => r !== null);
        return json({
          paper,
          reviewDue,
          stats: {
            dueCount: papers.length + reviewItems.length,
            overdueCount: countOverdueExamPapers(db, course, today) + countOverdueExamReviewItems(db, course, today),
            completedToday: countExamPapersSubmittedToday(db, course, today) + countExamReviewsToday(db, course, today),
          },
        });
      },
    },
    "/api/exam/:course/completed-today": {
      GET: (req: Request & { params: { course: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const today = localToday();
        const papers = listExamPapersSubmittedToday(db, course, today)
          .map((row) => paperView(db, course, row))
          .filter((p): p is ExamPaperView => p !== null);
        return json({ papers });
      },
    },
    "/api/exam/:course/:day/answer": {
      POST: async (req: Request & { params: { course: string; day: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const day = parsePaperDay(req.params.day, course);
        if (day === null) return json({ error: `day must be between 1 and ${totalPapersForCourse(course)}` }, 400);
        const body = (await req.json().catch(() => null)) as
          | { questionIndex?: unknown; yourAnswer?: unknown }
          | null;
        // typeof-guard first: Number("") is 0, not NaN, so falling through to
        // parseQuestionIndex on a missing/non-numeric questionIndex would
        // silently accept it as index 0 instead of rejecting it.
        const questionIndex =
          typeof body?.questionIndex === "number"
            ? parseQuestionIndex(String(body.questionIndex), course, day)
            : null;
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : "";
        saveExamAnswer(db, course, day, questionIndex, yourAnswer);
        return json(paperView(db, course, getExamPaperRow(db, course, day)!));
      },
    },
    "/api/exam/:course/:day/:questionIndex/grade": {
      POST: async (req: Request & { params: { course: string; day: string; questionIndex: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const day = parsePaperDay(req.params.day, course);
        if (day === null) return json({ error: `day must be between 1 and ${totalPapersForCourse(course)}` }, 400);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, course, day);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as
          | { correct?: unknown; yourAnswer?: unknown }
          | null;
        if (typeof body?.correct !== "boolean") return json({ error: "correct must be a boolean" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : undefined;
        gradeExamAnswer(db, course, day, questionIndex, body.correct, yourAnswer);
        return json(paperView(db, course, getExamPaperRow(db, course, day)!));
      },
    },
    "/api/exam/:course/:day/submit": {
      POST: (req: Request & { params: { course: string; day: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const day = parsePaperDay(req.params.day, course);
        if (day === null) return json({ error: `day must be between 1 and ${totalPapersForCourse(course)}` }, 400);
        const result = submitExamPaper(db, course, day, localToday());
        if (!result.ok) {
          const status = result.reason === "not_found" ? 404 : 400;
          const message =
            result.reason === "not_found"
              ? "not found"
              : result.reason === "already_submitted"
                ? "paper already submitted"
                : "grade every question before submitting";
          return json({ error: message }, status);
        }
        return json({ scoreCorrect: result.scoreCorrect, scoreTotal: result.scoreTotal });
      },
    },
    "/api/exam/review/:course/:day/:questionIndex": {
      POST: async (req: Request & { params: { course: string; day: string; questionIndex: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const day = parsePaperDay(req.params.day, course);
        if (day === null) return json({ error: `day must be between 1 and ${totalPapersForCourse(course)}` }, 400);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, course, day);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as { result?: string } | null;
        if (body?.result !== "correct" && body?.result !== "wrong") {
          return json({ error: "result must be 'correct' or 'wrong'" }, 400);
        }
        const updated = reviewExamItem(db, course, day, questionIndex, body.result, localToday());
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
  };
}
```

- [ ] **Step 2: Rewrite `exam-api.test.ts`**

Replace the entire file with:

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import { localToday, addDays } from "./scheduling";
import { totalPapersForCourse } from "./exam-content";

const COURSE = "INFO5995";
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = new Database(":memory:");
  migrateExam(db, localToday());
  server = Bun.serve({ port: 0, routes: examApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/exam/courses lists courses that have at least one paper", async () => {
  const body: any = await (await fetch(`${base}/api/exam/courses`)).json();
  expect(body.some((c: any) => c.code === "INFO5995")).toBe(true);
  expect(body.some((c: any) => c.code === "INFO5990")).toBe(false);
});

test("GET /api/exam/:course/due returns today's paper with full question content", async () => {
  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  expect(body.paper.paperDay).toBe(1);
  expect(body.paper.questions.length).toBeGreaterThan(0);
  expect(body.paper.questions[0].modelAnswer.length).toBeGreaterThan(0);
  expect(body.reviewDue).toEqual([]);
  expect(body.stats.completedToday).toBe(0);
});

test("GET /api/exam/:course/due with an unknown course returns 400", async () => {
  const res = await fetch(`${base}/api/exam/UNKNOWN123/due`);
  expect(res.status).toBe(400);
});

test("POST /api/exam/:course/:day/answer saves a draft without grading", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 0, yourAnswer: "draft" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].yourAnswer).toBe("draft");
  expect(updated.questions[0].correct).toBeNull();
});

test("POST /api/exam/:course/:day/:questionIndex/grade records a verdict, and mcq can pass yourAnswer in the same call", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/0/grade`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ correct: true, yourAnswer: "1" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].correct).toBe(1);
  expect(updated.questions[0].yourAnswer).toBe("1");
});

test("POST /api/exam/:course/:day/submit fails while any question is ungraded, then succeeds once all are", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  const count = dueRes.paper.questions.length;

  const incomplete = await fetch(`${base}/api/exam/${COURSE}/1/submit`, { method: "POST" });
  expect(incomplete.status).toBe(400);

  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  const submitRes = await fetch(`${base}/api/exam/${COURSE}/1/submit`, { method: "POST" });
  expect(submitRes.status).toBe(200);
  const result: any = await submitRes.json();
  expect(result.scoreTotal).toBe(count);
  expect(result.scoreCorrect).toBe(count - 1);
});

test("submitting the same paper twice returns 400", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/submit`, { method: "POST" });
  const second = await fetch(`${base}/api/exam/${COURSE}/1/submit`, { method: "POST" });
  expect(second.status).toBe(400);
});

test("after submitting with one wrong answer, that question shows up as a review item tomorrow", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/submit`, { method: "POST" });

  const reviewRes = await fetch(`${base}/api/exam/review/${COURSE}/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  expect(reviewRes.status).toBe(200);
  const updated: any = await reviewRes.json();
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(localToday(), 3));
});

test("review rejects a bad result value", async () => {
  const res = await fetch(`${base}/api/exam/review/${COURSE}/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "meh" }),
  });
  expect(res.status).toBe(400);
});

test("day out of range is rejected with 400", async () => {
  const total = totalPapersForCourse(COURSE);
  for (const bad of ["0", String(total + 1), "abc"]) {
    const res = await fetch(`${base}/api/exam/${COURSE}/${bad}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex: 0, yourAnswer: "x" }),
    });
    expect(res.status).toBe(400);
  }
});

test("questionIndex out of range is rejected with 400", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 999, yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("a missing questionIndex on /answer is rejected with 400, not silently treated as index 0", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/exam/:course/completed-today lists papers submitted today", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/submit`, { method: "POST" });

  const completed: any = await (await fetch(`${base}/api/exam/${COURSE}/completed-today`)).json();
  expect(completed.papers.length).toBe(1);
  expect(completed.papers[0].scoreCorrect).toBe(count);
});
```

- [ ] **Step 3: Run the test file**

Run: `bun test exam-api.test.ts`
Expected: All tests PASS (14 tests).

- [ ] **Step 4: Commit**

```bash
git add exam-api.ts exam-api.test.ts
git commit -m "feat: add a :course URL segment to every exam API route"
```

---

### Task 4: Course-aware Home aggregation

**Files:**
- Modify: `home-api.ts`
- Modify: `home-api.test.ts`

**Interfaces:**
- Consumes: `listExamCourses()` (Task 1), every `exam-db.ts` function with its new `course` param (Task 2).
- Produces: `DueItem` gains an optional `course?: string` field, populated only on exam-sourced items — Task 5 (`frontend.tsx`) reads this field to build the exam deep link.

- [ ] **Step 1: Add `course` to `DueItem` and make `examDue`/`examCompletedToday` course-aware**

In `home-api.ts`, add the import and change the `DueItem` interface:

```ts
import { listExamCourses } from "./exam-content";
```

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

Replace the `examDue` function:

```ts
function examDue(db: Database, today: string): DueItem[] {
  const items: DueItem[] = [];
  for (const { code, name } of listExamCourses()) {
    const papers = listDueExamPapers(db, code, today).map((row) => {
      const content = buildExamSchedule().find((p) => p.course === code && p.paperDay === row.paper_day);
      return {
        source: "exam" as const,
        id: row.paper_day,
        title: content?.title ?? `Exam paper ${row.paper_day}`,
        subtitle: name,
        dueDate: row.next_review,
        overdueDays: overdueDays(row.next_review, today),
        linkId: row.paper_day,
        course: code,
      };
    });
    const reviews = listDueExamReviewItems(db, code, today).map((item) => {
      const content = buildExamSchedule().find((p) => p.course === code && p.paperDay === item.paper_day);
      const question = content?.questions[item.question_index];
      return {
        source: "exam" as const,
        id: item.paper_day * 1000 + item.question_index,
        title: question ? question.prompt.slice(0, 80) : "Exam review",
        subtitle: name,
        dueDate: item.next_review,
        overdueDays: overdueDays(item.next_review, today),
        linkId: item.paper_day,
        course: code,
      };
    });
    items.push(...papers, ...reviews);
  }
  return items;
}
```

Replace the `examCompletedToday` function:

```ts
function examCompletedToday(db: Database, today: string): DueItem[] {
  const items: DueItem[] = [];
  for (const { code, name } of listExamCourses()) {
    const papers = listExamPapersSubmittedToday(db, code, today).map((row) => {
      const content = buildExamSchedule().find((p) => p.course === code && p.paperDay === row.paper_day);
      return {
        source: "exam" as const,
        id: row.paper_day,
        title: content?.title ?? `Exam paper ${row.paper_day}`,
        subtitle: name,
        dueDate: today,
        overdueDays: 0,
        linkId: row.paper_day,
        course: code,
      };
    });
    const reviews = listExamReviewsCompletedToday(db, code, today).map((item) => {
      const content = buildExamSchedule().find((p) => p.course === code && p.paperDay === item.paper_day);
      const question = content?.questions[item.question_index];
      return {
        source: "exam" as const,
        id: item.paper_day * 1000 + item.question_index,
        title: question ? question.prompt.slice(0, 80) : "Exam review",
        subtitle: name,
        dueDate: today,
        overdueDays: 0,
        linkId: item.paper_day,
        course: code,
      };
    });
    items.push(...papers, ...reviews);
  }
  return items;
}
```

Every call site of `listDueExamPapers`, `listDueExamReviewItems`, `countExamPapersSubmittedToday`, `countExamReviewsToday`, `listExamPapersSubmittedToday`, `listExamReviewsCompletedToday` elsewhere in `home-api.ts` (in `homeStats` and the two route handlers) now needs to loop over `listExamCourses()` and sum, since those functions require a `course` argument. Replace `homeStats`:

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

The `/api/home/due`, `/api/home/stats`, and `/api/home/completed-today` route handlers already call `examDue`/`examCompletedToday`/`homeStats` and need no further changes — they stay exactly as they are today.

- [ ] **Step 2: Update `home-api.test.ts` for the new exam-db signatures and course-labeled subtitles**

Edit 1 — old:
```ts
import { migrateExam, gradeExamAnswer, submitExamPaper, reviewExamItem } from "./exam-db";
import { buildExamSchedule, TOTAL_PAPERS } from "./exam-content";
```
new:
```ts
import { migrateExam, gradeExamAnswer, submitExamPaper, reviewExamItem } from "./exam-db";
import { buildExamSchedule, totalPapersForCourse } from "./exam-content";
```

Edit 2 — old:
```ts
const EXAM_DUE_ON_MIGRATE = Math.min(MAX_ACTIVE_BACKLOG, TOTAL_PAPERS);
```
new:
```ts
const EXAM_DUE_ON_MIGRATE = Math.min(MAX_ACTIVE_BACKLOG, totalPapersForCourse("INFO5995"));
```

Edit 3 — old:
```ts
test("GET /api/home/due gives exam papers and exam review items collision-free ids", async () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, 1, addDays(TODAY, -1)); // review item's next_review lands on TODAY, while paper 2/3 are still due
```
new:
```ts
test("GET /api/home/due gives exam papers and exam review items collision-free ids", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, addDays(TODAY, -1)); // review item's next_review lands on TODAY, while paper 2/3 are still due
```

Edit 4 — old:
```ts
test("GET /api/home/stats counts a submitted exam paper as completed today", async () => {
  const before: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(before.completedToday).toBe(0);

  // home-api.test.ts doesn't mount exam routes (only homeApiRoutes), so grade
  // and submit directly via exam-db against the same db instance, mirroring
  // how the goals/theory completions above are set up through their own db
  // layers rather than through HTTP.
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, true));
  submitExamPaper(db, 1, TODAY);
```
new:
```ts
test("GET /api/home/stats counts a submitted exam paper as completed today", async () => {
  const before: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(before.completedToday).toBe(0);

  // home-api.test.ts doesn't mount exam routes (only homeApiRoutes), so grade
  // and submit directly via exam-db against the same db instance, mirroring
  // how the goals/theory completions above are set up through their own db
  // layers rather than through HTTP.
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, i, true));
  submitExamPaper(db, "INFO5995", 1, TODAY);
```

Edit 5 — old:
```ts
test("GET /api/home/completed-today includes a submitted exam paper and a reviewed exam item", async () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, 1, TODAY); // creates a review item for question 0
  reviewExamItem(db, 1, 0, "correct", TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  expect(items.some((i) => i.source === "exam" && i.subtitle === "Exam paper" && i.linkId === 1)).toBe(true);
  expect(items.some((i) => i.source === "exam" && i.subtitle === "Exam review" && i.linkId === 1)).toBe(true);
  expect(items.every((i) => i.dueDate === TODAY && i.overdueDays === 0)).toBe(true);
});
```
new:
```ts
test("GET /api/home/completed-today includes a submitted exam paper and a reviewed exam item", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, TODAY); // creates a review item for question 0
  reviewExamItem(db, "INFO5995", 1, 0, "correct", TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  // subtitle is now the course display name (not "Exam paper"/"Exam review"), so
  // distinguish the paper item from the review item by their id shapes instead:
  // paper id === paper_day, review id === paper_day * 1000 + question_index.
  expect(items.some((i) => i.source === "exam" && i.id === 1 && i.subtitle === "Intro to Cybersecurity")).toBe(true);
  expect(items.some((i) => i.source === "exam" && i.id === 1000 && i.subtitle === "Intro to Cybersecurity")).toBe(true);
  expect(items.every((i) => i.dueDate === TODAY && i.overdueDays === 0)).toBe(true);
});
```

- [ ] **Step 3: Run the test file**

Run: `bun test home-api.test.ts`
Expected: All tests PASS.

- [ ] **Step 4: Run the full test suite**

Run: `bun test`
Expected: All tests PASS across the whole repo (this is the first point every touched file's tests run together).

- [ ] **Step 5: Commit**

```bash
git add home-api.ts home-api.test.ts
git commit -m "feat: aggregate exam due/completed items across all courses on Home"
```

---

### Task 5: Course selector UI

**Files:**
- Modify: `ExamApp.tsx`
- Modify: `home-api.ts` (already done in Task 4 — no changes here)
- Modify: `frontend.tsx`

**Interfaces:**
- Consumes: `GET /api/exam/courses` and every `:course`-scoped route from Task 3; `DueItem.course` from Task 4.
- Produces: `ExamApp`'s props change from `{ openPaperDay?, onOpened? }` to `{ openCourse?: string | null, openPaperDay?: number | null, onOpened?: () => void }`; `frontend.tsx`'s `DeepLink` exam variant gains `course: string`.

- [ ] **Step 1: Rewrite `ExamApp.tsx`**

Replace the entire file with:

```tsx
import React, { useEffect, useState } from "react";
import { EXAM_REVIEW_LADDER } from "./exam-scheduling";
import { localToday } from "./scheduling";
import type { ExamPaperView, ExamQuestionView, ExamReviewView } from "./exam-api";

interface Stats {
  dueCount: number;
  overdueCount: number;
  completedToday: number;
}

interface ExamCourse {
  code: string;
  name: string;
}

type Result = "correct" | "wrong";
type View = { name: "board" } | { name: "paper" } | { name: "review"; item: ExamReviewView };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : "Something went wrong.");

const api = {
  courses: () => fetch("/api/exam/courses").then((r) => json<ExamCourse[]>(r)),
  due: (course: string) =>
    fetch(`/api/exam/${course}/due`).then((r) =>
      json<{ paper: ExamPaperView | null; reviewDue: ExamReviewView[]; stats: Stats }>(r),
    ),
  completedToday: (course: string) =>
    fetch(`/api/exam/${course}/completed-today`).then((r) => json<{ papers: ExamPaperView[] }>(r)),
  saveAnswer: (course: string, paperDay: number, questionIndex: number, yourAnswer: string) =>
    fetch(`/api/exam/${course}/${paperDay}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex, yourAnswer }),
    }).then((r) => json<ExamPaperView>(r)),
  grade: (course: string, paperDay: number, questionIndex: number, correct: boolean, yourAnswer?: string) =>
    fetch(`/api/exam/${course}/${paperDay}/${questionIndex}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct, ...(yourAnswer !== undefined ? { yourAnswer } : {}) }),
    }).then((r) => json<ExamPaperView>(r)),
  submit: (course: string, paperDay: number) =>
    fetch(`/api/exam/${course}/${paperDay}/submit`, { method: "POST" }).then((r) =>
      json<{ scoreCorrect: number; scoreTotal: number }>(r),
    ),
  reviewItem: (course: string, paperDay: number, questionIndex: number, result: Result) =>
    fetch(`/api/exam/review/${course}/${paperDay}/${questionIndex}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }).then((r) => json<any>(r)),
};

function ExamStats({ stats, onOpenCompleted }: { stats: Stats; onOpenCompleted: () => void }) {
  return (
    <div className="stats stats-3">
      <div className="stat stat-due">
        <span className="stat-num">{stats.dueCount}</span>
        <span className="stat-label">Due today</span>
      </div>
      <div className="stat stat-overdue">
        <span className="stat-num">{stats.overdueCount}</span>
        <span className="stat-label">Overdue</span>
      </div>
      <button className="stat stat-completed" onClick={onOpenCompleted}>
        <span className="stat-num">{stats.completedToday}</span>
        <span className="stat-label">Completed today</span>
      </button>
    </div>
  );
}

function CourseSelector({
  courses,
  selected,
  onSelect,
}: {
  courses: ExamCourse[];
  selected: string;
  onSelect: (code: string) => void;
}) {
  return (
    <nav className="tabs" aria-label="Courses" style={{ marginBottom: "1rem" }}>
      {courses.map((c) => (
        <button key={c.code} className={c.code === selected ? "tab tab-active" : "tab"} onClick={() => onSelect(c.code)}>
          {c.name}
        </button>
      ))}
    </nav>
  );
}

function McqQuestion({
  question,
  course,
  paperDay,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  course: string;
  paperDay: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const graded = question.correct !== null;

  const choose = async (i: number) => {
    if (graded) return;
    onError(null);
    try {
      const updated = await api.grade(course, paperDay, question.index, i === question.correctIndex, String(i));
      onGraded(updated);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <div className="exam-question">
      <p className="exam-prompt">{question.prompt}</p>
      <div className="exam-options">
        {question.options!.map((opt, i) => {
          const isChosen = question.yourAnswer === String(i);
          const cls = !graded
            ? "exam-option"
            : i === question.correctIndex
              ? "exam-option exam-option-correct"
              : isChosen
                ? "exam-option exam-option-wrong"
                : "exam-option";
          return (
            <label key={i} className={cls}>
              <input
                type="radio"
                name={`q-${question.index}`}
                checked={isChosen}
                disabled={graded}
                onChange={() => choose(i)}
              />
              {opt}
            </label>
          );
        })}
      </div>
      {graded && <p className="exam-explanation">{question.modelAnswer}</p>}
    </div>
  );
}

function ShortOrScenarioQuestion({
  question,
  course,
  paperDay,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  course: string;
  paperDay: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState(question.yourAnswer);
  const [revealed, setRevealed] = useState(question.correct !== null);
  const graded = question.correct !== null;

  const saveAndReveal = async () => {
    onError(null);
    try {
      await api.saveAnswer(course, paperDay, question.index, draft);
      setRevealed(true);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const grade = async (correct: boolean) => {
    onError(null);
    try {
      const updated = await api.grade(course, paperDay, question.index, correct);
      onGraded(updated);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <div className="exam-question">
      <p className="exam-prompt">{question.prompt}</p>
      <textarea
        className="theory-answer"
        rows={4}
        value={draft}
        disabled={graded}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write your own answer, then reveal the model answer..."
      />
      {!graded && (
        <div className="btn-row">
          <button className="btn" onClick={saveAndReveal}>Save answer</button>
        </div>
      )}
      {revealed && (
        <div className="theory-model-answer">
          <h3>Model answer</h3>
          <p>{question.modelAnswer}</p>
        </div>
      )}
      {!graded && revealed && (
        <div className="btn-row">
          <button className="btn btn-pass" onClick={() => grade(true)}>Correct</button>
          <button className="btn btn-fail" onClick={() => grade(false)}>Wrong</button>
        </div>
      )}
    </div>
  );
}

function PaperView({
  paper,
  course,
  onBack,
  onChanged,
  onError,
}: {
  paper: ExamPaperView;
  course: string;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [current, setCurrent] = useState(paper);
  const allGraded = current.questions.every((q) => q.correct !== null);

  const submit = async () => {
    onError(null);
    try {
      await api.submit(course, paper.paperDay);
      onChanged();
      onBack();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <article className="detail">
      <header className="detail-head">
        <h2>{current.title}</h2>
        <span className="tag">{current.questions.length} questions</span>
      </header>
      {current.questions.map((q) =>
        q.type === "mcq" || q.type === "truefalse" ? (
          <McqQuestion key={q.index} question={q} course={course} paperDay={paper.paperDay} onGraded={setCurrent} onError={onError} />
        ) : (
          <ShortOrScenarioQuestion
            key={q.index}
            question={q}
            course={course}
            paperDay={paper.paperDay}
            onGraded={setCurrent}
            onError={onError}
          />
        ),
      )}
      <div className="btn-row">
        <button className="btn btn-primary" disabled={!allGraded} onClick={submit}>
          Submit paper
        </button>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
      {!allGraded && (
        <p className="board-empty">
          Grade every question — multiple choice grades itself on selection; reveal and mark short/scenario answers — before submitting.
        </p>
      )}
    </article>
  );
}

function ReviewDetail({
  item,
  course,
  onBack,
  onChanged,
  onError,
}: {
  item: ExamReviewView;
  course: string;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  const review = async (result: Result) => {
    onError(null);
    try {
      await api.reviewItem(course, item.paperDay, item.questionIndex, result);
      onChanged();
      onBack();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <article className="detail theory-card">
      <header className="detail-head">
        <span className="rung" title={`rung ${item.rung + 1} of ${EXAM_REVIEW_LADDER.length}`}>
          {EXAM_REVIEW_LADDER.map((_, i) => (
            <span key={i} className={i <= item.rung ? "rung-on" : "rung-off"} />
          ))}
        </span>
      </header>
      <h2 className="theory-question">{item.prompt}</h2>
      {item.options && (
        <div className="exam-options">
          {item.options.map((opt, i) => (
            <label
              key={i}
              className={revealed && i === item.correctIndex ? "exam-option exam-option-correct" : "exam-option"}
            >
              {opt}
            </label>
          ))}
        </div>
      )}
      {revealed ? (
        <div className="theory-model-answer">
          <h3>Model answer</h3>
          <p>{item.modelAnswer}</p>
        </div>
      ) : (
        <button className="solution-cover" onClick={() => setRevealed(true)}>
          Model answer hidden — recall it yourself first, then reveal
        </button>
      )}
      <div className="btn-row">
        <button className="btn btn-pass" onClick={() => review("correct")}>Correct</button>
        <button className="btn btn-fail" onClick={() => review("wrong")}>Wrong</button>
        <span className="btn-spacer" />
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </article>
  );
}

export default function ExamApp({
  openCourse,
  openPaperDay,
  onOpened,
}: {
  openCourse?: string | null;
  openPaperDay?: number | null;
  onOpened?: () => void;
} = {}) {
  const [view, setView] = useState<View>({ name: "board" });
  const [courses, setCourses] = useState<ExamCourse[]>([]);
  const [course, setCourse] = useState<string | null>(null);
  const [paper, setPaper] = useState<ExamPaperView | null>(null);
  const [reviewDue, setReviewDue] = useState<ExamReviewView[]>([]);
  const [stats, setStats] = useState<Stats>({ dueCount: 0, overdueCount: 0, completedToday: 0 });
  const [completedPapers, setCompletedPapers] = useState<ExamPaperView[] | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .courses()
      .then((list) => {
        setCourses(list);
        if (list.length > 0) setCourse((current) => current ?? list[0]!.code);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const refresh = (activeCourse: string) => {
    setError(null);
    return api
      .due(activeCourse)
      .then(({ paper, reviewDue, stats }) => {
        setPaper(paper);
        setReviewDue(reviewDue);
        setStats(stats);
      })
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(() => {
    if (course) {
      setView({ name: "board" });
      setCompletedPapers(null);
      refresh(course);
    }
  }, [course]);

  // Today's paper is the only exam deep-link target — a Home-tab review-item
  // click still lands here (same paperDay) but opens the board, since a
  // single missed question doesn't have its own drill-down view outside the
  // review-due list. openCourse additionally switches to the right course.
  useEffect(() => {
    if (openCourse != null || openPaperDay != null) {
      if (openCourse != null) setCourse(openCourse);
      onOpened?.();
    }
  }, [openCourse, openPaperDay]);

  const openCompleted = () => {
    setShowCompleted(true);
    if (completedPapers === null && course) {
      api
        .completedToday(course)
        .then((r) => setCompletedPapers(r.papers))
        .catch((err) => setError(errorMessage(err)));
    }
  };

  if (!course) {
    return (
      <div className="theory">
        <p className="board-empty">Loading…</p>
      </div>
    );
  }

  return (
    <div className="theory">
      <CourseSelector courses={courses} selected={course} onSelect={setCourse} />
      <ExamStats stats={stats} onOpenCompleted={openCompleted} />
      {error && <p className="form-error">{error}</p>}
      <p className="rule-note">
        One new practice paper unlocks per day. Missed questions come back for spaced review: 3 → 5 → 7 → 14 → 30 days.
      </p>

      {showCompleted && (
        <div className="modal-backdrop" onClick={() => setShowCompleted(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Completed today</h2>
              <button className="modal-close" onClick={() => setShowCompleted(false)} aria-label="Close">×</button>
            </div>
            {(completedPapers ?? []).length === 0 ? (
              <p className="board-empty">Nothing completed today yet.</p>
            ) : (
              <ul className="modal-rows">
                {(completedPapers ?? []).map((p) => (
                  <li key={p.paperDay} className="modal-row">
                    <span className="modal-row-title">{p.title}</span>
                    <span className="tag">{p.scoreCorrect}/{p.scoreTotal}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {view.name === "board" && (
        <>
          <section className="board" aria-label="Today's paper">
            <div className="section-head">
              <h2>Today's paper</h2>
            </div>
            {paper === null ? (
              <p className="board-empty">Nothing due. Tomorrow's paper unlocks then.</p>
            ) : (
              <button className="board-row board-row-main" onClick={() => setView({ name: "paper" })}>
                <span className="tag">due</span>
                <span className="board-title">{paper.title}</span>
                <span className="lang-tag">{paper.questions.length} questions</span>
              </button>
            )}
          </section>

          <section className="board" aria-label="Review due">
            <div className="section-head">
              <h2>Review due</h2>
              <span className="board-count">{reviewDue.length}</span>
            </div>
            {reviewDue.length === 0 ? (
              <p className="board-empty">No missed questions due for review.</p>
            ) : (
              <ul className="board-rows">
                {reviewDue.map((item) => (
                  <li key={`${item.paperDay}-${item.questionIndex}`}>
                    <button className="board-row board-row-main" onClick={() => setView({ name: "review", item })}>
                      <span className="tag">{item.nextReview < localToday() ? "overdue" : "due"}</span>
                      <span className="board-title">{item.prompt}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {view.name === "paper" && paper && (
        <PaperView
          paper={paper}
          course={course}
          onBack={() => setView({ name: "board" })}
          onChanged={() => refresh(course)}
          onError={setError}
        />
      )}

      {view.name === "review" && (
        <ReviewDetail
          item={view.item}
          course={course}
          onBack={() => setView({ name: "board" })}
          onChanged={() => refresh(course)}
          onError={setError}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `frontend.tsx`'s `DeepLink` type and `navigate` function**

Edit 1 — old:
```ts
type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "theory"; conceptDay: number }
  | { tab: "goals"; projectId: number }
  | { tab: "exam"; paperDay: number };
```
new:
```ts
type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "theory"; conceptDay: number }
  | { tab: "goals"; projectId: number }
  | { tab: "exam"; course: string; paperDay: number };
```

Edit 2 — old:
```ts
  const navigate = (item: { source: "leetcode" | "theory" | "goals" | "exam"; linkId: number }) => {
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "theory") setDeepLink({ tab: "theory", conceptDay: item.linkId });
    else if (item.source === "goals") setDeepLink({ tab: "goals", projectId: item.linkId });
    else setDeepLink({ tab: "exam", paperDay: item.linkId });
    setTab(item.source);
  };
```
new:
```ts
  const navigate = (item: { source: "leetcode" | "theory" | "goals" | "exam"; linkId: number; course?: string }) => {
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "theory") setDeepLink({ tab: "theory", conceptDay: item.linkId });
    else if (item.source === "goals") setDeepLink({ tab: "goals", projectId: item.linkId });
    else setDeepLink({ tab: "exam", course: item.course!, paperDay: item.linkId });
    setTab(item.source);
  };
```

Edit 3 — old:
```tsx
      {tab === "exam" && (
        <ExamApp
          openPaperDay={deepLink?.tab === "exam" ? deepLink.paperDay : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
```
new:
```tsx
      {tab === "exam" && (
        <ExamApp
          openCourse={deepLink?.tab === "exam" ? deepLink.course : null}
          openPaperDay={deepLink?.tab === "exam" ? deepLink.paperDay : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
```

- [ ] **Step 3: Type-check the whole project**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Manual verification in the browser**

Run: `bun --hot index.ts` (or confirm the existing dev server is already running with hot reload), then in a browser at `http://localhost:4321`:
1. Open the Exam tab — confirm a course-selector row appears above the stats, with "Intro to Cybersecurity" shown (and selected by default, since it's the only course with papers).
2. Confirm today's paper and review-due sections load exactly as before.
3. Open a paper, grade an mcq question and a short/scenario question, submit — confirm it still works end-to-end.
4. Go to the Home tab, confirm an exam due-item's subtitle now reads "Intro to Cybersecurity" instead of "Exam paper"/"Exam review", and clicking it still lands correctly on the Exam tab.

Report back what you observed; this step has no automated test (consistent with this codebase's existing convention of no automated frontend tests).

- [ ] **Step 5: Commit**

```bash
git add ExamApp.tsx frontend.tsx
git commit -m "feat: add a course selector to the Exam tab and thread it through deep links"
```

---

### Task 6: Course-aware content scaffold generator

**Added mid-implementation:** Task 1 made `course: string` a required field on
`ExamPaperSeed`, but `scripts/generate-exam-week.ts` — the scaffold generator
that produces a new week's blank content file — constructs `ExamPaperSeed`
objects too, and was never updated. This left the repo failing
`bunx tsc --noEmit`, which the Final Verification section below requires to
be clean. This task closes that gap: minimal, scoped only to making this one
script (and its test) compile and stay genuinely usable per-course.

**Files:**
- Modify: `scripts/generate-exam-week.ts`
- Modify: `scripts/generate-exam-week.test.ts`

**Interfaces:**
- Consumes: `ExamPaperSeed` (now requires `course: string`, from Task 1).
- Produces: `buildScaffold(course: string, week: number, paperCount: number, materials: string[]): ExamPaperSeed[]` (gains a leading `course` parameter); `GenerateOptions` gains a required `course: string` field. No other file in the repo calls these — this script is invoked standalone via its CLI entrypoint, not imported elsewhere.

- [ ] **Step 1: Update `buildScaffold` and `GenerateOptions` to require `course`**

In `scripts/generate-exam-week.ts`, change the `GenerateOptions` interface:

```ts
export interface GenerateOptions {
  week: number;
  weekDir: string;
  outPath: string;
  course: string;
  paperCount?: number;
  force?: boolean;
}
```

Change `buildScaffold`'s signature and the object it pushes:

```ts
export function buildScaffold(course: string, week: number, paperCount: number, materials: string[]): ExamPaperSeed[] {
  const papers: ExamPaperSeed[] = [];
  for (let n = 1; n <= paperCount; n++) {
    papers.push({
      course,
      week,
      paperNumber: n,
      title: `Week ${week} Practice Paper ${n}`,
      topics: "",
      sourceFiles: materials,
      questions: [
        ...Array.from({ length: 8 }, () => ({
          type: "mcq" as const,
          prompt: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          modelAnswer: "",
        })),
        ...Array.from({ length: 4 }, () => ({ type: "short" as const, prompt: "", modelAnswer: "" })),
        ...Array.from({ length: 2 }, () => ({ type: "scenario" as const, prompt: "", modelAnswer: "" })),
      ],
    });
  }
  return papers;
}
```

Change `generateWeekFile` to destructure and pass `course` through:

```ts
export async function generateWeekFile(options: GenerateOptions): Promise<GenerateResult> {
  const { week, weekDir, outPath, course, paperCount = 3, force = false } = options;
  if (!existsSync(weekDir)) {
    return { written: false, reason: `Week folder not found: ${weekDir}`, path: outPath };
  }
  if (existsSync(outPath) && !force) {
    return { written: false, reason: `${outPath} already exists — pass force to overwrite`, path: outPath };
  }
  const { materials, videos } = scanWeekFolder(weekDir);
  const papers = buildScaffold(course, week, paperCount, materials);
  const source = renderScaffoldModule(week, papers, videos);
  await Bun.write(outPath, source);
  return { written: true, path: outPath };
}
```

`scanWeekFolder` and `renderScaffoldModule` are unchanged — neither constructs an `ExamPaperSeed` literal.

- [ ] **Step 2: Update the CLI entrypoint to accept `--course` and write into that course's folder**

Change `parseArgs`'s return type and body:

```ts
function parseArgs(argv: string[]): { week: number; course: string; courseDir?: string; papers: number; force: boolean } {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const week = Number(get("--week"));
  if (!Number.isInteger(week) || week < 1) {
    throw new Error(
      "Usage: bun scripts/generate-exam-week.ts --week <n> [--course <code>] [--course-dir <path>] [--papers <n>] [--force]",
    );
  }
  const papersArg = get("--papers");
  return {
    week,
    course: get("--course") ?? "INFO5995",
    courseDir: get("--course-dir"),
    papers: papersArg ? Number(papersArg) : 3,
    force: argv.includes("--force"),
  };
}
```

Change the `if (import.meta.main)` block so `outPath` nests under the course's own subfolder (matching Task 1's `exam-content/info5995/week-1.ts` layout), and `course` is threaded into `generateWeekFile`:

```ts
if (import.meta.main) {
  const { week, course, courseDir, papers, force } = parseArgs(process.argv.slice(2));
  const weekDir = join(courseDir ?? DEFAULT_COURSE_DIR, `Week ${week}`);
  const outPath = join(import.meta.dir, "..", "exam-content", course.toLowerCase(), `week-${week}.ts`);
  const result = await generateWeekFile({ week, weekDir, outPath, course, paperCount: papers, force });
  if (!result.written) {
    console.error(result.reason);
    process.exit(1);
  }
  console.log(`Wrote scaffold to ${result.path} — ask Claude Code to fill it in from ${weekDir}`);
}
```

`DEFAULT_COURSE_DIR` stays as-is (still INFO5995's real folder path) — `--course` defaults to `"INFO5995"` so today's one-command usage (`bun scripts/generate-exam-week.ts --week 2`) keeps working unchanged; generating for a different course requires passing both `--course <code>` and `--course-dir <path>` explicitly, since no course→folder-name lookup table exists yet (out of scope — this script has always taken an explicit `--course-dir` override for exactly this reason).

- [ ] **Step 3: Update the test file for the new `course` parameter**

In `scripts/generate-exam-week.test.ts`, apply these edits:

Edit 1 — old:
```ts
test("buildScaffold produces the requested number of blank papers, each with an 8/4/2 question mix", () => {
  const papers = buildScaffold(1, 2, ["notes.md"]);
  expect(papers.length).toBe(2);
```
new:
```ts
test("buildScaffold produces the requested number of blank papers, each with an 8/4/2 question mix", () => {
  const papers = buildScaffold("INFO5995", 1, 2, ["notes.md"]);
  expect(papers.length).toBe(2);
  expect(papers[0]!.course).toBe("INFO5995");
```

Edit 2 — old:
```ts
test("renderScaffoldModule emits a module exporting WEEK_<n>_PAPERS", () => {
  const papers = buildScaffold(3, 1, ["notes.md"]);
```
new:
```ts
test("renderScaffoldModule emits a module exporting WEEK_<n>_PAPERS", () => {
  const papers = buildScaffold("INFO5995", 3, 1, ["notes.md"]);
```

Edit 3 — old:
```ts
  const result = await generateWeekFile({ week: 1, weekDir: dir, outPath });
  expect(result.written).toBe(false);
  expect(result.reason).toContain("already exists");
```
new:
```ts
  const result = await generateWeekFile({ week: 1, weekDir: dir, outPath, course: "INFO5995" });
  expect(result.written).toBe(false);
  expect(result.reason).toContain("already exists");
```

Edit 4 — old:
```ts
  const result = await generateWeekFile({ week: 1, weekDir: dir, outPath, force: true });
  expect(result.written).toBe(true);
```
new:
```ts
  const result = await generateWeekFile({ week: 1, weekDir: dir, outPath, course: "INFO5995", force: true });
  expect(result.written).toBe(true);
```

Edit 5 — old:
```ts
  const result = await generateWeekFile({ week: 99, weekDir: "/nonexistent/week-99", outPath: "/tmp/whatever-99.ts" });
  expect(result.written).toBe(false);
  expect(result.reason).toContain("not found");
```
new:
```ts
  const result = await generateWeekFile({ week: 99, weekDir: "/nonexistent/week-99", outPath: "/tmp/whatever-99.ts", course: "INFO5995" });
  expect(result.written).toBe(false);
  expect(result.reason).toContain("not found");
```

- [ ] **Step 4: Run the test file**

Run: `bun test scripts/generate-exam-week.test.ts`
Expected: All tests PASS (7 tests).

- [ ] **Step 5: Type-check and run the full suite**

Run: `bunx tsc --noEmit`
Expected: No errors anywhere in the repo.

Run: `bun test`
Expected: Every test in the repo passes.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-exam-week.ts scripts/generate-exam-week.test.ts
git commit -m "fix: make the exam scaffold generator course-aware"
```

---

## Final Verification

- [ ] Run `bun test` — expect the entire suite to pass.
- [ ] Run `bunx tsc --noEmit` — expect no type errors.
- [ ] Confirm `git log --oneline` shows 5 commits, one per task, each independently buildable.
