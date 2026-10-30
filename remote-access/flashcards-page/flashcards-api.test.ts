// flashcards-page/flashcards-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureNotesRepoCloned } from "../notes/notes-repo";
import { flashcardsApiRoutes } from "./flashcards-api";

let root: string;
let remoteDir: string;
let cloneDir: string;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), "flashcards-api-test-"));
  remoteDir = join(root, "remote.git");
  cloneDir = join(root, "clone");
  await Bun.$`git init --bare ${remoteDir}`.quiet();

  // Create an initial commit in the remote so pulls work
  const tempDir = join(root, "temp");
  await Bun.$`git clone ${remoteDir} ${tempDir}`.quiet();
  await Bun.$`git config user.email test@example.com`.cwd(tempDir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(tempDir).quiet();
  await Bun.$`touch .gitkeep`.cwd(tempDir).quiet();
  await Bun.$`git add .gitkeep`.cwd(tempDir).quiet();
  await Bun.$`git commit -m "Initial commit"`.cwd(tempDir).quiet();
  await Bun.$`git push -u origin HEAD`.cwd(tempDir).quiet();

  await ensureNotesRepoCloned(cloneDir, remoteDir);
  await Bun.$`git config user.email test@example.com`.cwd(cloneDir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(cloneDir).quiet();
  server = Bun.serve({ port: 0, routes: flashcardsApiRoutes(cloneDir) });
  base = server.url.origin;
});

afterEach(() => {
  server.stop(true);
  rmSync(root, { recursive: true, force: true });
});

const SAMPLE = `# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`;

test("GET /api/flashcards returns an empty list initially", async () => {
  const res = await fetch(`${base}/api/flashcards`);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual([]);
});

test("POST /api/flashcards creates a deck and GET reflects it", async () => {
  const res = await fetch(`${base}/api/flashcards`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ markdown: SAMPLE }),
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.subject).toBe("INFO5990");
  const list = await (await fetch(`${base}/api/flashcards`)).json();
  expect(list.length).toBe(1);
});

test("POST /api/flashcards rejects missing markdown", async () => {
  const res = await fetch(`${base}/api/flashcards`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  expect(res.status).toBe(400);
});

test("POST /api/flashcards rejects malformed markdown with the parser's own message", async () => {
  const res = await fetch(`${base}/api/flashcards`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ markdown: "not a deck" }),
  });
  expect(res.status).toBe(400);
  expect((await res.json()).error).toMatch(/Subject .* Exam/);
});

test("POST /api/flashcards commits and pushes", async () => {
  await fetch(`${base}/api/flashcards`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ markdown: SAMPLE }),
  });
  const status = (await Bun.$`git status --porcelain`.cwd(cloneDir).quiet().text()).trim();
  expect(status).toBe("");
});

test("POST /api/flashcards for the same subject+exam twice overwrites, not duplicates", async () => {
  await fetch(`${base}/api/flashcards`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ markdown: SAMPLE }) });
  await fetch(`${base}/api/flashcards`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ markdown: SAMPLE.replace("MAC", "nonce") }) });
  const list = await (await fetch(`${base}/api/flashcards`)).json();
  expect(list.length).toBe(1);
});

test("a deck pushed from a different clone shows up after a GET (pull-before-read)", async () => {
  const otherCloneDir = join(root, "other-clone");
  await ensureNotesRepoCloned(otherCloneDir, remoteDir);
  await Bun.$`git config user.email test@example.com`.cwd(otherCloneDir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(otherCloneDir).quiet();
  const otherServer = Bun.serve({ port: 0, routes: flashcardsApiRoutes(otherCloneDir) });
  await fetch(`${otherServer.url.origin}/api/flashcards`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ markdown: SAMPLE }) });
  otherServer.stop(true);

  const list = await (await fetch(`${base}/api/flashcards`)).json();
  expect(list.length).toBe(1);
});
