// flashcards-page/flashcards-github-client.test.ts
import { test, expect, beforeEach } from "bun:test";
import { createFlashcardsGithubClient } from "./flashcards-github-client";
import { TOKEN_STORAGE_KEY, toBase64 } from "../notes/github-client";

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

const SAMPLE = `# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`;

test("saveDeck PUTs to the correct nested contents URL with the auth header", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") { calls.push({ url, init: init! }); return Response.json({ content: { sha: "s1" } }, { status: 201 }); }
    return new Response("Not Found", { status: 404 }); // no existing file — fresh create
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.saveDeck(SAMPLE);
  expect(calls.length).toBe(1);
  expect(calls[0]!.url).toContain("api.github.com/repos/me/notes-data/contents/flashcards/info5990/exam-2.md");
  expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe("Bearer t");
});

test("saveDeck with malformed markdown throws before any network call", async () => {
  const fetchFn = (async () => { throw new Error("should not be called"); }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await expect(client.saveDeck("not a deck")).rejects.toThrow(/Subject .* Exam/);
});

test("listDecks lists subject directories, then each subject's deck files, decoding and parsing each", async () => {
  const fetchFn = (async (url: string) => {
    if (url.endsWith("/contents/flashcards")) return Response.json([{ name: "info5990", type: "dir" }]);
    if (url.endsWith("/contents/flashcards/info5990")) return Response.json([{ name: "exam-2.md", type: "file" }]);
    if (url.endsWith("/contents/flashcards/info5990/exam-2.md")) return Response.json({ content: toBase64(SAMPLE), sha: "sha-1" });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  const decks = await client.listDecks();
  expect(decks).toEqual([expect.objectContaining({ subject: "INFO5990", exam: "2" })]);
});

test("listDecks returns an empty array when the flashcards directory doesn't exist yet", async () => {
  const fetchFn = (async () => new Response("Not Found", { status: 404 })) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  expect(await client.listDecks()).toEqual([]);
});

test("saveDeck on a 401 clears the stored token and says so", async () => {
  storage.setItem(TOKEN_STORAGE_KEY, "expired");
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") return new Response("Bad credentials", { status: 401 });
    return new Response("Not Found", { status: 404 });
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "expired", storage, fetchFn });
  await expect(client.saveDeck(SAMPLE)).rejects.toThrow(/Refresh this page to enter a new one/);
  expect(storage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
});

test("saveDeck retries once with a fresh sha when GitHub rejects a stale one, then succeeds", async () => {
  let currentSha = "sha-v1";
  let putAttempts = 0;
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") {
      putAttempts += 1;
      const sentSha = JSON.parse(String(init.body)).sha;
      if (sentSha !== currentSha && sentSha !== undefined) return new Response("Conflict", { status: 409 });
      currentSha = "sha-after-update";
      return Response.json({ content: { sha: currentSha } }, { status: 200 });
    }
    if (url.endsWith("/exam-2.md")) return Response.json({ content: toBase64(SAMPLE), sha: currentSha });
    return new Response("Not Found", { status: 404 });
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.saveDeck(SAMPLE); // caches sha-v1
  currentSha = "sha-v2"; // simulate the phone updating it first
  await client.saveDeck(SAMPLE.replace("MAC", "nonce"));
  expect(putAttempts).toBeGreaterThanOrEqual(2);
});

test("listDecks' GET requests pass cache: no-store so a stale cached listing is never served", async () => {
  const getInits: (RequestInit | undefined)[] = [];
  const fetchFn = (async (url: string, init?: RequestInit) => {
    getInits.push(init);
    if (url.endsWith("/contents/flashcards")) return Response.json([{ name: "info5990", type: "dir" }]);
    if (url.endsWith("/contents/flashcards/info5990")) return Response.json([{ name: "exam-2.md", type: "file" }]);
    if (url.endsWith("/contents/flashcards/info5990/exam-2.md")) return Response.json({ content: toBase64(SAMPLE), sha: "sha-1" });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.listDecks();
  expect(getInits.length).toBeGreaterThan(0);
  for (const init of getInits) {
    expect(init?.cache).toBe("no-store");
  }
});

test("saveDeck's sha lookup GET passes cache: no-store, but the PUT itself does not", async () => {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const fetchFn = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (init?.method === "PUT") return Response.json({ content: { sha: "s1" } }, { status: 201 });
    return new Response("Not Found", { status: 404 });
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.saveDeck(SAMPLE);
  const getCalls = calls.filter((c) => c.init?.method !== "PUT");
  const putCalls = calls.filter((c) => c.init?.method === "PUT");
  expect(getCalls.length).toBeGreaterThan(0);
  for (const call of getCalls) {
    expect(call.init?.cache).toBe("no-store");
  }
  expect(putCalls.length).toBe(1);
  expect(putCalls[0]!.init?.cache).toBeUndefined();
});

test("saveDeck surfaces a clear error when the retry also hits a stale sha", async () => {
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") return new Response("Conflict", { status: 409 });
    return new Response("Not Found", { status: 404 });
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await expect(client.saveDeck(SAMPLE)).rejects.toThrow(/\(409\)/);
});
