import type { Database } from "bun:sqlite";
import { createGoal, deleteGoal, listGoals, toggleGoal, updateGoal } from "./goals-db";
import { localToday } from "../shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

function parseText(body: unknown): { text: string } | { error: string } {
  if (!body || typeof body !== "object") return { error: "JSON body required" };
  const text = typeof (body as { text?: unknown }).text === "string" ? (body as { text: string }).text.trim() : "";
  if (!text) return { error: "text is required" };
  return { text };
}

export function goalsApiRoutes(db: Database) {
  return {
    "/api/goals": {
      GET: () => json(listGoals(db)),
      POST: async (req: Request) => {
        const parsed = parseText(await req.json().catch(() => null));
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        return json(createGoal(db, parsed.text, localToday()), 201);
      },
    },
    "/api/goals/:id/toggle": {
      POST: (req: { params: { id: string } }) => {
        const updated = toggleGoal(db, Number(req.params.id), localToday());
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
    "/api/goals/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const parsed = parseText(await req.json().catch(() => null));
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const updated = updateGoal(db, Number(req.params.id), parsed.text);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
      DELETE: (req: { params: { id: string } }) => {
        const deleted = deleteGoal(db, Number(req.params.id));
        return deleted ? json({ ok: true }) : json({ error: "not found" }, 404);
      },
    },
  };
}
