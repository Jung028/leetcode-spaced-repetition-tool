import type { FlashcardDeck } from "./flashcard-parser";

export interface SubjectGroup {
  subject: string;
  subjectSlug: string;
  decks: FlashcardDeck[];
}

function compareExams(a: string, b: string): number {
  const numericA = Number(a);
  const numericB = Number(b);
  if (Number.isFinite(numericA) && Number.isFinite(numericB)) {
    return numericA - numericB;
  }
  return a.localeCompare(b);
}

function groupBySubjectSlug(decks: FlashcardDeck[]): Map<string, SubjectGroup> {
  const groups = new Map<string, SubjectGroup>();
  for (const deck of decks) {
    const existing = groups.get(deck.subjectSlug);
    if (existing) {
      existing.decks.push(deck);
    } else {
      groups.set(deck.subjectSlug, { subject: deck.subject, subjectSlug: deck.subjectSlug, decks: [deck] });
    }
  }
  return groups;
}

export function groupDecksBySubject(decks: FlashcardDeck[]): SubjectGroup[] {
  const groups = [...groupBySubjectSlug(decks).values()];
  for (const group of groups) {
    group.decks.sort((a, b) => compareExams(a.exam, b.exam));
  }
  return groups.sort((a, b) => a.subject.localeCompare(b.subject));
}
