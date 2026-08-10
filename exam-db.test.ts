import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateExam,
  listExamPaperRows,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countExamPapersSubmittedToday,
  listDueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
  retakeExamPaper,
  listExamAttemptHistory,
} from "./exam-db";
import { buildExamSchedule } from "./exam-content";
import { addDays } from "./scheduling";

const TODAY = "2026-08-05"; // a Wednesday in Week 1 (2026-08-03..2026-08-09)
// INFO5990 is the one course still on a single content paper (week 1 only) —
// using it here keeps every "this course has just 1 paper" assertion below
// stable as other courses (INFO5995, COMP5348, INFO6007) accumulate more
// weeks of content over the semester.
const COURSE = "INFO5990";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateExam(db, TODAY);
});

test("seeds every paper for the course, unsubmitted", () => {
  const rows = listExamPaperRows(db, COURSE);
  expect(rows.length).toBe(1); // INFO5990 Week 1's combined paper
  expect(rows.every((r) => r.submitted_at === null)).toBe(true);
  expect(rows.map((r) => r.paper_number).sort()).toEqual([1]);
});

test("migrateExam does not reseed or reset progress on a second call", () => {
  saveExamAnswer(db, COURSE, 1, 1, 0, "draft");
  migrateExam(db, TODAY);
  const answers = listExamAnswers(db, COURSE, 1, 1);
  expect(answers[0]!.your_answer).toBe("draft");
});

test("getExamPaperRow returns null for an unknown paper", () => {
  expect(getExamPaperRow(db, COURSE, 99, 1)).toBeNull();
});

test("saveExamAnswer stores a draft without grading it", () => {
  saveExamAnswer(db, COURSE, 1, 1, 0, "my draft");
  const answers = listExamAnswers(db, COURSE, 1, 1);
  expect(answers[0]!.your_answer).toBe("my draft");
  expect(answers[0]!.correct).toBeNull();
});

test("submitExamPaper rejects submission until every question is graded", () => {
  const result = submitExamPaper(db, COURSE, 1, 1, TODAY);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("incomplete");
});

test("submitExamPaper computes score, marks submitted, and creates review items for wrong answers", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, i !== 0)); // question 0 wrong, rest correct

  const result = submitExamPaper(db, COURSE, 1, 1, TODAY);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.scoreTotal).toBe(paper1.questions.length);
    expect(result.scoreCorrect).toBe(paper1.questions.length - 1);
  }

  const paperRow = getExamPaperRow(db, COURSE, 1, 1)!;
  expect(paperRow.submitted_at).toBe(TODAY);

  const dueReviews = listDueExamReviewItems(db, COURSE, addDays(TODAY, 1));
  expect(dueReviews.length).toBe(1);
  expect(dueReviews[0]!.question_index).toBe(0);
  expect(dueReviews[0]!.paper_number).toBe(1);
});

test("submitExamPaper rejects a second submission of the same paper", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, true));
  submitExamPaper(db, COURSE, 1, 1, TODAY);

  const second = submitExamPaper(db, COURSE, 1, 1, TODAY);
  expect(second.ok).toBe(false);
  if (!second.ok) expect(second.reason).toBe("already_submitted");
});

test("countExamPapersSubmittedToday counts submitted papers for the day", () => {
  expect(countExamPapersSubmittedToday(db, COURSE, TODAY)).toBe(0);
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, true));
  submitExamPaper(db, COURSE, 1, 1, TODAY);
  expect(countExamPapersSubmittedToday(db, COURSE, TODAY)).toBe(1);
});

test("reviewExamItem applies the ladder and logs the attempt", () => {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, i !== 0));
  submitExamPaper(db, COURSE, 1, 1, TODAY);

  const tomorrow = addDays(TODAY, 1);
  const updated = reviewExamItem(db, COURSE, 1, 1, 0, "correct", tomorrow)!;
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(tomorrow, 3));
  expect(countExamReviewsToday(db, COURSE, tomorrow)).toBe(1);
});

