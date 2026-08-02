import { test, expect } from "bun:test";
import {
  buildTheorySchedule,
  SYSTEM_DESIGN,
  DSA,
  DISTRIBUTED,
  DATABASES,
  NETWORKING_OS,
  BEHAVIORAL,
} from "./theory-content";

test("schedule has exactly 150 days, numbered 1..150 with no gaps", () => {
  const schedule = buildTheorySchedule();
  expect(schedule.length).toBe(150);
  expect(schedule.map((c) => c.day)).toEqual(
    Array.from({ length: 150 }, (_, i) => i + 1),
  );
});

// Content is intentionally blank right now — the 150 day/category slots are
// placeholders for the user to fill in their own concepts, so there's no
// non-empty-content invariant to assert here anymore.

test("category counts match the source arrays", () => {
  const schedule = buildTheorySchedule();
  const counts = new Map<string, number>();
  for (const c of schedule) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);

  expect(counts.get("System Design")).toBe(SYSTEM_DESIGN.length);
  expect(counts.get("Data Structures & Algorithms")).toBe(DSA.length);
  expect(counts.get("Distributed Systems")).toBe(DISTRIBUTED.length);
  expect(counts.get("Databases")).toBe(DATABASES.length);
  expect(counts.get("Networking & OS")).toBe(NETWORKING_OS.length);
  expect(counts.get("Behavioral")).toBe(BEHAVIORAL.length);

  expect(SYSTEM_DESIGN.length).toBe(50);
  expect(DSA.length).toBe(30);
  expect(DISTRIBUTED.length).toBe(20);
  expect(DATABASES.length).toBe(20);
  expect(NETWORKING_OS.length).toBe(15);
  expect(BEHAVIORAL.length).toBe(15);
});

test("interleaving preserves each category's internal question order", () => {
  const schedule = buildTheorySchedule();
  const seenByCategory = new Map<string, string[]>();
  for (const c of schedule) {
    const list = seenByCategory.get(c.category) ?? [];
    list.push(c.question);
    seenByCategory.set(c.category, list);
  }
  expect(seenByCategory.get("System Design")).toEqual(SYSTEM_DESIGN.map((s) => s.question));
  expect(seenByCategory.get("Data Structures & Algorithms")).toEqual(DSA.map((s) => s.question));
  expect(seenByCategory.get("Behavioral")).toEqual(BEHAVIORAL.map((s) => s.question));
});

test("no single category is bunched entirely at the start (spread across the timeline)", () => {
  const schedule = buildTheorySchedule();
  const firstTenCategories = new Set(schedule.slice(0, 10).map((c) => c.category));
  // With 6 categories proportionally interleaved, the first 10 days should
  // touch more than just one category.
  expect(firstTenCategories.size).toBeGreaterThan(1);
});
