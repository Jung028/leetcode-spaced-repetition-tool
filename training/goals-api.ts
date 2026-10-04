import type { Database } from "bun:sqlite";
import { createGoal, deleteGoal, listGoals, toggleGoal, updateGoal } from "./goals-db";
import { localToday } from "../shared/scheduling";
import { GOAL_CATEGORIES, isGoalCategory, type GoalCategory } from "./goal-text";

const json = (data: unknown, status = 200) => Response.json(data, { status });

function parseGoalBody(body: unknown): { text: string; category: GoalCategory | undefined } | { error: string } {
  if (!body || typeof body !== "object") return { error: "JSON body required" };
  const { text, category } = body as { text?: unknown; category?: unknown };
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return { error: "text is required" };
  if (category === undefined || category === null) return { text: trimmed, category: undefined };
  if (!isGoalCategory(category)) return { error: `category must be one of: ${GOAL_CATEGORIES.join(", ")}` };
  return { text: trimmed, category };
}

export function goalsApiRoutes(db: Database) {
  return {
    "/api/goals": {
      GET: () => json(listGoals(db)),
      POST: async (req: Request) => {
        const parsed = parseGoalBody(await req.json().catch(() => null));
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        return json(createGoal(db, parsed.text, localToday(), parsed.category), 201);
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
        const parsed = parseGoalBody(await req.json().catch(() => null));
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const updated = updateGoal(db, Number(req.params.id), parsed.text, parsed.category);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
      DELETE: (req: { params: { id: string } }) => {
        const deleted = deleteGoal(db, Number(req.params.id));
        return deleted ? json({ ok: true }) : json({ error: "not found" }, 404);
      },
    },
  };
}
