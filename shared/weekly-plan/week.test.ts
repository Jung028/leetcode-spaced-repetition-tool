import { test, expect } from "bun:test";
import { weekdayOf, mondayOf, datesOfWeek, shortDate, monthWeeks, monthLabel, monthsOfYear } from "./week";

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

test("monthWeeks returns the Monday of every week overlapping the month", () => {
  // October 2026 starts on a Thursday, so its first week begins in September.
  expect(monthWeeks("2026-10-04")).toEqual(["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"]);
});

test("monthWeeks starts on the 1st when the month begins on a Monday", () => {
  expect(monthWeeks("2026-06-15")).toEqual(["2026-06-01", "2026-06-08", "2026-06-15", "2026-06-22", "2026-06-29"]);
});

test("monthWeeks returns exactly four weeks for a February that fits them", () => {
  expect(monthWeeks("2027-02-10")).toEqual(["2027-02-01", "2027-02-08", "2027-02-15", "2027-02-22"]);
});

test("monthWeeks stops at December's last Monday instead of running into January", () => {
  expect(monthWeeks("2026-12-31")).toEqual(["2026-11-30", "2026-12-07", "2026-12-14", "2026-12-21", "2026-12-28"]);
});

test("monthLabel names the month and year", () => {
  expect(monthLabel("2026-10-04")).toBe("October 2026");
});

test("monthsOfYear lists the first day of each month of that year", () => {
  const months = monthsOfYear("2026-10-04");
  expect(months).toHaveLength(12);
  expect(months[0]).toBe("2026-01-01");
  expect(months[11]).toBe("2026-12-01");
});
