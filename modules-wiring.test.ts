import { test, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateModules } from "./modules-db";
import { migrateModuleItems, listModuleItems } from "./module-items-db";
import { moduleApiRoutes } from "./modules-api";
import { moduleItemsApiRoutes } from "./module-items-api";
import { SEMESTER_DEADLINES } from "./semester-deadlines";

test("boot order seeds modules then the 12 legacy deadlines as items", () => {
  const db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
  migrateModuleItems(db, "2026-09-09");
  expect(listModuleItems(db)).toHaveLength(SEMESTER_DEADLINES.length);
});

test("combined routes serve modules and module-items, not deadlines", async () => {
  const db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
  migrateModuleItems(db, "2026-09-09");
  const server = Bun.serve({
    port: 0,
    routes: { ...moduleApiRoutes(db), ...moduleItemsApiRoutes(db) },
    fetch: () => new Response("no", { status: 404 }),
  });
  try {
    expect((await fetch(`${server.url.origin}/api/modules`)).status).toBe(200);
    expect((await fetch(`${server.url.origin}/api/module-items`)).status).toBe(200);
    expect((await fetch(`${server.url.origin}/api/deadlines`)).status).toBe(404);
  } finally {
    server.stop(true);
  }
});
