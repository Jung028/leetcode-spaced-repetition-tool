import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem, reviewProblem } from "../leetcode/db";
import { addDays, localToday } from "../shared/scheduling";
import { allSystemDesignQuestions } from "./content";
import {
  migrateInterview,
  getOrCreateTodaySession,
  getTodaySession,
  startCodingTimer,
  startDesignTimer,
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

test("picks a system design question not already in interview_sd_seen", () => {
  const today = getOrCreateTodaySession(db, TODAY);
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

test("startCodingTimer/startDesignTimer set their started_at columns once, without overwriting on a second call", () => {
  const afterFirst = startCodingTimer(db, TODAY);
  expect(afterFirst.coding_started_at).not.toBeNull();
  const firstTimestamp = afterFirst.coding_started_at;
  const afterSecond = startCodingTimer(db, TODAY);
  expect(afterSecond.coding_started_at).toBe(firstTimestamp);

  const afterDesign = startDesignTimer(db, TODAY);
  expect(afterDesign.design_started_at).not.toBeNull();
});

test("saveRubricChecked persists the checked array as JSON", () => {
  const rubricLength = allSystemDesignQuestions()[0]!.rubric.length;
  const checked = new Array(rubricLength).fill(false).map((_, i) => i === 0);
  const updated = saveRubricChecked(db, TODAY, checked);
  expect(JSON.parse(updated.sd_rubric_checked)).toEqual(checked);
});
