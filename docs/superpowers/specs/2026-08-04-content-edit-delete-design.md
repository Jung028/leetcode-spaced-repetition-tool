# Edit & Delete for Theory, Goals, and Exam Content — Design

**Status:** Approved 2026-08-04, ready for planning.

## Problem

Three tabs let you create content but never fix or remove it once it
exists:

- **Theory** — you can fill in a blank concept's question/answer via "+ Add
  theory", but there's no way to reopen an already-filled concept and edit
  it, and no way to remove one.
- **Goals** — you can create a project and add steps, but there's no way to
  rename a project, push back its deadline, fix a step's label/weight/due
  date, or delete either a project or a step. Only `link` (project) and
  `done` (step, via toggle) are mutable today.
- **Exam** — content is static TypeScript (`exam-content/week-N.ts`), so
  there is no live edit/delete surface at all; fixing a typo or a wrong
  `correctIndex` means hand-editing the source file and restarting the
  server.

Separately: Paper 1's multiple-choice options currently render as plain
unlabelled text with no question numbering, which doesn't read like an
exam paper.

This app's user is both the content author and the student — edit/delete
is a personal correction/curation tool, not a multi-user authoring
workflow.

## Shared Principles

Two delete semantics apply consistently across all three domains, chosen
by whether content sits at a **fixed schedule slot** or is a **freestanding
row**:

