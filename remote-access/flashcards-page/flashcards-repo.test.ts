import { test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureNotesRepoCloned } from "../notes/notes-repo";
import { readDecks, writeDeck } from "./flashcards-repo";
import { FlashcardParseError } from "./flashcard-parser";

let root: string;
let remoteDir: string;
let cloneDir: string;

async function configureIdentity(dir: string): Promise<void> {
  await Bun.$`git config user.email test@example.com`.cwd(dir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(dir).quiet();
}

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), "flashcards-repo-test-"));
  remoteDir = join(root, "remote.git");
  cloneDir = join(root, "clone");
  await Bun.$`git init --bare ${remoteDir}`.quiet();
  await ensureNotesRepoCloned(cloneDir, remoteDir);
  await configureIdentity(cloneDir);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const SAMPLE = `# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`;

test("writeDeck creates a nested markdown file and readDecks returns the parsed deck", async () => {
  await writeDeck(cloneDir, SAMPLE);
  const decks = await readDecks(cloneDir);
  expect(decks.length).toBe(1);
  expect(decks[0]!.subject).toBe("INFO5990");
  expect(existsSync(join(cloneDir, "flashcards", "info5990", "exam-2.md"))).toBe(true);
});

test("readDecks returns an empty array when the flashcards directory doesn't exist yet", async () => {
  expect(await readDecks(cloneDir)).toEqual([]);
});

test("writeDeck for the same subject and exam overwrites rather than duplicating", async () => {
  await writeDeck(cloneDir, SAMPLE);
  const updated = SAMPLE.replace("What is a MAC?", "What is a nonce?");
  await writeDeck(cloneDir, updated);
  const decks = await readDecks(cloneDir);
  expect(decks.length).toBe(1);
  expect(decks[0]!.cards[0]!.question).toBe("What is a nonce?");
});

test("readDecks reads multiple subjects and multiple exams per subject", async () => {
  await writeDeck(cloneDir, SAMPLE);
  await writeDeck(cloneDir, SAMPLE.replace("Exam 2", "Exam 3"));
  await writeDeck(cloneDir, SAMPLE.replace("INFO5990", "INFO6007"));
  const decks = await readDecks(cloneDir);
  expect(decks.length).toBe(3);
});

test("writeDeck rejects malformed markdown before touching disk", async () => {
  await expect(writeDeck(cloneDir, "not a deck")).rejects.toThrow(FlashcardParseError);
  expect(existsSync(join(cloneDir, "flashcards"))).toBe(false);
});

test("writeDeck refuses to run when the clone path is not a git repository at all", async () => {
  const plainDir = join(root, "plain-dir");
  mkdirSync(plainDir, { recursive: true });
  await expect(writeDeck(plainDir, SAMPLE)).rejects.toThrow(/is not a git repository/);
});
