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
