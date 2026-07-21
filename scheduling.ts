// Fixed spaced-repetition ladder, in days. Pass climbs a rung, fail resets.
export const LADDER = [1, 3, 7, 14, 30];

export type ReviewResult = "pass" | "fail";

export interface Schedule {
  rung: number;
  nextReview: string; // local 'YYYY-MM-DD'
}

const pad = (n: number) => String(n).padStart(2, "0");

export function localToday(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return localToday(new Date(y!, m! - 1, d! + days));
}

export function initialSchedule(today: string): Schedule {
  return { rung: 0, nextReview: addDays(today, LADDER[0]!) };
}

export function applyReview(
  rung: number,
  result: ReviewResult,
  today: string,
): Schedule {
  const next = result === "pass" ? Math.min(rung + 1, LADDER.length - 1) : 0;
  return { rung: next, nextReview: addDays(today, LADDER[next]!) };
}

export function isDue(nextReview: string, today: string): boolean {
  return nextReview <= today;
}
