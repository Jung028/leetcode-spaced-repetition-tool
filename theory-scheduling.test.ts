import { test, expect } from "bun:test";
import { THEORY_LADDER, initialTheorySchedule, applyTheoryReview } from "./theory-scheduling";

test("ladder is 3, 5, 7, 14, 30 days", () => {
  expect(THEORY_LADDER).toEqual([3, 5, 7, 14, 30]);
});

test("concept 1 is due the day the curriculum starts, at rung -1 (never yet correct)", () => {
  expect(initialTheorySchedule("2026-07-20", 1)).toEqual({ rung: -1, nextReview: "2026-07-20" });
});

test("concepts are introduced one per day", () => {
  expect(initialTheorySchedule("2026-07-20", 2)).toEqual({ rung: -1, nextReview: "2026-07-21" });
  expect(initialTheorySchedule("2026-07-20", 10)).toEqual({ rung: -1, nextReview: "2026-07-29" });
});

test("first correct answer schedules 3 days later", () => {
  expect(applyTheoryReview(-1, "correct", "2026-07-20")).toEqual({
    rung: 0,
    nextReview: "2026-07-23",
  });
});

test("second correct answer schedules 5 days later", () => {
  expect(applyTheoryReview(0, "correct", "2026-07-20")).toEqual({
    rung: 1,
    nextReview: "2026-07-25",
  });
});

test("ladder climbs 3 -> 5 -> 7 -> 14 -> 30 with successive correct answers", () => {
  expect(applyTheoryReview(1, "correct", "2026-07-20").nextReview).toBe("2026-07-27");
  expect(applyTheoryReview(2, "correct", "2026-07-20").nextReview).toBe("2026-08-03");
  expect(applyTheoryReview(3, "correct", "2026-07-20").nextReview).toBe("2026-08-19");
});

test("correct at the top rung stays at 30 days", () => {
  expect(applyTheoryReview(4, "correct", "2026-07-20")).toEqual({
    rung: 4,
    nextReview: "2026-08-19",
  });
});

test("wrong resets to rung -1, due tomorrow, regardless of prior rung", () => {
  expect(applyTheoryReview(3, "wrong", "2026-07-20")).toEqual({
    rung: -1,
    nextReview: "2026-07-21",
  });
  expect(applyTheoryReview(-1, "wrong", "2026-07-20")).toEqual({
    rung: -1,
    nextReview: "2026-07-21",
  });
});
