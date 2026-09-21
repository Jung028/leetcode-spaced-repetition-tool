import { test, expect } from "bun:test";
import { findStructureIssues } from "./check-exam-structure";
import type { ExamPaperSeed, ExamQuestionSeed } from "../exam-content/types";

function paperWith(questions: ExamQuestionSeed[], readings?: ExamPaperSeed["readings"]): ExamPaperSeed {
  return { course: "TEST", week: 1, paperNumber: 1, title: "T", topics: "t", sourceFiles: [], questions, readings };
}
const base = { modelAnswer: "because" };

const goodFill: ExamQuestionSeed = { ...base, type: "fillblank", prompt: "A ___ seals a message.", blanks: [["MAC", "message authentication code"]] };
const goodMatch: ExamQuestionSeed = {
  ...base, type: "match", prompt: "Match each term.",
  pairs: [{ left: "A", right: "one" }, { left: "B", right: "two" }, { left: "C", right: "three" }],
};
const goodOrder: ExamQuestionSeed = { ...base, type: "order", prompt: "Order these.", steps: ["first", "second", "third"] };
const goodSort: ExamQuestionSeed = {
  ...base, type: "sort", prompt: "Sort these.", groups: ["threat", "control"],
  items: [
    { text: "phishing", group: 0 }, { text: "malware", group: 0 },
    { text: "firewall", group: 1 }, { text: "MFA", group: 1 },
  ],
};

test("well-formed new-format questions produce no issues", () => {
  expect(findStructureIssues([paperWith([goodFill, goodMatch, goodOrder, goodSort])])).toEqual([]);
});

test("fillblank: blank count must equal ___ count", () => {
  const issues = findStructureIssues([paperWith([{ ...goodFill, prompt: "No gap here." }])]);
  expect(issues.map((i) => i.message).join()).toContain("___");
});

test("fillblank: every blank needs at least one non-empty accepted answer", () => {
  expect(findStructureIssues([paperWith([{ ...goodFill, blanks: [[""]] }])]).length).toBe(1);
  expect(findStructureIssues([paperWith([{ ...goodFill, blanks: [[]] }])]).length).toBe(1);
});

test("match: needs 3-6 pairs, unique right-hand texts, at most 2 decoys", () => {
  expect(findStructureIssues([paperWith([{ ...goodMatch, pairs: goodMatch.pairs!.slice(0, 2) }])]).length).toBe(1);
  const dup = { ...goodMatch, pairs: goodMatch.pairs!.map((p) => ({ ...p, right: "same" })) };
  expect(findStructureIssues([paperWith([dup])]).length).toBeGreaterThan(0);
  expect(findStructureIssues([paperWith([{ ...goodMatch, decoys: ["x", "y", "z"] }])]).length).toBe(1);
});

test("order: needs 3-7 distinct steps", () => {
  expect(findStructureIssues([paperWith([{ ...goodOrder, steps: ["a", "b"] }])]).length).toBe(1);
  expect(findStructureIssues([paperWith([{ ...goodOrder, steps: ["a", "a", "b"] }])]).length).toBe(1);
});

test("sort: 2-3 groups, 4-8 items, valid group indexes, every group used", () => {
  expect(findStructureIssues([paperWith([{ ...goodSort, groups: ["only"] }])]).length).toBeGreaterThan(0);
  const badIdx = { ...goodSort, items: goodSort.items!.map((it) => ({ ...it, group: 5 })) };
  expect(findStructureIssues([paperWith([badIdx])]).length).toBeGreaterThan(0);
  const unused = { ...goodSort, items: goodSort.items!.map((it) => ({ ...it, group: 0 })) };
  expect(findStructureIssues([paperWith([unused])]).length).toBe(1);
});

test("readings: beforeQuestion in range, unique, ascending; body at most 200 words", () => {
  const q = [goodOrder, goodOrder, goodOrder];
  const ok = paperWith(q, [{ beforeQuestion: 0, title: "a", body: "short" }, { beforeQuestion: 2, title: "b", body: "short" }]);
  expect(findStructureIssues([ok])).toEqual([]);
  expect(findStructureIssues([paperWith(q, [{ beforeQuestion: 3, title: "a", body: "x" }])]).length).toBe(1);
  expect(findStructureIssues([paperWith(q, [{ beforeQuestion: 1, title: "a", body: "x" }, { beforeQuestion: 1, title: "b", body: "x" }])]).length).toBeGreaterThan(0);
  const long = Array.from({ length: 201 }, () => "w").join(" ");
  expect(findStructureIssues([paperWith(q, [{ beforeQuestion: 0, title: "a", body: long }])]).length).toBe(1);
});

test("size ceiling applies only to papers using the new features", () => {
  const many = Array.from({ length: 60 }, () => ({ type: "mcq" as const, prompt: "p", options: ["a", "b"], correctIndex: 0, modelAnswer: "m" }));
  expect(findStructureIssues([paperWith(many)])).toEqual([]);
  expect(findStructureIssues([paperWith([...many, goodOrder])]).length).toBe(1);
});

test("all existing authored content passes untouched", async () => {
  const { buildExamSchedule } = await import("../exam/content");
  expect(findStructureIssues(buildExamSchedule())).toEqual([]);
});

test("fillblank: an accepted answer that is empty once normalised (punctuation only) is rejected", () => {
  const issues = findStructureIssues([paperWith([{ ...goodFill, blanks: [["MAC", "?!"]] }])]);
  expect(issues.map((i) => i.message).join()).toContain("empty");
});
