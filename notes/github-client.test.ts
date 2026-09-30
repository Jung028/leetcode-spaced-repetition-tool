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

test("checkForUpdates and pull are safe no-ops; listNotes returns nothing when the queue is empty", async () => {
  const fetchFn = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
  const client = createGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  expect(await client.listNotes()).toEqual([]);
  expect(await client.checkForUpdates()).toBe(false);
  expect(await client.pull()).toEqual([]);
});

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

test("a 401 clears the stored token so the next page load re-prompts, and says so", async () => {
  storage.setItem(TOKEN_STORAGE_KEY, "expired");
  const fetchFn = (async () => new Response("Bad credentials", { status: 401 })) as unknown as typeof fetch;
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
