import { test, expect } from "bun:test";
import { deadlineLabel } from "./time-left";

const at = (s: string) => new Date(s);

test("multiple days out", () => {
  expect(deadlineLabel("2026-09-20", at("2026-09-10T09:00"))).toBe("10 days left");
  expect(deadlineLabel("2026-09-13", at("2026-09-10T09:00"))).toBe("3 days left");
});

test("exactly one day left", () => {
  expect(deadlineLabel("2026-09-11", at("2026-09-10T09:00"))).toBe("1 day left");
});

test("final day shows fine-grained time in parentheses", () => {
  // date-only due -> 23:59 that day
  expect(deadlineLabel("2026-09-10", at("2026-09-10T23:46"))).toBe("0 days left (13 minutes left)");
  expect(deadlineLabel("2026-09-10", at("2026-09-10T20:59"))).toBe("0 days left (3 hours left)");
  expect(deadlineLabel("2026-09-10T14:00", at("2026-09-10T13:59"))).toBe("0 days left (1 minute left)");
  expect(deadlineLabel("2026-09-10T14:00", at("2026-09-10T13:59:45"))).toBe(
    "0 days left (less than a minute left)",
  );
});

test("overdue", () => {
  expect(deadlineLabel("2026-09-10T09:00", at("2026-09-10T10:00"))).toBe("overdue");
  expect(deadlineLabel("2026-09-09", at("2026-09-10T10:00"))).toBe("1 day overdue");
  expect(deadlineLabel("2026-09-07", at("2026-09-10T10:00"))).toBe("3 days overdue");
});
