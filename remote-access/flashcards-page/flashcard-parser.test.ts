import { test, expect } from "bun:test";
import { parseFlashcardDeck, FlashcardParseError } from "./flashcard-parser";

test("parses the subject/exam header and a single question", () => {
  const deck = parseFlashcardDeck(`# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`);
  expect(deck.subject).toBe("INFO5990");
  expect(deck.subjectSlug).toBe("info5990");
  expect(deck.exam).toBe("2");
  expect(deck.examSlug).toBe("2");
  expect(deck.cards).toEqual([
    { id: "q1", number: "1", part: null, question: "What is a MAC?", answer: "A shared-secret code." },
  ]);
});

test("accepts a plain hyphen instead of an em dash in the header", () => {
  const deck = parseFlashcardDeck(`# INFO5990 - Exam 2\n\n### Q1. x?\ny\n`);
  expect(deck.subject).toBe("INFO5990");
});

test("normalizes CRLF line endings the same as LF", () => {
  const lf = parseFlashcardDeck("# S — Exam 1\n\n### Q1. x?\ny\n");
  const crlf = parseFlashcardDeck("# S — Exam 1\r\n\r\n### Q1. x?\r\ny\r\n");
  expect(crlf).toEqual(lf);
});

test("parses lettered sub-parts as belonging to the same number, in document order", () => {
  const deck = parseFlashcardDeck(
    `# S — Exam 1\n\n### Q1. stem?\nstem answer\n\n### Q1b. part b?\nb answer\n\n### Q2. next?\nnext answer\n`,
  );
  expect(deck.cards.map((c) => c.id)).toEqual(["q1", "q1b", "q2"]);
  expect(deck.cards[1]).toEqual({ id: "q1b", number: "1", part: "b", question: "part b?", answer: "b answer" });
});

test("a multi-paragraph answer is preserved, trimmed of leading/trailing blank lines", () => {
  const deck = parseFlashcardDeck(`# S — Exam 1\n\n### Q1. x?\nline one\n\nline two\n\n`);
  expect(deck.cards[0]!.answer).toBe("line one\n\nline two");
});

test("a heading inside an answer that isn't a Qn. line stays part of that card's answer", () => {
  const deck = parseFlashcardDeck(`# S — Exam 1\n\n### Q1. x?\n### Note: not a new card\nstill the answer\n`);
  expect(deck.cards.length).toBe(1);
  expect(deck.cards[0]!.answer).toBe("### Note: not a new card\nstill the answer");
});

test("slugifies subject and exam for filenames (spaces, case, punctuation)", () => {
  const deck = parseFlashcardDeck(`# COMP 5348, Enterprise — Exam Final\n\n### Q1. x?\ny\n`);
  expect(deck.subjectSlug).toBe("comp-5348-enterprise");
  expect(deck.examSlug).toBe("final");
});

test("throws a clear error when the header line is missing or malformed", () => {
  expect(() => parseFlashcardDeck("### Q1. x?\ny\n")).toThrow(FlashcardParseError);
  expect(() => parseFlashcardDeck("# just a subject\n\n### Q1. x?\ny\n")).toThrow(/Subject .* Exam/);
});

test("throws a clear error when there are zero questions", () => {
  expect(() => parseFlashcardDeck("# S — Exam 1\n\nno cards here\n")).toThrow(/no questions found/);
});

test("throws on a duplicate question id within the same file", () => {
  expect(() =>
    parseFlashcardDeck(`# S — Exam 1\n\n### Q1. a?\nx\n\n### Q1. b?\ny\n`),
  ).toThrow(/duplicate question id/);
});

test("throws a clear error instead of silently producing an empty subject slug", () => {
  expect(() => parseFlashcardDeck(`# 网络安全 — Exam 2\n\n### Q1. x?\ny\n`)).toThrow(FlashcardParseError);
  expect(() => parseFlashcardDeck(`# 网络安全 — Exam 2\n\n### Q1. x?\ny\n`)).toThrow(
    /subject must contain at least one letter or digit/,
  );
});

test("throws a clear error instead of silently producing an empty exam slug", () => {
  expect(() => parseFlashcardDeck(`# S — Exam ???\n\n### Q1. x?\ny\n`)).toThrow(FlashcardParseError);
  expect(() => parseFlashcardDeck(`# S — Exam ???\n\n### Q1. x?\ny\n`)).toThrow(
    /exam must contain at least one letter or digit/,
  );
});

test("accepts an en dash in the header, like a hyphen or em dash", () => {
  const deck = parseFlashcardDeck(`# INFO5990 – Exam 2\n\n### Q1. x?\ny\n`);
  expect(deck.subject).toBe("INFO5990");
  expect(deck.exam).toBe("2");
});

test("trims leading whitespace on the header line before matching", () => {
  const deck = parseFlashcardDeck(`  # INFO5990 — Exam 2\n\n### Q1. x?\ny\n`);
  expect(deck.subject).toBe("INFO5990");
});
