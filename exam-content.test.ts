import { test, expect } from "bun:test";
import { buildExamSchedule, TOTAL_PAPERS } from "./exam-content";

test("buildExamSchedule assigns sequential 1-based paperDay across all papers", () => {
  const schedule = buildExamSchedule();
  expect(schedule.length).toBeGreaterThan(0);
  expect(schedule.map((p) => p.paperDay)).toEqual(schedule.map((_, i) => i + 1));
});

test("TOTAL_PAPERS matches the schedule length", () => {
  expect(TOTAL_PAPERS).toBe(buildExamSchedule().length);
});

test("every paper has at least one question and a non-empty title", () => {
  for (const paper of buildExamSchedule()) {
    expect(paper.questions.length).toBeGreaterThan(0);
    expect(paper.title.length).toBeGreaterThan(0);
  }
});

test("mcq/truefalse questions all have options and a valid correctIndex", () => {
  for (const paper of buildExamSchedule()) {
    for (const q of paper.questions) {
      if (q.type === "mcq" || q.type === "truefalse") {
        expect(q.options && q.options.length).toBeGreaterThan(0);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex!).toBeLessThan(q.options!.length);
      }
    }
  }
});

test("every question has a non-empty prompt and modelAnswer", () => {
  for (const paper of buildExamSchedule()) {
    for (const q of paper.questions) {
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.modelAnswer.length).toBeGreaterThan(0);
    }
  }
});

test("Week 1 seeds exactly 3 papers", () => {
  const week1 = buildExamSchedule().filter((p) => p.week === 1);
  expect(week1.map((p) => p.paperNumber)).toEqual([1, 2, 3]);
});

// Pins the (week, paperNumber) -> paperDay mapping for every paper currently
// in ALL_PAPERS. paperDay is derived purely from array position, and every
// stored answer/score/review-item in the database keys on that integer with
// no week/paperNumber cross-check. If a future content edit ever reorders,
// inserts, or removes a paper, this trips instead of silently re-pointing
// every existing student's stored answers at different questions.
test("(week, paperNumber) -> paperDay mapping is pinned for every current paper", () => {
  const expected = [
    { week: 1, paperNumber: 1, expectedPaperDay: 1 },
    { week: 1, paperNumber: 2, expectedPaperDay: 2 },
    { week: 1, paperNumber: 3, expectedPaperDay: 3 },
  ];
  const schedule = buildExamSchedule();
  expect(schedule.length).toBe(expected.length);
  for (const { week, paperNumber, expectedPaperDay } of expected) {
    const paper = schedule.find((p) => p.week === week && p.paperNumber === paperNumber);
    expect(paper).toBeDefined();
    expect(paper!.paperDay).toBe(expectedPaperDay);
  }
});
