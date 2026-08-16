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

// Shared backlog cap for the Theory and Goals release gates — see
// docs/superpowers/specs/2026-08-01-backlog-gated-scheduling-design.md.
export const MAX_ACTIVE_BACKLOG = 5;

// backlog: currently-visible due+overdue count for the domain (or project).
// remaining: items past the watermark, still waiting to be released.
// Returns how many of those `remaining` items to release now.
export function releaseCount(
  backlog: number,
  remaining: number,
  cap: number = MAX_ACTIVE_BACKLOG,
): number {
  return Math.min(Math.max(cap - backlog, 0), remaining);
}

// Daily cap on LeetCode spaced-repetition reviews landing on the same date.
export const MAX_DAILY_LEETCODE_REVIEWS = 5;

// Walks forward day-by-day from `start` until it finds a date whose
// existing count (via the caller-supplied lookup) is under the cap —
// first-fit-forward, so overflow cascades onto the earliest day with room.
export function nextAvailableDate(
  start: string,
  countOnDate: (date: string) => number,
  cap: number = MAX_DAILY_LEETCODE_REVIEWS,
): string {
  let date = start;
  while (countOnDate(date) >= cap) {
    date = addDays(date, 1);
  }
  return date;
}
