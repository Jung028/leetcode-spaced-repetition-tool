// notes/local-client.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureNotesRepoCloned } from "./notes-repo";
import { notesApiRoutes } from "./notes-api";
import { createLocalClient } from "./local-client";

let root: string;
let server: ReturnType<typeof Bun.serve>;
let client: ReturnType<typeof createLocalClient>;

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), "local-client-test-"));
  const remoteDir = join(root, "remote.git");
  const cloneDir = join(root, "clone");
  await Bun.$`git init --bare ${remoteDir}`.quiet();
  await ensureNotesRepoCloned(cloneDir, remoteDir);
  await Bun.$`git config user.email test@example.com`.cwd(cloneDir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(cloneDir).quiet();
  server = Bun.serve({ port: 0, routes: notesApiRoutes(cloneDir) });
  const base = server.url.origin;
  const scopedFetch: typeof fetch = (input, init) =>
    fetch(new URL(String(input), base), init);
  client = createLocalClient(scopedFetch);
});

afterEach(() => {
  server.stop(true);
  rmSync(root, { recursive: true, force: true });
});

test("listNotes returns an empty array initially", async () => {
  expect(await client.listNotes()).toEqual([]);
});

test("addNote then listNotes round-trips the note", async () => {
  const added = await client.addNote("hello from local-client");
  expect(added.text).toBe("hello from local-client");
  const notes = await client.listNotes();
  expect(notes.some((n) => n.id === added.id)).toBe(true);
});

test("checkForUpdates returns false on a fresh clone", async () => {
  expect(await client.checkForUpdates()).toBe(false);
});

test("sync and pull do not throw against a working repo", async () => {
  await client.addNote("to sync");
  await expect(client.sync()).resolves.toBeUndefined();
  await expect(client.pull()).resolves.toEqual(expect.any(Array));
});
