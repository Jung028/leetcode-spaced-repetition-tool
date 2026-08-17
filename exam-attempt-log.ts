import { appendFileSync } from "node:fs";
import type { ExamQuestionType } from "./exam-content/types";

export interface ExamAttemptLogEntry {
  kind: "attempt";
  timestamp: string;
  course: string;
  week: number;
  paperNumber: number;
  questionIndex: number;
  type: ExamQuestionType;
  prompt: string;
  yourAnswer: string;
  correct: boolean;
  // The reference text shown alongside the grade: why the correct mcq/
  // truefalse option is correct, or the revealed answer for short/scenario.
  modelAnswer: string;
  // mcq/truefalse only.
  options?: string[];
  correctIndex?: number;
}

export interface ExamSubmissionLogEntry {
  kind: "submission";
  timestamp: string;
  course: string;
  week: number;
  paperNumber: number;
  scoreCorrect: number;
  scoreTotal: number;
}

export type ExamLogEntry = ExamAttemptLogEntry | ExamSubmissionLogEntry;

// Append-only JSON Lines log of every graded attempt and paper submission —
// one line per event, plain text, so it's greppable/loadable into a
// spreadsheet or pandas/jq for question-quality analysis (e.g. which
// questions get missed most often) without touching the SQLite schema that
// drives the live app. Never read from or replayed into the app itself.
export function logExamEvent(
  entry: ExamLogEntry,
  path: string = process.env.EXAM_ATTEMPTS_LOG_PATH ?? "exam-attempts.jsonl",
): void {
  appendFileSync(path, JSON.stringify(entry) + "\n");
}
