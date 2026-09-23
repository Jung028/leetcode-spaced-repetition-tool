import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateJobs } from "./db";
import { jobsApiRoutes } from "./api";
import { localToday } from "../shared/scheduling";

const TODAY = localToday();
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

const send = (path: string, method: string, body?: unknown) =>
  fetch(`${base}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeEach(() => {
  db = new Database(":memory:");
  migrateJobs(db);
  server = Bun.serve({ port: 0, routes: jobsApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("POST /api/jobs creates a role and GET lists it", async () => {
  const res = await send("/api/jobs", "POST", { company: "Citadel", role: "SWE Intern", closes_on: "2026-09-28", link: "https://example.com/apply" });
  expect(res.status).toBe(201);
  const job = await res.json();
  expect(job).toMatchObject({ company: "Citadel", kind: "role", status: "To apply", applied_on: null });
  const list = await (await fetch(`${base}/api/jobs`)).json();
  expect(list).toHaveLength(1);
});

test("POST /api/jobs logging an already-sent application starts its clock today", async () => {
  const job = await (await send("/api/jobs", "POST", { company: "Canva", status: "Applied" })).json();
  expect(job.applied_on).toBe(TODAY);
  expect(job.last_update).toBe(TODAY);
});

test("POST /api/jobs validates input", async () => {
  expect((await send("/api/jobs", "POST", { company: "" })).status).toBe(400);
  expect((await send("/api/jobs", "POST", { company: "X", link: "javascript:alert(1)" })).status).toBe(400);
  expect((await send("/api/jobs", "POST", { company: "X", closes_on: "28/09/2026" })).status).toBe(400);
  expect((await send("/api/jobs", "POST", { company: "X", status: "Contacted" })).status).toBe(400); // startup-only status
  expect((await send("/api/jobs", "POST", { company: "X", priority: "Urgent" })).status).toBe(400);
});

test("PUT /api/jobs/:id updates fields and clears blanks", async () => {
  const job = await (await send("/api/jobs", "POST", { company: "Apple", notes: "old" })).json();
  const res = await send(`/api/jobs/${job.id}`, "PUT", { status: "Interview", notes: "" });
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ status: "Interview", notes: null, last_update: TODAY });
  expect((await send("/api/jobs/9999", "PUT", { status: "Offer" })).status).toBe(404);
});

test("POST /api/jobs/:id/applied moves roles to Applied and startups to Contacted", async () => {
  const role = await (await send("/api/jobs", "POST", { company: "TikTok" })).json();
  const startup = await (await send("/api/jobs", "POST", { company: "Lorikeet", kind: "startup" })).json();
  expect((await (await send(`/api/jobs/${role.id}/applied`, "POST")).json()).status).toBe("Applied");
  expect((await (await send(`/api/jobs/${startup.id}/applied`, "POST")).json()).status).toBe("Contacted");
});

test("GET /api/jobs/actions returns the next step per active row", async () => {
  await send("/api/jobs", "POST", { company: "Citadel", closes_on: "2026-09-28" });
  await send("/api/jobs", "POST", { company: "Rejected Co", status: "Rejected" });
  const actions = await (await fetch(`${base}/api/jobs/actions`)).json();
  expect(actions).toHaveLength(1);
  expect(actions[0].job.company).toBe("Citadel");
});

test("DELETE /api/jobs/:id removes the row", async () => {
  const job = await (await send("/api/jobs", "POST", { company: "Gone" })).json();
  expect((await send(`/api/jobs/${job.id}`, "DELETE")).status).toBe(200);
  expect((await send(`/api/jobs/${job.id}`, "DELETE")).status).toBe(404);
});
