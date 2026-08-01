import type { Database } from "bun:sqlite";
import { createProject, listProjects, getProjectDetail, createStep, toggleStep, setProjectLink } from "./goals-db";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function goalsApiRoutes(db: Database) {
  return {
    "/api/goals": {
      GET: () => json(listProjects(db)),
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as { title?: unknown; deadline?: unknown } | null;
        const title = typeof body?.title === "string" ? body.title.trim() : "";
        const deadline = typeof body?.deadline === "string" ? body.deadline.trim() : "";
        if (!title || !deadline) return json({ error: "title and deadline are required" }, 400);
        return json(createProject(db, title, deadline, localToday()), 201);
      },
    },
    "/api/goals/:id": {
      GET: (req: { params: { id: string } }) => {
        const detail = getProjectDetail(db, Number(req.params.id));
        return detail ? json(detail) : json({ error: "not found" }, 404);
      },
      PUT: async (req: Request & { params: { id: string } }) => {
        const body = (await req.json().catch(() => null)) as { link?: unknown } | null;
        if (typeof body?.link !== "string") return json({ error: "link must be a string" }, 400);
        const link = body.link.trim() || null;
        const updated = setProjectLink(db, Number(req.params.id), link);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
    "/api/goals/:id/steps": {
      POST: async (req: Request & { params: { id: string } }) => {
        const body = (await req.json().catch(() => null)) as { label?: unknown; weight?: unknown } | null;
        const label = typeof body?.label === "string" ? body.label.trim() : "";
        const weight = typeof body?.weight === "number" ? body.weight : NaN;
        if (!label || !Number.isFinite(weight) || weight <= 0) {
          return json({ error: "label is required and weight must be a positive number" }, 400);
        }
        const step = createStep(db, Number(req.params.id), label, weight, localToday());
        return step ? json(step, 201) : json({ error: "project not found" }, 404);
      },
    },
    "/api/goals/steps/:stepId/toggle": {
      POST: (req: { params: { stepId: string } }) => {
        const step = toggleStep(db, Number(req.params.stepId), localToday());
        return step ? json(step) : json({ error: "not found" }, 404);
      },
    },
  };
}
