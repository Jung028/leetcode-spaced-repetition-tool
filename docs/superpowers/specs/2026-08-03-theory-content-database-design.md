# Theory Content Goes Database-Backed — Design

**Status:** Approved 2026-08-03, ready for planning.

## Problem

All 150 Theory concepts' `question`/`answer` text lives in a static file
(`theory-content.ts`), read at render time via `buildTheorySchedule()` and
indexed by `concept_day`. That text was just blanked out to `""` across the
board (a prior change) so the user can author their own content — but two
things broke as a result:

1. The due/overdue boards (Theory tab and Home tab alike) now render rows
   with an empty title and just a category tag — a list of nothing.
2. There's no way to actually add content from the running app. The static
   file can only be edited by hand outside the app.

## Fix

### Schema

`theory_schedule` gains three columns, seeded once (fresh installs and the
upgrade migration for existing `srs.db` files alike) from
`buildTheorySchedule()`'s day→category structure:

```sql
ALTER TABLE theory_schedule ADD COLUMN category TEXT NOT NULL DEFAULT '';
ALTER TABLE theory_schedule ADD COLUMN question TEXT NOT NULL DEFAULT '';
ALTER TABLE theory_schedule ADD COLUMN answer TEXT NOT NULL DEFAULT '';
```

`category` gets a real value at seed time (from the static schedule's
day→category assignment) and never needs to change again. `question`/
`answer` start blank and are edited via the new API below. From this point
on, the database is the single source of truth for a concept's content —
`theory-content.ts` keeps its existing job of defining the 150 day/category
slots and interleaving them, but nothing at runtime reads its `question`/
`answer` fields anymore.

### Hiding blank concepts — without breaking the backlog gate

`listDueTheory` and `countOverdueTheory` (the display-facing queries) add
`AND question != ''` to their existing `WHERE` clause, so blank slots never
appear in a due/overdue list — Theory tab or Home tab, since Home's
aggregation reads through the same `listDueTheory`.

This must **not** apply to `runTheoryReleaseGate`'s own backlog count (it
already runs a separate, independent SQL query, not `listDueTheory`). If
gating also ignored blank concepts, it would see an artificially-empty
backlog every time and release all 150 slots at once — the exact pileup
problem the backlog-gating feature exists to prevent. The blank-content
filter is display-only; gating keeps counting released-but-unfilled slots
as backlog exactly as before.

### New API — `theory-api.ts`

```
GET /api/theory/next-blank -> { conceptDay: number; category: string } | null
PUT /api/theory/:day/content -> body { question: string; answer: string } -> TheoryProgress
```

`next-blank` finds the lowest-numbered slot with `question = ''`
(`SELECT concept_day, category FROM theory_schedule WHERE question = '' ORDER BY concept_day LIMIT 1`),
returning `null` once all 150 are filled. `PUT .../content` validates both
fields are non-empty (trimmed) and always allowed to overwrite — no
restriction to "only if currently blank," so existing content can be edited
later too.

### New UI — `TheoryApp.tsx`

A "+ Add theory" button, placed next to the Due board's header (same
pattern as Goals' "+ Add step"). Clicking it calls `GET
/api/theory/next-blank`:

- If `null`: show "All 150 concepts have content." and don't open a form.
- Otherwise: open a small inline form showing the slot's category
  (read-only) and two textareas (question, answer). Saving calls `PUT
  /api/theory/:day/content` and refreshes the due board — if that slot
  happens to already be released and due, it now shows up normally.

This is a separate, dedicated form — not a reuse of `TheoryDetail` (the
review view). A blank slot is never reachable through the normal due-list
click path once hidden, so there's no need to special-case blank content
inside the review flow itself.

### Cleanup this enables

`TheoryApp.tsx`, `home-api.ts`, and `theory-db.ts`'s `TheoryProgress`
consumers currently all import `buildTheorySchedule()` and index into it
(`SCHEDULE[entry.concept_day - 1]`) purely to resolve category/question/
answer for display. Once every `TheoryProgress` returned by the API already
carries `category`, `question`, and `answer` as real columns, all of that
lookup code and the `buildTheorySchedule`/`SCHEDULE` module-level constant
disappear from `TheoryApp.tsx` and `home-api.ts` — a direct simplification
the schema change enables, not a separate unrelated refactor:

- `TheoryProgress` interface (`theory-db.ts`) gains `category: string`,
  `question: string`, `answer: string`.
- `home-api.ts`'s `theoryDue`/`theoryCompletedToday` stop importing
  `buildTheorySchedule`/`SCHEDULE` and stop filtering on `SCHEDULE[entry.concept_day - 1]`
  — they read `entry.category`/`entry.question` directly.
- `TheoryApp.tsx`'s `TheoryListModal`, `TheoryDueBoard`, and `TheoryDetail`
  all stop indexing into `SCHEDULE` and read `entry.category`/
  `entry.question`/`entry.answer` directly from the `TheoryProgress` objects
  already in hand. The module-level `const SCHEDULE = buildTheorySchedule();`
  is removed; only `buildTheorySchedule` itself (for seeding) and the
  `Category` type import remain needed elsewhere.

## Testing

- `theory-db.test.ts`: migration backfill sets `category` correctly from the
  static schedule for existing rows; fresh seed sets `category` and leaves
  `question`/`answer` blank; `saveTheoryContent` updates and returns the row;
  `getNextBlankConcept` returns the lowest blank `concept_day`/`category`,
  or `null` when none remain; `listDueTheory`/`countOverdueTheory` exclude
  blank-content concepts; a released-but-blank concept still counts toward
  `runTheoryReleaseGate`'s backlog (i.e. the gate doesn't over-release just
  because content is missing).
- `theory-api.test.ts`: `GET /api/theory/next-blank` returns the right slot
  and `null` once all are filled; `PUT /api/theory/:day/content` saves and
  returns the updated concept, rejects blank question/answer with 400,
  rejects an out-of-range day with 400 (same range check as the existing
  routes).
- `home-api.test.ts`: due/completed-today items surface `category`/`question`
  directly from the DB row, not a `SCHEDULE` lookup; a blank-content concept
  is excluded from `/api/home/due` and `/api/home/stats`' `dueToday`/
  `overdue` counts.
- No frontend test harness exists for `TheoryApp.tsx` (consistent with the
  rest of the app) — the "+ Add theory" form is verified manually.

## Out of scope

- The Goals "finish button" request — a separate, independent feature to be
  brainstormed on its own.
- Any UI for editing already-filled content from the due board (the PUT
  endpoint supports it, but no "edit" affordance is being added to
  `TheoryDetail` in this change — only the dedicated "+ Add theory" flow for
  blank slots).
- Extending the curriculum beyond 150 days (explicitly decided against in
  favor of filling in the existing fixed slots).
