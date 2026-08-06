import { test, expect } from "bun:test";
import { openDb, createProblem } from "./db";
import { localToday } from "./scheduling";
import { migrateLeetcode150, getCurrentLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url, slugify } from "./leetcode150-content";

test("fresh db seeds completed_count at 29, so position 30 is current", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const current = getCurrentLeetcode150(db);
  expect(current).not.toBeNull();
  expect(current!.position).toBe(30);
  expect(current!.number).toBe(209);
});

test("calling migrateLeetcode150 twice does not reset an already-advanced pointer", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" }, localToday());
  getCurrentLeetcode150(db); // advances and persists to 30
  migrateLeetcode150(db); // re-running migration must not reset the seed
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(31);
});

test("solving the current problem advances the pointer by one", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" }, localToday());
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(31);
  expect(current!.number).toBe(3);
});

test("solving several consecutive problems at once advances past all of them in one call", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  for (const item of [LEETCODE_150[29]!, LEETCODE_150[30]!, LEETCODE_150[31]!]) {
    createProblem(db, { title: item.title, url: leetcode150Url(item), solution: "x" }, localToday());
  }
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(33);
});

test("solving a future (non-current) problem does not advance the pointer", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[50]!.title, url: leetcode150Url(LEETCODE_150[50]!), solution: "x" }, localToday());
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(30); // unchanged — position 30 (index 29) still not solved
});

test("matches a solved problem's URL even if its slug casing differs", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const item = LEETCODE_150[29]!; // position 30, "Minimum Size Subarray Sum"
  const mixedCaseUrl = `https://leetcode.com/problems/${slugify(item.title).toUpperCase()}/`;
  createProblem(db, { title: item.title, url: mixedCaseUrl, solution: "x" }, localToday());
  const current = getCurrentLeetcode150(db);
  expect(current!.position).toBe(31);
});

test("returns null once every problem is done", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  db.query(`UPDATE leetcode150_state SET completed_count = 150 WHERE id = 1`).run();
  expect(getCurrentLeetcode150(db)).toBeNull();
});
