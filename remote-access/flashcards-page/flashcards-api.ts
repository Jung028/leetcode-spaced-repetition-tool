// flashcards-page/flashcards-api.ts
import { pullChanges, pushLocalChanges } from "../notes/notes-repo";
import { readDecks, writeDeck } from "./flashcards-repo";
import { FlashcardParseError } from "./flashcard-parser";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function flashcardsApiRoutes(clonePath: string) {
  return {
    "/api/flashcards": {
      GET: async () => {
        await pullChanges(clonePath).catch(() => {});
        try {
          return json(await readDecks(clonePath));
        } catch (err) {
          return json({ error: `flashcards repo not available: ${(err as Error).message}` }, 503);
        }
      },
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { markdown?: unknown } | null;
        const markdown = typeof body?.markdown === "string" ? body.markdown.trim() : "";
        if (!markdown) return json({ error: "markdown is required" }, 400);
        await pullChanges(clonePath).catch(() => {});
        try {
          const deck = await writeDeck(clonePath, markdown);
          await pushLocalChanges(clonePath);
          return json(deck);
        } catch (err) {
          if (err instanceof FlashcardParseError) {
            return json({ error: err.message }, 400);
          }
          return json({ error: `could not save flashcard deck: ${(err as Error).message}` }, 503);
        }
      },
    },
  };
}
