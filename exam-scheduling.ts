import { addDays } from "./scheduling";

// Own interval sequence for missed exam questions, kept as its own module
// even though the values match theory-scheduling.ts's ladder — see that
// file's comment: every spaced-repetition tab owns its ladder independently.
export const EXAM_REVIEW_LADDER = [3, 5, 7, 14, 30];

export type ExamReviewResult = "correct" | "wrong";

export interface ExamReviewSchedule {
  rung: number;
  nextReview: string;
}

// A question only enters the review ladder when a submitted paper marks it
// wrong — it starts one rung below the first climb (-1), due tomorrow, same
// shape as a fresh Theory "wrong" reset.
export function initialExamReviewSchedule(today: string): ExamReviewSchedule {
  return { rung: -1, nextReview: addDays(today, 1) };
}

export function applyExamReview(
  rung: number,
  result: ExamReviewResult,
  today: string,
): ExamReviewSchedule {
  if (result === "wrong") return { rung: -1, nextReview: addDays(today, 1) };
  const next = Math.min(rung + 1, EXAM_REVIEW_LADDER.length - 1);
  return { rung: next, nextReview: addDays(today, EXAM_REVIEW_LADDER[next]!) };
}
