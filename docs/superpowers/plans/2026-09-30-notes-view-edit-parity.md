# Notes View + Edit Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** let both the desktop Notes tab and the phone capture page view, add, and edit the same notes — today only desktop can view/add (no edit anywhere) and phone can only add (never sees history).

**Architecture:** add one new method, `updateNote(id, text)`, to the shared `NotesClient` interface; implement it in both adapters (`local-client.ts` over a new `PUT /api/notes/:id` route backed by `notes-repo.ts`; `github-client.ts` over GitHub's Contents API using a cached file `sha`); rework `github-client.ts`'s `listNotes()`/`pull()` to actually read the remote repo instead of only showing the local pending queue; add inline click-to-edit in the one shared `NotesView.tsx` so both platforms get editing for free. Conflicts (same note edited on both devices before either syncs) resolve as "last sync wins" — via `git pull --rebase -X theirs` on desktop and a refetch-sha-and-retry-once on phone.

**Tech Stack:** Bun + `Bun.serve()` routes, `Bun.$` for git shell calls, React 19, `bun:test`, GitHub Contents API.

**Spec:** `docs/superpowers/specs/2026-09-30-notes-view-edit-parity-design.md`

## Global Constraints

- `NotesClient` gains exactly one new method: `updateNote(id: string, text: string): Promise<Note>`. Never add GitHub's `sha` concept (or any adapter-specific concept) to the shared `Note` type or to `NotesClient`.
- Conflict handling is **last sync wins, no warning or merge UI** — no exceptions, no partial detection UI.
- Editing stays **manual-sync**, button-driven, exactly like the existing Add flow — never auto-save-while-typing.
- **Boundaries validate, internals trust**: `PUT /api/notes/:id` rejects empty/whitespace text (400); `notes-repo.ts`'s `updateNote` does not re-validate text, matching how `writeNote` already behaves.
- Out of scope: deleting notes, any conflict/merge UI, real-time auto-save editing, pagination for the phone note list.
- Phone's `listNotes()`/`pull()` now do a real network call — on failure they throw, same as `sync()` already does; `NotesView`'s existing `try/catch` in `load()` already surfaces this as a status message without crashing, so no new error-surfacing code is needed in Task 4.

## Review Focus

- Editing a note id that doesn't exist (typo, stale UI state) must surface a clear "not found" error at every layer, never silently create a new file or crash — pinned in Task 1 (`notes-repo.ts`), Task 2 (`PUT /api/notes/:id` → 404), and Task 3 (phone-side 404 from GitHub).
- Empty/whitespace-only edited text must be rejected at the API boundary (400), not silently saved as a blank note — pinned in Task 2.
- The same note edited on both desktop and phone before either syncs must resolve to "last sync wins" instead of a hard rebase/PUT conflict error — pinned in Task 1 (`git pull --rebase -X theirs`, two-clone test) and Task 3 (stale-sha retry-once test).
- Phone edit text containing non-ASCII characters (emoji, accents) must round-trip correctly through GitHub's base64 content encoding — pinned in Task 3.
- An expired/revoked GitHub token on an edit attempt must surface the same clear "refresh this page" error and clear the stored token, exactly as it already does for add/sync — pinned in Task 3.

---

### Task 1: Shared interface + desktop repo layer (`updateNote` + last-sync-wins rebase)

**Files:**
- Modify: `notes/notes-client.ts`
- Modify: `notes/notes-repo.ts`
- Test: `notes/notes-repo.test.ts`

**Interfaces:**
- Consumes: nothing new — builds on the existing `assertOwnRepo`, `notesDir`, `runReportingStderr` helpers already in `notes-repo.ts`.
- Produces:
  - `NotesClient.updateNote(id: string, text: string): Promise<Note>` (interface only — Tasks 2, 3, 4 implement/consume it).
  - `updateNote(clonePath: string, id: string, text: string): Promise<Note>` in `notes-repo.ts` — overwrites `notes/{id}.md` in place; throws `Error("note not found: " + id)` if the file doesn't exist. Guarded by `assertOwnRepo`, same as `writeNote`.
  - `pullChanges` and `pushLocalChanges` now run `git pull --rebase -X theirs` instead of `git pull --rebase`.

- [ ] **Step 1: Write the failing tests**

Add to `notes/notes-repo.test.ts`. First, add `updateNote` to the import block at the top:

```ts
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
```

Then append these tests at the end of the file:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test notes/notes-repo.test.ts`
Expected: FAIL — `updateNote is not a function` (or similar) for the first three new tests; the fourth fails with the same import error before it can even exercise the rebase behavior.

- [ ] **Step 3: Add `updateNote` to the `NotesClient` interface**

In `notes/notes-client.ts`, change:

```ts
export interface NotesClient {
  listNotes(): Promise<Note[]>;
  addNote(text: string): Promise<Note>;
  checkForUpdates(): Promise<boolean>;
  pull(): Promise<Note[]>;
  sync(): Promise<void>;
}
```

to:

```ts
export interface NotesClient {
  listNotes(): Promise<Note[]>;
  addNote(text: string): Promise<Note>;
  updateNote(id: string, text: string): Promise<Note>;
  checkForUpdates(): Promise<boolean>;
  pull(): Promise<Note[]>;
  sync(): Promise<void>;
}
```

- [ ] **Step 4: Implement `updateNote` in `notes-repo.ts`**

Add this function right after `writeNote` (after line 83):

```ts
export async function updateNote(clonePath: string, id: string, text: string): Promise<Note> {
  await assertOwnRepo(clonePath);
  const path = `${notesDir(clonePath)}/${id}.md`;
  if (!existsSync(path)) {
    throw new Error(`note not found: ${id}`);
  }
  await Bun.write(path, text);
  return { id, text, createdAt: id };
}
```

- [ ] **Step 5: Switch the rebase step to `-X theirs` (last sync wins)**

In `pullChanges`, change:

```ts
  await runReportingStderr("git pull --rebase", () => Bun.$`git pull --rebase`.cwd(clonePath).quiet());
```

to:

```ts
  await runReportingStderr("git pull --rebase", () => Bun.$`git pull --rebase -X theirs`.cwd(clonePath).quiet());
```

In `pushLocalChanges`, the comment and call directly above `git push` currently read:

```ts
  // Rebasing onto the remote first means a phone push since our last sync never
  // rejects this push; one file per note means the rebase itself never conflicts.
  if (await hasRemoteBranches(clonePath)) {
    await runReportingStderr("git pull --rebase", () => Bun.$`git pull --rebase`.cwd(clonePath).quiet());
  }
```

Change to:

```ts
  // Rebasing onto the remote first means a push from elsewhere since our last sync
  // never rejects this push. -X theirs makes "last device to push wins" the actual
  // outcome if the same note was edited on both sides, instead of surfacing a raw
  // rebase conflict — in git rebase, "theirs" is the commit being replayed, i.e. ours.
  if (await hasRemoteBranches(clonePath)) {
    await runReportingStderr("git pull --rebase", () => Bun.$`git pull --rebase -X theirs`.cwd(clonePath).quiet());
  }
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `bun test notes/notes-repo.test.ts`
Expected: PASS — all tests, including the pre-existing ones (the `-X theirs` flag must not change behavior for any test that doesn't hit an actual same-file conflict).

- [ ] **Step 7: Run the full test suite**

Run: `bun test`
Expected: PASS — this file is imported by `notes-api.test.ts` and `local-client.test.ts` indirectly via `notes-repo.ts`; confirm nothing else broke.

- [ ] **Step 8: Commit**

```bash
git add notes/notes-client.ts notes/notes-repo.ts notes/notes-repo.test.ts
git commit -m "feat(notes): add updateNote and last-sync-wins rebase strategy"
```

---

### Task 2: Desktop update endpoint (`PUT /api/notes/:id` + `local-client.ts`)

**Files:**
- Modify: `notes/notes-api.ts`
- Modify: `notes/local-client.ts`
- Test: `notes/notes-api.test.ts`
- Test: `notes/local-client.test.ts`

**Interfaces:**
- Consumes: `updateNote(clonePath, id, text): Promise<Note>` from `notes-repo.ts` (Task 1); `NotesClient.updateNote(id, text): Promise<Note>` from `notes-client.ts` (Task 1).
- Produces: `PUT /api/notes/:id` route — `200` + updated `Note` JSON on success; `400` if text is empty/whitespace; `404` if the note id doesn't exist; `503` on any other repo error. `local-client.ts`'s client object gains `updateNote(id, text)`, calling this route.

- [ ] **Step 1: Write the failing API tests**

Append to `notes/notes-api.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test notes/notes-api.test.ts`
Expected: FAIL — all three new tests fail with a 404/routing error since `/api/notes/:id` doesn't exist yet.

- [ ] **Step 3: Add the route in `notes-api.ts`**

Change the import block at the top from:

```ts
import {
  readNotes,
  writeNote,
  fetchRemote,
  hasUnpulledChanges,
  pullChanges,
  pushLocalChanges,
} from "./notes-repo";
```

to:

```ts
import {
  readNotes,
  writeNote,
  updateNote,
  fetchRemote,
  hasUnpulledChanges,
  pullChanges,
  pushLocalChanges,
} from "./notes-repo";
```

Add this route entry to the object returned by `notesApiRoutes`, right after the `"/api/notes"` entry:

```ts
    "/api/notes/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
        const text = typeof body?.text === "string" ? body.text.trim() : "";
        if (!text) return json({ error: "text is required" }, 400);
        try {
          return json(await updateNote(clonePath, req.params.id, text));
        } catch (err) {
          const message = (err as Error).message;
          if (message.includes("note not found")) return json({ error: message }, 404);
          return json({ error: `could not update note: ${message}` }, 503);
        }
      },
    },
```

- [ ] **Step 4: Run the API tests to verify they pass**

Run: `bun test notes/notes-api.test.ts`
Expected: PASS — all tests, including the pre-existing `/api/notes`, `/api/notes/sync-status`, `/api/notes/pull`, `/api/notes/push` tests (confirms the new `:id` route doesn't shadow the existing static routes).

- [ ] **Step 5: Write the failing local-client tests**

Append to `notes/local-client.test.ts`:

```ts
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
```

- [ ] **Step 6: Run the local-client tests to verify they fail**

Run: `bun test notes/local-client.test.ts`
Expected: FAIL — `client.updateNote is not a function`.

- [ ] **Step 7: Add `updateNote` to `local-client.ts`**

Add this method to the object returned by `createLocalClient`, right after `addNote`:

```ts
    async updateNote(id: string, text: string) {
      const res = await fetchFn(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, `could not update note (${res.status})`));
      return (await res.json()) as Note;
    },
```

- [ ] **Step 8: Run the local-client tests to verify they pass**

Run: `bun test notes/local-client.test.ts`
Expected: PASS.

- [ ] **Step 9: Run the full test suite and the type checker**

Run: `bun test && tsc --noEmit`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add notes/notes-api.ts notes/local-client.ts notes/notes-api.test.ts notes/local-client.test.ts
git commit -m "feat(notes): add PUT /api/notes/:id and local-client.updateNote"
```

---

### Task 3: Phone adapter — real remote reads + `updateNote` (`github-client.ts`)

**Files:**
- Modify: `notes/github-client.ts`
- Test: `notes/github-client.test.ts`

**Interfaces:**
- Consumes: `NotesClient.updateNote(id, text): Promise<Note>` shape from Task 1 (implemented here for the phone adapter).
- Produces: `github-client.ts`'s `listNotes()`/`pull()` now fetch real content from `GET /repos/{owner}/{repo}/contents/notes` (directory listing) plus one `GET /repos/{owner}/{repo}/contents/notes/{id}.md` per file, merged with the local pending queue. An internal `id -> sha` cache (never exposed through `Note` or `NotesClient`) is populated by every such fetch and consumed by the new `updateNote(id, text)`, which either edits a still-pending note in place (no network call) or `PUT`s the change to GitHub with the cached `sha`, retrying once with a freshly-fetched `sha` if GitHub rejects it as stale (409/422) — "last sync wins" via automatic retry, never a UI prompt.

- [ ] **Step 1: Update the two existing tests whose stubs assumed `listNotes`/`pull` never touch the network**

`listNotes()` and `pull()` are about to start making live GitHub calls, so two existing tests need their stub `fetchFn`s adjusted to still make sense. In `notes/github-client.test.ts`, replace this test:

```ts
test("checkForUpdates and pull are safe no-ops; listNotes returns nothing when the queue is empty", async () => {
  const fetchFn = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  expect(await client.listNotes()).toEqual([]);
  expect(await client.checkForUpdates()).toBe(false);
  expect(await client.pull()).toEqual([]);
});
```

with:

```ts
test("checkForUpdates is a no-op; listNotes and pull merge remote notes with the empty local queue", async () => {
  const fetchFn = (async () => new Response("[]", { status: 200 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  expect(await client.listNotes()).toEqual([]);
  expect(await client.checkForUpdates()).toBe(false);
  expect(await client.pull()).toEqual([]);
});
```

And replace this test:

```ts
test("listNotes and pull show queued notes until a sync succeeds, then drop them", async () => {
  let online = false;
  const fetchFn = (async () =>
    online ? new Response("{}", { status: 201 }) : new Response("offline", { status: 503 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  const added = await client.addNote("not yet synced");

  expect(await client.listNotes()).toEqual([{ id: added.id, text: "not yet synced", createdAt: added.id }]);
  await expect(client.sync()).rejects.toThrow("GitHub rejected the note (503)");
  expect((await client.listNotes()).map((n) => n.text)).toEqual(["not yet synced"]);
  expect((await client.pull()).map((n) => n.text)).toEqual(["not yet synced"]);

  online = true;
  await client.sync();
  expect(await client.listNotes()).toEqual([]);
});
```

with:

```ts
test("listNotes and pull show queued notes until a sync succeeds, then drop them", async () => {
  let online = false;
  const fetchFn = (async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    if (method === "GET") return new Response("[]", { status: 200 }); // nothing synced remotely yet
    return online
      ? new Response(JSON.stringify({ content: { sha: "s1" } }), { status: 201 })
      : new Response("offline", { status: 503 });
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  const added = await client.addNote("not yet synced");

  expect(await client.listNotes()).toEqual([{ id: added.id, text: "not yet synced", createdAt: added.id }]);
  await expect(client.sync()).rejects.toThrow("GitHub rejected the note (503)");
  expect((await client.listNotes()).map((n) => n.text)).toEqual(["not yet synced"]);
  expect((await client.pull()).map((n) => n.text)).toEqual(["not yet synced"]);

  online = true;
  await client.sync();
  expect(await client.listNotes()).toEqual([]);
});
```

- [ ] **Step 2: Write the new failing tests**

Append the rest of these to `notes/github-client.test.ts`:

```ts
test("listNotes fetches the notes directory from GitHub and returns each note's real content", async () => {
  const fetchFn = (async (url: string) => {
    if (url.endsWith("/contents/notes")) {
      return Response.json([{ name: "abc.md", type: "file" }]);
    }
    if (url.endsWith("/contents/notes/abc.md")) {
      return Response.json({ content: btoa("hello from github"), sha: "sha-abc" });
    }
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  const notes = await client.listNotes();
  expect(notes).toEqual([{ id: "abc", text: "hello from github", createdAt: "abc" }]);
});

test("listNotes returns an empty list before any note has ever been synced (notes directory doesn't exist yet)", async () => {
  const fetchFn = (async () => new Response("Not Found", { status: 404 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  expect(await client.listNotes()).toEqual([]);
});

test("listNotes merges remote notes with the still-unsynced local queue", async () => {
  const fetchFn = (async (url: string) => {
    if (url.endsWith("/contents/notes")) return Response.json([{ name: "remote1.md", type: "file" }]);
    if (url.endsWith("/contents/notes/remote1.md")) return Response.json({ content: btoa("synced note"), sha: "sha-1" });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.addNote("still queued");
  const notes = await client.listNotes();
  expect(notes.map((n) => n.text).sort()).toEqual(["still queued", "synced note"].sort());
});

test("updateNote on a synced note sends the cached sha from the last listNotes call", async () => {
  const calls: { url: string; body: string }[] = [];
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") {
      calls.push({ url, body: String(init.body) });
      return Response.json({ content: { sha: "sha-new" } }, { status: 200 });
    }
    if (url.endsWith("/contents/notes")) return Response.json([{ name: "n1.md", type: "file" }]);
    if (url.endsWith("/contents/notes/n1.md")) return Response.json({ content: btoa("v1"), sha: "sha-1" });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.listNotes();
  await client.updateNote("n1", "v2");
  expect(calls.length).toBe(1);
  expect(JSON.parse(calls[0]!.body).sha).toBe("sha-1");
});

test("updateNote on a note still in the local pending queue edits it in place, no network call", async () => {
  const fetchFn = (async () => {
    throw new Error("should not be called");
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  const added = await client.addNote("draft");
  const updated = await client.updateNote(added.id, "revised draft");
  expect(updated.text).toBe("revised draft");
});

test("updateNote on an id GitHub doesn't recognize surfaces a clear error", async () => {
  const fetchFn = (async () => new Response("Not Found", { status: 404 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await expect(client.updateNote("unknown-id", "edit")).rejects.toThrow(/could not find note/);
});

test("updateNote retries once with a fresh sha when GitHub rejects a stale sha (last sync wins)", async () => {
  let currentSha = "sha-v1";
  let putAttempts = 0;
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") {
      putAttempts += 1;
      const sentSha = JSON.parse(String(init.body)).sha;
      if (sentSha !== currentSha) return new Response("Conflict", { status: 409 });
      currentSha = "sha-after-update";
      return Response.json({ content: { sha: currentSha } }, { status: 200 });
    }
    if (url.endsWith("/contents/notes")) return Response.json([{ name: "n1.md", type: "file" }]);
    if (url.endsWith("/contents/notes/n1.md")) return Response.json({ content: btoa("v1"), sha: currentSha });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.listNotes(); // caches sha-v1

  // Simulate another device updating the file after our listNotes call.
  currentSha = "sha-v2";

  const updated = await client.updateNote("n1", "our edit wins");
  expect(updated.text).toBe("our edit wins");
  expect(putAttempts).toBe(2); // first PUT with stale sha-v1 rejected, retry with sha-v2 succeeds
});

test("updateNote round-trips non-ASCII text through GitHub's base64 content encoding", async () => {
  const unicodeText = "emoji check ✅ and accents: café, naïve";
  let sentContent = "";
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") {
      sentContent = JSON.parse(String(init.body)).content;
      return Response.json({ content: { sha: "sha-new" } }, { status: 200 });
    }
    if (url.endsWith("/contents/notes")) return Response.json([{ name: "n1.md", type: "file" }]);
    if (url.endsWith("/contents/notes/n1.md")) return Response.json({ content: btoa("v1"), sha: "sha-1" });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.updateNote("n1", unicodeText);
  const decoded = decodeURIComponent(escape(atob(sentContent)));
  expect(decoded).toBe(unicodeText);
});

test("updateNote clears the stored token on a 401, same as sync", async () => {
  storage.setItem(TOKEN_STORAGE_KEY, "expired");
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") return new Response("Bad credentials", { status: 401 });
    if (url.endsWith("/contents/notes")) return Response.json([{ name: "n1.md", type: "file" }]);
    if (url.endsWith("/contents/notes/n1.md")) return Response.json({ content: btoa("v1"), sha: "sha-1" });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "expired", storage, fetchFn });
  await expect(client.updateNote("n1", "edit")).rejects.toThrow(/Refresh this page to enter a new one/);
  expect(storage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `bun test notes/github-client.test.ts`
Expected: FAIL — the two rewritten tests fail because `listNotes`/`pull` still only read the pending queue; all the new tests fail because `client.updateNote` doesn't exist and `listNotes`/`pull` never call the directory-listing endpoint.

- [ ] **Step 4: Rewrite `github-client.ts`**

Replace the full contents of `notes/github-client.ts` with:

```ts
// notes/github-client.ts
import type { Note, NotesClient } from "./notes-client";

interface PendingNote {
  id: string;
  text: string;
}

interface RemoteNote {
  id: string;
  text: string;
  sha: string;
}

class StaleShaError extends Error {}

const STORAGE_KEY = "notes-capture-pending";
export const TOKEN_STORAGE_KEY = "notes-capture-token";

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

function pendingAsNotes(storage: Storage): Note[] {
  return loadPending(storage).map(
    (note) => ({ id: note.id, text: note.text, createdAt: note.id }) satisfies Note,
  );
}

function mergeNotes(remote: Note[], pending: Note[]): Note[] {
  return [...pending, ...remote].sort((a, b) => b.id.localeCompare(a.id));
}

function timestampId(date: Date): string {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${stamp}-${suffix}`;
}

function toBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

function fromBase64(content: string): string {
  return decodeURIComponent(escape(atob(content.replace(/\n/g, ""))));
}

export function createGithubClient(opts: {
  owner: string;
  repo: string;
  token: string;
  storage: Storage;
  fetchFn?: typeof fetch;
}): NotesClient {
  const fetchFn = opts.fetchFn ?? fetch;
  const shaCache = new Map<string, string>();

  const authHeaders = {
    Authorization: `Bearer ${opts.token}`,
    Accept: "application/vnd.github+json",
  };

  const contentsUrl = (path: string) =>
    `https://api.github.com/repos/${opts.owner}/${opts.repo}/contents/${path}`;

  const putFile = async (id: string, text: string): Promise<void> => {
    const res = await fetchFn(contentsUrl(`notes/${id}.md`), {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        message: `Add note ${id}`,
        content: toBase64(text),
      }),
    });
    if (res.status === 401 || res.status === 403) {
      // Fine-grained tokens always expire; dropping it makes the next page load re-prompt.
      opts.storage.removeItem(TOKEN_STORAGE_KEY);
      throw new Error(
        `GitHub rejected your token (${res.status}) — it may be expired or invalid. Refresh this page to enter a new one.`,
      );
    }
    if (!res.ok) {
      throw new Error(`GitHub rejected the note (${res.status})`);
    }
  };

  const listRemoteNotes = async (): Promise<RemoteNote[]> => {
    const listRes = await fetchFn(contentsUrl("notes"), { headers: authHeaders });
    if (listRes.status === 404) return []; // notes/ doesn't exist yet on a brand new repo
    if (!listRes.ok) throw new Error(`could not list notes from GitHub (${listRes.status})`);
    const entries = (await listRes.json()) as { name: string; type: string }[];
    const files = entries.filter((e) => e.type === "file" && e.name.endsWith(".md"));
    return Promise.all(
      files.map(async (entry) => {
        const id = entry.name.replace(/\.md$/, "");
        const fileRes = await fetchFn(contentsUrl(`notes/${entry.name}`), { headers: authHeaders });
        if (!fileRes.ok) throw new Error(`could not read note ${id} from GitHub (${fileRes.status})`);
        const file = (await fileRes.json()) as { content: string; sha: string };
        return { id, text: fromBase64(file.content), sha: file.sha };
      }),
    );
  };

  const refreshFromRemote = async (): Promise<Note[]> => {
    const remote = await listRemoteNotes();
    remote.forEach((n) => shaCache.set(n.id, n.sha));
    const notes = remote.map(({ id, text }) => ({ id, text, createdAt: id }) satisfies Note);
    return mergeNotes(notes, pendingAsNotes(opts.storage));
  };

  const getFileSha = async (id: string): Promise<string> => {
    const cached = shaCache.get(id);
    if (cached) return cached;
    const res = await fetchFn(contentsUrl(`notes/${id}.md`), { headers: authHeaders });
    if (!res.ok) throw new Error(`could not find note ${id} on GitHub (${res.status})`);
    const file = (await res.json()) as { sha: string };
    shaCache.set(id, file.sha);
    return file.sha;
  };

  const putFileWithSha = async (id: string, text: string, sha: string): Promise<string> => {
    const res = await fetchFn(contentsUrl(`notes/${id}.md`), {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ message: `Update note ${id}`, content: toBase64(text), sha }),
    });
    if (res.status === 401 || res.status === 403) {
      opts.storage.removeItem(TOKEN_STORAGE_KEY);
      throw new Error(
        `GitHub rejected your token (${res.status}) — it may be expired or invalid. Refresh this page to enter a new one.`,
      );
    }
    if (res.status === 409 || res.status === 422) {
      throw new StaleShaError();
    }
    if (!res.ok) {
      throw new Error(`GitHub rejected the update (${res.status})`);
    }
    const body = (await res.json()) as { content: { sha: string } };
    return body.content.sha;
  };

  return {
    async listNotes() {
      return refreshFromRemote();
    },
    async addNote(text: string) {
      const pending = loadPending(opts.storage);
      const id = timestampId(new Date());
      pending.push({ id, text });
      savePending(opts.storage, pending);
      return { id, text, createdAt: id };
    },
    async updateNote(id: string, text: string) {
      const pending = loadPending(opts.storage);
      const pendingIndex = pending.findIndex((n) => n.id === id);
      if (pendingIndex !== -1) {
        pending[pendingIndex] = { id, text };
        savePending(opts.storage, pending);
        return { id, text, createdAt: id };
      }

      const sha = await getFileSha(id);
      try {
        const newSha = await putFileWithSha(id, text, sha);
        shaCache.set(id, newSha);
      } catch (err) {
        if (!(err instanceof StaleShaError)) throw err;
        // last-sync-wins: refetch the current sha and overwrite with this edit anyway
        shaCache.delete(id);
        const freshSha = await getFileSha(id);
        const newSha = await putFileWithSha(id, text, freshSha);
        shaCache.set(id, newSha);
      }
      return { id, text, createdAt: id };
    },
    async checkForUpdates() {
      return false;
    },
    async pull() {
      return refreshFromRemote();
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

- [ ] **Step 5: Run the tests to verify they pass**

Run: `bun test notes/github-client.test.ts`
Expected: PASS — all tests, including the ones written before this feature.

- [ ] **Step 6: Run the full test suite and the type checker**

Run: `bun test && tsc --noEmit`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add notes/github-client.ts notes/github-client.test.ts
git commit -m "feat(notes): read real note history from GitHub and add updateNote to the phone adapter"
```

---

### Task 4: Shared UI — inline edit mode (`NotesView.tsx` + `notes.css`)

**Files:**
- Modify: `notes/NotesView.tsx`
- Modify: `notes/notes.css`

**Interfaces:**
- Consumes: `NotesClient.updateNote(id, text): Promise<Note>` from Tasks 1–3, already implemented by both adapters.
- Produces: nothing new for other tasks to consume — this is the top of the stack. Both desktop and phone gain editing automatically since they share this one component.

No new `bun test` file — per the spec's Testing section, `NotesView.tsx` stays manually verified (no component-test infra in this repo, same as the original Notes feature). This task's manual verification step is required before the task is considered done.

- [ ] **Step 1: Add edit state and handlers to `NotesView.tsx`**

Change the state declarations at the top of the component from:

```tsx
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [hasUpdates, setHasUpdates] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
```

to:

```tsx
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [hasUpdates, setHasUpdates] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
```

Add these handlers right after `handlePull` (after the closing `};` that currently ends the component's handler definitions, before the `return`):

```tsx
  const startEdit = (note: Note) => {
    if (busy) return;
    setEditingId(note.id);
    setEditDraft(note.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const saveEdit = async () => {
    const text = editDraft.trim();
    if (!text || !editingId) return;
    setBusy(true);
    try {
      await client.updateNote(editingId, text);
      setEditingId(null);
      setEditDraft("");
      await load();
      await client.sync();
      setStatus(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      await load();
      setBusy(false);
    }
  };
```

- [ ] **Step 2: Replace the note list rendering to branch on edit mode**

Change:

```tsx
      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note.id} className="notes-item">
            <span className="notes-item-text">{note.text}</span>
            <span className="notes-item-date">{note.createdAt}</span>
          </li>
        ))}
        {notes.length === 0 && <li className="notes-empty">No notes yet.</li>}
      </ul>
```

to:

```tsx
      <ul className="notes-list">
        {notes.map((note) =>
          note.id === editingId ? (
            <li key={note.id} className="notes-item notes-item-editing">
              <textarea
                className="notes-edit-textarea"
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={3}
              />
              <div className="notes-edit-actions">
                <button onClick={saveEdit} disabled={busy || !editDraft.trim()}>
                  Save & Sync
                </button>
                <button onClick={cancelEdit} disabled={busy}>
                  Cancel
                </button>
              </div>
            </li>
          ) : (
            <li key={note.id} className="notes-item" onClick={() => startEdit(note)}>
              <span className="notes-item-text">{note.text}</span>
              <span className="notes-item-date">{note.createdAt}</span>
            </li>
          ),
        )}
        {notes.length === 0 && <li className="notes-empty">No notes yet.</li>}
      </ul>
```

- [ ] **Step 3: Add edit-mode styling to `notes.css`**

Append to the end of `notes/notes.css`:

```css
.notes-item {
  cursor: pointer;
}

.notes-item-editing {
  cursor: default;
}

.notes-edit-textarea {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font: inherit;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
}

.notes-edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.notes-edit-actions button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
}

.notes-edit-actions button:disabled {
  opacity: 0.5;
  cursor: default;
}
```

- [ ] **Step 4: Run the full test suite and the type checker**

Run: `bun test && tsc --noEmit`
Expected: PASS — no test file covers `NotesView.tsx` directly, but this confirms the rest of the suite (all four earlier tasks) is still green and nothing else has a type error.

- [ ] **Step 5: Commit**

```bash
git add notes/NotesView.tsx notes/notes.css
git commit -m "feat(notes): add inline click-to-edit to the shared notes UI"
```

- [ ] **Step 6: Manual browser verification (required before this task is done)**

Per the user's standing instruction, UI changes are verified with the `claude-in-chrome` browser tool, not just by reading the diff — this step is not optional and is not satisfied by `bun test` passing.

1. Start the dev server (`bun run dev`, with `NOTES_DATA_REMOTE` set to the live `notes-data` remote — see the project's `project_notes_feature_live_infra` memory for the exact value).
2. In the browser tool, navigate to the desktop app's Notes tab. Click an existing note, confirm it turns into an editable textarea seeded with its current text, edit it, click "Save & Sync", and confirm the list reflects the edit after reload.
3. Click a note, then click "Cancel" without saving — confirm the note's original text is unchanged in the list.
4. Navigate to the live phone capture page. Confirm it now shows full note history (not just a pending queue), click a synced note, edit it, save, and confirm the change round-trips (reload the page and confirm the edit persisted).
5. Report any console errors surfaced via `read_console_messages` during the above.

If the browser extension is disconnected or the tool is blocked, say so explicitly and report this step as unverified rather than silently skipping it.
