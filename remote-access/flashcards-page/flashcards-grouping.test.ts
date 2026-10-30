import { test, expect } from "bun:test";
import { groupDecksBySubject } from "./flashcards-grouping";
import type { FlashcardDeck } from "./flashcard-parser";

function deck(subject: string, exam: string): FlashcardDeck {
  return {
    subject,
    subjectSlug: subject.toLowerCase(),
    exam,
    examSlug: exam.toLowerCase(),
    cards: [{ id: "q1", number: "1", part: null, question: "q", answer: "a" }],
  };
}

test("empty input returns an empty array", () => {
  expect(groupDecksBySubject([])).toEqual([]);
});

test("groups decks under the same subject and keeps the subject's display label", () => {
  const groups = groupDecksBySubject([deck("INFO5990", "1"), deck("INFO5990", "2")]);
  expect(groups.length).toBe(1);
  expect(groups[0]!.subject).toBe("INFO5990");
  expect(groups[0]!.decks.length).toBe(2);
});

test("sorts decks within a subject numerically, not lexically (Exam 2 before Exam 10)", () => {
  const groups = groupDecksBySubject([deck("S", "10"), deck("S", "2")]);
  expect(groups[0]!.decks.map((d) => d.exam)).toEqual(["2", "10"]);
});

test("falls back to string comparison when an exam label isn't numeric", () => {
  const groups = groupDecksBySubject([deck("S", "Final"), deck("S", "Mid")]);
  expect(groups[0]!.decks.map((d) => d.exam)).toEqual(["Final", "Mid"]);
});

test("sorts subjects alphabetically", () => {
  const groups = groupDecksBySubject([deck("INFO6007", "1"), deck("INFO5990", "1")]);
  expect(groups.map((g) => g.subject)).toEqual(["INFO5990", "INFO6007"]);
});
