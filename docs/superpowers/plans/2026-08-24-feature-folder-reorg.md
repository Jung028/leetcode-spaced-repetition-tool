# Feature-Folder Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `leetcode-srs`'s ~50 flat root-level TS/TSX files into six feature folders (`leetcode/`, `leetcode150/`, `todo/`, `exam/`, `announcement/`, `home/`) plus a `shared/` folder for cross-feature utilities, dropping the now-redundant filename prefixes (`todo-db.ts` → `todo/db.ts`), with zero behavior change except one pure code-motion extraction.

**Architecture:** Nine sequential tasks, each moving one feature's files with `git mv` and repairing every import path that referenced them — both the moved files' own outward imports (relative depth changed) and every other file's inward imports (specifier changed). Order runs from least-depended-upon to most (`shared/` first, `home/` — the cross-feature aggregator — second-to-last), so each task only ever has to fix imports in files that already exist at a known, stable path. The last content task extracts the original LeetCode board UI out of `frontend.tsx` into `leetcode/App.tsx`, matching the `*App.tsx` pattern the other five features already use.

**Tech Stack:** Bun, TypeScript, React (via Bun HTML imports), `bun:sqlite`, `bun test`.

**Spec:** `docs/superpowers/specs/2026-08-24-feature-folder-reorg-design.md`

## Global Constraints

- **Move procedure, every task:** (1) `git mv` each listed file to its new path. (2) Fix that file's *own* outward imports — see "Depth rule" below. (3) Run the task's grep command(s) to find every other file still referencing the old specifier, and fix each hit. (4) Run `bun test` — expect all tests passing, 0 failures. (5) Run `bunx tsc --noEmit` — expect zero output. (6) If either fails, the error names the exact file and bad specifier — fix it and re-run both until green. This is the real correctness net: the file lists and grep patterns below are a well-verified starting checklist (built from grepping the actual import graph before writing this plan), not a guarantee of completeness — trust the compiler and test runner over the list if they disagree.
- **Depth rule:** a file moving from repo root (depth 0) into a new one-level-deep folder (`leetcode/`, `shared/`, etc.) needs one more `../` prepended to every import that points at something *not* also moving into that same folder in this task. An import to a sibling also moving into the same folder in this task keeps its specifier as-is (e.g. `todo-api.ts` importing `./todo-db` becomes, after both move into `todo/`, simply `./db` — same folder, just renamed).
- **Never use `sed -i` for import-path edits.** Specifiers like `./exam-content` (a file) and `./exam-content/types` (inside a directory that never moves) look almost identical but need different treatment — see Task 5's warning. Use the Edit tool on each hit individually.
- **`exam-content/` (the directory of 29 week-N.ts seed files) never moves in this plan.** Only `exam-content.ts` (the aggregator file — no trailing slash, no further path segments after it) moves, into `exam/content.ts`.
- **Work tree must be clean before and after every task.** Run `git status --short` before starting a task — if it's not empty, stop and report rather than proceeding. After the task's commit, `git status --short` must be empty again.
- **One commit per task**, message given in the task.
- **No logic changes** anywhere in this plan except Task 8's extraction, which is pure code motion — copy the named symbols out of `frontend.tsx` unchanged, don't "improve" them while moving.

---

### Task 1: Move shared utilities into `shared/`

**Files:**
- Move: `scheduling.ts` → `shared/scheduling.ts`
- Move: `scheduling.test.ts` → `shared/scheduling.test.ts`
- Move: `timeline-link.ts` → `shared/timeline-link.ts`
- Move: `sydneyTime.ts` → `shared/sydneyTime.ts`
- Move: `sydneyTime.test.ts` → `shared/sydneyTime.test.ts`

**Interfaces:**
- Produces: `shared/scheduling.ts` (unchanged exports: `LADDER`, `MAX_ACTIVE_BACKLOG`, `MAX_DAILY_LEETCODE_REVIEWS`, `addDays`, `applyReview`, `initialSchedule`, `isDue`, `localToday`, `nextAvailableDate`, `releaseCount`, types `ReviewResult`/`Schedule`), `shared/timeline-link.ts` (`TIMELINE_URL`, `TIMELINE_ANCHORS`), `shared/sydneyTime.ts` (`sydneyWallClockToUtc`, `toGoogleUtcStamp`).
- Consumes: nothing — these are leaf files with no imports of other project code.

- [ ] **Step 1: Move the files**

```bash
mkdir -p shared
git mv scheduling.ts shared/scheduling.ts
git mv scheduling.test.ts shared/scheduling.test.ts
git mv timeline-link.ts shared/timeline-link.ts
git mv sydneyTime.ts shared/sydneyTime.ts
git mv sydneyTime.test.ts shared/sydneyTime.test.ts
```

- [ ] **Step 2: These files have no outward imports of other project code — nothing to fix in them.**

