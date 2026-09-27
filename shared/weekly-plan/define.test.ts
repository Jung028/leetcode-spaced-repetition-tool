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
