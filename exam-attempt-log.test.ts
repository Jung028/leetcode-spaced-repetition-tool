import { test, expect, afterEach } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { logExamEvent, type ExamAttemptLogEntry, type ExamSubmissionLogEntry } from "./exam-attempt-log";

let dir: string;
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

test("logExamEvent appends one JSON line per call, each parsing back to the original entry", () => {
  dir = mkdtempSync(join(tmpdir(), "exam-log-"));
  const path = join(dir, "attempts.jsonl");

  const attempt: ExamAttemptLogEntry = {
    kind: "attempt",
    timestamp: "2026-08-17T00:00:00.000Z",
    course: "COMP5348",
    week: 3,
    paperNumber: 2,
    questionIndex: 0,
    type: "mcq",
    prompt: "What is an entity?",
    yourAnswer: "0",
    correct: true,
    modelAnswer: "Because...",
    options: ["a", "b", "c", "d"],
    correctIndex: 0,
  };
  const submission: ExamSubmissionLogEntry = {
    kind: "submission",
    timestamp: "2026-08-17T00:05:00.000Z",
    course: "COMP5348",
    week: 3,
    paperNumber: 2,
    scoreCorrect: 8,
    scoreTotal: 10,
  };

  logExamEvent(attempt, path);
  logExamEvent(submission, path);

  const lines = readFileSync(path, "utf8").trim().split("\n");
  expect(lines.length).toBe(2);
  expect(JSON.parse(lines[0]!)).toEqual(attempt);
  expect(JSON.parse(lines[1]!)).toEqual(submission);
});

test("logExamEvent creates the file on first write and appends (doesn't overwrite) on later writes", () => {
  dir = mkdtempSync(join(tmpdir(), "exam-log-"));
  const path = join(dir, "attempts.jsonl");
  expect(existsSync(path)).toBe(false);

  logExamEvent(
    { kind: "submission", timestamp: "t1", course: "A", week: 1, paperNumber: 1, scoreCorrect: 1, scoreTotal: 1 },
    path,
  );
  logExamEvent(
    { kind: "submission", timestamp: "t2", course: "A", week: 1, paperNumber: 2, scoreCorrect: 2, scoreTotal: 2 },
    path,
  );

  const lines = readFileSync(path, "utf8").trim().split("\n");
  expect(lines.length).toBe(2);
});

test("logExamEvent falls back to EXAM_ATTEMPTS_LOG_PATH when no explicit path is given", () => {
  dir = mkdtempSync(join(tmpdir(), "exam-log-"));
  const path = join(dir, "from-env.jsonl");
  const prev = process.env.EXAM_ATTEMPTS_LOG_PATH;
  process.env.EXAM_ATTEMPTS_LOG_PATH = path;
  try {
    logExamEvent({ kind: "submission", timestamp: "t", course: "A", week: 1, paperNumber: 1, scoreCorrect: 1, scoreTotal: 1 });
    expect(existsSync(path)).toBe(true);
  } finally {
    if (prev === undefined) delete process.env.EXAM_ATTEMPTS_LOG_PATH;
    else process.env.EXAM_ATTEMPTS_LOG_PATH = prev;
  }
});
