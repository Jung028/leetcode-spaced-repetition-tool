// Human-readable "how long until this is due" label for planner rows.
//
// `dueAt` is either 'YYYY-MM-DD' (no specific time — treated as the end of that
// day) or 'YYYY-MM-DDTHH:MM' (a specific local wall-clock moment). The label
// mirrors the row-colour thresholds: whole days remaining, except on the final
// day, when it also shows the hours/minutes left in parentheses.

import { localToday } from "./shared/scheduling";

// Parse the stored value into a local Date. Date-only values are due at the
// last minute of that day (23:59), matching the form's "no time set" case.
function dueMoment(dueAt: string): Date {
  const [datePart, timePart] = dueAt.split("T");
  const [y, m, d] = datePart!.split("-").map(Number);
  if (timePart) {
    const [hh, mm] = timePart.split(":").map(Number);
    return new Date(y!, m! - 1, d!, hh ?? 0, mm ?? 0, 0, 0);
  }
  return new Date(y!, m! - 1, d!, 23, 59, 0, 0);
}

// Whole calendar days from today to the due date (negative = overdue). Same
// midnight-to-midnight UTC rounding `daysUntilDue` in ModulePlanner uses, so
// the label and the row colour never disagree.
function wholeDaysLeft(dueAt: string, now: Date): number {
  const day = 86_400_000;
  const due = Date.parse(dueAt.slice(0, 10));
  const today = Date.parse(localToday(now));
  return Math.round((due - today) / day);
}

// The fine-grained remainder shown on the final day: "13 minutes left",
// "3 hours left", or "less than a minute left".
function fineGrained(msLeft: number): string {
  const minutes = Math.floor(msLeft / 60_000);
  if (minutes < 1) return "less than a minute left";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} left`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} left`;
}

export function deadlineLabel(dueAt: string, now: Date = new Date()): string {
  const days = wholeDaysLeft(dueAt, now);

  if (days >= 2) return `${days} days left`;
  if (days === 1) return "1 day left";

  if (days === 0) {
    const msLeft = dueMoment(dueAt).getTime() - now.getTime();
    if (msLeft <= 0) return "overdue";
    return `0 days left (${fineGrained(msLeft)})`;
  }

  if (days === -1) return "1 day overdue";
  return `${-days} days overdue`;
}
