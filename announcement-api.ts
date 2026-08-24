import type { Database } from "bun:sqlite";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  toggleAnnouncement,
  updateAnnouncement,
} from "./announcement-db";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function announcementApiRoutes(db: Database) {
  return {
    "/api/announcements": {
      GET: () => json(listAnnouncements(db)),
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { message?: unknown } | null;
        const message = typeof body?.message === "string" ? body.message.trim() : "";
        if (!message) return json({ error: "message is required" }, 400);
        return json(createAnnouncement(db, message, localToday()), 201);
      },
    },
    "/api/announcements/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const body = (await req.json().catch(() => null)) as { message?: unknown } | null;
        const message = typeof body?.message === "string" ? body.message.trim() : "";
        if (!message) return json({ error: "message is required" }, 400);
        const updated = updateAnnouncement(db, Number(req.params.id), message, localToday());
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
      DELETE: (req: { params: { id: string } }) => {
        const deleted = deleteAnnouncement(db, Number(req.params.id));
        return deleted ? json({ ok: true }) : json({ error: "not found" }, 404);
      },
    },
    "/api/announcements/:id/toggle": {
      POST: (req: { params: { id: string } }) => {
        const updated = toggleAnnouncement(db, Number(req.params.id), localToday());
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
  };
}
