import { test, expect } from "bun:test";
import {
  parseNoteTimestamp,
  groupNotesByDay,
  formatRelativeTime,
  formatFullDate,
  labelForDateKey,
  todayKey,
} from "./notes-grouping";
import type { Note } from "./notes-client";

function idFor(date: Date, suffix = "aaaa"): string {
  return `${date.toISOString().replace(/[:.]/g, "-")}-${suffix}`;
}

function noteAt(date: Date, text: string, suffix = "aaaa"): Note {
  const id = idFor(date, suffix);
  return { id, text, createdAt: id };
}

function first<T>(arr: T[]): T {
  const [item] = arr;
  if (item === undefined) throw new Error("expected at least one item");
  return item;
}

test("parseNoteTimestamp reconstructs the original instant from a note id", () => {
  const date = parseNoteTimestamp("2026-09-30T16-14-53-196Z-15dp");
  expect(date?.toISOString()).toBe("2026-09-30T16:14:53.196Z");
});

test("parseNoteTimestamp returns null for an id that doesn't match the timestamp shape", () => {
  expect(parseNoteTimestamp("not-a-timestamp")).toBeNull();
});

test("groupNotesByDay labels the current local day as Today", () => {
  const now = new Date(2026, 9, 1, 10, 0, 0);
  const notes = [noteAt(now, "today note")];
  const groups = groupNotesByDay(notes, now);
  expect(groups).toHaveLength(1);
  expect(first(groups).label).toBe("Today");
  expect(first(groups).notes.map((n) => n.text)).toEqual(["today note"]);
});

test("groupNotesByDay labels the previous local day as Yesterday", () => {
  const now = new Date(2026, 9, 1, 10, 0, 0);
  const yesterday = new Date(2026, 8, 30, 14, 0, 0);
  const notes = [noteAt(yesterday, "yesterday note")];
  const groups = groupNotesByDay(notes, now);
  expect(groups).toHaveLength(1);
  expect(first(groups).label).toBe("Yesterday");
});

test("groupNotesByDay uses a weekday/date label for older days", () => {
  const now = new Date(2026, 9, 1, 10, 0, 0);
  const older = new Date(2026, 8, 28, 9, 0, 0); // Monday 28 Sept 2026
  const notes = [noteAt(older, "old note")];
  const groups = groupNotesByDay(notes, now);
  expect(groups).toHaveLength(1);
  expect(first(groups).label).toMatch(/Mon/);
  expect(first(groups).label).toMatch(/28/);
});

test("groupNotesByDay buckets multiple notes from the same day together, preserving order", () => {
  const now = new Date(2026, 9, 1, 10, 0, 0);
  const a = noteAt(new Date(2026, 9, 1, 9, 0, 0), "first", "aaaa");
  const b = noteAt(new Date(2026, 9, 1, 8, 0, 0), "second", "bbbb");
  const groups = groupNotesByDay([a, b], now);
  expect(groups).toHaveLength(1);
  expect(first(groups).notes.map((n) => n.text)).toEqual(["first", "second"]);
});

test("groupNotesByDay orders groups newest-day-first", () => {
  const now = new Date(2026, 9, 1, 10, 0, 0);
  const today = noteAt(now, "today note");
  const yesterday = noteAt(new Date(2026, 8, 30, 10, 0, 0), "yesterday note");
  const groups = groupNotesByDay([today, yesterday], now);
  expect(groups.map((g) => g.label)).toEqual(["Today", "Yesterday"]);
});

test("groupNotesByDay falls back to today's bucket for an id it can't parse", () => {
  const now = new Date(2026, 9, 1, 10, 0, 0);
  const notes: Note[] = [{ id: "weird-id", text: "mystery note", createdAt: "weird-id" }];
  const groups = groupNotesByDay(notes, now);
  expect(groups).toHaveLength(1);
  expect(first(groups).label).toBe("Today");
});

test("formatRelativeTime renders sub-minute gaps as just now", () => {
  const now = new Date(2026, 9, 1, 10, 0, 30);
  const from = new Date(2026, 9, 1, 10, 0, 0);
  expect(formatRelativeTime(from, now)).toBe("just now");
});

test("formatRelativeTime renders minute-scale gaps", () => {
  const now = new Date(2026, 9, 1, 10, 2, 0);
  const from = new Date(2026, 9, 1, 10, 0, 0);
  expect(formatRelativeTime(from, now)).toBe("2 min ago");
});

test("formatRelativeTime renders hour-scale gaps", () => {
  const now = new Date(2026, 9, 1, 13, 0, 0);
  const from = new Date(2026, 9, 1, 10, 0, 0);
  expect(formatRelativeTime(from, now)).toBe("3 hours ago");
});

test("formatRelativeTime renders singular hour correctly", () => {
  const now = new Date(2026, 9, 1, 11, 0, 0);
  const from = new Date(2026, 9, 1, 10, 0, 0);
  expect(formatRelativeTime(from, now)).toBe("1 hour ago");
});

test("formatFullDate renders a weekday, day, month, and year", () => {
  expect(formatFullDate("2026-09-30")).toMatch(/Wed.*30.*Sep.*2026/);
});

test("labelForDateKey labels a day with no notes yet as Today when it is today", () => {
  const now = new Date(2026, 9, 1, 10, 0, 0);
  expect(labelForDateKey(todayKey(now), now)).toBe("Today");
});

test("todayKey matches the dateKey groupNotesByDay assigns to a same-day note", () => {
  const now = new Date(2026, 9, 1, 10, 0, 0);
  const notes = [noteAt(now, "today note")];
  const groups = groupNotesByDay(notes, now);
  expect(first(groups).dateKey).toBe(todayKey(now));
});

