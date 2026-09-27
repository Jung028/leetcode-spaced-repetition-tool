# Weekly Plan Template + Training Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only **Training** tab that shows this week's training
schedule (Mon–Sun, today highlighted, a table view and a card view the
viewer can toggle between), built on a reusable **Weekly Plan template**
under `shared/weekly-plan/` so a second plan type (e.g. a study timetable)
is just a data file plus one tab entry, with zero changes to the template.

**Architecture:** A pure-data domain (`WeeklyPlan` class + `PlanItem`/`PlanDay`
types) is validated once at construction time by `definePlan()`. Stats are
computed by an injected `MetricsCalculator` (Strategy pattern; generic
calculators plus a Composite). A generic `WeeklyPlanView` renders any
`WeeklyPlan` two ways — a spreadsheet-style table and a day-card grid — via
a local toggle, with neither renderer touching plan-specific fields. The
Training data (`training/plan.ts`) is the first, and only v1, consumer.

**Tech Stack:** Bun, TypeScript (strict), React 19, `bun:test`, plain CSS on
existing `index.css` tokens. No new server route or database table — v1
plans are bundled static data.

**Spec:** `docs/superpowers/specs/2026-09-27-weekly-plan-template-design.md`
(read both; this plan implements it, including the "both views" amendment
made to that spec's UI section during this planning session).

## Global Constraints

- Bun only — `bun test`, `bunx tsc --noEmit`, no npm/webpack/vite/jest tooling.
- `.claude/settings.json` already runs `bun test` and `bunx tsc --noEmit` as a
  PostToolUse hook on every Write/Edit — watch its output after each step and
  fix red immediately; don't wait for a manual run.
- No server route, no DB migration, no new dependency in v1 — plans are
  bundled TypeScript data (`shared/scheduling.ts`'s `localToday`/`addDays`
  are reused, never duplicated).
- Nothing in `shared/weekly-plan/` may import from `training/` (Dependency
  Inversion) or be edited to fit Training's specific fields (Open/Closed) —
  if a change there is needed to support Training, the abstraction is wrong.
- CSS uses only existing `index.css` custom properties (`--accent`, `--green`,
  `--gold`, `--dim`, `--red`, `--panel`, `--line`, `--text-*`, `--space-*`,
  `--mono`) — no hard-coded colors. No horizontal scroll on the page at
  phone width (the table gets its own scroll container instead).
- Test files use flat `test()` calls from `bun:test` (no `describe` blocks),
  matching every existing `*.test.ts` in this repo.
- Follow `CLAUDE.md`'s "Code quality standards": small single-purpose files,
  narrow component props (Interface Segregation), boundaries validate/
  internals trust, no dead code, no defensive checks for states `definePlan`
  already rules out.

## Review Focus

- A day with an empty item list must render as "Rest" (card view, table
  view, and `CountByCategory`'s count) — never `undefined` or a blank cell.
- `today` landing exactly on a day with no items must not crash `TodaySummary`
  or leave the table's "today" column unmarked.
- An item referencing a `category` key that isn't in the plan's `categories`
  map must be rejected at `definePlan()`, not rendered as `undefined` in the
  UI later.
- A `colorToken` that doesn't start with `--` (e.g. a raw hex value pasted
  by mistake) must be rejected at `definePlan()`, not silently produce a
  broken `var(...)` in a component's inline style.
- A week that crosses a month or year boundary (e.g. late December) must
  still produce 7 real, consecutive calendar dates from `mondayOf`/
  `datesOfWeek` — no wraparound bugs from string-based date arithmetic.

---

## Task 1: `week.ts` — pure date helpers

**Files:**
- Create: `shared/weekly-plan/week.ts`
- Test: `shared/weekly-plan/week.test.ts`

**Interfaces:**
- Consumes: `addDays(date: string, days: number): string` from
  `shared/scheduling.ts` (already exists — do not reimplement).
- Produces: `type Weekday = "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun"`,
  `weekdayOf(date: string): Weekday`, `mondayOf(date: string): string`,
  `datesOfWeek(monday: string): string[]` (7 entries) — used by Task 2's
  `WeeklyPlan` class — and `shortDate(date: string): string` (e.g.
  `"2026-09-28"` → `"28 Sep"`), used by every date-rendering component in
  Task 5. `shortDate` is a pure formatting helper with no plan knowledge,
  so it lives alongside the other date helpers rather than being redefined
  per component (three near-identical copies would be a DRY violation the
  task review would flag).

- [ ] **Step 1: Write the failing test**

```ts
// shared/weekly-plan/week.test.ts
import { test, expect } from "bun:test";
import { weekdayOf, mondayOf, datesOfWeek, shortDate } from "./week";

test("weekdayOf returns the Mon-first weekday for a local date", () => {
  expect(weekdayOf("2026-09-28")).toBe("Mon");
  expect(weekdayOf("2026-10-04")).toBe("Sun");
});

test("mondayOf finds the Monday of the week containing a date", () => {
  expect(mondayOf("2026-10-04")).toBe("2026-09-28");
  expect(mondayOf("2026-09-28")).toBe("2026-09-28");
});

test("datesOfWeek returns 7 consecutive dates starting at monday", () => {
  expect(datesOfWeek("2026-09-28")).toEqual([
    "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01",
    "2026-10-02", "2026-10-03", "2026-10-04",
  ]);
});

test("a week spanning a year boundary produces real, consecutive calendar dates", () => {
  // 2026-12-29 is a Tuesday; its Monday is 2026-12-28, and the week runs into January.
  expect(mondayOf("2026-12-29")).toBe("2026-12-28");
  expect(datesOfWeek("2026-12-28")).toEqual([
    "2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31",
    "2027-01-01", "2027-01-02", "2027-01-03",
  ]);
});

test("shortDate formats a local date as day + short month", () => {
  expect(shortDate("2026-09-28")).toBe("28 Sep");
  expect(shortDate("2027-01-03")).toBe("3 Jan");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test shared/weekly-plan/week.test.ts`
Expected: FAIL — `Cannot find module './week'` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

```ts
// shared/weekly-plan/week.ts
import { addDays } from "../scheduling";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function weekdayOf(date: string): Weekday {
  const [y, m, d] = date.split("-").map(Number);
  const jsDay = new Date(y!, m! - 1, d!).getDay(); // 0=Sun..6=Sat
  return WEEKDAYS[(jsDay + 6) % 7]!;
}

export function mondayOf(date: string): string {
  const idx = WEEKDAYS.indexOf(weekdayOf(date));
  return addDays(date, -idx);
}

export function datesOfWeek(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Deliberately not toLocaleDateString(undefined, ...): its month/day order
// depends on the runtime's default locale (confirmed under Bun: it renders
// "Sep 28", not "28 Sep") — this needs one fixed, locale-independent format.
export function shortDate(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m! - 1]}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test shared/weekly-plan/week.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add shared/weekly-plan/week.ts shared/weekly-plan/week.test.ts
git commit -m "feat(weekly-plan): add pure date helpers (weekdayOf, mondayOf, datesOfWeek)"
```

---

## Task 2: `model.ts` — domain types + `WeeklyPlan` class

**Files:**
- Create: `shared/weekly-plan/model.ts`
- Test: `shared/weekly-plan/model.test.ts`

**Interfaces:**
- Consumes: `weekdayOf`, `mondayOf`, `datesOfWeek` from `./week` (Task 1);
  `MetricsCalculator<TItem>` type from `./metrics` (Task 3 — type-only
  import, so this task's code compiles before Task 3 exists as long as the
  test's stub calculator matches the shape `{ stats(plan, today): Stat[] }`
  structurally; `tsc` resolves the type-only circular import fine).
- Produces (used by every later task): `Weekday`, `PlanStep`, `PlanItem`,
  `PlanDay<TItem>`, `CategoryStyle`, `ReferencePanel`, `PlanContext`,
  `Stat`, and the `WeeklyPlan<TItem>` class with `dayFor`, `weekOf`, `stats`.

- [ ] **Step 1: Write the failing test**

```ts
// shared/weekly-plan/model.test.ts
import { test, expect } from "bun:test";
import { WeeklyPlan } from "./model";
import type { PlanDay, Stat } from "./model";

const categories = { x: { label: "X", colorToken: "--accent" } };

const days: PlanDay[] = [
  { day: "Mon", items: [{ title: "A", category: "x", steps: [] }] },
  { day: "Tue", items: [] },
  { day: "Wed", items: [] },
  { day: "Thu", items: [] },
  { day: "Fri", items: [] },
  { day: "Sat", items: [] },
  { day: "Sun", items: [] },
];

test("dayFor finds the day matching a date's weekday", () => {
  const plan = new WeeklyPlan("p", "Plan", days, categories, { stats: () => [] });
  expect(plan.dayFor("2026-09-28")?.day).toBe("Mon");
  expect(plan.dayFor("2026-10-04")?.day).toBe("Sun");
});

test("weekOf marks exactly one day as isToday, matching the date passed in", () => {
  const plan = new WeeklyPlan("p", "Plan", days, categories, { stats: () => [] });
  const week = plan.weekOf("2026-09-30"); // Wednesday
  expect(week).toHaveLength(7);
  expect(week[0]?.date).toBe("2026-09-28"); // week starts Monday
  const todays = week.filter((w) => w.isToday);
  expect(todays).toHaveLength(1);
  expect(todays[0]?.date).toBe("2026-09-30");
});

test("stats delegates to the injected calculator with the plan instance and today", () => {
  const calls: { plan: unknown; today: string }[] = [];
  const calculator = {
    stats(plan: WeeklyPlan, today: string): Stat[] {
      calls.push({ plan, today });
      return [{ value: "42", label: "Mock" }];
    },
  };
  const plan = new WeeklyPlan("p", "Plan", days, categories, calculator);
  const result = plan.stats("2026-09-28");
  expect(result).toEqual([{ value: "42", label: "Mock" }]);
  expect(calls).toEqual([{ plan, today: "2026-09-28" }]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test shared/weekly-plan/model.test.ts`
Expected: FAIL — `Cannot find module './model'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// shared/weekly-plan/model.ts
import type { MetricsCalculator } from "./metrics";
import { weekdayOf, mondayOf, datesOfWeek } from "./week";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface PlanStep {
  label: string;
  detail: string;
}

export interface PlanItem {
  title: string;
  category: string;
  time?: string;
  steps: PlanStep[];
  note?: string;
}

export interface PlanDay<TItem extends PlanItem = PlanItem> {
  day: Weekday;
  items: TItem[];
}

export interface CategoryStyle {
  label: string;
  colorToken: string;
}

export interface ReferencePanel {
  title: string;
  badge?: string;
  rows: PlanStep[];
}

export interface PlanContext {
  heading: string;
  dates?: string;
  lines: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export class WeeklyPlan<TItem extends PlanItem = PlanItem> {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly days: PlanDay<TItem>[],
    readonly categories: Record<string, CategoryStyle>,
    readonly metrics: MetricsCalculator<TItem>,
    readonly context?: PlanContext,
    readonly panels: ReferencePanel[] = [],
  ) {}

  dayFor(date: string): PlanDay<TItem> | undefined {
    const weekday = weekdayOf(date);
    return this.days.find((d) => d.day === weekday);
  }

  weekOf(date: string): { date: string; day: PlanDay<TItem>; isToday: boolean }[] {
    const monday = mondayOf(date);
    return datesOfWeek(monday).map((d) => ({
      date: d,
      // definePlan() guarantees all 7 weekdays are present, so this always hits.
      day: this.dayFor(d)!,
      isToday: d === date,
    }));
  }

  stats(today: string): Stat[] {
    return this.metrics.stats(this, today);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test shared/weekly-plan/model.test.ts`
Expected: PASS (3 tests). Note: `tsc` will still show an error for the
missing `./metrics` module until Task 3 — that's expected and resolved
next task; `bun test` passes because Bun transpiles per-file and the type
-only import has no runtime effect.

- [ ] **Step 5: Commit**

```bash
git add shared/weekly-plan/model.ts shared/weekly-plan/model.test.ts
git commit -m "feat(weekly-plan): add domain types and the WeeklyPlan class"
```

---

## Task 3: `metrics.ts` — `MetricsCalculator` strategy + generic calculators

**Files:**
- Create: `shared/weekly-plan/metrics.ts`
- Test: `shared/weekly-plan/metrics.test.ts`

**Interfaces:**
- Consumes: `PlanItem`, `WeeklyPlan`, `Stat` types from `./model` (Task 2).
- Produces (used by Task 4's tests, Task 6, and `training/metrics.ts` in
  Task 7): `interface MetricsCalculator<TItem extends PlanItem>` with
  `stats(plan: WeeklyPlan<TItem>, today: string): Stat[]`; factory
  functions `CountByCategory<TItem>(): MetricsCalculator<TItem>`,
  `TodaySummary<TItem>(): MetricsCalculator<TItem>`,
  `CompositeMetrics<TItem>(...calculators: MetricsCalculator<TItem>[]): MetricsCalculator<TItem>`.

- [ ] **Step 1: Write the failing test**

```ts
// shared/weekly-plan/metrics.test.ts
import { test, expect } from "bun:test";
import { CountByCategory, TodaySummary, CompositeMetrics } from "./metrics";
import { WeeklyPlan } from "./model";
import type { PlanDay } from "./model";

const categories = {
  lecture: { label: "Lecture", colorToken: "--accent" },
  revision: { label: "Revision", colorToken: "--green" },
};

const days: PlanDay[] = [
  { day: "Mon", items: [{ title: "Lecture 1", category: "lecture", steps: [] }] },
  { day: "Tue", items: [{ title: "Lecture 2", category: "lecture", steps: [] }] },
  { day: "Wed", items: [{ title: "Revise", category: "revision", steps: [] }] },
  { day: "Thu", items: [] },
  { day: "Fri", items: [] },
  { day: "Sat", items: [] },
  { day: "Sun", items: [] },
];

function makePlan(): WeeklyPlan {
  return new WeeklyPlan("p", "Plan", days, categories, { stats: () => [] });
}

test("CountByCategory counts items by category label, and empty days as Rest", () => {
  const stats = CountByCategory().stats(makePlan(), "2026-09-28");
  expect(stats).toEqual([
    { value: "2", label: "Lecture" },
    { value: "1", label: "Revision" },
    { value: "4", label: "Rest" },
  ]);
});

test("TodaySummary shows today's first item's category label", () => {
  const stats = TodaySummary().stats(makePlan(), "2026-09-28"); // Monday: lecture
  expect(stats).toEqual([{ value: "Lecture", label: "Today" }]);
});

test("TodaySummary shows Rest when today has no items", () => {
  const stats = TodaySummary().stats(makePlan(), "2026-10-01"); // Thursday: empty
  expect(stats).toEqual([{ value: "Rest", label: "Today" }]);
});

test("CompositeMetrics concatenates each calculator's stats in order", () => {
  const stats = CompositeMetrics(TodaySummary(), CountByCategory()).stats(makePlan(), "2026-09-28");
  expect(stats).toEqual([
    { value: "Lecture", label: "Today" },
    { value: "2", label: "Lecture" },
    { value: "1", label: "Revision" },
    { value: "4", label: "Rest" },
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test shared/weekly-plan/metrics.test.ts`
Expected: FAIL — `Cannot find module './metrics'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// shared/weekly-plan/metrics.ts
import type { PlanItem, WeeklyPlan, Stat } from "./model";

export interface MetricsCalculator<TItem extends PlanItem> {
  stats(plan: WeeklyPlan<TItem>, today: string): Stat[];
}

export function CountByCategory<TItem extends PlanItem>(): MetricsCalculator<TItem> {
  return {
    stats(plan) {
      const counts = new Map<string, number>();
      for (const day of plan.days) {
        if (day.items.length === 0) {
          counts.set("Rest", (counts.get("Rest") ?? 0) + 1);
          continue;
        }
        for (const item of day.items) {
          const label = plan.categories[item.category]?.label ?? item.category;
          counts.set(label, (counts.get(label) ?? 0) + 1);
        }
      }
      return [...counts].map(([label, value]) => ({ value: String(value), label }));
    },
  };
}

export function TodaySummary<TItem extends PlanItem>(): MetricsCalculator<TItem> {
  return {
    stats(plan, today) {
      const day = plan.dayFor(today);
      const first = day?.items[0];
      const value = first
        ? plan.categories[first.category]?.label ?? first.category
        : "Rest";
      return [{ value, label: "Today" }];
    },
  };
}

export function CompositeMetrics<TItem extends PlanItem>(
  ...calculators: MetricsCalculator<TItem>[]
): MetricsCalculator<TItem> {
  return {
    stats(plan, today) {
      return calculators.flatMap((c) => c.stats(plan, today));
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test shared/weekly-plan/metrics.test.ts`
Expected: PASS (4 tests). Also run `bunx tsc --noEmit` — the Task 2
circular-type-import warning is now gone.

- [ ] **Step 5: Commit**

```bash
git add shared/weekly-plan/metrics.ts shared/weekly-plan/metrics.test.ts
git commit -m "feat(weekly-plan): add MetricsCalculator strategy and generic calculators"
```

---

## Task 4: `define.ts` — boundary validation

**Files:**
- Create: `shared/weekly-plan/define.ts`
- Test: `shared/weekly-plan/define.test.ts`

**Interfaces:**
- Consumes: `WeeklyPlan`, `Weekday`, `CategoryStyle`, `PlanContext`,
  `PlanDay`, `PlanItem`, `ReferencePanel` from `./model` (Task 2);
  `MetricsCalculator` from `./metrics` (Task 3).
- Produces (used by Task 6 and `training/plan.ts` in Task 7):
  `interface WeeklyPlanInput<TItem extends PlanItem>` and
  `definePlan<TItem extends PlanItem>(input: WeeklyPlanInput<TItem>): WeeklyPlan<TItem>`.

- [ ] **Step 1: Write the failing test**

```ts
// shared/weekly-plan/define.test.ts
import { test, expect } from "bun:test";
import { definePlan } from "./define";
import type { PlanDay } from "./model";

const categories = { off: { label: "Off", colorToken: "--dim" } };
const metrics = { stats: () => [] };
const item = { title: "X", category: "off", steps: [] };

const validDays: PlanDay[] = [
  { day: "Mon", items: [item] },
  { day: "Tue", items: [item] },
  { day: "Wed", items: [item] },
  { day: "Thu", items: [item] },
  { day: "Fri", items: [item] },
  { day: "Sat", items: [item] },
  { day: "Sun", items: [item] },
];

test("accepts a plan with all 7 days in Mon-Sun order", () => {
  const plan = definePlan({ id: "p", title: "P", days: validDays, categories, metrics });
  expect(plan.days).toHaveLength(7);
});

test("rejects a plan missing a day", () => {
  const days = validDays.slice(0, 6); // no Sunday
  expect(() => definePlan({ id: "p", title: "P", days, categories, metrics })).toThrow(/Mon.*Sun/);
});

test("rejects a plan with a duplicate day", () => {
  const days = [...validDays.slice(0, 6), { day: "Sat", items: [item] }] as PlanDay[]; // Sat twice, no Sun
  expect(() => definePlan({ id: "p", title: "P", days, categories, metrics })).toThrow(/Mon.*Sun/);
});

test("rejects days that are present but out of order", () => {
  const days = [validDays[6]!, ...validDays.slice(0, 6)]; // Sun first
  expect(() => definePlan({ id: "p", title: "P", days, categories, metrics })).toThrow(/Mon.*Sun/);
});

test("rejects an item whose category isn't declared", () => {
  const days = [
    { day: "Mon", items: [{ title: "X", category: "unknown", steps: [] }] },
    ...validDays.slice(1),
  ] as PlanDay[];
  expect(() => definePlan({ id: "p", title: "P", days, categories, metrics })).toThrow(/unknown category/);
});

test("rejects a category whose colorToken doesn't start with --", () => {
  const badCategories = { off: { label: "Off", colorToken: "dim" } };
  expect(() =>
    definePlan({ id: "p", title: "P", days: validDays, categories: badCategories, metrics }),
  ).toThrow(/colorToken must start with/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test shared/weekly-plan/define.test.ts`
Expected: FAIL — `Cannot find module './define'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// shared/weekly-plan/define.ts
import type { Weekday, CategoryStyle, PlanContext, PlanDay, PlanItem, ReferencePanel } from "./model";
import { WeeklyPlan } from "./model";
import type { MetricsCalculator } from "./metrics";

const WEEK_ORDER: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface WeeklyPlanInput<TItem extends PlanItem> {
  id: string;
  title: string;
  days: PlanDay<TItem>[];
  categories: Record<string, CategoryStyle>;
  metrics: MetricsCalculator<TItem>;
  context?: PlanContext;
  panels?: ReferencePanel[];
}

export function definePlan<TItem extends PlanItem>(
  input: WeeklyPlanInput<TItem>,
): WeeklyPlan<TItem> {
  const gotDays = input.days.map((d) => d.day);
  const inOrder =
    gotDays.length === WEEK_ORDER.length && WEEK_ORDER.every((w, i) => gotDays[i] === w);
  if (!inOrder) {
    throw new Error(
      `plan "${input.id}": days must be exactly Mon, Tue, Wed, Thu, Fri, Sat, Sun in that order (got ${gotDays.join(", ") || "none"})`,
    );
  }

  for (const [key, style] of Object.entries(input.categories)) {
    if (!style.colorToken.startsWith("--")) {
      throw new Error(
        `plan "${input.id}": category "${key}" colorToken must start with "--" (got "${style.colorToken}")`,
      );
    }
  }

  for (const day of input.days) {
    for (const item of day.items) {
      if (!(item.category in input.categories)) {
        throw new Error(
          `plan "${input.id}": item "${item.title}" on ${day.day} has unknown category "${item.category}"`,
        );
      }
    }
  }

  return new WeeklyPlan(
    input.id,
    input.title,
    input.days,
    input.categories,
    input.metrics,
    input.context,
    input.panels ?? [],
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test shared/weekly-plan/define.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add shared/weekly-plan/define.ts shared/weekly-plan/define.test.ts
git commit -m "feat(weekly-plan): add definePlan() boundary validation"
```

---

## Task 5: UI — components, dual-view `WeeklyPlanView`, and styles

**Files:**
- Create: `shared/weekly-plan/components/StatRow.tsx`
- Create: `shared/weekly-plan/components/ContextBanner.tsx`
- Create: `shared/weekly-plan/components/DayCard.tsx`
- Create: `shared/weekly-plan/components/WeekBoardCards.tsx`
- Create: `shared/weekly-plan/components/WeekBoardTable.tsx`
- Create: `shared/weekly-plan/components/ReferencePanel.tsx`
- Create: `shared/weekly-plan/WeeklyPlanView.tsx`
- Create: `shared/weekly-plan/weekly-plan.css`

**Interfaces:**
- Consumes: `PlanItem`, `PlanDay`, `CategoryStyle`, `PlanContext`, `Stat`,
  `ReferencePanel` (type) from `./model` (Task 2); `WeeklyPlan` from
  `./model`; `localToday` from `../scheduling`; `shortDate` from `./week`
  (Task 1) — imported by `DayCard.tsx` and `WeekBoardTable.tsx` as `../week`
  and by `WeeklyPlanView.tsx` as `./week`. Every date-rendering file reuses
  this one helper; none redefines its own.
- Produces (used by Task 6's reuse test and Task 7's Training tab):
  `WeeklyPlanView<TItem extends PlanItem>({ plan: WeeklyPlan<TItem>; today?: string })`
  — the only export other tasks import from this file.

This task has no dedicated `bun:test` file — there's no DOM-rendering test
harness in this repo (every existing `*.tsx` is untested at the component
level; only data/model logic gets `bun:test` coverage here). Task 6 is the
executable proof this task's output actually works. Verify each step with
`bunx tsc --noEmit` and a `bun test` regression run (both wired into the
PostToolUse hook already), then do a real browser check in Task 9.

- [ ] **Step 1: `StatRow`**

```tsx
// shared/weekly-plan/components/StatRow.tsx
import type { Stat } from "../model";

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="stats plan-stats">
      {stats.map((s, i) => (
        <div key={`${s.label}-${i}`} className="stat stat-total">
          <span className="stat-num">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
```

Run `bunx tsc --noEmit` — expect no new errors from this file.

- [ ] **Step 2: `ContextBanner`**

```tsx
// shared/weekly-plan/components/ContextBanner.tsx
import type { PlanContext } from "../model";

export function ContextBanner({ context }: { context: PlanContext }) {
  return (
    <div className="plan-context">
      <div className="plan-context-head">
        <strong>{context.heading}</strong>
        {context.dates && <span className="plan-context-dates">{context.dates}</span>}
      </div>
      {context.lines.map((line, i) => (
        <p key={i} className="plan-context-line">{line}</p>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `DayCard`**

```tsx
// shared/weekly-plan/components/DayCard.tsx
import React from "react";
import type { PlanDay, PlanItem, CategoryStyle } from "../model";
import { shortDate } from "../week";

export function DayCard<TItem extends PlanItem>({
  date,
  day,
  isToday,
  categories,
}: {
  date: string;
  day: PlanDay<TItem>;
  isToday: boolean;
  categories: Record<string, CategoryStyle>;
}) {
  return (
    <article className={isToday ? "plan-day plan-day-today" : "plan-day"}>
      <header className="plan-day-head">
        <span className="plan-day-weekday">{day.day}</span>
        <span className="plan-day-date">{shortDate(date)}</span>
        {isToday && <span className="tag">today</span>}
      </header>
      {day.items.length === 0 ? (
        <p className="plan-day-rest">Rest</p>
      ) : (
        day.items.map((item, i) => {
          const style = categories[item.category];
          return (
            <div key={i} className="plan-item">
              <div className="plan-item-head">
                <span
                  className="plan-pill"
                  style={{ "--tone": `var(${style?.colorToken ?? "--dim"})` } as React.CSSProperties}
                >
                  {style?.label ?? item.category}
                </span>
                {item.time && <span className="plan-item-time">{item.time}</span>}
              </div>
              <h3 className="plan-item-title">{item.title}</h3>
              <dl className="plan-item-steps">
                {item.steps.map((step, j) => (
                  <React.Fragment key={j}>
                    <dt>{step.label}</dt>
                    <dd>{step.detail}</dd>
                  </React.Fragment>
                ))}
              </dl>
              {item.note && <p className="plan-item-note">{item.note}</p>}
            </div>
          );
        })
      )}
    </article>
  );
}
```

- [ ] **Step 4: `WeekBoardCards`**

```tsx
// shared/weekly-plan/components/WeekBoardCards.tsx
import type { PlanItem, PlanDay, CategoryStyle } from "../model";
import { DayCard } from "./DayCard";

export function WeekBoardCards<TItem extends PlanItem>({
  week,
  categories,
  heading,
}: {
  week: { date: string; day: PlanDay<TItem>; isToday: boolean }[];
  categories: Record<string, CategoryStyle>;
  heading: string;
}) {
  return (
    <section className="board plan-board" aria-label="This week">
      <div className="section-head">
        <h2>{heading}</h2>
      </div>
      <div className="plan-week-grid">
        {week.map(({ date, day, isToday }) => (
          <DayCard key={date} date={date} day={day} isToday={isToday} categories={categories} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: `WeekBoardTable`**

```tsx
// shared/weekly-plan/components/WeekBoardTable.tsx
import React from "react";
import type { PlanItem, PlanDay, CategoryStyle } from "../model";
import { shortDate } from "../week";

function focusFor<TItem extends PlanItem>(
  day: PlanDay<TItem>,
  categories: Record<string, CategoryStyle>,
): string {
  if (day.items.length === 0) return "Rest";
  return day.items.map((item) => categories[item.category]?.label ?? item.category).join(" / ");
}

export function WeekBoardTable<TItem extends PlanItem>({
  week,
  categories,
  heading,
}: {
  week: { date: string; day: PlanDay<TItem>; isToday: boolean }[];
  categories: Record<string, CategoryStyle>;
  heading: string;
}) {
  return (
    <section className="board plan-board" aria-label="This week">
      <div className="section-head">
        <h2>{heading}</h2>
      </div>
      <div className="plan-table-wrap">
        <table className="plan-table">
          <thead>
            <tr>
              {week.map(({ date, day, isToday }) => (
                <th key={date} className={isToday ? "plan-table-today" : undefined}>
                  <span className="plan-table-weekday">{day.day}</span>
                  <span className="plan-table-date">{shortDate(date)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="plan-table-focus-row">
              {week.map(({ date, day, isToday }) => (
                <td
                  key={date}
                  className={day.items.length === 0 ? "plan-table-rest" : isToday ? "plan-table-today" : undefined}
                >
                  {focusFor(day, categories)}
                </td>
              ))}
            </tr>
            <tr>
              {week.map(({ date, day, isToday }) => (
                <td
                  key={date}
                  className={day.items.length === 0 ? "plan-table-rest" : isToday ? "plan-table-today" : undefined}
                >
                  {day.items.length === 0 ? (
                    <span className="plan-day-rest">Rest</span>
                  ) : (
                    day.items.map((item, i) => (
                      <div key={i} className="plan-table-item">
                        {item.time && <div className="plan-item-time">{item.time}</div>}
                        <div className="plan-item-title">{item.title}</div>
                        <dl className="plan-item-steps">
                          {item.steps.map((step, j) => (
                            <React.Fragment key={j}>
                              <dt>{step.label}</dt>
                              <dd>{step.detail}</dd>
                            </React.Fragment>
                          ))}
                        </dl>
                        {item.note && <p className="plan-item-note">{item.note}</p>}
                      </div>
                    ))
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: `ReferencePanel`**

```tsx
// shared/weekly-plan/components/ReferencePanel.tsx
import React from "react";
import type { ReferencePanel as ReferencePanelData } from "../model";

export function ReferencePanel({ panel }: { panel: ReferencePanelData }) {
  return (
    <section className="plan-panel">
      <header className="plan-panel-head">
        <h3>{panel.title}</h3>
        {panel.badge && <span className="tag">{panel.badge}</span>}
      </header>
      <dl className="plan-panel-rows">
        {panel.rows.map((row, i) => (
          <React.Fragment key={i}>
            <dt>{row.label}</dt>
            <dd>{row.detail}</dd>
          </React.Fragment>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 7: `weekly-plan.css`**

```css
/* shared/weekly-plan/weekly-plan.css */
/* Weekly Plan template — builds on shared tokens and .stats/.board/.tag classes in index.css. */

.plan-stats {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.plan-context {
  background: var(--panel);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  padding: 0.85rem 1rem;
  margin-bottom: 1.5rem;
}

.plan-context-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 0.3rem;
}

.plan-context-dates {
  font-family: var(--mono);
  font-size: var(--text-sm);
  color: var(--dim);
}

.plan-context-line {
  margin: 0.2rem 0 0;
  font-size: var(--text-sm);
  color: var(--dim);
}

/* View toggle */
.plan-view-toggle {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.plan-view-btn {
  font: inherit;
  font-size: var(--text-sm);
  padding: 4px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
}

.plan-view-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.plan-view-btn-active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.plan-view-btn-active:hover {
  color: var(--on-accent);
}

/* Card view */
.plan-week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
}

@media (max-width: 900px) {
  .plan-week-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .plan-week-grid {
    grid-template-columns: 1fr;
  }
}

.plan-day {
  background: var(--panel);
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.plan-day-today {
  border: 1px solid var(--accent);
}

.plan-day-head {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.plan-day-weekday {
  font-weight: 600;
}

.plan-day-date {
  font-family: var(--mono);
  font-size: var(--text-xs);
  color: var(--dim);
}

.plan-day-rest {
  color: var(--dim);
  font-size: var(--text-sm);
  margin: 0;
}

.plan-item {
  border-top: 1px solid var(--line);
  padding-top: 0.5rem;
}

.plan-item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.plan-item-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
}

.plan-pill {
  font-size: var(--text-xs);
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--tone) 45%, transparent);
  background: color-mix(in srgb, var(--tone) 14%, transparent);
  color: var(--tone);
}

.plan-item-time {
  font-family: var(--mono);
  font-size: var(--text-xs);
  color: var(--dim);
}

.plan-item-title {
  font-size: var(--text-base);
  margin: 0 0 0.3rem;
}

.plan-item-steps {
  margin: 0;
  font-size: var(--text-xs);
}

.plan-item-steps dt {
  color: var(--dim);
  font-weight: 600;
  margin-top: 0.3rem;
}

.plan-item-steps dd {
  margin: 0 0 0.2rem;
}

.plan-item-note {
  font-size: var(--text-xs);
  color: var(--dim);
  margin: 0.3rem 0 0;
  font-style: italic;
}

/* Table view */
.plan-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 6px;
}

.plan-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.plan-table th,
.plan-table td {
  border: 1px solid var(--line);
  padding: 0.6rem 0.7rem;
  vertical-align: top;
  min-width: 150px;
}

.plan-table th {
  background: var(--panel-raised);
  text-align: center;
}

.plan-table-weekday {
  display: block;
  font-weight: 600;
}

.plan-table-date {
  display: block;
  font-family: var(--mono);
  font-size: var(--text-xs);
  color: var(--dim);
}

.plan-table-today {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-color: var(--accent);
}

.plan-table-focus-row td {
  font-weight: 600;
  text-align: center;
}

.plan-table-rest {
  background: var(--panel-raised);
}

.plan-table-item + .plan-table-item {
  margin-top: 0.6rem;
  border-top: 1px solid var(--line);
  padding-top: 0.4rem;
}

@media (max-width: 700px) {
  .plan-table {
    table-layout: auto;
  }
}

/* Reference panels */
.plan-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-3);
  margin-top: 1.5rem;
}

.plan-panel {
  background: var(--panel);
  border-radius: 6px;
  padding: 0.85rem 1rem;
}

.plan-panel-head {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.plan-panel-head h3 {
  margin: 0;
  font-size: var(--text-base);
}

.plan-panel-rows {
  margin: 0;
  font-size: var(--text-xs);
}

.plan-panel-rows dt {
  color: var(--dim);
  font-weight: 600;
  margin-top: 0.3rem;
}

.plan-panel-rows dd {
  margin: 0 0 0.2rem;
}
```

- [ ] **Step 8: `WeeklyPlanView`**

```tsx
// shared/weekly-plan/WeeklyPlanView.tsx
import React, { useState } from "react";
import type { PlanItem, WeeklyPlan } from "./model";
import { localToday } from "../scheduling";
import { shortDate } from "./week";
import { StatRow } from "./components/StatRow";
import { ContextBanner } from "./components/ContextBanner";
import { WeekBoardTable } from "./components/WeekBoardTable";
import { WeekBoardCards } from "./components/WeekBoardCards";
import { ReferencePanel } from "./components/ReferencePanel";
import "./weekly-plan.css";

type WeekView = "table" | "cards";

function loadView(): WeekView {
  try {
    const stored = localStorage.getItem("weekly-plan-view");
    if (stored === "table" || stored === "cards") return stored;
  } catch {
    // localStorage inaccessible (e.g. blocked storage) — fall back to default
  }
  return "table";
}

function saveView(view: WeekView) {
  try {
    localStorage.setItem("weekly-plan-view", view);
  } catch {
    // localStorage inaccessible — view choice just won't persist across visits
  }
}

function ViewToggle({ view, onChange }: { view: WeekView; onChange: (v: WeekView) => void }) {
  return (
    <nav className="plan-view-toggle" aria-label="Week layout">
      <button
        className={view === "table" ? "plan-view-btn plan-view-btn-active" : "plan-view-btn"}
        onClick={() => onChange("table")}
      >
        Table
      </button>
      <button
        className={view === "cards" ? "plan-view-btn plan-view-btn-active" : "plan-view-btn"}
        onClick={() => onChange("cards")}
      >
        Cards
      </button>
    </nav>
  );
}

export function WeeklyPlanView<TItem extends PlanItem>({
  plan,
  today = localToday(),
}: {
  plan: WeeklyPlan<TItem>;
  today?: string;
}) {
  const [view, setView] = useState<WeekView>(loadView);
  const changeView = (v: WeekView) => {
    setView(v);
    saveView(v);
  };

  const week = plan.weekOf(today);
  const stats = plan.stats(today);
  const heading = `This week · ${shortDate(week[0]!.date)} – ${shortDate(week[6]!.date)}`;

  return (
    <div className="weekly-plan">
      <StatRow stats={stats} />
      {plan.context && <ContextBanner context={plan.context} />}
      <ViewToggle view={view} onChange={changeView} />
      {view === "table" ? (
        <WeekBoardTable week={week} categories={plan.categories} heading={heading} />
      ) : (
        <WeekBoardCards week={week} categories={plan.categories} heading={heading} />
      )}
      {plan.panels.length > 0 && (
        <div className="plan-panels">
          {plan.panels.map((panel, i) => (
            <ReferencePanel key={i} panel={panel} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Type-check and regression-test**

Run: `bunx tsc --noEmit`
Expected: no errors.

Run: `bun test`
Expected: all prior tests (Tasks 1–4) still pass; no test file exists for
this task yet, so the count is unchanged from Task 4.

- [ ] **Step 10: Commit**

```bash
git add shared/weekly-plan/components shared/weekly-plan/WeeklyPlanView.tsx shared/weekly-plan/weekly-plan.css
git commit -m "feat(weekly-plan): add dual table/card week view and reference panels"
```

---

## Task 6: Proof of reuse — a second plan type through the same view

**Files:**
- Create: `shared/weekly-plan/reuse.test.ts`

**Interfaces:**
- Consumes: `definePlan` (Task 4), `CountByCategory` (Task 3), `PlanItem`
  (Task 2), `WeeklyPlanView` (Task 5). This is the gate the spec requires
  before merging: if this test needs any change inside `shared/weekly-plan/`
  to pass, the abstraction is wrong — fix the abstraction there, not this
  test.
- Produces: nothing consumed by later tasks; this is a standalone
  regression guard.

- [ ] **Step 1: Write the test**

This file renders through React without JSX (kept as a plain `.ts` file, as
the spec names it, via `React.createElement`) using `react-dom/server`'s
`renderToStaticMarkup`, which needs no DOM/jsdom — confirmed working under
Bun during spec research.

```ts
// shared/weekly-plan/reuse.test.ts
import { test, expect } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { definePlan } from "./define";
import { CountByCategory } from "./metrics";
import type { PlanItem } from "./model";
import { WeeklyPlanView } from "./WeeklyPlanView";

const categories = {
  lecture: { label: "Lecture", colorToken: "--accent" },
  revision: { label: "Revision", colorToken: "--green" },
  off: { label: "Off", colorToken: "--dim" },
};

const item = (title: string, category: string): PlanItem => ({
  title,
  category,
  steps: [{ label: "Focus", detail: title }],
});

const STUDY_PLAN = definePlan<PlanItem>({
  id: "study",
  title: "Study timetable",
  categories,
  metrics: CountByCategory<PlanItem>(),
  days: [
    { day: "Mon", items: [item("Databases lecture", "lecture")] },
    { day: "Tue", items: [item("Networks lecture", "lecture")] },
    { day: "Wed", items: [item("Revise week 3", "revision")] },
    { day: "Thu", items: [item("Security lecture", "lecture")] },
    { day: "Fri", items: [item("Revise week 4", "revision")] },
    { day: "Sat", items: [item("Day off", "off")] },
    { day: "Sun", items: [item("Day off", "off")] },
  ],
});

test("a second plan type renders through WeeklyPlanView with zero changes to shared/weekly-plan", () => {
  const html = renderToStaticMarkup(
    React.createElement(WeeklyPlanView, { plan: STUDY_PLAN, today: "2026-09-28" }),
  );
  expect(html).toContain("Lecture");
  expect(html).toContain("Revision");
  expect(html).toContain("Off");
  expect(html).toContain("Databases lecture");
});
```

- [ ] **Step 2: Run it**

Run: `bun test shared/weekly-plan/reuse.test.ts`
Expected: PASS. If it fails, the fix belongs in Tasks 2–5's files, never
in this test — re-open the relevant task's file rather than special-casing
`reuse.test.ts`'s plan shape.

- [ ] **Step 3: Full regression + commit**

Run: `bun test && bunx tsc --noEmit`
Expected: all tests pass (Tasks 1–4's suites plus this one), no type errors.

```bash
git add shared/weekly-plan/reuse.test.ts
git commit -m "test(weekly-plan): prove a second plan type reuses the template unchanged"
```

---

## Task 7: Training data — the first real consumer

**Files:**
- Create: `training/metrics.ts`
- Create: `training/plan.ts`
- Test: `training/plan.test.ts`

**Interfaces:**
- Consumes: `MetricsCalculator`, `CompositeMetrics`, `TodaySummary` from
  `../shared/weekly-plan/metrics` (Task 3); `PlanItem` from
  `../shared/weekly-plan/model` (Task 2); `definePlan` from
  `../shared/weekly-plan/define` (Task 4).
- Produces: `training/metrics.ts` exports `interface TrainingItem extends
  PlanItem { hours: number; runKm: number }` and `TrainingMetrics:
  MetricsCalculator<TrainingItem>`. `training/plan.ts` exports
  `TRAINING_PLAN: WeeklyPlan<TrainingItem>` — consumed by Task 8's
  `training/App.tsx`.

- [ ] **Step 1: Write `training/metrics.ts`**

```ts
// training/metrics.ts
import type { MetricsCalculator } from "../shared/weekly-plan/metrics";
import { CompositeMetrics, TodaySummary } from "../shared/weekly-plan/metrics";
import type { PlanItem } from "../shared/weekly-plan/model";

export interface TrainingItem extends PlanItem {
  hours: number;
  runKm: number;
}

function hoursThisWeek(): MetricsCalculator<TrainingItem> {
  return {
    stats(plan) {
      const total = plan.days.reduce(
        (sum, day) => sum + day.items.reduce((s, item) => s + item.hours, 0),
        0,
      );
      return [{ value: total.toFixed(1), label: "Hours this week" }];
    },
  };
}

function runKmThisWeek(): MetricsCalculator<TrainingItem> {
  return {
    stats(plan) {
      const total = plan.days.reduce(
        (sum, day) => sum + day.items.reduce((s, item) => s + item.runKm, 0),
        0,
      );
      return [{ value: String(total), label: "Run km" }];
    },
  };
}

function strengthSessions(): MetricsCalculator<TrainingItem> {
  return {
    stats(plan) {
      const count = plan.days.reduce(
        (sum, day) => sum + day.items.filter((item) => item.category === "strength").length,
        0,
      );
      return [{ value: String(count), label: "Strength" }];
    },
  };
}

export const TrainingMetrics: MetricsCalculator<TrainingItem> = CompositeMetrics(
  hoursThisWeek(),
  runKmThisWeek(),
  strengthSessions(),
  TodaySummary(),
);
```

- [ ] **Step 2: Write `training/plan.ts`**

```ts
// training/plan.ts
import { definePlan } from "../shared/weekly-plan/define";
import { TrainingMetrics } from "./metrics";
import type { TrainingItem } from "./metrics";
import type { PlanDay, CategoryStyle } from "../shared/weekly-plan/model";

const categories: Record<string, CategoryStyle> = {
  run: { label: "Run", colorToken: "--green" },
  bike: { label: "Bike", colorToken: "--accent" },
  brick: { label: "Bike + run", colorToken: "--gold" },
  easy: { label: "Easy", colorToken: "--dim" },
  strength: { label: "Strength", colorToken: "--red" },
};

const strengthStep = { label: "Routine", detail: "See Strength · 30' panel below" };

const days: PlanDay<TrainingItem>[] = [
  {
    day: "Mon",
    items: [
      {
        title: "VO2 run (coach's session)",
        category: "run",
        time: "18:00",
        hours: 1.1,
        runKm: 12,
        steps: [
          { label: "Warm-up", detail: "15' easy + drills + 4×100m strides (30\" rest)" },
          { label: "Main set", detail: "2 sets of 1000/800/600m @ 5k pace (3:30 / 2:48 / 2:06)" },
          { label: "Recovery", detail: "90\" jog between reps, 3' between sets" },
          { label: "Cool-down", detail: "15' easy + stretch/roll" },
        ],
      },
    ],
  },
  {
    day: "Tue",
    items: [
      {
        title: "SUVelo Hills ride",
        category: "bike",
        time: "06:00",
        hours: 1.25,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "Base bunch, ~30 km (Centennial Park or Mosman)" },
          { label: "Effort", detail: "Climb seated and steady, don't chase attacks" },
        ],
      },
      {
        title: "Strength · 30'",
        category: "strength",
        time: "PM",
        hours: 0.5,
        runKm: 0,
        steps: [strengthStep],
      },
    ],
  },
  {
    day: "Wed",
    items: [
      {
        title: "Threshold run (coach's session)",
        category: "run",
        time: "18:00",
        hours: 1.2,
        runKm: 13,
        steps: [
          { label: "Warm-up", detail: "15' easy + drills + 4×100m strides" },
          { label: "Main set", detail: "5×6' @ 4:00–4:05/km" },
          { label: "Recovery", detail: "90\" jog" },
          { label: "Cool-down", detail: "15' easy + stretch/roll" },
        ],
      },
    ],
  },
  {
    day: "Thu",
    items: [
      {
        title: "Sweet spot + run off the bike",
        category: "brick",
        time: "Flexible",
        hours: 1.5,
        runKm: 3,
        steps: [
          { label: "Warm-up", detail: "15' easy spin, 3×1' fast cadence" },
          { label: "Main set", detail: "3×15' @ 88–93% FTP, 5' easy between" },
          { label: "Off the bike", detail: "Straight into 15' easy run" },
          { label: "Test weeks", detail: "Swap main set for 20' FTP test (FTP = avg × 0.95)" },
        ],
      },
      {
        title: "Strength · 30'",
        category: "strength",
        time: "PM",
        hours: 0.5,
        runKm: 0,
        steps: [strengthStep],
      },
    ],
  },
  {
    day: "Fri",
    items: [
      {
        title: "SUVelo Coffee Ride or rest",
        category: "easy",
        time: "06:00",
        hours: 1,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "Eastern Suburbs, Base, 28 km, no-drop" },
          { label: "Effort", detail: "Easy only, skip if tired" },
          { label: "After", detail: "10' mobility" },
        ],
      },
    ],
  },
  {
    day: "Sat",
    items: [
      {
        title: "SUVelo South Long Haul",
        category: "bike",
        time: "05:55",
        hours: 3,
        runKm: 0,
        steps: [
          { label: "Ride", detail: "Civilised bunch, turn at Waterfall (~90 km); first Saturday of the month = north ride" },
          { label: "Fuel", detail: "60 g carbs/h, 500–750 ml/h" },
          { label: "Build", detail: "Extend to Royal National Park (110 km) by Dec–Jan" },
        ],
      },
    ],
  },
  {
    day: "Sun",
    items: [
      {
        title: "Long run",
        category: "run",
        time: "Morning",
        hours: 1.3,
        runKm: 15,
        steps: [
          { label: "Run", detail: "75–90' easy @ 4:50–5:15/km" },
          { label: "Finish", detail: "6×20\" strides, walk-back rest" },
        ],
      },
    ],
  },
];

export const TRAINING_PLAN = definePlan<TrainingItem>({
  id: "training",
  title: "Training",
  days,
  categories,
  metrics: TrainingMetrics,
  context: {
    heading: "Phase 0 · Engine build",
    dates: "Oct 2026 – Feb 2027",
    lines: [
      "Build bike volume and aerobic base. 80% of time easy.",
      "Next: Gate 1 · Mar 2027: FTP 250 W or more, 5k under 17:00",
    ],
  },
  panels: [
    {
      title: "Strength · 30'",
      badge: "Tue + Thu",
      rows: [
        { label: "Back squat", detail: "3×8, rest 90\"" },
        { label: "Romanian deadlift", detail: "3×8, rest 90\"" },
        { label: "Bulgarian split squat", detail: "3×8 each leg, rest 60\"" },
        { label: "Single-leg calf raise", detail: "3×15 each, rest 45\"" },
        { label: "Plank / side plank", detail: "3×40\" / 2×30\" each, rest 30\"" },
      ],
    },
    {
      title: "Pace guide",
      badge: "5k 17:36 · 10k 38:46",
      rows: [
        { label: "Easy", detail: "4:50–5:15/km, can talk" },
        { label: "Threshold", detail: "4:00–4:05/km, comfortably hard" },
        { label: "5k pace", detail: "~3:30/km, hard and controlled" },
        { label: "Strides", detail: "fast and relaxed, not a sprint" },
      ],
    },
  ],
});
```

- [ ] **Step 3: Write `training/plan.test.ts`**

```ts
// training/plan.test.ts
import { test, expect } from "bun:test";
import { TRAINING_PLAN } from "./plan";

test("training plan has all 7 days, Monday first", () => {
  expect(TRAINING_PLAN.days.map((d) => d.day)).toEqual([
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
  ]);
});

test("training week totals 11.4 hours and 43 run km", () => {
  const stats = TRAINING_PLAN.stats("2026-09-28");
  expect(stats.find((s) => s.label === "Hours this week")?.value).toBe("11.4");
  expect(stats.find((s) => s.label === "Run km")?.value).toBe("43");
});

test("training week has 2 strength sessions", () => {
  const stats = TRAINING_PLAN.stats("2026-09-28");
  expect(stats.find((s) => s.label === "Strength")?.value).toBe("2");
});
```

- [ ] **Step 4: Run tests**

Run: `bun test training/plan.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Full regression + commit**

Run: `bun test && bunx tsc --noEmit`
Expected: all tests pass, no type errors.

```bash
git add training/metrics.ts training/plan.ts training/plan.test.ts
git commit -m "feat(training): add the Phase 0 weekly training plan data"
```

---

## Task 8: Wire the Training tab into the app

**Files:**
- Create: `training/App.tsx`
- Modify: `frontend.tsx:11-12` (lazy imports), `frontend.tsx:627` (`Tab`
  type), `frontend.tsx:711-717` (TabBar buttons), `frontend.tsx:774-781`
  (tab render block)

**Interfaces:**
- Consumes: `WeeklyPlanView` from `../shared/weekly-plan/WeeklyPlanView`
  (Task 5), `TRAINING_PLAN` from `./plan` (Task 7).
- Produces: `training/App.tsx` default-exports `TrainingApp`, lazy-loaded
  by `frontend.tsx` exactly like `jobs/App.tsx`'s `JobsApp`.

- [ ] **Step 1: Write `training/App.tsx`**

```tsx
// training/App.tsx
import { WeeklyPlanView } from "../shared/weekly-plan/WeeklyPlanView";
import { TRAINING_PLAN } from "./plan";

export default function TrainingApp() {
  return <WeeklyPlanView plan={TRAINING_PLAN} />;
}
```

- [ ] **Step 2: Add the lazy import to `frontend.tsx`**

Current (`frontend.tsx:11-12`):

```tsx
const InterviewApp = React.lazy(() => import("./interview/App"));
const JobsApp = React.lazy(() => import("./jobs/App"));
```

New:

```tsx
const InterviewApp = React.lazy(() => import("./interview/App"));
const JobsApp = React.lazy(() => import("./jobs/App"));
const TrainingApp = React.lazy(() => import("./training/App"));
```

- [ ] **Step 3: Add `"training"` to the `Tab` union**

Current (`frontend.tsx:627`):

```tsx
type Tab = "home" | "deadlines" | "leetcode" | "todo" | "exam" | "interview" | "jobs";
```

New:

```tsx
type Tab = "home" | "deadlines" | "leetcode" | "todo" | "exam" | "interview" | "jobs" | "training";
```

- [ ] **Step 4: Add the TabBar button**

Current (`frontend.tsx:711-718`, the Jobs button plus the `ThemeToggle`
that follows it inside `TabBar`):

```tsx
      <button
        className={tab === "jobs" ? "tab tab-active" : "tab"}
        onClick={() => onChange("jobs")}
      >
        Jobs
      </button>
      <ThemeToggle />
```

New:

```tsx
      <button
        className={tab === "jobs" ? "tab tab-active" : "tab"}
        onClick={() => onChange("jobs")}
      >
        Jobs
      </button>
      <button
        className={tab === "training" ? "tab tab-active" : "tab"}
        onClick={() => onChange("training")}
      >
        Training
      </button>
      <ThemeToggle />
```

- [ ] **Step 5: Add the render block in `App()`**

Current (`frontend.tsx:774-781`, the Jobs render block, the last one in
`App()`):

```tsx
      {tab === "jobs" && (
        <Suspense fallback={<p className="board-empty">Loading…</p>}>
          <JobsApp
            openJobId={deepLink?.tab === "jobs" ? deepLink.jobId : null}
            onOpened={() => setDeepLink(null)}
          />
        </Suspense>
      )}
```

New (append immediately after it, still inside the `<div className="app">`):

```tsx
      {tab === "jobs" && (
        <Suspense fallback={<p className="board-empty">Loading…</p>}>
          <JobsApp
            openJobId={deepLink?.tab === "jobs" ? deepLink.jobId : null}
            onOpened={() => setDeepLink(null)}
          />
        </Suspense>
      )}
      {tab === "training" && (
        <Suspense fallback={<p className="board-empty">Loading…</p>}>
          <TrainingApp />
        </Suspense>
      )}
```

No `DeepLink` union changes — v1 has no deep links into Training (it isn't
fed into Home's "Everything due", per the spec's Future section).

- [ ] **Step 6: Type-check and regression-test**

Run: `bunx tsc --noEmit && bun test`
Expected: no type errors; all tests (Tasks 1–4, 6, 7) still pass — this
task adds no new `*.test.ts`, since tab wiring has no existing test
precedent in this repo (confirmed: no test renders `frontend.tsx`'s `App`
or asserts on `TabBar` buttons for any existing tab, including Jobs).
Task 9 is the real verification for this step, in a browser.

- [ ] **Step 7: Commit**

```bash
git add training/App.tsx frontend.tsx
git commit -m "feat(training): wire the Training tab into the app"
```

---

## Task 9: Browser verification

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run (background): `bun --hot index.ts`
The server listens on `http://localhost:3005` (`PORT` env var, default
3005, per `index.ts`).

- [ ] **Step 2: Load the app and open the Training tab**

Using the `claude-in-chrome` browser tool: navigate to
`http://localhost:3005`, click the "Training" tab.

Confirm:
- The stat row shows 4 numbers: hours this week (11.4), run km (43),
  strength (2), and today's focus.
- The context banner shows "Phase 0 · Engine build" and both lines.
- The table view (default) shows 7 day columns with correct dates for the
  current real week, today's column visibly highlighted, and Friday (or
  whichever day is a rest day at test time) styled distinctly if it has no
  items — check against the actual current date rather than the spec's
  worked example, since `WeeklyPlanView` uses `localToday()` by default.
- Click "Cards" — the same week renders as 7 day cards, today's card has
  an accent border and a "today" tag.
- Both Strength · 30' and Pace guide reference panels render below the
  week view.
- Reload the page — the last-selected view (table or cards) is remembered.
- Toggle the theme (light/dark, top-right) — check both views in both
  themes for any hard-coded-looking colors or unreadable text.
- Resize the window to a phone width — the card grid stacks to one column
  with no page-level horizontal scroll; the table scrolls horizontally
  inside its own bordered container instead.

- [ ] **Step 2: Check the console**

Using `read_console_messages`: confirm no errors or React warnings were
logged while loading the tab or toggling views.

- [ ] **Step 3: Stop the dev server**

Stop the background `bun --hot index.ts` process.

- [ ] **Step 4: Final full regression**

Run: `bun test && bunx tsc --noEmit`
Expected: all tests across every task pass, no type errors.

No commit for this task (verification only, no file changes). If any
check above fails, fix the relevant task's files, re-run this task's
checks, then commit the fix referencing which task it belongs to.

## Future (not v1)

Unchanged from the spec: done ticks + Home "Everything due" integration,
multi-week phases (recovery weeks / `PlanSchedule` + `WeekSelector`),
Garmin import, in-UI editing. Also now queued, from this planning session,
as separate specs to design after this plan ships (in this order, per the
"sequenced" decision made during planning):

1. Nav redesign — group LeetCode/Interview/Jobs under one hover-expandable
   "Jobs" tab, and Modules/Deadlines under a "Uni" tab; Training itself
   becomes a hover tab whose submenu covers schedule/competitions/goals.
2. Goals/roadmap/PB tracking, a competitions list (with qualification
   targets — e.g. which race qualifies for T100 Singapore, which races
   count toward SEA Games selection), and running-plan links imported from
   the user's Google Sheet
   (`https://docs.google.com/spreadsheets/d/1ymM5Mci6aOUXHF5jVVyKOlWowfYm9ISFwXCvPYOl5Ho`) —
   both the training-plan tab (gid `534939754`) and a separate
   competitions tab exist in that sheet; read both before spec'ing this.
