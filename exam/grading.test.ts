import { test, expect } from "bun:test";
import { isMultiCorrect, normaliseBlank, isFillBlankCorrect, isMatchCorrect, isOrderCorrect, isSortCorrect } from "./grading";

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

test("normaliseBlank ignores case, spacing and punctuation", () => {
  expect(normaliseBlank("  Message-Authentication   CODE. ")).toBe("messageauthenticationcode");
  expect(normaliseBlank("M.A.C.")).toBe("mac");
});

test("isFillBlankCorrect accepts any listed spelling per blank, ignoring case/punctuation", () => {
  const blanks = [["MAC", "message authentication code"], ["hash"]];
  expect(isFillBlankCorrect(["mac", "Hash!"], blanks)).toBe(true);
  expect(isFillBlankCorrect(["Message Authentication Code", "hash"], blanks)).toBe(true);
});

test("isFillBlankCorrect is all-or-nothing and rejects empty or missing answers", () => {
  const blanks = [["mac"], ["hash"]];
  expect(isFillBlankCorrect(["mac", "nope"], blanks)).toBe(false);
  expect(isFillBlankCorrect(["mac"], blanks)).toBe(false);
  expect(isFillBlankCorrect(["mac", ""], blanks)).toBe(false);
});

test("isMatchCorrect requires every row to pick its own partner", () => {
  expect(isMatchCorrect([0, 1, 2], 3)).toBe(true);
  expect(isMatchCorrect([0, 2, 1], 3)).toBe(false);
  expect(isMatchCorrect([0, 1], 3)).toBe(false);
});

test("isOrderCorrect requires the exact authored order", () => {
  expect(isOrderCorrect([0, 1, 2, 3], 4)).toBe(true);
  expect(isOrderCorrect([1, 0, 2, 3], 4)).toBe(false);
  expect(isOrderCorrect([0, 1, 2], 4)).toBe(false);
});

test("isSortCorrect requires every item in its own group", () => {
  expect(isSortCorrect([0, 1, 1, 0], [0, 1, 1, 0])).toBe(true);
  expect(isSortCorrect([0, 1, 0, 0], [0, 1, 1, 0])).toBe(false);
  expect(isSortCorrect([0, 1], [0, 1, 1, 0])).toBe(false);
});

test("isFillBlankCorrect ignores punctuation and spacing inside answers", () => {
  expect(isFillBlankCorrect(["M.A.C."], [["mac"]])).toBe(true);
  expect(isFillBlankCorrect(["e-mail"], [["email"]])).toBe(true);
  expect(isFillBlankCorrect(["TCP/IP"], [["tcp ip"]])).toBe(true);
  expect(isFillBlankCorrect(["..."], [["..."]])).toBe(false);
});
