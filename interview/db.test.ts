import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem, reviewProblem } from "../leetcode/db";
import { addDays, localToday } from "../shared/scheduling";
import { allSystemDesignQuestions } from "./content";
import {
  migrateInterview,
  getOrCreateTodaySession,
  getTodaySession,
  startOrResumeCoding,
  pauseCoding,
  startOrResumeDesign,
  pauseDesign,
  saveDesignAnswer,
  revealModelAnswer,
  saveRubricChecked,
} from "./db";

const TODAY = localToday();
let db: Database;

beforeEach(() => {
  db = openDb(":memory:");
  migrateInterview(db);
});

test("getOrCreateTodaySession creates exactly one row per day and never re-rolls", () => {
  const first = getOrCreateTodaySession(db, TODAY);
  const second = getOrCreateTodaySession(db, TODAY);
  expect(second.sd_question_id).toBe(first.sd_question_id);
  const count = db.query(`SELECT COUNT(*) AS n FROM interview_sessions`).get() as { n: number };
  expect(count.n).toBe(1);
});

test("picks the next-due LeetCode problem when one is due", () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "x" },
    addDays(TODAY, -1),
  );
  const session = getOrCreateTodaySession(db, TODAY);
  expect(session.leetcode_problem_id).toBe(problem.id);
});

test("leetcode_problem_id is null when no problem is due", () => {
  const session = getOrCreateTodaySession(db, TODAY);
  expect(session.leetcode_problem_id).toBeNull();
});

test("carries an unfinished session forward to the next day, keeping the same question", () => {
  const today = getOrCreateTodaySession(db, TODAY);
  const nextDay = getOrCreateTodaySession(db, addDays(TODAY, 1));
  expect(nextDay.sd_question_id).toBe(today.sd_question_id);
  expect(nextDay.date).toBe(addDays(TODAY, 1));
  // The row is moved forward, not duplicated.
  const count = db.query(`SELECT COUNT(*) AS n FROM interview_sessions`).get() as { n: number };
  expect(count.n).toBe(1);
});

test("stops a running timer when carrying an unfinished session forward", () => {
  startOrResumeCoding(db, TODAY);
  startOrResumeDesign(db, TODAY);
  const nextDay = getOrCreateTodaySession(db, addDays(TODAY, 1));
  expect(nextDay.coding_running_since).toBeNull();
  expect(nextDay.design_running_since).toBeNull();
});

test("rolls to a system design question not already in interview_sd_seen once the session is completed", () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "x" },
    addDays(TODAY, -1),
  );
  const today = getOrCreateTodaySession(db, TODAY);
  saveDesignAnswer(db, TODAY, "my approach", null);
  revealModelAnswer(db, TODAY);
  reviewProblem(db, problem.id, "pass", TODAY);
  expect(getTodaySession(db, TODAY)!.completed_at).toBe(TODAY);

  const tomorrow = getOrCreateTodaySession(db, addDays(TODAY, 1));
  expect(tomorrow.sd_question_id).not.toBe(today.sd_question_id);
});

test("marks completed_at once both parts are satisfied, and not before", () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "x" },
    addDays(TODAY, -1),
  );
  getOrCreateTodaySession(db, TODAY);
  expect(getTodaySession(db, TODAY)!.completed_at).toBeNull();

  saveDesignAnswer(db, TODAY, "my approach", null);
  expect(getTodaySession(db, TODAY)!.completed_at).toBeNull();

  revealModelAnswer(db, TODAY);
  expect(getTodaySession(db, TODAY)!.completed_at).toBeNull();

  reviewProblem(db, problem.id, "pass", TODAY);
  expect(getTodaySession(db, TODAY)!.completed_at).toBe(TODAY);
});

test("startOrResumeCoding/pauseCoding track elapsed seconds across a pause", () => {
  const started = startOrResumeCoding(db, TODAY);
  expect(started.coding_running_since).not.toBeNull();
  expect(started.coding_elapsed_seconds).toBe(0);

  const paused = pauseCoding(db, TODAY);
  expect(paused.coding_running_since).toBeNull();
  expect(paused.coding_elapsed_seconds).toBeGreaterThanOrEqual(0);

  // Pausing again while already paused must not change anything.
  const pausedAgain = pauseCoding(db, TODAY);
  expect(pausedAgain.coding_elapsed_seconds).toBe(paused.coding_elapsed_seconds);
});

test("startOrResumeDesign/pauseDesign track elapsed seconds independently of coding", () => {
  const started = startOrResumeDesign(db, TODAY);
  expect(started.design_running_since).not.toBeNull();
  const paused = pauseDesign(db, TODAY);
  expect(paused.design_running_since).toBeNull();
});

test("saveRubricChecked persists the checked array as JSON", () => {
  const rubricLength = allSystemDesignQuestions()[0]!.rubric.length;
  const checked = new Array(rubricLength).fill(false).map((_, i) => i === 0);
  const updated = saveRubricChecked(db, TODAY, checked);
  expect(JSON.parse(updated.sd_rubric_checked)).toEqual(checked);
});
