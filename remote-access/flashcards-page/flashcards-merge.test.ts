import { test, expect } from "bun:test";
import { mergeSavedDeck } from "./flashcards-merge";
import type { FlashcardDeck } from "./flashcard-parser";

function deck(subject: string, exam: string, question = "q"): FlashcardDeck {
  return {
    subject,
    subjectSlug: subject.toLowerCase(),
    exam,
    examSlug: exam.toLowerCase(),
    cards: [{ id: "q1", number: "1", part: null, question, answer: "a" }],
  };
}

test("appends a saved deck that isn't already in the list", () => {
  const existing = [deck("INFO5990", "1")];
  const saved = deck("INFO5990", "2");
  const result = mergeSavedDeck(existing, saved);
  expect(result.map((d) => d.examSlug)).toEqual(["1", "2"]);
});

test("replaces an existing deck with the same subjectSlug and examSlug instead of duplicating it", () => {
  const existing = [deck("INFO5990", "1", "old question")];
  const saved = deck("INFO5990", "1", "new question");
  const result = mergeSavedDeck(existing, saved);
  expect(result.length).toBe(1);
  expect(result[0]!.cards[0]!.question).toBe("new question");
});

test("does not mutate the original array", () => {
  const existing = [deck("INFO5990", "1")];
  const saved = deck("INFO5990", "2");
  mergeSavedDeck(existing, saved);
  expect(existing.length).toBe(1);
});
