import { test, expect } from "bun:test";
import {
  buildExamSchedule,
  listExamCourses,
  COURSES,
  SEMESTER_START,
  weekStartDate,
  weekDueDate,
  groupExamPapersByWeek,
} from "./exam-content";

test("weekStartDate/weekDueDate compute the Monday/Sunday of the given week", () => {
  expect(weekStartDate(1)).toBe(SEMESTER_START); // 2026-08-03, a Monday
  expect(weekDueDate(1)).toBe("2026-08-09"); // that week's Sunday
  expect(weekStartDate(2)).toBe("2026-08-10");
  expect(weekDueDate(2)).toBe("2026-08-16");
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

test("INFO5995 Week 1 has exactly 3 papers, numbered 1-3", () => {
  const week1 = buildExamSchedule().filter((p) => p.course === "INFO5995" && p.week === 1);
  expect(week1.map((p) => p.paperNumber).sort()).toEqual([1, 2, 3]);
});

test("groupExamPapersByWeek groups multiple papers in the same week into one entry", () => {
  const rows = [
    { week: 1, paper_number: 1, submitted_at: "2026-08-05", score_correct: 20, score_total: 26 },
    { week: 1, paper_number: 2, submitted_at: null, score_correct: null, score_total: null },
    { week: 1, paper_number: 3, submitted_at: null, score_correct: null, score_total: null },
  ];
  const groups = groupExamPapersByWeek("INFO5995", rows, "2026-08-05");
  expect(groups.length).toBe(1);
  expect(groups[0]!.week).toBe(1);
  expect(groups[0]!.dueDate).toBe("2026-08-09");
  expect(groups[0]!.overdue).toBe(false);
  expect(groups[0]!.papers.length).toBe(3);
  expect(groups[0]!.papers.map((p) => p.paperNumber)).toEqual([1, 2, 3]);
  expect(groups[0]!.papers[0]!.submitted).toBe(true);
  expect(groups[0]!.papers[0]!.title.length).toBeGreaterThan(0);
  expect(groups[0]!.papers[1]!.submitted).toBe(false);
});

test("groupExamPapersByWeek marks a week overdue once today passes its due date", () => {
  const rows = [{ week: 1, paper_number: 1, submitted_at: null, score_correct: null, score_total: null }];
  const groups = groupExamPapersByWeek("INFO5995", rows, "2026-08-10"); // one day after 2026-08-09
  expect(groups[0]!.overdue).toBe(true);
});

test("groupExamPapersByWeek separates different weeks into different entries, sorted", () => {
  const rows = [
    { week: 2, paper_number: 1, submitted_at: null, score_correct: null, score_total: null },
    { week: 1, paper_number: 1, submitted_at: null, score_correct: null, score_total: null },
  ];
  const groups = groupExamPapersByWeek("INFO5995", rows, "2026-08-05");
  expect(groups.map((g) => g.week)).toEqual([1, 2]);
});
