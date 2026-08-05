# Exam Weekly Pacing Redesign — Design

**Status:** Approved 2026-08-05, ready for planning.

## Problem

The Exam tab currently paces papers with the same daily backlog-gated release
model Theory and Goals use: each paper gets a sequential `paperDay` within
its course, and up to `MAX_ACTIVE_BACKLOG` papers release at once, one new
one per day as backlog clears. This doesn't match how university exam
practice actually works — a week's papers should all be available for that
whole week and due by week's end, not trickled out one per day and marked
"overdue" the very next day.

Concretely: INFO5995 Week 1 has 3 papers, and because they released together
under the daily gate, they showed up on the Home tab as three separate,
identically-labeled "Exam paper" rows, all "1d late" — confusing, and not
how a student would think about "this week's exam practice."

## Scheduling Model

Every course shares one semester calendar:

```ts
export const SEMESTER_START = "2026-08-03"; // Monday of Week 1, all courses
```

```ts
// Sunday of the given week, 1-based. Week 1 = SEMESTER_START..SEMESTER_START+6.
export function weekDueDate(week: number): string {
  return addDays(SEMESTER_START, (week - 1) * 7 + 6);
}

// Monday of the given week — a week's papers aren't visible before this date.
export function weekStartDate(week: number): string {
  return addDays(SEMESTER_START, (week - 1) * 7);
}
```

A paper becomes visible once `weekStartDate(paper.week) <= today`, stays
"due" through `weekDueDate(paper.week)`, and is "overdue" once
`today > weekDueDate(paper.week)` and it's still unsubmitted. This applies
per paper, but **completion is tracked per week**: a `(course, week)` pair
counts as done only once every paper in that week is submitted — the Home
tab and Exam board group on the week, not the individual paper, and show
progress (e.g. "2/3 submitted") until then.

There is no more backlog gate for Exam. `exam_state`, `releaseCount`, and
the release-watermark logic are removed entirely for this domain — real
calendar time paces it, so an artificial cap serves no purpose. If a course
falls behind (an incomplete week's Sunday passes while a later week has
already started), **both** weeks show as due — no cap hides the older one.
This mirrors how Theory/Goals already show everything due at once, just
without any daily-release throttle underneath.

## Content Model

**No changes.** `ExamPaperSeed` already carries `week: number` and
`paperNumber: number` (1-based within the week) — exactly what this design
needs. INFO5995 Week 1 keeps its 3 existing papers exactly as authored; no
content is merged, rewritten, or dropped. Future weeks continue to be
authored the same way (`scripts/generate-exam-week.ts`'s scaffold + hand-fill
workflow, unchanged), one `ExamPaperSeed` per paper, several papers per week
being entirely normal.

`ExamPaper` (the `buildExamSchedule()` output type) drops the `paperDay`
field — it no longer has a purpose. A paper's identity going forward is the
tuple `(course, week, paperNumber)`, which the content already provides
directly; there's nothing left to compute per-paper at schedule-build time.

```ts
export interface ExamPaper extends ExamPaperSeed {} // no added fields
```

## Database Schema

Every `exam_*` table's key changes from `(course, paper_day, ...)` to
`(course, week, paper_number, ...)`. `due_date` is never stored — it's a
pure function of `week`, computed on read via `weekDueDate()`, so there's
nothing to keep in sync.

```sql
CREATE TABLE exam_papers (
  course TEXT NOT NULL,
  week INTEGER NOT NULL,
  paper_number INTEGER NOT NULL,
  submitted_at TEXT,
  score_correct INTEGER,
  score_total INTEGER,
  PRIMARY KEY (course, week, paper_number)
);
CREATE TABLE exam_answers (
  course TEXT NOT NULL,
  week INTEGER NOT NULL,
  paper_number INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  your_answer TEXT NOT NULL DEFAULT '',
  correct INTEGER,
  PRIMARY KEY (course, week, paper_number, question_index)
);
CREATE TABLE exam_review_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course TEXT NOT NULL,
  week INTEGER NOT NULL,
  paper_number INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  rung INTEGER NOT NULL DEFAULT -1,
  next_review TEXT NOT NULL,
  UNIQUE(course, week, paper_number, question_index)
);
CREATE TABLE exam_review_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course TEXT NOT NULL,
  week INTEGER NOT NULL,
  paper_number INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  reviewed_at TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
);
```

`exam_state` is **removed** — no replacement table, since there's no
watermark left to track. The per-question review ladder
(`exam-scheduling.ts`, 3 → 5 → 7 → 14 → 30 days for a wrong answer) is
completely unchanged in mechanism; only its key grows `week`/`paper_number`
in place of `paper_day`.

### Migrating existing data

The running `srs.db` has real (unsubmitted) progress: 3 `exam_papers` rows
(`paper_day` 1/2/3) and 24 `exam_answers` rows, all for INFO5995. Since
`paper_day` was assigned by array position and INFO5995 Week 1's 3 papers
already occupy positions 1/2/3 in that exact order, each old `paper_day`
maps directly to one real `(week, paperNumber)` pair — no question-index
remapping needed, just a key rename. The migration looks up each old
`paper_day`'s real `(week, paperNumber)` from `buildExamSchedule()` (not a
hardcoded guess) and copies rows across:

