import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateModules,
  listModules,
  getModule,
  moduleExists,
  createModule,
  renameModule,
  setModuleHidden,
  setModuleSortOrder,
  deleteModule,
  normalizeModuleCode,
} from "./modules-db";

let db: Database;
beforeEach(() => {
  db = new Database(":memory:");
  migrateModules(db, "2026-09-09");
});

test("seeds exactly the four core subjects, ordered", () => {
  const mods = listModules(db);
  expect(mods.map((m) => m.code)).toEqual(["INFO5995", "COMP5348", "INFO6007", "INFO5990"]);
  expect(mods.map((m) => m.sort_order)).toEqual([0, 1, 2, 3]);
  expect(mods.every((m) => m.hidden === false)).toBe(true);
  expect(getModule(db, "INFO5995")!.name).toBe("Introduction to Cybersecurity");
});

test("re-running the migration is a no-op", () => {
  migrateModules(db, "2026-09-09");
  migrateModules(db, "2026-09-09");
  expect(listModules(db)).toHaveLength(4);
});

test("normalizeModuleCode trims and uppercases", () => {
  expect(normalizeModuleCode("  my-course ")).toBe("MY-COURSE");
});

test("createModule adds a row at the end", () => {
  const m = createModule(db, "MY-COURSE", "My Course", "2026-09-09");
  expect(m).toMatchObject({ code: "MY-COURSE", name: "My Course", hidden: false, sort_order: 4 });
  expect(moduleExists(db, "MY-COURSE")).toBe(true);
});

test("createModule rejects a duplicate code (case-insensitive)", () => {
  expect(() => createModule(db, "info5995", "Dupe")).toThrow(/exists/i);
});

test("createModule rejects a bad code or empty name", () => {
  expect(() => createModule(db, "a", "Too short")).toThrow(/code/i);
  expect(() => createModule(db, "OK2", "   ")).toThrow(/name/i);
});

test("rename / hide / reorder / delete", () => {
  expect(renameModule(db, "INFO6007", "PM in IT")!.name).toBe("PM in IT");
  expect(setModuleHidden(db, "INFO6007", true)!.hidden).toBe(true);
  expect(setModuleSortOrder(db, "INFO6007", 9)!.sort_order).toBe(9);
  expect(deleteModule(db, "INFO6007")).toBe(true);
  expect(getModule(db, "INFO6007")).toBeNull();
  expect(renameModule(db, "NOPE", "x")).toBeNull();
});
