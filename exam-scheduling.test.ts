import { test, expect } from "bun:test";
import { EXAM_REVIEW_LADDER, initialExamReviewSchedule, applyExamReview } from "./exam-scheduling";

test("ladder is 3, 5, 7, 14, 30 days", () => {
  expect(EXAM_REVIEW_LADDER).toEqual([3, 5, 7, 14, 30]);
});

test("a freshly-missed question is due tomorrow at rung -1", () => {
  expect(initialExamReviewSchedule("2026-07-20")).toEqual({ rung: -1, nextReview: "2026-07-21" });
});

test("first correct review climbs to rung 0, due 3 days out", () => {
  expect(applyExamReview(-1, "correct", "2026-07-20")).toEqual({ rung: 0, nextReview: "2026-07-23" });
});

test("ladder climbs 3 -> 5 -> 7 -> 14 -> 30 with successive correct reviews", () => {
  expect(applyExamReview(0, "correct", "2026-07-20").nextReview).toBe("2026-07-25");
  expect(applyExamReview(1, "correct", "2026-07-20").nextReview).toBe("2026-07-27");
  expect(applyExamReview(2, "correct", "2026-07-20").nextReview).toBe("2026-08-03");
  expect(applyExamReview(3, "correct", "2026-07-20").nextReview).toBe("2026-08-19");
});

test("correct at the top rung stays at 30 days", () => {
  expect(applyExamReview(4, "correct", "2026-07-20")).toEqual({ rung: 4, nextReview: "2026-08-19" });
});

test("wrong always resets to rung -1, due tomorrow, regardless of prior rung", () => {
  expect(applyExamReview(3, "wrong", "2026-07-20")).toEqual({ rung: -1, nextReview: "2026-07-21" });
  expect(applyExamReview(-1, "wrong", "2026-07-20")).toEqual({ rung: -1, nextReview: "2026-07-21" });
});
