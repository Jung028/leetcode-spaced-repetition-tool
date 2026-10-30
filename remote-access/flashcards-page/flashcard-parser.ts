export interface Flashcard {
  id: string;
  number: string;
  part: string | null;
  question: string;
  answer: string;
}

export interface FlashcardDeck {
  subject: string;
  subjectSlug: string;
  exam: string;
  examSlug: string;
  cards: Flashcard[];
}

export class FlashcardParseError extends Error {}

const HEADER_RE = /^#\s+(.+?)\s*[—-]\s*Exam\s+(\S.*?)\s*$/i;
const QUESTION_RE = /^###\s+Q(\d+)([a-zA-Z]*)\.\s*(.*)$/i;

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function parseHeader(line: string | undefined): { subject: string; exam: string } {
  const match = line === undefined ? null : HEADER_RE.exec(line);
  if (!match) {
    throw new FlashcardParseError(
      `the first line must look like "# Subject — Exam N" (e.g. "# INFO5990 — Exam 2")`,
    );
  }
  return { subject: match[1]!, exam: match[2]! };
}

interface PendingCard {
  number: string;
  part: string | null;
  question: string;
  answerLines: string[];
}

function toCard(pending: PendingCard): Flashcard {
  const part = pending.part;
  return {
    id: `q${pending.number}${part ?? ""}`,
    number: pending.number,
    part,
    question: pending.question.trim(),
    answer: pending.answerLines.join("\n").trim(),
  };
}

function startCard(match: RegExpExecArray): PendingCard {
  const partLetters = match[2]!.toLowerCase();
  return {
    number: match[1]!,
    part: partLetters === "" ? null : partLetters,
    question: match[3]!,
    answerLines: [],
  };
}

export function parseFlashcardDeck(markdown: string): FlashcardDeck {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim() !== "");
  const { subject, exam } = parseHeader(lines[firstContentIndex]);

  const cards: Flashcard[] = [];
  const seenIds = new Set<string>();
  const pushCard = (pending: PendingCard) => {
    const card = toCard(pending);
    if (seenIds.has(card.id)) {
      throw new FlashcardParseError(`duplicate question id "${card.id}"`);
    }
    seenIds.add(card.id);
    cards.push(card);
  };

  let current: PendingCard | null = null;
  for (const line of lines.slice(firstContentIndex + 1)) {
    const questionMatch = QUESTION_RE.exec(line);
    if (questionMatch) {
      if (current) pushCard(current);
      current = startCard(questionMatch);
    } else if (current) {
      current.answerLines.push(line);
    }
  }
  if (current) pushCard(current);

  if (cards.length === 0) {
    throw new FlashcardParseError("no questions found (expected headings like \"### Q1. Question?\")");
  }

  return { subject, subjectSlug: slugify(subject), exam, examSlug: slugify(exam), cards };
}
