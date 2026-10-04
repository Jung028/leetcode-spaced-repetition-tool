import { addDays } from "../scheduling";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ISO dates compare correctly as strings, so "is this Monday still inside
// or before the month" is a plain prefix comparison.
export function monthWeeks(anyDateInMonth: string): string[] {
  const monthKey = anyDateInMonth.slice(0, 7);
  const mondays: string[] = [];
  for (let monday = mondayOf(`${monthKey}-01`); monday.slice(0, 7) <= monthKey; monday = addDays(monday, 7)) {
    mondays.push(monday);
  }
  return mondays;
}

export function monthLabel(date: string): string {
  const [year, month] = date.split("-").map(Number);
  return `${MONTH_NAMES[month! - 1]} ${year}`;
}

export function monthsOfYear(date: string): string[] {
  const year = date.slice(0, 4);
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}-01`);
}
