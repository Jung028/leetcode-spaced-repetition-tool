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
