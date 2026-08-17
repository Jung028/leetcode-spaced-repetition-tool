import { test, expect } from "bun:test";
import {
  LADDER,
  MAX_ACTIVE_BACKLOG,
  MAX_DAILY_LEETCODE_REVIEWS,
  addDays,
  applyReview,
  initialSchedule,
  isDue,
  localToday,
  nextAvailableDate,
  releaseCount,
} from "./scheduling";

test("ladder is 1, 3, 7, 14, 30 days", () => {
  expect(LADDER).toEqual([1, 3, 7, 14, 30]);
});

test("localToday formats a date as local YYYY-MM-DD", () => {
  expect(localToday(new Date(2026, 6, 20, 23, 59))).toBe("2026-07-20");
  expect(localToday(new Date(2026, 0, 5, 0, 0))).toBe("2026-01-05");
});

test("addDays adds within a month", () => {
  expect(addDays("2026-07-20", 1)).toBe("2026-07-21");
});

test("addDays rolls over month and year boundaries", () => {
  expect(addDays("2026-07-30", 3)).toBe("2026-08-02");
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
});

test("new problems start at rung 0, due tomorrow", () => {
  expect(initialSchedule("2026-07-20")).toEqual({
    rung: 0,
    nextReview: "2026-07-21",
  });
});

test("pass advances one rung and schedules that interval", () => {
  expect(applyReview(0, "pass", "2026-07-20")).toEqual({
    rung: 1,
    nextReview: "2026-07-23",
  });
  expect(applyReview(1, "pass", "2026-07-20")).toEqual({
    rung: 2,
    nextReview: "2026-07-27",
  });
});

test("pass at the top rung stays at 30 days", () => {
  expect(applyReview(4, "pass", "2026-07-20")).toEqual({
    rung: 4,
    nextReview: "2026-08-19",
  });
});

test("fail resets to rung 0, due tomorrow", () => {
  expect(applyReview(3, "fail", "2026-07-20")).toEqual({
    rung: 0,
    nextReview: "2026-07-21",
  });
});

test("isDue is true for today and overdue dates only", () => {
  expect(isDue("2026-07-20", "2026-07-20")).toBe(true);
  expect(isDue("2026-07-01", "2026-07-20")).toBe(true);
  expect(isDue("2026-07-21", "2026-07-20")).toBe(false);
});

test("MAX_ACTIVE_BACKLOG is 5", () => {
  expect(MAX_ACTIVE_BACKLOG).toBe(5);
});

test("releaseCount releases nothing once backlog meets or exceeds the cap", () => {
  expect(releaseCount(5, 100, 5)).toBe(0);
  expect(releaseCount(8, 100, 5)).toBe(0);
});

test("releaseCount fills the gap between backlog and cap", () => {
  expect(releaseCount(0, 100, 5)).toBe(5);
  expect(releaseCount(3, 100, 5)).toBe(2);
});

test("releaseCount never releases more than what's remaining", () => {
  expect(releaseCount(0, 2, 5)).toBe(2);
  expect(releaseCount(3, 1, 5)).toBe(1);
});

test("releaseCount defaults to MAX_ACTIVE_BACKLOG when no cap is given", () => {
  expect(releaseCount(0, 100)).toBe(5);
});

test("MAX_DAILY_LEETCODE_REVIEWS is 5", () => {
  expect(MAX_DAILY_LEETCODE_REVIEWS).toBe(5);
});

test("nextAvailableDate returns the start date when it's under the cap", () => {
  const countOnDate = () => 4;
  expect(nextAvailableDate("2026-07-21", countOnDate, 5)).toBe("2026-07-21");
});

test("nextAvailableDate cascades to the next day when the start date is exactly at the cap", () => {
  const counts: Record<string, number> = { "2026-07-21": 5, "2026-07-22": 2 };
  const countOnDate = (date: string) => counts[date] ?? 0;
  expect(nextAvailableDate("2026-07-21", countOnDate, 5)).toBe("2026-07-22");
});

test("nextAvailableDate cascades multiple days when consecutive days are also full", () => {
  const counts: Record<string, number> = {
    "2026-07-21": 5,
    "2026-07-22": 5,
    "2026-07-23": 5,
    "2026-07-24": 1,
  };
  const countOnDate = (date: string) => counts[date] ?? 0;
  expect(nextAvailableDate("2026-07-21", countOnDate, 5)).toBe("2026-07-24");
});

test("nextAvailableDate defaults to MAX_DAILY_LEETCODE_REVIEWS when no cap is given", () => {
  const counts: Record<string, number> = { "2026-07-21": 5 };
  const countOnDate = (date: string) => counts[date] ?? 0;
  expect(nextAvailableDate("2026-07-21", countOnDate)).toBe("2026-07-22");
});
