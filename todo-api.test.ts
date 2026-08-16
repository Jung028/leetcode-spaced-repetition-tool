import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateTodo } from "./todo-db";
import { todoApiRoutes } from "./todo-api";
import { localToday } from "./scheduling";

const TODAY = localToday();
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateTodo(db);
  server = Bun.serve({ port: 0, routes: todoApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("POST /api/todo creates a todo and returns 201", async () => {
  const res = await fetch(`${base}/api/todo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "Write the SA", dueDate: TODAY, notes: "https://x.com" }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.task).toBe("Write the SA");
  expect(body.notes).toBe("https://x.com");
});

test("POST /api/todo requires task and dueDate", async () => {
  const res = await fetch(`${base}/api/todo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "", dueDate: "" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/todo defaults missing notes to null", async () => {
  const res = await fetch(`${base}/api/todo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "No notes", dueDate: TODAY }),
  });
  const body = await res.json();
  expect(body.notes).toBeNull();
});

test("GET /api/todo/due returns due todos and stats", async () => {
  await fetch(`${base}/api/todo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "Due today", dueDate: TODAY }),
  });
  const res = await fetch(`${base}/api/todo/due`);
  const body = await res.json();
  expect(body.due.length).toBe(1);
  expect(body.stats).toEqual({ dueCount: 1, overdueCount: 0, completedToday: 0 });
});

test("POST /api/todo/:id/toggle marks done and updates stats", async () => {
  const created = await (
    await fetch(`${base}/api/todo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "Task", dueDate: TODAY }),
    })
  ).json();

  const toggled = await (await fetch(`${base}/api/todo/${created.id}/toggle`, { method: "POST" })).json();
  expect(toggled.done).toBe(true);

  const due = await (await fetch(`${base}/api/todo/due`)).json();
  expect(due.due.length).toBe(0);
  expect(due.stats.completedToday).toBe(1);
});

test("POST /api/todo/:id/toggle on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/todo/9999/toggle`, { method: "POST" });
  expect(res.status).toBe(404);
});

test("DELETE /api/todo/:id removes it", async () => {
  const created = await (
    await fetch(`${base}/api/todo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "Task", dueDate: TODAY }),
    })
  ).json();

  const res = await fetch(`${base}/api/todo/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);

  const due = await (await fetch(`${base}/api/todo/due`)).json();
  expect(due.due.length).toBe(0);
});

test("GET /api/todo/completed-today returns only today's completions", async () => {
  const created = await (
    await fetch(`${base}/api/todo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "Task", dueDate: TODAY }),
    })
  ).json();
  await fetch(`${base}/api/todo/${created.id}/toggle`, { method: "POST" });

  const res = await fetch(`${base}/api/todo/completed-today`);
  const body = await res.json();
  expect(body.length).toBe(1);
  expect(body[0].task).toBe("Task");
});
