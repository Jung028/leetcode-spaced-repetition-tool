import type { FlashcardDeck } from "./flashcard-parser";

function isSameDeck(a: FlashcardDeck, b: FlashcardDeck): boolean {
  return a.subjectSlug === b.subjectSlug && a.examSlug === b.examSlug;
}

export function mergeSavedDeck(decks: FlashcardDeck[], saved: FlashcardDeck): FlashcardDeck[] {
  const existingIndex = decks.findIndex((deck) => isSameDeck(deck, saved));
  if (existingIndex === -1) {
    return [...decks, saved];
  }
  const next = [...decks];
  next[existingIndex] = saved;
  return next;
}