Confirm: `grep -n '^import' shared/scheduling.ts shared/timeline-link.ts shared/sydneyTime.ts` should show only `bun:test`/no-project imports (scheduling.ts and timeline-link.ts have zero imports at all; sydneyTime.ts has zero imports). `shared/scheduling.test.ts` imports from `"./scheduling"` — already correct, same folder. `shared/sydneyTime.test.ts` imports from `"./sydneyTime"` — already correct.

- [ ] **Step 3: Fix every other file that imports the old root-level specifiers**

Run:
```bash
grep -rln '"\./scheduling"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./timeline-link"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./sydneyTime"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Every hit is currently a root-level file (depth 0), so the fix is a straight string swap: `"./scheduling"` → `"./shared/scheduling"`, `"./timeline-link"` → `"./shared/timeline-link"`, `"./sydneyTime"` → `"./shared/sydneyTime"`.

Expected files needing the `"./scheduling"` fix (verify against your grep, don't trust this list blindly): `exam-content.ts`, `exam-db.ts`, `exam-api.ts`, `exam-api.test.ts`, `exam-db.test.ts`, `home-api.ts`, `home-api.test.ts`, `todo-api.ts`, `todo-api.test.ts`, `TodoApp.tsx`, `HomeApp.tsx`, `leetcode150-api.ts`, `leetcode150-api.test.ts`, `leetcode150-db.ts`, `leetcode150-db.test.ts`, `announcement-api.ts`, `db.ts`, `db.test.ts`, `api.ts`, `api.test.ts`, `index.ts`, `frontend.tsx`.

Expected files needing the `"./timeline-link"` fix: `ExamApp.tsx`, `HomeApp.tsx`.

The `"./sydneyTime"` grep should come back empty outside `shared/` — it's currently unused in production code.

- [ ] **Step 4: Verify**

```bash
bun test
bunx tsc --noEmit
```

Both must be clean. Fix anything the compiler/tests point at.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move scheduling/timeline-link/sydneyTime into shared/"
```

---

### Task 2: Move the core LeetCode review-board feature into `leetcode/`

**Files:**
- Move: `db.ts` → `leetcode/db.ts`, `db.test.ts` → `leetcode/db.test.ts`
- Move: `api.ts` → `leetcode/api.ts`, `api.test.ts` → `leetcode/api.test.ts`
- Move: `leetcode.ts` → `leetcode/leetcode.ts`, `leetcode.test.ts` → `leetcode/leetcode.test.ts`
- Move: `highlight.ts` → `leetcode/highlight.ts`, `highlight.test.ts` → `leetcode/highlight.test.ts`

**Interfaces:**
- Produces: `leetcode/db.ts` (`openDb`, `createProblem`, `listProblems`, `getProblem`, `reviewProblem`, `updateProblem`, `deleteProblem`, `findProblemBySlug`, `captureSubmission`, `countReviewsToday`, `listCompletedToday`, `levelDueLeetcode`, types `ProblemSummary`/`Problem`/`ProblemDetail`/`ProblemInput`/`Review`), `leetcode/api.ts` (`apiRoutes`), `leetcode/leetcode.ts` (`slugFromUrl`), `leetcode/highlight.ts` (`highlightCode`).
- Consumes: `shared/scheduling.ts` (from Task 1).

- [ ] **Step 1: Move the files**

```bash
mkdir -p leetcode
git mv db.ts leetcode/db.ts
git mv db.test.ts leetcode/db.test.ts
git mv api.ts leetcode/api.ts
git mv api.test.ts leetcode/api.test.ts
git mv leetcode.ts leetcode/leetcode.ts
git mv leetcode.test.ts leetcode/leetcode.test.ts
git mv highlight.ts leetcode/highlight.ts
git mv highlight.test.ts leetcode/highlight.test.ts
```

- [ ] **Step 2: Fix these files' own outward imports**

Run `grep -n '^import' leetcode/*.ts` and fix, per file:
- `leetcode/db.ts`: imports `./scheduling` (several names) and `./leetcode` (`slugFromUrl`) — both siblings inside `leetcode/` now (scheduling already sits in `shared/` though — it imports `./scheduling` which after Task 1 reads `./shared/scheduling`; now one level deeper → `../shared/scheduling`). `./leetcode` stays `./leetcode` (sibling, same folder).
- `leetcode/api.ts`: imports `./db` (stays, sibling) and `./scheduling`-derived path → depends what Task 1 left it as (`./shared/scheduling` → `../shared/scheduling`).
- `leetcode/db.test.ts`: imports `./db` (stays) and `./scheduling`-derived path → `../shared/scheduling`.
- `leetcode/api.test.ts`: imports `./db` (stays), `./scheduling`-derived path → `../shared/scheduling`, and — unusually — `./leetcode150-db` and `./leetcode150-content` (leetcode150 hasn't moved yet, still root-level) → `../leetcode150-db` and `../leetcode150-content` (you'll touch these again in Task 3 when leetcode150 itself moves and renames).
- `leetcode/leetcode.ts`, `leetcode/leetcode.test.ts`, `leetcode/highlight.ts`, `leetcode/highlight.test.ts`: no project imports besides their own sibling under test — should already be correct.

