import type { Database } from "bun:sqlite";
import { createGoal, deleteGoal, listGoals, updateGoal, type GoalInput } from "./goals-db";
import { localToday } from "../shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseGoalBody(body: unknown): { input: GoalInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "JSON body required" };
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  const currentValue = typeof b.currentValue === "string" ? b.currentValue.trim() : "";
  const targetValue = typeof b.targetValue === "string" ? b.targetValue.trim() : "";
  if (!title || !currentValue || !targetValue) {
    return { error: "title, currentValue and targetValue are required" };
  }

  const notes = typeof b.notes === "string" && b.notes.trim() ? b.notes.trim() : null;

  let targetDate: string | null = null;
  if (b.targetDate !== undefined && b.targetDate !== null && b.targetDate !== "") {
    if (typeof b.targetDate !== "string" || !DATE_RE.test(b.targetDate)) {
      return { error: "targetDate must be YYYY-MM-DD" };
    }
    targetDate = b.targetDate;
  }

  let raceId: number | null = null;
  if (b.raceId !== undefined && b.raceId !== null && b.raceId !== "") {
    if (typeof b.raceId !== "number" || !Number.isInteger(b.raceId)) {
      return { error: "raceId must be an integer" };
    }
    raceId = b.raceId;
  }

  return { input: { title, currentValue, targetValue, targetDate, raceId, notes } };
}

export function goalsApiRoutes(db: Database) {
  return {
    "/api/goals": {
      GET: () => json(listGoals(db)),
      POST: async (req: Request) => {
        const body = await req.json().catch(() => null);
        const parsed = parseGoalBody(body);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        return json(createGoal(db, parsed.input, localToday()), 201);
      },
    },
    "/api/goals/:id": {
      PUT: async (req: Request & { params: { id: string } }) => {
        const body = await req.json().catch(() => null);
        const parsed = parseGoalBody(body);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const updated = updateGoal(db, Number(req.params.id), parsed.input);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
      DELETE: (req: { params: { id: string } }) => {
        const deleted = deleteGoal(db, Number(req.params.id));
        return deleted ? json({ ok: true }) : json({ error: "not found" }, 404);
      },
    },
  };
}
