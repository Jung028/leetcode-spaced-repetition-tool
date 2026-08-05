# Exam Weekly Pacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Exam tab's daily backlog-gated release model with real calendar-week pacing — a course-week's papers are all available for that whole week, due Sunday, and Home groups them into one due-item per `(course, week)` instead of one per paper.

**Architecture:** `exam-content.ts` gains pure schedule math (`SEMESTER_START`, `weekStartDate`, `weekDueDate`) and a shared grouping helper (`groupExamPapersByWeek`) used by both the API and Home aggregation layers. Every `exam_*` table's key changes from `(course, paper_day, ...)` to `(course, week, paper_number, ...)`; the backlog-gate machinery (`exam_state`, `releaseCount`) is removed entirely for Exam. A new migration tier converts the current `paper_day`-keyed shape to the new `week`/`paper_number`-keyed shape, composing with the existing ancient-shape migration already in place.

**Tech Stack:** Bun, `bun:sqlite`, `Bun.serve()`, React (via HTML imports), `bun test`.

## Global Constraints

- Semester start (Monday of Week 1, shared across every course): `SEMESTER_START = "2026-08-03"`.
- A paper is visible once `weekStartDate(paper.week) <= today`; it's due through `weekDueDate(paper.week)` (that week's Sunday) and overdue after.
- Completion is tracked **per week**, not per paper: `(course, week)` counts as done only once every paper in that week is submitted.
- No backlog gate for Exam — real calendar time is the only pacing. If multiple weeks are incomplete at once, **all** show as due (no cap).
- No content changes: `ExamPaperSeed` (`week`/`paperNumber`/`title`/`topics`/`sourceFiles`/`questions`) is untouched. INFO5995 Week 1 keeps its 3 existing papers exactly as authored.
- The per-question review ladder (`exam-scheduling.ts`, 3 → 5 → 7 → 14 → 30 days) is unchanged in mechanism — only its key shape grows `week`/`paper_number` in place of `paper_day`.
- The real `srs.db` has genuine unsubmitted progress (3 `exam_papers` rows, 24 `exam_answers` rows, all INFO5995) that the migration must preserve, re-keyed correctly.

Full design: `docs/superpowers/specs/2026-08-05-exam-weekly-pacing-design.md`.

---

### Task 1: Content & schedule layer

**Files:**
- Modify: `exam-content.ts`
- Modify: `exam-content.test.ts`

**Interfaces:**
- Consumes: `ExamPaperSeed` (`exam-content/types.ts`, unchanged), `addDays` (`scheduling.ts`).
- Produces: `SEMESTER_START: string`, `weekStartDate(week: number): string`, `weekDueDate(week: number): string`, `ExamWeekPaperSummary { paperNumber, title, submitted, scoreCorrect, scoreTotal }`, `ExamWeekView { week, dueDate, overdue, papers: ExamWeekPaperSummary[] }`, `groupExamPapersByWeek(course: string, rows: { week: number; paper_number: number; submitted_at: string | null; score_correct: number | null; score_total: number | null }[], today: string): ExamWeekView[]`, `buildExamSchedule(): ExamPaper[]` (now a trivial passthrough — `ExamPaper` is now just `ExamPaperSeed`, no added fields), `COURSES`/`listExamCourses()` (unchanged). Tasks 2-4 consume these exact names.

- [ ] **Step 1: Rewrite `exam-content.ts`**

Replace the entire file with:

```ts
// Aggregates every course's exam papers into one flat array, each paper
// carrying its own course tag. Add new courses/weeks here as they're
// generated: import the week's papers and append to ALL_PAPERS.
import { WEEK_1_PAPERS } from "./exam-content/info5995/week-1";
import type { ExamPaperSeed } from "./exam-content/types";
import { addDays } from "./scheduling";

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

// A paper's identity is (course, week, paperNumber) — all present directly
// on ExamPaperSeed already, so there's nothing left to compute per-paper.
export type ExamPaper = ExamPaperSeed;

export function buildExamSchedule(): ExamPaper[] {
  return ALL_PAPERS;
}

// Cross-references COURSES against which course codes actually appear in
// buildExamSchedule()'s output — a course only shows up here (and therefore
// anywhere in the API/UI) once it has at least one paper.
export function listExamCourses(): { code: string; name: string }[] {
  const present = new Set(ALL_PAPERS.map((p) => p.course));
  return COURSES.filter((c) => present.has(c.code));
}

// Monday of Week 1 — the same real calendar week for every course, since
// they're all taken in the same semester.
export const SEMESTER_START = "2026-08-03";

// A week's papers become visible once its Monday arrives.
export function weekStartDate(week: number): string {
  return addDays(SEMESTER_START, (week - 1) * 7);
}

// A week's papers are due through its Sunday.
export function weekDueDate(week: number): string {
  return addDays(SEMESTER_START, (week - 1) * 7 + 6);
}

export interface ExamWeekPaperSummary {
  paperNumber: number;
  title: string;
  submitted: boolean;
  scoreCorrect: number | null;
  scoreTotal: number | null;
}

export interface ExamWeekView {
  week: number;
  dueDate: string;
  overdue: boolean;
  papers: ExamWeekPaperSummary[];
}

interface PaperProgressRow {
  week: number;
  paper_number: number;
  submitted_at: string | null;
  score_correct: number | null;
  score_total: number | null;
}

// Groups flat per-paper progress rows into one entry per week, looking up
// each paper's title from the static content. Shared by exam-api.ts (the
// due-list/paper-picker response) and home-api.ts (the Home due-list), so
// both aggregate weeks identically — this is the one place that logic
// lives.
export function groupExamPapersByWeek(
  course: string,
  rows: PaperProgressRow[],
  today: string,
): ExamWeekView[] {
  const byWeek = new Map<number, PaperProgressRow[]>();
  for (const row of rows) {
    if (!byWeek.has(row.week)) byWeek.set(row.week, []);
    byWeek.get(row.week)!.push(row);
  }
  const groups: ExamWeekView[] = [];
  for (const [week, weekRows] of byWeek) {
    const papers: ExamWeekPaperSummary[] = weekRows
      .slice()
      .sort((a, b) => a.paper_number - b.paper_number)
      .map((r) => {
        const content = ALL_PAPERS.find(
          (p) => p.course === course && p.week === week && p.paperNumber === r.paper_number,
        );
        return {
          paperNumber: r.paper_number,
          title: content?.title ?? `Week ${week} Paper ${r.paper_number}`,
          submitted: r.submitted_at !== null,
          scoreCorrect: r.score_correct,
          scoreTotal: r.score_total,
        };
      });
    groups.push({ week, dueDate: weekDueDate(week), overdue: weekDueDate(week) < today, papers });
  }
  return groups.sort((a, b) => a.week - b.week);
}
```

- [ ] **Step 2: Rewrite `exam-content.test.ts`**

Replace the entire file with:

```ts
import { test, expect } from "bun:test";
import {
  buildExamSchedule,
  listExamCourses,
  COURSES,
  SEMESTER_START,
  weekStartDate,
  weekDueDate,
  groupExamPapersByWeek,
} from "./exam-content";

test("weekStartDate/weekDueDate compute the Monday/Sunday of the given week", () => {
  expect(weekStartDate(1)).toBe(SEMESTER_START); // 2026-08-03, a Monday
  expect(weekDueDate(1)).toBe("2026-08-09"); // that week's Sunday
  expect(weekStartDate(2)).toBe("2026-08-10");
  expect(weekDueDate(2)).toBe("2026-08-16");
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

test("INFO5995 Week 1 has exactly 3 papers, numbered 1-3", () => {
  const week1 = buildExamSchedule().filter((p) => p.course === "INFO5995" && p.week === 1);
  expect(week1.map((p) => p.paperNumber).sort()).toEqual([1, 2, 3]);
});

test("groupExamPapersByWeek groups multiple papers in the same week into one entry", () => {
  const rows = [
    { week: 1, paper_number: 1, submitted_at: "2026-08-05", score_correct: 20, score_total: 26 },
    { week: 1, paper_number: 2, submitted_at: null, score_correct: null, score_total: null },
    { week: 1, paper_number: 3, submitted_at: null, score_correct: null, score_total: null },
  ];
  const groups = groupExamPapersByWeek("INFO5995", rows, "2026-08-05");
  expect(groups.length).toBe(1);
  expect(groups[0]!.week).toBe(1);
  expect(groups[0]!.dueDate).toBe("2026-08-09");
  expect(groups[0]!.overdue).toBe(false);
  expect(groups[0]!.papers.length).toBe(3);
  expect(groups[0]!.papers.map((p) => p.paperNumber)).toEqual([1, 2, 3]);
  expect(groups[0]!.papers[0]!.submitted).toBe(true);
  expect(groups[0]!.papers[0]!.title.length).toBeGreaterThan(0);
  expect(groups[0]!.papers[1]!.submitted).toBe(false);
});

test("groupExamPapersByWeek marks a week overdue once today passes its due date", () => {
  const rows = [{ week: 1, paper_number: 1, submitted_at: null, score_correct: null, score_total: null }];
  const groups = groupExamPapersByWeek("INFO5995", rows, "2026-08-10"); // one day after 2026-08-09
  expect(groups[0]!.overdue).toBe(true);
});

test("groupExamPapersByWeek separates different weeks into different entries, sorted", () => {
  const rows = [
    { week: 2, paper_number: 1, submitted_at: null, score_correct: null, score_total: null },
    { week: 1, paper_number: 1, submitted_at: null, score_correct: null, score_total: null },
  ];
  const groups = groupExamPapersByWeek("INFO5995", rows, "2026-08-05");
  expect(groups.map((g) => g.week)).toEqual([1, 2]);
});
```

