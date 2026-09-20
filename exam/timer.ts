import type { ExamQuestionType } from "../exam-content/types";

// The subset of a question the pacing heuristic actually looks at. Kept
// structural (not the full ExamQuestionView) so the function is trivial to
// unit-test without building a whole question row.
export interface TimeBudgetQuestion {
  type: ExamQuestionType;
  options?: string[] | null;
  promptImage?: string | null;
  promptDiagram?: string | null;
}

// Base seconds per question type before any per-question adjustment.
const BASE_SECONDS: Record<ExamQuestionType, number> = {
  truefalse: 20,
  mcq: 30,
  multi: 45,
  short: 150,
  scenario: 180,
};

// Seconds allowed for one question — shown in the quiz header; once it runs
// out the timer goes red and the question is auto-marked wrong (see
// isOvertime). Base time for the type, plus 10s for
// every option past the fourth, plus 15s when there's an image or diagram to
// read before answering.
export function questionTimeBudget(q: TimeBudgetQuestion): number {
  let seconds = BASE_SECONDS[q.type] ?? 30;
  const extraOptions = Math.max(0, (q.options?.length ?? 0) - 4);
  seconds += extraOptions * 10;
  if (q.promptImage || q.promptDiagram) seconds += 15;
  return seconds;
}

// True once the timer has gone red — the first second past the budget. The
// header styles itself off this and the quiz auto-marks the question wrong
// and moves on when it flips, so both must share one definition of "red".
export function isOvertime(elapsedSeconds: number, budgetSeconds: number): boolean {
  return elapsedSeconds > budgetSeconds;
}

// Formats a remaining-seconds count as `m:ss`. Once it goes negative (over
// budget) the sign flips to a leading `+` so the header reads "+0:12" overtime.
export function formatCountdown(remainingSeconds: number): string {
  const over = remainingSeconds < 0;
  const abs = Math.abs(remainingSeconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${over ? "+" : ""}${m}:${s.toString().padStart(2, "0")}`;
}