- [ ] **Step 3: Fix every other file that imports the old root-level specifiers**

Run:
```bash
grep -rln '"\./db"' --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v '^\./leetcode/'
grep -rln '"\./api"' --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v '^\./leetcode/'
grep -rln '"\./leetcode"' --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v '^\./leetcode/'
grep -rln '"\./highlight"' --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v '^\./leetcode/'
```

All hits are still root-level (depth 0) files, so: `"./db"` → `"./leetcode/db"`, `"./api"` → `"./leetcode/api"`, `"./leetcode"` → `"./leetcode/leetcode"`, `"./highlight"` → `"./leetcode/highlight"`.

Expected `"./db"` importers: `home-api.ts`, `home-api.test.ts`, `leetcode150-db.ts`, `leetcode150-db.test.ts`, `leetcode150-api.test.ts`, `index.ts`, `frontend.tsx`.
Expected `"./api"` importer: `index.ts` only.
Expected `"./leetcode"` importer: `leetcode150-db.ts` only.
Expected `"./highlight"` importer: `frontend.tsx` only.

- [ ] **Step 4: Verify**

```bash
bun test
bunx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move core LeetCode review-board feature into leetcode/"
```

---

### Task 3: Move the LeetCode Top-150 tracker into `leetcode150/`

**Files:**
- Move: `leetcode150-db.ts` → `leetcode150/db.ts`, `leetcode150-db.test.ts` → `leetcode150/db.test.ts`
- Move: `leetcode150-api.ts` → `leetcode150/api.ts`, `leetcode150-api.test.ts` → `leetcode150/api.test.ts`
- Move: `leetcode150-content.ts` → `leetcode150/content.ts`, `leetcode150-content.test.ts` → `leetcode150/content.test.ts`

**Interfaces:**
- Produces: `leetcode150/db.ts` (`migrateLeetcode150`, `getCurrentLeetcode150`, `leetcode150CompletedCredit`, type `CurrentLeetcode150`), `leetcode150/api.ts` (`leetcode150ApiRoutes`), `leetcode150/content.ts` (`LEETCODE_150`, `leetcode150Url`, `slugify`, type `Leetcode150Item`).
- Consumes: `leetcode/db.ts`, `leetcode/leetcode.ts` (from Task 2), `shared/scheduling.ts` (from Task 1).

- [ ] **Step 1: Move the files**

```bash
mkdir -p leetcode150
git mv leetcode150-db.ts leetcode150/db.ts
git mv leetcode150-db.test.ts leetcode150/db.test.ts
git mv leetcode150-api.ts leetcode150/api.ts
git mv leetcode150-api.test.ts leetcode150/api.test.ts
git mv leetcode150-content.ts leetcode150/content.ts
git mv leetcode150-content.test.ts leetcode150/content.test.ts
```

- [ ] **Step 2: Fix these files' own outward imports**

Run `grep -n '^import' leetcode150/*.ts`:
- `leetcode150/db.ts`: `./db`→`../leetcode/db`, `./leetcode`→`../leetcode/leetcode`, `./leetcode150-content`→`./content` (sibling, renamed), `./scheduling`-derived→`../shared/scheduling`.
- `leetcode150/api.ts`: `./leetcode150-db`→`./db`, `./leetcode150-content`→`./content`, `./scheduling`-derived→`../shared/scheduling`.
- `leetcode150/db.test.ts`: `./db`→`../leetcode/db`, `./scheduling`-derived→`../shared/scheduling`, `./leetcode150-db`→`./db`, `./leetcode150-content`→`./content`.
- `leetcode150/api.test.ts`: `./db`→`../leetcode/db`, `./scheduling`-derived→`../shared/scheduling`, `./leetcode150-db`→`./db`, `./leetcode150-api`→`./api`, `./leetcode150-content`→`./content`.
- `leetcode150/content.ts`, `leetcode150/content.test.ts`: no cross-feature imports — should already be correct.

- [ ] **Step 3: Fix every other file that imports the old root-level specifiers**

