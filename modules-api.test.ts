import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateModules } from "./modules-db";
import { migrateModuleItems, createModuleItem } from "./module-items-db";
import { moduleApiRoutes } from "./modules-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
  migrateModuleItems(db, "2026-09-09");
  server = Bun.serve({ port: 0, routes: moduleApiRoutes(db) });
  base = server.url.origin;
});
afterEach(() => server.stop(true));

test("GET lists seeded modules", async () => {
  const rows = await (await fetch(`${base}/api/modules`)).json();
  expect(rows.map((r: { code: string }) => r.code)).toEqual([
    "INFO5995",
    "COMP5348",
    "INFO6007",
    "INFO5990",
  ]);
});

test("POST creates, rejects duplicate and bad code", async () => {
  const ok = await fetch(`${base}/api/modules`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "MY-COURSE", name: "My Course" }),
  });
  expect(ok.status).toBe(201);

  const dup = await fetch(`${base}/api/modules`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "INFO5995", name: "x" }),
  });
  expect(dup.status).toBe(409);

  const bad = await fetch(`${base}/api/modules`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: "a", name: "x" }),
  });
  expect(bad.status).toBe(400);
});

test("PUT renames, PATCH hides, 404 for unknown", async () => {
  const put = await fetch(`${base}/api/modules/INFO6007`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "PM" }),
  });
  expect((await put.json()).name).toBe("PM");

  const patch = await fetch(`${base}/api/modules/INFO6007`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hidden: true }),
  });
  expect((await patch.json()).hidden).toBe(true);

  const miss = await fetch(`${base}/api/modules/NOPE`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "x" }),
  });
  expect(miss.status).toBe(404);
});

test("DELETE blocks a module with items unless cascade=1", async () => {
  createModuleItem(
    db,
    { course: "INFO5990", kind: "other", title: "T", due_at: "2026-10-01" },
    "2026-09-09",
  );
  const blocked = await fetch(`${base}/api/modules/INFO5990`, { method: "DELETE" });
  expect(blocked.status).toBe(409);
  expect((await blocked.json()).count).toBeGreaterThanOrEqual(1);

  const forced = await fetch(`${base}/api/modules/INFO5990?cascade=1`, { method: "DELETE" });
  expect(forced.status).toBe(200);
  expect(await (await fetch(`${base}/api/modules`)).json()).toHaveLength(3);
});
