# Exam Marks-Based Scoring & Rubric Breakdown — Design

**Status:** Approved 2026-08-04, ready for planning.

## Problem

Exam questions today grade as a strict binary: `correct: boolean`. A
paper's score is a question count ("4 of 5 correct"). Real exams don't
work this way — short-answer and scenario questions earn partial credit
against specific marking criteria, and a paper's score is a sum of marks,
not a count of fully-correct questions. There's also no structured
breakdown of *how* a question's marks are earned — `modelAnswer` explains
the answer, but nothing explains the grading criteria.

This spec adds real marks-based scoring: every question carries a
marking rubric (a list of criteria, each worth some marks), MCQ/truefalse
still grade themselves automatically, and short/scenario/drawing/
calculation questions are self-graded by entering a marks value (not a
correct/wrong toggle) after reviewing the rubric.

## Content Schema

`ExamQuestionSeed` (in `exam-content/types.ts`) gains:

```ts
export interface RubricPoint {
  criterion: string;
  marks: number;
}

export interface ExamQuestionSeed {
  type: ExamQuestionType;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  modelAnswer: string;
  markingRubric: RubricPoint[]; // replaces nothing — this is new
}
```

A question's total marks is **derived**, never separately stored:

```ts
export function totalMarks(question: ExamQuestionSeed): number {
  return question.markingRubric.reduce((sum, point) => sum + point.marks, 0);
}
```

This applies uniformly to every question type — mcq/truefalse questions
just have a single-item rubric, e.g.:

```ts
markingRubric: [{ criterion: "Correct option selected", marks: 2 }]
```

— one scoring model for every question type, rather than a separate path
for objectively- vs. subjectively-graded questions. `markingRubric` is
required on every question (existing content, including INFO5995 Week 1,
needs it backfilled as part of implementing this — not left optional).

## Database

`exam_answers.correct INTEGER` (currently `0 | 1 | NULL`) is replaced by:

```sql
marks_awarded INTEGER -- NULL until graded, 0..totalMarks(question) once set
```

Every other column on `exam_answers` (`paper_day`, `question_index`,
`your_answer`) is unchanged. This is a breaking schema change to a table
that already has real data in it (the running app's `srs.db` has actual
`exam_answers` rows with `correct` values) — the implementation needs a
migration, following this codebase's established recreate-and-copy
pattern for primary-key/column-shape changes (see
`docs/superpowers/specs/2026-08-04-exam-multi-course-design.md`'s
migration section for the precedent): add the new column, backfill
`marks_awarded` from the old `correct` column using each question's
`totalMarks()` (`correct = 1` → full marks, `correct = 0` → `0`, `NULL` →
`NULL`), then drop `correct`.

## API

The grade route's payload changes from `{ correct: boolean }` to
`{ marksAwarded: number }`. The server validates
`0 <= marksAwarded <= totalMarks(question)` for that specific question
and rejects out-of-range values with 400 — this is the one new piece of
server-side validation this spec adds; everything else about the route
(day/questionIndex validation, the optional `yourAnswer` companion field
for mcq) is unchanged in shape.

For mcq/truefalse: the client still computes correctness itself
(`i === question.correctIndex`) and sends the resulting marks (`totalMarks(question)`
if correct, `0` if not) — the server still just trusts and persists
whatever verdict it's given, exactly the existing "server trusts the
client" principle, just carrying a number instead of a boolean now.

`submitExamPaper`'s completeness check changes from "does every question
have a non-null `correct`" to "does every question have a non-null
`marks_awarded`." Its result changes from `{ scoreCorrect, scoreTotal }`
(a question count) to:

```ts
{ scoreMarksAchieved: number; scoreMarksTotal: number } // sums across all questions
```

This **replaces** the question-count score entirely — there is no
parallel "X of Y questions fully correct" stat maintained alongside it.

## Review Ladder Threshold

A question enters the missed-question review ladder
(`exam_review_items`) whenever `marks_awarded < totalMarks(question)` —
**any** shortfall, not just a zero score. Partial credit still means the
concept wasn't fully mastered, so it comes back for spaced review the
same as a fully-wrong answer would. This changes `submitExamPaper`'s
existing "which answers create a review item" condition from
`correct === 0` to `marksAwarded < totalMarks(question)`.

## UI

**MCQ/truefalse** (`McqQuestion` in `ExamApp.tsx`): mechanically
unchanged — grading still happens instantly on selection — but the
post-grade display shows `"${marksAwarded}/${totalMarks} marks"` instead
of just correct/wrong color-coding.

**Short/scenario/drawing/calculation** (`ShortOrScenarioQuestion`):
the existing "Correct"/"Wrong" buttons are removed. After the model
answer is revealed, the marking rubric renders as a list (each criterion
with its marks value) so the student can self-assess against the actual
criteria, followed by a numeric input: `"Marks awarded: [__] / {totalMarks}"`,
client-side validated to stay in range before it's submitted via the
`/grade` route's new `marksAwarded` payload.

**Paper submission summary**: once every question is graded and the
paper is submitted, the result shows total marks achieved out of total
possible (e.g. `"37/50 marks"`) and a per-question breakdown row
(question N: awarded/max), replacing the current bare "scoreCorrect/scoreTotal"
question-count summary.

## Testing

Every changed function (`gradeExamAnswer`, `submitExamPaper`,
`reviewExamItem`'s trigger condition) gets its existing test coverage
updated to the new marks-based shape, plus new tests for: the 400 on an
out-of-range `marksAwarded`, the review-ladder threshold (a question that
earns partial-but-not-zero marks still creates a review item), and the
migration test (legacy `correct`-shaped fixture → correctly backfilled
`marks_awarded`).

## Out of Scope

- No weighting/curving of scores beyond a straight sum of marks.
- No per-paper pass/fail threshold or grade boundary (e.g. no "you scored
  a Credit") — just the raw marks total.
- No historical marks-trend reporting (e.g. "your average score is
  rising") — that's a possible future Home-tab/stats addition, not this
  plan.