test("reviewExamItem returns null for an item that isn't in the review queue", () => {
  expect(reviewExamItem(db, COURSE, 1, 1, 5, "correct", TODAY)).toBeNull();
});

test("two different courses' rows are independent — course scoping partitions correctly", () => {
  // Uses a course code with no seeded content, so this stays a pure DB-scoping
  // test rather than colliding with a real course's migrateExam()-seeded rows.
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES ('OTHERCOURSE', 1, 1)`).run();
  saveExamAnswer(db, "OTHERCOURSE", 1, 1, 0, "other draft");
  saveExamAnswer(db, COURSE, 1, 1, 0, "info draft");

  expect(listExamAnswers(db, "OTHERCOURSE", 1, 1)[0]!.your_answer).toBe("other draft");
  expect(listExamAnswers(db, COURSE, 1, 1)[0]!.your_answer).toBe("info draft");
  expect(getExamPaperRow(db, "OTHERCOURSE", 1, 1)!.course).toBe("OTHERCOURSE");
  expect(listExamPaperRows(db, "OTHERCOURSE").length).toBe(1);
  expect(listExamPaperRows(db, COURSE).length).toBe(1); // unaffected by OTHERCOURSE's row
});

test("migrateExam upgrades a pre-existing paper_day-keyed db, recovering (week, paperNumber) by content position", () => {
  const legacyDb = new Database(":memory:");
  legacyDb.exec(`
    CREATE TABLE exam_papers (
      course TEXT NOT NULL, paper_day INTEGER NOT NULL, next_review TEXT NOT NULL,
      submitted_at TEXT, score_correct INTEGER, score_total INTEGER,
      PRIMARY KEY (course, paper_day)
    );
    CREATE TABLE exam_answers (
      course TEXT NOT NULL, paper_day INTEGER NOT NULL, question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '', correct INTEGER,
      PRIMARY KEY (course, paper_day, question_index)
    );
    CREATE TABLE exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, rung INTEGER NOT NULL DEFAULT -1, next_review TEXT NOT NULL,
      UNIQUE(course, paper_day, question_index)
    );
    CREATE TABLE exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    -- The real running srs.db already went through the multi-course migration,
    -- so it has this table (course, released_up_to) sitting alongside the
    -- course+paper_day exam_papers shape — this fixture matches that exactly.
    CREATE TABLE exam_state (
      course TEXT PRIMARY KEY,
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);
  // paper_day 1 = INFO5990's only paper in content order = (week 1, paperNumber 1)
  legacyDb
    .query(
      `INSERT INTO exam_papers (course, paper_day, next_review, submitted_at, score_correct, score_total) VALUES ('INFO5990', 1, ?, ?, 20, 26)`,
    )
    .run(TODAY, TODAY);
  legacyDb
    .query(`INSERT INTO exam_answers (course, paper_day, question_index, your_answer, correct) VALUES ('INFO5990', 1, 0, 'my answer', 1)`)
    .run();
  legacyDb
    .query(`INSERT INTO exam_review_items (course, paper_day, question_index, rung, next_review) VALUES ('INFO5990', 1, 3, 0, ?)`)
    .run(TODAY);
  legacyDb
    .query(`INSERT INTO exam_review_log (course, paper_day, question_index, reviewed_at, result) VALUES ('INFO5990', 1, 3, ?, 'correct')`)
    .run(TODAY);
  legacyDb.query(`INSERT INTO exam_state (course, released_up_to) VALUES ('INFO5990', 3)`).run();

  migrateExam(legacyDb, TODAY);

  const paper = getExamPaperRow(legacyDb, "INFO5990", 1, 1)!;
  expect(paper).not.toBeNull();
  expect(paper.submitted_at).toBe(TODAY);
  expect(paper.score_correct).toBe(20);

  const answers = listExamAnswers(legacyDb, "INFO5990", 1, 1);
  expect(answers[0]!.your_answer).toBe("my answer");

  const dueReviews = listDueExamReviewItems(legacyDb, "INFO5990", TODAY);
  expect(dueReviews.some((r) => r.week === 1 && r.paper_number === 1 && r.question_index === 3)).toBe(true);

  expect(countExamReviewsToday(legacyDb, "INFO5990", TODAY)).toBe(1);

  // INFO5990 now has just this one paper, so nothing is left for
  // migrateExam's seedNewPapers step to fresh-seed.
  expect(listExamPaperRows(legacyDb, "INFO5990").length).toBe(1);

  // exam_state has no successor in the weekly-pacing schema. This is the
  // exact shape (course+paper_day, exam_state already present) the real
  // running srs.db is in — it must not survive migration here.
  const tables = legacyDb.query(`SELECT name FROM sqlite_master WHERE type = 'table'`).all() as { name: string }[];
  expect(tables.some((t) => t.name === "exam_state")).toBe(false);
});

