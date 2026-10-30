// flashcards-page/flashcards-local-client.ts
import { readErrorMessage, type FetchLike } from "../notes/local-client";
import type { FlashcardDeck } from "./flashcard-parser";
import type { FlashcardsClient } from "./flashcards-client";

export function createFlashcardsLocalClient(fetchFn: FetchLike = fetch): FlashcardsClient {
  return {
    async listDecks() {
      const res = await fetchFn("/api/flashcards");
      if (!res.ok) throw new Error(await readErrorMessage(res, `could not load flashcards (${res.status})`));
      return (await res.json()) as FlashcardDeck[];
    },
    async saveDeck(markdown: string) {
      const res = await fetchFn("/api/flashcards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res, `could not save flashcard deck (${res.status})`));
      return (await res.json()) as FlashcardDeck;
    },
  };
}
