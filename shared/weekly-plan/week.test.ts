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
