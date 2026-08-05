import { test, expect } from "bun:test";
import { buildExamSchedule, listExamCourses, totalPapersForCourse, COURSES } from "./exam-content";

test("buildExamSchedule assigns sequential 1-based paperDay within each course independently", () => {
  const info5995 = buildExamSchedule().filter((p) => p.course === "INFO5995");
  expect(info5995.length).toBeGreaterThan(0);
  expect(info5995.map((p) => p.paperDay)).toEqual(info5995.map((_, i) => i + 1));
});

test("totalPapersForCourse matches each course's own schedule length", () => {
  for (const { code } of COURSES) {
    const count = buildExamSchedule().filter((p) => p.course === code).length;
    expect(totalPapersForCourse(code)).toBe(count);
  }
});

test("listExamCourses only returns courses that actually have at least one paper", () => {
  const listed = listExamCourses();
  expect(listed.some((c) => c.code === "INFO5995")).toBe(true);
  expect(listed.some((c) => c.code === "INFO5990")).toBe(false); // no papers yet
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

test("INFO5995 Week 1 seeds exactly 3 papers", () => {
  const week1 = buildExamSchedule().filter((p) => p.course === "INFO5995" && p.week === 1);
  expect(week1.map((p) => p.paperNumber)).toEqual([1, 2, 3]);
});

// Pins the (course, week, paperNumber) -> paperDay mapping for every paper
// currently in ALL_PAPERS. paperDay is derived purely from array position
// within a course, and every stored answer/score/review-item in the
// database keys on (course, paperDay) with no week/paperNumber cross-check.
// If a future content edit ever reorders, inserts, or removes a paper, this
// trips instead of silently re-pointing every existing student's stored
// answers at different questions.
test("(course, week, paperNumber) -> paperDay mapping is pinned for every current paper", () => {
  const expected = [
    { course: "INFO5995", week: 1, paperNumber: 1, expectedPaperDay: 1 },
    { course: "INFO5995", week: 1, paperNumber: 2, expectedPaperDay: 2 },
    { course: "INFO5995", week: 1, paperNumber: 3, expectedPaperDay: 3 },
  ];
  const schedule = buildExamSchedule();
  expect(schedule.length).toBe(expected.length);
  for (const { course, week, paperNumber, expectedPaperDay } of expected) {
    const paper = schedule.find((p) => p.course === course && p.week === week && p.paperNumber === paperNumber);
    expect(paper).toBeDefined();
    expect(paper!.paperDay).toBe(expectedPaperDay);
  }
});