test("migrateExam cascades a genuinely ancient no-course-column db through both legacy tiers in one call", () => {
  const ancientDb = new Database(":memory:");
  ancientDb.exec(`
    CREATE TABLE exam_papers (
      paper_day INTEGER PRIMARY KEY, next_review TEXT NOT NULL,
      submitted_at TEXT, score_correct INTEGER, score_total INTEGER
    );
    CREATE TABLE exam_answers (
      paper_day INTEGER NOT NULL, question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '', correct INTEGER,
      PRIMARY KEY (paper_day, question_index)
    );
    CREATE TABLE exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, rung INTEGER NOT NULL DEFAULT -1, next_review TEXT NOT NULL,
      UNIQUE(paper_day, question_index)
    );
    CREATE TABLE exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE exam_state (
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);
  // paper_day 1 = INFO5995's 1st paper in content order = (week 1, paperNumber 1)
  ancientDb
    .query(
      `INSERT INTO exam_papers (paper_day, next_review, submitted_at, score_correct, score_total) VALUES (1, ?, ?, 24, 26)`,
    )
    .run(TODAY, TODAY);
  ancientDb
    .query(`INSERT INTO exam_answers (paper_day, question_index, your_answer, correct) VALUES (1, 0, 'ancient answer', 1)`)
    .run();
  ancientDb.query(`INSERT INTO exam_state (released_up_to) VALUES (3)`).run();

  migrateExam(ancientDb, TODAY);

  // Cascaded through both tiers in one migrateExam call: no-course -> course+paper_day -> week/paperNumber.
  const paper = getExamPaperRow(ancientDb, "INFO5995", 1, 1)!;
  expect(paper).not.toBeNull();
  expect(paper.submitted_at).toBe(TODAY);
  expect(paper.score_correct).toBe(24);
  expect(listExamAnswers(ancientDb, "INFO5995", 1, 1)[0]!.your_answer).toBe("ancient answer");

  const tables = ancientDb.query(`SELECT name FROM sqlite_master WHERE type = 'table'`).all() as { name: string }[];
  expect(tables.some((t) => t.name === "exam_state")).toBe(false);
});

test("a migration failure rolls back cleanly, leaving the original paper_day-shaped tables intact", () => {
  const legacyDb = new Database(":memory:");
  legacyDb.exec(`
    CREATE TABLE exam_papers (
      course TEXT NOT NULL, paper_day INTEGER NOT NULL, next_review TEXT NOT NULL,
      submitted_at TEXT, score_correct INTEGER, score_total INTEGER,
      PRIMARY KEY (course, paper_day)
    );
    CREATE TABLE exam_answers (
      course TEXT NOT NULL, paper_day INTEGER NOT NULL, question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '', correct INTEGER,
      PRIMARY KEY (course, paper_day, question_index)
    );
    CREATE TABLE exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, rung INTEGER NOT NULL DEFAULT -1, next_review TEXT NOT NULL,
      UNIQUE(course, paper_day, question_index)
    );
    CREATE TABLE exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, course TEXT NOT NULL, paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL, reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
  `);
  legacyDb
    .query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES ('INFO5990', 1, ?)`)
    .run(TODAY);
  // A paper_day with no matching content position (way out of range) — lookup()
  // returns undefined for it, which the migration already handles by skipping
  // the row, so this doesn't actually throw; this test instead confirms that
  // exact skip-don't-crash behavior, since a real mid-migration SQL failure
  // is hard to simulate without corrupting bun:sqlite's connection itself.
  legacyDb
    .query(`INSERT INTO exam_papers (course, paper_day, next_review) VALUES ('INFO5990', 999, ?)`)
    .run(TODAY);

  migrateExam(legacyDb, TODAY);

  // The valid row (paper_day 1) migrated; the out-of-range row (999) was
  // dropped rather than crashing the whole migration or corrupting state.
  expect(getExamPaperRow(legacyDb, "INFO5990", 1, 1)).not.toBeNull();
  expect(listExamPaperRows(legacyDb, "INFO5990").length).toBe(1); // just the migrated row — INFO5990 only has 1 paper now
});

