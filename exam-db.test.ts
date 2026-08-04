import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateExam,
  listDueExamPapers,
  getExamPaperRow,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countOverdueExamPapers,
  countExamPapersSubmittedToday,
  listDueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
} from "./exam-db";
import { TOTAL_PAPERS, buildExamSchedule } from "./exam-content";
import { addDays } from "./scheduling";

const TODAY = "2026-08-04";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateExam(db, TODAY);
});

test("seeds every paper, releasing the first 5 immediately under the backlog cap", () => {
  expect(getExamPaperRow(db, 1)!.next_review).toBe(TODAY);
  const releasedCount = Math.min(5, TOTAL_PAPERS);
  expect(getExamPaperRow(db, releasedCount)!.next_review).toBe(TODAY);
  if (TOTAL_PAPERS > 5) {
    expect(getExamPaperRow(db, 6)!.next_review).toBe(addDays(TODAY, 6));
  }
});

test("migrateExam does not reseed or reset progress on a second call", () => {
  saveExamAnswer(db, 1, 0, "draft");
  migrateExam(db, TODAY);
  const answer = getExamPaperRow(db, 1);
  expect(answer).not.toBeNull();
});

test("listDueExamPapers returns the first released, unsubmitted paper first", () => {
  const due = listDueExamPapers(db, TODAY);
  expect(due.length).toBeGreaterThan(0);
  expect(due[0]!.paper_day).toBe(1);
});

test("saveExamAnswer stores a draft without grading it", () => {
  saveExamAnswer(db, 1, 0, "my draft");
  const paper1Questions = buildExamSchedule()[0]!.questions;
  expect(paper1Questions.length).toBeGreaterThan(0);
});

test("submitExamPaper rejects submission until every question is graded", () => {
  const result = submitExamPaper(db, 1, TODAY);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("incomplete");
});

test("submitExamPaper computes score, marks submitted, and creates review items for wrong answers", () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, i !== 0)); // question 0 wrong, rest correct

  const result = submitExamPaper(db, 1, TODAY);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.scoreTotal).toBe(paper1.questions.length);
    expect(result.scoreCorrect).toBe(paper1.questions.length - 1);
  }

  const paperRow = getExamPaperRow(db, 1)!;
  expect(paperRow.submitted_at).toBe(TODAY);

  const dueReviews = listDueExamReviewItems(db, addDays(TODAY, 1));
  expect(dueReviews.length).toBe(1);
  expect(dueReviews[0]!.question_index).toBe(0);
});

test("a submitted paper is no longer listed as due", () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, true));
  submitExamPaper(db, 1, TODAY);

  const due = listDueExamPapers(db, TODAY);
  expect(due.find((p) => p.paper_day === 1)).toBeUndefined();
});

test("submitExamPaper rejects a second submission of the same paper", () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, true));
  submitExamPaper(db, 1, TODAY);

  const second = submitExamPaper(db, 1, TODAY);
  expect(second.ok).toBe(false);
  if (!second.ok) expect(second.reason).toBe("already_submitted");
});

test("countExamPapersSubmittedToday and countOverdueExamPapers track separately", () => {
  expect(countExamPapersSubmittedToday(db, TODAY)).toBe(0);
  expect(countOverdueExamPapers(db, TODAY)).toBe(0);

  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, true));
  submitExamPaper(db, 1, TODAY);
  expect(countExamPapersSubmittedToday(db, TODAY)).toBe(1);
});

test("reviewExamItem applies the ladder and logs the attempt", () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, i !== 0));
  submitExamPaper(db, 1, TODAY);

  const tomorrow = addDays(TODAY, 1);
  const updated = reviewExamItem(db, 1, 0, "correct", tomorrow)!;
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(tomorrow, 3));
  expect(countExamReviewsToday(db, tomorrow)).toBe(1);
});

test("reviewExamItem returns null for an item that isn't in the review queue", () => {
  expect(reviewExamItem(db, 1, 5, "correct", TODAY)).toBeNull();
});
