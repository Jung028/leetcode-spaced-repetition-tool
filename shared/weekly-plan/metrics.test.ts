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