- [ ] **Step 3: Run the test file**

Run: `bun test exam-content.test.ts`
Expected: All tests PASS (9 tests).

- [ ] **Step 4: Commit**

```bash
git add exam-content.ts exam-content.test.ts
git commit -m "feat: replace per-course paperDay with weekly pacing math in exam-content.ts"
```

---

### Task 2: Database layer

**Files:**
- Modify: `exam-db.ts`
- Modify: `exam-db.test.ts`

**Interfaces:**
- Consumes: `buildExamSchedule()`, `weekStartDate`, `weekDueDate` (Task 1). Note: `weekStartDate`/`weekDueDate` are consumed here only inside the migration's row-lookup helper is NOT needed — the migration only needs `buildExamSchedule()` for position lookup; date math belongs to Task 3/4, not this task.
- Produces: every function below, all re-keyed to `(course, week, paperNumber, ...)`. Row types gain `week`/`paper_number` in place of `paper_day`. Tasks 3-4 consume these exact names/signatures:
  - `migrateExam(db, today)` — unchanged signature, now migrates through two legacy tiers and seeds with no date/gating logic.
  - `listExamPaperRows(db, course): ExamPaperRow[]` — **new name**, replaces `listDueExamPapers`; returns every paper row for the course, unfiltered by date (callers filter by visibility themselves using `weekStartDate`).
  - `getExamPaperRow(db, course, week, paperNumber): ExamPaperRow | null`
  - `listExamAnswers(db, course, week, paperNumber): ExamAnswerRow[]`
  - `saveExamAnswer(db, course, week, paperNumber, questionIndex, yourAnswer): void`
  - `gradeExamAnswer(db, course, week, paperNumber, questionIndex, correct, yourAnswer?): void`
  - `submitExamPaper(db, course, week, paperNumber, today): SubmitExamResult`
  - `countExamPapersSubmittedToday(db, course, today): number`
  - `listExamPapersSubmittedToday(db, course, today): ExamPaperRow[]`
  - `listDueExamReviewItems(db, course, today): ExamReviewItemRow[]`
  - `countOverdueExamReviewItems(db, course, today): number`
  - `countExamReviewsToday(db, course, today): number`
  - `listExamReviewsCompletedToday(db, course, today): { week: number; paper_number: number; question_index: number }[]`
  - `reviewExamItem(db, course, week, paperNumber, questionIndex, result, today): ExamReviewItemRow | null`
  - **Removed:** `listDueExamPapers`, `countOverdueExamPapers` (date-aware "due" filtering moves to Task 3/4, since it needs `weekStartDate`/`weekDueDate` from `exam-content.ts` and grouping logic, not raw SQL), `ensureExamStateRow`, `runExamReleaseGate` (backlog gate removed entirely).

- [ ] **Step 1: Rewrite `exam-db.ts`**

Replace the entire file with:

```ts
import type { Database } from "bun:sqlite";
import { buildExamSchedule } from "./exam-content";
import { addDays } from "./scheduling";
import { applyExamReview, type ExamReviewResult } from "./exam-scheduling";

export interface ExamPaperRow {
  course: string;
  week: number;
  paper_number: number;
  submitted_at: string | null;
  score_correct: number | null;
  score_total: number | null;
}

export interface ExamAnswerRow {
  course: string;
  week: number;
  paper_number: number;
  question_index: number;
  your_answer: string;
  correct: number | null;
}

export interface ExamReviewItemRow {
  id: number;
  course: string;
  week: number;
  paper_number: number;
  question_index: number;
  rung: number;
  next_review: string;
}

export function migrateExam(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_papers (
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER,
      PRIMARY KEY (course, week, paper_number)
    );
    CREATE TABLE IF NOT EXISTS exam_answers (
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (course, week, paper_number, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(course, week, paper_number, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
  `);

  migrateLegacySingleCourseShape(db);
  migrateFromPaperDayShape(db);
  // exam_state has no successor in the weekly-pacing schema — the backlog
  // gate it tracked is gone. Drop it unconditionally rather than nesting
  // this inside either migration tier: the real running srs.db already
  // has a course column (it went through the multi-course migration
  // already), so migrateLegacySingleCourseShape's isLegacy check is false
  // and never fires there — an exam_state drop nested only inside that
  // tier would leave the table behind forever on exactly that database.
  db.exec(`DROP TABLE IF EXISTS exam_state;`);
  seedNewPapers(db);
}

