# Card redesign + day sidebar, race calendar and month view — design

**Date:** 2026-10-04
**Goal:** implement the six UI issues sketched in
`~/Documents/Vault/Excalidraw/Drawing 2026-10-01 01.41.41.excalidraw.md`
(the "Redesign 1–6" mockups drawn to the right of each issue):

1. Notes (desktop): the day sidebar groups days by month, with counts.
2. Notes (phone): the day-chip row becomes a slide-in day sidebar.
3. Training → Roadmap: pick a year, see that year's competitions — not
   only the 5-year table.
4. Training → Goals: short cards grouped by sport instead of long rows.
5. Home: Announcements and Everything due use the same card design.
6. Training → Schedule: a Week / Month switch, with spreadsheet-style
   month tabs along the bottom.

## Prerequisites

None for issues 1, 2, 4, 5, 6 — they only restyle or regroup data the app
already has.

Issue 3 has one optional prerequisite, owned by the user: a **Races** tab
in the roadmap Google Sheet (see "Race calendar → Data"). Without it the
feature still ships, showing each year's races undated.

## Scope

**This spec:**
- `notes/`: month grouping in the sidebar, note entries as cards, a
  drawer version of the sidebar at ≤640px.
- `training/`: a year-scoped race calendar on the Roadmap tab; Goals as a
  grouped card grid, with a stored `category` per goal.
- `HomeApp.tsx` / `AnnouncementsBoard.tsx`: card grids.
- `shared/weekly-plan/`: a Week / Month range switch and month tabs.
- One shared card style in `index.css`, used by Goals, Home and the race
  calendar.

**Out of scope (explicitly deferred):**
- An "All notes" row and a "Show N more" pager in Notes. Both appear in
  the mockup; the timeline already shows every note for the selected day,
  and an all-days view is a separate feature.
- Restyling Todo, Jobs, Uni or Exam boards. They keep `.board-row` until
  their own redesign; this spec must not change how they look.
- Entering or editing races in-app. `index.ts` drops the `races` table on
  purpose ("a second, hand-copied race list drifted from the source") —
  the sheet stays the single source of truth.
- Per-date training plans. `TRAINING_PLAN` is one repeating 7-day
  template, so Month view repeats that template for every week (see
  "Week / Month switch → Known limitation").
- Numeric modelling of goal values. They stay free text.

## Design principles

Follows `CLAUDE.md` "Code quality standards" — the load-bearing ones here:

- **Open/Closed:** every change adds a pure function or a component next
  to working code (`groupDaysByMonth`, `parseGoalText`, `monthWeeks`,
  `WeekBoardMonth`) instead of rewriting `groupNotesByDay`, `listGoals` or
  `WeeklyPlan.weekOf`.
- **Single Responsibility:** parsing, grouping and date maths live in
  `.ts` modules with tests; components only render what those return.
- **DRY, only for real duplication:** the selected-day detail panel is
  needed by both Week and Month boards, so it is extracted from
  `WeekBoardTable`. The card look is needed in three places, so it becomes
  one class. Nothing else is extracted speculatively.
- **Boundaries validate, internals trust:** the new goal `category` is
  validated in `goals-api.ts` only; sheet rows are normalised in
  `roadmap.ts` only.
- **Notes stays self-contained:** `notes/notes.css` keeps its own tokens
  because the phone capture bundle renders `NotesView` with no app shell.
  Notes must not import `index.css` classes.

## Shared card style

`index.css` gains two classes, built only from existing tokens:

- `.card-grid` — `display: grid; gap: var(--space-3);
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min, 240px), 1fr))`.
- `.card` — `background: var(--panel); border: 1px solid var(--line);
  border-radius` matching `.board`; `padding: var(--space-4)`; column
  flex with `gap: var(--space-3)`. **No coloured left border** — that is
  the look issues 4 and 5 ask to replace. Urgency and category are shown
  by a tag inside the card.
- `.card-actions` — a footer row (`border-top: 1px solid var(--line)`,
  `margin-top: auto`) holding the existing `.btn` buttons at their
  current size (no target under 44px tall on touch widths).

At ≤640px the grid collapses to one column by its own `minmax`; no extra
media query.

