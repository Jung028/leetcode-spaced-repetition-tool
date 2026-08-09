# Exam History / Retake Archive — Design

**Status:** Approved 2026-08-09, ready for planning.

## Problem

`groupExamPapersByWeek` (used by both `GET /api/exam/:course/due` and the
Home due-list) filters to `w.papers.some((p) => !p.submitted)` — a week
disappears from the app entirely the moment every paper in it is
submitted. There is currently no way to get back to a fully-completed
week's papers at all, and no way to retake one.

## Goal

Inside the Modules (exam) tab, add a per-course **History** view that
lists every visible week (`weekStartDate(week) <= today`), regardless of
submission status, and lets the user **retake** any submitted paper —
unlimited times, each retake a fresh attempt with its own score, past
attempts kept and visible. A retake's grading feeds the existing
spaced-repetition review system (`exam_review_items`) exactly like a
first attempt — a retake is not a separate practice mode, it's "submit
again."

## Non-Goals

- No changes to the existing due-list behavior — `weeksDue` still hides
  fully-submitted weeks; History is the separate, comprehensive view.
- No retake limits, cooldowns, or attempt caps.
- No changes to `exam_review_items`/`exam_review_log` schema or to the
  spaced-repetition scheduling algorithm (`exam-scheduling.ts`) — retakes
  reuse `submitExamPaper`'s existing review-item creation untouched.
- No per-question attempt history (e.g. "you answered Q3 wrong on attempt
  1, right on attempt 2") — only paper-level score history.

## Architecture

### 1. Data model — `exam-db.ts`

One new table, added inside `migrateExam`'s existing `CREATE TABLE IF NOT
EXISTS` block (additive; no migration of existing data needed):

```sql
CREATE TABLE IF NOT EXISTS exam_attempt_history (
  course TEXT NOT NULL,
  week INTEGER NOT NULL,
  paper_number INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL,
  submitted_at TEXT NOT NULL,
  score_correct INTEGER NOT NULL,
  score_total INTEGER NOT NULL,
  PRIMARY KEY (course, week, paper_number, attempt_number)
);
```

`exam_papers`/`exam_answers` keep meaning exactly what they mean today:
the *current* (in-progress or most recently submitted) attempt. A retake
resets them in place rather than introducing a second "current attempt"
concept — every existing query in `exam-db.ts`/`exam-api.ts` that reads
`exam_papers`/`exam_answers` keeps working unmodified.

### 2. Retake — `retakeExamPaper()` in `exam-db.ts`

```ts
export type RetakeResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "not_submitted" };

export function retakeExamPaper(
  db: Database,
  course: string,
  week: number,
  paperNumber: number,
): RetakeResult
```

Logic:
1. Load the `exam_papers` row; `not_found` if missing, `not_submitted` if
   `submitted_at` is null (nothing to retake yet — the normal
   answer/grade/submit flow covers a first attempt).
2. Compute `attempt_number` = `1 + COUNT(*)` from `exam_attempt_history`
   for this `(course, week, paper_number)`.
3. Insert a snapshot row into `exam_attempt_history` from the current
   `exam_papers` row's `submitted_at`/`score_correct`/`score_total`.
4. `UPDATE exam_papers SET submitted_at = NULL, score_correct = NULL,
   score_total = NULL WHERE ...`.
5. `DELETE FROM exam_answers WHERE course = ? AND week = ? AND
   paper_number = ?`.

After this, the paper looks exactly like a never-attempted paper to
every existing endpoint — the client re-answers and re-grades each
question through the *unchanged* `/answer` and `/:questionIndex/grade`
routes, then calls the *unchanged* `/submit` route, which re-runs its
existing `ON CONFLICT (...) DO NOTHING` review-item insert for any
question graded wrong — reusing the first-attempt pipeline exactly,
per the earlier decision that retakes should feed reviews the same way.

### 3. History listing — `listExamHistory()` in `exam-db.ts` + route

```ts
export interface ExamAttemptSummary {
  attemptNumber: number;
  submittedAt: string;
  scoreCorrect: number;
  scoreTotal: number;
}

