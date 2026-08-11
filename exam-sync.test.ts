import { test, expect, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { findPendingWeeks, findWeekFolder } from "./exam-sync";

const tempDirs: string[] = [];

function makeCourseDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "exam-sync-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length) rmSync(tempDirs.pop()!, { recursive: true, force: true });
});

test("a week folder with only .DS_Store is not pending", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 1");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, ".DS_Store"), "");

  const pending = findPendingWeeks({ TESTCRS: courseDir });
  expect(pending).toEqual([]);
});

test("a week folder with real material and no existing content is pending", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 3");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "lecture.pdf"), "fake pdf bytes");

  const pending = findPendingWeeks({ TESTCRS: courseDir });
  expect(pending).toEqual([{ course: "TESTCRS", week: 3 }]);
});

test("a week already present in buildExamSchedule() is excluded even with material on disk", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 1");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "lecture.pdf"), "fake pdf bytes");

  // INFO5995 Week 1 already has authored content in exam-content.ts.
  const pending = findPendingWeeks({ INFO5995: courseDir });
  expect(pending).toEqual([]);
});

test("non-'Week N' folders (Readings, Exam, a stray 'Week' with no number) are ignored", () => {
  const courseDir = makeCourseDir();
  for (const name of ["Readings", "Exam", "Week"]) {
    const dir = join(courseDir, name);
    mkdirSync(dir);
    writeFileSync(join(dir, "material.pdf"), "fake pdf bytes");
  }

  const pending = findPendingWeeks({ TESTCRS: courseDir });
  expect(pending).toEqual([]);
});

test("'week 2' (lowercase, no space-padding assumptions) matches case-insensitively", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "week 2");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "slides.pptx"), "fake pptx bytes");

  const pending = findPendingWeeks({ TESTCRS: courseDir });
  expect(pending).toEqual([{ course: "TESTCRS", week: 2 }]);
});

test("a missing course directory is skipped without throwing", () => {
  const pending = findPendingWeeks({ TESTCRS: "/does/not/exist/anywhere" });
  expect(pending).toEqual([]);
});

test("results are sorted by course then week", () => {
  const courseA = makeCourseDir();
  const courseB = makeCourseDir();
  mkdirSync(join(courseA, "Week 5"));
  writeFileSync(join(courseA, "Week 5", "lecture.pdf"), "x");
  mkdirSync(join(courseB, "Week 1"));
  writeFileSync(join(courseB, "Week 1", "lecture.pdf"), "x");
  mkdirSync(join(courseA, "Week 2"));
  writeFileSync(join(courseA, "Week 2", "lecture.pdf"), "x");

  const pending = findPendingWeeks({ BBB: courseB, AAA: courseA });
  expect(pending).toEqual([
    { course: "AAA", week: 2 },
    { course: "AAA", week: 5 },
    { course: "BBB", week: 1 },
  ]);
});

test("findWeekFolder finds a case-insensitively matching Week N folder", () => {
  const courseDir = makeCourseDir();
  mkdirSync(join(courseDir, "week 3"));
  expect(findWeekFolder(courseDir, 3)).toBe(join(courseDir, "week 3"));
});

test("findWeekFolder returns null when no folder matches the target week number", () => {
  const courseDir = makeCourseDir();
  mkdirSync(join(courseDir, "Week 1"));
  expect(findWeekFolder(courseDir, 2)).toBeNull();
});

test("findWeekFolder returns null for a missing course directory", () => {
  expect(findWeekFolder("/does/not/exist/anywhere", 1)).toBeNull();
});

test("findWeekFolder ignores non-'Week N' folders like the pending-weeks scan does", () => {
  const courseDir = makeCourseDir();
  mkdirSync(join(courseDir, "Readings"));
  mkdirSync(join(courseDir, "Week 7"));
  expect(findWeekFolder(courseDir, 7)).toBe(join(courseDir, "Week 7"));
});