## 1. Notes sidebar — days grouped by month

`notes/notes-grouping.ts` gains:

```ts
export interface MonthGroup {
  monthKey: string;   // "2026-10"
  label: string;      // "October 2026"
  noteCount: number;  // sum of its days' notes
  days: DayGroup[];   // unchanged order: newest day first
}
export function groupDaysByMonth(groups: DayGroup[]): MonthGroup[];
```

It takes `groupNotesByDay`'s output, so day bucketing and the
Today / Yesterday labels are untouched. The month label is built from
explicit components (same reason `formatFullDate` avoids locale order).

`NotesSidebar` takes `months: MonthGroup[]` instead of `groups` and
renders, per month, a heading row (`label` + `noteCount`) followed by its
day buttons. `NotesView` computes `months` with `useMemo` beside `groups`.

Note entries become cards: `.notes-entry` gets panel background, border
and radius; the timeline dot is removed. The time line shows the note's
local time (`HH:mm`) from a new `formatNoteTime(id)` built on
`parseNoteTimestamp`, falling back to the raw id when the id does not
parse — today it prints the raw id (`2026-09-30T14-45-12-642Z-x3dn`).

## 2. Notes on a phone — slide-in day sidebar

Replaces the ≤640px "horizontally scrollable chip row" block in
`notes.css`.

- `NotesView` gains `const [daysOpen, setDaysOpen] = useState(false)`.
- A **Days** button (`.notes-days-toggle`, `aria-expanded`,
  `aria-controls`) sits at the start of the timeline header. Hidden above
  640px.
- At ≤640px `.notes-sidebar` is `position: fixed`, full height, width
  `min(300px, 85vw)`, translated off-screen; `.notes-view-days-open` on
  the root slides it in over a scrim (`.notes-scrim`, a `<button>` so a
  tap closes it).
- Selecting a day calls `onSelectDay` then closes the drawer. Escape
  closes it. Focus moves to the first day button on open and back to the
  Days button on close.
- Above 640px nothing changes: `daysOpen` has no visual effect.
- Transition respects `prefers-reduced-motion`.

No new client method, API route or storage. Both desktop and phone get
this for free because they share `NotesView`.

## 3. Race calendar by year

Replaces the roadmap table as the main content of the Roadmap tab; the
table's per-year columns become an "at a glance" panel for the selected
year, so no roadmap information is lost.

### UI

`training/RaceCalendar.tsx`, rendered by `RoadmapLinks`:

- A native `<select>` labelled "Year" listing `data.rows` years. Default
  is the current year (`localToday().slice(0, 4)`) when the sheet has it,
  otherwise the first row.
- A heading: `{year} competitions · {count}`.
- A horizontally scrollable strip (`overflow-x: auto`) of race cards in
  date order. When races have dates they sit under month bands
  ("April", "May", …), as in the user's spreadsheet reference; undated
  races go under a final "Date TBC" band.
- Each card: day + date (`Sat 11/4`), competition name, location, a
  priority tag (`A` / `B`), and — when the sheet marks it — an "entered"
  highlight with the distance (`21km`).
- Beside or below the strip: Main goal, Run targets, Bike target, Phase
  and Age for the selected year, from the existing `RoadmapRow`.
- `data.notes` keeps rendering under it, unchanged.

### Data

Two sources, merged per year by a pure `racesForYear(data, year)`:

1. **Always available — the existing roadmap row.** A new
   `splitARaces(year, aRaces): RaceEntry[]` splits on `·`, trims, and
   lifts a trailing parenthetical into the entry: `(B)` → `priority: "B"`,
   anything else (`(if selected)`, `(if no clash)`) → `note`. The column
   is "A races", so an entry with no marker is priority A. These entries
   have no date.
2. **Optional — a Races tab in the same sheet.** `roadmap.ts` gains
   `ROADMAP_RACES_GID` (empty string until the user creates the tab) and
   `parseRacesCsv(csv): RaceEntry[]` for columns
   `Year, Date, Competition, Location, Priority, Entered`. `Date` is ISO
   `YYYY-MM-DD` or blank; `Entered` is a free-text distance or blank.
   Rows that fail to parse a year are skipped, not thrown.

