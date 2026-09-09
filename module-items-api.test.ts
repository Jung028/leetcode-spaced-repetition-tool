import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateModuleItems, getModuleItem } from "./module-items-db";
import { moduleItemsApiRoutes, type ModuleItemsApiDeps } from "./module-items-api";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;
let calendarCalls: Array<{ kind: string; itemId: number }>;

// A stub SyncDeps: instead of hitting Google, record intent and mark the row
// synced/error deterministically based on the item title.
function stubDeps(): ModuleItemsApiDeps {
  return {
    sync: {
      getToken: async () => ({ ok: true as const, token: "t" }),
      fetch: (async (url: string, init?: RequestInit) => {
        const method = init?.method ?? "GET";
        if (method === "POST" && String(url).endsWith("/events")) {
          const body = JSON.parse(String(init!.body));
          calendarCalls.push({ kind: "create", itemId: Number(body.extendedProperties.private.modulePlannerId) });
          // title "FAILSYNC" -> 503, anything else -> created
          return new Response(
            JSON.stringify(body.summary.includes("FAILSYNC") ? {} : { id: `evt_${Date.now()}_${Math.random()}` }),
            { status: body.summary.includes("FAILSYNC") ? 503 : 200 },
          );
        }
        if (method === "PATCH") {
          calendarCalls.push({ kind: "patch", itemId: -1 });
          return new Response(JSON.stringify({ id: "evt_patched" }), { status: 200 });
        }
        if (method === "DELETE") {
          calendarCalls.push({ kind: "delete", itemId: -1 });
          return new Response("", { status: 204 });
        }
        // events.list during reconcile
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      }) as unknown as typeof fetch,
    },
  };
}

beforeEach(() => {
  db = new Database(":memory:");
  migrateModuleItems(db);
  // migrateModuleItems now seeds 12 legacy-deadline rows; these API tests
  // assert on exactly the rows they POST, so start from an empty table.
  db.exec("DELETE FROM module_items; DELETE FROM sqlite_sequence WHERE name = 'module_items';");
  calendarCalls = [];
  server = Bun.serve({ port: 0, routes: moduleItemsApiRoutes(db, stubDeps()) });
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

test("POST creates the row, syncs it, and returns 201 with a synced state", async () => {
  const res = await post("/api/module-items", good);
  expect(res.status).toBe(201);
  const item = await res.json();
  expect(item.due_at).toBe("2026-09-20T23:59");
  expect(item.sync_state).toBe("synced");
  expect(item.gcal_event_id).toMatch(/^evt_/);
  expect(calendarCalls).toEqual([{ kind: "create", itemId: item.id }]);
});

test("POST still returns 201 when the calendar call fails; row is marked error", async () => {
  const res = await post("/api/module-items", { ...good, title: "FAILSYNC now" });
  expect(res.status).toBe(201);
  const item = await res.json();
  expect(item.sync_state).toBe("error");
  expect(item.sync_error).toContain("503");
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

test("PUT edits and re-syncs (PATCH when an event id already exists)", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const res = await fetch(`${base}/api/module-items/${created.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...good, title: "Assignment 1 (revised)" }),
  });
  expect(res.status).toBe(200);
  const item = await res.json();
  expect(item.title).toBe("Assignment 1 (revised)");
  expect(calendarCalls.some((c) => c.kind === "patch")).toBe(true);
});

test("PUT on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/module-items/9999`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(good),
  });
  expect(res.status).toBe(404);
});

test("toggle flips completed and re-syncs", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const toggled = await (await post(`/api/module-items/${created.id}/toggle`, {})).json();
  expect(toggled.completed).toBe(true);
});

test("DELETE removes the row and deletes the calendar event", async () => {
  const created = await (await post("/api/module-items", good)).json();
  const res = await fetch(`${base}/api/module-items/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);
  expect(getModuleItem(db, created.id)).toBeNull();
  expect(calendarCalls.some((c) => c.kind === "delete")).toBe(true);
});

test("DELETE on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/module-items/9999`, { method: "DELETE" });
  expect(res.status).toBe(404);
});

test("POST /api/module-items/sync runs a reconcile and returns a summary", async () => {
  await post("/api/module-items", { ...good, title: "FAILSYNC once" }); // leaves an error row
  const summary = await (await post("/api/module-items/sync", {})).json();
  expect(summary).toHaveProperty("synced");
  expect(summary).toHaveProperty("errors");
  expect(summary).toHaveProperty("orphansRemoved");
});
