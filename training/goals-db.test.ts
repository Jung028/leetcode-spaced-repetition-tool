import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateGoals,
  createGoal,
  listGoals,
  updateGoal,
  deleteGoal,
  resolveGoalSeed,
  seedGoalsOnce,
  type GoalInput,
  type GoalSeedInput,
} from "./goals-db";
import type { Race } from "./races-db";

const TODAY = "2026-09-28";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db);
});

const raceRow = (overrides: Partial<Race>): Race => ({
  id: 1,
  name: "Race",
  discipline: null,
  location: null,
  date: null,
  approx_year: null,
  notes: null,
  created_at: TODAY,
  ...overrides,
});

test("createGoal stores required fields and defaults optionals to null", () => {
  const g = createGoal(db, { title: "5k PB", currentValue: "17:36", targetValue: "16:30" }, TODAY);
  expect(g.title).toBe("5k PB");
  expect(g.current_value).toBe("17:36");
  expect(g.target_value).toBe("16:30");
  expect(g.target_date).toBeNull();
  expect(g.race_id).toBeNull();
  expect(g.notes).toBeNull();
  expect(g.created_at).toBe(TODAY);
});

test("createGoal stores raceId and targetDate when given", () => {
  const g = createGoal(
    db,
    { title: "Run 1", currentValue: "40:00", targetValue: "33:30", targetDate: "2028-06-04", raceId: 7 },
    TODAY,
  );
  expect(g.target_date).toBe("2028-06-04");
  expect(g.race_id).toBe(7);
});

test("migrateGoals does not reset existing data on a second call", () => {
  createGoal(db, { title: "A", currentValue: "1", targetValue: "2" }, TODAY);
  migrateGoals(db);
  expect(listGoals(db).length).toBe(1);
});

test("listGoals orders by creation order", () => {
  createGoal(db, { title: "First", currentValue: "1", targetValue: "2" }, TODAY);
  createGoal(db, { title: "Second", currentValue: "1", targetValue: "2" }, TODAY);
  expect(listGoals(db).map((g) => g.title)).toEqual(["First", "Second"]);
});

test("listGoals does not throw when race_id points at a deleted race", () => {
  createGoal(db, { title: "Orphaned", currentValue: "1", targetValue: "2", raceId: 999 }, TODAY);
  expect(listGoals(db)[0]!.race_id).toBe(999);
});

test("updateGoal replaces all fields, accepting explicit null to clear one", () => {
  const g = createGoal(
    db,
    { title: "Original", currentValue: "1", targetValue: "2", targetDate: "2027-01-01" },
    TODAY,
  );
  const updated = updateGoal(db, g.id, { title: "Renamed", currentValue: "1", targetValue: "2", targetDate: null });
  expect(updated).toEqual({
    id: g.id,
    title: "Renamed",
    current_value: "1",
    target_value: "2",
    target_date: null,
    race_id: null,
    notes: null,
    created_at: TODAY,
  });
});

test("updateGoal on an unknown id returns null", () => {
  expect(updateGoal(db, 9999, { title: "X", currentValue: "1", targetValue: "2" })).toBeNull();
});

test("deleteGoal removes the row and returns true", () => {
  const g = createGoal(db, { title: "Delete me", currentValue: "1", targetValue: "2" }, TODAY);
  expect(deleteGoal(db, g.id)).toBe(true);
  expect(listGoals(db)).toEqual([]);
});

test("deleteGoal on an unknown id returns false and does not throw", () => {
  expect(deleteGoal(db, 9999)).toBe(false);
});

test("resolveGoalSeed maps raceName to the matching race's real id", () => {
  const races = [raceRow({ id: 5, name: "Powerman Classic — target attempt" }), raceRow({ id: 6, name: "Other race" })];
  const seed: GoalSeedInput[] = [
    { title: "Run 1", currentValue: "40:00", targetValue: "33:30", raceName: "Powerman Classic — target attempt" },
    { title: "Standalone", currentValue: "1", targetValue: "2" },
  ];
  const resolved = resolveGoalSeed(seed, races);
  expect(resolved[0]!.raceId).toBe(5);
  expect(resolved[1]!.raceId).toBeNull();
});

test("resolveGoalSeed sets raceId to null when the named race isn't found", () => {
  const resolved = resolveGoalSeed(
    [{ title: "Orphan", currentValue: "1", targetValue: "2", raceName: "Nonexistent race" }],
    [],
  );
  expect(resolved[0]!.raceId).toBeNull();
});

test("seedGoalsOnce inserts rows and guards against a second call", () => {
  const rows: GoalInput[] = [{ title: "A", currentValue: "1", targetValue: "2" }];
  expect(seedGoalsOnce(db, rows, TODAY)).toBe(1);
  expect(seedGoalsOnce(db, rows, TODAY)).toBe(0);
  expect(listGoals(db).length).toBe(1);
});
