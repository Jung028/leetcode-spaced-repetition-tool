# Notes Tab + Phone Capture (GitHub-Synced) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Notes feature — a desktop tab plus a free phone-accessible page — that stay in sync through a private GitHub repo, with no server to host or pay for.

**Architecture:** One shared `NotesView` React component renders the note list, add box, and Pull/Sync controls; it depends only on a small `NotesClient` interface (`listNotes`, `addNote`, `checkForUpdates`, `pull`, `sync`). Two adapters implement that interface — `local-client.ts` (talks to new `/api/notes/*` Bun routes backed by a local git clone of a private `notes-data` repo) for the desktop tab, and `github-client.ts` (talks to GitHub's REST API directly, queuing writes in `localStorage` when offline) for a standalone bundle deployed to GitHub Pages and rebuilt automatically by GitHub Actions on every relevant push.

**Tech Stack:** Bun (routes, `bun:sqlite`-free — this feature uses plain files, not the SQLite db), `Bun.$` for git shell commands, Bun's bundler (`bun build`) for the phone bundle, React 19, GitHub REST API (Contents endpoint), GitHub Actions + Pages.

**Spec:** [docs/superpowers/specs/2026-09-30-notes-tab-phone-sync-design.md](../specs/2026-09-30-notes-tab-phone-sync-design.md)

## Global Constraints

- Git operations go through `Bun.$` (this repo's `CLAUDE.md`: "Bun.$\`ls\` instead of execa") — never `node:child_process`, never a separate git library.
- File reads/writes go through `Bun.file`/`Bun.write` where a single-file operation is involved; `node:fs`'s `existsSync`/`readdirSync`/`mkdirSync` are used only where Bun has no direct equivalent (directory listing/creation/existence).
- No new npm runtime dependencies. The only new tooling is `oven-sh/setup-bun` inside the GitHub Actions workflow (not an npm package).
- One markdown file per note, filename = `{ISO-timestamp-with-:-and-.-replaced-by--}-{4-char-random-suffix}.md` — the random suffix comes *after* the timestamp so lexicographic filename sort still equals chronological order.
- This codebase has no React component-test infrastructure anywhere (confirmed by inspection — every existing tab's `.tsx` is verified manually, only `-db.ts`/`-api.ts` layers get `bun test` coverage). This plan does not introduce one; `NotesView.tsx` and `capture-entry.tsx` are verified manually.
- `github-client.ts` and `local-client.ts` both take their I/O dependencies (`Storage`, `fetch`) as constructor arguments so they're testable without a real browser or network call.

## Review Focus

- **Empty or whitespace-only note text submitted** — must be rejected with a 400, never silently create a blank note file. (Task 2)
- **Note text containing shell-sensitive characters** (backticks, `$()`, quotes, newlines) — since git commands run through `Bun.$` template interpolation, a note containing these must still commit correctly and never corrupt or skip the write. (Task 1)
- **Two notes added within the same millisecond** — timestamp-based filenames could otherwise silently overwrite each other; the random suffix must make this a non-issue, verified with a real back-to-back write test. (Task 1)
- **A push that fails after a successful local commit** (remote unreachable) — the note must not be lost; it must still show up in `readNotes` and be retryable next time, never silently disappear. (Task 1)
- **An invalid or expired GitHub token on the phone** — must produce a clear, recoverable error; `sync()` must leave the note queued in `pending`, never report success when GitHub rejected the write. (Task 6)

---

## Task 1: Shared types + local git-backed notes storage

**Files:**
- Create: `notes/notes-client.ts`
- Create: `notes/notes-repo.ts`
- Test: `notes/notes-repo.test.ts`

**Interfaces:**
- Produces: `interface Note { id: string; text: string; createdAt: string }`, `interface NotesClient { listNotes(): Promise<Note[]>; addNote(text: string): Promise<Note>; checkForUpdates(): Promise<boolean>; pull(): Promise<Note[]>; sync(): Promise<void>; }` (from `notes-client.ts`)
- Produces (from `notes-repo.ts`): `ensureNotesRepoCloned(clonePath: string, remoteUrl: string): Promise<void>`, `readNotes(clonePath: string): Promise<Note[]>`, `writeNote(clonePath: string, text: string): Promise<Note>`, `fetchRemote(clonePath: string): Promise<void>`, `hasUnpulledChanges(clonePath: string): Promise<boolean>`, `pullChanges(clonePath: string): Promise<void>`, `pushLocalChanges(clonePath: string): Promise<void>`

- [ ] **Step 1: Write the failing test file**

```ts
// notes/notes-repo.test.ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test notes/notes-repo.test.ts`
Expected: FAIL — `Cannot find module './notes-repo'` (the file doesn't exist yet).

- [ ] **Step 3: Write `notes/notes-client.ts`**

```ts
// notes/notes-client.ts
export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface NotesClient {
  listNotes(): Promise<Note[]>;
  addNote(text: string): Promise<Note>;
  checkForUpdates(): Promise<boolean>;
  pull(): Promise<Note[]>;
  sync(): Promise<void>;
}
```

- [ ] **Step 4: Write `notes/notes-repo.ts`**

```ts
// notes/notes-repo.ts
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import type { Note } from "./notes-client";

function notesDir(clonePath: string): string {
  return `${clonePath}/notes`;
}

function noteIdFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "");
}

function timestampId(date: Date): string {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${stamp}-${suffix}`;
}

export async function ensureNotesRepoCloned(clonePath: string, remoteUrl: string): Promise<void> {
  if (existsSync(clonePath)) return;
  await Bun.$`git clone ${remoteUrl} ${clonePath}`.quiet();
}

export async function readNotes(clonePath: string): Promise<Note[]> {
  const dir = notesDir(clonePath);
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const notes = await Promise.all(
    files.map(async (filename) => {
      const id = noteIdFromFilename(filename);
      const text = await Bun.file(`${dir}/${filename}`).text();
      return { id, text, createdAt: id } satisfies Note;
    }),
  );
  return notes.sort((a, b) => b.id.localeCompare(a.id));
}

export async function writeNote(clonePath: string, text: string): Promise<Note> {
  const dir = notesDir(clonePath);
  mkdirSync(dir, { recursive: true });
  const id = timestampId(new Date());
  await Bun.write(`${dir}/${id}.md`, text);
  return { id, text, createdAt: id };
}

export async function fetchRemote(clonePath: string): Promise<void> {
  await Bun.$`git fetch`.cwd(clonePath).quiet();
}

export async function hasUnpulledChanges(clonePath: string): Promise<boolean> {
  const local = (await Bun.$`git rev-parse HEAD`.cwd(clonePath).quiet().text()).trim();
  const upstream = (await Bun.$`git rev-parse @{u}`.cwd(clonePath).quiet().text()).trim();
  return local !== upstream;
}

export async function pullChanges(clonePath: string): Promise<void> {
  await Bun.$`git pull`.cwd(clonePath).quiet();
}

export async function pushLocalChanges(clonePath: string): Promise<void> {
  const status = (await Bun.$`git status --porcelain`.cwd(clonePath).quiet().text()).trim();
  if (status.length > 0) {
    await Bun.$`git add -A`.cwd(clonePath).quiet();
    await Bun.$`git commit -m "Add note"`.cwd(clonePath).quiet();
  }
  await Bun.$`git push -u origin HEAD`.cwd(clonePath).quiet();
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun test notes/notes-repo.test.ts`
Expected: PASS (all cases, including the shell-sensitive-text and post-commit-push-failure cases). If `pushLocalChanges` fails on the very first push in the suite's setup path with "no upstream branch", confirm the `-u origin HEAD` flag is present exactly as written above — that flag is what establishes tracking on the first push from a fresh clone of an empty bare repo.

- [ ] **Step 6: Commit**

```bash
git add notes/notes-client.ts notes/notes-repo.ts notes/notes-repo.test.ts
git commit -m "feat(notes): add git-backed local notes storage"
```

---

## Task 2: HTTP routes wrapping the notes repo

**Files:**
- Create: `notes/notes-api.ts`
- Test: `notes/notes-api.test.ts`

**Interfaces:**
- Consumes: everything from Task 1's `notes-repo.ts` (`readNotes`, `writeNote`, `fetchRemote`, `hasUnpulledChanges`, `pullChanges`, `pushLocalChanges`, and `ensureNotesRepoCloned` for test setup).
- Produces: `notesApiRoutes(clonePath: string)` returning a Bun `routes` object with `GET/POST /api/notes`, `GET /api/notes/sync-status`, `POST /api/notes/pull`, `POST /api/notes/push` — same shape as `todoApiRoutes(db)` in `todo/api.ts`.

- [ ] **Step 1: Write the failing test file**

```ts
// notes/notes-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test notes/notes-api.test.ts`
Expected: FAIL — `Cannot find module './notes-api'`.

- [ ] **Step 3: Write `notes/notes-api.ts`**

```ts
// notes/notes-api.ts
import {
  readNotes,
  writeNote,
  fetchRemote,
  hasUnpulledChanges,
  pullChanges,
  pushLocalChanges,
} from "./notes-repo";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function notesApiRoutes(clonePath: string) {
  return {
    "/api/notes": {
      GET: async () => {
        try {
          return json(await readNotes(clonePath));
        } catch (err) {
          return json({ error: `notes repo not available: ${(err as Error).message}` }, 503);
        }
      },
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
        const text = typeof body?.text === "string" ? body.text.trim() : "";
        if (!text) return json({ error: "text is required" }, 400);
        try {
          return json(await writeNote(clonePath, text), 201);
        } catch (err) {
          return json({ error: `could not save note: ${(err as Error).message}` }, 503);
        }
      },
    },
    "/api/notes/sync-status": {
      GET: async () => {
        try {
          await fetchRemote(clonePath);
          return json({ hasUpdates: await hasUnpulledChanges(clonePath) });
        } catch (err) {
          return json({ error: `could not check for updates: ${(err as Error).message}` }, 503);
        }
      },
    },
    "/api/notes/pull": {
      POST: async () => {
        try {
          await pullChanges(clonePath);
          return json(await readNotes(clonePath));
        } catch (err) {
          return json({ error: `pull failed: ${(err as Error).message}` }, 503);
        }
      },
    },
    "/api/notes/push": {
      POST: async () => {
        try {
          await pushLocalChanges(clonePath);
          return json({ ok: true });
        } catch (err) {
          return json({ error: `push failed: ${(err as Error).message}` }, 503);
        }
      },
    },
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test notes/notes-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add notes/notes-api.ts notes/notes-api.test.ts
git commit -m "feat(notes): add HTTP routes for the notes repo"
```

---

## Task 3: Desktop data-access adapter

**Files:**
- Create: `notes/local-client.ts`
- Test: `notes/local-client.test.ts`

**Interfaces:**
- Consumes: `NotesClient`/`Note` from `notes-client.ts`; `notesApiRoutes` from `notes-api.ts` (test setup only, same fixture style as Task 2).
- Produces: `createLocalClient(fetchFn?: typeof fetch): NotesClient` — `fetchFn` defaults to the global `fetch`, overridable in tests so this doesn't need a real server in every test (though for these tests, a real ephemeral `Bun.serve` fixture — same as Task 2 — is simpler than mocking `fetch`, since the routes already exist and are cheap to spin up).

- [ ] **Step 1: Write the failing test file**

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test notes/local-client.test.ts`
Expected: FAIL — `Cannot find module './local-client'`.

- [ ] **Step 3: Write `notes/local-client.ts`**

```ts
// notes/local-client.ts
import type { Note, NotesClient } from "./notes-client";

export function createLocalClient(fetchFn: typeof fetch = fetch): NotesClient {
  return {
    async listNotes() {
      const res = await fetchFn("/api/notes");
      if (!res.ok) throw new Error(`could not load notes (${res.status})`);
      return (await res.json()) as Note[];
    },
    async addNote(text: string) {
      const res = await fetchFn("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`could not save note (${res.status})`);
      return (await res.json()) as Note;
    },
    async checkForUpdates() {
      const res = await fetchFn("/api/notes/sync-status");
      if (!res.ok) throw new Error(`could not check for updates (${res.status})`);
      const body = (await res.json()) as { hasUpdates: boolean };
      return body.hasUpdates;
    },
    async pull() {
      const res = await fetchFn("/api/notes/pull", { method: "POST" });
      if (!res.ok) throw new Error(`pull failed (${res.status})`);
      return (await res.json()) as Note[];
    },
    async sync() {
      const res = await fetchFn("/api/notes/push", { method: "POST" });
      if (!res.ok) throw new Error(`sync failed (${res.status})`);
    },
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test notes/local-client.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add notes/local-client.ts notes/local-client.test.ts
git commit -m "feat(notes): add the desktop (local API) NotesClient adapter"
```

---

## Task 4: Shared NotesView UI component + desktop entry

**Files:**
- Create: `notes/NotesView.tsx`
- Create: `notes/notes.css`
- Create: `notes/App.tsx`

**Interfaces:**
- Consumes: `Note`, `NotesClient` from `notes-client.ts`.
- Produces: `export default function NotesView({ client }: { client: NotesClient })` (used by both `notes/App.tsx` and, in Task 7, `notes/capture-entry.tsx`); `notes/App.tsx` default-exports `NotesApp`, a zero-prop component wrapping `NotesView` with `createLocalClient()`.

- [ ] **Step 1: Write `notes/notes.css`**

Self-contained styles — this file is shared by both the desktop tab (which also loads the app's `index.css`) and the standalone phone bundle (which loads *only* this file), so it must not depend on any custom properties defined in `index.css`.

```css
/* notes/notes.css */
.notes-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1e1e1e;
}

.notes-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notes-badge {
  font-size: 0.85rem;
  color: #b45309;
  margin-right: auto;
}

.notes-toolbar button,
.notes-add button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
}

.notes-toolbar button:disabled,
.notes-add button:disabled {
  opacity: 0.5;
  cursor: default;
}

.notes-status {
  font-size: 0.85rem;
  color: #b91c1c;
  margin: 0;
}

.notes-add {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notes-add textarea {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font: inherit;
  resize: vertical;
}

.notes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notes-item {
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.notes-item-text {
  white-space: pre-wrap;
}

.notes-item-date {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
}

.notes-empty {
  color: #888;
  font-style: italic;
}
```

- [ ] **Step 2: Write `notes/NotesView.tsx`**

```tsx
// notes/NotesView.tsx
import { useEffect, useState } from "react";
import type { Note, NotesClient } from "./notes-client";
import "./notes.css";

export default function NotesView({ client }: { client: NotesClient }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [hasUpdates, setHasUpdates] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setNotes(await client.listNotes());
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  const checkUpdates = async () => {
    try {
      setHasUpdates(await client.checkForUpdates());
    } catch {
      // badge just doesn't update — not worth surfacing as an error
    }
  };

  useEffect(() => {
    load();
    checkUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSync = async () => {
    setBusy(true);
    try {
      await client.sync();
      setStatus(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAndSync = async () => {
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    try {
      await client.addNote(text);
      setDraft("");
      await load();
      await client.sync();
      setStatus(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handlePull = async () => {
    setBusy(true);
    try {
      setNotes(await client.pull());
      setHasUpdates(false);
      setStatus(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="notes-view">
      <div className="notes-toolbar">
        {hasUpdates && <span className="notes-badge">New notes available</span>}
        <button onClick={handlePull} disabled={busy}>
          Pull
        </button>
        <button onClick={runSync} disabled={busy}>
          Sync
        </button>
      </div>
      {status && <p className="notes-status">{status}</p>}
      <div className="notes-add">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type or dictate a note…"
          rows={3}
        />
        <button onClick={handleSaveAndSync} disabled={busy || !draft.trim()}>
          Save & Sync
        </button>
      </div>
      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note.id} className="notes-item">
            <span className="notes-item-text">{note.text}</span>
            <span className="notes-item-date">{note.createdAt}</span>
          </li>
        ))}
        {notes.length === 0 && <li className="notes-empty">No notes yet.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Write `notes/App.tsx`**

```tsx
// notes/App.tsx
import NotesView from "./NotesView";
import { createLocalClient } from "./local-client";

const client = createLocalClient();

export default function NotesApp() {
  return <NotesView client={client} />;
}
```

- [ ] **Step 4: Manual verification (this codebase has no component-test infra — see Global Constraints)**

This component can't be exercised in isolation yet (it needs a running server for `local-client.ts` to talk to) — full manual verification happens in Task 5's step, once the tab is wired into the running app. For now, confirm there are no TypeScript errors:

Run: `bunx tsc --noEmit`
Expected: no errors mentioning `notes/NotesView.tsx`, `notes/notes.css`, or `notes/App.tsx`.

- [ ] **Step 5: Commit**

```bash
git add notes/NotesView.tsx notes/notes.css notes/App.tsx
git commit -m "feat(notes): add the shared NotesView UI and desktop entry point"
```

---

## Task 5: Wire the Notes tab into the running app

**Files:**
- Modify: `index.ts`
- Modify: `frontend.tsx:6` (imports), `frontend.tsx:631` (`Tab` type), `frontend.tsx:807-812` (TabBar), `frontend.tsx:874-879` (render block)

**Interfaces:**
- Consumes: `ensureNotesRepoCloned`, `notesApiRoutes` (Task 1/2); `NotesApp` default export (Task 4).

- [ ] **Step 1: Modify `index.ts`**

Add these imports near the other per-module imports (alongside `import { migrateTodo } from "./todo/db";`):

```ts
import { ensureNotesRepoCloned } from "./notes/notes-repo";
import { notesApiRoutes } from "./notes/notes-api";
```

Add this after the existing `migrate*`/`seed*` calls, before `const server = Bun.serve({`:

```ts
const NOTES_CLONE_PATH = process.env.NOTES_DATA_CLONE_PATH ?? "../notes-data";
const NOTES_REMOTE_URL = process.env.NOTES_DATA_REMOTE;
if (NOTES_REMOTE_URL) {
  try {
    await ensureNotesRepoCloned(NOTES_CLONE_PATH, NOTES_REMOTE_URL);
  } catch (err) {
    console.warn(`Notes repo not available yet: ${(err as Error).message}`);
  }
} else {
  console.warn("NOTES_DATA_REMOTE is not set — the Notes tab will show errors until it is.");
}
```

Add this line inside the `routes: { ... }` object, alongside the other `...xApiRoutes(...)` spreads:

```ts
    ...notesApiRoutes(NOTES_CLONE_PATH),
```

- [ ] **Step 2: Modify `frontend.tsx` imports**

Add near the existing `import TodoApp from "./todo/App";` (around line 6):

```ts
import NotesApp from "./notes/App";
```

- [ ] **Step 3: Modify the `Tab` type (line 631)**

```ts
type Tab = "home" | "deadlines" | "leetcode" | "todo" | "notes" | "exam" | "interview" | "jobs" | "training" | "calendar" | "goals" | "roadmap";
```

- [ ] **Step 4: Add a TabBar button (after the existing Todo button, around line 812)**

```tsx
      <button
        className={tab === "notes" ? "tab tab-active" : "tab"}
        onClick={() => onChange("notes")}
      >
        Notes
      </button>
```

- [ ] **Step 5: Add the render block (after the Todo render block, around line 879)**

```tsx
      {tab === "notes" && <NotesApp />}
```

- [ ] **Step 6: Type-check**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Manual verification (requires the `notes-data` repo from the spec's Prerequisites to already exist)**

```bash
NOTES_DATA_REMOTE=git@github.com:<you>/notes-data.git bun run dev
```

Then in a browser: open the app, click the **Notes** tab, type a note, click **Save & Sync**. Confirm:
- The note appears in the list immediately.
- `git -C ../notes-data log --oneline` (from the project's parent directory) shows a new commit.
- `git -C ../notes-data status` is clean (nothing uncommitted).

- [ ] **Step 8: Commit**

```bash
git add index.ts frontend.tsx
git commit -m "feat(notes): wire the Notes tab into the running app"
```

---

## Task 6: Phone data-access adapter (GitHub-direct)

**Files:**
- Create: `notes/github-client.ts`
- Test: `notes/github-client.test.ts`

**Interfaces:**
- Consumes: `Note`, `NotesClient` from `notes-client.ts`.
- Produces: `createGithubClient(opts: { owner: string; repo: string; token: string; storage: Storage; fetchFn?: typeof fetch }): NotesClient`.

- [ ] **Step 1: Write the failing test file**

```ts
// notes/github-client.test.ts
import { test, expect, beforeEach } from "bun:test";
import { createGithubClient } from "./github-client";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
});

test("addNote queues locally without any network call", async () => {
  const fetchFn = (async () => {
    throw new Error("should not be called");
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  const note = await client.addNote("queued note");
  expect(note.text).toBe("queued note");
});

test("sync sends each queued note to GitHub's Contents API and clears the queue on success", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init: init! });
    return new Response("{}", { status: 201 });
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.addNote("first");
  await client.addNote("second");
  await client.sync();
  expect(calls.length).toBe(2);
  expect(calls[0]!.url).toContain("api.github.com/repos/me/notes-data/contents/notes/");
  expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe("Bearer t");
});

test("a failed sync leaves the note queued and throws", async () => {
  const fetchFn = (async () => new Response("nope", { status: 401 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "bad-token", storage, fetchFn });
  await client.addNote("will fail");
  await expect(client.sync()).rejects.toThrow();

  // retrying with a working fetch should still send the originally-queued note
  const calls: string[] = [];
  const retryFetch = (async (url: string) => {
    calls.push(url);
    return new Response("{}", { status: 201 });
  }) as unknown as typeof fetch;
  const retryClient = createGithubClient({ owner: "me", repo: "notes-data", token: "good", storage, fetchFn: retryFetch });
  await retryClient.sync();
  expect(calls.length).toBe(1);
});

test("listNotes, checkForUpdates, and pull are safe no-ops (phone is add-only in v1)", async () => {
  const fetchFn = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  expect(await client.listNotes()).toEqual([]);
  expect(await client.checkForUpdates()).toBe(false);
  expect(await client.pull()).toEqual([]);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test notes/github-client.test.ts`
Expected: FAIL — `Cannot find module './github-client'`.

- [ ] **Step 3: Write `notes/github-client.ts`**

```ts
// notes/github-client.ts
import type { Note, NotesClient } from "./notes-client";

interface PendingNote {
  id: string;
  text: string;
}

const STORAGE_KEY = "notes-capture-pending";

function loadPending(storage: Storage): PendingNote[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingNote[];
  } catch {
    return [];
  }
}

function savePending(storage: Storage, pending: PendingNote[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

function timestampId(date: Date): string {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${stamp}-${suffix}`;
}

function toBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function createGithubClient(opts: {
  owner: string;
  repo: string;
  token: string;
  storage: Storage;
  fetchFn?: typeof fetch;
}): NotesClient {
  const fetchFn = opts.fetchFn ?? fetch;

  const putFile = async (id: string, text: string): Promise<void> => {
    const res = await fetchFn(
      `https://api.github.com/repos/${opts.owner}/${opts.repo}/contents/notes/${id}.md`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${opts.token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Add note ${id}`,
          content: toBase64(text),
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`GitHub rejected the note (${res.status})`);
    }
  };

  return {
    async listNotes() {
      // v1: the phone is add-only, see the spec's "Out of scope" section.
      return [] as Note[];
    },
    async addNote(text: string) {
      const pending = loadPending(opts.storage);
      const id = timestampId(new Date());
      pending.push({ id, text });
      savePending(opts.storage, pending);
      return { id, text, createdAt: id };
    },
    async checkForUpdates() {
      return false;
    },
    async pull() {
      return [] as Note[];
    },
    async sync() {
      const pending = loadPending(opts.storage);
      const remaining: PendingNote[] = [];
      let firstError: Error | null = null;
      for (const note of pending) {
        try {
          await putFile(note.id, note.text);
        } catch (err) {
          remaining.push(note);
          firstError ??= err as Error;
        }
      }
      savePending(opts.storage, remaining);
      if (firstError) throw firstError;
    },
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test notes/github-client.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add notes/github-client.ts notes/github-client.test.ts
git commit -m "feat(notes): add the phone (GitHub-direct) NotesClient adapter"
```

---

## Task 7: Phone entry point + static shell

**Files:**
- Create: `notes/capture-entry.tsx`
- Create: `notes-capture/index.html`

**Interfaces:**
- Consumes: `NotesView` (Task 4), `createGithubClient` (Task 6).

- [ ] **Step 1: Write `notes/capture-entry.tsx`**

```tsx
// notes/capture-entry.tsx
import { createRoot } from "react-dom/client";
import NotesView from "./NotesView";
import { createGithubClient } from "./github-client";

const TOKEN_KEY = "notes-capture-token";

function getOrPromptToken(): string {
  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) return existing;
  const entered = window.prompt(
    "Paste your GitHub personal access token (scoped to the notes-data repo):",
  );
  const token = entered?.trim() ?? "";
  if (token) localStorage.setItem(TOKEN_KEY, token);
  return token;
}

const token = getOrPromptToken();
const client = createGithubClient({
  owner: "Jung028",
  repo: "notes-data",
  token,
  storage: localStorage,
});

createRoot(document.getElementById("root")!).render(<NotesView client={client} />);
```

- [ ] **Step 2: Write `notes-capture/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Notes</title>
    <link rel="stylesheet" href="./capture-entry.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./capture-entry.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Build it locally and confirm the actual output filenames**

Run:
```bash
bun build ./notes/capture-entry.tsx --outdir ./notes-capture
ls notes-capture/
```

Expected: `capture-entry.js`, `capture-entry.css` (Bun's bundler names output files after the entry point's basename, with a sibling `.css` when the entry graph imports a stylesheet — `NotesView.tsx` imports `./notes.css`, which flows into this build). **If the actual filenames differ from `capture-entry.js` / `capture-entry.css`, update the `<link>`/`<script>` paths in `notes-capture/index.html` from Step 2 to match exactly what was produced**, then re-run the build to confirm.

- [ ] **Step 4: Serve it locally and manually verify in a browser**

```bash
cd notes-capture && bunx serve .
```

Open the printed local URL. Confirm:
- The page loads with no console errors (check with browser devtools).
- It prompts for a GitHub token on first load.
- After entering any placeholder token, typing a note and clicking "Save & Sync" shows a "GitHub rejected the note (401)" status message (expected — a placeholder token has no real access; this confirms the request path and error handling work, not that it can actually write yet).

Then delete the local build output — it's a build artifact, not something to commit:

```bash
rm notes-capture/capture-entry.js notes-capture/capture-entry.css
```

- [ ] **Step 5: Commit**

```bash
git add notes/capture-entry.tsx notes-capture/index.html
git commit -m "feat(notes): add the phone capture entry point and static shell"
```

---

## Task 8: GitHub Actions auto-deploy to Pages

**Files:**
- Create: `.github/workflows/deploy-notes-capture.yml`

**Interfaces:**
- Consumes: `notes/capture-entry.tsx` (Task 7) as the build entry point; `notes-capture/index.html` (Task 7) as the static shell it deploys alongside the fresh build output.

- [ ] **Step 1: Write the workflow**

```yaml
# .github/workflows/deploy-notes-capture.yml
name: Deploy notes capture page

on:
  push:
    branches: [main]
    paths:
      - "notes/**"
      - "notes-capture/index.html"
      - ".github/workflows/deploy-notes-capture.yml"

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - run: bun install
      - run: bun build ./notes/capture-entry.tsx --outdir ./notes-capture
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: notes-capture
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy-notes-capture.yml
git commit -m "ci(notes): auto-build and deploy the phone capture page on push"
```

- [ ] **Step 3: Manual verification (requires GitHub Pages already set to "Source: GitHub Actions" per the spec's Prerequisites)**

Push this branch to `main`, then in the GitHub repo's **Actions** tab confirm the "Deploy notes capture page" workflow runs and succeeds. Open the URL shown in the workflow's `deployment` step output — confirm it loads the same page verified locally in Task 7, Step 4.
