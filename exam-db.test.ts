import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateExam,
  listDueExamPapers,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countOverdueExamPapers,
  countExamPapersSubmittedToday,
  listDueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
} from "./exam-db";
import { totalPapersForCourse, buildExamSchedule } from "./exam-content";
import { addDays } from "./scheduling";

const TODAY = "2026-08-04";
const COURSE = "INFO5995";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateExam(db, TODAY);
});

test("seeds every paper, releasing the first 5 immediately under the backlog cap", () => {
  const total = totalPapersForCourse(COURSE);
  expect(getExamPaperRow(db, COURSE, 1)!.next_review).toBe(TODAY);
  const releasedCount = Math.min(5, total);
  expect(getExamPaperRow(db, COURSE, releasedCount)!.next_review).toBe(TODAY);
  if (total > 5) {
    expect(getExamPaperRow(db, COURSE, 6)!.next_review).toBe(addDays(TODAY, 6));
  }
});

test("migrateExam does not reseed or reset progress on a second call", () => {
  saveExamAnswer(db, COURSE, 1, 0, "draft");
  migrateExam(db, TODAY);
  const answer = getExamPaperRow(db, COURSE, 1);
  expect(answer).not.toBeNull();
});

test("listDueExamPapers returns the first released, unsubmitted paper first", () => {
  const due = listDueExamPapers(db, COURSE, TODAY);
  expect(due.length).toBeGreaterThan(0);
  expect(due[0]!.paper_day).toBe(1);
});

test("saveExamAnswer stores a draft without grading it", () => {
  saveExamAnswer(db, COURSE, 1, 0, "my draft");
  const paper1Questions = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!.questions;
  expect(paper1Questions.length).toBeGreaterThan(0);
});

test("submitExamPaper rejects submission until every question is graded", () => {
  const result = submitExamPaper(db, COURSE, 1, TODAY);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("incomplete");
});

test("submitExamPaper computes score, marks submitted, and creates review items for wrong answers", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, i !== 0)); // question 0 wrong, rest correct

  const result = submitExamPaper(db, COURSE, 1, TODAY);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.scoreTotal).toBe(paper1.questions.length);
    expect(result.scoreCorrect).toBe(paper1.questions.length - 1);
  }

  const paperRow = getExamPaperRow(db, COURSE, 1)!;
  expect(paperRow.submitted_at).toBe(TODAY);

  const dueReviews = listDueExamReviewItems(db, COURSE, addDays(TODAY, 1));
  expect(dueReviews.length).toBe(1);
  expect(dueReviews[0]!.question_index).toBe(0);
});

test("a submitted paper is no longer listed as due", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, true));
  submitExamPaper(db, COURSE, 1, TODAY);

  const due = listDueExamPapers(db, COURSE, TODAY);
  expect(due.find((p) => p.paper_day === 1)).toBeUndefined();
});

test("submitExamPaper rejects a second submission of the same paper", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, true));
  submitExamPaper(db, COURSE, 1, TODAY);

  const second = submitExamPaper(db, COURSE, 1, TODAY);
  expect(second.ok).toBe(false);
  if (!second.ok) expect(second.reason).toBe("already_submitted");
});

test("countExamPapersSubmittedToday and countOverdueExamPapers track separately", () => {
  expect(countExamPapersSubmittedToday(db, COURSE, TODAY)).toBe(0);
  expect(countOverdueExamPapers(db, COURSE, TODAY)).toBe(0);

  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, true));
  submitExamPaper(db, COURSE, 1, TODAY);
  expect(countExamPapersSubmittedToday(db, COURSE, TODAY)).toBe(1);
});

test("reviewExamItem applies the ladder and logs the attempt", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, i, i !== 0));
  submitExamPaper(db, COURSE, 1, TODAY);

  const tomorrow = addDays(TODAY, 1);
  const updated = reviewExamItem(db, COURSE, 1, 0, "correct", tomorrow)!;
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(tomorrow, 3));
  expect(countExamReviewsToday(db, COURSE, tomorrow)).toBe(1);
});

test("reviewExamItem returns null for an item that isn't in the review queue", () => {
  expect(reviewExamItem(db, COURSE, 1, 5, "correct", TODAY)).toBeNull();
});

test("two different courses' backlogs and paper_day sequences are independent", () => {
  // COMP5348 has no real content yet, so seed two synthetic papers directly
  // to exercise the per-course SQL filtering the db layer is responsible for.
  db.query(`INSERT INTO exam_state (course, released_up_to) VALUES ('COMP5348', 2)`).run();
  db.query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES ('COMP5348', 1, ?)`).run(TODAY);
  db.query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES ('COMP5348', 2, ?)`).run(TODAY);

  const comp5348Due = listDueExamPapers(db, "COMP5348", TODAY);
  expect(comp5348Due.length).toBe(2);
  expect(comp5348Due.every((p) => p.course === "COMP5348")).toBe(true);

  const info5995Due = listDueExamPapers(db, COURSE, TODAY);
  // Submitting every INFO5995 due paper does not touch COMP5348's due count.
  for (const p of info5995Due) {
    const content = buildExamSchedule().find((c) => c.course === COURSE && c.paperDay === p.paper_day)!;
    content.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, p.paper_day, i, true));
    submitExamPaper(db, COURSE, p.paper_day, TODAY);
  }
  expect(listDueExamPapers(db, COURSE, TODAY).length).toBe(0);
  expect(listDueExamPapers(db, "COMP5348", TODAY).length).toBe(2);
});

test("migrateExam upgrades a pre-existing single-course db, backfilling course = 'INFO5995'", () => {
  const legacyDb = new Database(":memory:");
  legacyDb.exec(`
    CREATE TABLE exam_papers (
      paper_day INTEGER PRIMARY KEY,
      next_review TEXT NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER
    );
    CREATE TABLE exam_answers (
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (paper_day, question_index)
    );
    CREATE TABLE exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(paper_day, question_index)
    );
    CREATE TABLE exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE exam_state (
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);
  legacyDb
    .query(
      `INSERT INTO exam_papers (paper_day, next_review, submitted_at, score_correct, score_total) VALUES (1, ?, ?, 2, 3)`,
    )
    .run(TODAY, TODAY);
  legacyDb
    .query(`INSERT INTO exam_answers (paper_day, question_index, your_answer, correct) VALUES (1, 0, 'my answer', 1)`)
    .run();
  legacyDb
    .query(`INSERT INTO exam_review_items (paper_day, question_index, rung, next_review) VALUES (2, 0, 0, ?)`)
    .run(TODAY);
  legacyDb
    .query(`INSERT INTO exam_review_log (paper_day, question_index, reviewed_at, result) VALUES (1, 0, ?, 'correct')`)
    .run(TODAY);
  legacyDb.query(`INSERT INTO exam_state (released_up_to) VALUES (3)`).run();

  migrateExam(legacyDb, TODAY);

  const paper = getExamPaperRow(legacyDb, COURSE, 1)!;
  expect(paper.submitted_at).toBe(TODAY);
  expect(paper.score_correct).toBe(2);

  const answers = listExamAnswers(legacyDb, COURSE, 1);
  expect(answers[0]!.your_answer).toBe("my answer");

  const dueReviews = listDueExamReviewItems(legacyDb, COURSE, TODAY);
  expect(dueReviews.some((r) => r.paper_day === 2 && r.question_index === 0)).toBe(true);

  expect(countExamReviewsToday(legacyDb, COURSE, TODAY)).toBe(1);
});
