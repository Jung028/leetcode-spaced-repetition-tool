// notes/notes-api.ts
import {
  readNotes,
  writeNote,
  updateNote,
  fetchRemote,
  hasUnpulledChanges,
  pullChanges,
  pushLocalChanges,
} from "./notes-repo";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function notesApiRoutes(clonePath: string) {
  return {
    "/api/notes": {
      GET: async () => {
        try {
          return json(await readNotes(clonePath));
        } catch (err) {
          return json({ error: `notes repo not available: ${(err as Error).message}` }, 503);
        }
      },
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
        const text = typeof body?.text === "string" ? body.text.trim() : "";
        if (!text) return json({ error: "text is required" }, 400);
        try {
          return json(await writeNote(clonePath, text), 201);
        } catch (err) {
          return json({ error: `could not save note: ${(err as Error).message}` }, 503);
        }
      },
    },
    "/api/notes/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
        const text = typeof body?.text === "string" ? body.text.trim() : "";
        if (!text) return json({ error: "text is required" }, 400);
        try {
          return json(await updateNote(clonePath, req.params.id, text));
        } catch (err) {
          const message = (err as Error).message;
          if (message.includes("note not found")) return json({ error: message }, 404);
          return json({ error: `could not update note: ${message}` }, 503);
        }
      },
    },
    "/api/notes/sync-status": {
      GET: async () => {
        try {
          await fetchRemote(clonePath);
          return json({ hasUpdates: await hasUnpulledChanges(clonePath) });
        } catch (err) {
          return json({ error: `could not check for updates: ${(err as Error).message}` }, 503);
        }
      },
    },
    "/api/notes/pull": {
      POST: async () => {
        try {
          await pullChanges(clonePath);
          return json(await readNotes(clonePath));
        } catch (err) {
          return json({ error: `pull failed: ${(err as Error).message}` }, 503);
        }
      },
    },
    "/api/notes/push": {
      POST: async () => {
        try {
          await pushLocalChanges(clonePath);
          return json({ ok: true });
        } catch (err) {
          return json({ error: `push failed: ${(err as Error).message}` }, 503);
        }
      },
    },
  };
}
