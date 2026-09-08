import { test, expect } from "bun:test";
import { findLengthTells } from "./check-mcq-lengths";
import type { ExamPaperSeed } from "../exam-content/types";

function paperWith(questions: ExamPaperSeed["questions"]): ExamPaperSeed {
  return {
    course: "TEST",
    week: 1,
    paperNumber: 1,
    title: "Test Paper",
    topics: "testing",
    sourceFiles: [],
    questions,
  };
}

test("flags a correct option that is much longer than every distractor", () => {
  const tells = findLengthTells([
    paperWith([
      {
        type: "mcq",
        prompt: "Which is correct?",
        options: [
          "This is the fully detailed and specific correct answer with real substance",
          "Wrong A",
          "Wrong B",
          "Wrong C",
        ],
        correctIndex: 0,
        modelAnswer: "Because it is.",
      },
    ]),
  ]);
  expect(tells).toHaveLength(1);
  expect(tells[0]!.kind).toBe("long");
});

test("flags a correct option that is much shorter than every distractor", () => {
  const tells = findLengthTells([
    paperWith([
      {
        type: "mcq",
        prompt: "Which is correct?",
        options: [
          "Short right",
          "This distractor has a lot of elaborate specific plausible detail",
          "This one also has a lot of elaborate specific plausible detail",
          "This one too has a lot of elaborate specific plausible detail",
        ],
        correctIndex: 0,
        modelAnswer: "Because it is.",
      },
    ]),
  ]);
  expect(tells).toHaveLength(1);
  expect(tells[0]!.kind).toBe("short");
});

test("does not flag options of roughly similar length", () => {
  const tells = findLengthTells([
    paperWith([
      {
        type: "mcq",
        prompt: "Which is correct?",
        options: ["The correct mechanism here", "A plausible wrong mechanism", "Another wrong mechanism", "Yet another wrong one"],
        correctIndex: 0,
        modelAnswer: "Because it is.",
      },
    ]),
  ]);
  expect(tells).toHaveLength(0);
});

test("flags a multi question whose every correct option is much longer than every distractor", () => {
  const tells = findLengthTells([
    paperWith([
      {
        type: "multi",
        prompt: "Select all that apply.",
        options: [
          "This correct option carries real specific detailed substance worth reading",
          "This other correct option is also written with full specific plausible detail",
          "Wrong A",
          "Wrong B",
        ],
        correctIndices: [0, 1],
        modelAnswer: "Because they are.",
      },
    ]),
  ]);
  expect(tells).toHaveLength(1);
  expect(tells[0]!.kind).toBe("long");
});

test("does not flag a multi question with balanced option lengths", () => {
  const tells = findLengthTells([
    paperWith([
      {
        type: "multi",
        prompt: "Select all that apply.",
        options: ["Correct mechanism one", "Correct mechanism two", "A plausible wrong one", "Another wrong one"],
        correctIndices: [0, 1],
        modelAnswer: "Because they are.",
      },
    ]),
  ]);
  expect(tells).toHaveLength(0);
});

test("ignores non-mcq questions", () => {
  const tells = findLengthTells([
    paperWith([
      {
        type: "short",
        prompt: "Explain X.",
        modelAnswer: "X is explained here at whatever length is needed.",
      },
    ]),
  ]);
  expect(tells).toHaveLength(0);
});

test("real exam content has no length tells", async () => {
  const { buildExamSchedule } = await import("../exam/content");
  const tells = findLengthTells(buildExamSchedule());
  if (tells.length > 0) {
    console.error(tells.map((t) => `${t.course} week ${t.week}: ${t.prompt}`).join("\n"));
  }
  expect(tells).toHaveLength(0);
});
