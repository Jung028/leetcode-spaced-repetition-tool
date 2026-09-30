import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ensureNotesRepoCloned,
  readNotes,
  writeNote,
  fetchRemote,
  hasUnpulledChanges,
  pullChanges,
  pushLocalChanges,
} from "./notes-repo";

let root: string;
let remoteDir: string;
let cloneDir: string;

async function configureIdentity(dir: string): Promise<void> {
  await Bun.$`git config user.email test@example.com`.cwd(dir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(dir).quiet();
}

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), "notes-repo-test-"));
  remoteDir = join(root, "remote.git");
  cloneDir = join(root, "clone");
  await Bun.$`git init --bare ${remoteDir}`.quiet();
  await ensureNotesRepoCloned(cloneDir, remoteDir);
  await configureIdentity(cloneDir);
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

test("ensureNotesRepoCloned is a no-op if the clone already exists", async () => {
  await expect(ensureNotesRepoCloned(cloneDir, remoteDir)).resolves.toBeUndefined();
});

test("writeNote creates a markdown file and readNotes returns it", async () => {
  await writeNote(cloneDir, "buy milk");
  const notes = await readNotes(cloneDir);
  expect(notes.map((n) => n.text)).toContain("buy milk");
});

test("readNotes returns notes newest-first", async () => {
  await writeNote(cloneDir, "first");
  await new Promise((r) => setTimeout(r, 5));
  await writeNote(cloneDir, "second");
  const notes = await readNotes(cloneDir);
  expect(notes[0]?.text).toBe("second");
});

test("two notes written back-to-back never collide on filename", async () => {
  const [a, b] = await Promise.all([writeNote(cloneDir, "note a"), writeNote(cloneDir, "note b")]);
  expect(a.id).not.toBe(b.id);
  const notes = await readNotes(cloneDir);
  expect(notes.length).toBe(2);
});

test("note text with shell-sensitive characters is written and committed correctly", async () => {
  const tricky = 'a `backtick`, a $(subshell), a "quote", and\na newline';
  await writeNote(cloneDir, tricky);
  await pushLocalChanges(cloneDir);
  const notes = await readNotes(cloneDir);
  expect(notes.some((n) => n.text === tricky)).toBe(true);
  const status = (await Bun.$`git status --porcelain`.cwd(cloneDir).quiet().text()).trim();
  expect(status).toBe("");
});

test("pushLocalChanges commits and pushes a new note", async () => {
  await writeNote(cloneDir, "pushed note");
  await pushLocalChanges(cloneDir);
  const status = (await Bun.$`git status --porcelain`.cwd(cloneDir).quiet().text()).trim();
  expect(status).toBe("");
  const log = await Bun.$`git log --oneline`.cwd(cloneDir).quiet().text();
  expect(log.trim().length).toBeGreaterThan(0);
});

test("pushLocalChanges is a no-op when there is nothing to commit", async () => {
  await expect(pushLocalChanges(cloneDir)).resolves.toBeUndefined();
});

test("a push that fails after a successful local commit does not lose the note", async () => {
  await writeNote(cloneDir, "orphaned note");
  await Bun.$`git remote set-url origin /nonexistent/path`.cwd(cloneDir).quiet();
  await expect(pushLocalChanges(cloneDir)).rejects.toThrow();
  const notes = await readNotes(cloneDir);
  expect(notes.some((n) => n.text === "orphaned note")).toBe(true);
  const log = await Bun.$`git log --oneline`.cwd(cloneDir).quiet().text();
  expect(log).toContain("Add note"); // the commit itself succeeded; only the push failed
  const committed = (await Bun.$`git status --porcelain`.cwd(cloneDir).quiet().text()).trim();
  expect(committed).toBe(""); // nothing left uncommitted — only unpushed
});

test("hasUnpulledChanges is false right after cloning", async () => {
  await fetchRemote(cloneDir);
  expect(await hasUnpulledChanges(cloneDir)).toBe(false);
});

test("hasUnpulledChanges is true after another clone pushes, then pullChanges brings it in", async () => {
  const secondCloneDir = join(root, "clone2");
  await ensureNotesRepoCloned(secondCloneDir, remoteDir);
  await configureIdentity(secondCloneDir);
  await writeNote(secondCloneDir, "from second clone");
  await pushLocalChanges(secondCloneDir);

  await fetchRemote(cloneDir);
  expect(await hasUnpulledChanges(cloneDir)).toBe(true);

  await pullChanges(cloneDir);
  const notes = await readNotes(cloneDir);
  expect(notes.some((n) => n.text === "from second clone")).toBe(true);
});

test("pullChanges is a safe no-op against a genuinely empty remote (nothing ever pushed)", async () => {
  const emptyRemoteDir = join(root, "empty-remote.git");
  const emptyCloneDir = join(root, "empty-clone");
  await Bun.$`git init --bare ${emptyRemoteDir}`.quiet();
  await ensureNotesRepoCloned(emptyCloneDir, emptyRemoteDir);
  await expect(pullChanges(emptyCloneDir)).resolves.toBeUndefined();
  const notes = await readNotes(emptyCloneDir);
  expect(notes).toEqual([]);
});