// One-time upgrade of a pre-existing single-course db (every exam_* table
// keyed without a `course` column) into a course+paper_day shape, backfilling
// course = 'INFO5995'. This predates the weekly-pacing model entirely; its
// job is only to produce the shape migrateFromPaperDayShape (below) expects
// to find and convert further — the two migrations compose independently,
// each firing only on its own specific legacy shape.
function migrateLegacySingleCourseShape(db: Database): void {
  const columns = db.query(`PRAGMA table_info(exam_papers)`).all() as { name: string }[];
  const isLegacy = columns.length > 0 && !columns.some((c) => c.name === "course");
  if (!isLegacy) return;

  db.exec("BEGIN");
  try {
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
    `);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// One-time upgrade of a course+paper_day-keyed db (the shape every exam_*
// table was in immediately before this plan) into the course+week+paper_number
// shape. paper_day was assigned by array position within a course under the
// old buildExamSchedule(); reconstructing that same position against today's
// content (buildExamSchedule() filtered by course, indexed by paper_day - 1)
// recovers each row's real (week, paperNumber) — no hardcoded guessing.
function migrateFromPaperDayShape(db: Database): void {
  const columns = db.query(`PRAGMA table_info(exam_papers)`).all() as { name: string }[];
  const isPaperDayShape = columns.length > 0 && columns.some((c) => c.name === "paper_day");
  if (!isPaperDayShape) return;

  const schedule = buildExamSchedule();
  const lookup = (course: string, paperDay: number) => {
    const coursePapers = schedule.filter((p) => p.course === course);
    return coursePapers[paperDay - 1]; // undefined if content shrank since this row was created
  };

  db.exec("BEGIN");
  try {
    const oldPapers = db
      .query(`SELECT course, paper_day, submitted_at, score_correct, score_total FROM exam_papers`)
      .all() as {
      course: string;
      paper_day: number;
      submitted_at: string | null;
      score_correct: number | null;
      score_total: number | null;
    }[];
    const oldAnswers = db
      .query(`SELECT course, paper_day, question_index, your_answer, correct FROM exam_answers`)
      .all() as {
      course: string;
      paper_day: number;
      question_index: number;
      your_answer: string;
      correct: number | null;
    }[];
    const oldReviewItems = db
      .query(`SELECT id, course, paper_day, question_index, rung, next_review FROM exam_review_items`)
      .all() as {
      id: number;
      course: string;
      paper_day: number;
      question_index: number;
      rung: number;
      next_review: string;
    }[];
    const oldReviewLog = db
      .query(`SELECT id, course, paper_day, question_index, reviewed_at, result FROM exam_review_log`)
      .all() as {
      id: number;
      course: string;
      paper_day: number;
      question_index: number;
      reviewed_at: string;
      result: string;
    }[];

    db.exec(`
      CREATE TABLE exam_papers_new (
        course TEXT NOT NULL, week INTEGER NOT NULL, paper_number INTEGER NOT NULL,
        submitted_at TEXT, score_correct INTEGER, score_total INTEGER,
        PRIMARY KEY (course, week, paper_number)
      );
      CREATE TABLE exam_answers_new (
        course TEXT NOT NULL, week INTEGER NOT NULL, paper_number INTEGER NOT NULL, question_index INTEGER NOT NULL,
        your_answer TEXT NOT NULL DEFAULT '', correct INTEGER,
        PRIMARY KEY (course, week, paper_number, question_index)
      );
      CREATE TABLE exam_review_items_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, week INTEGER NOT NULL,
        paper_number INTEGER NOT NULL, question_index INTEGER NOT NULL,
        rung INTEGER NOT NULL DEFAULT -1, next_review TEXT NOT NULL,
        UNIQUE(course, week, paper_number, question_index)
      );
      CREATE TABLE exam_review_log_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, week INTEGER NOT NULL,
        paper_number INTEGER NOT NULL, question_index INTEGER NOT NULL,
        reviewed_at TEXT NOT NULL, result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
      );
    `);

    const insertPaper = db.query(
      `INSERT INTO exam_papers_new (course, week, paper_number, submitted_at, score_correct, score_total) VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const row of oldPapers) {
      const content = lookup(row.course, row.paper_day);
      if (!content) continue;
      insertPaper.run(row.course, content.week, content.paperNumber, row.submitted_at, row.score_correct, row.score_total);
    }
    const insertAnswer = db.query(
      `INSERT INTO exam_answers_new (course, week, paper_number, question_index, your_answer, correct) VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const row of oldAnswers) {
      const content = lookup(row.course, row.paper_day);
      if (!content) continue;
      insertAnswer.run(row.course, content.week, content.paperNumber, row.question_index, row.your_answer, row.correct);
    }
    const insertReviewItem = db.query(
      `INSERT INTO exam_review_items_new (id, course, week, paper_number, question_index, rung, next_review) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const row of oldReviewItems) {
      const content = lookup(row.course, row.paper_day);
      if (!content) continue;
      insertReviewItem.run(row.id, row.course, content.week, content.paperNumber, row.question_index, row.rung, row.next_review);
    }
    const insertReviewLog = db.query(
      `INSERT INTO exam_review_log_new (id, course, week, paper_number, question_index, reviewed_at, result) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const row of oldReviewLog) {
      const content = lookup(row.course, row.paper_day);
      if (!content) continue;
      insertReviewLog.run(row.id, row.course, content.week, content.paperNumber, row.question_index, row.reviewed_at, row.result);
    }

    db.exec(`
      DROP TABLE exam_papers;
      ALTER TABLE exam_papers_new RENAME TO exam_papers;
      DROP TABLE exam_answers;
      ALTER TABLE exam_answers_new RENAME TO exam_answers;
      DROP TABLE exam_review_items;
      ALTER TABLE exam_review_items_new RENAME TO exam_review_items;
      DROP TABLE exam_review_log;
      ALTER TABLE exam_review_log_new RENAME TO exam_review_log;
    `);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// Inserts any (course, week, paperNumber) paper from the current content
// that isn't in exam_papers yet — idempotent, no date/gating logic: a paper
// simply exists once authored, and whether it's currently visible is a
// read-time question (weekStartDate), not something seeding decides.
function seedNewPapers(db: Database): void {
  const insert = db.query(
    `INSERT INTO exam_papers (course, week, paper_number) VALUES (?, ?, ?)
     ON CONFLICT (course, week, paper_number) DO NOTHING`,
  );
  for (const paper of buildExamSchedule()) {
    insert.run(paper.course, paper.week, paper.paperNumber);
  }
}

export function listExamPaperRows(db: Database, course: string): ExamPaperRow[] {
  return db
    .query(
      `SELECT course, week, paper_number, submitted_at, score_correct, score_total FROM exam_papers
       WHERE course = ? ORDER BY week, paper_number`,
    )
    .all(course) as ExamPaperRow[];
}

export function getExamPaperRow(db: Database, course: string, week: number, paperNumber: number): ExamPaperRow | null {
  return db
    .query(
      `SELECT course, week, paper_number, submitted_at, score_correct, score_total FROM exam_papers
       WHERE course = ? AND week = ? AND paper_number = ?`,
    )
    .get(course, week, paperNumber) as ExamPaperRow | null;
}

export function listExamAnswers(db: Database, course: string, week: number, paperNumber: number): ExamAnswerRow[] {
  return db
    .query(
      `SELECT course, week, paper_number, question_index, your_answer, correct FROM exam_answers
       WHERE course = ? AND week = ? AND paper_number = ?`,
    )
    .all(course, week, paperNumber) as ExamAnswerRow[];
}

export function saveExamAnswer(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
  questionIndex: number,
  yourAnswer: string,
): void {
  db.query(
    `INSERT INTO exam_answers (course, week, paper_number, question_index, your_answer) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (course, week, paper_number, question_index) DO UPDATE SET your_answer = excluded.your_answer`,
  ).run(course, week, paperNumber, questionIndex, yourAnswer);
}

// yourAnswer is optional: mcq/truefalse grade themselves on selection and
// pass the chosen option index here in the same call; short/scenario save
// their draft separately (saveExamAnswer, during the reveal step) and only
// call this once, with the self-reported verdict.
export function gradeExamAnswer(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
  questionIndex: number,
  correct: boolean,
  yourAnswer?: string,
): void {
  if (yourAnswer !== undefined) {
    db.query(
      `INSERT INTO exam_answers (course, week, paper_number, question_index, your_answer, correct) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (course, week, paper_number, question_index) DO UPDATE SET your_answer = excluded.your_answer, correct = excluded.correct`,
    ).run(course, week, paperNumber, questionIndex, yourAnswer, correct ? 1 : 0);
  } else {
    db.query(
      `INSERT INTO exam_answers (course, week, paper_number, question_index, your_answer, correct) VALUES (?, ?, ?, ?, '', ?)
       ON CONFLICT (course, week, paper_number, question_index) DO UPDATE SET correct = excluded.correct`,
    ).run(course, week, paperNumber, questionIndex, correct ? 1 : 0);
  }
}

export type SubmitExamResult =
  | { ok: true; scoreCorrect: number; scoreTotal: number }
  | { ok: false; reason: "not_found" | "already_submitted" | "incomplete" };

export function submitExamPaper(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
  today: string,
): SubmitExamResult {
  const paper = getExamPaperRow(db, course, week, paperNumber);
  if (!paper) return { ok: false, reason: "not_found" };
  if (paper.submitted_at) return { ok: false, reason: "already_submitted" };

  const content = buildExamSchedule().find((p) => p.course === course && p.week === week && p.paperNumber === paperNumber);
  if (!content) return { ok: false, reason: "not_found" };

  const answers = listExamAnswers(db, course, week, paperNumber);
  const gradedByIndex = new Map(answers.map((a) => [a.question_index, a.correct]));
  for (let i = 0; i < content.questions.length; i++) {
    const c = gradedByIndex.get(i);
    if (c === null || c === undefined) return { ok: false, reason: "incomplete" };
  }

  const scoreCorrect = answers.filter((a) => a.correct === 1).length;
  const scoreTotal = content.questions.length;
  db.query(
    `UPDATE exam_papers SET submitted_at = ?, score_correct = ?, score_total = ? WHERE course = ? AND week = ? AND paper_number = ?`,
  ).run(today, scoreCorrect, scoreTotal, course, week, paperNumber);

  const insertReview = db.query(
    `INSERT INTO exam_review_items (course, week, paper_number, question_index, rung, next_review) VALUES (?, ?, ?, ?, -1, ?)
     ON CONFLICT (course, week, paper_number, question_index) DO NOTHING`,
  );
  for (const a of answers) {
    if (a.correct === 0) insertReview.run(course, week, paperNumber, a.question_index, addDays(today, 1));
  }

  return { ok: true, scoreCorrect, scoreTotal };
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
      `SELECT course, week, paper_number, submitted_at, score_correct, score_total FROM exam_papers
       WHERE course = ? AND submitted_at = ? ORDER BY week, paper_number`,
    )
    .all(course, today) as ExamPaperRow[];
}

export function listDueExamReviewItems(db: Database, course: string, today: string): ExamReviewItemRow[] {
  return db
    .query(
      `SELECT id, course, week, paper_number, question_index, rung, next_review FROM exam_review_items
       WHERE course = ? AND next_review <= ? ORDER BY next_review, id`,
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
): { week: number; paper_number: number; question_index: number }[] {
  return db
    .query(`SELECT week, paper_number, question_index FROM exam_review_log WHERE course = ? AND reviewed_at = ?`)
    .all(course, today) as { week: number; paper_number: number; question_index: number }[];
}

export function reviewExamItem(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
  questionIndex: number,
  result: ExamReviewResult,
  today: string,
): ExamReviewItemRow | null {
  const current = db
    .query(
      `SELECT id, course, week, paper_number, question_index, rung, next_review FROM exam_review_items
       WHERE course = ? AND week = ? AND paper_number = ? AND question_index = ?`,
    )
    .get(course, week, paperNumber, questionIndex) as ExamReviewItemRow | null;
  if (!current) return null;

  db.query(
    `INSERT INTO exam_review_log (course, week, paper_number, question_index, reviewed_at, result) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(course, week, paperNumber, questionIndex, today, result);

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
  listExamPaperRows,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countExamPapersSubmittedToday,
  listDueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
} from "./exam-db";
import { buildExamSchedule } from "./exam-content";
import { addDays } from "./scheduling";

const TODAY = "2026-08-05"; // a Wednesday in Week 1 (2026-08-03..2026-08-09)
const COURSE = "INFO5995";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateExam(db, TODAY);
});

test("seeds every paper for the course, unsubmitted", () => {
  const rows = listExamPaperRows(db, COURSE);
  expect(rows.length).toBe(3); // INFO5995 Week 1's 3 papers
  expect(rows.every((r) => r.submitted_at === null)).toBe(true);
  expect(rows.map((r) => r.paper_number).sort()).toEqual([1, 2, 3]);
});

test("migrateExam does not reseed or reset progress on a second call", () => {
  saveExamAnswer(db, COURSE, 1, 1, 0, "draft");
  migrateExam(db, TODAY);
  const answers = listExamAnswers(db, COURSE, 1, 1);
  expect(answers[0]!.your_answer).toBe("draft");
});

