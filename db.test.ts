import { test, expect, beforeEach } from "bun:test";
import type { Database } from "bun:sqlite";
import {
  openDb,
  createProblem,
  listProblems,
  getProblem,
  reviewProblem,
  updateProblem,
  deleteProblem,
} from "./db";

const TODAY = "2026-07-20";
let db: Database;

beforeEach(() => {
  db = openDb(":memory:");
});

const add = (title = "Two Sum") =>
  createProblem(
    db,
    {
      title,
      url: "https://leetcode.com/problems/two-sum/",
      solution: "def twoSum(nums, target): ...",
    },
    TODAY,
  );

test("createProblem starts at rung 0, due tomorrow", () => {
  const p = add();
  expect(p.rung).toBe(0);
  expect(p.next_review).toBe("2026-07-21");
  expect(p.title).toBe("Two Sum");
});

test("listProblems returns all problems without solution bodies", () => {
  add("Two Sum");
  add("3Sum");
  const list = listProblems(db);
  expect(list.length).toBe(2);
  expect(list.map((p) => p.title).sort()).toEqual(["3Sum", "Two Sum"]);
  expect("solution" in list[0]!).toBe(false);
});

test("getProblem returns solution and review history", () => {
  const { id } = add();
  reviewProblem(db, id, "pass", TODAY);
  const p = getProblem(db, id)!;
  expect(p.solution).toContain("twoSum");
  expect(p.reviews.length).toBe(1);
  expect(p.reviews[0]!.result).toBe("pass");
});

test("pass review advances the ladder and reschedules", () => {
  const { id } = add();
  const p = reviewProblem(db, id, "pass", TODAY)!;
  expect(p.rung).toBe(1);
  expect(p.next_review).toBe("2026-07-23");
});

test("fail review resets to rung 0, due tomorrow", () => {
  const { id } = add();
  reviewProblem(db, id, "pass", TODAY);
  reviewProblem(db, id, "pass", TODAY);
  const p = reviewProblem(db, id, "fail", TODAY)!;
  expect(p.rung).toBe(0);
  expect(p.next_review).toBe("2026-07-21");
});

test("updateProblem edits title, url, and solution", () => {
  const { id } = add();
  const p = updateProblem(db, id, {
    title: "Two Sum II",
    url: "https://leetcode.com/problems/two-sum-ii/",
    solution: "better",
  })!;
  expect(p.title).toBe("Two Sum II");
  expect(getProblem(db, id)!.solution).toBe("better");
});

test("deleteProblem removes the problem and its reviews", () => {
  const { id } = add();
  reviewProblem(db, id, "pass", TODAY);
  expect(deleteProblem(db, id)).toBe(true);
  expect(getProblem(db, id)).toBeNull();
});

test("operations on a missing id return null/false", () => {
  expect(getProblem(db, 999)).toBeNull();
  expect(reviewProblem(db, 999, "pass", TODAY)).toBeNull();
  expect(updateProblem(db, 999, { title: "x", url: "y", solution: "z" })).toBeNull();
  expect(deleteProblem(db, 999)).toBe(false);
});
