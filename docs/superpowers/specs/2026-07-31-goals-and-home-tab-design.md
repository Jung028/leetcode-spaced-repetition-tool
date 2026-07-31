# Goals Tracker & Home Dashboard — Design

**Status:** Approved 2026-07-31, ready for planning.

## Overview

Two new tabs added to the existing three-tab app (`LeetCode`, `Theory`):

1. **Goals** — a project/deadline tracker. You create projects (e.g. "Complete
   tracely onboarding"), break each into weighted steps (e.g. "Complete
   signup page — 20%"), and check steps off as you go. Multiple projects can
   be tracked at once, each with its own deadline.
2. **Home** — the new default landing tab. Shows the Google Calendar embed
   (moved here from the LeetCode tab) plus one unified due list merging
   LeetCode reviews, Theory reviews, and Goals steps, so you don't have to
   check three tabs separately. Clicking an item deep-links straight into
   that item's detail/review view in its owning tab.

Build order: **Goals must be built before Home**, since Home's aggregation
query reads from the `project_steps` table.

Tab bar order after this change: **Home → LeetCode → Theory → Goals**. Home
is the tab that opens by default.

---

## Part 1: Goals tab

### Data model

New file `goals-db.ts`, new tables (migrated in the same style as
`theory-db.ts`'s `migrateTheory`):

```sql
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  deadline TEXT NOT NULL,       -- 'YYYY-MM-DD'
  created_at TEXT NOT NULL,     -- 'YYYY-MM-DD', local date project was created
  archived INTEGER NOT NULL DEFAULT 0  -- 0/1, set to 1 when reaching 100%
);

CREATE TABLE IF NOT EXISTS project_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  weight INTEGER NOT NULL,      -- percentage point contribution, e.g. 20
  due_date TEXT NOT NULL,       -- 'YYYY-MM-DD'
  done INTEGER NOT NULL DEFAULT 0,  -- 0/1
  done_at TEXT                  -- 'YYYY-MM-DD', null until done
);
```

### Step due-date assignment

Steps are added one at a time (via "add step" in the project detail view).
Each new step's `due_date` is assigned automatically:

- The **first** step added to a project is due on the project's
  `created_at` date — **unless** that's already in the past by the time you
  add the step (e.g. you create the project, then don't add a first step
  until days later), in which case it's due **today** instead. A step is
  never born already overdue.
- Each **subsequent** step is due the day after the *previous step's*
  `due_date` — **unless** that would land in the past, in which case it's
  due **today** instead (you can't be assigned a step due yesterday).

```ts
function nextStepDueDate(project: { created_at: string }, existingSteps: { due_date: string }[], today: string): string {
  if (existingSteps.length === 0) return project.created_at < today ? today : project.created_at;
  const lastDue = existingSteps.reduce((max, s) => (s.due_date > max ? s.due_date : max), existingSteps[0]!.due_date);
  const candidate = addDays(lastDue, 1);
  return candidate < today ? today : candidate;
}
```

(`addDays` reused from `scheduling.ts`.)

### Overdue behavior

A step whose `due_date < today` and `done = 0` is simply shown as overdue
(red) — no reshuffling of later steps' due dates. Same convention as the
existing LeetCode/Theory due boards.

### Progress calculation

```ts
function projectProgress(steps: { weight: number; done: boolean }[]): number {
  return steps.filter(s => s.done).reduce((sum, s) => sum + s.weight, 0);
}
```

Weights are **not** validated to sum to 100 — the UI shows the sum next to
the step list (e.g. "80% allocated") as a hint, not a hard constraint. When
`projectProgress >= 100`, the project is auto-archived (`archived = 1`) and
drops off the active board.

### API — new file `goals-api.ts`

```
GET  /api/goals                 -> Project[]  (active only, archived=0)
POST /api/goals                 -> body { title, deadline } -> Project
GET  /api/goals/:id             -> ProjectDetail (project + steps[])
POST /api/goals/:id/steps       -> body { label, weight } -> ProjectStep (assigns due_date per above)
POST /api/goals/steps/:stepId/toggle -> ProjectStep (flips done/done_at; recomputes project archived flag)
```

Types:

```ts
export interface Project {
  id: number;
  title: string;
  deadline: string;
  created_at: string;
  archived: boolean;
}
export interface ProjectStep {
  id: number;
  project_id: number;
  label: string;
  weight: number;
  due_date: string;
  done: boolean;
  done_at: string | null;
}
export interface ProjectDetail extends Project {
  steps: ProjectStep[];
  progress: number; // 0-100, sum of done weights
}
```

### UI — new file `GoalsApp.tsx`

- **Board view:** list of active projects — title, progress % (simple bar),
  deadline with days-remaining, and the next undone step's label/due date.
  "+ New project" opens an inline form (title + deadline date picker).
- **Detail view:** project title, deadline, full step list (label, weight,
  due date, done checkbox — click toggles via the API), "+ Add step" inline
  form (label + weight). Overdue steps rendered in red, same visual language
  as the LeetCode/Theory boards (`--urgency` CSS var pattern already in
  `index.css`).

---

## Part 2: Home tab

### Aggregation API — new file `home-api.ts`

```
GET /api/home/due -> DueItem[]
```

```ts
export type DueSource = "leetcode" | "theory" | "goals";

export interface DueItem {
  source: DueSource;
  id: number;            // problem id / concept_day / step id — unique WITHIN its source only
  title: string;         // problem title / concept question / step label
  subtitle: string;      // language / category / project title
  dueDate: string;
  overdueDays: number;   // 0 if due today, positive if overdue
  linkId: number;        // id to deep-link with (problem id / concept_day / project_id for goals)
}
```

`id` is only unique within a single `source` (a LeetCode problem id, a
Theory `concept_day`, and a Goals step id can all legitimately be `3` at the
same time). Frontend list rendering must key rows on `` `${item.source}-${item.id}` ``,
never `id` alone.

`overdueDays` is computed server-side with plain date-string arithmetic
(same approach as `TheoryApp.tsx`'s local `daysBetween`, reimplemented here
since that helper isn't exported):

```ts
function overdueDays(dueDate: string, today: string): number {
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(dueDate)) / 86_400_000));
}
```

Server-side, `home-api.ts` composes existing query functions rather than
duplicating filtering logic:

- LeetCode: `listProblems(db)` filtered with `isDue(p.next_review, today)`
  from `scheduling.ts` (no change to `db.ts`/`api.ts` — the existing
  `/api/problems` endpoint is untouched, this is a new server-side filter
  local to `home-api.ts`).
- Theory: `listDueTheory(db, today)` (existing, `theory-db.ts`), resolved to
  question/category via `SCHEDULE[concept_day - 1]` from `theory-content.ts`
  — the same lookup `TheoryApp.tsx` already does. (The Deep Dive feature
  discussed earlier in this session, which would add ad-hoc
  `question`/`category` columns to `theory_schedule`, is out of scope here —
  see "Out of scope" below. This plan only reads the schema as it exists
  today.)
- Goals: new query in `goals-db.ts`, `listDueSteps(db, today)` — steps with
  `due_date <= today AND done = 0`, joined to their project for the
  `subtitle` (project title) and `linkId` (project_id).

All three lists are merged and sorted by `dueDate` ascending (overdue items
first, since their `dueDate` is earliest).

### UI — new file `HomeApp.tsx`

- Google Calendar iframe, moved verbatim from `LeetCodeApp` (the
  `GoogleCalendarEmbed`-equivalent block around `frontend.tsx:258-298`) —
  removed from the LeetCode tab.
- Below it, the unified due list: each row shows a source tag (color-coded,
  reusing the category-tag visual pattern), title, subtitle, and
  due/overdue label. Empty state: "Nothing due — you're all caught up."

### Deep-link navigation

`frontend.tsx`'s top-level `App` component gains a small piece of shared
state:

```ts
type DeepLink = { tab: "leetcode"; problemId: number }
  | { tab: "theory"; conceptDay: number }
  | { tab: "goals"; projectId: number };

const [tab, setTab] = useState<Tab>("home");
const [deepLink, setDeepLink] = useState<DeepLink | null>(null);
```

`HomeApp` receives an `onNavigate(item: DueItem)` prop that builds the
appropriate `DeepLink` from `item.source` + `item.linkId`, calls
`setTab(link.tab)` and `setDeepLink(link)`.

Each of `LeetCodeApp`, `TheoryApp`, `GoalsApp` accepts an optional prop
(`openProblemId` / `openConceptDay` / `openProjectId`) plus an `onOpened()`
callback. A `useEffect` on that prop, when set, sets the component's
internal `view` state directly to the matching detail view, then calls
`onOpened()` so `App` clears `deepLink` back to `null` (a one-shot signal,
not a controlled/persistent prop — re-clicking the same Home item after
navigating away still needs to re-trigger the effect).

`Tab` type changes from `"leetcode" | "theory"` to
`"home" | "leetcode" | "theory" | "goals"`.

---

## Wiring into `index.ts`

`index.ts` currently does, per domain:

```ts
migrateTheory(db, localToday());
...
...theoryApiRoutes(db),
```

The same pattern is added for both new domains:

```ts
migrateGoals(db);                    // goals-db.ts — creates projects/project_steps tables (no seed data, unlike migrateTheory — Goals starts empty, so no `today` param needed)
...
...goalsApiRoutes(db),               // goals-api.ts
...homeApiRoutes(db),                // home-api.ts — no migration of its own, reads existing tables
```

`home-api.ts` has no migration function — it only queries tables owned by
the other three domains, so it must be wired in *after* `migrateTheory` and
`migrateGoals` have run.

## Testing

- `goals-db.test.ts`: step due-date assignment (first step, subsequent
  steps, subsequent step landing in the past clamps to today), progress
  calculation, archive-on-100%.
- `goals-api.test.ts`: CRUD routes against an in-memory db, same pattern as
  `theory-api.test.ts`.
- `home-api.test.ts`: aggregation merges and sorts all three sources
  correctly given seeded fixtures in each domain's table (requires calling
  `migrateTheory` and `migrateGoals` in test setup, same as `theory-api.test.ts`
  does for its own domain), and the `overdueDays` formula (0 when due today,
  positive when overdue, using `addDays`-shifted fixture dates rather than
  wall-clock `Date.now()` so the test is deterministic).
- No automated test for the deep-link `useEffect` wiring (React interaction,
  not pure logic) — verify manually by clicking a Home item from each of the
  three sources and confirming it lands on the right detail view.

## Out of scope

- The Deep Dive / Obsidian-integration design (Theory tab) discussed
  earlier in this session is a separate, independent feature with its own
  spec to be written later — not part of this plan.
- Editing/deleting projects or steps after creation.
- Notifications/reminders beyond the existing Google Calendar quick-add
  pattern.