```ts
export interface RaceEntry {
  year: string;
  name: string;
  date: string | null;      // ISO
  location: string | null;
  priority: "A" | "B" | null;
  entered: string | null;   // e.g. "21km"
  note: string | null;
}
```

When the Races tab has any row for a year, that year uses the tab's rows
only; otherwise it falls back to `splitARaces`. Mixing both for one year
would double-list races.

`GET /api/training/roadmap` returns `{ rows, notes, races }`. If the gid
is empty the races fetch is skipped and `races` is `[]`; if the races
fetch fails but the roadmap fetch succeeds, respond 200 with `races: []`
— a missing optional tab must not blank the page.

`RoadmapLinks.tsx` currently redeclares `RoadmapRow` / `RoadmapData`;
it must import the types from `roadmap.ts` instead (two copies would
drift the moment `races` is added).

### Open question for the user

Create the Races tab and give its gid. Until then only undated cards
show. The 12 dated races in the mockup come from the club sheet
screenshot and are sample content, not data this app has.

## 4. Goals as cards, grouped by sport

### Data model

`goals` keeps its single free-text `text` column (the 2026-09 rebuild to
"one notepad line" stands). One nullable-free addition:

```sql
ALTER TABLE goals ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
```

Guarded in `migrateGoals` by the same `PRAGMA table_info` check already
used there. Right after adding the column, backfill once with
`inferGoalCategory(text)`; rows created later take the category the form
sends.

```ts
export const GOAL_CATEGORIES = ["running", "cycling", "events", "recovery", "other"] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];
export function inferGoalCategory(text: string): GoalCategory;
```

Rules, first match wins, case-insensitive, matched at a word start:
`injury` → recovery; `games|worlds|zofingen` → events;
`run|5k|10k|marathon` → running; `bike|ftp|cycling` → cycling; else
other. Order matters: the seed row "Injury: cycling only … cleared to
run" must land in recovery, and "Powerman Run 2 (10km off the bike)" must
land in running, so running is tested before cycling.

### API

`POST /api/goals` and `PUT /api/goals/:id` accept an optional `category`.
Missing → `inferGoalCategory(text)` on create, unchanged on update. A
value outside `GOAL_CATEGORIES` → 400. `createGoal` / `updateGoal` gain a
`category` parameter; `Goal` gains `category: GoalCategory`.

### Display parsing

`training/goal-text.ts`:

```ts
export interface GoalParts { title: string; current: string; target: string; note: string | null }
export function parseGoalText(text: string): GoalParts | null;
```

Split at the first `": "` into title and rest; split rest on `" → "`.
First segment is `current`, second is `target`, any further segments are
joined into `note`. A trailing parenthetical on `target` moves to `note`
(`1:28 (~280–300W)` → target `1:28`, note `~280–300W`). Fewer than two
`→` segments → `null`, and the card shows the whole text as its title
with no big number. Parsing is display-only; the stored text is never
rewritten.

### UI

`GoalsApp` renders one `.card-grid` per non-empty category, in
`GOAL_CATEGORIES` order, each under a heading with its count. `GoalRow`
becomes `GoalCard`: checkbox + title, target large in `--mono`,
`from {current}` beneath, note in `--dim`, then `.card-actions` with Edit
and Delete. Editing swaps the card for the existing form, which gains a
category `<select>`. The Achieved section keeps its toggle and uses the
same cards.

## 5. Home cards

- `AnnouncementsBoard`: `ul.board-rows` → `ul.card-grid`
  (`--card-min: 320px`). Each announcement is a `.card`: checkbox +
  message, then `.card-actions` with Edit, Delete and "+ Add to
  deadlines". Completed state, the inline edit form and the deadline
  quick form are unchanged in behaviour.
- `HomeApp` Everything due: `ul.board-rows` → `ul.card-grid`. Each item
  is a `.card` whose whole body is the existing `board-row-click` button:
  source tag and "Nd late" / "due" tag on the top line, title, then
  subtitle. The external-link anchor moves into `.card-actions`. Urgency
  is carried by the tag colour (`--urgency`), not a border.
- The three stat tiles are already cards; untouched.

## 6. Week / Month switch on the weekly plan

