import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateAnnouncements } from "./announcement-db";
import { announcementApiRoutes } from "./announcement-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateAnnouncements(db);
  server = Bun.serve({ port: 0, routes: announcementApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("POST /api/announcements creates one and returns 201", async () => {
  const res = await fetch(`${base}/api/announcements`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Ask about Assessment 1 presentation week" }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.message).toBe("Ask about Assessment 1 presentation week");
  expect(body.completed).toBe(false);
});

test("POST /api/announcements requires a non-empty message", async () => {
  const res = await fetch(`${base}/api/announcements`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "  " }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/announcements lists them, incomplete before completed", async () => {
  await fetch(`${base}/api/announcements`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "First" }),
  });
  const res = await fetch(`${base}/api/announcements`);
  const body = await res.json();
  expect(body.length).toBe(1);
  expect(body[0].message).toBe("First");
});

test("PUT /api/announcements/:id edits the message", async () => {
  const created = await (
    await fetch(`${base}/api/announcements`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Original" }),
    })
  ).json();

  const res = await fetch(`${base}/api/announcements/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Edited" }),
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.message).toBe("Edited");
});

test("PUT /api/announcements/:id requires a non-empty message", async () => {
  const created = await (
    await fetch(`${base}/api/announcements`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Original" }),
    })
  ).json();

  const res = await fetch(`${base}/api/announcements/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "" }),
  });
  expect(res.status).toBe(400);
});

test("PUT /api/announcements/:id on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/announcements/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "x" }),
  });
  expect(res.status).toBe(404);
});

test("POST /api/announcements/:id/toggle flips completed", async () => {
  const created = await (
    await fetch(`${base}/api/announcements`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Task" }),
    })
  ).json();

  const toggled = await (
    await fetch(`${base}/api/announcements/${created.id}/toggle`, { method: "POST" })
  ).json();
  expect(toggled.completed).toBe(true);
});

test("POST /api/announcements/:id/toggle on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/announcements/9999/toggle`, { method: "POST" });
  expect(res.status).toBe(404);
});

test("DELETE /api/announcements/:id removes it", async () => {
  const created = await (
    await fetch(`${base}/api/announcements`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Task" }),
    })
  ).json();

  const res = await fetch(`${base}/api/announcements/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);

  const list = await (await fetch(`${base}/api/announcements`)).json();
  expect(list.length).toBe(0);
});

test("DELETE /api/announcements/:id on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/announcements/9999`, { method: "DELETE" });
  expect(res.status).toBe(404);
});
