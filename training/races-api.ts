import type { Database } from "bun:sqlite";
import { createRace, deleteRace, listRaces, updateRace, type RaceInput } from "./races-db";
import { localToday } from "../shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseRaceBody(body: unknown): { input: RaceInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "JSON body required" };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { error: "name is required" };

  const discipline = typeof b.discipline === "string" && b.discipline.trim() ? b.discipline.trim() : null;
  const location = typeof b.location === "string" && b.location.trim() ? b.location.trim() : null;
  const notes = typeof b.notes === "string" && b.notes.trim() ? b.notes.trim() : null;

  let date: string | null = null;
  if (b.date !== undefined && b.date !== null && b.date !== "") {
    if (typeof b.date !== "string" || !DATE_RE.test(b.date)) return { error: "date must be YYYY-MM-DD" };
    date = b.date;
  }

  let approxYear: number | null = null;
  if (b.approxYear !== undefined && b.approxYear !== null && b.approxYear !== "") {
    if (typeof b.approxYear !== "number" || !Number.isInteger(b.approxYear)) {
      return { error: "approxYear must be an integer" };
    }
    approxYear = b.approxYear;
  }

  return { input: { name, discipline, location, date, approxYear, notes } };
}

export function racesApiRoutes(db: Database) {
  return {
    "/api/races": {
      GET: () => json(listRaces(db)),
      POST: async (req: Request) => {
        const body = await req.json().catch(() => null);
        const parsed = parseRaceBody(body);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        return json(createRace(db, parsed.input, localToday()), 201);
      },
    },
    "/api/races/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const body = await req.json().catch(() => null);
        const parsed = parseRaceBody(body);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const updated = updateRace(db, Number(req.params.id), parsed.input);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
      DELETE: (req: { params: { id: string } }) => {
        const deleted = deleteRace(db, Number(req.params.id));
        return deleted ? json({ ok: true }) : json({ error: "not found" }, 404);
      },
    },
  };
}
