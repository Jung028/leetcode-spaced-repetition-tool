import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateDeadlines,
  completeDeadline,
  uncompleteDeadline,
  listDeadlineCompletions,
} from "./deadline-db";

const TODAY = "2026-09-02";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateDeadlines(db);
});

test("completeDeadline records the id with the given date", () => {
  completeDeadline(db, "INFO5995|Project 1|2026-09-13", TODAY);
  expect(listDeadlineCompletions(db)).toEqual([
    { id: "INFO5995|Project 1|2026-09-13", completed_at: TODAY },
  ]);
});

test("completeDeadline is idempotent and keeps the original date", () => {
  completeDeadline(db, "INFO5995|Project 1|2026-09-13", TODAY);
  completeDeadline(db, "INFO5995|Project 1|2026-09-13", "2026-09-05");
  expect(listDeadlineCompletions(db)).toEqual([
    { id: "INFO5995|Project 1|2026-09-13", completed_at: TODAY },
  ]);
});

test("uncompleteDeadline removes the row and returns true; unknown id returns false", () => {
  completeDeadline(db, "INFO5995|Project 1|2026-09-13", TODAY);
  expect(uncompleteDeadline(db, "INFO5995|Project 1|2026-09-13")).toBe(true);
  expect(listDeadlineCompletions(db)).toEqual([]);
  expect(uncompleteDeadline(db, "nope")).toBe(false);
});

test("migrateDeadlines does not reset existing data on a second call", () => {
  completeDeadline(db, "INFO5995|Project 1", TODAY);
  migrateDeadlines(db);
  expect(listDeadlineCompletions(db)).toEqual([
    { id: "INFO5995|Project 1", completed_at: TODAY },
  ]);
});

test("migrateDeadlines collapses a legacy course|title|date id to course|title", () => {
  db.exec(
    `INSERT INTO deadline_completions (id, completed_at) VALUES ('INFO5995|Project 1|2026-09-13', '2026-09-01')`,
  );
  migrateDeadlines(db);
  expect(listDeadlineCompletions(db)).toEqual([
    { id: "INFO5995|Project 1", completed_at: "2026-09-01" },
  ]);
});

test("migrateDeadlines keeps a single row when two legacy ids collapse to one key", () => {
  db.exec(`INSERT INTO deadline_completions (id, completed_at) VALUES
    ('COMP5348|Assignment 1|2026-09-27', '2026-09-01'),
    ('COMP5348|Assignment 1|2026-10-04', '2026-09-05')`);
  migrateDeadlines(db);
  const rows = listDeadlineCompletions(db);
  expect(rows.length).toBe(1);
  expect(rows[0]!.id).toBe("COMP5348|Assignment 1");
});
