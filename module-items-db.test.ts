import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateModuleItems,
  createModuleItem,
  listModuleItems,
  getModuleItem,
  updateModuleItem,
  toggleModuleItem,
  deleteModuleItem,
  markItemSynced,
  markItemSyncError,
  listItemsNeedingSync,
  normalizeDueAt,
  type ModuleItemInput,
} from "./module-items-db";

const TODAY = "2026-09-07";
let db: Database;

const base: ModuleItemInput = {
  course: "COMP5348",
  kind: "assignment",
  title: "Assignment 1",
  description: "Paper-based exercises on Weeks 1-6.",
  due_at: "2026-09-20",
  links: [{ label: "Brief", url: "https://canvas.example/brief" }],
};

beforeEach(() => {
  db = new Database(":memory:");
  migrateModuleItems(db);
});

test("normalizeDueAt expands a date to 23:59 and passes a datetime through", () => {
  expect(normalizeDueAt("2026-09-20")).toBe("2026-09-20T23:59");
  expect(normalizeDueAt("2026-09-20T09:00")).toBe("2026-09-20T09:00");
  expect(() => normalizeDueAt("nonsense")).toThrow();
});

test("createModuleItem stores fields, defaults, and starts pending", () => {
  const item = createModuleItem(db, base, TODAY);
  expect(item.course).toBe("COMP5348");
  expect(item.kind).toBe("assignment");
  expect(item.title).toBe("Assignment 1");
  expect(item.due_at).toBe("2026-09-20T23:59");
  expect(item.links).toEqual([{ label: "Brief", url: "https://canvas.example/brief" }]);
  expect(item.completed).toBe(false);
  expect(item.gcal_event_id).toBeNull();
  expect(item.sync_state).toBe("pending");
  expect(item.created_at).toBe(TODAY);
  expect(item.updated_at).toBe(TODAY);
});

test("createModuleItem defaults description to '' and links to []", () => {
  const item = createModuleItem(db, { course: "INFO5995", kind: "viva", title: "Oral", due_at: "2026-10-01T14:00" }, TODAY);
  expect(item.description).toBe("");
  expect(item.links).toEqual([]);
});

test("migrateModuleItems is idempotent", () => {
  createModuleItem(db, base, TODAY);
  migrateModuleItems(db);
  expect(listModuleItems(db).length).toBe(1);
});

test("listModuleItems orders incomplete before complete, then by due_at ascending", () => {
  const a = createModuleItem(db, { ...base, title: "later", due_at: "2026-11-01" }, TODAY);
  const b = createModuleItem(db, { ...base, title: "sooner", due_at: "2026-09-10" }, TODAY);
  createModuleItem(db, { ...base, title: "done-soonest", due_at: "2026-09-01" }, TODAY);
  toggleModuleItem(db, 3, TODAY);
  expect(listModuleItems(db).map((i) => i.title)).toEqual(["sooner", "later", "done-soonest"]);
  expect([a.id, b.id]).toEqual([1, 2]);
});

test("updateModuleItem changes fields, bumps updated_at, resets sync to pending", () => {
  const item = createModuleItem(db, base, TODAY);
  markItemSynced(db, item.id, "evt_1", "2026-09-07T10:00:00");
  const updated = updateModuleItem(db, item.id, { ...base, title: "Assignment 1 (revised)", due_at: "2026-09-21" }, "2026-09-08")!;
  expect(updated.title).toBe("Assignment 1 (revised)");
  expect(updated.due_at).toBe("2026-09-21T23:59");
  expect(updated.updated_at).toBe("2026-09-08");
  expect(updated.created_at).toBe(TODAY);
  expect(updated.sync_state).toBe("pending");
  expect(updated.sync_error).toBeNull();
  expect(updated.gcal_event_id).toBe("evt_1");
});

test("updateModuleItem on unknown id returns null", () => {
  expect(updateModuleItem(db, 9999, base, TODAY)).toBeNull();
});

test("toggleModuleItem flips completed and resets sync to pending", () => {
  const item = createModuleItem(db, base, TODAY);
  markItemSynced(db, item.id, "evt_1", "2026-09-07T10:00:00");
  const done = toggleModuleItem(db, item.id, "2026-09-09")!;
  expect(done.completed).toBe(true);
  expect(done.sync_state).toBe("pending");
  expect(done.updated_at).toBe("2026-09-09");
  const undone = toggleModuleItem(db, item.id, "2026-09-10")!;
  expect(undone.completed).toBe(false);
});

test("deleteModuleItem returns the deleted row (with event id) then removes it", () => {
  const item = createModuleItem(db, base, TODAY);
  markItemSynced(db, item.id, "evt_42", "2026-09-07T10:00:00");
  const deleted = deleteModuleItem(db, item.id)!;
  expect(deleted.gcal_event_id).toBe("evt_42");
  expect(getModuleItem(db, item.id)).toBeNull();
  expect(deleteModuleItem(db, item.id)).toBeNull();
});

test("markItemSynced / markItemSyncError set state, and listItemsNeedingSync filters", () => {
  const a = createModuleItem(db, base, TODAY);
  const b = createModuleItem(db, { ...base, title: "B" }, TODAY);
  const c = createModuleItem(db, { ...base, title: "C" }, TODAY);
  markItemSynced(db, a.id, "evt_a", "2026-09-07T10:00:00");
  markItemSyncError(db, b.id, "Calendar create failed (503)");
  const needing = listItemsNeedingSync(db).map((i) => i.title).sort();
  expect(needing).toEqual(["B", "C"]);
  expect(getModuleItem(db, a.id)!.sync_state).toBe("synced");
  expect(getModuleItem(db, a.id)!.synced_at).toBe("2026-09-07T10:00:00");
  expect(getModuleItem(db, b.id)!.sync_state).toBe("error");
  expect(getModuleItem(db, b.id)!.sync_error).toBe("Calendar create failed (503)");
  expect(getModuleItem(db, c.id)!.sync_state).toBe("pending");
});