test("getExamPaperRow returns null for an unknown paper", () => {
  expect(getExamPaperRow(db, COURSE, 99, 1)).toBeNull();
});

test("saveExamAnswer stores a draft without grading it", () => {
  saveExamAnswer(db, COURSE, 1, 1, 0, "my draft");
  const answers = listExamAnswers(db, COURSE, 1, 1);
  expect(answers[0]!.your_answer).toBe("my draft");
  expect(answers[0]!.correct).toBeNull();
});

test("submitExamPaper rejects submission until every question is graded", () => {
  const result = submitExamPaper(db, COURSE, 1, 1, TODAY);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("incomplete");
});

test("submitExamPaper computes score, marks submitted, and creates review items for wrong answers", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, i !== 0)); // question 0 wrong, rest correct

  const result = submitExamPaper(db, COURSE, 1, 1, TODAY);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.scoreTotal).toBe(paper1.questions.length);
    expect(result.scoreCorrect).toBe(paper1.questions.length - 1);
  }

  const paperRow = getExamPaperRow(db, COURSE, 1, 1)!;
  expect(paperRow.submitted_at).toBe(TODAY);

  const dueReviews = listDueExamReviewItems(db, COURSE, addDays(TODAY, 1));
  expect(dueReviews.length).toBe(1);
  expect(dueReviews[0]!.question_index).toBe(0);
  expect(dueReviews[0]!.paper_number).toBe(1);
});

test("submitExamPaper rejects a second submission of the same paper", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, true));
  submitExamPaper(db, COURSE, 1, 1, TODAY);

  const second = submitExamPaper(db, COURSE, 1, 1, TODAY);
  expect(second.ok).toBe(false);
  if (!second.ok) expect(second.reason).toBe("already_submitted");
});

test("other papers in the same week are untouched by submitting one paper", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, true));
  submitExamPaper(db, COURSE, 1, 1, TODAY);

  expect(getExamPaperRow(db, COURSE, 1, 2)!.submitted_at).toBeNull();
  expect(getExamPaperRow(db, COURSE, 1, 3)!.submitted_at).toBeNull();
});

test("countExamPapersSubmittedToday counts submitted papers for the day", () => {
  expect(countExamPapersSubmittedToday(db, COURSE, TODAY)).toBe(0);
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, true));
  submitExamPaper(db, COURSE, 1, 1, TODAY);
  expect(countExamPapersSubmittedToday(db, COURSE, TODAY)).toBe(1);
});

test("reviewExamItem applies the ladder and logs the attempt", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, i !== 0));
  submitExamPaper(db, COURSE, 1, 1, TODAY);

  const tomorrow = addDays(TODAY, 1);
  const updated = reviewExamItem(db, COURSE, 1, 1, 0, "correct", tomorrow)!;
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(tomorrow, 3));
  expect(countExamReviewsToday(db, COURSE, tomorrow)).toBe(1);
});

test("reviewExamItem returns null for an item that isn't in the review queue", () => {
  expect(reviewExamItem(db, COURSE, 1, 1, 5, "correct", TODAY)).toBeNull();
});

test("two different courses' rows are independent — course scoping partitions correctly", () => {
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES ('COMP5348', 1, 1)`).run();
  saveExamAnswer(db, "COMP5348", 1, 1, 0, "comp draft");
  saveExamAnswer(db, COURSE, 1, 1, 0, "info draft");

  expect(listExamAnswers(db, "COMP5348", 1, 1)[0]!.your_answer).toBe("comp draft");
  expect(listExamAnswers(db, COURSE, 1, 1)[0]!.your_answer).toBe("info draft");
  expect(getExamPaperRow(db, "COMP5348", 1, 1)!.course).toBe("COMP5348");
  expect(listExamPaperRows(db, "COMP5348").length).toBe(1);
  expect(listExamPaperRows(db, COURSE).length).toBe(3); // unaffected by COMP5348's row
});

test("migrateExam upgrades a pre-existing paper_day-keyed db, recovering (week, paperNumber) by content position", () => {
  const legacyDb = new Database(":memory:");
  legacyDb.exec(`
    CREATE TABLE exam_papers (
      course TEXT NOT NULL, paper_day INTEGER NOT NULL, next_review TEXT NOT NULL,
      submitted_at TEXT, score_correct INTEGER, score_total INTEGER,
      PRIMARY KEY (course, paper_day)
    );
    CREATE TABLE exam_answers (
      course TEXT NOT NULL, paper_day INTEGER NOT NULL, question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '', correct INTEGER,
      PRIMARY KEY (course, paper_day, question_index)
    );
    CREATE TABLE exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, rung INTEGER NOT NULL DEFAULT -1, next_review TEXT NOT NULL,
      UNIQUE(course, paper_day, question_index)
    );
    CREATE TABLE exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    -- The real running srs.db already went through the multi-course migration,
    -- so it has this table (course, released_up_to) sitting alongside the
    -- course+paper_day exam_papers shape — this fixture matches that exactly.
    CREATE TABLE exam_state (
      course TEXT PRIMARY KEY,
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);
  // paper_day 2 = INFO5995's 2nd paper in content order = (week 1, paperNumber 2)
  legacyDb
    .query(
      `INSERT INTO exam_papers (course, paper_day, next_review, submitted_at, score_correct, score_total) VALUES ('INFO5995', 2, ?, ?, 20, 26)`,
    )
    .run(TODAY, TODAY);
  legacyDb
    .query(`INSERT INTO exam_answers (course, paper_day, question_index, your_answer, correct) VALUES ('INFO5995', 2, 0, 'my answer', 1)`)
    .run();
  legacyDb
    .query(`INSERT INTO exam_review_items (course, paper_day, question_index, rung, next_review) VALUES ('INFO5995', 2, 3, 0, ?)`)
    .run(TODAY);
  legacyDb
    .query(`INSERT INTO exam_review_log (course, paper_day, question_index, reviewed_at, result) VALUES ('INFO5995', 2, 3, ?, 'correct')`)
    .run(TODAY);
  legacyDb.query(`INSERT INTO exam_state (course, released_up_to) VALUES ('INFO5995', 3)`).run();

  migrateExam(legacyDb, TODAY);

  const paper = getExamPaperRow(legacyDb, "INFO5995", 1, 2)!;
  expect(paper).not.toBeNull();
  expect(paper.submitted_at).toBe(TODAY);
  expect(paper.score_correct).toBe(20);

  const answers = listExamAnswers(legacyDb, "INFO5995", 1, 2);
  expect(answers[0]!.your_answer).toBe("my answer");

  const dueReviews = listDueExamReviewItems(legacyDb, "INFO5995", TODAY);
  expect(dueReviews.some((r) => r.week === 1 && r.paper_number === 2 && r.question_index === 3)).toBe(true);

  expect(countExamReviewsToday(legacyDb, "INFO5995", TODAY)).toBe(1);

  // The other two papers (1 and 3) were seeded fresh by migrateExam's seedNewPapers step.
  expect(listExamPaperRows(legacyDb, "INFO5995").length).toBe(3);

  // exam_state has no successor in the weekly-pacing schema. This is the
  // exact shape (course+paper_day, exam_state already present) the real
  // running srs.db is in — it must not survive migration here.
  const tables = legacyDb.query(`SELECT name FROM sqlite_master WHERE type = 'table'`).all() as { name: string }[];
  expect(tables.some((t) => t.name === "exam_state")).toBe(false);
});

