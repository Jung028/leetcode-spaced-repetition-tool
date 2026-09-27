import { addDays } from "../scheduling";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function weekdayOf(date: string): Weekday {
  const [y, m, d] = date.split("-").map(Number);
  const jsDay = new Date(y!, m! - 1, d!).getDay(); // 0=Sun..6=Sat
  return WEEKDAYS[(jsDay + 6) % 7]!;
}

export function mondayOf(date: string): string {
  const idx = WEEKDAYS.indexOf(weekdayOf(date));
  return addDays(date, -idx);
}

export function datesOfWeek(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Deliberately not toLocaleDateString(undefined, ...): its month/day order
// depends on the runtime's default locale (confirmed under Bun: it renders
// "Sep 28", not "28 Sep") — this needs one fixed, locale-independent format.
export function shortDate(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m! - 1]}`;
}
