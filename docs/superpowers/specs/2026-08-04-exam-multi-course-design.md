# Exam Tab: Multi-Course Support — Design

**Status:** Approved 2026-08-04, ready for planning.

## Problem

The Exam tab was built for a single course (INFO5995 Intro to Cybersecurity):
one global sequential `paperDay` numbering, one backlog watermark, one due
board. Three more courses now need exam practice papers — COMP5348
(Enterprise Scale) and INFO6007 (Project Management) have real content to
generate from today; INFO5990 (Professional Practice in IT) has no
materials yet and will simply have zero papers until it does.

Each course needs its own independent pacing — a slow week in one course
shouldn't starve or flood another — which means the Exam tab's entire data
model needs a `course` dimension threaded through it, not just new content
appended to the existing single sequence.

This is a pure architecture change: no new content is authored as part of
this plan, and no new question/answer-format capability is added (that's
a separate, already-scoped plan). This plan's only job is making the
existing single-course machinery multi-course-aware, so content-authoring
and the answer-format feature both have a place to land afterward.

## Course Identity

```ts
export const COURSES: { code: string; name: string }[] = [
  { code: "INFO5995", name: "Intro to Cybersecurity" },
  { code: "COMP5348", name: "Enterprise Scale" },
  { code: "INFO6007", name: "Project Management" },
  { code: "INFO5990", name: "Professional Practice in IT" },
];
```

`ExamPaperSeed` (in `exam-content/types.ts`) gains a `course: string` field
(one of the codes above). Content files reorganize from the current flat
`exam-content/week-1.ts` into per-course subfolders:
`exam-content/info5995/week-1.ts`, and so on as other courses' content is
authored later. `exam-content.ts`'s `ALL_PAPERS` array is unchanged in
shape — it's still one flat array of every paper from every course — the
difference is purely that each paper now carries a `course` tag.

`COURSES` listing a course with zero papers (like INFO5990 today) is
fine — the "which courses actually have content" logic reads from
`buildExamSchedule()`'s content, not from this static list, so a
course only appears anywhere in the UI once it has at least one paper.

## `paperDay` Becomes Per-Course

Today, `buildExamSchedule()` assigns `paperDay: i + 1` across the single
flat `ALL_PAPERS` array — a global sequence. Going forward, `paperDay` is
1-based **within its own course**: the first paper ever authored for
COMP5348 is `paperDay: 1` for COMP5348, independent of INFO5995 already
being on `paperDay: 12`.

```ts
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
```

`TOTAL_PAPERS` (a single global number today) is replaced by a per-course
count, computed on demand — e.g. `buildExamSchedule().filter((p) => p.course === course).length`
— rather than a static export, since a fixed `TOTAL_PAPERS` constant
doesn't make sense once "total" is a per-course question.

## Database: Every Table Gains `course`

Every `exam_*` table's key grows a `course TEXT NOT NULL` column:

```sql
CREATE TABLE exam_papers (
  course TEXT NOT NULL,
  paper_day INTEGER NOT NULL,
  next_review TEXT NOT NULL,
  submitted_at TEXT,
  score_correct INTEGER,
  score_total INTEGER,
  PRIMARY KEY (course, paper_day)
);
CREATE TABLE exam_answers (
  course TEXT NOT NULL,
  paper_day INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  your_answer TEXT NOT NULL DEFAULT '',
  correct INTEGER,
  PRIMARY KEY (course, paper_day, question_index)
);
CREATE TABLE exam_review_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course TEXT NOT NULL,
  paper_day INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  rung INTEGER NOT NULL DEFAULT -1,
  next_review TEXT NOT NULL,
  UNIQUE(course, paper_day, question_index)
);
CREATE TABLE exam_review_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course TEXT NOT NULL,
  paper_day INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  reviewed_at TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
);
CREATE TABLE exam_state (
  course TEXT PRIMARY KEY,
  released_up_to INTEGER NOT NULL DEFAULT 0
);
```

`exam_state` changes from "exactly one row, ever" to "one row per course"
— each course paces its own backlog release independently, using the
exact same `releaseCount`/cap logic as today, just scoped by `course`.

### Migrating existing data (real, not hypothetical — the running app already has INFO5995 exam data)

