import { test, expect } from "bun:test";
import { projectProgress } from "./goals-scheduling";

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