Run:
```bash
grep -rln '"\./leetcode150-db"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./leetcode150-api"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./leetcode150-content"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Fix each: `"./leetcode150-db"` → `"./leetcode150/db"`, `"./leetcode150-api"` → `"./leetcode150/api"`, `"./leetcode150-content"` → `"./leetcode150/content"`. Also revisit `leetcode/api.test.ts` from Task 2, Step 2 — it currently has `"../leetcode150-db"`/`"../leetcode150-content"`; fix those to `"../leetcode150/db"`/`"../leetcode150/content"` here.

Expected remaining importers (root-level, depth 0): `home-api.ts`, `home-api.test.ts`, `index.ts`.

- [ ] **Step 4: Verify**

```bash
bun test
bunx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move LeetCode Top-150 tracker into leetcode150/"
```

---

### Task 4: Move Todo into `todo/`

**Files:**
- Move: `todo-db.ts` → `todo/db.ts`, `todo-db.test.ts` → `todo/db.test.ts`
- Move: `todo-api.ts` → `todo/api.ts`, `todo-api.test.ts` → `todo/api.test.ts`
- Move: `TodoApp.tsx` → `todo/App.tsx`

**Interfaces:**
- Produces: `todo/db.ts` (`migrateTodo`, `createTodo`, `listDueTodos`, `countOverdueTodos`, `countTodosCompletedToday`, `listTodosCompletedToday`, `toggleTodo`, `deleteTodo`, type `Todo`), `todo/api.ts` (`todoApiRoutes`), `todo/App.tsx` (default export `TodoApp`, unchanged props `{ openTodoId?, onOpened? }`).
- Consumes: `shared/scheduling.ts` (from Task 1).

- [ ] **Step 1: Move the files**

```bash
mkdir -p todo
git mv todo-db.ts todo/db.ts
git mv todo-db.test.ts todo/db.test.ts
git mv todo-api.ts todo/api.ts
git mv todo-api.test.ts todo/api.test.ts
git mv TodoApp.tsx todo/App.tsx
```

- [ ] **Step 2: Fix these files' own outward imports**

- `todo/db.ts`: no cross-feature imports.
- `todo/api.ts`: `./todo-db`→`./db`, `./scheduling`-derived→`../shared/scheduling`.
- `todo/db.test.ts`: `./todo-db`→`./db`.
- `todo/api.test.ts`: `./todo-db`→`./db`, `./todo-api`→`./api`, `./scheduling`-derived→`../shared/scheduling`.
- `todo/App.tsx`: `./todo-db`→`./db`, `./scheduling`-derived→`../shared/scheduling`.

- [ ] **Step 3: Fix every other file that imports the old root-level specifiers**

Run:
```bash
grep -rln '"\./todo-db"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./todo-api"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./TodoApp"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Fix: `"./todo-db"` → `"./todo/db"`, `"./todo-api"` → `"./todo/api"` (expected only in `index.ts`), `"./TodoApp"` → `"./todo/App"` (expected only in `frontend.tsx`).

- [ ] **Step 4: Verify**

```bash
bun test
bunx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move Todo feature into todo/"
```

---

### Task 5: Move Exam/Modules into `exam/`

**Files:**
- Move: `exam-db.ts` → `exam/db.ts`, `exam-db.test.ts` → `exam/db.test.ts`
- Move: `exam-api.ts` → `exam/api.ts`, `exam-api.test.ts` → `exam/api.test.ts`
- Move: `exam-content.ts` → `exam/content.ts`, `exam-content.test.ts` → `exam/content.test.ts`
- Move: `exam-generate.ts` → `exam/generate.ts`, `exam-generate.test.ts` → `exam/generate.test.ts`, `exam-generate-api.test.ts` → `exam/generate-api.test.ts`
- Move: `exam-sync.ts` → `exam/sync.ts`, `exam-sync.test.ts` → `exam/sync.test.ts`
- Move: `ExamApp.tsx` → `exam/App.tsx`
- Move: `MermaidDiagram.tsx` → `exam/MermaidDiagram.tsx`
- **Do NOT move `exam-content/`** (the directory of 29 seed files) — it stays at repo root.

**⚠️ The trickiest step in this whole plan:** `exam-content.ts` (a file, no trailing slash — moving into `exam/content.ts`) and `exam-content/` (a directory that never moves) look almost identical in import strings. `import { buildExamSchedule } from "./exam-content"` refers to the file and becomes `from "./content"` once both live together in `exam/`. `import type { ExamPaperSeed } from "./exam-content/types"` refers to the directory and becomes `from "../exam-content/types"` (one more `../`, directory unchanged) once the importing file moves into `exam/`. Do not let a search-and-replace conflate these two patterns.

**Interfaces:**
- Produces: `exam/db.ts` (exam paper/answer persistence), `exam/api.ts` (`examApiRoutes`), `exam/content.ts` (`buildExamSchedule`, `listExamCourses`, `COURSES`, `SEMESTER_START`, `weekStartDate`, `weekDueDate`, `groupExamPapersByWeek`, type `ExamWeekView`), `exam/generate.ts` (`resolveWeekDir`, `startGenerateJob`, `readJobStatus`, `defaultGenerateDeps`, type `StartJobDeps`/`JobStatus`), `exam/sync.ts` (`COURSE_DIRS`, `findPendingWeeks`, `findWeekFolder`), `exam/App.tsx` (default export `ExamApp`), `exam/MermaidDiagram.tsx` (`MermaidDiagram`).
- Consumes: `shared/scheduling.ts` (from Task 1), `shared/timeline-link.ts` (from Task 1), `exam-content/` (untouched, at repo root), `scripts/generate-exam-week.ts` and `scripts/transcribe-lecture.ts` (untouched, at repo root).

