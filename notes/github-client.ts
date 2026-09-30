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
