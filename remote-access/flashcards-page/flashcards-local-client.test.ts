// flashcards-page/flashcards-local-client.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureNotesRepoCloned } from "../notes/notes-repo";
import { flashcardsApiRoutes } from "./flashcards-api";
import { createFlashcardsLocalClient } from "./flashcards-local-client";
import type { FetchLike } from "../notes/local-client";
import type { FlashcardsClient } from "./flashcards-client";

const SAMPLE = `# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`;

let root: string;
let server: ReturnType<typeof Bun.serve>;
let client: FlashcardsClient;
let cloneDir: string;

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), "flashcards-local-client-test-"));
  const remoteDir = join(root, "remote.git");
  cloneDir = join(root, "clone");
  await Bun.$`git init --bare ${remoteDir}`.quiet();
  await ensureNotesRepoCloned(cloneDir, remoteDir);
  await Bun.$`git config user.email test@example.com`.cwd(cloneDir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(cloneDir).quiet();
  server = Bun.serve({ port: 0, routes: flashcardsApiRoutes(cloneDir) });
  const base = server.url.origin;
  const scopedFetch: FetchLike = (input, init) =>
    fetch(new URL(String(input), base), init);
  client = createFlashcardsLocalClient(scopedFetch);
});

afterEach(() => {
  server.stop(true);
  rmSync(root, { recursive: true, force: true });
});

test("listDecks returns an empty array initially", async () => {
  expect(await client.listDecks()).toEqual([]);
});

test("saveDeck then listDecks round-trips the deck", async () => {
  const saved = await client.saveDeck(SAMPLE);
  expect(saved.subject).toBe("INFO5990");
  const decks = await client.listDecks();
  expect(decks.some((d) => d.subjectSlug === "info5990" && d.examSlug === "2")).toBe(true);
});

test("the server's JSON error field becomes the thrown message", async () => {
  const stubFetch: FetchLike = async () =>
    Response.json({ error: "flashcards repo not available: boom" }, { status: 503 });
  await expect(createFlashcardsLocalClient(stubFetch).listDecks()).rejects.toThrow(
    new Error("flashcards repo not available: boom"),
  );
});

test("a non-JSON error response falls back to the status-code message", async () => {
  const stubFetch: FetchLike = async () => new Response("<html>bad gateway</html>", { status: 502 });
  await expect(createFlashcardsLocalClient(stubFetch).saveDeck(SAMPLE)).rejects.toThrow(
    new Error("could not save flashcard deck (502)"),
  );
});
