import type { Database } from "bun:sqlite";
import {
  createJob,
  defaultStatus,
  deleteJob,
  getJob,
  listJobActions,
  listJobs,
  PRIORITIES,
  statusesFor,
  updateJob,
  type JobInput,
  type JobKind,
} from "./db";
import { localToday } from "../shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

const TEXT_FIELDS = ["company", "role", "job_type", "cycle", "notes", "intl_ok", "next_action", "about"] as const;
const DATE_FIELDS = ["closes_on", "applied_on", "last_update", "next_action_due"] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// Validates a (partial) body. `kind` is needed to check the status belongs to
// the right pipeline. Blank strings become null so fields can be cleared.
function parseBody(body: Record<string, unknown> | null, kind: JobKind): { input: Partial<JobInput> } | { error: string } {
  if (!body || typeof body !== "object") return { error: "JSON body required" };
  const input: Partial<JobInput> = {};

  for (const f of TEXT_FIELDS) {
    if (body[f] === undefined) continue;
    if (body[f] !== null && typeof body[f] !== "string") return { error: `${f} must be a string` };
    const v = typeof body[f] === "string" ? (body[f] as string).trim() : "";
    (input as Record<string, unknown>)[f] = v || null;
  }
  for (const f of DATE_FIELDS) {
    if (body[f] === undefined) continue;
    const v = typeof body[f] === "string" ? (body[f] as string).trim() : "";
    if (v && !DATE_RE.test(v)) return { error: `${f} must be YYYY-MM-DD` };
    (input as Record<string, unknown>)[f] = v || null;
  }
  if (body.link !== undefined) {
    const v = typeof body.link === "string" ? body.link.trim() : "";
    if (v && !isHttpUrl(v)) return { error: "link must be an http(s) URL" };
    input.link = v || null;
  }
  if (body.priority !== undefined) {
    const v = typeof body.priority === "string" ? body.priority.trim() : "";
    if (v && !(PRIORITIES as readonly string[]).includes(v)) return { error: `priority must be one of ${PRIORITIES.join(", ")}` };
    input.priority = v || null;
  }
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !statusesFor(kind).includes(body.status)) {
      return { error: `status must be one of ${statusesFor(kind).join(", ")}` };
    }
    input.status = body.status;
  }
  if ("company" in input && !input.company) return { error: "company is required" };
  return { input };
}

export function jobsApiRoutes(db: Database) {
  return {
    "/api/jobs": {
      GET: () => json(listJobs(db)),
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
        const kind: JobKind = body?.kind === "startup" ? "startup" : "role";
        const parsed = parseBody(body, kind);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        const { input } = parsed;
        if (!input.company) return json({ error: "company is required" }, 400);
        const today = localToday();
        const status = input.status ?? defaultStatus(kind);
        // Logging something already sent (e.g. an application made elsewhere)
        // starts its follow-up clock today unless dates were given.
        const started = status !== defaultStatus(kind);
        const job = createJob(
          db,
          {
            ...input,
            company: input.company,
            kind,
            status,
            applied_on: input.applied_on ?? (started ? today : null),
            last_update: input.last_update ?? (started ? today : null),
          },
          today,
        );
        return json(job, 201);
      },
    },
    "/api/jobs/actions": {
      GET: () => json(listJobActions(db, localToday())),
    },
    "/api/jobs/:id/applied": {
      // One-click "I sent it": moves a To apply / Not started row forward.
      POST: (req: { params: { id: string } }) => {
        const job = getJob(db, Number(req.params.id));
        if (!job) return json({ error: "not found" }, 404);
        const status = job.kind === "startup" ? "Contacted" : "Applied";
        return json(updateJob(db, job.id, { status }, localToday()));
      },
    },
    "/api/jobs/:id": {
      GET: (req: { params: { id: string } }) => {
        const job = getJob(db, Number(req.params.id));
        return job ? json(job) : json({ error: "not found" }, 404);
      },
      PUT: async (req: Request & { params: { id: string } }) => {
        const job = getJob(db, Number(req.params.id));
        if (!job) return json({ error: "not found" }, 404);
        const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
        const parsed = parseBody(body, job.kind);
        if ("error" in parsed) return json({ error: parsed.error }, 400);
        return json(updateJob(db, job.id, parsed.input, localToday()));
      },
      DELETE: (req: { params: { id: string } }) =>
        deleteJob(db, Number(req.params.id)) ? json({ ok: true }) : json({ error: "not found" }, 404),
    },
  };
}
