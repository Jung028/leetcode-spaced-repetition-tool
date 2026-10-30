import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { assertOwnRepo } from "../notes/notes-repo";
import { parseFlashcardDeck, type FlashcardDeck } from "./flashcard-parser";

function flashcardsDir(clonePath: string): string {
  return `${clonePath}/flashcards`;
}

async function readSubjectDecks(subjectDir: string): Promise<FlashcardDeck[]> {
  const files = readdirSync(subjectDir).filter((f) => f.endsWith(".md"));
  return Promise.all(
    files.map(async (filename) => {
      const text = await Bun.file(`${subjectDir}/${filename}`).text();
      return parseFlashcardDeck(text);
    }),
  );
}

export async function readDecks(clonePath: string): Promise<FlashcardDeck[]> {
  const dir = flashcardsDir(clonePath);
  if (!existsSync(dir)) return [];
  const subjectDirs = readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const decksBySubject = await Promise.all(
    subjectDirs.map((entry) => readSubjectDecks(`${dir}/${entry.name}`)),
  );
  return decksBySubject.flat();
}

export async function writeDeck(clonePath: string, markdown: string): Promise<FlashcardDeck> {
  await assertOwnRepo(clonePath);
  const deck = parseFlashcardDeck(markdown);
  const subjectDir = `${flashcardsDir(clonePath)}/${deck.subjectSlug}`;
  mkdirSync(subjectDir, { recursive: true });
  await Bun.write(`${subjectDir}/exam-${deck.examSlug}.md`, markdown);
  return deck;
}
