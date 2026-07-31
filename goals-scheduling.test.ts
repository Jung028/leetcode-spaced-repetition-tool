import { test, expect } from "bun:test";
import { nextStepDueDate, projectProgress } from "./goals-scheduling";

test("first step is due the project's creation date", () => {
  expect(nextStepDueDate({ created_at: "2026-07-31" }, [], "2026-07-31")).toBe("2026-07-31");
});

test("second step is due the day after the first step's due date", () => {
  expect(
    nextStepDueDate({ created_at: "2026-07-31" }, [{ due_date: "2026-07-31" }], "2026-07-31"),
  ).toBe("2026-08-01");
});

test("a step is never backdated — clamps to today if the naive next day is already past", () => {
  expect(
    nextStepDueDate({ created_at: "2026-07-01" }, [{ due_date: "2026-07-01" }], "2026-07-31"),
  ).toBe("2026-07-31");
});

test("uses the latest existing due date, not insertion order", () => {
  expect(
    nextStepDueDate(
      { created_at: "2026-07-31" },
      [{ due_date: "2026-08-02" }, { due_date: "2026-08-01" }],
      "2026-07-31",
    ),
  ).toBe("2026-08-03");
});

test("projectProgress sums weights of done steps only", () => {
  expect(
    projectProgress([
      { weight: 20, done: true },
      { weight: 30, done: false },
      { weight: 50, done: true },
    ]),
  ).toBe(70);
});

test("projectProgress is 0 for an empty or all-undone step list", () => {
  expect(projectProgress([])).toBe(0);
  expect(projectProgress([{ weight: 20, done: false }])).toBe(0);
});
