# Weekly Plan template + Training tab — design

**Date:** 2026-09-27
**Goal:** add a **Training** tab that shows this week's training schedule
(Mon–Sun, sets and rest splits, today highlighted), built on a **reusable
Weekly Plan template** so any other "same thing every week" plan (study
timetable, interview-practice rotation, job-hunt routine, meal plan) is a
new data file plus one tab entry, with no new UI code.

Training is the first consumer. The template is the product.

## Scope

**v1 (this spec):** read-only. Static plan data in TypeScript, a generic
view, one Training tab.

**Out of scope (future, see end):** ticking sessions done, Home "Everything
due" integration, multi-week phases (e.g. recovery every 4th week), editing
in the UI, Garmin import.

## Design principles

Follows `CLAUDE.md` "Code quality standards". The load-bearing ones here:

- **Open/Closed:** a new plan type never edits `shared/weekly-plan/`. It adds
  a data file, a category set and (optionally) a metrics calculator.
- **Single Responsibility:** date maths, plan model, metrics, and rendering
  are separate modules.
- **Dependency Inversion:** the view depends on the `WeeklyPlan` interface,
  never on training types. Nothing in `shared/weekly-plan/` imports from
  `training/`.
- **Interface Segregation:** components take the narrow slice they render
  (a `PlanDay`, a `ReferencePanel`), not the whole plan.
- **Liskov:** every plan-specific item type extends `PlanItem` and is
  renderable by the generic `DayCard` / `WeekBoardTable` with no casts or
  special cases.

## Architecture

```
shared/weekly-plan/
  week.ts            pure date helpers (no plan knowledge)
  model.ts           types + WeeklyPlan class
  metrics.ts         MetricsCalculator interface + generic calculators
  define.ts          definePlan() factory: validates data once, at the boundary
  WeeklyPlanView.tsx generic UI: stat row, context banner, a table/cards view
                     toggle (remembered per-browser), reference panels
  components/        StatRow, ContextBanner, WeekBoardTable, WeekBoardCards,
                     DayCard (used by WeekBoardCards), ReferencePanel
  weekly-plan.css    styles, built on index.css tokens (.stats/.board/.tag)
  *.test.ts

training/
  plan.ts            TRAINING_PLAN = definePlan({...}) — data only
  metrics.ts         TrainingMetrics implements MetricsCalculator
  plan.test.ts       data sanity (7 days, Monday first, totals)
```

### `week.ts` — pure date helpers

