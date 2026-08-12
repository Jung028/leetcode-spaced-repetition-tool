import { test, expect } from "bun:test";
import { openDb, createProblem, reviewProblem } from "./db";
import { addDays, localToday } from "./scheduling";
import { migrateLeetcode150, getCurrentLeetcode150, leetcode150CompletedCredit } from "./leetcode150-db";
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

test("due_since resets to the day after today (and last_completed_date to today) when the pointer advances", () => {
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
  expect(item!.dueSince).toBe(addDays(day3, 1)); // the new position isn't due until the day after it was solved
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

test("leetcode150CompletedCredit credits a same-day advance captured without a review row (plain Add-problem path)", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const today = localToday();
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    today,
  ); // no review row — this is the manual "Add problem" path
  const current = getCurrentLeetcode150(db, today);
  const credit = leetcode150CompletedCredit(db, today, current);
  expect(credit).not.toBeNull();
  expect(credit!.number).toBe(LEETCODE_150[29]!.number);
  expect(credit!.url).toBe(leetcode150Url(LEETCODE_150[29]!));
});

test("leetcode150CompletedCredit skips a same-day advance that already has a review row (userscript pass path)", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const today = localToday();
  const problem = createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    today,
  );
  reviewProblem(db, problem.id, "pass", today); // the userscript's Completed capture creates a review row too
  const current = getCurrentLeetcode150(db, today);
  const credit = leetcode150CompletedCredit(db, today, current);
  expect(credit).toBeNull(); // already counted by the ordinary review-based completed-today path
});

test("leetcode150CompletedCredit returns null when nothing was solved today", () => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  const today = localToday();
  const current = getCurrentLeetcode150(db, today);
  expect(leetcode150CompletedCredit(db, today, current)).toBeNull();
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