```sql
CREATE TABLE exam_papers_new (
  course TEXT NOT NULL, week INTEGER NOT NULL, paper_number INTEGER NOT NULL,
  submitted_at TEXT, score_correct INTEGER, score_total INTEGER,
  PRIMARY KEY (course, week, paper_number)
);
-- one INSERT per old paper_day row, using its looked-up (week, paperNumber)
DROP TABLE exam_papers;
ALTER TABLE exam_papers_new RENAME TO exam_papers;
-- ...same recreate-and-copy shape for exam_answers, exam_review_items, exam_review_log
DROP TABLE exam_state; -- no successor table
```

This is the third schema migration this table set has been through this
week (single-course → multi-course → weekly-pacing); each one follows the
same recreate-and-copy pattern (`PRAGMA table_info` legacy-shape sniff, run
once) established for exactly this reason. If a database is still in the
*pre-multi-course* shape (no `course` column at all), the multi-course
migration runs first, then this one — both checks are independent and
compose correctly since each only fires on its own specific legacy shape.

Given the real `srs.db`'s migration touches genuine user progress, this
migration must run inside an explicit transaction (`BEGIN`/`COMMIT` with
`ROLLBACK` on error) — the same safety fix already applied to the
multi-course migration's `migrateLegacySingleCourseShape` applies here too.

## API

Routes rename `:day` to a `:week`/`:paperNumber` pair throughout:

```
GET  /api/exam/courses
GET  /api/exam/:course/due
GET  /api/exam/:course/completed-today
POST /api/exam/:course/:week/:paperNumber/answer
POST /api/exam/:course/:week/:paperNumber/:questionIndex/grade
POST /api/exam/:course/:week/:paperNumber/submit
POST /api/exam/review/:course/:week/:paperNumber/:questionIndex
```

`GET /api/exam/:course/due` returns every incomplete week for that course
(not just the earliest), each with its own papers and their submitted
status, so the UI can render a picker per week:

```ts
interface ExamWeekView {
  week: number;
  dueDate: string;       // weekDueDate(week)
  overdue: boolean;      // today > dueDate
  papers: {
    paperNumber: number;
    title: string;
    submitted: boolean;
    scoreCorrect: number | null;
    scoreTotal: number | null;
  }[];
}
// GET /api/exam/:course/due response:
{ weeksDue: ExamWeekView[]; reviewDue: ExamReviewView[]; stats: {...} }
```

A week is included in `weeksDue` once its start date has passed and at least
one of its papers is unsubmitted; it drops off once every paper in it is
submitted.

## UI

`ExamApp.tsx`'s board section replaces the single "Today's paper" slot with
a list of every due/overdue week (mirroring how "Review due" already lists
multiple items) — each row shows the week, its due date, and a
submitted/total count. Opening a week reveals a picker (dropdown or button
list) over that week's papers, each labeled with its title and
submitted/not-submitted status; picking one opens the existing `PaperView`
flow unchanged internally (it already operates on one paper's questions —
only the identifying key changes from `paperDay` to `(week, paperNumber)`).

The rule-note text changes from "One new practice paper unlocks per day" to
something reflecting weekly pacing (e.g. "Each week's papers are due by
Sunday — missed questions come back for spaced review: 3 → 5 → 7 → 14 → 30
days").

## Home Aggregation

`examDue`/`examCompletedToday` (`home-api.ts`) now produce **one `DueItem`
per incomplete `(course, week)`**, not one per paper. `title` is
`"Week <n> (<submitted>/<total> submitted)"` (e.g. `"Week 1 (1/3
submitted)"`), `subtitle` is the course display name, `dueDate` is that
week's `weekDueDate()` — no new field on the shared `DueItem` interface.
This is what resolves the original complaint: once other courses have Week
1 content, the Home due list shows one row per course-week (up to 4 today),
not one row per paper.

## Testing

- `weekDueDate`/`weekStartDate` pure-function tests (Monday/Sunday
  boundaries, week 1 vs. week 2).
- Migration test using a real-shaped legacy fixture (course-shaped but
  paper_day-keyed), asserting rows land at the correct looked-up
  `(week, paperNumber)` and no answers are lost — mirroring the existing
  legacy-migration test's structure.
- Transaction-safety: confirm a simulated failure mid-migration leaves the
  original tables intact (same test shape the multi-course migration's
  final-review fix added).
- Home aggregation test proving multiple papers in one week collapse into a
  single `DueItem`, and that item disappears only once every paper in the
  week is submitted.
- Route tests updated for the new `:week`/`:paperNumber` URL shape.

## Out of Scope

- No changes to the per-question review ladder's mechanism (still
  3 → 5 → 7 → 14 → 30 days), only its key shape.
- No changes to the weekly-exam-generation-pipeline design (still blocked on
  the same dependencies as before; this redesign doesn't unblock or
  reshape it beyond whatever key-shape update it'll need to inherit).
- No content authored for any course/week as part of this plan.
- No cross-session persistence of which week/paper is currently expanded in
  the UI.
- No change to how a submitted paper's wrong answers create review items —
  same trigger, same ladder, just re-keyed.
