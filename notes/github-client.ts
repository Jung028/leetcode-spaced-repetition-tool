// notes/github-client.ts
import type { Note, NotesClient } from "./notes-client";

interface PendingNote {
  id: string;
  text: string;
}

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

// The phone never shows remote history — only its own not-yet-synced queue.
function pendingAsNotes(storage: Storage): Note[] {
  return loadPending(storage).map(
    (note) => ({ id: note.id, text: note.text, createdAt: note.id }) satisfies Note,
  );
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

  return {
    async listNotes() {
      return pendingAsNotes(opts.storage);
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
      // Pull shows the same list as listNotes, so tapping it never hides still-queued notes.
      return pendingAsNotes(opts.storage);
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