export interface ExamHistoryPaper extends ExamWeekPaperSummary {
  pastAttempts: ExamAttemptSummary[]; // oldest first; does not include the current attempt
}

export interface ExamHistoryWeek {
  week: number;
  dueDate: string;
  papers: ExamHistoryPaper[];
}
```

`GET /api/exam/:course/history` (new route in `examApiRoutes`, alongside
the existing `/:course/due`):

- Takes every `exam_papers` row for the course with `weekStartDate(week)
  <= today` (no `!submitted` filter — this is the whole point).
- Reuses `groupExamPapersByWeek`'s per-week grouping shape (same
  `ExamWeekPaperSummary` fields: `paperNumber`, `title`, `submitted`,
  `scoreCorrect`, `scoreTotal`) so the frontend list rendering can share
  its paper-row component with the existing due-list view, extended with
  each paper's `pastAttempts` pulled from `exam_attempt_history`.
- Sorted newest-week-first (History is a look-back view, unlike the
  due-list which is oldest-first/most-urgent-first).

### 4. Frontend — `ExamApp.tsx`

- A "History" button in the header, next to the existing "Sync" button.
- New `view` state: `{ name: "history" }`. On open, fetches `GET
  /api/exam/:course/history` and renders `ExamHistoryWeek[]` — one
  section per week, each paper row showing title, latest score, and
  (if any) a collapsed `pastAttempts` list ("Attempt 1: 3/5 (Aug 3) ·
  Attempt 2: 5/5 (Aug 5)").
- Each *submitted* paper row gets a "Retake" button: `POST
  .../retake`, then navigate to `{ name: "paper", week, paperNumber }`
  (reusing the existing `PaperLoader`/`PaperView` components — no new
  paper-taking UI, since a reset paper looks identical to a fresh one).
- Course switching reuses the existing `CourseSelector`.

## Error Handling

- `retake` on a paper that was never submitted → 400 `"paper not yet
  submitted"` (mirrors the existing `already_submitted`/`incomplete`
  error style in the `/submit` route).
- `retake`/`history` on an unknown course → 400 `"unknown course"`,
  matching every other exam route's `isKnownCourse` guard.
- History for a course with no visible weeks yet → `{ weeks: [] }`, not
  an error (mirrors `weeksDue: []` on the due route).

## Testing

Per this project's continuous-testing requirement (`CLAUDE.md`): every
task in the implementation plan ends green on `bun test` before moving
to the next, and `tsc --noEmit` stays clean throughout. Specifically:

- **`exam-db.test.ts`:**
  - `retakeExamPaper` on a submitted paper: snapshots the prior
    score/date into `exam_attempt_history`, clears `exam_papers`'
    submitted/score fields, deletes its `exam_answers` rows.
  - `retakeExamPaper` on a never-submitted paper returns `not_submitted`.
  - Two consecutive retakes produce `attempt_number` 1 and 2 in order.
  - Re-submitting after a retake with a previously-wrong question now
    answered correctly does not recreate its `exam_review_items` row;
    still wrong recreates it if it had been removed, unchanged if not
    (existing `ON CONFLICT DO NOTHING` behavior, exercised through a
    retake path for the first time).
  - `listExamHistory` includes a fully-submitted week (proving the gap
    this feature closes) and excludes weeks with `weekStartDate(week) >
    today`.
- **`exam-api.test.ts`:**
  - `POST /api/exam/:course/:week/:paperNumber/retake` happy path and
    both error reasons.
  - `GET /api/exam/:course/history` shape and week/attempt ordering.
- **`ExamApp.tsx`:** no new automated UI test in this plan (existing exam
  UI tests don't cover the Sync banner either, for the same reason) —
  manual browser verification: open History, confirm a fully-submitted
  week appears, retake a paper, confirm it reopens blank, resubmit,
  confirm the old attempt shows under "past attempts."

## Out of Scope

- Per-question attempt history / diffing answers across attempts.
- Retake limits or cooldowns.
- Exposing history/retake from the Home tab (Home only ever shows
  *due* items — History is Modules-tab-only, per this session's
  decision).
