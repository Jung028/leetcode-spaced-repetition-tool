# Training: Goals + Races Calendar — design

**Date:** 2026-09-27
**Goal:** add two new, DB-backed, self-serve pages to the Training area —
**Goals** (PB / target tracking: current value vs. target value, e.g.
"10km run: 40:00 → 33:30") and **Races Calendar** (a sorted list of races,
each optionally supporting one or more goals). Both are editable in-app
through forms, the same way Todo and Jobs already work — no code changes
needed to record a new PB or add a race.

This is Part B of the 2026-09-27 nav-redesign work. Part A (already shipped:
`Uni` and `Jobs` NavGroup dropdowns in `frontend.tsx`, the Todo Enter-key
fix, and the new `Uni → Calendar` tab) is prior art this spec reuses, not
something this plan redoes.

## Scope

**This spec:** two new SQLite-backed feature modules (`goals`, `races`)
under `training/`, their REST APIs, two new board-style UI pages, and
folding the existing `training` tab plus these two new ones into a
`Training` NavGroup (the same reusable dropdown component built in Part A).
One-time seed data drawn from the only source document that exists today,
`~/Desktop/USYD/Personal/Training/powerman-classic-plan.md`.

**Out of scope (future — see `project_feature_queue_2026_09.md` item 2):**
qualification logic (which race counts toward SEA Games selection, T100
Singapore, etc.), Google Sheet import of the running plan/competitions
list, Home "Everything due" integration for goal deadlines, numeric/unit
modeling of goal values (see Data model below for why), a month-grid
calendar view.

## Design principles

Follows `CLAUDE.md` "Code quality standards" — the load-bearing ones here:

- **Consistency over novelty:** `goals` and `races` are structured exactly
  like the existing `todo` module (`db.ts` + `api.ts` + `App.tsx`,
  boundary validation in the API layer, free-text fields where a stricter
  type would add complexity with no payoff). A reviewer who knows
  `todo/` already knows this code.
- **Single Responsibility:** `goals` and `races` are two separate modules
  (separate tables, separate db/api files, separate UI components) even
  though a goal can reference a race — they are different concepts with
  different lifecycles (a race is a date; a goal is a metric).
- **Boundaries validate, internals trust:** required-field checks live in
  the two `*-api.ts` files only, matching `todoApiRoutes`. The UI trusts
  what the API returns.
- **YAGNI:** goal values (`current_value`, `target_value`) are free text,
  not numbers-with-units. Nothing in this feature computes or converts
  them — only compares them visually (current → target) — so a numeric
  schema would be pure ceremony. Races Calendar is a sorted list, not a
  calendar grid (see "Races Calendar page" below for why).

## Data model

Two new tables, migrated in their own `migrate*` functions the same way
`migrateTodo` is, called from `index.ts`.

```sql
CREATE TABLE IF NOT EXISTS races (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  discipline TEXT,
  location TEXT,
  date TEXT,          -- ISO 'YYYY-MM-DD', nullable
  approx_year INTEGER, -- set instead of `date` when only the year is known
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS races_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  current_value TEXT NOT NULL,
  target_value TEXT NOT NULL,
  target_date TEXT,      -- ISO date, nullable
  race_id INTEGER,        -- deliberately no REFERENCES races(id): this db enables
                           -- foreign_keys, so a FK here would turn "delete a race
                           -- that still has linked goals" into a 500 instead of an
                           -- orphaned race_id the UI already tolerates
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goals_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

`current_value` / `target_value` are free text (`"17:36"`, `"~215–230W
(est.)"`) because the goals in play are times and power figures, not a
single unit family, and nothing in this feature needs to do arithmetic on
them — it only displays current vs. target side by side. Forcing a
numeric+unit column would need a conversion layer this feature has no use
for.

A race can have zero or more goals pointing at it via `race_id`; a goal
does not require a race (a standalone "5k PB" goal with no target race is
valid — `race_id` is nullable).

Sorting `races` by "soonest first" mixes two kinds of date (`date` exact,
`approx_year` a bare year) — done in JS in `listRaces`, not SQL: races with
a `date` sort by that date ascending; races with only `approx_year` sort
after all dated races, by year ascending. Mixing exact and year-only sort
keys in one SQL `ORDER BY` expression is more fragile than a ten-line JS
comparator, for no performance reason at this table's size.

## API

Two REST modules, following `todo/api.ts`'s exact shape (see that file for
the reference pattern this copies):

- `training/races-db.ts`: `migrateRaces(db)`, `seedRacesOnce(db, rows)`,
  `createRace`, `listRaces`, `updateRace`, `deleteRace`.
- `training/races-api.ts`: `racesApiRoutes(db)` →
  - `GET /api/races` — list, sorted per above
  - `POST /api/races` — body `{ name, discipline?, location?, date?,
    approxYear?, notes? }`; 400 if `name` is missing/blank
  - `PUT /api/races/:id` — same body shape; 404 if the id doesn't exist
  - `DELETE /api/races/:id` — 404 if the id doesn't exist
