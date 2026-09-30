// notes/local-client.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureNotesRepoCloned } from "./notes-repo";
import { notesApiRoutes } from "./notes-api";
import { createLocalClient, type FetchLike } from "./local-client";

let root: string;
let server: ReturnType<typeof Bun.serve>;
let client: ReturnType<typeof createLocalClient>;
let cloneDir: string;

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), "local-client-test-"));
  const remoteDir = join(root, "remote.git");
  cloneDir = join(root, "clone");
  await Bun.$`git init --bare ${remoteDir}`.quiet();
  await ensureNotesRepoCloned(cloneDir, remoteDir);
  await Bun.$`git config user.email test@example.com`.cwd(cloneDir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(cloneDir).quiet();
  server = Bun.serve({ port: 0, routes: notesApiRoutes(cloneDir) });
  const base = server.url.origin;
  const scopedFetch: FetchLike = (input, init) =>
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

test("a failed sync reports the server's error message, including git's own reason", async () => {
  await client.addNote("will not push");
  await Bun.$`git remote set-url origin /nonexistent/path`.cwd(cloneDir).quiet();
  const failure = await client.sync().catch((err: Error) => err);
  expect(failure).toBeInstanceOf(Error);
  expect((failure as Error).message).toStartWith("push failed: ");
  expect((failure as Error).message).toContain("/nonexistent/path");
});

test("the server's JSON error field becomes the thrown message", async () => {
  const stubFetch: FetchLike = async () =>
    Response.json({ error: "notes repo not available: boom" }, { status: 503 });
  await expect(createLocalClient(stubFetch).listNotes()).rejects.toThrow(
    new Error("notes repo not available: boom"),
  );
});

test("a non-JSON error response falls back to the status-code message", async () => {
  const stubFetch: FetchLike = async () => new Response("<html>bad gateway</html>", { status: 502 });
  await expect(createLocalClient(stubFetch).sync()).rejects.toThrow(new Error("sync failed (502)"));
});

test("sync and pull do not throw against a working repo", async () => {
  await client.addNote("to sync");
  await expect(client.sync()).resolves.toBeUndefined();
  await expect(client.pull()).resolves.toEqual(expect.any(Array));
});

test("updateNote round-trips an edit against a real local clone", async () => {
  const added = await client.addNote("before edit");
  const updated = await client.updateNote(added.id, "after edit");
  expect(updated.id).toBe(added.id);
  expect(updated.text).toBe("after edit");
  const notes = await client.listNotes();
  expect(notes.find((n) => n.id === added.id)?.text).toBe("after edit");
});

test("updateNote against an unknown id reports the server's 404 message", async () => {
  const failure = await client.updateNote("does-not-exist", "text").catch((err: Error) => err);
  expect(failure).toBeInstanceOf(Error);
  expect((failure as Error).message).toContain("note not found");
});
