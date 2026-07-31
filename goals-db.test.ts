import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateGoals, createProject, listProjects, getProjectDetail } from "./goals-db";

const TODAY = "2026-07-31";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db);
});

test("createProject starts unarchived with no steps", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  expect(p.title).toBe("Complete tracely onboarding");
  expect(p.deadline).toBe("2026-08-10");
  expect(p.created_at).toBe(TODAY);
  expect(p.archived).toBe(false);
});

test("migrateGoals does not reset existing data on a second call", () => {
  createProject(db, "A", "2026-08-10", TODAY);
  migrateGoals(db);
  expect(listProjects(db).length).toBe(1);
});

test("listProjects returns only active (non-archived) projects, ordered by deadline", () => {
  createProject(db, "Later", "2026-09-01", TODAY);
  createProject(db, "Sooner", "2026-08-01", TODAY);
  expect(listProjects(db).map((p) => p.title)).toEqual(["Sooner", "Later"]);
});

test("getProjectDetail returns the project with an empty step list and 0 progress", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const detail = getProjectDetail(db, p.id)!;
  expect(detail.steps).toEqual([]);
  expect(detail.progress).toBe(0);
});

test("getProjectDetail on an unknown id returns null", () => {
  expect(getProjectDetail(db, 9999)).toBeNull();
});
