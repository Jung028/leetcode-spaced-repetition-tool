# Daily Interview Practice (Coding + System Design) — Design

**Status:** Approved 2026-08-30, ready for planning.

## Overview

A new daily practice mode that pairs one coding question with one system
design question into a single mock-interview session, on top of the
existing LeetCode SRS review and Modules (exam) tracks. The coding half
reuses the existing LeetCode due-queue unchanged; the system design half
is new curated content (per-company questions with model answers and a
self-assessment rubric), answered with a written explanation plus an
embedded Excalidraw drawing canvas. Both parts get a 45-minute countdown
timer. A new top-level "Interview" tab hosts the daily session, and it
plugs into the existing Home dashboard (stats + "Everything due") the
same way LeetCode/Modules/Todo already do.

## Relationship to existing modules

- **LeetCode (`leetcode/`)**: untouched. The daily session's coding part
  is the single next-due item from the existing SRS queue (`next_review
  <= today`, same ordering `listProblems` already uses), shown via the
  existing problem view. Completing it via the existing review flow also
  satisfies the session's coding part — no parallel completion state, no
  double-counting.
- **Modules/exam (`exam/`)**: untouched. Pattern-matched for the new
  content structure (`interview-content/<company>.ts` mirrors
  `exam-content/<course>/week-N.ts`; `interview/content.ts` aggregates
  them like `exam/content.ts`'s `ALL_PAPERS`).
- **Home (`HomeApp.tsx`, `home-api.ts`)**: gains a 4th `DueItem` source,
  `"interview"`, alongside `exam`/`leetcode`/`todo`.

## Non-Goals

- No spaced-repetition scheduling for system design questions — each is
  one-time exposure, tracked by a simple "already assigned" set, not a
  second SM-2-style scheduler.
- No changes to LeetCode's own due-selection/scoring logic — the session
  only *reads* which item is next-due.
- No server-driven timer (no setInterval on the backend, no websocket
  ticks) — the timer is computed client-side from a stored start
  timestamp, so it survives refresh without any server-side clock state.
- No hard-locking of answers when a timer hits zero — v1 only notifies
  and keeps counting upward into overtime.
- No requirement that every day has a full pairing — a day with an empty
  LeetCode due-queue still gets a design-only session rather than
  blocking.
- No scoring/grading of system design answers anywhere else in the app
  (no effect on stats beyond "completed"/"not completed") — the rubric
  is a self-assessment record only.

## 1. Content & data model

### Curated content — `interview-content/<company-slug>.ts`

One file per company, same authoring spirit as `exam-content/`: real,
well-researched questions grounded in what's publicly documented about
that company's actual interview style (never fabricated proprietary
material). Starting set: ~20-30 companies — FAANG-style employers plus
known Sydney tech employers (e.g. Atlassian, Canva, REA Group, SEEK,
Afterpay/Block, Commonwealth Bank), 2-4 questions each.

```ts
// interview-content/types.ts
export interface SystemDesignQuestionSeed {
  prompt: string;
  modelAnswer: string;
  rubric: string[]; // e.g. ["Requirements clarification", "High-level architecture", "Data model", "Scaling & bottlenecks", "Trade-offs"]
}

export interface CompanySystemDesignSeed {
  company: string; // display name, e.g. "Meta"
  questions: SystemDesignQuestionSeed[];
}
```

```ts
// interview-content/meta.ts (example)
import type { CompanySystemDesignSeed } from "./types";

export const META: CompanySystemDesignSeed = {
  company: "Meta",
  questions: [
    {
      prompt: "Design a URL shortener that handles Meta-scale traffic...",
      modelAnswer: "...",
      rubric: ["Requirements clarification", "High-level architecture", "Data model", "Scaling & bottlenecks", "Trade-offs"],
    },
  ],
};
```

### Aggregation — `interview/content.ts`

```ts
export interface SystemDesignQuestion extends SystemDesignQuestionSeed {
  id: string; // `${company}:${index}` — stable identity for "already assigned" tracking
  company: string;
}

export function allSystemDesignQuestions(): SystemDesignQuestion[];
```

Same shape of file as `exam/content.ts`: import every `interview-content/*`
company file, flatten into one list with a stable `id`.

### DB schema — `interview/db.ts`

Two tables, created via the same migration pattern `exam/db.ts` and
`leetcode/db.ts` already use (`CREATE TABLE IF NOT EXISTS` on
`openDb`/`migrateInterview`):

