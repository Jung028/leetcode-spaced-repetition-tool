import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateAnnouncements,
  createAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "./announcement-db";

const TODAY = "2026-08-24";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateAnnouncements(db);
});

test("createAnnouncement defaults to not completed, with the given message", () => {
  const a = createAnnouncement(db, "Ask about Assessment 1 presentation week", TODAY);
  expect(a.message).toBe("Ask about Assessment 1 presentation week");
  expect(a.completed).toBe(false);
  expect(a.created_at).toBe(TODAY);
  expect(a.updated_at).toBe(TODAY);
});

test("migrateAnnouncements does not reset existing data on a second call", () => {
  createAnnouncement(db, "A", TODAY);
  migrateAnnouncements(db);
  expect(listAnnouncements(db).length).toBe(1);
});

test("listAnnouncements orders incomplete before completed, newest first within each group", () => {
  const first = createAnnouncement(db, "First", TODAY);
  const second = createAnnouncement(db, "Second", TODAY);
  const third = createAnnouncement(db, "Third", TODAY);
  toggleAnnouncement(db, first.id, TODAY);

  const all = listAnnouncements(db);
  expect(all.map((a) => a.message)).toEqual(["Third", "Second", "First"]);
});

test("updateAnnouncement changes the message and stamps updated_at", () => {
  const a = createAnnouncement(db, "Original", TODAY);
  const updated = updateAnnouncement(db, a.id, "Edited", "2026-08-25")!;
  expect(updated.message).toBe("Edited");
  expect(updated.updated_at).toBe("2026-08-25");
  expect(updated.created_at).toBe(TODAY);
});

test("updateAnnouncement on an unknown id returns null", () => {
  expect(updateAnnouncement(db, 9999, "x", TODAY)).toBeNull();
});

test("toggleAnnouncement flips completed", () => {
  const a = createAnnouncement(db, "Task", TODAY);
  const done = toggleAnnouncement(db, a.id, TODAY)!;
  expect(done.completed).toBe(true);

  const undone = toggleAnnouncement(db, a.id, TODAY)!;
  expect(undone.completed).toBe(false);
});

test("toggleAnnouncement on an unknown id returns null", () => {
  expect(toggleAnnouncement(db, 9999, TODAY)).toBeNull();
});

test("deleteAnnouncement removes the row and returns true", () => {
  const a = createAnnouncement(db, "Delete me", TODAY);
  expect(deleteAnnouncement(db, a.id)).toBe(true);
  expect(listAnnouncements(db)).toEqual([]);
});

test("deleteAnnouncement on an unknown id returns false and does not throw", () => {
  expect(deleteAnnouncement(db, 9999)).toBe(false);
});