- [ ] **Step 1: Move the files**

```bash
mkdir -p exam
git mv exam-db.ts exam/db.ts
git mv exam-db.test.ts exam/db.test.ts
git mv exam-api.ts exam/api.ts
git mv exam-api.test.ts exam/api.test.ts
git mv exam-content.ts exam/content.ts
git mv exam-content.test.ts exam/content.test.ts
git mv exam-generate.ts exam/generate.ts
git mv exam-generate.test.ts exam/generate.test.ts
git mv exam-generate-api.test.ts exam/generate-api.test.ts
git mv exam-sync.ts exam/sync.ts
git mv exam-sync.test.ts exam/sync.test.ts
git mv ExamApp.tsx exam/App.tsx
git mv MermaidDiagram.tsx exam/MermaidDiagram.tsx
```

- [ ] **Step 2: Fix these files' own outward imports**

- `exam/db.ts`: `./exam-content` → `./content`.
- `exam/api.ts`: `./exam-db`→`./db`, `./exam-content`→`./content`, `./exam-sync`→`./sync`, `./exam-generate`→`./generate`, `./exam-content/types`→`../exam-content/types` (directory, unchanged path, one more `../`), `./scheduling`-derived→`../shared/scheduling`.
- `exam/content.ts`: the 18 lines importing `./exam-content/info5995/week-1` etc. all become `../exam-content/info5995/week-1` etc. — same directory, one more `../`. `./exam-content/types` (if present) same treatment. `./scheduling`-derived→`../shared/scheduling`.
- `exam/generate.ts`: `./exam-sync`→`./sync`, `./scripts/generate-exam-week`→`../scripts/generate-exam-week`, `./scripts/transcribe-lecture`→`../scripts/transcribe-lecture`.
- `exam/sync.ts`: `./scripts/generate-exam-week`→`../scripts/generate-exam-week`, `./exam-content`→`./content`.
- `exam/App.tsx`: `./exam-api`→`./api`, `./exam-content`→`./content`, `./exam-generate`→`./generate`, `./timeline-link`-derived→`../shared/timeline-link`, `./MermaidDiagram`→`./MermaidDiagram` (stays, sibling).
- `exam/db.test.ts`: `./exam-db`→`./db`, `./exam-content`→`./content`, `./scheduling`-derived→`../shared/scheduling`.
- `exam/api.test.ts`: `./exam-db`→`./db`, `./exam-api`→`./api`, `./exam-content`→`./content`, `./scheduling`-derived→`../shared/scheduling`.
- `exam/content.test.ts`: `./exam-content`→`./content`.
- `exam/generate.test.ts`: `./exam-generate`→`./generate`.
- `exam/generate-api.test.ts`: `./exam-db`→`./db`, `./exam-api`→`./api`, `./exam-generate`→`./generate`, `./scheduling`-derived→`../shared/scheduling`.
- `exam/sync.test.ts`: `./exam-sync`→`./sync`.

- [ ] **Step 3: Fix every other file that imports the old root-level specifiers**

Run:
```bash
grep -rln '"\./exam-db"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./exam-api"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./exam-content"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./exam-generate"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./exam-sync"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./ExamApp"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\.\./exam-sync"' --include="*.ts" . | grep -v node_modules
grep -rln '"\.\./exam-content"' --include="*.ts" . | grep -v node_modules
```

Fix: `"./exam-db"`→`"./exam/db"` (expected: `home-api.ts`, `home-api.test.ts`, `index.ts`), `"./exam-api"`→`"./exam/api"` (expected: `index.ts`), `"./exam-content"`→`"./exam/content"` (expected: `home-api.ts`, `home-api.test.ts`), `"./ExamApp"`→`"./exam/App"` (expected: `frontend.tsx`). For the last two greps (files already inside `scripts/`): `"../exam-sync"`→`"../exam/sync"` and `"../exam-content"`→`"../exam/content"` in `scripts/find-week-updates.ts` — **but leave `"../exam-content/types"` in that same file untouched**, it's the directory.

- [ ] **Step 4: Verify**

```bash
bun test
bunx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move Exam/Modules feature into exam/ (exam-content/ data dir untouched)"
```

---

### Task 6: Move Announcements into `announcement/`