Lives in `shared/weekly-plan/`, so any future plan gets it.

- `week.ts` gains `monthWeeks(anyDateInMonth: string): string[]` — the
  Monday of every week that overlaps that calendar month — and
  `monthLabel(date)` (`"October 2026"`).
- `WeeklyPlanView` gains `range: "week" | "month"`, persisted under
  `weekly-plan-range` exactly like `weekly-plan-view`, and
  `anchor: string` (a date; defaults to `today`). A second toggle
  (`Week` / `Month`) sits beside Table / Cards. In Month range the
  Table / Cards toggle is hidden — Month is always a grid.
- `components/WeekBoardMonth.tsx`: a table with a week-label column and
  Mon–Sun columns, one row per `monthWeeks(anchor)` entry, each cell
  showing the day number and `focusFor(day)`. Rest days use
  `plan-table-rest`, today uses `plan-table-today`, days outside the
  anchor month are dimmed. Cells are buttons; clicking selects that date.
- `components/PlanDayDetail.tsx`: the selected-day panel currently inline
  at the bottom of `WeekBoardTable`, extracted unchanged and used by both
  boards. `focusFor` moves to `model.ts` for the same reason.
- `components/MonthTabs.tsx`: a horizontally scrollable tab strip under
  the month grid, one tab per month of the anchor's year, the anchor
  month marked `aria-current`. Clicking a tab sets `anchor` to the first
  of that month. This is the spreadsheet-style footer from the sketch.
- The wide table sits in the existing `plan-table-wrap` so it scrolls
  inside its box on a phone instead of widening the page.

### Known limitation

`WeeklyPlan.days` is one repeating week, so every row of Month view shows
the same sessions. That is correct for the current injury block and makes
the view honest about what the app knows; it becomes useful once plans
are dated. `training/App.tsx`'s "Looking further ahead?" note stays.

## Implementation order

Each step is independently shippable and leaves `bun test` and `tsc`
green:

1. Shared `.card` / `.card-grid` CSS.
2. Home cards (pure markup + CSS).
3. Goals: `goal-text.ts`, `category` migration + API, then `GoalCard`.
4. Notes: `groupDaysByMonth` + `formatNoteTime`, sidebar, card entries.
5. Notes drawer.
6. Weekly plan: `monthWeeks`, `PlanDayDetail` extraction,
   `WeekBoardMonth`, `MonthTabs`.
7. Race calendar: `splitARaces`, `racesForYear`, `RaceCalendar`; then
   `parseRacesCsv` behind the empty gid.

## Testing

- `notes/notes-grouping.test.ts`: `groupDaysByMonth` — days from two
  months split into two groups in newest-first order; `noteCount` sums
  correctly; a month boundary at local midnight lands in the right month;
  `formatNoteTime` for a valid id and for an unparseable id.
- `training/goal-text.test.ts`: every row of `GOAL_SEED` — two-segment,
  three-segment (FTP), trailing parenthetical (Powerman Bike), and the
  no-arrow fallback returning `null`.
- `training/goals-db.test.ts`: migrating a pre-`category` table adds the
  column and backfills by inference; running `migrateGoals` twice is a
  no-op; `inferGoalCategory` for the injury, FTP, SEA Games and KL
  Marathon seed rows.
- `training/goals-api.test.ts`: invalid `category` → 400; omitted on
  create → inferred; omitted on update → unchanged.
- `training/roadmap.test.ts`: `splitARaces` on
  `"TriFactor Malaysia · Asia Duathlon Cup · Sydney 10 · SEA Games (if selected)"`
  and `"Cycling TTs (B)"`; `parseRacesCsv` with a blank date and a bad
  year row; `racesForYear` prefers tab rows over `aRaces` and sorts dated
  before undated.
- `shared/weekly-plan/week.test.ts`: `monthWeeks` for a month starting on
  a Monday, one starting mid-week, and February of a non-leap year.
- `shared/weekly-plan/view.test.ts`: `focusFor` still returns "Rest" for
  an empty day after its move.
- No component tests, matching the rest of the app. Verify live in the
  browser at desktop width and at 390px: Notes drawer open/close/Escape,
  Goals grid, Home grids, Month grid scroll, year select.

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
