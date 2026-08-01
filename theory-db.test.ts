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

const TODAY = "2026-07-20";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateTheory(db, TODAY);
});

test("seeds 150 concepts, one introduced per day starting today", () => {
  expect(getTheoryConcept(db, 1)).toEqual({
    concept_day: 1,
    rung: -1,
    next_review: "2026-07-20",
    your_answer: "",
  });
  expect(getTheoryConcept(db, 2)!.next_review).toBe("2026-07-21");
  expect(getTheoryConcept(db, 150)!.next_review).toBe("2026-12-16");
});

test("migrateTheory does not reseed (and doesn't reset progress) on a second call", () => {
  reviewTheoryConcept(db, 1, "correct", TODAY);
  migrateTheory(db, TODAY);
  expect(getTheoryConcept(db, 1)!.rung).toBe(0);
});

test("listDueTheory on day one returns only concept 1 (everything else is in the future)", () => {
  const due = listDueTheory(db, TODAY);
  expect(due.length).toBe(1);
  expect(due[0]!.concept_day).toBe(1);
});

test("listDueTheory a week later includes everything introduced by then, oldest first", () => {
  const due = listDueTheory(db, "2026-07-27");
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
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
  // concept 2 isn't due yet on TODAY, but reviewing is still just a DB
  // write — the API layer is what should stop you from reviewing early.
  reviewTheoryConcept(db, 2, "wrong", TODAY);
  reviewTheoryConcept(db, 3, "correct", "2026-07-10");
  expect(countTheoryReviewsToday(db, TODAY)).toBe(2);
});

test("countOverdueTheory counts strictly-past next_review dates, not today's", () => {
  expect(countOverdueTheory(db, TODAY)).toBe(0);
  expect(countOverdueTheory(db, "2026-07-22")).toBe(2); // concepts 1 and 2 are now overdue
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