**Files:**
- Move: `announcement-db.ts` → `announcement/db.ts`, `announcement-db.test.ts` → `announcement/db.test.ts`
- Move: `announcement-api.ts` → `announcement/api.ts`, `announcement-api.test.ts` → `announcement/api.test.ts`
- Move: `AnnouncementsBoard.tsx` → `announcement/Board.tsx`

**Interfaces:**
- Produces: `announcement/db.ts` (`migrateAnnouncements`, `createAnnouncement`, `listAnnouncements`, `updateAnnouncement`, `toggleAnnouncement`, `deleteAnnouncement`, type `Announcement`), `announcement/api.ts` (`announcementApiRoutes`), `announcement/Board.tsx` (default export, was named `AnnouncementsBoard`).
- Consumes: `shared/scheduling.ts` (from Task 1).

- [ ] **Step 1: Move the files**

```bash
mkdir -p announcement
git mv announcement-db.ts announcement/db.ts
git mv announcement-db.test.ts announcement/db.test.ts
git mv announcement-api.ts announcement/api.ts
git mv announcement-api.test.ts announcement/api.test.ts
git mv AnnouncementsBoard.tsx announcement/Board.tsx
```

- [ ] **Step 2: Fix these files' own outward imports**

- `announcement/api.ts`: `./announcement-db`→`./db`, `./scheduling`-derived→`../shared/scheduling`.
- `announcement/db.test.ts`: `./announcement-db`→`./db`.
- `announcement/api.test.ts`: `./announcement-db`→`./db`, `./announcement-api`→`./api`.
- `announcement/Board.tsx`: `./announcement-db`→`./db`.

- [ ] **Step 3: Fix every other file that imports the old root-level specifiers**

Run:
```bash
grep -rln '"\./announcement-db"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./announcement-api"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./AnnouncementsBoard"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Fix: `"./announcement-db"`→`"./announcement/db"` (expected: `index.ts`), `"./announcement-api"`→`"./announcement/api"` (expected: `index.ts`), `"./AnnouncementsBoard"`→`"./announcement/Board"` (expected: `HomeApp.tsx`, still at root at this point — Task 7 moves it next).

- [ ] **Step 4: Verify**

```bash
bun test
bunx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move Announcements feature into announcement/"
```

---

### Task 7: Move Home into `home/`

**Files:**
- Move: `home-api.ts` → `home/api.ts`, `home-api.test.ts` → `home/api.test.ts`
- Move: `HomeApp.tsx` → `home/App.tsx`
- Move: `semester-deadlines.ts` → `home/semester-deadlines.ts`
- Move: `ed-digest-link.ts` → `home/ed-digest-link.ts`

**Interfaces:**
- Produces: `home/api.ts` (`homeApiRoutes`, types `DueItem`/`DueSource`/`HomeStats`), `home/App.tsx` (default export `HomeApp`, unchanged prop `{ onNavigate }`).
- Consumes: `leetcode/db.ts` (Task 2), `todo/db.ts` (Task 4), `exam/db.ts`+`exam/content.ts` (Task 5), `leetcode150/db.ts`+`leetcode150/content.ts` (Task 3), `announcement/Board.tsx` (Task 6), `shared/scheduling.ts`+`shared/timeline-link.ts` (Task 1).

- [ ] **Step 1: Move the files**

```bash
mkdir -p home
git mv home-api.ts home/api.ts
git mv home-api.test.ts home/api.test.ts
git mv HomeApp.tsx home/App.tsx
git mv semester-deadlines.ts home/semester-deadlines.ts
git mv ed-digest-link.ts home/ed-digest-link.ts
```

- [ ] **Step 2: Fix these files' own outward imports**

- `home/api.ts`: `./db`→`../leetcode/db`, `./todo-db`→`../todo/db`, `./exam-db`→`../exam/db`, `./exam-content`→`../exam/content`, `./leetcode150-db`→`../leetcode150/db`, `./leetcode150-content`→`../leetcode150/content`, `./scheduling`-derived→`../shared/scheduling`. (These were already fixed to point at the *root-level* new folder names in each earlier task, e.g. Task 2 left `home-api.ts` with `"./leetcode/db"` — now that `home-api.ts` itself moves one level deeper, every one of those needs its own extra `../`.)
- `home/App.tsx`: `./home-api`→`./api`, `./AnnouncementsBoard`-derived (Task 6 left it as `"./announcement/Board"`) → `../announcement/Board`, `./semester-deadlines`→`./semester-deadlines` (sibling, unchanged), `./timeline-link`-derived (Task 1 left it as `"./shared/timeline-link"`) → `../shared/timeline-link`, `./ed-digest-link`→`./ed-digest-link` (sibling, unchanged), `./scheduling`-derived→`../shared/scheduling`.
- `home/api.test.ts`: same set of cross-feature imports as `home/api.ts` (it directly imports `openDb`/`createProblem`/`migrateTodo`/`migrateExam`/etc. for test setup) — apply the same depth fix to each: `./db`→`../leetcode/db`, `./todo-db`→`../todo/db`, `./exam-db`→`../exam/db`, `./exam-content`→`../exam/content`, `./leetcode150-db`→`../leetcode150/db`, `./leetcode150-content`→`../leetcode150/content`, `./home-api`→`./api`, `./scheduling`-derived→`../shared/scheduling`.
- `home/semester-deadlines.ts`, `home/ed-digest-link.ts`: no imports — nothing to fix.

- [ ] **Step 3: Fix every other file that imports the old root-level specifiers**

Run:
```bash
grep -rln '"\./home-api"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln '"\./HomeApp"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Fix: `"./home-api"`→`"./home/api"` (expected: `index.ts`), `"./HomeApp"`→`"./home/App"` (expected: `frontend.tsx`).