test("migrateExam cascades a genuinely ancient no-course-column db through both legacy tiers in one call", () => {
  const ancientDb = new Database(":memory:");
  ancientDb.exec(`
    CREATE TABLE exam_papers (
      paper_day INTEGER PRIMARY KEY, next_review TEXT NOT NULL,
      submitted_at TEXT, score_correct INTEGER, score_total INTEGER
    );
    CREATE TABLE exam_answers (
      paper_day INTEGER NOT NULL, question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '', correct INTEGER,
      PRIMARY KEY (paper_day, question_index)
    );
    CREATE TABLE exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, rung INTEGER NOT NULL DEFAULT -1, next_review TEXT NOT NULL,
      UNIQUE(paper_day, question_index)
    );
    CREATE TABLE exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE exam_state (
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);
  // paper_day 1 = INFO5995's 1st paper in content order = (week 1, paperNumber 1)
  ancientDb
    .query(
      `INSERT INTO exam_papers (paper_day, next_review, submitted_at, score_correct, score_total) VALUES (1, ?, ?, 24, 26)`,
    )
    .run(TODAY, TODAY);
  ancientDb
    .query(`INSERT INTO exam_answers (paper_day, question_index, your_answer, correct) VALUES (1, 0, 'ancient answer', 1)`)
    .run();
  ancientDb.query(`INSERT INTO exam_state (released_up_to) VALUES (3)`).run();

  migrateExam(ancientDb, TODAY);

  // Cascaded through both tiers in one migrateExam call: no-course -> course+paper_day -> week/paperNumber.
  const paper = getExamPaperRow(ancientDb, "INFO5995", 1, 1)!;
  expect(paper).not.toBeNull();
  expect(paper.submitted_at).toBe(TODAY);
  expect(paper.score_correct).toBe(24);
  expect(listExamAnswers(ancientDb, "INFO5995", 1, 1)[0]!.your_answer).toBe("ancient answer");

  const tables = ancientDb.query(`SELECT name FROM sqlite_master WHERE type = 'table'`).all() as { name: string }[];
  expect(tables.some((t) => t.name === "exam_state")).toBe(false);
});

test("a migration failure rolls back cleanly, leaving the original paper_day-shaped tables intact", () => {
  const legacyDb = new Database(":memory:");
  legacyDb.exec(`
    CREATE TABLE exam_papers (
      course TEXT NOT NULL, paper_day INTEGER NOT NULL, next_review TEXT NOT NULL,
      submitted_at TEXT, score_correct INTEGER, score_total INTEGER,
      PRIMARY KEY (course, paper_day)
    );
    CREATE TABLE exam_answers (
      course TEXT NOT NULL, paper_day INTEGER NOT NULL, question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '', correct INTEGER,
      PRIMARY KEY (course, paper_day, question_index)
    );
    CREATE TABLE exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, rung INTEGER NOT NULL DEFAULT -1, next_review TEXT NOT NULL,
      UNIQUE(course, paper_day, question_index)
    );
    CREATE TABLE exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
  `);
  legacyDb
    .query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES ('INFO5995', 1, ?)`)
    .run(TODAY);
  // A paper_day with no matching content position (way out of range) — lookup()
  // returns undefined for it, which the migration already handles by skipping
  // the row, so this doesn't actually throw; this test instead confirms that
  // exact skip-don't-crash behavior, since a real mid-migration SQL failure
  // is hard to simulate without corrupting bun:sqlite's connection itself.
  legacyDb
    .query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES ('INFO5995', 999, ?)`)
    .run(TODAY);

  migrateExam(legacyDb, TODAY);

  // The valid row (paper_day 1) migrated; the out-of-range row (999) was
  // dropped rather than crashing the whole migration or corrupting state.
  expect(getExamPaperRow(legacyDb, "INFO5995", 1, 1)).not.toBeNull();
  expect(listExamPaperRows(legacyDb, "INFO5995").length).toBe(3); // 1 migrated + 2 fresh-seeded
});
```

- [ ] **Step 3: Run the test file**

Run: `bun test exam-db.test.ts`
Expected: All tests PASS (15 tests).

- [ ] **Step 4: Commit**

```bash
git add exam-db.ts exam-db.test.ts
git commit -m "feat: re-key the exam database layer to (course, week, paperNumber), drop the backlog gate"
```

---

### Task 3: API layer

**Files:**
- Modify: `exam-api.ts`
- Modify: `exam-api.test.ts`

**Interfaces:**
- Consumes: every `exam-db.ts` function from Task 2, `buildExamSchedule()`/`listExamCourses()`/`weekStartDate()`/`weekDueDate()`/`groupExamPapersByWeek()`/`ExamWeekView` from Task 1.
- Produces: `examApiRoutes(db)` serving the routes below. `ExamPaperView` gains `week`/`paperNumber`/`dueDate`, drops `paperDay`/`nextReview`. `ExamReviewView` gains `week`/`paperNumber`, drops `paperDay`. Tasks 4-5 consume `ExamWeekView`/`ExamPaperView`/`ExamReviewView` from this file's exports (re-exported from `exam-content.ts` where noted).

- [ ] **Step 1: Rewrite `exam-api.ts`**

Replace the entire file with:

```ts
import type { Database } from "bun:sqlite";
import {
  listExamPaperRows,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countExamPapersSubmittedToday,
  listExamPapersSubmittedToday,
  listDueExamReviewItems,
  countOverdueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
  type ExamPaperRow,
  type ExamReviewItemRow,
} from "./exam-db";
import {
  buildExamSchedule,
  listExamCourses,
  weekStartDate,
  weekDueDate,
  groupExamPapersByWeek,
  type ExamWeekView,
} from "./exam-content";
import type { ExamQuestionType } from "./exam-content/types";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

function isKnownCourse(course: string): boolean {
  return listExamCourses().some((c) => c.code === course);
}

function parseWeek(raw: string): number | null {
  const week = Number(raw);
  if (!Number.isInteger(week) || week < 1) return null;
  return week;
}

function parsePaperNumber(raw: string, course: string, week: number): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return null;
  const exists = buildExamSchedule().some((p) => p.course === course && p.week === week && p.paperNumber === n);
  return exists ? n : null;
}

function parseQuestionIndex(raw: string, course: string, week: number, paperNumber: number): number | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.week === week && p.paperNumber === paperNumber);
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
  week: number;
  paperNumber: number;
  title: string;
  topics: string;
  dueDate: string;
  submittedAt: string | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  questions: ExamQuestionView[];
}

function paperView(db: Database, course: string, row: ExamPaperRow): ExamPaperView | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.week === row.week && p.paperNumber === row.paper_number);
  if (!content) return null;
  const answers = new Map(listExamAnswers(db, course, row.week, row.paper_number).map((a) => [a.question_index, a]));
  return {
    week: row.week,
    paperNumber: row.paper_number,
    title: content.title,
    topics: content.topics,
    dueDate: weekDueDate(row.week),
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
  week: number;
  paperNumber: number;
  questionIndex: number;
  rung: number;
  nextReview: string;
  prompt: string;
  modelAnswer: string;
  options: string[] | null;
  correctIndex: number | null;
}

function reviewView(course: string, item: ExamReviewItemRow): ExamReviewView | null {
  const content = buildExamSchedule().find((p) => p.course === course && p.week === item.week && p.paperNumber === item.paper_number);
  const question = content?.questions[item.question_index];
  if (!content || !question) return null;
  return {
    week: item.week,
    paperNumber: item.paper_number,
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
        const visibleRows = listExamPaperRows(db, course).filter((r) => weekStartDate(r.week) <= today);
        const weeksDue: ExamWeekView[] = groupExamPapersByWeek(course, visibleRows, today).filter((w) =>
          w.papers.some((p) => !p.submitted),
        );
        const reviewItems = listDueExamReviewItems(db, course, today);
        const reviewDue = reviewItems
          .map((item) => reviewView(course, item))
          .filter((r): r is ExamReviewView => r !== null);
        const overduePaperCount = visibleRows.filter((r) => r.submitted_at === null && weekDueDate(r.week) < today).length;
        const duePaperCount = visibleRows.filter((r) => r.submitted_at === null).length;
        return json({
          weeksDue,
          reviewDue,
          stats: {
            dueCount: duePaperCount + reviewItems.length,
            overdueCount: overduePaperCount + countOverdueExamReviewItems(db, course, today),
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
    "/api/exam/:course/:week/:paperNumber": {
      GET: (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const row = getExamPaperRow(db, course, week, paperNumber);
        if (!row) return json({ error: "not found" }, 404);
        return json(paperView(db, course, row));
      },
    },
    "/api/exam/:course/:week/:paperNumber/answer": {
      POST: async (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const body = (await req.json().catch(() => null)) as
          | { questionIndex?: unknown; yourAnswer?: unknown }
          | null;
        // typeof-guard first: Number("") is 0, not NaN, so falling through to
        // parseQuestionIndex on a missing/non-numeric questionIndex would
        // silently accept it as index 0 instead of rejecting it.
        const questionIndex =
          typeof body?.questionIndex === "number"
            ? parseQuestionIndex(String(body.questionIndex), course, week, paperNumber)
            : null;
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : "";
        saveExamAnswer(db, course, week, paperNumber, questionIndex, yourAnswer);
        return json(paperView(db, course, getExamPaperRow(db, course, week, paperNumber)!));
      },
    },
    "/api/exam/:course/:week/:paperNumber/:questionIndex/grade": {
      POST: async (
        req: Request & { params: { course: string; week: string; paperNumber: string; questionIndex: string } },
      ) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, course, week, paperNumber);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as
          | { correct?: unknown; yourAnswer?: unknown }
          | null;
        if (typeof body?.correct !== "boolean") return json({ error: "correct must be a boolean" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : undefined;
        gradeExamAnswer(db, course, week, paperNumber, questionIndex, body.correct, yourAnswer);
        return json(paperView(db, course, getExamPaperRow(db, course, week, paperNumber)!));
      },
    },
    "/api/exam/:course/:week/:paperNumber/submit": {
      POST: (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const result = submitExamPaper(db, course, week, paperNumber, localToday());
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
    "/api/exam/review/:course/:week/:paperNumber/:questionIndex": {
      POST: async (
        req: Request & { params: { course: string; week: string; paperNumber: string; questionIndex: string } },
      ) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, course, week, paperNumber);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as { result?: string } | null;
        if (body?.result !== "correct" && body?.result !== "wrong") {
          return json({ error: "result must be 'correct' or 'wrong'" }, 400);
        }
        const updated = reviewExamItem(db, course, week, paperNumber, questionIndex, body.result, localToday());
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
import { addDays } from "./scheduling";

const COURSE = "INFO5995";
const TODAY = "2026-08-05"; // a Wednesday in Week 1
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = new Database(":memory:");
  migrateExam(db, TODAY);
  server = Bun.serve({ port: 0, routes: examApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/exam/courses lists courses that have at least one paper", async () => {
  const body: any = await (await fetch(`${base}/api/exam/courses`)).json();
  expect(body.some((c: any) => c.code === "INFO5995")).toBe(true);
  expect(body.some((c: any) => c.code === "INFO5990")).toBe(false);
});

test("GET /api/exam/:course/due groups Week 1's 3 papers into one weeksDue entry", async () => {
  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  expect(body.weeksDue.length).toBe(1);
  expect(body.weeksDue[0].week).toBe(1);
  expect(body.weeksDue[0].papers.length).toBe(3);
  expect(body.weeksDue[0].papers.every((p: any) => !p.submitted)).toBe(true);
  expect(body.reviewDue).toEqual([]);
  expect(body.stats.dueCount).toBe(3);
});

test("GET /api/exam/:course/due with an unknown course returns 400", async () => {
  const res = await fetch(`${base}/api/exam/UNKNOWN123/due`);
  expect(res.status).toBe(400);
});

test("GET /api/exam/:course/:week/:paperNumber returns full question content", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1`);
  const body: any = await res.json();
  expect(body.week).toBe(1);
  expect(body.paperNumber).toBe(1);
  expect(body.dueDate).toBe("2026-08-09");
  expect(body.questions.length).toBeGreaterThan(0);
  expect(body.questions[0].modelAnswer.length).toBeGreaterThan(0);
});