`exam_papers`/`exam_answers`/`exam_review_items`/`exam_review_log` all
currently exist with the old (course-less) shape in any already-running
`srs.db`. SQLite's `ALTER TABLE` cannot change a table's primary key, so
this is a recreate-and-copy migration, detected the same way Theory's
migrations detect legacy shape (`PRAGMA table_info(...)`, checking for the
`course` column's absence) — run once, only when the old shape is found:

```sql
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
```

...and the equivalent recreate-and-copy for `exam_answers`,
`exam_review_items`, `exam_review_log`, and `exam_state`, in every case
backfilling `course = 'INFO5995'` — the only course that has ever existed
before this plan, so every pre-existing `paper_day` value is already
correctly "1-based within INFO5995" with no renumbering needed. This
migration must be covered by a test using a legacy-shaped fixture database,
matching the pattern `theory-db.test.ts`'s two "migrating a pre-existing
db" tests already establish.

## Every `exam-db.ts` Function Gains a Leading `course` Parameter

The pattern is uniform and mechanical across all ~15 functions in the
file: `listDueExamPapers(db, today)` becomes
`listDueExamPapers(db, course, today)`; `getExamPaperRow(db, paperDay)`
becomes `getExamPaperRow(db, course, paperDay)`; and so on for
`listExamAnswers`, `saveExamAnswer`, `gradeExamAnswer`, `submitExamPaper`,
`countOverdueExamPapers`, `countExamPapersSubmittedToday`,
`listExamPapersSubmittedToday`, `listDueExamReviewItems`,
`countOverdueExamReviewItems`, `countExamReviewsToday`,
`listExamReviewsCompletedToday`, `reviewExamItem`. Every SQL statement
gains `course = ?` alongside its existing `paper_day`/`question_index`
conditions. `migrateExam(db, today)` discovers the distinct set of course
codes present in `buildExamSchedule()`'s output and runs the seed-and-gate
sequence once per course, instead of once globally.

A new small helper, `listExamCourses(): { code: string; name: string }[]`,
derived by cross-referencing `COURSES` against which course codes actually
appear in `buildExamSchedule()`'s output — this is what the API/UI use to
know which courses currently have anything to show.

**This isn't only a SQL change.** `paperDay` is no longer globally unique,
so every in-memory content lookup via `buildExamSchedule().find(...)`
needs the same `course` filter a SQL `WHERE` clause would need — not just
the database queries. That means `submitExamPaper` (in `exam-db.ts`) and
`parsePaperDay`/`parseQuestionIndex`/`paperView`/`reviewView` (in
`exam-api.ts`) all need their `.find((p) => p.paperDay === paperDay)`
calls changed to `.find((p) => p.course === course && p.paperDay === paperDay)`
— easy to miss since it isn't SQL.

## API: Every Route Gains a `:course` Segment

```
GET  /api/exam/courses                              -> { code, name }[]
GET  /api/exam/:course/due
GET  /api/exam/:course/completed-today
POST /api/exam/:course/:day/answer
POST /api/exam/:course/:day/:questionIndex/grade
POST /api/exam/:course/:day/submit
POST /api/exam/review/:course/:day/:questionIndex
```

`:course` is validated against `listExamCourses()`'s output (400 if
unrecognized or has zero papers) before any day/question-index validation
runs — same defensive-validation-order convention already used throughout
this file (day → questionIndex → body).

## UI: Course Selector + Course-Labeled Home Items

`ExamApp.tsx` gains a course-selector row at the top of the board (visual
sibling to the app's top-level tab bar, one level down — a row of buttons
for each course `listExamCourses()` returns), defaulting to the first
course with any papers. Selecting a course reloads that course's due
board and review queue; the paper-attempt flow, grading, and review flow
are otherwise unchanged — every existing piece of `ExamApp.tsx` just
receives `course` as an additional piece of state threaded into its API
calls, the same shape as `paperDay` already is. No cross-session
persistence of the selected course in this plan — it always opens to the
first course; this can be revisited later if it proves annoying.

In `home-api.ts`, `examDue`/`examCompletedToday` loop over every course
from `listExamCourses()`, collecting due/completed items from each. Each
resulting `DueItem`'s `subtitle` becomes the course's display name (e.g.
`"Enterprise Scale"`) instead of the current generic `"Exam paper"`/
`"Exam review"`, so mixed-course items are distinguishable in the
"Everything due" list. The Exam variant of `DeepLink` (in `frontend.tsx`)
gains a `course` field alongside `paperDay`, so clicking a Home due-item
lands on the right course already selected.

## Testing

Every db function's existing test coverage gets a `course` parameter
threaded through identically to the source change — no new test
*scenarios* are required by this plan beyond: (a) the legacy-schema
migration test described above, and (b) at least one test proving two
different courses' backlog/numbering are genuinely independent (e.g.
submitting all of one course's due papers doesn't affect another course's
due count). Route tests and UI verification follow the same pattern shift.

## Cross-Reference: Exam Content Editing Plan

`docs/superpowers/specs/2026-08-04-content-edit-delete-design.md`'s
"Domain 3: Exam" section designs a not-yet-built `exam_question_content`
table keyed by `(paper_day, question_index)`. Whichever of these two plans
is implemented second must account for the other: if this multi-course
plan lands first, that table's key needs `course` folded in from the
start (`(course, paper_day, question_index)`), the same as every other
`exam_*` table here — it should not be designed or built against the
single-course shape. If the edit/delete plan somehow lands first instead,
its migration will need the exact same recreate-and-copy treatment this
plan already specifies for the other four tables.

## Out of Scope

- No new question types or answer formats (separate plan).
- No actual course content authored (separate plan; this plan produces
  the machinery, not the papers).
- No cross-session persistence of the selected course.
- No per-course customization of the backlog cap (`MAX_ACTIVE_BACKLOG`
  stays the same shared constant, just applied independently per course).
