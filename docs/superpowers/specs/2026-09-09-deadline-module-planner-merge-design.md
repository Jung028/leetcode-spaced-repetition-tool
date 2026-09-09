# Deadline / Module Planner merge — design

Date: 2026-09-09
Status: draft for review

## 1. Plain-language summary

Right now the app has **three separate to-do-ish lists** that don't know about each
other:

1. **Semester deadlines** — the list on the Home page. It is frozen in a source
   file (`semester-deadlines.ts`). You can tick a row off, but you cannot add,
   edit, or delete rows from the website.
2. **Module Planner** — on the Modules tab, nested inside the exam board. This one
   is fully editable: one group per subject, and inside each group you add items
   tagged Assignment / Presentation / Viva / Other, each with a description,
   links, and Google-Calendar sync. It is currently empty.
3. **Announcements** — free-text reminders on Home. Editable, but just text; none
   of them are connected to a real due date.

This change merges 1 and 2 into a **single editable planner that lives on the Home
page**, gives every subject ("module") proper create/rename/hide/delete, adds a
weight (%) field, adds a **flat "all items, sorted by date" view** alongside the
grouped view, and adds a one-click way to turn an **announcement into a deadline**.

## 2. Goals

- One editable store for everything with a due date. Add / edit / delete / tick
  off works from the UI, everywhere that data is shown.
- The planner lives on the **Home page**, replacing the read-only "Semester
  deadlines" panel. The Modules tab goes back to being exam papers only.
- The 12 existing hard-coded deadlines are migrated in automatically, keeping any
  tick-offs already made.
- Modules (subjects) are real rows: the 4 core subjects seeded, plus the user can
  add their own, rename, hide, and delete.
