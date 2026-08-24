import { test, expect, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { findWeekUpdates } from "./find-week-updates";

const tempDirs: string[] = [];

function makeCourseDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "find-week-updates-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length) rmSync(tempDirs.pop()!, { recursive: true, force: true });
});

test("a week with material and no authored content shows up in newWeeks, not updatableWeeks", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 3");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "lecture.pdf"), "fake pdf bytes");

  const plan = findWeekUpdates({ TESTCRS: courseDir });
  expect(plan.newWeeks).toEqual([{ course: "TESTCRS", week: 3, weekDir }]);
  expect(plan.updatableWeeks).toEqual([]);
});

test("an already-authored week (INFO5995 Week 1) with an unlisted new material file is updatable", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 1");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "extra-tutorial-notes.pdf"), "fake pdf bytes");

  const plan = findWeekUpdates({ INFO5995: courseDir });
  expect(plan.newWeeks).toEqual([]);
  expect(plan.updatableWeeks).toEqual([
    { course: "INFO5995", week: 1, weekDir, newSourceFiles: ["extra-tutorial-notes.pdf"], pendingVideos: [] },
  ]);
});

test("an already-authored week with no new material on disk is neither new nor updatable", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 1");
  mkdirSync(weekDir);

  const plan = findWeekUpdates({ INFO5995: courseDir });
  expect(plan.newWeeks).toEqual([]);
  expect(plan.updatableWeeks).toEqual([]);
});

test("a video with no transcript yet is flagged as a pending video, not a new source file", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 1");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "lecture.mp4"), "fake video bytes");

  const plan = findWeekUpdates({ INFO5995: courseDir });
  expect(plan.updatableWeeks).toEqual([
    { course: "INFO5995", week: 1, weekDir, newSourceFiles: [], pendingVideos: ["lecture.mp4"] },
  ]);
});

test("a video whose transcript already exists is picked up as a new source file, not a pending video", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 1");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "lecture.mp4"), "fake video bytes");
  writeFileSync(join(weekDir, "lecture.transcript.md"), "# transcript");

  const plan = findWeekUpdates({ INFO5995: courseDir });
  expect(plan.updatableWeeks).toEqual([
    { course: "INFO5995", week: 1, weekDir, newSourceFiles: ["lecture.transcript.md"], pendingVideos: [] },
  ]);
});

test("a course with no real folder on disk (e.g. TRACELY) is skipped without throwing", () => {
  const plan = findWeekUpdates({});
  expect(plan.updatableWeeks.some((w) => w.course === "TRACELY")).toBe(false);
});

test("results are sorted by course then week", () => {
  const courseA = makeCourseDir();
  mkdirSync(join(courseA, "Week 1"));
  writeFileSync(join(courseA, "Week 1", "extra.pdf"), "x");

  const courseB = makeCourseDir();
  mkdirSync(join(courseB, "Week 1"));
  writeFileSync(join(courseB, "Week 1", "extra.pdf"), "x");

  // Both INFO5995 and COMP5348 already have Week 1 authored content.
  const plan = findWeekUpdates({ COMP5348: courseB, INFO5995: courseA });
  expect(plan.updatableWeeks.map((w) => w.course)).toEqual(["COMP5348", "INFO5995"]);
});
