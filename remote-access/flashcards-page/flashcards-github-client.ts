// flashcards-page/flashcards-github-client.ts
import { throwIfAuthFailure, toBase64, fromBase64 } from "../notes/github-client";
import { parseFlashcardDeck, type FlashcardDeck } from "./flashcard-parser";
import type { FlashcardsClient } from "./flashcards-client";

interface GithubEntry {
  name: string;
  type: string;
}

function deckKey(deck: FlashcardDeck): string {
  return `${deck.subjectSlug}/${deck.examSlug}`;
}

function deckPath(deck: FlashcardDeck): string {
  return `flashcards/${deck.subjectSlug}/exam-${deck.examSlug}.md`;
}

export function createFlashcardsGithubClient(opts: {
  owner: string;
  repo: string;
  token: string;
  storage: Storage;
  fetchFn?: typeof fetch;
}): FlashcardsClient {
  const fetchFn = opts.fetchFn ?? fetch;
  const shaCache = new Map<string, string>();

  const authHeaders = {
    Authorization: `Bearer ${opts.token}`,
    Accept: "application/vnd.github+json",
  };

  const contentsUrl = (path: string) =>
    `https://api.github.com/repos/${opts.owner}/${opts.repo}/contents/${path}`;

  const fetchShaFromRemote = async (path: string): Promise<string | undefined> => {
    const res = await fetchFn(contentsUrl(path), { headers: authHeaders, cache: "no-store" });
    throwIfAuthFailure(res, opts.storage);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`could not read deck from GitHub (${res.status})`);
    const file = (await res.json()) as { sha: string };
    return file.sha;
  };

  const getCachedOrRemoteSha = async (key: string, path: string): Promise<string | undefined> => {
    const cached = shaCache.get(key);
    if (cached) return cached;
    const sha = await fetchShaFromRemote(path);
    if (sha) shaCache.set(key, sha);
    return sha;
  };

  const putDeck = async (path: string, markdown: string, sha: string | undefined): Promise<Response> => {
    const res = await fetchFn(contentsUrl(path), {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        message: `Save deck ${path}`,
        content: toBase64(markdown),
        ...(sha ? { sha } : {}),
      }),
    });
    throwIfAuthFailure(res, opts.storage);
    return res;
  };

  const listSubjectDirs = async (): Promise<GithubEntry[]> => {
    const res = await fetchFn(contentsUrl("flashcards"), { headers: authHeaders, cache: "no-store" });
    if (res.status === 404) return [];
    throwIfAuthFailure(res, opts.storage);
    if (!res.ok) throw new Error(`could not list flashcard subjects from GitHub (${res.status})`);
    const entries = (await res.json()) as GithubEntry[];
    return entries.filter((e) => e.type === "dir");
  };

  const listDeckFiles = async (subjectSlug: string): Promise<GithubEntry[]> => {
    const res = await fetchFn(contentsUrl(`flashcards/${subjectSlug}`), { headers: authHeaders, cache: "no-store" });
    if (res.status === 404) return [];
    throwIfAuthFailure(res, opts.storage);
    if (!res.ok) throw new Error(`could not list decks for ${subjectSlug} from GitHub (${res.status})`);
    const entries = (await res.json()) as GithubEntry[];
    return entries.filter((e) => e.type === "file" && e.name.endsWith(".md"));
  };

  const readDeck = async (path: string): Promise<{ deck: FlashcardDeck; sha: string }> => {
    const res = await fetchFn(contentsUrl(path), { headers: authHeaders, cache: "no-store" });
    throwIfAuthFailure(res, opts.storage);
    if (!res.ok) throw new Error(`could not read deck ${path} from GitHub (${res.status})`);
    const file = (await res.json()) as { content: string; sha: string };
    const deck = parseFlashcardDeck(fromBase64(file.content));
    return { deck, sha: file.sha };
  };

  return {
    async listDecks() {
      const subjectDirs = await listSubjectDirs();
      const decks: FlashcardDeck[] = [];
      for (const subjectDir of subjectDirs) {
        const files = await listDeckFiles(subjectDir.name);
        for (const file of files) {
          const { deck, sha } = await readDeck(`flashcards/${subjectDir.name}/${file.name}`);
          shaCache.set(deckKey(deck), sha);
          decks.push(deck);
        }
      }
      return decks;
    },
    async saveDeck(markdown: string) {
      const deck = parseFlashcardDeck(markdown);
      const key = deckKey(deck);
      const path = deckPath(deck);

      const sha = await getCachedOrRemoteSha(key, path);
      let res = await putDeck(path, markdown, sha);

      if (res.status === 409 || res.status === 422) {
        shaCache.delete(key);
        const freshSha = await fetchShaFromRemote(path);
        res = await putDeck(path, markdown, freshSha);
      }

      if (!res.ok) {
        throw new Error(`GitHub rejected the deck (${res.status})`);
      }

      const body = (await res.json()) as { content: { sha: string } };
      shaCache.set(key, body.content.sha);
      return deck;
    },
  };
}
