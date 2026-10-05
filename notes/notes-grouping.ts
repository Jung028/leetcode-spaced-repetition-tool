// notes/notes-grouping.ts
import type { Note } from "./notes-client";

export interface DayGroup {
  dateKey: string;
  label: string;
  notes: Note[];
}

const ID_TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z-/;

// Note ids are timestampId()'s output in notes-repo.ts: an ISO instant with
// `:`/`.` swapped for `-` (filesystem-safe), plus a random suffix. This
// reverses that encoding to recover the instant the note was created at.
export function parseNoteTimestamp(id: string): Date | null {
  const match = ID_TIMESTAMP_RE.exec(id);
  if (!match) return null;
  const [, date, hh, mm, ss, mmm] = match;
  const parsed = new Date(`${date}T${hh}:${mm}:${ss}.${mmm}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const DATE_KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function dateFromKey(dateKey: string): Date {
  const match = DATE_KEY_RE.exec(dateKey);
  if (!match) throw new Error(`invalid dateKey: ${dateKey}`);
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(now: Date = new Date()): string {
  return localDateKey(now);
}

export function labelForDate(date: Date, now: Date = new Date()): string {
  const dateKey = localDateKey(date);
  if (dateKey === localDateKey(now)) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === localDateKey(yesterday)) return "Yesterday";

  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${weekday}, ${date.getDate()} ${month}`;
}

// dateKey is "YYYY-MM-DD"; parsed via explicit components (not Date.parse)
// so the result reflects the local calendar day regardless of UTC offset.
export function labelForDateKey(dateKey: string, now: Date = new Date()): string {
  return labelForDate(dateFromKey(dateKey), now);
}

// Notes arrive newest-first (every client sorts by id descending); this
// preserves that order both within a day and across days.
export function groupNotesByDay(notes: Note[], now: Date = new Date()): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const note of notes) {
    const timestamp = parseNoteTimestamp(note.id) ?? now;
    const dateKey = localDateKey(timestamp);
    let group = groups.get(dateKey);
    if (!group) {
      group = { dateKey, label: labelForDate(timestamp, now), notes: [] };
      groups.set(dateKey, group);
    }
    group.notes.push(note);
  }
  return Array.from(groups.values());
}

// dateKey is "YYYY-MM-DD"; parsed via explicit components (not Date.parse)
// so the result reflects the local calendar day regardless of UTC offset.
// Built manually (not toLocaleDateString) so the day-before-month order is
// consistent across locales, e.g. "Wed, 30 Sep 2026".
export function formatFullDate(dateKey: string): string {
  const date = dateFromKey(dateKey);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}`;
}

export interface MonthGroup {
  monthKey: string;
  label: string;
  noteCount: number;
  days: DayGroup[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Takes groupNotesByDay's output, so day bucketing, day order and the
// Today / Yesterday labels are decided in exactly one place.
export function groupDaysByMonth(groups: DayGroup[]): MonthGroup[] {
  const months = new Map<string, MonthGroup>();
  for (const day of groups) {
    const monthKey = day.dateKey.slice(0, 7);
    let month = months.get(monthKey);
    if (!month) {
      const [year, monthNumber] = monthKey.split("-").map(Number);
      month = { monthKey, label: `${MONTH_NAMES[monthNumber! - 1]} ${year}`, noteCount: 0, days: [] };
      months.set(monthKey, month);
    }
    month.days.push(day);
    month.noteCount += day.notes.length;
  }
  return Array.from(months.values());
}

export function formatNoteTime(id: string): string {
  const timestamp = parseNoteTimestamp(id);
  if (!timestamp) return id;
  const hours = String(timestamp.getHours()).padStart(2, "0");
  const minutes = String(timestamp.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatRelativeTime(from: Date, now: Date = new Date()): string {
  const diffMin = Math.floor((now.getTime() - from.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return "1 hour ago";
  if (diffHr < 24) return `${diffHr} hours ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "1 day ago";
  return `${diffDay} days ago`;
}