- `training/goals-db.ts`: `migrateGoals(db)`, `seedGoalsOnce(db, rows)`,
  `createGoal`, `listGoals`, `updateGoal`, `deleteGoal`.
- `training/goals-api.ts`: `goalsApiRoutes(db)` →
  - `GET /api/goals` — list, ordered by `created_at, id` (creation order —
    there's no natural sort key like a race's date)
  - `POST /api/goals` — body `{ title, currentValue, targetValue,
    targetDate?, raceId?, notes? }`; 400 if `title`, `currentValue`, or
    `targetValue` is missing/blank
  - `PUT /api/goals/:id` — same body shape; 404 if the id doesn't exist
  - `DELETE /api/goals/:id` — 404 if the id doesn't exist

`seedRacesOnce` / `seedGoalsOnce` follow `jobs/db.ts`'s `seedJobsOnce`
pattern exactly: a `*_meta` table with a `seeded` key guards against
re-inserting on every server restart.

`index.ts` gains: two `migrate*` calls, `seedRacesOnce`/`seedGoalsOnce`
calls (races seeded before goals, since two seeded goals reference seeded
race ids), and both route objects spread into `Bun.serve`'s `routes`.

## Seed data

One-time, drawn entirely from
`~/Desktop/USYD/Personal/Training/powerman-classic-plan.md` — the only
document at that path today. Nothing here is invented; every value is
copied from that file's "honest math" table and target-race statement.

Races (both `date: null`, since the source only states a year):
1. `{ name: "Powerman Classic — rehearsal", discipline: "10km run / 60km bike / 10km run", approxYear: 2027 }`
2. `{ name: "Powerman Classic — target attempt", discipline: "10km run / 60km bike / 10km run", approxYear: 2028 }`

Goals (the first three `raceId`-linked to race #2 above; the fourth
standalone):
1. `{ title: "Run 1 (10km)", currentValue: "40:00", targetValue: "33:30" }`
2. `{ title: "Bike (60km)", currentValue: "1:45", targetValue: "1:28" }`
3. `{ title: "Run 2 (10km)", currentValue: "44:00+", targetValue: "35:00" }`
4. `{ title: "FTP (bike power)", currentValue: "~215–230W (est.)", targetValue: "280–300W" }` — no `raceId`; it's a supporting fitness metric, not a leg time.

## UI

- `training/GoalsApp.tsx` — a board of goal cards (title, current → target,
  optional target date, and — when `raceId` is set — a small "supports:
  <race name>" tag resolved client-side from the already-fetched races
  list, no extra endpoint) plus a `+ Add goal` form and per-card
  edit/delete. Same shape as `TodoBoard` / `NewTodoForm` / `EditTodoForm`
  in `todo/App.tsx`.
- `training/RacesCalendar.tsx` — a sorted list of race cards (name,
  discipline, location, and either the real date or "Year: 2027 (date
  TBD)") plus a `+ Add race` form and per-card edit/delete. Same board
  pattern.
- **Races Calendar page is a sorted list, not a month grid.** A grid needs
  real per-day dates to place events on; today's races are year-only, and
  even once dated there will only ever be a handful (this isn't a
  general-purpose calendar — it's a short list of goal-relevant races).
  A grid would render mostly empty for real payoff of zero; the list reads
  identically whether a race has an exact date or just a year.
- **Nav** (`frontend.tsx`): the plain `training` top-level tab button is
  replaced with a third `NavGroup` — `"Training" ▾"` → Schedule (existing
  `training` tab, unchanged), Goals (new `goals` tab), Races Calendar (new
  `races` tab) — reusing the `NavGroup` component built in Part A
  (`Uni`/`Jobs`). `Tab` gains `"goals" | "races"`. No changes to
  `shared/weekly-plan/` or the existing `training/plan.ts` schedule.

## Testing

- `training/races-db.test.ts` / `training/goals-db.test.ts` — CRUD, the
  mixed dated/year-only sort order in `listRaces`, and the seed-once guard
  (`seed*Once` called twice only inserts once).
- `training/races-api.test.ts` / `training/goals-api.test.ts` — boundary
  validation (missing required field → 400) and 404s on unknown ids,
  mirroring `todo/api.test.ts`.
- No component-level tests for `GoalsApp.tsx` / `RacesCalendar.tsx` — this
  app has none for `TodoBoard`/`JobsApp` either. Verified live in the
  browser instead, per this project's standing UI-verification rule.

## Continuous testing

- **Automated Hooks**: a hook fires every time the AI saves a change
  (PostToolUse on Write/Edit).
- **Continuous Testing**: that hook triggers the build step, the test
  suite (`bun test`), and the type checker (`tsc`).
- **Autonomous Correction**: if a test fails, the AI sees the failure
  output immediately and attempts to fix its own mistake before the user
  has to intervene, so the user always returns to a green (passing)
  state.

The PostToolUse hook is configured repo-wide in `.claude/settings.json`
(runs `bun test` and `tsc --noEmit`); this section documents the
requirement rather than adding a feature-specific hook.