- [ ] **Step 4: Verify**

```bash
bun test
bunx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move Home feature into home/"
```

---

### Task 8: Extract the LeetCode board UI out of `frontend.tsx` into `leetcode/App.tsx`

Every other feature already has its own `*App.tsx` (`todo/App.tsx`, `exam/App.tsx`, `home/App.tsx`) that `frontend.tsx` just imports and renders. `frontend.tsx` itself still has the *original* LeetCode review-board UI (`LeetCodeApp` and everything it uses) inline, because it predates that pattern. This task is pure code motion — copy the named pieces out verbatim, no logic changes — to bring `leetcode/` in line with the other five features.

**Files:**
- Create: `leetcode/App.tsx`
- Modify: `frontend.tsx` (shrinks to the shell: `App`, `TabBar`, `ThemeToggle`, routing/deep-link types)

**Interfaces:**
- Produces: `leetcode/App.tsx` default export `LeetCodeApp`, props `{ openProblemId?: number | null; onOpened?: () => void }` — same shape `frontend.tsx`'s `App()` already passes today.
- Consumes: `leetcode/db.ts` (types `ProblemSummary`/`ProblemDetail`), `leetcode/highlight.ts` (`highlightCode`), `shared/scheduling.ts` (`LADDER`, `isDue`, `localToday`).

- [ ] **Step 1: Create `leetcode/App.tsx`**

Move these symbols out of `frontend.tsx`, unchanged, into this new file: the `View` type, `ProblemFields` type, `LANGUAGE_OPTIONS`, the `api` object, `Leetcode150Current` interface, `leetcode150Api` object, `daysBetween`, `urgency`, `openExternal`, `RungMeter`, `TrackedListModal`, `StatModal` type, `Stats`, `DueBoard`, `NextProblemBanner`, `ProblemForm`, `Detail`, and the `LeetCodeApp` function itself (add `export default` to it).