test("GET /api/exam/:course/:week/:paperNumber 404s for a paper number that doesn't exist", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/99`);
  expect(res.status).toBe(404);
});

test("POST /api/exam/:course/:week/:paperNumber/answer saves a draft without grading", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 0, yourAnswer: "draft" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].yourAnswer).toBe("draft");
  expect(updated.questions[0].correct).toBeNull();
});

test("POST /api/exam/:course/:week/:paperNumber/:questionIndex/grade records a verdict", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/0/grade`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ correct: true, yourAnswer: "1" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].correct).toBe(1);
  expect(updated.questions[0].yourAnswer).toBe("1");
});

test("POST /api/exam/:course/:week/:paperNumber/submit fails while any question is ungraded, then succeeds once all are", async () => {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  const count = paperRes.questions.length;

  const incomplete = await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
  expect(incomplete.status).toBe(400);

  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  const submitRes = await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
  expect(submitRes.status).toBe(200);
  const result: any = await submitRes.json();
  expect(result.scoreTotal).toBe(count);
  expect(result.scoreCorrect).toBe(count - 1);
});

test("submitting the same paper twice returns 400", async () => {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  const count = paperRes.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
  const second = await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
  expect(second.status).toBe(400);
});

test("after submitting with one wrong answer, that question shows up as a review item tomorrow", async () => {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  const count = paperRes.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });

  const reviewRes = await fetch(`${base}/api/exam/review/${COURSE}/1/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  expect(reviewRes.status).toBe(200);
  const updated: any = await reviewRes.json();
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(TODAY, 3));
});

test("review rejects a bad result value", async () => {
  const res = await fetch(`${base}/api/exam/review/${COURSE}/1/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "meh" }),
  });
  expect(res.status).toBe(400);
});

test("an invalid week is rejected with 400", async () => {
  for (const bad of ["0", "-1", "abc"]) {
    const res = await fetch(`${base}/api/exam/${COURSE}/${bad}/1/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex: 0, yourAnswer: "x" }),
    });
    expect(res.status).toBe(400);
  }
});

test("a paperNumber that doesn't exist for the given week is rejected with 404", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/99/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 0, yourAnswer: "x" }),
  });
  expect(res.status).toBe(404);
});

test("questionIndex out of range is rejected with 400", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 999, yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("a missing questionIndex on /answer is rejected with 400, not silently treated as index 0", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/exam/:course/completed-today lists papers submitted today", async () => {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  const count = paperRes.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });

  const completed: any = await (await fetch(`${base}/api/exam/${COURSE}/completed-today`)).json();
  expect(completed.papers.length).toBe(1);
  expect(completed.papers[0].scoreCorrect).toBe(count);
});
```

- [ ] **Step 3: Run the test file**

Run: `bun test exam-api.test.ts`
Expected: All tests PASS (16 tests).

- [ ] **Step 4: Commit**

```bash
git add exam-api.ts exam-api.test.ts
git commit -m "feat: re-key exam API routes to :week/:paperNumber and group the due-list by week"
```

---

### Task 4: Home aggregation

**Files:**
- Modify: `home-api.ts`
- Modify: `home-api.test.ts`

**Interfaces:**
- Consumes: `listExamPaperRows`, `listDueExamReviewItems`, `countExamPapersSubmittedToday`, `countExamReviewsToday`, `listExamPapersSubmittedToday`, `listExamReviewsCompletedToday` (Task 2, all now `(db, course, ...)`), `buildExamSchedule`, `listExamCourses`, `COURSES`, `weekStartDate`, `groupExamPapersByWeek` (Task 1).
- Produces: `examDue`/`examCompletedToday` now emit one `DueItem` per incomplete `(course, week)` instead of one per paper. `DueItem.id` for exam items is now computed with a course-derived offset (see Step 1) to stay unique across courses that happen to share the same week number — the pre-existing `paper_day`-based id had this same latent collision risk; this fixes it while the code is already being rewritten.

- [ ] **Step 1: Rewrite `home-api.ts`**

Replace the entire file with:

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
import { isDue, localToday } from "./scheduling";

export type DueSource = "leetcode" | "theory" | "goals" | "exam";

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

function overdueDays(dueDate: string, today: string): number {
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(dueDate)) / 86_400_000));
}

// Every exam id below folds in a course-derived offset so two different
// courses' items (e.g. both having a "Week 1") never collide once flattened
// into one cross-course due list — COURSES has at most a handful of entries,
// so a wide fixed stride leaves plenty of headroom under each course's slot.
function courseOffset(course: string): number {
  return COURSES.findIndex((c) => c.code === course) * 100_000_000;
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

function examDue(db: Database, today: string): DueItem[] {
  const items: DueItem[] = [];
  for (const { code, name } of listExamCourses()) {
    const visibleRows = listExamPaperRows(db, code).filter((r) => weekStartDate(r.week) <= today);
    const weeks = groupExamPapersByWeek(code, visibleRows, today).filter((w) => w.papers.some((p) => !p.submitted));
    for (const week of weeks) {
      const submittedCount = week.papers.filter((p) => p.submitted).length;
      items.push({
        source: "exam" as const,
        id: courseOffset(code) + week.week,
        title: `Week ${week.week} (${submittedCount}/${week.papers.length} submitted)`,
        subtitle: name,
        dueDate: week.dueDate,
        overdueDays: overdueDays(week.dueDate, today),
        linkId: week.week,
        course: code,
      });
    }
    const reviews = listDueExamReviewItems(db, code, today).map((item) => {
      const content = buildExamSchedule().find(
        (p) => p.course === code && p.week === item.week && p.paperNumber === item.paper_number,
      );
      const question = content?.questions[item.question_index];
      return {
        source: "exam" as const,
        id: courseOffset(code) + item.week * 1_000_000 + item.paper_number * 1000 + item.question_index,
        title: question ? question.prompt.slice(0, 80) : "Exam review",
        subtitle: name,
        dueDate: item.next_review,
        overdueDays: overdueDays(item.next_review, today),
        linkId: item.week,
        course: code,
      };
    });
    items.push(...reviews);
  }
  return items;
}

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

function goalsCompletedToday(db: Database, today: string): DueItem[] {
  return listStepsCompletedOn(db, today).map((step) => ({
    source: "goals" as const,
    id: step.id,
    title: step.label,
    subtitle: step.project_title,
    dueDate: today,
    overdueDays: 0,
    linkId: step.project_id,
  }));
}

function examCompletedToday(db: Database, today: string): DueItem[] {
  const items: DueItem[] = [];
  for (const { code, name } of listExamCourses()) {
    const papers = listExamPapersSubmittedToday(db, code, today).map((row) => {
      const content = buildExamSchedule().find(
        (p) => p.course === code && p.week === row.week && p.paperNumber === row.paper_number,
      );
      return {
        source: "exam" as const,
        id: courseOffset(code) + row.week * 1000 + row.paper_number,
        title: content?.title ?? `Week ${row.week} Paper ${row.paper_number}`,
        subtitle: name,
        dueDate: today,
        overdueDays: 0,
        linkId: row.week,
        course: code,
      };
    });
    const reviews = listExamReviewsCompletedToday(db, code, today).map((item) => {
      const content = buildExamSchedule().find(
        (p) => p.course === code && p.week === item.week && p.paperNumber === item.paper_number,
      );
      const question = content?.questions[item.question_index];
      return {
        source: "exam" as const,
        id: courseOffset(code) + item.week * 1_000_000 + item.paper_number * 1000 + item.question_index,
        title: question ? question.prompt.slice(0, 80) : "Exam review",
        subtitle: name,
        dueDate: today,
        overdueDays: 0,
        linkId: item.week,
        course: code,
      };
    });
    items.push(...papers, ...reviews);
  }
  return items;
}

export interface HomeStats {
  dueToday: number;
  overdue: number;
  completedToday: number;
}

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

export function homeApiRoutes(db: Database) {
  return {
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
    "/api/home/stats": {
      GET: () => Response.json(homeStats(db, localToday())),
    },
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
  };
}
```

- [ ] **Step 2: Rewrite `home-api.test.ts`**

Read the current file first (`home-api.test.ts`) to preserve its non-exam tests (LeetCode/Theory/Goals sections) exactly as they are — only the exam-related tests and imports change. Apply these edits:

Edit 1 — old:
```ts
import { migrateExam, gradeExamAnswer, submitExamPaper, reviewExamItem } from "./exam-db";
import { buildExamSchedule, totalPapersForCourse } from "./exam-content";
```
new:
```ts
import { migrateExam, gradeExamAnswer, submitExamPaper, reviewExamItem } from "./exam-db";
import { buildExamSchedule } from "./exam-content";
```

Edit 2 — old:
```ts
const EXAM_DUE_ON_MIGRATE = Math.min(MAX_ACTIVE_BACKLOG, totalPapersForCourse("INFO5995"));
```
new:
```ts
// Weekly pacing has no backlog cap — every paper in the current week (Week 1,
// which TODAY falls inside) is due at once, so this is simply that week's
// paper count for INFO5995, not a capped value.
const EXAM_DUE_ON_MIGRATE = buildExamSchedule().filter((p) => p.course === "INFO5995" && p.week === 1).length;
```

Edit 3 — old:
```ts
test("GET /api/home/due includes today's exam paper", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBeGreaterThan(0);
  expect(examItems[0]!.linkId).toBe(1);
});
```
new:
```ts
test("GET /api/home/due includes this week's exam item", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBe(1); // Week 1's 3 papers collapse into one due-item
  expect(examItems[0]!.linkId).toBe(1); // week 1
  expect(examItems[0]!.title).toContain("Week 1");
});
```

Edit 4 — old:
```ts
test("GET /api/home/due gives exam papers and exam review items collision-free ids", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, addDays(TODAY, -1)); // review item's next_review lands on TODAY, while paper 2/3 are still due

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  const reviewItem = examItems.find((i) => i.subtitle === "Exam review")!;
  expect(reviewItem).toBeTruthy();
  expect(reviewItem.id).toBe(1000); // synthetic id: paper_day * 1000 + question_index, not the row's autoincrement PK
  const ids = examItems.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length); // no id collisions between exam papers and exam review items
});
```
new:
```ts
test("GET /api/home/due gives the week item and exam review items collision-free ids", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, 1, addDays(TODAY, -1)); // review item's next_review lands on TODAY

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  // The week item (papers 2/3 still unsubmitted) and the review item (paper 1's wrong question) coexist distinctly.
  expect(examItems.length).toBe(2);
  const weekItem = examItems.find((i) => i.title.startsWith("Week "));
  const reviewItem = examItems.find((i) => !i.title.startsWith("Week "));
  expect(weekItem).toBeTruthy();
  expect(reviewItem).toBeTruthy();
  const ids = examItems.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length); // no id collisions between the week item and the review item
});
```

Edit 5 — old:
```ts
test("GET /api/home/stats starts with 0 due (besides exam) when theory concepts are all blank", async () => {
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: EXAM_DUE_ON_MIGRATE, overdue: 0, completedToday: 0 });
});
```
new:
```ts
test("GET /api/home/stats starts with 1 exam item (this week, besides theory) when theory concepts are all blank", async () => {
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: 1, overdue: 0, completedToday: 0 }); // 1 grouped week-item, not EXAM_DUE_ON_MIGRATE papers
});
```

Edit 6 — old:
```ts
test("GET /api/home/stats counts theory concepts once they have content, up to the released cap", async () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: 5 + EXAM_DUE_ON_MIGRATE, overdue: 0, completedToday: 0 });
});
```
new:
```ts
test("GET /api/home/stats counts theory concepts once they have content, up to the released cap", async () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: 6, overdue: 0, completedToday: 0 }); // 5 theory + 1 exam week-item
});
```

Edit 7 — old:
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
  expect(stats.dueToday).toBe(6 + EXAM_DUE_ON_MIGRATE); // leetcode problem + 5 theory concepts (now with content) + exam papers
  expect(stats.overdue).toBe(1); // the goals step
});
```
new:
```ts
test("GET /api/home/stats counts dueToday and overdue across all four sources", async () => {
  createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  ); // due today
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const overdueProject = createProject(db, "Overdue project", addDays(TODAY, 10), addDays(TODAY, -3));
  createStep(db, overdueProject.id, "Overdue step", 20, addDays(TODAY, -3)); // overdue

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.dueToday).toBe(7); // leetcode problem + 5 theory concepts + 1 exam week-item
  expect(stats.overdue).toBe(1); // the goals step
});
```

