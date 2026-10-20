// notes/notes-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureNotesRepoCloned } from "./notes-repo";
import { notesApiRoutes } from "./notes-api";

let root: string;
let remoteDir: string;
let cloneDir: string;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), "notes-api-test-"));
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
  server = Bun.serve({ port: 0, routes: notesApiRoutes(cloneDir) });
  base = server.url.origin;
});

afterEach(() => {
  server.stop(true);
  rmSync(root, { recursive: true, force: true });
});

test("GET /api/notes returns an empty list initially", async () => {
  const res = await fetch(`${base}/api/notes`);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual([]);
});

test("POST /api/notes creates a note", async () => {
  const res = await fetch(`${base}/api/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "remember the milk" }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.text).toBe("remember the milk");

  const list = await (await fetch(`${base}/api/notes`)).json();
  expect(list.length).toBe(1);
});

test("POST /api/notes rejects empty text", async () => {
  const res = await fetch(`${base}/api/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/notes rejects whitespace-only text", async () => {
  const res = await fetch(`${base}/api/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "   \n  " }),
  });
  expect(res.status).toBe(400);
  const list = await (await fetch(`${base}/api/notes`)).json();
  expect(list.length).toBe(0);
});

test("POST /api/notes/push commits and pushes a pending note", async () => {
  await fetch(`${base}/api/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "sync me" }),
  });
  const res = await fetch(`${base}/api/notes/push`, { method: "POST" });
  expect(res.status).toBe(200);
  const status = (await Bun.$`git status --porcelain`.cwd(cloneDir).quiet().text()).trim();
  expect(status).toBe("");
});

test("GET /api/notes/sync-status reports no updates on a fresh clone", async () => {
  const res = await fetch(`${base}/api/notes/sync-status`);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ hasUpdates: false });
});

test("POST /api/notes/pull returns the current note list", async () => {
  const res = await fetch(`${base}/api/notes/pull`, { method: "POST" });
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual([]);
});

test("PUT /api/notes/:id updates an existing note's text", async () => {
  const created = await (
    await fetch(`${base}/api/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "original" }),
    })
  ).json();

  const res = await fetch(`${base}/api/notes/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "edited" }),
  });
  expect(res.status).toBe(200);
  const updated = await res.json();
  expect(updated.id).toBe(created.id);
  expect(updated.text).toBe("edited");

  const list = await (await fetch(`${base}/api/notes`)).json();
  expect(list.length).toBe(1);
  expect(list[0].text).toBe("edited");
});

test("PUT /api/notes/:id rejects empty text", async () => {
  const created = await (
    await fetch(`${base}/api/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "original" }),
    })
  ).json();
  const res = await fetch(`${base}/api/notes/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "   " }),
  });
  expect(res.status).toBe(400);
});

test("PUT /api/notes/:id returns 404 for an unknown note id", async () => {
  const res = await fetch(`${base}/api/notes/does-not-exist`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "edited" }),
  });
  expect(res.status).toBe(404);
});

test("PUT /api/notes/:id rejects a path-traversal id instead of writing outside the clone", async () => {
  const res = await fetch(`${base}/api/notes/${encodeURIComponent("../../victim")}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "pwned" }),
  });
  expect(res.status).toBe(400);
  expect(await res.json()).toEqual({ error: "invalid note id" });
  expect(existsSync(join(root, "victim.md"))).toBe(false);
});

test("PUT /api/notes/:id rejects a literally-encoded traversal id (..%2F..%2Fvictim)", async () => {
  const res = await fetch(`${base}/api/notes/..%2F..%2Fvictim`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "pwned" }),
  });
  expect(res.status).toBe(400);
  expect(existsSync(join(root, "victim.md"))).toBe(false);
});
