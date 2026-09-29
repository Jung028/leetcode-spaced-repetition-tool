import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateGoals, createGoal, listGoals, updateGoal, deleteGoal, toggleGoal, seedGoalsOnce } from "./goals-db";

const TODAY = "2026-09-28";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db);
});

test("createGoal defaults to not done, with the given text", () => {
  const g = createGoal(db, "10K: 38:47 → 36:30", TODAY);
  expect(g.text).toBe("10K: 38:47 → 36:30");
  expect(g.done).toBe(false);
  expect(g.done_at).toBeNull();
  expect(g.created_at).toBe(TODAY);
});

test("migrateGoals does not reset existing data on a second call", () => {
  createGoal(db, "A", TODAY);
  migrateGoals(db);
  expect(listGoals(db).length).toBe(1);
});

test("migrateGoals rebuilds the earlier structured (title/current/target) shape into a text line", () => {
  const legacy = new Database(":memory:");
  legacy.exec(`
    CREATE TABLE goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      current_value TEXT NOT NULL,
      target_value TEXT NOT NULL,
      target_date TEXT,
      race_id INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);
  legacy
    .query(
      `INSERT INTO goals (title, current_value, target_value, target_date, race_id, notes, created_at)
       VALUES ('5K', '17:36', '16:00', NULL, NULL, NULL, ?)`,
    )
    .run(TODAY);

  migrateGoals(legacy);

  const goals = listGoals(legacy);
  expect(goals.length).toBe(1);
  expect(goals[0]!.text).toBe("5K: 17:36 → 16:00");
  expect(goals[0]!.done).toBe(false);
  expect(goals[0]!.created_at).toBe(TODAY);
});

test("listGoals orders by creation order", () => {
  createGoal(db, "First", TODAY);
  createGoal(db, "Second", TODAY);
  expect(listGoals(db).map((g) => g.text)).toEqual(["First", "Second"]);
});

test("toggleGoal flips done and stamps/clears done_at", () => {
  const g = createGoal(db, "Task", TODAY);
  const done = toggleGoal(db, g.id, TODAY)!;
  expect(done.done).toBe(true);
  expect(done.done_at).toBe(TODAY);

  const undone = toggleGoal(db, g.id, TODAY)!;
  expect(undone.done).toBe(false);
  expect(undone.done_at).toBeNull();
});

test("toggleGoal on an unknown id returns null", () => {
  expect(toggleGoal(db, 9999, TODAY)).toBeNull();
});

test("updateGoal replaces the text and returns the updated row", () => {
  const g = createGoal(db, "Original", TODAY);
  const updated = updateGoal(db, g.id, "Renamed");
  expect(updated).toEqual({ id: g.id, text: "Renamed", done: false, done_at: null, created_at: TODAY });
});

test("updateGoal on an unknown id returns null", () => {
  expect(updateGoal(db, 9999, "X")).toBeNull();
});

test("deleteGoal removes the row and returns true", () => {
  const g = createGoal(db, "Delete me", TODAY);
  expect(deleteGoal(db, g.id)).toBe(true);
  expect(listGoals(db)).toEqual([]);
});

test("deleteGoal on an unknown id returns false and does not throw", () => {
  expect(deleteGoal(db, 9999)).toBe(false);
});

test("seedGoalsOnce inserts rows and guards against a second call", () => {
  const rows = ["A", "B"];
  expect(seedGoalsOnce(db, rows, TODAY)).toBe(2);
  expect(seedGoalsOnce(db, rows, TODAY)).toBe(0);
  expect(listGoals(db).length).toBe(2);
});