- **Fixed schedule slot** (a Theory concept's `concept_day`, an Exam
  question's `(paper_day, question_index)`) — delete means **clear to
  blank in place**. The slot's number never moves and nothing renumbers.
  A cleared slot vanishes from due/required lists exactly the way a
  never-filled slot already does (Theory already filters this way; Exam
  gains the identical filter). If content is added back to that slot
  later, whatever scheduling progress it already had (rung, next_review)
  resumes as-is — it isn't reset to a fresh state.
- **Freestanding row** (a Goals project or step) — delete means **actually
  remove the row**. Projects cascade-delete their steps via the existing
  foreign key.

Editing, in every domain, always allows overwriting existing content — no
"only if blank" restriction (Theory's `PUT .../content` already works this
way; the same rule extends to Goals and Exam).

## Implementation Split

Theory, Goals, and Exam are independent subsystems with no dependencies on
each other. This spec covers all three because the design principles are
shared, but implementation ships as **three separate plans, three separate
branches, three separate PRs** — each independently buildable, testable,
and reviewable, in whatever order is convenient. Nothing here requires
them to land together or in a specific sequence.

---

## Domain 1: Theory

### API — `theory-api.ts` / `theory-db.ts`

New route:

```
DELETE /api/theory/:day/content -> TheoryProgress
```

Resets `question`, `answer`, and `answer_format` to their blank defaults
(`''`, `''`, `'text'`). Does **not** touch `rung`, `next_review`, or
`your_answer` — clearing content is a curriculum action, not a scheduling
reset.

No changes needed to `listDueTheory`/`countOverdueTheory`'s existing
`question != ''` filter — a cleared concept is already indistinguishable
from a never-filled one to those queries.

### UI — `TheoryApp.tsx`

`TheoryDetail` gains an **Edit** button that opens the existing
`AddTheoryContentForm`, pre-filled with the concept's current
question/answer/format, calling the existing `PUT .../content` route
(already supports overwrite). A **Delete** button, with a `confirm()`
prompt matching the LeetCode tab's existing delete convention, calls the
new `DELETE` route and returns to the board.

---

## Domain 2: Goals

### API — `goals-api.ts` / `goals-db.ts`

New/extended routes:

```
PUT    /api/goals/:id             -> extend existing route: accept title/deadline in addition to link
DELETE /api/goals/:id             -> delete project (steps cascade via existing ON DELETE CASCADE FK)
PUT    /api/goals/steps/:stepId   -> edit label/weight/due_date
DELETE /api/goals/steps/:stepId   -> delete step
```

**Release-watermark adjustment on step deletion:** `projects.steps_released`
is a count of "how many steps from the front of the list are unlocked,"
positionally derived from `project_steps` ordered by `id`. Deleting a step
shrinks that ordered list, so the watermark must be adjusted to stay
meaningful:

- If the deleted step's position (by `id` order) was `< steps_released`,
  decrement `steps_released` by 1 after deletion — one fewer released slot
  now that a released step is gone.
- If its position was `>= steps_released` (not yet released), leave
  `steps_released` unchanged.

Run `runGoalsReleaseGate` afterward as usual (existing function, no
changes needed) so any newly-opened slot gets its `due_date` stamped.

**Editing a project's deadline** does not retroactively recompute any
step's `due_date` — deadline is informational/display-only relative to the
step release schedule, which is driven purely by day-after-day release
timing, not by the project's deadline field.

**Editing a step's weight** requires no special handling — `projectProgress`
already recomputes from live `weight`/`done` values on every read, so a
weight change is reflected immediately, including the auto-archive-at-100%
behavior `toggleStep` already runs.

### UI — `GoalsApp.tsx`

`ProjectDetailView` gains: an edit control on the project header (title,
deadline — link keeps its existing edit path), and per-step edit controls
(label, weight, due date). Delete buttons on the project and on each step,
each behind a `confirm()` prompt, matching LeetCode's convention.

---

## Domain 3: Exam

This is the largest piece: exam content currently lives in static files,
not the database, so making it editable requires the same kind of
migration Theory already went through (`docs/superpowers/specs/2026-08-03-theory-content-database-design.md`
is the direct precedent — same shape, applied to a per-question grain
instead of per-day).

### Schema — new table

```sql
CREATE TABLE exam_question_content (
  paper_day INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  options TEXT,               -- JSON-encoded string[], NULL for short/scenario
  correct_index INTEGER,      -- NULL for short/scenario
  model_answer TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (paper_day, question_index)
);
```

Seeded once, on migration, from `buildExamSchedule()`'s current content —
exactly mirroring how `theory_schedule` was seeded from
`buildTheorySchedule()`. `exam-content.ts` and the per-week `.ts` files
keep their existing job: they remain how a **brand-new week's** content
gets authored (via `scripts/generate-exam-week.ts`'s scaffold + hand-filling,
same workflow as today) and are the seed source the first time a paper is
migrated into the table. Once seeded, `exam_question_content` is the
source of truth for display and edit — nothing at runtime reads a
question's `prompt`/`options`/`correctIndex`/`modelAnswer` from the static
file again after that.

New weeks added later (e.g. `week-2.ts`) get seeded the same way Theory
handles newly-added content: the migration's seed step runs for any
`(paper_day, question_index)` not yet present in the table, so growing
`TOTAL_PAPERS` over the semester continues to work exactly as it does
today for paper-level scheduling — this just adds a second, per-question
seed step alongside the existing per-paper one in `exam-db.ts`'s
migration.

### API — `exam-api.ts` / `exam-db.ts`

```
PUT    /api/exam/:day/:questionIndex/content -> edit type/prompt/options/correctIndex/modelAnswer
DELETE /api/exam/:day/:questionIndex/content -> clear to blank in place
```

`paperView` and `reviewView` (in `exam-api.ts`) switch from reading
`buildExamSchedule()` directly to reading `exam_question_content`, joined
with the existing per-answer state (`exam_answers`).

Editing `type` is allowed, but the payload must stay internally
consistent with the new type: `mcq`/`truefalse` require `options` and
`correctIndex`; `short`/`scenario` require neither (reject or ignore
them if present) — the same shape-validation Theory already applies to
`answerFormat`.

**Blank-question filtering:** a cleared question (`prompt = ''`) is
excluded from `paperView`'s question list, and does not count toward
`submitExamPaper`'s "every question graded" requirement — the same
`!= ''` filter Theory already applies, scoped to one paper's questions
instead of the whole day-schedule.

**Cleanup on delete:** clearing a question's content also deletes any
`exam_review_items` row for that `(paper_day, question_index)` — otherwise
a cleared question that had already been marked wrong on a prior attempt
would keep resurfacing under "Review due" with a blank prompt forever,
since `reviewView` reads the same now-blank content. Any already-recorded
`exam_answers` row for that question is left alone (harmless: it simply
won't be shown, since `paperView` no longer lists the question).

### UI — `ExamApp.tsx`

Each question in `PaperView` gains Edit (opens a form pre-filled with the
question's current content, calling the new `PUT` route) and Delete (with
`confirm()`, calling the new `DELETE` route) controls.

---

## Exam Paper Visual Formatting

Presentational only, no API/schema involvement:

- Sequential question numbering ("Q1", "Q2", ...) counting across the
  whole paper regardless of question type, rendered in both `PaperView`
  and `ReviewDetail`.
- Lettered options ("A.", "B.", "C.", "D.") prefixed on each mcq/truefalse
  option, in both views.

## Testing

Each new/changed database function gets `bun:sqlite` in-memory tests in
its existing file (`theory-db.test.ts`, `goals-db.test.ts`,
`exam-db.test.ts` — all three already exist and follow the same pattern).
Each new/changed route gets HTTP-level tests via
`Bun.serve({ port: 0, routes: ... })`, matching `theory-api.test.ts`'s
existing pattern. No automated frontend tests — consistent with every
other tab's established convention in this codebase.

## Out of Scope

- No "add new exam paper/question via the UI." New content is still
  authored via the scaffold-generator + hand-editing workflow, then seeded
  into the database by the migration — edit/delete only ever act on
  already-seeded content.
- No renumbering of Theory `concept_day` slots or Exam `question_index`
  positions on delete, ever.
- No retroactive recomputation of Goals step due dates when a project's
  deadline is edited.
- No bulk edit/delete (e.g. "delete all blank concepts") in any domain.
