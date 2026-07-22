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
  findProblemBySlug,
  captureSubmission,
  countReviewsToday,
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

test("createProblem defaults language to java and derives a slug", () => {
  const p = add();
  expect(p.language).toBe("java");
  expect(findProblemBySlug(db, "two-sum")?.id).toBe(p.id);
});

test("createProblem stores an explicit language", () => {
  const p = createProblem(
    db,
    {
      title: "Two Sum",
      url: "https://leetcode.com/problems/two-sum/",
      solution: "def twoSum(): ...",
      language: "python3",
    },
    TODAY,
  );
  expect(p.language).toBe("python3");
});

test("captureSubmission with no result just creates a new problem (plain Add)", () => {
  const { problem, created } = captureSubmission(
    db,
    {
      title: "3Sum",
      url: "https://leetcode.com/problems/3sum/",
      solution: "class Solution {}",
      language: "java",
    },
    TODAY,
  );
  expect(created).toBe(true);
  expect(problem.rung).toBe(0);
  expect(problem.next_review).toBe("2026-07-21");
  expect(getProblem(db, problem.id)!.reviews.length).toBe(0);
});

test("captureSubmission with no result on an existing problem updates fields but does not touch the schedule (plain Add)", () => {
  const original = add(); // Two Sum at rung 0, next review 2026-07-21
  const { problem, created } = captureSubmission(
    db,
    {
      title: "Two Sum",
      url: "https://leetcode.com/problems/two-sum/description/?envType=study-plan-v2",
      solution: "class Solution { /* updated */ }",
      language: "java",
    },
    TODAY,
  );
  expect(created).toBe(false);
  expect(problem.rung).toBe(original.rung);
  expect(problem.next_review).toBe(original.next_review);
  expect(problem.language).toBe("java");
  expect(getProblem(db, problem.id)!.solution).toContain("updated");
  expect(getProblem(db, problem.id)!.reviews.length).toBe(0);
});

test("captureSubmission with result 'pass' on an unseen slug creates it AND immediately advances past the initial rung", () => {
  const { problem, created } = captureSubmission(
    db,
    {
      title: "3Sum",
      url: "https://leetcode.com/problems/3sum/",
      solution: "class Solution {}",
      language: "java",
    },
    TODAY,
    "pass",
  );
  expect(created).toBe(true);
  expect(problem.rung).toBe(1);
  expect(problem.next_review).toBe("2026-07-23");
  expect(getProblem(db, problem.id)!.reviews.length).toBe(1);
});

test("captureSubmission with result 'fail' on an unseen slug creates it and logs the failed attempt", () => {
  const { problem, created } = captureSubmission(
    db,
    {
      title: "3Sum",
      url: "https://leetcode.com/problems/3sum/",
      solution: "class Solution {}",
      language: "java",
    },
    TODAY,
    "fail",
  );
  expect(created).toBe(true);
  expect(problem.rung).toBe(0);
  expect(problem.next_review).toBe("2026-07-21");
  const detail = getProblem(db, problem.id)!;
  expect(detail.reviews.length).toBe(1);
  expect(detail.reviews[0]!.result).toBe("fail");
});

test("captureSubmission with result 'pass' updates and advances an existing problem by slug, even via a different URL", () => {
  add(); // Two Sum at rung 0
  const { problem, created } = captureSubmission(
    db,
    {
      title: "Two Sum",
      url: "https://leetcode.com/problems/two-sum/description/?envType=study-plan-v2",
      solution: "class Solution { /* updated */ }",
      language: "java",
    },
    TODAY,
    "pass",
  );
  expect(created).toBe(false);
  expect(problem.rung).toBe(1);
  expect(problem.next_review).toBe("2026-07-23");
  expect(problem.language).toBe("java");
  expect(getProblem(db, problem.id)!.solution).toContain("updated");
});

test("captureSubmission with an explicit fail result resets an existing problem", () => {
  add(); // Two Sum at rung 0
  captureSubmission(
    db,
    {
      title: "Two Sum",
      url: "https://leetcode.com/problems/two-sum/",
      solution: "class Solution {}",
      language: "java",
    },
    TODAY,
    "pass",
  ); // rung 1 now
  const { problem, created } = captureSubmission(
    db,
    {
      title: "Two Sum",
      url: "https://leetcode.com/problems/two-sum/",
      solution: "class Solution { /* attempt 2 */ }",
      language: "java",
    },
    TODAY,
    "fail",
  );
  expect(created).toBe(false);
  expect(problem.rung).toBe(0);
  expect(problem.next_review).toBe("2026-07-21");
});

test("countReviewsToday counts only today's reviews", () => {
  const a = add("Two Sum");
  const b = add("3Sum");
  reviewProblem(db, a.id, "pass", TODAY);
  reviewProblem(db, b.id, "fail", TODAY);
  reviewProblem(db, a.id, "pass", "2026-07-19");
  expect(countReviewsToday(db, TODAY)).toBe(2);
});
