import { test, expect } from "bun:test";
import { sydneyWallClockToUtc, toGoogleUtcStamp } from "./sydneyTime";

test("converts a summer (AEDT, UTC+11) Sydney wall-clock time to UTC", () => {
  const d = sydneyWallClockToUtc("2026-01-15", 22, 0);
  expect(d.toISOString()).toBe("2026-01-15T11:00:00.000Z");
});

test("converts a winter (AEST, UTC+10) Sydney wall-clock time to UTC", () => {
  const d = sydneyWallClockToUtc("2026-07-15", 22, 0);
  expect(d.toISOString()).toBe("2026-07-15T12:00:00.000Z");
});

test("midnight in Sydney maps back to the previous UTC day", () => {
  const d = sydneyWallClockToUtc("2026-07-23", 0, 0);
  expect(d.toISOString()).toBe("2026-07-22T14:00:00.000Z");
});

test("toGoogleUtcStamp formats compactly for the quick-add URL", () => {
  const d = new Date("2026-07-15T12:00:00.000Z");
  expect(toGoogleUtcStamp(d)).toBe("20260715T120000Z");
});
