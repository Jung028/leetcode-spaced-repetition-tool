import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateModuleItems,
  createModuleItem,
  getModuleItem,
  markItemSynced,
  type ModuleItemInput,
} from "../module-items-db";
import { buildEvent, syncModuleItem, deleteCalendarEvent, reconcile, addMinutesToLocalStamp } from "./sync";

const TODAY = "2026-09-07";
const okToken = async () => ({ ok: true as const, token: "at_test" });

const input: ModuleItemInput = {
  course: "COMP5348",
  kind: "presentation",
  title: "Group Project Presentation",
  description: "Week 13 slot.",
  due_at: "2026-11-08T23:59",
  links: [{ label: "Rubric", url: "https://canvas.example/rubric" }],
};

let db: Database;
beforeEach(() => {
  db = new Database(":memory:");
  migrateModuleItems(db, TODAY);
  // These tests build their own rows via createModuleItem; drop the 12
  // legacy-deadline rows the migration now seeds so sync/reconcile counts
  // reflect only what each test set up.
  db.exec("DELETE FROM module_items; DELETE FROM sqlite_sequence WHERE name = 'module_items';");
});

function recorder(script: Array<{ status: number; body?: unknown }>) {
  const calls: Array<{ url: string; method: string; body?: any }> = [];
  let i = 0;
  const fn = (async (url: string, init?: RequestInit) => {
    const step = script[Math.min(i, script.length - 1)]!;
    i += 1;
    calls.push({
      url: String(url),
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    return new Response(step.body === undefined ? "" : JSON.stringify(step.body), { status: step.status });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

test("addMinutesToLocalStamp adds minutes with hour/day rollover", () => {
  expect(addMinutesToLocalStamp("2026-11-08T23:59", 30)).toBe("2026-11-09T00:29:00");
  expect(addMinutesToLocalStamp("2026-11-08T09:00", 30)).toBe("2026-11-08T09:30:00");
});

test("buildEvent sets summary, Sydney local times, colour, marker, and the three reminders", () => {
  const item = createModuleItem(db, input, TODAY);
  const ev = buildEvent(item, "http://localhost:3005");
  expect(ev.summary).toBe("COMP5348 presentation: Group Project Presentation");
  expect(ev.start).toEqual({ dateTime: "2026-11-08T23:59:00", timeZone: "Australia/Sydney" });
  expect(ev.end).toEqual({ dateTime: "2026-11-09T00:29:00", timeZone: "Australia/Sydney" });
  expect(ev.reminders).toEqual({
    useDefault: false,
    overrides: [
      { method: "popup", minutes: 10080 },
      { method: "popup", minutes: 4320 },
      { method: "popup", minutes: 1440 },
    ],
  });
  expect(ev.description).toContain("Rubric: https://canvas.example/rubric");
  expect(ev.description).toContain("[module-planner]");
  expect(ev.extendedProperties.private.modulePlannerId).toBe(String(item.id));
  expect(typeof ev.colorId).toBe("string");
});

test("buildEvent for a completed item drops reminders and prefixes the summary", () => {
  const item = createModuleItem(db, input, TODAY);
  const done = { ...item, completed: true };
  const ev = buildEvent(done);
  expect(ev.summary.startsWith("✓ ")).toBe(true);
  expect(ev.reminders.overrides).toEqual([]);
});

test("syncModuleItem creates an event and stores the returned id", async () => {
  const item = createModuleItem(db, input, TODAY);
  const rec = recorder([{ status: 200, body: { id: "evt_new" } }]);
  const result = await syncModuleItem(db, item, { fetch: rec.fn, getToken: okToken });
  expect(rec.calls[0]!.method).toBe("POST");
  expect(rec.calls[0]!.url).toBe("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  expect(result!.gcal_event_id).toBe("evt_new");
  expect(result!.sync_state).toBe("synced");
  expect(getModuleItem(db, item.id)!.gcal_event_id).toBe("evt_new");
});

test("syncModuleItem patches an existing event id", async () => {
  const item = createModuleItem(db, input, TODAY);
  markItemSynced(db, item.id, "evt_exist", "2026-09-07T10:00:00");
  const rec = recorder([{ status: 200, body: { id: "evt_exist" } }]);
  await syncModuleItem(db, getModuleItem(db, item.id)!, { fetch: rec.fn, getToken: okToken });
  expect(rec.calls[0]!.method).toBe("PATCH");
  expect(rec.calls[0]!.url).toBe("https://www.googleapis.com/calendar/v3/calendars/primary/events/evt_exist");
});

test("syncModuleItem re-creates when PATCH returns 404", async () => {
  const item = createModuleItem(db, input, TODAY);
  markItemSynced(db, item.id, "evt_gone", "2026-09-07T10:00:00");
  const rec = recorder([
    { status: 404, body: { error: { message: "Not Found" } } },
    { status: 200, body: { id: "evt_fresh" } },
  ]);
  const result = await syncModuleItem(db, getModuleItem(db, item.id)!, { fetch: rec.fn, getToken: okToken });
  expect(rec.calls.map((c) => c.method)).toEqual(["PATCH", "POST"]);
  expect(result!.gcal_event_id).toBe("evt_fresh");
  expect(result!.sync_state).toBe("synced");
});

test("syncModuleItem marks the row error (not throwing) on a 5xx", async () => {
  const item = createModuleItem(db, input, TODAY);
  const rec = recorder([{ status: 503, body: {} }]);
  const result = await syncModuleItem(db, item, { fetch: rec.fn, getToken: okToken });
  expect(result!.sync_state).toBe("error");
  expect(result!.sync_error).toContain("503");
});

test("syncModuleItem marks the row error when the token provider fails", async () => {
  const item = createModuleItem(db, input, TODAY);
  const result = await syncModuleItem(db, item, {
    fetch: recorder([]).fn,
    getToken: async () => ({ ok: false as const, reason: "not connected" }),
  });
  expect(result!.sync_state).toBe("error");
  expect(result!.sync_error).toBe("not connected");
});

test("deleteCalendarEvent treats 410/404 as success", async () => {
  const rec = recorder([{ status: 410, body: {} }]);
  expect(await deleteCalendarEvent("evt_x", { fetch: rec.fn, getToken: okToken })).toEqual({ ok: true });
  expect(rec.calls[0]!.method).toBe("DELETE");
});

test("reconcile retries pending rows and removes orphan events", async () => {
  const keep = createModuleItem(db, input, TODAY);
  // one pending row -> POST creates it; then the orphan sweep lists events and
  // finds an event whose modulePlannerId has no row -> DELETE.
  const rec = recorder([
    { status: 200, body: { id: "evt_keep" } }, // POST for `keep`
    {
      status: 200,
      body: {
        items: [
          { id: "evt_keep", extendedProperties: { private: { modulePlannerId: String(keep.id) } } },
          { id: "evt_orphan", extendedProperties: { private: { modulePlannerId: "9999" } } },
        ],
      },
    }, // events.list
    { status: 204, body: {} }, // DELETE evt_orphan
  ]);
  const summary = await reconcile(db, { fetch: rec.fn, getToken: okToken });
  expect(summary.synced).toBe(1);
  expect(summary.orphansRemoved).toBe(1);
  expect(rec.calls.some((c) => c.method === "DELETE" && c.url.endsWith("/evt_orphan"))).toBe(true);
});
