import { test, expect } from "bun:test";
import { TRAINING_PLAN } from "./plan";

test("training plan has all 7 days, Monday first", () => {
  expect(TRAINING_PLAN.days.map((d) => d.day)).toEqual([
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
  ]);
});

test("injury-week plan totals 9.4 hours (exact total 9.35h, rounded half-up) and 0 run km", () => {
  const stats = TRAINING_PLAN.stats("2026-09-28");
  expect(stats.find((s) => s.label === "Hours this week")?.value).toBe("9.4");
  expect(stats.find((s) => s.label === "Run km")?.value).toBe("0");
});

test("training week has 2 strength sessions", () => {
  const stats = TRAINING_PLAN.stats("2026-09-28");
  expect(stats.find((s) => s.label === "Strength")?.value).toBe("2");
});
