import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateRaces } from "./races-db";
import { racesApiRoutes } from "./races-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateRaces(db);
  server = Bun.serve({ port: 0, routes: racesApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("POST /api/races creates a race and returns 201", async () => {
  const res = await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Powerman Classic", approxYear: 2027 }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.name).toBe("Powerman Classic");
  expect(body.approx_year).toBe(2027);
});

test("POST /api/races requires a non-blank name", async () => {
  const res = await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "   " }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/races rejects a non-numeric approxYear", async () => {
  const res = await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Race", approxYear: "soon" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/races rejects a malformed date", async () => {
  const res = await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Race", date: "not-a-date" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/races returns created races", async () => {
  await fetch(`${base}/api/races`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Race A" }),
  });
  const res = await fetch(`${base}/api/races`);
  const body = await res.json();
  expect(body.length).toBe(1);
  expect(body[0].name).toBe("Race A");
});

test("PUT /api/races/:id updates a race", async () => {
  const created = await (
    await fetch(`${base}/api/races`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Original" }),
    })
  ).json();
  const res = await fetch(`${base}/api/races/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Renamed" }),
  });
  expect(res.status).toBe(200);
  expect((await res.json()).name).toBe("Renamed");
});

test("PUT /api/races/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/races/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "X" }),
  });
  expect(res.status).toBe(404);
});

test("DELETE /api/races/:id removes a race", async () => {
  const created = await (
    await fetch(`${base}/api/races`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Delete me" }),
    })
  ).json();
  const res = await fetch(`${base}/api/races/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);
  expect((await (await fetch(`${base}/api/races`)).json()).length).toBe(0);
});

test("DELETE /api/races/:id on an unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/races/9999`, { method: "DELETE" });
  expect(res.status).toBe(404);
});
