import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateModuleItems, getModuleItem } from "./module-items-db";
import { migrateModules } from "./modules-db";
import { moduleItemsApiRoutes } from "./module-items-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
  migrateModuleItems(db);
  // migrateModuleItems now seeds 12 legacy-deadline rows; these API tests
  // assert on exactly the rows they POST, so start from an empty table.
  db.exec("DELETE FROM module_items; DELETE FROM sqlite_sequence WHERE name = 'module_items';");
  server = Bun.serve({ port: 0, routes: moduleItemsApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

const post = (path: string, body: unknown) =>
  fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

const good = {
  course: "COMP5348",
  kind: "assignment",
  title: "Assignment 1",
  description: "Weeks 1-6.",
  due_at: "2026-09-20",
  links: [{ label: "Brief", url: "https://canvas.example/brief" }],
};

test("POST creates the row and returns 201 with a normalised due_at", async () => {
  const res = await post("/api/module-items", good);
  expect(res.status).toBe(201);
  const item = await res.json();
  expect(item.due_at).toBe("2026-09-20T23:59");
  expect(item.title).toBe("Assignment 1");
});

test("POST rejects an unknown course / bad kind / empty title / bad due_at / bad link", async () => {
  expect((await post("/api/module-items", { ...good, course: "NOPE1000" })).status).toBe(400);
  expect((await post("/api/module-items", { ...good, kind: "midterm" })).status).toBe(400);
  expect((await post("/api/module-items", { ...good, title: "   " })).status).toBe(400);
  expect((await post("/api/module-items", { ...good, due_at: "next tuesday" })).status).toBe(400);
  expect((await post("/api/module-items", { ...good, links: [{ label: "x", url: "javascript:alert(1)" }] })).status).toBe(400);
});

test("GET lists items ordered incomplete-then-by-due", async () => {
  await post("/api/module-items", { ...good, title: "later", due_at: "2026-11-01" });
  await post("/api/module-items", { ...good, title: "sooner", due_at: "2026-09-10" });
  const list = await (await fetch(`${base}/api/module-items`)).json();
  expect(list.map((i: { title: string }) => i.title)).toEqual(["sooner", "later"]);
});

test("PUT edits the row and returns 200", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const res = await fetch(`${base}/api/module-items/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...good, title: "Assignment 1 (revised)" }),
  });
  expect(res.status).toBe(200);
  const item = await res.json();
  expect(item.title).toBe("Assignment 1 (revised)");
});

test("PUT on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/module-items/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(good),
  });
  expect(res.status).toBe(404);
});

test("toggle flips completed", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const toggled = await (await post(`/api/module-items/${created.id}/toggle`, {})).json();
  expect(toggled.completed).toBe(true);
});

test("DELETE removes the row", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const res = await fetch(`${base}/api/module-items/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);
  expect(getModuleItem(db, created.id)).toBeNull();
});

test("DELETE on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/module-items/9999`, { method: "DELETE" });
  expect(res.status).toBe(404);
});

test("POST accepts an optional weight", async () => {
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      course: "INFO5995",
      kind: "assignment",
      title: "Weighted",
      due_at: "2026-09-20",
      weight: "15%",
    }),
  });
  expect(res.status).toBe(201);
  expect((await res.json()).weight).toBe("15%");
});

test("POST rejects an unknown module", async () => {
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ course: "ZZZ0000", kind: "other", title: "x", due_at: "2026-09-20" }),
  });
  expect(res.status).toBe(400);
  expect((await res.json()).error).toMatch(/unknown module/i);
});

test("POST normalises a lower-cased / padded course to the canonical module code", async () => {
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      course: "  info5995 ",
      kind: "other",
      title: "case-insensitive course",
      due_at: "2026-09-20",
    }),
  });
  expect(res.status).toBe(201);
  expect((await res.json()).course).toBe("INFO5995");
});

test("POST rejects an over-long weight", async () => {
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      course: "INFO5995",
      kind: "other",
      title: "x",
      due_at: "2026-09-20",
      weight: "way too long to be a weight",
    }),
  });
  expect(res.status).toBe(400);
});

test("POST still works for a hidden module", async () => {
  // hide INFO5990 directly, then post to it
  const { setModuleHidden } = await import("./modules-db");
  setModuleHidden(db, "INFO5990", true);
  const res = await fetch(`${base}/api/module-items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ course: "INFO5990", kind: "other", title: "x", due_at: "2026-09-20" }),
  });
  expect(res.status).toBe(201);
});