- Two views in the planner, toggle remembered between visits:
  - **Grouped by subject** (today's layout).
  - **All items** — one flat list, sortable (due date nearest ↔ furthest,
    by subject, by weight).
- "＋ Add to deadlines" on each announcement row opens a pre-filled planner form.

## 3. Non-goals / out of scope

- The exam course selector, exam papers, exam history, and exam→calendar sync are
  untouched. "Module" in this document means a planner subject row, which happens
  to be seeded from the same 4 course codes.
- `~/bin/exam-autogen.sh` currently rewrites `source:"scanned"` rows in
  `semester-deadlines.ts`. After this change that file is a seed-only constant, so
  those writes become inert. Every current row is already `source:"manual"`, so
  nothing breaks today. Re-pointing that job at `POST /api/module-items` is a
  follow-up, tracked in §10.
- No change to `home-api.ts`'s `DueItem` shape beyond what already exists
  (`source: "module-item"` is already defined).

## 4. Data model

### 4.1 New table: `modules`

```sql
CREATE TABLE IF NOT EXISTS modules (
  code       TEXT PRIMARY KEY,            -- "INFO5995", or a user slug e.g. "MY-COURSE"
  name       TEXT NOT NULL,               -- "Introduction to Cybersecurity"
  hidden     INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL                -- local 'YYYY-MM-DD'
);
```

- Migration seeds the 4 core subjects from the existing `COURSE_NAMES` constant
  with `INSERT OR IGNORE` (idempotent), `sort_order` 0..3 in declaration order.
- `code` is `[A-Za-z0-9-]{2,16}`, uppercased on write. Rejected if already taken.
- Lives in `modules-db.ts`. `COURSE_NAMES` stays in `semester-deadlines.ts` purely
  as the seed source (it is also still imported by exam code — unchanged).

### 4.2 `module_items` changes (`module-items-db.ts`)

- Add nullable column: `weight TEXT` (e.g. `"20%"`; free text, trimmed; `NULL`
  when absent). `ALTER TABLE module_items ADD COLUMN weight TEXT` guarded by a
  `PRAGMA table_info` check so the migration is re-runnable.
- `ModuleItemKind` / `MODULE_ITEM_KINDS` gains `"quiz"` and `"exam"`:
  `["assignment", "presentation", "viva", "quiz", "exam", "other"]`.
- `ModuleItem`, `ModuleItemInput`, `ModuleItemRow`, `toModuleItem`,
  `createModuleItem`, `updateModuleItem` all thread `weight`.
- `listModuleItems` unchanged (still `ORDER BY completed ASC, due_at ASC, id ASC`);
  the flat-view sort is applied client-side so the toggle needs no round-trip.

### 4.3 One-time seed of the 12 deadlines

New marker table so a user-deleted seed never comes back and nothing double-seeds:

```sql
CREATE TABLE IF NOT EXISTS module_item_seeds (
  seed_key  TEXT PRIMARY KEY,   -- deadlineId(): "COURSE|Title"
  seeded_at TEXT NOT NULL
);
```

Seed routine (runs inside `migrateModuleItems`, after `modules` is seeded):

1. For each row `d` in `SEMESTER_DEADLINES`:
   - `key = deadlineId(d)` (`"${course}|${title}"`).
   - If `key` is already in `module_item_seeds` → skip.
   - Insert a `module_items` row:
     - `course = d.course`, `title = d.title`, `weight = d.weight`,
       `due_at = normalizeDueAt(d.dueDate)` (→ `...T23:59`),
       `kind` from a small static map (see below), `description = noteFor(d)`,
       `links = []`, `sync_state = 'pending'`.
     - `completed = 1` **iff** `deadline_completions` has a row whose `id === key`,
       else `0`.
   - Insert `(key, today)` into `module_item_seeds`.
2. The seed never updates an existing item — it only ever inserts on first run.

Kind map for the seed (only these titles exist in the current list):

| Title contains                       | kind          |
|--------------------------------------|---------------|
| "quiz" / "Feedback Task"             | `quiz`        |
| "Viva" / "Interactive Oral"          | `viva`        |
| "presentation"                       | `presentation`|
| everything else                      | `assignment`  |

### 4.4 Retire the standalone deadline store

- `deadline-db.ts`, `deadline-api.ts`, `deadline-api.test.ts`, `deadline-db.test.ts`
  are deleted.
- `migrateDeadlines` / `deadlineApiRoutes` removed from `index.ts`.
- `deadline_completions` table is **left in place** (not dropped) so the seed can
  read historical tick-offs on the first run after deploy. It becomes dead
  afterwards; a later migration can drop it. Document this in the migration
  comment.
- `semester-deadlines.ts` keeps `COURSE_NAMES`, `courseNameFor`, `SEMESTER_DEADLINES`,
  `deadlineId`, `noteFor`, `DEADLINE_NOTES`, `SemesterDeadline`. It loses nothing
  structurally — it just stops being read at request time. (Could be slimmed
  later; keeping it whole minimises this change's blast radius.)

## 5. API

### 5.1 `module-items-api.ts`

- `parseInput` accepts optional `weight`: `typeof b.weight === "string"` →
  trimmed, `""` becomes `undefined`. Max length 12; otherwise `{ error: "weight too long" }`.
- Course validation changes from `course in COURSE_NAMES` to "row exists in
  `modules`". Hidden modules still accept items (hiding is a view filter, not a
  lock). Unknown code → `{ error: "unknown module" }`, 400.
- `moduleItemsApiRoutes(db)` signature unchanged; it gains a `modules` lookup via
  a `moduleExists(db, code)` helper from `modules-db.ts`.
- Response shape gains `weight: string | null`.

### 5.2 New `modules-api.ts` → `moduleApiRoutes(db)`

| Route                     | Method | Body / query                        | Behaviour |
|---------------------------|--------|-------------------------------------|-----------|
| `/api/modules`            | GET    | —                                   | `listModules(db)` — all rows incl. hidden, `ORDER BY sort_order, code` |
| `/api/modules`            | POST   | `{ code, name }`                    | create; 409 on duplicate code, 400 on bad code/empty name |
| `/api/modules/:code`      | PUT    | `{ name }`                          | rename; 404 if missing |
| `/api/modules/:code`      | PATCH  | `{ hidden?: boolean, sort_order?: number }` | partial update; 404 if missing |
| `/api/modules/:code`      | DELETE | `?cascade=1` optional               | 409 `{ error: "module has items", count }` unless `cascade=1`; with cascade, delete its `module_items` (and their calendar events, best-effort) then the module |

Wired in `index.ts`: `migrateModules(db)` before `migrateModuleItems(db)` (seed
order matters), and `...moduleApiRoutes(db)` in the routes object.

## 6. Frontend

### 6.1 Placement

> **Amended during execution (user request):** the planner did **not** go on
> the Home tab. It lives on its own top-level **"Deadlines"** tab in
> `frontend.tsx` (between "Home" and "LeetCode"), rendered by `<ModulePlanner>`
> directly. The deep link is `{ tab: "deadlines", moduleItemId }`, not
> `{ tab: "home", ... }`. `HomeApp` never gained an `openItemId` prop. The
> `exam/App.tsx` changes below still applied. The rest of this section and
> Task 8 in the plan describe the original Home-page approach.

- **`frontend.tsx`**: render the planner on the Home tab. Simplest: add
  `<ModulePlanner .../>` to `HomeApp` (see §6.2) and pass through an
  `openItemId` deep-link prop.
- **`exam/App.tsx`**: remove the `<ModulePlanner openItemId={openItemId} .../>`
  mount at line ~1378 and the `openItemId` / `onOpened` props on `ExamApp`
  (keep `openCourse` / `openWeek`). Remove the `import ModulePlanner`.
- **`frontend.tsx` deep link**: the `module-item` case currently sets
  `{ tab: "exam", moduleItemId }`. Change to `{ tab: "home", moduleItemId }`;
  `setTab("home")` and pass `openItemId` into `<HomeApp>`. Drop the now-unused
  `moduleItemId` branch from the `<ExamApp>` props.
- **`HomeApp.tsx`**: delete `DeadlinesPanel`, the `SEMESTER_DEADLINES` /
  `deadlineId` / `noteFor` / `fallbackDeadlineViews` imports, and the
  `<DeadlinesPanel />` mount at line ~371. Replace with `<ModulePlanner
  openItemId={openItemId} onOpened={...} />` in the same slot (above "Everything
  due"). `SOURCE_LABEL["module-item"]` stays "Deadline".

### 6.2 `ModulePlanner.tsx` — two views + module management

State additions:

```ts
const [viewMode, setViewMode] = useState<"grouped" | "flat">(
  () => (localStorage.getItem("modulePlanner.view") as "grouped" | "flat") ?? "grouped");
const [sort, setSort] = useState<"due-asc" | "due-desc" | "module" | "weight">(
  () => (localStorage.getItem("modulePlanner.sort") as ...) ?? "due-asc");
const [modules, setModules] = useState<Module[]>([]);   // from /api/modules
```

Header row gains:

- A segmented toggle: **Grouped by subject** | **All items**. Writes
  `localStorage["modulePlanner.view"]`.
- When `flat`, a sort `<select>`: *Due date — nearest first* (default),
  *Due date — furthest first*, *Subject*, *Weight*. Writes
  `localStorage["modulePlanner.sort"]`.
- **＋ New module** button → inline form (`code`, `name`) → `POST /api/modules`.

**Grouped view**: current rendering, but the module list comes from `/api/modules`
(visible rows, `sort_order`) instead of `Object.keys(COURSE_NAMES)`. Each module
head gains a pencil (rename → `PUT`) and a × (hide → `PATCH {hidden:true}`).
A "Hidden modules (N) — show" reveal lists hidden rows with **Unhide** and
**Delete** (Delete asks to confirm; if it has items, offer "Delete N items too").

**Flat view**: one `<ul className="board-rows">` of *all* items (visible modules
only), each row identical to today's item row **plus** a `<span className="mp-mod">`
subject tag. Sorting is pure client-side:

- `due-asc` / `due-desc`: by `due_at` string; completed always sorted after
  incomplete; ties broken by `id`.
- `module`: by module `sort_order` then `due_at`.
- `weight`: parse leading integer from `weight` (`null` → -1), descending, then
  `due_at`.

Aging rule (parity with the old panel): hide an item when
`completed === false && due_at date < today − 3d`, or
`completed === true && updated_at < today − 3d`. Applied in both views. Put it in
a `visibleItems` memo shared by both renderers.

`ItemForm` gains an optional **Weight** text input (`placeholder="e.g. 20%"`),
next to Kind. Threaded through `ItemDraft` → `toPayload`.

### 6.3 `AnnouncementsBoard.tsx` — announcement → deadline

- Each non-editing announcement row gains a third button: **＋ Add to deadlines**.
- Clicking it renders, directly under that row, a compact form (not a modal):
  - **Module** `<select>` — from `/api/modules` (visible rows). Required.
  - **Kind** `<select>` — `MODULE_ITEM_KINDS`. Default `assignment`.
  - **Title** `<input>` — pre-filled with the first line / first 80 chars of the
    announcement message. Required.
  - **Due date** `<input type="date">` + optional **Time**. Required.
  - **Weight** `<input>` — optional.
  - **Notes** `<textarea>` — pre-filled with the full announcement message.
- Submit → `POST /api/module-items`. On success: collapse the form, show a
  transient "Added to deadlines ✓" line on the row. The announcement itself is
  **not** modified or deleted (user can tick it off manually as before).
- `AnnouncementsBoard` fetches `/api/modules` once on mount for the select. If it
  fails, the button is disabled with a title explaining why.

### 6.4 CSS (`index.css`)

- `.mp-view-toggle`, `.mp-sort` for the header controls (reuse `.btn` / segmented
  styles already in the sheet).
- `.mp-mod` subject tag in flat rows (mirror `.mp-kind`).
- `.mp-module-head` pencil / × buttons — reuse `.board-row-review` styling from
  the exam week rows.
- Remove `.deadlines-panel` / `.deadlines-summary` / `.deadline-*` rules only if
  unused elsewhere (grep first; `home-api` "goal-deadline" is separate — keep).

## 7. Migration & backfill sequence

On server boot (`index.ts`), in this order:

1. `migrateAnnouncements`, `migrateTodo`, … (unchanged).
2. **`migrateModules(db, localToday())`** — create table, seed 4 core subjects.
3. **`migrateModuleItems(db, localToday())`** — create table (unchanged), add
   `weight` column if missing, create `module_item_seeds`, run the §4.3 seed.
4. `migrateDeadlines` is **removed**; `deadline_completions` remains readable by
   step 3 on the first boot after deploy.
5. `migrateExam`, etc. (unchanged).

Idempotency: re-running boots is a no-op — `INSERT OR IGNORE` for modules,
`seed_key` guard for items, `PRAGMA` guard for the column.

## 8. Testing

### 8.1 Unit / integration (`bun test`)

New / changed:

- **`modules-db.test.ts`** — seed creates exactly the 4 core rows; re-run is a
  no-op; create rejects duplicate/short/empty; rename; hide/unhide; delete guard
  vs cascade.
- **`modules-api.test.ts`** — every route's happy path + 400/404/409 cases;
  `?cascade=1` deletes items.
- **`module-items-db.test.ts`** (extend) — `weight` round-trips (set / update /
  clear); new kinds accepted; the §4.3 seed: fresh DB → 12 items with correct
  kinds/weights; a pre-existing `deadline_completions` row → matching item seeded
  `completed`; deleting a seeded item then re-running migration does **not**
  resurrect it.
- **`module-items-api.test.ts`** (extend) — POST/PUT accept `weight`; unknown
  module → 400; hidden module still accepts items.
- **`AnnouncementsBoard`** — a component test (or api-level) that the
  "Add to deadlines" form posts a well-formed `module_items` payload and leaves
  the announcement untouched.
- **Delete** `deadline-api.test.ts`, `deadline-db.test.ts`.
- **`home-api` tests** — update any fixture that assumed `/api/deadlines`;
  `module-item` due rows already covered.

### 8.2 Type + lint

`bunx tsc --noEmit` clean. `bun scripts/check-mcq-lengths.ts` unaffected (no exam
content touched).

### 8.3 Browser verification (claude-in-chrome, before "done")

1. Home page shows the planner where "Semester deadlines" was; the 12 seeded
   deadlines appear, grouped under the right subjects, with weights.
2. Toggle to **All items** → flat list, nearest-first; change sort → order
   changes; reload → view + sort remembered.
3. Add an item to a module; edit its weight; delete it; tick one off → sinks.
4. **＋ New module** "TEST1 / Test Module" → appears; add an item to it; rename;
   hide → drops out of both views; unhide; delete (with its item) → gone.
5. Announcements: **＋ Add to deadlines** on the "13th September…" row →
   pre-filled form → pick subject + date → save → new item shows in the planner;
   the announcement row is unchanged.
6. Modules tab: exam papers only, no planner, no "paper not found".
7. Google Calendar sync still degrades gracefully (no creds) — `sync_state:
   "error"`, not a crash.

## 9. Automated hooks, continuous testing, autonomous correction

Per the project standard, the following must be in place for this work (add to
the repo's hook config if not already present):

- **Automated hooks** — a `PostToolUse` hook on `Write`/`Edit` fires on every save
  the AI makes under this repo.
- **Continuous testing** — that hook runs the build/transpile check
  (`bunx tsc --noEmit`), the test suite (`bun test`), and (when exam content is
  touched) `bun scripts/check-mcq-lengths.ts`.
- **Autonomous correction** — on a failure the AI sees the output immediately and
  fixes its own change before handing control back, so the user always returns to
  a green state.

## 10. File-by-file change list

| File | Change |
|------|--------|
| `modules-db.ts` | **new** — table, seed, `list/create/rename/setHidden/reorder/delete/moduleExists` |
| `modules-api.ts` | **new** — `moduleApiRoutes(db)` |
| `module-items-db.ts` | `weight` column + field; new kinds; `module_item_seeds` + seed routine; `migrateModuleItems` takes `today` |
| `module-items-api.ts` | accept `weight`; validate course against `modules` |
| `ModulePlanner.tsx` | view toggle, sort control, flat renderer, module CRUD UI, weight field, `/api/modules` fetch |
| `HomeApp.tsx` | drop `DeadlinesPanel` + `SEMESTER_DEADLINES` imports; mount `<ModulePlanner>`; thread `openItemId` |
| `AnnouncementsBoard.tsx` | "＋ Add to deadlines" inline form; `/api/modules` fetch |
| `exam/App.tsx` | remove `ModulePlanner` mount + `openItemId`/`onOpened` props + import |
| `frontend.tsx` | `module-item` deep link → Home tab; pass `openItemId` to `<HomeApp>`; stop passing it to `<ExamApp>` |
| `index.ts` | add `migrateModules` + `moduleApiRoutes`; remove `migrateDeadlines` + `deadlineApiRoutes` |
| `index.css` | `.mp-view-toggle`, `.mp-sort`, `.mp-mod`, module-head buttons; retire unused `.deadline*` |
| `deadline-db.ts`, `deadline-api.ts`, `deadline-*.test.ts` | **delete** |
| `modules-db.test.ts`, `modules-api.test.ts` | **new** |
| `module-items-db.test.ts`, `module-items-api.test.ts` | extend |
| `home-api.test.ts` / fixtures | drop `/api/deadlines` assumptions |

## 11. Follow-ups (not in this change)

- Re-point `~/bin/exam-autogen.sh` deadline scanning at `POST /api/module-items`
  (upsert by `course|title`), then delete `SEMESTER_DEADLINES` from
  `semester-deadlines.ts`.
- A later migration to `DROP TABLE deadline_completions`.
- Optional: drag-to-reorder modules (the `sort_order` column already supports it;
  only the DnD UI is missing).
