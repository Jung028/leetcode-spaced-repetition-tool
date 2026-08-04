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