```tsx
import React, { useEffect, useMemo, useState } from "react";
import { LADDER, isDue, localToday } from "../shared/scheduling";
import type { ProblemSummary, ProblemDetail } from "./db";
import { highlightCode } from "./highlight";

type View =
  | { name: "board" }
  | { name: "add" }
  | { name: "detail"; id: number };

type ProblemFields = { title: string; url: string; solution: string; language: string; pattern: string; patternWhy: string };

const LANGUAGE_OPTIONS = [
  "java",
  "python3",
  "cpp",
  "c",
  "csharp",
  "javascript",
  "typescript",
  "golang",
  "ruby",
  "swift",
  "kotlin",
  "rust",
  "php",
];

const api = {
  list: () =>
    fetch("/api/problems").then((r) => r.json() as Promise<ProblemSummary[]>),
  get: (id: number) =>
    fetch(`/api/problems/${id}`).then((r) => r.json() as Promise<ProblemDetail>),
  stats: () =>
    fetch("/api/stats").then((r) => r.json() as Promise<{ completedToday: number }>),
  create: (body: ProblemFields) =>
    fetch("/api/problems", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  update: (id: number, body: ProblemFields) =>
    fetch(`/api/problems/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  review: (id: number, result: "pass" | "fail") =>
    fetch(`/api/problems/${id}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }),
  remove: (id: number) =>
    fetch(`/api/problems/${id}`, { method: "DELETE" }),
};

interface Leetcode150Current {
  position: number;
  number: number;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
  dueSince: string;
  overdueDays: number;
}

const leetcode150Api = {
  current: () =>
    fetch("/api/leetcode150/current").then(
      (r) => r.json() as Promise<Leetcode150Current | { done: true }>,
    ),
};

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

// Same visual language LeetCode uses for difficulty, repointed at how
// urgently a review is needed: green (on schedule) → gold (due today) → red (overdue).
function urgency(nextReview: string, today: string): "green" | "gold" | "red" {
  if (nextReview > today) return "green";
  return nextReview === today ? "gold" : "red";
}

const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

function RungMeter({ rung }: { rung: number }) {
  return (
    <span className="rung" title={`rung ${rung + 1} of ${LADDER.length} — next interval ${LADDER[rung]}d`}>
      {LADDER.map((_, i) => (
        <span key={i} className={i <= rung ? "rung-on" : "rung-off"} />
      ))}
    </span>
  );
}
```

Then continue in the same file, copied verbatim from the current `frontend.tsx` (use Read on `frontend.tsx` before this task starts to get the exact current text — line numbers below are from the file as it stands at the start of this task, before any edits in this task):

- `TrackedListModal` (the component right after `RungMeter`)
- `type StatModal = "tracked" | "due" | "overdue" | "completed" | null;` followed by `Stats`
- `DueBoard`
- `NextProblemBanner`
- `ProblemForm`
- `Detail`
- `LeetCodeApp` — change `function LeetCodeApp(` to `export default function LeetCodeApp(`

None of these components' internals change. Copy them exactly as they read in the current `frontend.tsx`.

- [ ] **Step 2: Shrink `frontend.tsx` to the shell**

Replace the whole file with:

```tsx
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import TodoApp from "./todo/App";
import HomeApp from "./home/App";
import ExamApp from "./exam/App";
import LeetCodeApp from "./leetcode/App";
import "./index.css";

type Tab = "home" | "leetcode" | "todo" | "exam";

type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "todo"; todoId: number }
  | { tab: "exam"; course: string; week: number };
```

Then keep, copied verbatim from the current file: `ThemeToggle`, `TabBar`, and the `App` function (which still constructs `navigate`, renders `<TabBar>`, and conditionally renders `<HomeApp>`/`<LeetCodeApp>`/`<TodoApp>`/`<ExamApp>` based on `tab` — unchanged except `LeetCodeApp` now comes from the new import instead of being defined in this file).

End the file with:

```tsx
createRoot(document.getElementById("root")!).render(<App />);
```

Remove the old `import { LADDER, isDue, localToday } from "./scheduling";`, `import type { ProblemSummary, ProblemDetail } from "./db";`, and `import { highlightCode } from "./highlight";` lines — the shell no longer needs them, they moved to `leetcode/App.tsx`.

- [ ] **Step 3: Verify**

```bash
bun test
bunx tsc --noEmit
```

`bun test` won't catch a JSX/UI regression here (there's no component test for the board), so also do a manual smoke check now: `bun run dev`, load `http://localhost:3000`, click through Home → LeetCode → Todo → Modules tabs, open a LeetCode problem's detail view, confirm it renders and the Pass/Fail/Edit/Delete buttons are present. Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: extract LeetCode board UI from frontend.tsx into leetcode/App.tsx"
```

---

### Task 9: Final verification

**Files:** none changed — this task only verifies.

- [ ] **Step 1: Confirm the whole tree is reorganized**

```bash
ls *.ts *.tsx 2>/dev/null
```

Expected remaining root-level TS/TSX files: only `frontend.tsx` and `index.ts`. Everything else should now live under `leetcode/`, `leetcode150/`, `todo/`, `exam/`, `announcement/`, `home/`, or `shared/`.

- [ ] **Step 2: Full test suite and typecheck**

```bash
bun test
bunx tsc --noEmit
```

Expect the same test count as before this plan started (290 tests, 0 failures) and zero `tsc` output.

- [ ] **Step 3: Dev-server smoke check**

```bash
bun run dev
```

In a browser, load `http://localhost:3000` and check, on each tab: Home (stats tiles, Announcements board, deadlines, calendar all render, no "Failed to fetch"), LeetCode (board loads, a problem's detail view opens), Todo (board loads, add-todo form opens), Modules (exam board loads). Check the browser console for errors. Stop the dev server when done.

- [ ] **Step 4: Grep sweep for any stray old-style specifiers**

```bash
grep -rnE '"\./(db|api|leetcode|highlight|todo-db|todo-api|TodoApp|exam-db|exam-api|exam-content|exam-generate|exam-sync|ExamApp|MermaidDiagram|announcement-db|announcement-api|AnnouncementsBoard|home-api|HomeApp|leetcode150-db|leetcode150-api|leetcode150-content|scheduling|timeline-link|sydneyTime)"' --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

(Uses `-E` for portable extended-regex alternation — macOS's default `grep` doesn't support `\|` in basic regex mode.)

This should come back empty (or only match legitimate same-folder sibling imports like `leetcode/db.test.ts`'s `"./db"`, which is correct and expected — read each hit before assuming it's a problem). Fix anything that's actually stale.

- [ ] **Step 5: Report to the user**

Summarize: final directory tree, test count, confirmation that `tsc --noEmit` is clean, confirmation of the manual smoke check. No commit needed for this task (nothing changed) unless Step 4 found something to fix, in which case commit that fix with `git commit -m "fix: stray import path missed during feature-folder reorg"`.
