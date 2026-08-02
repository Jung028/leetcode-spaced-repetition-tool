import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateTheory,
  listDueTheory,
  getTheoryConcept,
  saveTheoryAnswer,
  reviewTheoryConcept,
  countTheoryReviewsToday,
  countOverdueTheory,
  listTheoryCompletedToday,
} from "./theory-db";
import { addDays } from "./scheduling";

const TODAY = "2026-07-20";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateTheory(db, TODAY);
});

test("seeds 150 concepts, releasing the first 5 immediately (today) under the backlog cap", () => {
  expect(getTheoryConcept(db, 1)).toEqual({
    concept_day: 1,
    rung: -1,
    next_review: TODAY,
    your_answer: "",
  });
  expect(getTheoryConcept(db, 5)!.next_review).toBe(TODAY);
  // Not yet released — keeps its original calendar placeholder, unused until release.
  expect(getTheoryConcept(db, 6)!.next_review).toBe(addDays(TODAY, 5));
  expect(getTheoryConcept(db, 150)!.next_review).toBe(addDays(TODAY, 149));
});

test("migrateTheory does not reseed (and doesn't reset progress) on a second call", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  migrateTheory(db, TODAY);
  expect(getTheoryConcept(db, 1)!.rung).toBe(0);
});

test("listDueTheory on day one returns the first 5 concepts released under the cap", () => {
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});

test("listDueTheory a week later still caps at 5 if nothing has been reviewed", () => {
  // Time passing alone doesn't grow the pile — only clearing backlog does.
  const due = listDueTheory(db, addDays(TODAY, 7));
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});

test("reviewing a released concept lets the next one in, keeping the pile at the cap", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY); // concept 1 now due in 3 days, drops off
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([2, 3, 4, 5, 6]);
});

test("saveTheoryAnswer stores a draft without affecting scheduling", () => {
  const updated = saveTheoryAnswer(db, 1, "my draft")!;
  expect(updated.your_answer).toBe("my draft");
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe(TODAY);
});

test("reviewTheoryConcept 'correct' advances the rung and reschedules 3 days out the first time", () => {
  const updated = reviewTheoryConcept(db, 1, "correct", TODAY)!;
  expect(updated).toEqual({
    concept_day: 1,
    rung: 0,
    next_review: "2026-07-23",
    your_answer: "",
  });
});

test("reviewTheoryConcept 'correct' twice climbs to 5 days on the second success", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  const updated = reviewTheoryConcept(db, 1, "correct", TODAY)!;
  expect(updated.rung).toBe(1);
  expect(updated.next_review).toBe("2026-07-25");
});

test("reviewTheoryConcept 'wrong' resets rung and schedules tomorrow", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  reviewTheoryConcept(db, 1, "correct", TODAY);
  const updated = reviewTheoryConcept(db, 1, "wrong", TODAY)!;
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe("2026-07-21");
});

test("reviewTheoryConcept on an unknown concept_day returns null", () => {
  expect(reviewTheoryConcept(db, 9999, "correct", TODAY)).toBeNull();
});

test("countTheoryReviewsToday only counts today's reviews", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  reviewTheoryConcept(db, 2, "wrong", TODAY);
  reviewTheoryConcept(db, 3, "correct", "2026-07-10");
  expect(countTheoryReviewsToday(db, TODAY)).toBe(2);
});

test("countOverdueTheory counts strictly-past next_review dates among released concepts only", () => {
  expect(countOverdueTheory(db, TODAY)).toBe(0);
  // Nothing reviewed, so the pile stays at the 5 released on day one — all overdue two days later.
  expect(countOverdueTheory(db, addDays(TODAY, 2))).toBe(5);
});

test("listTheoryCompletedToday returns concepts reviewed today, deduped, ordered by concept_day", () => {
  reviewTheoryConcept(db, 1, "wrong", TODAY);
  reviewTheoryConcept(db, 1, "correct", TODAY); // second review same day, shouldn't duplicate
  reviewTheoryConcept(db, 2, "correct", "2026-07-19"); // different day, shouldn't show up

  const completed = listTheoryCompletedToday(db, TODAY);
  expect(completed.map((c) => c.concept_day)).toEqual([1]);
});

test("listTheoryCompletedToday is empty when nothing was reviewed today", () => {
  expect(listTheoryCompletedToday(db, TODAY)).toEqual([]);
});

test("migrating a pre-existing db backfills the watermark to the furthest concept actually reached, then tops up to the cap", () => {
  // Simulate an old-format db exactly as pre-migration code would have left
  // it: 150 concepts seeded with calendar-offset next_review dates, only
  // concept 1 ever actually passed. Under the old model, letting 10 days
  // pass untouched would leave concepts 1 through 11 all cluttering the due
  // list (concept N due on day N-1).
  const legacy = new Database(":memory:");
  legacy.exec(`
    CREATE TABLE theory_schedule (
      concept_day INTEGER PRIMARY KEY,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      your_answer TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE theory_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concept_day INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
  `);
  const insert = legacy.query(
    `INSERT INTO theory_schedule (concept_day, rung, next_review, your_answer) VALUES (?, ?, ?, '')`,
  );
  for (let day = 1; day <= 150; day++) insert.run(day, -1, addDays(TODAY, day - 1));
  legacy
    .query(`UPDATE theory_schedule SET rung = 0, next_review = ? WHERE concept_day = 1`)
    .run(addDays(TODAY, 3));
  legacy
    .query(`INSERT INTO theory_reviews (concept_day, reviewed_at, result) VALUES (1, ?, 'correct')`)
    .run(TODAY);

  const laterToday = addDays(TODAY, 10);
  migrateTheory(legacy, laterToday);

  const due = listDueTheory(legacy, laterToday);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5]);
});
