import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateModuleItems,
  seedDeadlineItems,
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
  countItemsForModule,
  deleteItemsForModule,
  MODULE_ITEM_KINDS,
  type ModuleItemInput,
} from "./module-items-db";
import { SEMESTER_DEADLINES, deadlineId } from "./semester-deadlines";

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
  migrateModuleItems(db, TODAY);
  // These shared-fixture tests predate the legacy-deadline seed and exercise
  // item CRUD in isolation. Reset to an empty table (and id counter) so the
  // 12 seeded rows don't perturb their counts/ordering assertions.
  db.exec("DELETE FROM module_items; DELETE FROM sqlite_sequence WHERE name = 'module_items';");
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

test("MODULE_ITEM_KINDS includes quiz and exam", () => {
  expect(MODULE_ITEM_KINDS).toEqual(["assignment", "presentation", "viva", "quiz", "exam", "other"]);
});

test("weight round-trips through create and update", () => {
  const db = new Database(":memory:");
  migrateModuleItems(db, "2026-09-09");
  const made = createModuleItem(
    db,
    { course: "INFO5995", kind: "assignment", title: "P1", due_at: "2026-09-13", weight: "20%" },
    "2026-09-09",
  );
  expect(made.weight).toBe("20%");
  const upd = updateModuleItem(
    db,
    made.id,
    { course: "INFO5995", kind: "assignment", title: "P1", due_at: "2026-09-13" }, // no weight
    "2026-09-10",
  )!;
  expect(upd.weight).toBeNull();
});

test("seedDeadlineItems inserts every SEMESTER_DEADLINES row once, with weight + kind", () => {
  const db = new Database(":memory:");
  migrateModuleItems(db, "2026-09-09"); // calls the seed internally
  const items = listModuleItems(db);
  expect(items).toHaveLength(SEMESTER_DEADLINES.length);
  const viva = items.find((i) => i.title.includes("Viva"))!;
  expect(viva.kind).toBe("viva");
  const quiz = items.find((i) => i.title.includes("feedback quiz"))!;
  expect(quiz.kind).toBe("quiz");
  const p1 = items.find((i) => i.title === "Project 1")!;
  expect(p1.kind).toBe("assignment");
  expect(p1.weight).toBe("20%");
  // re-running does not duplicate
  seedDeadlineItems(db, "2026-09-09");
  expect(listModuleItems(db)).toHaveLength(SEMESTER_DEADLINES.length);
});

test("seed carries over an existing deadline_completions tick", () => {
  const db = new Database(":memory:");
  db.exec(`CREATE TABLE deadline_completions (id TEXT PRIMARY KEY, completed_at TEXT NOT NULL)`);
  const done = SEMESTER_DEADLINES[0]!;
  db.query(`INSERT INTO deadline_completions (id, completed_at) VALUES (?, ?)`).run(
    deadlineId(done),
    "2026-08-29",
  );
  migrateModuleItems(db, "2026-09-09");
  const seeded = listModuleItems(db).find((i) => i.title === done.title)!;
  expect(seeded.completed).toBe(true);
});

test("deleting a seeded item then re-seeding does NOT resurrect it", () => {
  const db = new Database(":memory:");
  migrateModuleItems(db, "2026-09-09");
  const target = listModuleItems(db)[0]!;
  deleteItemsForModule(db, target.course); // nukes at least that row
  const remaining = listModuleItems(db).length;
  seedDeadlineItems(db, "2026-09-09");
  expect(listModuleItems(db)).toHaveLength(remaining);
});

test("countItemsForModule / deleteItemsForModule", () => {
  const db = new Database(":memory:");
  migrateModuleItems(db, "2026-09-09");
  createModuleItem(
    db,
    { course: "COMP5348", kind: "other", title: "X", due_at: "2026-10-01" },
    "2026-09-09",
  );
  const before = countItemsForModule(db, "COMP5348");
  expect(before).toBeGreaterThanOrEqual(1);
  const deleted = deleteItemsForModule(db, "COMP5348");
  expect(deleted).toHaveLength(before);
  expect(countItemsForModule(db, "COMP5348")).toBe(0);
});
