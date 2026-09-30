// notes/local-client.ts
import type { Note, NotesClient } from "./notes-client";

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    if (body?.error) return body.error;
  } catch {
    // response wasn't JSON — fall through to the generic fallback
  }
  return fallback;
}

export function createLocalClient(fetchFn: FetchLike = fetch): NotesClient {
  return {
    async listNotes() {
      const res = await fetchFn("/api/notes");
      if (!res.ok) throw new Error(await readErrorMessage(res, `could not load notes (${res.status})`));
      return (await res.json()) as Note[];
    },
    async addNote(text: string) {
      const res = await fetchFn("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, `could not save note (${res.status})`));
      return (await res.json()) as Note;
    },
    async checkForUpdates() {
      const res = await fetchFn("/api/notes/sync-status");
      if (!res.ok) throw new Error(await readErrorMessage(res, `could not check for updates (${res.status})`));
      const body = (await res.json()) as { hasUpdates: boolean };
      return body.hasUpdates;
    },
    async pull() {
      const res = await fetchFn("/api/notes/pull", { method: "POST" });
      if (!res.ok) throw new Error(await readErrorMessage(res, `pull failed (${res.status})`));
      return (await res.json()) as Note[];
    },
    async sync() {
      const res = await fetchFn("/api/notes/push", { method: "POST" });
      if (!res.ok) throw new Error(await readErrorMessage(res, `sync failed (${res.status})`));
    },
  };
}
