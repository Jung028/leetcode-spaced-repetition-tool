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
