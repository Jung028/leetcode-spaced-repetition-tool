import { test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ensureNotesRepoCloned,
  readNotes,
  writeNote,
  updateNote,
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

async function remoteLogMessages(): Promise<string[]> {
  const log = await Bun.$`git log --all --format=%s`.cwd(remoteDir).quiet().text();
  return log.trim().split("\n");
}

async function remoteNoteTexts(): Promise<string[]> {
  const verifyDir = join(root, "verify-clone");
  rmSync(verifyDir, { recursive: true, force: true });
  await ensureNotesRepoCloned(verifyDir, remoteDir);
  return (await readNotes(verifyDir)).map((n) => n.text);
}

test("pushLocalChanges succeeds after another clone pushed since our last sync (diverged history)", async () => {
  await writeNote(cloneDir, "desktop note 1");
  await pushLocalChanges(cloneDir);

  const phoneCloneDir = join(root, "phone-clone");
  await ensureNotesRepoCloned(phoneCloneDir, remoteDir);
  await configureIdentity(phoneCloneDir);
  await writeNote(phoneCloneDir, "phone note");
  await pushLocalChanges(phoneCloneDir);

  await writeNote(cloneDir, "desktop note 2");
  await expect(pushLocalChanges(cloneDir)).resolves.toBeUndefined();

  // a second round must also work — the old failure mode wedged every later sync
  await writeNote(cloneDir, "desktop note 3");
  await expect(pushLocalChanges(cloneDir)).resolves.toBeUndefined();

  const texts = await remoteNoteTexts();
  expect(texts).toEqual(expect.arrayContaining(["desktop note 1", "phone note", "desktop note 2", "desktop note 3"]));
  expect((await remoteLogMessages()).length).toBe(4);
});

test("pushLocalChanges succeeds when both clones started from an empty remote and the other pushed first", async () => {
  const phoneCloneDir = join(root, "phone-clone");
  await ensureNotesRepoCloned(phoneCloneDir, remoteDir);
  await configureIdentity(phoneCloneDir);

  await writeNote(cloneDir, "desktop unpushed note");
  await Bun.$`git add -A`.cwd(cloneDir).quiet();
  await Bun.$`git commit -m ${"Add note"}`.cwd(cloneDir).quiet();

  await writeNote(phoneCloneDir, "phone note");
  await pushLocalChanges(phoneCloneDir);

  await writeNote(cloneDir, "desktop second note");
  await expect(pushLocalChanges(cloneDir)).resolves.toBeUndefined();

  const texts = await remoteNoteTexts();
  expect(texts).toEqual(expect.arrayContaining(["desktop unpushed note", "phone note", "desktop second note"]));
});

test("pullChanges succeeds while the desktop holds an unpushed local commit (diverged history)", async () => {
  await writeNote(cloneDir, "desktop note 1");
  await pushLocalChanges(cloneDir);

  const phoneCloneDir = join(root, "phone-clone");
  await ensureNotesRepoCloned(phoneCloneDir, remoteDir);
  await configureIdentity(phoneCloneDir);
  await writeNote(phoneCloneDir, "phone note");
  await pushLocalChanges(phoneCloneDir);

  await writeNote(cloneDir, "desktop unpushed note");
  await Bun.$`git add -A`.cwd(cloneDir).quiet();
  await Bun.$`git commit -m ${"Add note"}`.cwd(cloneDir).quiet();

  await expect(pullChanges(cloneDir)).resolves.toBeUndefined();
  const texts = (await readNotes(cloneDir)).map((n) => n.text);
  expect(texts).toEqual(expect.arrayContaining(["desktop note 1", "phone note", "desktop unpushed note"]));
});

test("git failures surface git's own stderr, not just an exit code", async () => {
  await writeNote(cloneDir, "orphaned note");
  await Bun.$`git remote set-url origin /nonexistent/path`.cwd(cloneDir).quiet();
  const failure = await pushLocalChanges(cloneDir).catch((err: Error) => err);
  expect(failure).toBeInstanceOf(Error);
  expect((failure as Error).message).not.toMatch(/^Failed with exit code/);
  expect((failure as Error).message).toContain("/nonexistent/path");
});

test("git commands refuse to run when the clone path sits inside another repository", async () => {
  const outerRepoDir = join(root, "outer-repo");
  await Bun.$`git init ${outerRepoDir}`.quiet();
  await configureIdentity(outerRepoDir);
  const nestedClonePath = join(outerRepoDir, "notes-data");
  mkdirSync(nestedClonePath, { recursive: true });

  await expect(writeNote(nestedClonePath, "must not land in the outer repo")).rejects.toThrow(
    /inside another repository/,
  );
  await expect(pushLocalChanges(nestedClonePath)).rejects.toThrow(/inside another repository/);
  await expect(pullChanges(nestedClonePath)).rejects.toThrow(/inside another repository/);
  await expect(fetchRemote(nestedClonePath)).rejects.toThrow(/inside another repository/);
  await expect(hasUnpulledChanges(nestedClonePath)).rejects.toThrow(/inside another repository/);

  const outerLog = await Bun.$`git log --oneline`.cwd(outerRepoDir).nothrow().quiet().text();
  expect(outerLog.trim()).toBe("");
});

test("git commands refuse to run when the clone path is not a git repository at all", async () => {
  const plainDir = join(root, "plain-dir");
  mkdirSync(plainDir, { recursive: true });
  await expect(pushLocalChanges(plainDir)).rejects.toThrow(/is not a git repository/);
});

test("ensureNotesRepoCloned clones into an existing directory that has no .git", async () => {
  const preexistingDir = join(root, "preexisting");
  mkdirSync(preexistingDir, { recursive: true });
  await ensureNotesRepoCloned(preexistingDir, remoteDir);
  expect(existsSync(join(preexistingDir, ".git"))).toBe(true);
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

test("updateNote overwrites the note's text in place, keeping the same id", async () => {
  const note = await writeNote(cloneDir, "original text");
  const updated = await updateNote(cloneDir, note.id, "edited text");
  expect(updated.id).toBe(note.id);
  expect(updated.text).toBe("edited text");
  const notes = await readNotes(cloneDir);
  expect(notes.length).toBe(1);
  expect(notes.find((n) => n.id === note.id)?.text).toBe("edited text");
});

test("updateNote throws when the note id does not exist", async () => {
  await expect(updateNote(cloneDir, "does-not-exist", "text")).rejects.toThrow(/note not found/);
});

test("updateNote refuses to run when the clone path is not a git repository at all", async () => {
  const plainDir = join(root, "plain-updatenote-dir");
  mkdirSync(plainDir, { recursive: true });
  await expect(updateNote(plainDir, "some-id", "text")).rejects.toThrow(/is not a git repository/);
});

test("editing the same note on two clones resolves via last-sync-wins (git pull --rebase -X theirs)", async () => {
  const note = await writeNote(cloneDir, "shared note v1");
  await pushLocalChanges(cloneDir);

  const phoneCloneDir = join(root, "phone-clone");
  await ensureNotesRepoCloned(phoneCloneDir, remoteDir);
  await configureIdentity(phoneCloneDir);
  await pullChanges(phoneCloneDir);
  await updateNote(phoneCloneDir, note.id, "phone edit");
  await pushLocalChanges(phoneCloneDir);

  // desktop never pulled the phone's edit before editing the same note itself —
  // without -X theirs this push would throw a rebase conflict error instead of resolving
  await updateNote(cloneDir, note.id, "desktop edit");
  await expect(pushLocalChanges(cloneDir)).resolves.toBeUndefined();

  const texts = await remoteNoteTexts();
  expect(texts).toContain("desktop edit");
  expect(texts).not.toContain("phone edit");
});
