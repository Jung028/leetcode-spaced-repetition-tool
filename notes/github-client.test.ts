// notes/github-client.test.ts
import { test, expect, beforeEach } from "bun:test";
import { createGithubClient, TOKEN_STORAGE_KEY } from "./github-client";

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

test("checkForUpdates is a no-op; listNotes and pull merge remote notes with the empty local queue", async () => {
  const fetchFn = (async () => new Response("[]", { status: 200 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  expect(await client.listNotes()).toEqual([]);
  expect(await client.checkForUpdates()).toBe(false);
  expect(await client.pull()).toEqual([]);
});

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

test("a 401 clears the stored token so the next page load re-prompts, and says so", async () => {
  storage.setItem(TOKEN_STORAGE_KEY, "expired");
  const fetchFn = (async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    if (method === "GET") return new Response("[]", { status: 200 }); // nothing synced remotely yet
    return new Response("Bad credentials", { status: 401 });
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "expired", storage, fetchFn });
  await client.addNote("kept for retry");
  await expect(client.sync()).rejects.toThrow(/Refresh this page to enter a new one/);
  expect(storage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  expect((await client.listNotes()).map((n) => n.text)).toEqual(["kept for retry"]);
});

test("a 403 also clears the stored token", async () => {
  storage.setItem(TOKEN_STORAGE_KEY, "no-access");
  const fetchFn = (async () => new Response("Forbidden", { status: 403 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "no-access", storage, fetchFn });
  await client.addNote("kept for retry");
  await expect(client.sync()).rejects.toThrow(/\(403\)/);
  expect(storage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
});

test("a non-auth failure keeps the stored token", async () => {
  storage.setItem(TOKEN_STORAGE_KEY, "still-good");
  const fetchFn = (async () => new Response("oops", { status: 500 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "still-good", storage, fetchFn });
  await client.addNote("kept for retry");
  await expect(client.sync()).rejects.toThrow();
  expect(storage.getItem(TOKEN_STORAGE_KEY)).toBe("still-good");
});

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

test("listNotes falls back to the pending queue when the remote fetch fails", async () => {
  const fetchFn = (async () => new Response("Server Error", { status: 500 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  const added = await client.addNote("queued while remote is down");
  const notes = await client.listNotes();
  expect(notes).toEqual([{ id: added.id, text: "queued while remote is down", createdAt: added.id }]);
});

test("a 401 on the GET path used to resolve a note's sha clears the stored token", async () => {
  storage.setItem(TOKEN_STORAGE_KEY, "expired");
  const fetchFn = (async () => new Response("Bad credentials", { status: 401 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "expired", storage, fetchFn });
  await expect(client.updateNote("some-id", "edit")).rejects.toThrow(/Refresh this page to enter a new one/);
  expect(storage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
});

test("updateNote surfaces a real error message when the retry also hits a stale sha", async () => {
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") return new Response("Conflict", { status: 409 });
    if (url.endsWith("/contents/notes")) return Response.json([{ name: "n1.md", type: "file" }]);
    if (url.endsWith("/contents/notes/n1.md")) return Response.json({ content: btoa("v1"), sha: "sha-1" });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await expect(client.updateNote("n1", "edit")).rejects.toThrow(/note changed again while saving/);
});
