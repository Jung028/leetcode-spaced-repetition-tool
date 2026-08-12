import type { Database } from "bun:sqlite";
import {
  captureSubmission,
  countReviewsToday,
  createProblem,
  deleteProblem,
  getProblem,
  listCompletedToday,
  listProblems,
  reviewProblem,
  updateProblem,
  type ProblemInput,
} from "./db";
import { localToday } from "./scheduling";
import { getCurrentLeetcode150, leetcode150CompletedCredit } from "./leetcode150-db";

const json = (data: unknown, status = 200) =>
  Response.json(data, { status });

function parseInput(body: unknown): ProblemInput | null {
  const b = body as Record<string, unknown>;
  const title = typeof b?.title === "string" ? b.title.trim() : "";
  const url = typeof b?.url === "string" ? b.url.trim() : "";
  const solution = typeof b?.solution === "string" ? b.solution.trim() : "";
  const language = typeof b?.language === "string" && b.language.trim() ? b.language.trim() : "java";
  if (!title || !url || !solution) return null;
  return { title, url, solution, language };
}

export function apiRoutes(db: Database) {
  return {
    "/api/problems": {
      GET: () => json(listProblems(db)),
      POST: async (req: Request) => {
        const input = parseInput(await req.json().catch(() => null));
        if (!input) return json({ error: "title, url and solution are required" }, 400);
        return json(createProblem(db, input, localToday()), 201);
      },
    },
    "/api/problems/completed-today": {
      GET: () => {
        const today = localToday();
        const current = getCurrentLeetcode150(db, today);
        const credit = leetcode150CompletedCredit(db, today, current);
        const items = listCompletedToday(db, today);
        if (credit) {
          items.push({
            id: -1,
            title: `${credit.number}. ${credit.title}`,
            url: credit.url,
            language: "—",
            rung: 0,
            next_review: today,
            created_at: today,
          });
        }
        return json(items);
      },
    },
    "/api/problems/:id": {
      GET: (req: { params: { id: string } }) => {
        const p = getProblem(db, Number(req.params.id));
        return p ? json(p) : json({ error: "not found" }, 404);
      },
      PUT: async (req: Request & { params: { id: string } }) => {
        const input = parseInput(await req.json().catch(() => null));
        if (!input) return json({ error: "title, url and solution are required" }, 400);
        const p = updateProblem(db, Number(req.params.id), input);
        return p ? json(p) : json({ error: "not found" }, 404);
      },
      DELETE: (req: { params: { id: string } }) =>
        deleteProblem(db, Number(req.params.id))
          ? json({ ok: true })
          : json({ error: "not found" }, 404),
    },
    "/api/problems/:id/review": {
      POST: async (req: Request & { params: { id: string } }) => {
        const body = (await req.json().catch(() => null)) as { result?: string } | null;
        if (body?.result !== "pass" && body?.result !== "fail")
          return json({ error: "result must be 'pass' or 'fail'" }, 400);
        const p = reviewProblem(db, Number(req.params.id), body.result, localToday());
        return p ? json(p) : json({ error: "not found" }, 404);
      },
    },
    "/api/capture": {
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as
          | (Record<string, unknown> & { result?: string })
          | null;
        const input = parseInput(body);
        if (!input) return json({ error: "title, url and solution are required" }, 400);
        const result =
          body?.result === "pass" || body?.result === "fail" ? body.result : undefined;
        const { problem, created } = captureSubmission(
          db,
          input as Required<ProblemInput>,
          localToday(),
          result,
        );
        return json({ ...problem, created }, created ? 201 : 200);
      },
    },
    "/api/stats": {
      GET: () => {
        const today = localToday();
        const current = getCurrentLeetcode150(db, today);
        const credit = leetcode150CompletedCredit(db, today, current);
        return json({ completedToday: countReviewsToday(db, today) + (credit ? 1 : 0) });
      },
    },
  };
}
