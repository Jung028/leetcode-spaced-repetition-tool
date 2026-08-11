import { test, expect } from "bun:test";
import { openDb, createProblem } from "./db";
import { addDays, localToday } from "./scheduling";
import { migrateLeetcode150, getCurrentLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url, slugify } from "./leetcode150-content";

test("fresh db seeds completed_count at 29, so position 30 is current", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const current = getCurrentLeetcode150(db, localToday()).item;
  expect(current).not.toBeNull();
  expect(current!.position).toBe(30);
  expect(current!.number).toBe(209);
});

test("calling migrateLeetcode150 twice does not reset an already-advanced pointer", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" }, localToday());
  getCurrentLeetcode150(db, localToday()).item; // advances and persists to 30
  migrateLeetcode150(db); // re-running migration must not reset the seed
  const current = getCurrentLeetcode150(db, localToday()).item;
  expect(current!.position).toBe(31);
});

test("solving the current problem advances the pointer by one", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" }, localToday());
  const current = getCurrentLeetcode150(db, localToday()).item;
  expect(current!.position).toBe(31);
  expect(current!.number).toBe(3);
});

test("solving several consecutive problems at once advances past all of them in one call", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  for (const item of [LEETCODE_150[29]!, LEETCODE_150[30]!, LEETCODE_150[31]!]) {
    createProblem(db, { title: item.title, url: leetcode150Url(item), solution: "x" }, localToday());
  }
  const current = getCurrentLeetcode150(db, localToday()).item;
  expect(current!.position).toBe(33);
});

test("solving a future (non-current) problem does not advance the pointer", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  createProblem(db, { title: LEETCODE_150[50]!.title, url: leetcode150Url(LEETCODE_150[50]!), solution: "x" }, localToday());
  const current = getCurrentLeetcode150(db, localToday()).item;
  expect(current!.position).toBe(30); // unchanged — position 30 (index 29) still not solved
});

test("matches a solved problem's URL even if its slug casing differs", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const item = LEETCODE_150[29]!; // position 30, "Minimum Size Subarray Sum"
  const mixedCaseUrl = `https://leetcode.com/problems/${slugify(item.title).toUpperCase()}/`;
  createProblem(db, { title: item.title, url: mixedCaseUrl, solution: "x" }, localToday());
  const current = getCurrentLeetcode150(db, localToday()).item;
  expect(current!.position).toBe(31);
});

test("returns null once every problem is done", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  db.query(`UPDATE leetcode150_state SET completed_count = 150 WHERE id = 1`).run();
  expect(getCurrentLeetcode150(db, localToday()).item).toBeNull();
});

test("due_since seeds to today on first read after migration", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const { item } = getCurrentLeetcode150(db, localToday());
  expect(item!.dueSince).toBe(localToday());
});

test("due_since stays unchanged across reads on later days with no advance", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const day1 = localToday();
  getCurrentLeetcode150(db, day1);
  const day3 = addDays(day1, 2);
  const { item } = getCurrentLeetcode150(db, day3);
  expect(item!.dueSince).toBe(day1); // still due since day1 — 2 days overdue by day3
});

test("due_since and last_completed_date reset to today when the pointer advances", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const day1 = localToday();
  getCurrentLeetcode150(db, day1); // due_since seeds to day1
  const day3 = addDays(day1, 2);
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    day3,
  );
  const { item, lastCompletedDate } = getCurrentLeetcode150(db, day3);
  expect(item!.position).toBe(31);
  expect(item!.dueSince).toBe(day3); // the new position just became due
  expect(lastCompletedDate).toBe(day3);
});

test("last_completed_date is null when no advance has ever happened", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const { lastCompletedDate } = getCurrentLeetcode150(db, localToday());
  expect(lastCompletedDate).toBeNull();
});

test("completedCount reflects how many positions are solved", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const before = getCurrentLeetcode150(db, localToday());
  expect(before.completedCount).toBe(29);
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    localToday(),
  );
  const after = getCurrentLeetcode150(db, localToday());
  expect(after.completedCount).toBe(30);
});

test("advancing past all 150 sets item to null but still reports lastCompletedDate and completedCount", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  db.query(`UPDATE leetcode150_state SET completed_count = 149 WHERE id = 1`).run();
  createProblem(
    db,
    { title: LEETCODE_150[149]!.title, url: leetcode150Url(LEETCODE_150[149]!), solution: "x" },
    localToday(),
  );
  const { item, completedCount, lastCompletedDate } = getCurrentLeetcode150(db, localToday());
  expect(item).toBeNull();
  expect(completedCount).toBe(150);
  expect(lastCompletedDate).toBe(localToday());
});
