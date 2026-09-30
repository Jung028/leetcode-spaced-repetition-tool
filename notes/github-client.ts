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

function throwIfAuthFailure(res: Response, storage: Storage): void {
  if (res.status !== 401 && res.status !== 403) return;
  // Fine-grained tokens always expire; dropping it makes the next page load re-prompt.
  storage.removeItem(TOKEN_STORAGE_KEY);
  throw new Error(
    `GitHub rejected your token (${res.status}) — it may be expired or invalid. Refresh this page to enter a new one.`,
  );
}

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
    throwIfAuthFailure(res, opts.storage);
    if (!res.ok) {
      throw new Error(`GitHub rejected the note (${res.status})`);
    }
  };

  const listRemoteNotes = async (): Promise<RemoteNote[]> => {
    const listRes = await fetchFn(contentsUrl("notes"), { headers: authHeaders });
    if (listRes.status === 404) return []; // notes/ doesn't exist yet on a brand new repo
    throwIfAuthFailure(listRes, opts.storage);
    if (!listRes.ok) throw new Error(`could not list notes from GitHub (${listRes.status})`);
    const entries = (await listRes.json()) as { name: string; type: string }[];
    const files = entries.filter((e) => e.type === "file" && e.name.endsWith(".md"));
    return Promise.all(
      files.map(async (entry) => {
        const id = entry.name.replace(/\.md$/, "");
        const fileRes = await fetchFn(contentsUrl(`notes/${entry.name}`), { headers: authHeaders });
        throwIfAuthFailure(fileRes, opts.storage);
        if (!fileRes.ok) throw new Error(`could not read note ${id} from GitHub (${fileRes.status})`);
        const file = (await fileRes.json()) as { content: string; sha: string };
        return { id, text: fromBase64(file.content), sha: file.sha };
      }),
    );
  };

  const refreshFromRemote = async (): Promise<Note[]> => {
    let remote: RemoteNote[];
    try {
      remote = await listRemoteNotes();
    } catch {
      // Offline, rate-limited, or an expired token: fall back to the local queue only,
      // the same way this file's checkForUpdates() already swallows remote failures —
      // a phone showing its own unsynced notes beats a phone showing a network error.
      return pendingAsNotes(opts.storage);
    }
    remote.forEach((n) => shaCache.set(n.id, n.sha));
    const notes = remote.map(({ id, text }) => ({ id, text, createdAt: id }) satisfies Note);
    return mergeNotes(notes, pendingAsNotes(opts.storage));
  };

  const getFileSha = async (id: string): Promise<string> => {
    const cached = shaCache.get(id);
    if (cached) return cached;
    const res = await fetchFn(contentsUrl(`notes/${id}.md`), { headers: authHeaders });
    throwIfAuthFailure(res, opts.storage);
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
    throwIfAuthFailure(res, opts.storage);
    if (res.status === 409 || res.status === 422) {
      throw new StaleShaError(
        `GitHub rejected the update (${res.status}) — the note changed again while saving.`,
      );
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
