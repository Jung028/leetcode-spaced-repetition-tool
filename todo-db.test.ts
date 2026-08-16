import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateTodo,
  createTodo,
  listDueTodos,
  countOverdueTodos,
  countTodosCompletedToday,
  listTodosCompletedToday,
  toggleTodo,
  deleteTodo,
} from "./todo-db";

const TODAY = "2026-08-16";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateTodo(db);
});

test("createTodo defaults to not done, with the given task/due date/notes", () => {
  const t = createTodo(db, "Write the SA for project", TODAY, "https://notion.so/x", TODAY);
  expect(t.task).toBe("Write the SA for project");
  expect(t.due_date).toBe(TODAY);
  expect(t.notes).toBe("https://notion.so/x");
  expect(t.done).toBe(false);
  expect(t.done_at).toBeNull();
  expect(t.created_at).toBe(TODAY);
});

test("createTodo accepts null notes", () => {
  const t = createTodo(db, "No notes here", TODAY, null, TODAY);
  expect(t.notes).toBeNull();
});

test("migrateTodo does not reset existing data on a second call", () => {
  createTodo(db, "A", TODAY, null, TODAY);
  migrateTodo(db);
  expect(listDueTodos(db, TODAY).length).toBe(1);
});

test("listDueTodos returns undone todos due today or earlier, ordered by due date", () => {
  createTodo(db, "Later", "2026-08-20", null, TODAY);
  createTodo(db, "Overdue", "2026-08-10", null, TODAY);
  createTodo(db, "Today", TODAY, null, TODAY);
  const due = listDueTodos(db, TODAY);
  expect(due.map((t) => t.task)).toEqual(["Overdue", "Today"]);
});

test("listDueTodos excludes done todos", () => {
  const t = createTodo(db, "Done already", TODAY, null, TODAY);
  toggleTodo(db, t.id, TODAY);
  expect(listDueTodos(db, TODAY)).toEqual([]);
});

test("countOverdueTodos counts only undone todos strictly before today", () => {
  createTodo(db, "Today", TODAY, null, TODAY);
  createTodo(db, "Overdue", "2026-08-10", null, TODAY);
  const doneOverdue = createTodo(db, "Overdue but done", "2026-08-05", null, TODAY);
  toggleTodo(db, doneOverdue.id, TODAY);
  expect(countOverdueTodos(db, TODAY)).toBe(1);
});

test("toggleTodo flips done and stamps/clears done_at", () => {
  const t = createTodo(db, "Task", TODAY, null, TODAY);
  const done = toggleTodo(db, t.id, TODAY)!;
  expect(done.done).toBe(true);
  expect(done.done_at).toBe(TODAY);

  const undone = toggleTodo(db, t.id, TODAY)!;
  expect(undone.done).toBe(false);
  expect(undone.done_at).toBeNull();
});

test("toggleTodo on an unknown id returns null", () => {
  expect(toggleTodo(db, 9999, TODAY)).toBeNull();
});

test("countTodosCompletedToday and listTodosCompletedToday only count today's completions", () => {
  const t1 = createTodo(db, "Done today", TODAY, null, TODAY);
  toggleTodo(db, t1.id, TODAY);
  const t2 = createTodo(db, "Done yesterday", TODAY, null, TODAY);
  toggleTodo(db, t2.id, "2026-08-15");

  expect(countTodosCompletedToday(db, TODAY)).toBe(1);
  expect(listTodosCompletedToday(db, TODAY).map((t) => t.task)).toEqual(["Done today"]);
});

test("deleteTodo removes the row and returns true", () => {
  const t = createTodo(db, "Delete me", TODAY, null, TODAY);
  const deleted = deleteTodo(db, t.id);
  expect(deleted).toBe(true);
  expect(listDueTodos(db, TODAY)).toEqual([]);
});

test("deleteTodo on an unknown id returns false and does not throw", () => {
  expect(deleteTodo(db, 9999)).toBe(false);
});
