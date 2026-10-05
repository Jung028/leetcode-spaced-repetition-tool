import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db);
  server = Bun.serve({ port: 0, routes: goalsApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("POST /api/goals creates a goal and returns 201", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "5K: 17:36 → 16:30" }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.text).toBe("5K: 17:36 → 16:30");
  expect(body.done).toBe(false);
});

test("POST /api/goals requires non-empty text", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "  " }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/goals returns created goals", async () => {
  await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Goal A" }),
  });
  const res = await fetch(`${base}/api/goals`);
  const body = await res.json();
  expect(body.length).toBe(1);
  expect(body[0].text).toBe("Goal A");
});

test("POST /api/goals/:id/toggle flips done", async () => {
  const created = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Toggle me" }),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}/toggle`, { method: "POST" });
  expect(res.status).toBe(200);
  expect((await res.json()).done).toBe(true);
});

test("POST /api/goals/:id/toggle on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999/toggle`, { method: "POST" });
  expect(res.status).toBe(404);
});

test("PUT /api/goals/:id updates a goal's text", async () => {
  const created = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Original" }),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Renamed" }),
  });
  expect(res.status).toBe(200);
  expect((await res.json()).text).toBe("Renamed");
});

test("PUT /api/goals/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "X" }),
  });
  expect(res.status).toBe(404);
});

test("DELETE /api/goals/:id removes a goal", async () => {
  const created = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Delete me" }),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);
  expect((await (await fetch(`${base}/api/goals`)).json()).length).toBe(0);
});

test("DELETE /api/goals/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999`, { method: "DELETE" });
  expect(res.status).toBe(404);
});

const post = (body: unknown) =>
  fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

test("POST /api/goals infers a category when none is sent", async () => {
  const body = await (await post({ text: "10K: 38:46 → 34:00" })).json();
  expect(body.category).toBe("running");
});

test("POST /api/goals rejects an unknown category", async () => {
  expect((await post({ text: "10K: 38:46 → 34:00", category: "swimming" })).status).toBe(400);
});

test("PUT /api/goals/:id keeps the category when none is sent", async () => {
  const created = await (await post({ text: "10K: 38:46 → 34:00", category: "events" })).json();
  const res = await fetch(`${base}/api/goals/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "10K: 38:00 → 34:00" }),
  });
  expect((await res.json()).category).toBe("events");
});
