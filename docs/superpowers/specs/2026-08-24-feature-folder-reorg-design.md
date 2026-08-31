# Feature-folder reorganization

## Problem

`leetcode-srs` has grown to ~50 TypeScript/TSX files flat in the repo
root. Most already follow a `<feature>-db.ts` / `<feature>-api.ts` /
`<Feature>App.tsx` / `*.test.ts` naming convention (`todo-*`, `exam-*`,
`leetcode150-*`, `home-*`, `announcement-*`), which is really a
poor-man's namespace — the prefix exists only because the files can't
be grouped into directories. This makes the root hard to scan and
means editors/IDEs show no structure for a project that actually has
six distinct features (LeetCode review board, Top-150 tracker, Todo,
Exam/Modules, Announcements, Home) plus shared infrastructure.

## Goal

Move each feature's source and test files into its own directory,
dropping the now-redundant filename prefix. Zero behavior change,
except one pure code-motion extraction (see "frontend.tsx split"
below) needed for consistency. No logic changes, no renamed exports,
no new abstractions.

## Scope (verified via grep against the actual import graph)

### `leetcode/` — the original review-board feature
- `db.ts` (was `db.ts`), `db.test.ts`
- `api.ts` (was `api.ts`), `api.test.ts`
- `leetcode.ts` (slug parsing), `leetcode.test.ts`
- `highlight.ts`, `highlight.test.ts`
- `App.tsx` — **new file**, extracted from `frontend.tsx`: `LeetCodeApp`,
  `Stats`, `DueBoard`, `ProblemForm`, `Detail`, `RungMeter`,
  `NextProblemBanner`, `TrackedListModal`, the `api` object, and the
  local helpers `urgency`/`daysBetween`/`openExternal` that only those
  components use. `LADDER`, `isDue`, `localToday` come from
  `shared/scheduling`; `ProblemSummary`/`ProblemDetail` types from
  `./db`; `highlightCode` from `./highlight`.

### `leetcode150/`
- `db.ts` (was `leetcode150-db.ts`), `db.test.ts`
- `api.ts` (was `leetcode150-api.ts`), `api.test.ts`
- `content.ts` (was `leetcode150-content.ts`), `content.test.ts`
- Imports `../leetcode/db` (`listProblems`, `listCompletedToday`) and
  `../leetcode/leetcode` (`slugFromUrl`) — legitimate, leetcode150 is
  a layer on top of the core problem model.

### `todo/`
- `db.ts` (was `todo-db.ts`), `db.test.ts`
- `api.ts` (was `todo-api.ts`), `api.test.ts`
- `App.tsx` (was `TodoApp.tsx`)

### `exam/`
- `db.ts` (was `exam-db.ts`), `db.test.ts`
- `api.ts` (was `exam-api.ts`), `api.test.ts`
- `content.ts` (was `exam-content.ts`), `content.test.ts`
- `generate.ts` (was `exam-generate.ts`), `generate.test.ts`,
  `generate-api.test.ts` (was `exam-generate-api.test.ts`)
- `sync.ts` (was `exam-sync.ts`), `sync.test.ts`
- `App.tsx` (was `ExamApp.tsx`)
- `MermaidDiagram.tsx` (only consumer is `ExamApp.tsx`)
- **`exam-content/` data directory (29 seed files) stays exactly where
  it is at repo root, unmoved.** It's actively authored per
  `CLAUDE.md`'s "Active exam prep priorities" section, which cites
  paths like `exam-content/info5990/week-1.ts` directly — moving it
  would require rewriting that documentation and risks the
  in-progress authoring workflow for no benefit (it's already a
  well-organized directory on its own). Only `exam/content.ts`'s ~18
  import lines shift from `./exam-content/...` to `../exam-content/...`
  (one more `../`, since `content.ts` itself moves one level deeper).
  Same one-level shift applies to `scripts/find-week-updates.ts` and
  `scripts/generate-exam-week.ts`, which import `../exam-content/types`
  and `../exam-content`/`../exam-sync` respectively.

### `announcement/`
- `db.ts` (was `announcement-db.ts`), `db.test.ts`
- `api.ts` (was `announcement-api.ts`), `api.test.ts`
- `Board.tsx` (was `AnnouncementsBoard.tsx`)

### `home/`
- `api.ts` (was `home-api.ts`), `api.test.ts`
- `App.tsx` (was `HomeApp.tsx`)
- `semester-deadlines.ts` (Home-only, unprefixed already)
- `ed-digest-link.ts` (Home-only, unprefixed already)
- Home is the cross-feature aggregator: its `api.ts` legitimately
  imports from `../leetcode/db`, `../todo/db`, `../exam/db`,
  `../exam/content`, `../leetcode150/db`, `../leetcode150/content`,
  `../shared/scheduling`.

### `shared/` — new top-level folder, leaf utilities used symmetrically across features
- `scheduling.ts`, `scheduling.test.ts` — `localToday`/`addDays` used
  by all 6 features; `LADDER`/`applyReview`/`initialSchedule` used by
  `leetcode/` and `leetcode150/`. Kept as one file (no internal split —
  that would be a logic change, out of scope).
- `timeline-link.ts` — used by both `home/App.tsx` and `exam/App.tsx`.
- `sydneyTime.ts`, `sydneyTime.test.ts` — **not imported by any
  production code today**, only by its own test (confirmed via grep).
  Relocated as-is; not deleted, since removing dead code wasn't asked
  for and is out of scope for a pure reorg.

### Unchanged at root
`index.ts`, `index.html`, `index.css`, `frontend.tsx` (shrinks to the
`App`/`TabBar`/`ThemeToggle`/routing shell plus the top-level
`LeetCodeApp` import), `package.json`, `tsconfig.json`, `bun.lock`,
`README.md`, `LICENSE`, `srs.db`, `exam-attempts.jsonl`, `docs/`,
`scripts/`, `userscript/`, `exam-content/`.

## Frontend.tsx split

`frontend.tsx` currently mixes two things: the app shell (tab
navigation, theme toggle, deep-link routing) and the original
LeetCode board UI (it predates the `*App.tsx`-per-feature pattern the
other four features already use). This reorg brings it in line:
`leetcode/App.tsx` gets the board UI as a default-exported
`LeetCodeApp` component with the same `openProblemId`/`onOpened` props
`TodoApp`/`ExamApp` already use, and `frontend.tsx` imports it exactly
like the others. This is pure code motion — no prop shapes, behavior,
or logic change.

## Verification

- **Automated Hooks**: no PostToolUse hook exists yet in this repo
  (per `CLAUDE.md`'s outstanding continuous-testing requirement) — not
  set up as part of this reorg, since adding one is a separate,
  unrelated task.
- **Continuous Testing**: after each feature folder's files are moved
  and its imports fixed, run `bun test` (all 290+ tests must stay
  green) and `bunx tsc --noEmit` (must stay clean) before moving to
  the next folder.
- **Autonomous Correction**: if either check fails after a move, fix
  the break (almost always a missed import path) before proceeding —
  never leave the tree red between steps.
- **Final smoke check**: start the dev server, load Home/LeetCode/Todo/
  Modules tabs in the browser, confirm no console errors and no
  "Failed to fetch" — the same manual check already used to verify the
  Announcements feature.

## Out of scope

- No logic changes beyond the frontend.tsx extraction.
- No deleting `sydneyTime.ts` even though it looks dead.
- No renaming exported symbols, no changing API routes or DB schemas.
- No moving `exam-content/`, `docs/`, `scripts/`, or `userscript/`.
- No new abstractions, no consolidating the now-nested `db.ts`/`api.ts`
  files beyond what's described above.