```sql
CREATE TABLE IF NOT EXISTS interview_sessions (
  date TEXT PRIMARY KEY,              -- YYYY-MM-DD, one row per day
  leetcode_problem_id INTEGER,        -- nullable: null if queue was empty that day
  sd_question_id TEXT NOT NULL,       -- references a SystemDesignQuestion.id
  coding_started_at TEXT,             -- set on first open of Part 1; timer basis
  design_started_at TEXT,             -- set on first open of Part 2; timer basis
  sd_answer TEXT,                     -- your written reasoning
  sd_excalidraw_scene TEXT,           -- JSON: Excalidraw elements + minimal appState
  sd_rubric_checked TEXT,             -- JSON array of booleans, indices matching the question's rubric
  sd_revealed_at TEXT,                -- when the model answer was revealed
  completed_at TEXT                   -- set once both parts are done
);

CREATE TABLE IF NOT EXISTS interview_sd_seen (
  question_id TEXT PRIMARY KEY        -- every sd_question_id ever assigned, across all days
);
```

`interview_sd_seen` is the "already assigned" set referenced in Non-Goals
— a new day's session picks the first `allSystemDesignQuestions()` entry
whose `id` isn't in this table yet (stable content order, not random),
and inserts it here at assignment time.

## 2. Daily session mechanics

`getOrCreateTodaySession(db, today)` in `interview/db.ts`:

1. If `interview_sessions` already has a row for `today`, return it as-is
   (never re-roll).
2. Otherwise: get the single next-due item from `listProblems(db)`
   filtered by the existing `isDue(next_review, today)` helper
   (`shared/scheduling.ts`, same predicate `leetcodeDue` already uses in
   `home-api.ts`), sorted the same way `listProblems` already orders them
   (`next_review, id`), taking just the first — read-only, no changes to
   the `problems` table. `null` if nothing is due. Pick the next unseen
   system design question
   from `allSystemDesignQuestions()` via `interview_sd_seen`. Insert a new
   `interview_sessions` row, insert the question id into
   `interview_sd_seen`.

Session completion: `completed_at` is set once (a) the paired LeetCode
problem's `next_review` has moved past today (i.e. it was reviewed — read
via the existing `problems` table, no new completion flag needed) and (b)
`sd_answer` is non-empty and `sd_revealed_at` is set. Checked on every
`GET` of today's session, not via a separate write path.

### Timer