All dates are `YYYY-MM-DD` strings, local calendar days (repo convention;
reuse `addDays` / `localToday` from `shared/scheduling.ts`, don't duplicate).

- `weekdayOf(date): Weekday` (`"Mon"`…`"Sun"`)
- `mondayOf(date): string` — the week starts Monday
- `datesOfWeek(monday): string[]` — 7 dates

### `model.ts` — the domain

```ts
type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

interface PlanStep { label: string; detail: string }        // "Main set" · "5×6' @ 4:00/km, 90\" jog"

interface PlanItem {                                         // one session / block / slot
  title: string;
  category: string;                                          // key into the plan's categories
  time?: string;                                             // "18:00", "Flexible"
  steps: PlanStep[];
  note?: string;                                             // "+ strength session"
}

interface PlanDay<TItem extends PlanItem = PlanItem> {
  day: Weekday;
  items: TItem[];                                            // 0..n per day (a rest day may be empty)
}

interface CategoryStyle { label: string; colorToken: string } // "--green", "--accent"…

interface ReferencePanel { title: string; badge?: string; rows: PlanStep[] } // pace guide, strength routine

interface PlanContext { heading: string; dates?: string; lines: string[] }   // "Phase 0 · Engine build"

interface Stat { value: string; label: string }
```

`WeeklyPlan<TItem>` is a class (it has behaviour, so it earns one):

```ts
class WeeklyPlan<TItem extends PlanItem = PlanItem> {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly days: PlanDay<TItem>[],
    readonly categories: Record<string, CategoryStyle>,
    readonly metrics: MetricsCalculator<TItem>,
    readonly context?: PlanContext,
    readonly panels: ReferencePanel[] = [],
  ) {}

  dayFor(date: string): PlanDay<TItem> | undefined
  weekOf(date: string): { date: string; day: PlanDay<TItem>; isToday: boolean }[]
  stats(today: string): Stat[]          // delegates to this.metrics
}
```

### `metrics.ts` — Strategy for the stat row

```ts
interface MetricsCalculator<TItem extends PlanItem> {
  stats(plan: WeeklyPlan<TItem>, today: string): Stat[];
}
```

Generic calculators any plan can use without writing code:

- `CountByCategory` — "3 Run · 2 Bike · 1 Rest"
- `TodaySummary` — today's first item's category label
- `CompositeMetrics(...calculators)` — concatenates stats (Composite pattern)

A plan with domain numbers adds its own calculator (see Training). The view
never computes a stat itself.

### `define.ts` — boundary validation

`definePlan(input)` returns a `WeeklyPlan` and throws with a clear message if:
days aren't exactly Mon→Sun once each; an item's `category` isn't in
`categories`; a `colorToken` doesn't start with `--`. Validate here only
("Boundaries validate, internals trust").

### UI — `WeeklyPlanView`

Props: `{ plan: WeeklyPlan; today?: string }` (`today` injectable for tests;
defaults to `localToday()`).

Top to bottom:

1. **StatRow** — `plan.stats(today)`, rendered with existing `.stats/.stat`.
2. **ContextBanner** — `plan.context` if present (accent left border).
3. **A view toggle** — "Table" / "Cards" pill buttons. Choice is kept in
   component state, seeded from and written back to `localStorage`
   (`weekly-plan-view`, per-browser convenience only, wrapped in try/catch
   like the existing `ThemeToggle` in `frontend.tsx`), defaulting to
   `"table"`. Switching it swaps which of the two week renderers below is
   shown; both read the same `plan.weekOf(today)` data.
4. **WeekBoardTable** (default) — a real `<table>`: header row of the 7
   weekday + short-date columns (today's column gets an accent
   highlight); a "Focus" row summarising each day (its items' category
   labels joined with " / ", or "Rest"); a details row with each day's
   items (time, title, steps as a small list). An empty day's column is
   greyed out. Modelled on the user's existing spreadsheet training plan.
5. **WeekBoardCards** (alternate) — the original design: a responsive grid
   of 7 **DayCard**s, one per day. Today's card gets an accent border +
   `.tag` "today". Each card: weekday + short date, category pill (colour
   from `CategoryStyle.colorToken`), time, title, steps as a `<dl>`
   (label / detail), optional note. An empty day shows "Rest".
6. **ReferencePanel**s — each `plan.panels` entry as a small `<dl>` card,
   side by side on wide screens.

Both week renderers are generic over `PlanItem` — neither hard-codes
training-specific phases (no fixed "Warm Up / Session / Cool Down" rows);
they render whatever `steps` each item carries, so a study timetable or
job-hunt routine renders through either view unchanged.

Light/dark via existing tokens only; no hard-coded colours. Mobile: the
table scrolls horizontally inside its own wrapper (`overflow-x: auto`) so
it never widens the page; the card grid stacks to one column.

### Tab wiring (`frontend.tsx`)

Follow the Jobs tab pattern: `React.lazy` import, add `"training"` to `Tab`,
a TabBar button, and a `<Suspense>` render. The Training tab renders
`<WeeklyPlanView plan={TRAINING_PLAN} />`.

Adding another plan later = another lazy tab rendering
`<WeeklyPlanView plan={STUDY_PLAN} />`. If more than two plan tabs appear,
introduce a `PLAN_TABS` registry array and generate the buttons/renders from
it (don't build the registry before it's needed).

No server route and no DB in v1: plans are bundled data.

## Training plan (first consumer)

`training/plan.ts` categories:

| key | label | colorToken |
|---|---|---|
| `run` | Run | `--green` |
| `bike` | Bike | `--accent` |
| `brick` | Bike + run | `--gold` |
| `easy` | Easy | `--dim` |
| `strength` | Strength | `--red` |

`TrainingItem extends PlanItem` adds `hours: number` and `runKm: number`.
`TrainingMetrics` = `CompositeMetrics(hours this week, run km, strength
sessions count, TodaySummary)`. Hours = sum of item hours (strength items
carry 0.5 h each).

Context: "Phase 0 · Engine build", "Oct 2026 – Feb 2027", lines: "Build bike
volume and aerobic base. 80% of time easy." / "Next: Gate 1 · Mar 2027: FTP
250 W or more, 5k under 17:00".

Week data (Phase 0 standard week):

| Day | Time | Category | Title | Steps (label: detail) | h | run km |
|---|---|---|---|---|---|---|
| Mon | 18:00 | run | VO2 run (coach's session) | Warm-up: 15' easy + drills + 4×100m strides (30" rest) · Main set: 2 sets of 1000/800/600m @ 5k pace (3:30 / 2:48 / 2:06) · Recovery: 90" jog between reps, 3' between sets · Cool-down: 15' easy + stretch/roll | 1.1 | 12 |
| Tue | 06:00 | bike | SUVelo Hills ride | Ride: Base bunch, ~30 km (Centennial Park or Mosman) · Effort: climb seated and steady, don't chase attacks | 1.25 | 0 |
| Tue | PM | strength | Strength · 30' | see Strength panel | 0.5 | 0 |
| Wed | 18:00 | run | Threshold run (coach's session) | Warm-up: 15' easy + drills + 4×100m strides · Main set: 5×6' @ 4:00–4:05/km · Recovery: 90" jog · Cool-down: 15' easy + stretch/roll | 1.2 | 13 |
| Thu | Flexible | brick | Sweet spot + run off the bike | Warm-up: 15' easy spin, 3×1' fast cadence · Main set: 3×15' @ 88–93% FTP, 5' easy between · Off the bike: straight into 15' easy run · Test weeks: swap main set for 20' FTP test (FTP = avg × 0.95) | 1.5 | 3 |
| Thu | PM | strength | Strength · 30' | see Strength panel | 0.5 | 0 |
| Fri | 06:00 | easy | SUVelo Coffee Ride or rest | Ride: Eastern Suburbs, Base, 28 km, no-drop · Effort: easy only, skip if tired · After: 10' mobility | 1 | 0 |
| Sat | 05:55 | bike | SUVelo South Long Haul | Ride: Civilised bunch, turn at Waterfall (~90 km); first Saturday of the month = north ride · Fuel: 60 g carbs/h, 500–750 ml/h · Build: extend to Royal National Park (110 km) by Dec–Jan | 3 | 0 |
| Sun | Morning | run | Long run | Run: 75–90' easy @ 4:50–5:15/km · Finish: 6×20" strides, walk-back rest | 1.3 | 15 |

Panels:

- **Strength · 30'** (badge "Tue + Thu"): Back squat 3×8, rest 90" · Romanian
  deadlift 3×8, rest 90" · Bulgarian split squat 3×8 each leg, rest 60" ·
  Single-leg calf raise 3×15 each, rest 45" · Plank / side plank 3×40" /
  2×30" each, rest 30".
- **Pace guide** (badge "5k 17:36 · 10k 38:46"): Easy 4:50–5:15/km, can talk
  · Threshold 4:00–4:05/km, comfortably hard · 5k pace ~3:30/km, hard and
  controlled · Strides: fast and relaxed, not a sprint.

## Proof of reuse (must hold before merging)

Write a second, tiny plan **in a test only** (`shared/weekly-plan/reuse.test.ts`),
e.g. a study timetable with categories `lecture` / `revision` / `off` and
`CountByCategory` metrics. It must render through `WeeklyPlanView` with zero
changes to `shared/weekly-plan/`. If it needs a change there, the abstraction
is wrong: fix the abstraction, not the test.

## Tests

- `shared/weekly-plan/week.test.ts` — `weekdayOf("2026-09-28") = "Mon"`,
  `mondayOf("2026-10-04") = "2026-09-28"`, `datesOfWeek` returns 7
  consecutive dates.
- `shared/weekly-plan/model.test.ts` — `dayFor`, `weekOf` marks exactly one
  `isToday` inside the week and none outside it, `stats` delegates to the
  calculator.
- `shared/weekly-plan/define.test.ts` — rejects missing/duplicate/out-of-order
  days and unknown categories.
- `shared/weekly-plan/metrics.test.ts` — `CountByCategory`, `TodaySummary`,
  `CompositeMetrics`.
- `shared/weekly-plan/reuse.test.ts` — the second plan above.
- `training/plan.test.ts` — Training data passes `definePlan`; totals are
  ~11.4 h and 43 run km.

A prototype of the Training data + helpers was built and passed `bun test`
and `bun build` on 2026-09-27, then removed so this spec drives the real
build.

## Continuous testing

Same as the Jobs tab spec: after every change run `bun test` and
`bunx tsc --noEmit`; fix failures before moving on.

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
requirement rather than adding a plan-specific hook.

## Future (not v1)

- **Done ticks + Home:** `plan_progress` table (`plan_id`, `date`,
  `item_index`, `done_at`); a `DueSource = "plan"` in `home-api.ts` feeding
  today's items to "Everything due" and done ticks to "Completed today".
- **Phases / week variants:** `PlanSchedule` holds several `WeeklyPlan`s and
  a `WeekSelector` strategy picks one by date (e.g. every 4th week = recovery
  week at 60% volume, or Phase 1 from Mar 2027).
- **Garmin:** import completed activities to compare planned vs done.
- **Editing in the UI:** move plan data from TS into the DB once plans
  change more than monthly.