Edit 8 — old:
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

  const after: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(after.completedToday).toBe(1);
});
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
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, true));
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const after: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(after.completedToday).toBe(1);
});
```

Edit 9 — old:
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
new:
```ts
test("GET /api/home/completed-today includes a submitted exam paper and a reviewed exam item", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, 1, TODAY); // creates a review item for question 0
  reviewExamItem(db, "INFO5995", 1, 1, 0, "correct", TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBe(2); // the submitted paper + the reviewed question
  expect(examItems.every((i) => i.subtitle === "Intro to Cybersecurity")).toBe(true);
  expect(new Set(examItems.map((i) => i.id)).size).toBe(2); // distinct ids
  expect(items.every((i) => i.dueDate === TODAY && i.overdueDays === 0)).toBe(true);
});
```

- [ ] **Step 3: Run the test file**

Run: `bun test home-api.test.ts`
Expected: All tests PASS.

- [ ] **Step 4: Run the full test suite**

Run: `bun test`
Expected: All tests PASS across the whole repo — this is the first point every touched file's tests run together.

- [ ] **Step 5: Commit**

```bash
git add home-api.ts home-api.test.ts
git commit -m "feat: group Home's exam due-list by (course, week) instead of by paper"
```

---

### Task 5: UI

**Files:**
- Modify: `ExamApp.tsx`
- Modify: `frontend.tsx`

**Interfaces:**
- Consumes: `ExamWeekView`, `ExamPaperView`, `ExamReviewView` from Task 3; `DueItem.course`/`.linkId` (now a week number) from Task 4.
- Produces: `ExamApp`'s props stay `{ openCourse?: string | null; openWeek?: number | null; onOpened?: () => void }` (renamed from `openPaperDay`); `frontend.tsx`'s exam `DeepLink` variant gains `week: number` (renamed from `paperDay`).

- [ ] **Step 1: Rewrite `ExamApp.tsx`**

Replace the entire file with:

```tsx
import React, { useEffect, useState } from "react";
import { EXAM_REVIEW_LADDER } from "./exam-scheduling";
import { localToday } from "./scheduling";
import type { ExamPaperView, ExamQuestionView, ExamReviewView } from "./exam-api";
import type { ExamWeekView } from "./exam-content";

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
type View =
  | { name: "board" }
  | { name: "week"; week: number }
  | { name: "paper"; week: number; paperNumber: number }
  | { name: "review"; item: ExamReviewView };

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
      json<{ weeksDue: ExamWeekView[]; reviewDue: ExamReviewView[]; stats: Stats }>(r),
    ),
  completedToday: (course: string) =>
    fetch(`/api/exam/${course}/completed-today`).then((r) => json<{ papers: ExamPaperView[] }>(r)),
  paper: (course: string, week: number, paperNumber: number) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}`).then((r) => json<ExamPaperView>(r)),
  saveAnswer: (course: string, week: number, paperNumber: number, questionIndex: number, yourAnswer: string) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex, yourAnswer }),
    }).then((r) => json<ExamPaperView>(r)),
  grade: (
    course: string,
    week: number,
    paperNumber: number,
    questionIndex: number,
    correct: boolean,
    yourAnswer?: string,
  ) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/${questionIndex}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct, ...(yourAnswer !== undefined ? { yourAnswer } : {}) }),
    }).then((r) => json<ExamPaperView>(r)),
  submit: (course: string, week: number, paperNumber: number) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/submit`, { method: "POST" }).then((r) =>
      json<{ scoreCorrect: number; scoreTotal: number }>(r),
    ),
  reviewItem: (course: string, week: number, paperNumber: number, questionIndex: number, result: Result) =>
    fetch(`/api/exam/review/${course}/${week}/${paperNumber}/${questionIndex}`, {
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
  week,
  paperNumber,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  course: string;
  week: number;
  paperNumber: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const graded = question.correct !== null;

  const choose = async (i: number) => {
    if (graded) return;
    onError(null);
    try {
      const updated = await api.grade(course, week, paperNumber, question.index, i === question.correctIndex, String(i));
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
  week,
  paperNumber,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  course: string;
  week: number;
  paperNumber: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState(question.yourAnswer);
  const [revealed, setRevealed] = useState(question.correct !== null);
  const graded = question.correct !== null;

  const saveAndReveal = async () => {
    onError(null);
    try {
      await api.saveAnswer(course, week, paperNumber, question.index, draft);
      setRevealed(true);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const grade = async (correct: boolean) => {
    onError(null);
    try {
      const updated = await api.grade(course, week, paperNumber, question.index, correct);
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
      await api.submit(course, paper.week, paper.paperNumber);
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
        <span className="lang-tag">Due {current.dueDate}</span>
      </header>
      {current.questions.map((q) =>
        q.type === "mcq" || q.type === "truefalse" ? (
          <McqQuestion
            key={q.index}
            question={q}
            course={course}
            week={paper.week}
            paperNumber={paper.paperNumber}
            onGraded={setCurrent}
            onError={onError}
          />
        ) : (
          <ShortOrScenarioQuestion
            key={q.index}
            question={q}
            course={course}
            week={paper.week}
            paperNumber={paper.paperNumber}
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

// Fetches and shows one paper's full content on demand — the weeksDue
// response only carries per-paper titles/submitted flags for the picker,
// not full question content, so opening a specific paper needs its own load.
function PaperLoader({
  course,
  week,
  paperNumber,
  onBack,
  onChanged,
  onError,
}: {
  course: string;
  week: number;
  paperNumber: number;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [paper, setPaper] = useState<ExamPaperView | null>(null);

  useEffect(() => {
    api
      .paper(course, week, paperNumber)
      .then(setPaper)
      .catch((err) => onError(errorMessage(err)));
  }, [course, week, paperNumber]);

  if (!paper) return <p className="board-empty">Loading…</p>;
  return <PaperView paper={paper} course={course} onBack={onBack} onChanged={onChanged} onError={onError} />;
}

function WeekPicker({
  weekView,
  onBack,
  onPickPaper,
}: {
  weekView: ExamWeekView;
  onBack: () => void;
  onPickPaper: (paperNumber: number) => void;
}) {
  return (
    <article className="detail">
      <header className="detail-head">
        <h2>Week {weekView.week}</h2>
        <span className="tag">{weekView.overdue ? "overdue" : "due"} — {weekView.dueDate}</span>
      </header>
      <ul className="board-rows">
        {weekView.papers.map((p) => (
          <li key={p.paperNumber}>
            {p.submitted ? (
              <div className="board-row">
                <span className="tag">done</span>
                <span className="board-title">{p.title}</span>
                <span className="lang-tag">{p.scoreCorrect}/{p.scoreTotal}</span>
              </div>
            ) : (
              <button className="board-row board-row-main" onClick={() => onPickPaper(p.paperNumber)}>
                <span className="tag">due</span>
                <span className="board-title">{p.title}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="btn-row">
        <button className="btn" onClick={onBack}>Back</button>
      </div>
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
      await api.reviewItem(course, item.week, item.paperNumber, item.questionIndex, result);
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
  openWeek,
  onOpened,
}: {
  openCourse?: string | null;
  openWeek?: number | null;
  onOpened?: () => void;
} = {}) {
  const [view, setView] = useState<View>({ name: "board" });
  const [courses, setCourses] = useState<ExamCourse[]>([]);
  const [course, setCourse] = useState<string | null>(null);
  const [weeksDue, setWeeksDue] = useState<ExamWeekView[]>([]);
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
      .then(({ weeksDue, reviewDue, stats }) => {
        setWeeksDue(weeksDue);
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

  // Submitting a week's last remaining paper drops that week out of
  // weeksDue entirely (groupExamPapersByWeek excludes fully-submitted
  // weeks). Without this, staying on { name: "week" } would render nothing
  // — currentWeek's lookup below would come back empty — so snap back to
  // the board once the week view's target no longer has an entry.
  useEffect(() => {
    if (view.name === "week" && !weeksDue.some((w) => w.week === view.week)) {
      setView({ name: "board" });
    }
  }, [weeksDue, view]);

  // A Home-tab click only switches course and returns to the board — it
  // doesn't drill into a specific week, matching how review-item deep links
  // already worked before this plan (no per-item drill-down target).
  useEffect(() => {
    if (openCourse != null || openWeek != null) {
      if (openCourse != null) setCourse(openCourse);
      onOpened?.();
    }
  }, [openCourse, openWeek]);

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
        {error ? <p className="form-error">{error}</p> : <p className="board-empty">Loading…</p>}
      </div>
    );
  }

  const currentWeek = view.name === "week" || view.name === "paper" ? weeksDue.find((w) => w.week === view.week) : undefined;

  return (
    <div className="theory">
      <CourseSelector courses={courses} selected={course} onSelect={setCourse} />
      <ExamStats stats={stats} onOpenCompleted={openCompleted} />
      {error && <p className="form-error">{error}</p>}
      <p className="rule-note">
        Each week's papers are due by Sunday. Missed questions come back for spaced review: 3 → 5 → 7 → 14 → 30 days.
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
                  <li key={`${p.week}-${p.paperNumber}`} className="modal-row">
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
          <section className="board" aria-label="Weeks due">
            <div className="section-head">
              <h2>This week's papers</h2>
            </div>
            {weeksDue.length === 0 ? (
              <p className="board-empty">Nothing due. Next week's papers unlock then.</p>
            ) : (
              <ul className="board-rows">
                {weeksDue.map((w) => {
                  const submittedCount = w.papers.filter((p) => p.submitted).length;
                  return (
                    <li key={w.week}>
                      <button className="board-row board-row-main" onClick={() => setView({ name: "week", week: w.week })}>
                        <span className="tag">{w.overdue ? "overdue" : "due"}</span>
                        <span className="board-title">Week {w.week}</span>
                        <span className="lang-tag">{submittedCount}/{w.papers.length} submitted · due {w.dueDate}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
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
                  <li key={`${item.week}-${item.paperNumber}-${item.questionIndex}`}>
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

      {view.name === "week" && currentWeek && (
        <WeekPicker
          weekView={currentWeek}
          onBack={() => setView({ name: "board" })}
          onPickPaper={(paperNumber) => setView({ name: "paper", week: view.week, paperNumber })}
        />
      )}

      {view.name === "paper" && (
        <PaperLoader
          course={course}
          week={view.week}
          paperNumber={view.paperNumber}
          onBack={() => setView({ name: "week", week: view.week })}
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

- [ ] **Step 2: Update `frontend.tsx`'s `DeepLink` type, `navigate` function, and `ExamApp` render**

Edit 1 — old:
```ts
type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "theory"; conceptDay: number }
  | { tab: "goals"; projectId: number }
  | { tab: "exam"; course: string; paperDay: number };
```
new:
```ts
type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "theory"; conceptDay: number }
  | { tab: "goals"; projectId: number }
  | { tab: "exam"; course: string; week: number };
```

Edit 2 — old:
```ts
    else setDeepLink({ tab: "exam", course: item.course!, paperDay: item.linkId });
```
new:
```ts
    else setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
```

Edit 3 — old:
```tsx
      {tab === "exam" && (
        <ExamApp
          openCourse={deepLink?.tab === "exam" ? deepLink.course : null}
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
          openWeek={deepLink?.tab === "exam" ? deepLink.week : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
```

- [ ] **Step 3: Type-check the whole project**

Run: `bunx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Run the full test suite**

Run: `bun test`
Expected: All tests pass across the whole repo.

- [ ] **Step 5: Manual verification in the browser**

Start a dev server against this branch's code (confirm nothing else is already bound to the port first), then in a browser:
1. Open the Exam tab — confirm the course selector still shows, and the board now shows a "This week's papers" section with one row: "Week 1 — 0/3 submitted · due 2026-08-09".
2. Click that row — confirm a picker appears listing all 3 papers by title, each clickable.
3. Open one paper, grade every question, submit — confirm you land back on the week picker, and that paper now shows a "done" badge with its score instead of being clickable.
4. Go to the Home tab — confirm the Home due-list shows one "Week 1 (1/3 submitted)" row for Intro to Cybersecurity (after the one submission above), not three separate rows.

Report back what you observed; this step has no automated test (consistent with this codebase's existing convention of no automated frontend tests).

- [ ] **Step 6: Commit**

```bash
git add ExamApp.tsx frontend.tsx
git commit -m "feat: redesign the Exam tab UI around weekly grouping with a per-week paper picker"
```

---

## Final Verification

- [ ] Run `bun test` — expect the entire suite to pass.
- [ ] Run `bunx tsc --noEmit` — expect no type errors.
- [ ] Confirm `git log --oneline` shows 5 commits, one per task, each independently buildable.
- [ ] Confirm the real `srs.db`'s 3 existing unsubmitted INFO5995 papers and 24 draft answers survive the migration correctly re-keyed (this can be spot-checked the same way the exam-multi-course plan's final review did: run `migrateExam` against a copy of the real `srs.db` and inspect the result, never the live file).