Each part's elapsed time is computed client-side as `now -
coding_started_at` / `now - design_started_at` (set server-side, once,
the first time that part's view is opened — `UPDATE interview_sessions
SET coding_started_at = ? WHERE date = ? AND coding_started_at IS NULL`).
45:00 countdown per part; past zero, the display keeps counting up as
overtime (`+MM:SS`) with a one-time visual/sound alert at zero. No lock —
the editor/canvas stays usable indefinitely.

## 3. Frontend — `interview/App.tsx`

New module following the existing `exam/`/`todo/` file layout
(`App.tsx`, `api.ts` client, mounted from `frontend.tsx` as a new
top-level tab, "Interview", next to Home/LeetCode/Todo/Modules).

- **Session header**: today's date, which part is active, that part's
  countdown/overtime display.
- **Part 1 (coding)**: embeds the existing LeetCode problem-detail view
  for `leetcode_problem_id` unchanged (same component, entered from a
  different tab). If `leetcode_problem_id` is `null` (empty queue that
  day), this part is skipped and the session opens straight into Part 2.
- **Part 2 (system design)**: prompt text (via the same `PromptText`
  code-aware renderer added to `exam/App.tsx`, reused here since design
  prompts may also reference code/data shapes), a textarea for written
  reasoning, and an embedded `@excalidraw/excalidraw` canvas below it.
  Autosaves both (debounced, not on every keystroke/stroke) to
  `sd_answer` / `sd_excalidraw_scene`.
- **Reveal**: a "Reveal model answer" button (disabled until you've
  written something, matching the existing short/scenario question
  pattern in `exam/App.tsx`) shows the model answer plus the rubric as
  tickable checkboxes, persisted to `sd_rubric_checked`.

### Excalidraw integration — spike first

`@excalidraw/excalidraw` is a client-only React component (needs
`window`/canvas access, ships its own CSS) that hasn't been used in this
project's Bun-bundled HTML-import setup before. **The first implementation
task is a minimal spike**: render an empty Excalidraw canvas on a scratch
page via a normal HTML import, confirm Bun's bundler resolves the package
and its CSS cleanly, confirm `onChange`'s scene data round-trips through
`JSON.stringify`/`JSON.parse` into a DB column and back into
`initialData` on reload. Only once that's confirmed does Part 2's full UI
get built around it — if it turns out not to bundle cleanly, that's
discovered as a small, isolated failure instead of after the whole
session flow is built on top of it.

## 4. Home dashboard integration

`home-api.ts` gains `interviewDue(db, today): DueItem[]`, following the
exact shape of `examDue`/`todoDue`:

```ts
function interviewDue(db: Database, today: string): DueItem[] {
  const session = getOrCreateTodaySession(db, today); // or a read-only getTodaySession if it already exists
  if (!session || session.completed_at) return [];
  const question = allSystemDesignQuestions().find((q) => q.id === session.sd_question_id)!;
  const problem = session.leetcode_problem_id ? getProblem(db, session.leetcode_problem_id) : null;
  return [{
    source: "interview" as const,
    // Fixed constant, not courseOffset (that helper is keyed to COURSES,
    // which "interview" isn't part of) — safe because at most one
    // interview item is ever due at a time, so no collision is possible.
    id: 900_000_000,
    title: problem ? `${problem.title} + ${question.company}: ${question.prompt.slice(0, 40)}...` : `${question.company}: ${question.prompt.slice(0, 40)}...`,
    subtitle: "Daily interview practice",
    dueDate: today,
    overdueDays: 0, // sessions don't carry over as "late" the way weekly papers do — each day is its own session
    linkId: 0,
  }];
}
```

Contributes to the existing "Due today" stat card (today's session, if
incomplete) and the "Everything due" list, clicking through to the new
Interview tab. `overdueDays` is always 0 by design — yesterday's
unfinished session isn't "late," it's just skipped; a new session starts
fresh each day, keeping this consistent with the one-row-per-day schema
(no backlog of past incomplete sessions to surface as overdue).

## Testing

- `interview/content.test.ts`: every company has at least one question;
  every question has a non-empty prompt, modelAnswer, and non-empty
  rubric; every question id is unique.
- `interview/db.test.ts`: `getOrCreateTodaySession` creates exactly one
  row per day and never re-rolls on a second call; picks the correct
  next-due LeetCode item; picks a system design question not already in
  `interview_sd_seen`; marks `completed_at` once both parts are satisfied
  and not before.
- `home-api.test.ts`: `GET /api/home/due` includes today's interview
  session when incomplete, excludes it once completed.
- Excalidraw spike: a manual verification step (render, draw, reload,
  confirm the scene persists) — not itself a `bun test` assertion, since
  it's validating third-party bundling behavior, not application logic.
- No automated UI test for the full session flow (matches this repo's
  existing pattern of manual browser verification for UI-heavy views,
  per `2026-08-06-exam-modules-sync-design.md`).

## Continuous testing requirement

Per this repo's `CLAUDE.md` ("Spec requirement: continuous testing"),
every SPEC.md must require:

- **Automated Hooks**: a hook fires every time the AI saves a change
  (PostToolUse on Write/Edit).
- **Continuous Testing**: that hook triggers the build step, the test
  suite (`bun test`), and the type checker (`tsc`).
- **Autonomous Correction**: if a test fails, the AI sees the failure
  output immediately and attempts to fix its own mistake before the user
  has to intervene, so the user always returns to a green (passing)
  state.

This repo still has no such hook configured (no `.git/hooks/pre-commit`,
no CI) — this remains an outstanding, unaddressed requirement, not
something this feature's plan is expected to newly satisfy on its own.

## Scope for the implementation plan

The plan built from this spec covers the infrastructure — schema, session
mechanics, the Excalidraw spike, the Interview tab, Home integration, and
tests — seeded with a small handful of companies (enough to exercise every
code path realistically, e.g. 2-3 companies with 2 questions each), not
the full ~20-30 company roster. Authoring the rest of the curated content
is a separate, follow-on task after the plumbing is verified working,
mirroring how `exam-content/` weeks get authored incrementally against an
already-built pipeline rather than all at once up front.

## Out of Scope

- A real interview-loop feel beyond timing and pairing (no video/audio,
  no interviewer simulation, no live chat).
- Expanding past ~20-30 companies — more get added over time the same
  way exam weeks get authored incrementally, not as part of this plan.
- Spaced-repetition/resurfacing of system design questions after
  first exposure (see Non-Goals).
- A configurable timer duration (45/45 is fixed for v1; revisit if it
  feels wrong in practice).
- Any change to how LeetCode's own SRS scheduling picks or orders due
  items.
