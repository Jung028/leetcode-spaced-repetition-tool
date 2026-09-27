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
    body: JSON.stringify({ title: "5k PB", currentValue: "17:36", targetValue: "16:30" }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.title).toBe("5k PB");
  expect(body.current_value).toBe("17:36");
});

test("POST /api/goals requires title, currentValue and targetValue", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "5k PB", currentValue: "", targetValue: "16:30" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/goals rejects a malformed targetDate", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "A", currentValue: "1", targetValue: "2", targetDate: "not-a-date" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/goals rejects a non-numeric raceId", async () => {
  const res = await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "A", currentValue: "1", targetValue: "2", raceId: "seven" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/goals returns created goals", async () => {
  await fetch(`${base}/api/goals`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Goal A", currentValue: "1", targetValue: "2" }),
  });
  const res = await fetch(`${base}/api/goals`);
  const body = await res.json();
  expect(body.length).toBe(1);
  expect(body[0].title).toBe("Goal A");
});

test("PUT /api/goals/:id updates a goal", async () => {
  const created = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Original", currentValue: "1", targetValue: "2" }),
    })
  ).json();
  const res = await fetch(`${base}/api/goals/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Renamed", currentValue: "1", targetValue: "2" }),
  });
  expect(res.status).toBe(200);
  expect((await res.json()).title).toBe("Renamed");
});

test("PUT /api/goals/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/goals/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "X", currentValue: "1", targetValue: "2" }),
  });
  expect(res.status).toBe(404);
});

test("DELETE /api/goals/:id removes a goal", async () => {
  const created = await (
    await fetch(`${base}/api/goals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Delete me", currentValue: "1", targetValue: "2" }),
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
