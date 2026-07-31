// goals-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";
import { localToday } from "./scheduling";

let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = new Database(":memory:");
  migrateGoals(db);
  server = Bun.serve({ port: 0, routes: goalsApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

const createProjectBody = { title: "Complete tracely onboarding", deadline: "2026-08-10" };

test("POST /api/goals creates a project due today with no steps", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(createProjectBody),
  });
  expect(res.status).toBe(201);
  const created: any = await res.json();
  expect(created.title).toBe("Complete tracely onboarding");
  expect(created.created_at).toBe(localToday());
});

test("POST /api/goals rejects a missing title or deadline", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "", deadline: "2026-08-10" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/goals lists active projects", async () => {
  await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(createProjectBody),
  });
  const body: any = await (await fetch(`${base}/api/goals`)).json();
  expect(body.length).toBe(1);
});

test("GET /api/goals/:id returns project detail with steps and progress", async () => {
  const created: any = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createProjectBody),
    })
  ).json();
  const detail: any = await (await fetch(`${base}/api/goals/${created.id}`)).json();
  expect(detail.steps).toEqual([]);
  expect(detail.progress).toBe(0);
});

test("GET /api/goals/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999`);
  expect(res.status).toBe(404);
});

test("POST /api/goals/:id/steps adds a step due today (the first step)", async () => {
  const created: any = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createProjectBody),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}/steps`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: "Complete signup page", weight: 20 }),
  });
  expect(res.status).toBe(201);
  const step: any = await res.json();
  expect(step.due_date).toBe(localToday());
  expect(step.weight).toBe(20);
});

test("POST /api/goals/:id/steps rejects a missing label or non-positive weight", async () => {
  const created: any = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createProjectBody),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}/steps`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: "x", weight: 0 }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/goals/:id/steps on an unknown project returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999/steps`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: "x", weight: 10 }),
  });
  expect(res.status).toBe(404);
});

test("POST /api/goals/steps/:stepId/toggle flips a step to done", async () => {
  const created: any = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(createProjectBody),
    })
  ).json();
  const step: any = await (
    await fetch(`${base}/api/goals/${created.id}/steps`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: "Complete signup page", weight: 20 }),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/steps/${step.id}/toggle`, { method: "POST" });
  expect(res.status).toBe(200);
  const toggled: any = await res.json();
  expect(toggled.done).toBe(true);
});

test("POST /api/goals/steps/:stepId/toggle on an unknown step returns 404", async () => {
  const res = await fetch(`${base}/api/goals/steps/9999/toggle`, { method: "POST" });
  expect(res.status).toBe(404);
});
