import { test, expect } from "bun:test";
import { toQuestionView } from "./api";
import type { ExamQuestionSeed } from "../exam-content/types";

test("toQuestionView passes the new-format fields through and nulls the absent ones", () => {
  const q: ExamQuestionSeed = { type: "order", prompt: "p", modelAnswer: "m", steps: ["a", "b", "c"] };
  const v = toQuestionView(q, 4, { your_answer: "[1,0,2]", correct: 0 });
  expect(v.index).toBe(4);
  expect(v.steps).toEqual(["a", "b", "c"]);
  expect(v.blanks).toBeNull();
  expect(v.pairs).toBeNull();
  expect(v.decoys).toBeNull();
  expect(v.groups).toBeNull();
  expect(v.items).toBeNull();
  expect(v.yourAnswer).toBe("[1,0,2]");
  expect(v.correct).toBe(0);
});

test("toQuestionView defaults an unanswered question to empty answer and null grade", () => {
  const q: ExamQuestionSeed = { type: "fillblank", prompt: "A ___", modelAnswer: "m", blanks: [["x"]] };
  const v = toQuestionView(q, 0);
  expect(v.blanks).toEqual([["x"]]);
  expect(v.yourAnswer).toBe("");
  expect(v.correct).toBeNull();
});
