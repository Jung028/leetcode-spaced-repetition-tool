import { addDays } from "./scheduling";

// Same shape as scheduling.ts's ladder, but with its own interval sequence
// and starting point: 3 → 5 → 7 → 14 → 30 days. rung -1 means "never yet
// answered correctly" (distinct from leetcode's problems, which are added
// ad hoc; every theory concept starts in this state on day one of the
// curriculum), so the first correct answer lands on THEORY_LADDER[0] = 3,
// not skips ahead to 5.
export const THEORY_LADDER = [3, 5, 7, 14, 30];

export type TheoryResult = "correct" | "wrong";

export interface TheorySchedule {
  rung: number;
  nextReview: string;
}

// Concepts are introduced one per day so the 150-day curriculum still paces
// out on its own even before any review happens: concept 1 is due today,
// concept 2 tomorrow, concept 150 in 149 days.
export function initialTheorySchedule(today: string, conceptDay: number): TheorySchedule {
  return { rung: -1, nextReview: addDays(today, conceptDay - 1) };
}

export function applyTheoryReview(
  rung: number,
  result: TheoryResult,
  today: string,
): TheorySchedule {
  if (result === "wrong") return { rung: -1, nextReview: addDays(today, 1) };
  const next = Math.min(rung + 1, THEORY_LADDER.length - 1);
  return { rung: next, nextReview: addDays(today, THEORY_LADDER[next]!) };
}
