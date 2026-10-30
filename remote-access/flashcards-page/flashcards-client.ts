// flashcards-page/flashcards-client.ts
import type { FlashcardDeck } from "./flashcard-parser";

export interface FlashcardsClient {
  listDecks(): Promise<FlashcardDeck[]>;
  saveDeck(markdown: string): Promise<FlashcardDeck>;
}