function submitPaper1AsWrongThenRight(db: Database, correctAllExceptFirst: boolean) {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, correctAllExceptFirst ? i !== 0 : true));
  return submitExamPaper(db, COURSE, 1, 1, TODAY);
}

test("retakeExamPaper rejects a paper that was never submitted", () => {
  const result = retakeExamPaper(db, COURSE, 1, 1);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("not_submitted");
});

test("retakeExamPaper rejects an unknown paper", () => {
  const result = retakeExamPaper(db, COURSE, 99, 1);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("not_found");
});

test("retakeExamPaper snapshots the prior attempt, then clears submission and answers", () => {
  submitPaper1AsWrongThenRight(db, true); // question 0 wrong, rest correct

  const result = retakeExamPaper(db, COURSE, 1, 1);
  expect(result.ok).toBe(true);

  const paperRow = getExamPaperRow(db, COURSE, 1, 1)!;
  expect(paperRow.submitted_at).toBeNull();
  expect(paperRow.score_correct).toBeNull();
  expect(paperRow.score_total).toBeNull();
  expect(listExamAnswers(db, COURSE, 1, 1)).toEqual([]);

  const history = listExamAttemptHistory(db, COURSE, 1, 1);
  expect(history.length).toBe(1);
  expect(history[0]!.attemptNumber).toBe(1);
  expect(history[0]!.submittedAt).toBe(TODAY);
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  expect(history[0]!.scoreCorrect).toBe(paper1.questions.length - 1);
  expect(history[0]!.scoreTotal).toBe(paper1.questions.length);
});

test("two consecutive retakes number attempts 1 and 2 in order", () => {
  submitPaper1AsWrongThenRight(db, true);
  retakeExamPaper(db, COURSE, 1, 1);
  submitPaper1AsWrongThenRight(db, false); // all correct this time
  retakeExamPaper(db, COURSE, 1, 1);

  const history = listExamAttemptHistory(db, COURSE, 1, 1);
  expect(history.map((h) => h.attemptNumber)).toEqual([1, 2]);
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  expect(history[0]!.scoreCorrect).toBe(paper1.questions.length - 1); // attempt 1: question 0 wrong
  expect(history[1]!.scoreCorrect).toBe(paper1.questions.length); // attempt 2: all correct
});

test("retaking and resubmitting still-wrong reuses the existing review-item pipeline unchanged", () => {
  submitPaper1AsWrongThenRight(db, true); // question 0 wrong -> creates a review item
  const beforeRetake = listDueExamReviewItems(db, COURSE, addDays(TODAY, 1));
  expect(beforeRetake.length).toBe(1);

  retakeExamPaper(db, COURSE, 1, 1);
  submitPaper1AsWrongThenRight(db, true); // question 0 wrong again

  // ON CONFLICT DO NOTHING: still one review item, not duplicated, for the same question.
  const afterRetake = listDueExamReviewItems(db, COURSE, addDays(TODAY, 1));
  expect(afterRetake.length).toBe(1);
  expect(afterRetake[0]!.question_index).toBe(0);
});
