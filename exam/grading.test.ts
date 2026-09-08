import { test, expect } from "bun:test";
import { isMultiCorrect } from "./grading";

test("isMultiCorrect: exact set match (order-independent) grades correct", () => {
  expect(isMultiCorrect([2, 0], [0, 2])).toBe(true);
  expect(isMultiCorrect([0, 1, 3], [3, 1, 0])).toBe(true);
});

test("isMultiCorrect: a missing correct option grades wrong", () => {
  expect(isMultiCorrect([0], [0, 2])).toBe(false);
});

test("isMultiCorrect: an extra wrong option grades wrong", () => {
  expect(isMultiCorrect([0, 2, 3], [0, 2])).toBe(false);
});

test("isMultiCorrect: empty selection grades wrong when there are correct answers", () => {
  expect(isMultiCorrect([], [0, 2])).toBe(false);
});

test("isMultiCorrect: duplicate selections don't inflate the match", () => {
  expect(isMultiCorrect([0, 0, 2], [0, 2])).toBe(true);
  expect(isMultiCorrect([0, 0], [0, 2])).toBe(false);
});
