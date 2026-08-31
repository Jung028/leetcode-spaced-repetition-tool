# Theory→Todo Replacement + Goals Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the spaced-repetition "Theory" tab (150-concept curriculum, category tags, review ladder) with a plain "Todo" tab (task, due date, optional link/description, done checkbox), and remove the "Goals" tab and its data entirely.

**Architecture:** New `todo-db.ts`/`todo-api.ts`/`TodoApp.tsx` trio, modeled on the existing per-feature module pattern (see `goals-db.ts`/`goals-api.ts`/`GoalsApp.tsx`) but with no scheduling/release-gate/category machinery — just a flat list with a due date and a done flag. `theory-*` files and `goals-*` files are deleted. `home-api.ts`, `HomeApp.tsx`, `frontend.tsx`, and `index.ts` are updated to wire in Todo and drop Theory/Goals.

**Tech Stack:** Bun, `bun:sqlite`, React (HTML-import bundling, no Vite), `bun test`.

## Global Constraints

- Use `bun:sqlite`, not `better-sqlite3`. Use `bun test`, not jest/vitest.
- Follow existing code style: no comments except where a non-obvious WHY needs explaining (see existing files' comment style as the bar).
- Every task that touches server or db code ends with `bun test <file>` passing; the final task runs the whole suite plus `tsc --noEmit`.
- Do not touch CSS (`index.css`) — all needed classes (`stats`, `board`, `board-row`, `btn`, `tag`, `goal-deadline`, `modal-*`, etc.) already exist and are shared across features; no new classes are required.
- Do not modify anything under `.claude/worktrees/` — those are unrelated, unmerged branches, not part of this change.

---

### Task 1: `todo-db.ts` — schema and CRUD

**Files:**
- Create: `todo-db.ts`
- Test: `todo-db.test.ts`

**Interfaces:**
- Produces: `export interface Todo { id: number; task: string; due_date: string; notes: string | null; done: boolean; done_at: string | null; created_at: string }`
- Produces: `migrateTodo(db: Database): void`
- Produces: `createTodo(db: Database, task: string, dueDate: string, notes: string | null, today: string): Todo`
- Produces: `listDueTodos(db: Database, today: string): Todo[]`
- Produces: `countOverdueTodos(db: Database, today: string): number`
- Produces: `countTodosCompletedToday(db: Database, today: string): number`
- Produces: `listTodosCompletedToday(db: Database, today: string): Todo[]`
- Produces: `toggleTodo(db: Database, id: number, today: string): Todo | null`
- Produces: `deleteTodo(db: Database, id: number): void`

- [ ] **Step 1: Write the failing test**

```ts
// todo-db.test.ts
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

test("deleteTodo removes the row", () => {
  const t = createTodo(db, "Delete me", TODAY, null, TODAY);
  deleteTodo(db, t.id);
  expect(listDueTodos(db, TODAY)).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test todo-db.test.ts`
Expected: FAIL — `Cannot find module './todo-db'` (file doesn't exist yet)

- [ ] **Step 3: Write the implementation**

```ts
// todo-db.ts
import type { Database } from "bun:sqlite";

export interface Todo {
  id: number;
  task: string;
  due_date: string;
  notes: string | null;
  done: boolean;
  done_at: string | null;
  created_at: string;
}

interface TodoRow {
  id: number;
  task: string;
  due_date: string;
  notes: string | null;
  done: number;
  done_at: string | null;
  created_at: string;
}

const toTodo = (row: TodoRow): Todo => ({ ...row, done: row.done === 1 });

export function migrateTodo(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL,
      due_date TEXT NOT NULL,
      notes TEXT,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export function createTodo(
  db: Database,
  task: string,
  dueDate: string,
  notes: string | null,
  today: string,
): Todo {
  const row = db
    .query(
      `INSERT INTO todos (task, due_date, notes, done, done_at, created_at)
       VALUES (?, ?, ?, 0, NULL, ?) RETURNING *`,
    )
    .get(task, dueDate, notes, today) as TodoRow;
  return toTodo(row);
}

export function listDueTodos(db: Database, today: string): Todo[] {
  return (
    db
      .query(`SELECT * FROM todos WHERE done = 0 AND due_date <= ? ORDER BY due_date, id`)
      .all(today) as TodoRow[]
  ).map(toTodo);
}

export function countOverdueTodos(db: Database, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM todos WHERE done = 0 AND due_date < ?`)
    .get(today) as { n: number };
  return row.n;
}

export function countTodosCompletedToday(db: Database, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM todos WHERE done = 1 AND done_at = ?`)
    .get(today) as { n: number };
  return row.n;
}

export function listTodosCompletedToday(db: Database, today: string): Todo[] {
  return (
    db.query(`SELECT * FROM todos WHERE done = 1 AND done_at = ? ORDER BY id`).all(today) as TodoRow[]
  ).map(toTodo);
}

export function toggleTodo(db: Database, id: number, today: string): Todo | null {
  const current = db.query(`SELECT * FROM todos WHERE id = ?`).get(id) as TodoRow | null;
  if (!current) return null;
  const nowDone = current.done === 0;
  const row = db
    .query(`UPDATE todos SET done = ?, done_at = ? WHERE id = ? RETURNING *`)
    .get(nowDone ? 1 : 0, nowDone ? today : null, id) as TodoRow;
  return toTodo(row);
}

export function deleteTodo(db: Database, id: number): void {
  db.query(`DELETE FROM todos WHERE id = ?`).run(id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test todo-db.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: Commit**

```bash
git add todo-db.ts todo-db.test.ts
git commit -m "feat: add todo-db module"
```

---

### Task 2: `todo-api.ts` — HTTP routes

**Files:**
- Create: `todo-api.ts`
- Test: `todo-api.test.ts`

**Interfaces:**
- Consumes: everything from Task 1 (`todo-db.ts`)
- Produces: `todoApiRoutes(db: Database)` returning a Bun `routes` object:
  - `GET /api/todo/due` → `{ due: Todo[], stats: { dueCount, overdueCount, completedToday } }`
  - `POST /api/todo` → body `{ task, dueDate, notes? }` → `201 Todo`
  - `POST /api/todo/:id/toggle` → `Todo`
  - `DELETE /api/todo/:id` → `Todo` deleted-row echo, or `404`
  - `GET /api/todo/completed-today` → `Todo[]`

- [ ] **Step 1: Write the failing test**

```ts
// todo-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateTodo } from "./todo-db";
import { todoApiRoutes } from "./todo-api";
import { localToday } from "./scheduling";

const TODAY = localToday();
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateTodo(db);
  server = Bun.serve({ port: 0, routes: todoApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("POST /api/todo creates a todo and returns 201", async () => {
  const res = await fetch(`${base}/api/todo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "Write the SA", dueDate: TODAY, notes: "https://x.com" }),
  });
  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.task).toBe("Write the SA");
  expect(body.notes).toBe("https://x.com");
});

test("POST /api/todo requires task and dueDate", async () => {
  const res = await fetch(`${base}/api/todo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "", dueDate: "" }),
  });
  expect(res.status).toBe(400);
});

test("POST /api/todo defaults missing notes to null", async () => {
  const res = await fetch(`${base}/api/todo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "No notes", dueDate: TODAY }),
  });
  const body = await res.json();
  expect(body.notes).toBeNull();
});

test("GET /api/todo/due returns due todos and stats", async () => {
  await fetch(`${base}/api/todo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ task: "Due today", dueDate: TODAY }),
  });
  const res = await fetch(`${base}/api/todo/due`);
  const body = await res.json();
  expect(body.due.length).toBe(1);
  expect(body.stats).toEqual({ dueCount: 1, overdueCount: 0, completedToday: 0 });
});

test("POST /api/todo/:id/toggle marks done and updates stats", async () => {
  const created = await (
    await fetch(`${base}/api/todo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "Task", dueDate: TODAY }),
    })
  ).json();

  const toggled = await (await fetch(`${base}/api/todo/${created.id}/toggle`, { method: "POST" })).json();
  expect(toggled.done).toBe(true);

  const due = await (await fetch(`${base}/api/todo/due`)).json();
  expect(due.due.length).toBe(0);
  expect(due.stats.completedToday).toBe(1);
});

test("POST /api/todo/:id/toggle on unknown id returns 404", async () => {
  const res = await fetch(`${base}/api/todo/9999/toggle`, { method: "POST" });
  expect(res.status).toBe(404);
});

test("DELETE /api/todo/:id removes it", async () => {
  const created = await (
    await fetch(`${base}/api/todo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "Task", dueDate: TODAY }),
    })
  ).json();

  const res = await fetch(`${base}/api/todo/${created.id}`, { method: "DELETE" });
  expect(res.status).toBe(200);

  const due = await (await fetch(`${base}/api/todo/due`)).json();
  expect(due.due.length).toBe(0);
});

test("GET /api/todo/completed-today returns only today's completions", async () => {
  const created = await (
    await fetch(`${base}/api/todo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "Task", dueDate: TODAY }),
    })
  ).json();
  await fetch(`${base}/api/todo/${created.id}/toggle`, { method: "POST" });

  const res = await fetch(`${base}/api/todo/completed-today`);
  const body = await res.json();
  expect(body.length).toBe(1);
  expect(body[0].task).toBe("Task");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test todo-api.test.ts`
Expected: FAIL — `Cannot find module './todo-api'`

- [ ] **Step 3: Write the implementation**

```ts
// todo-api.ts
import type { Database } from "bun:sqlite";
import {
  createTodo,
  deleteTodo,
  listDueTodos,
  countOverdueTodos,
  countTodosCompletedToday,
  listTodosCompletedToday,
  toggleTodo,
} from "./todo-db";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

export function todoApiRoutes(db: Database) {
  return {
    "/api/todo": {
      POST: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as
          | { task?: unknown; dueDate?: unknown; notes?: unknown }
          | null;
        const task = typeof body?.task === "string" ? body.task.trim() : "";
        const dueDate = typeof body?.dueDate === "string" ? body.dueDate.trim() : "";
        const notes = typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
        if (!task || !dueDate) return json({ error: "task and dueDate are required" }, 400);
        return json(createTodo(db, task, dueDate, notes, localToday()), 201);
      },
    },
    "/api/todo/due": {
      GET: () => {
        const today = localToday();
        const due = listDueTodos(db, today);
        return json({
          due,
          stats: {
            dueCount: due.length,
            overdueCount: countOverdueTodos(db, today),
            completedToday: countTodosCompletedToday(db, today),
          },
        });
      },
    },
    "/api/todo/completed-today": {
      GET: () => json(listTodosCompletedToday(db, localToday())),
    },
    "/api/todo/:id/toggle": {
      POST: (req: { params: { id: string } }) => {
        const updated = toggleTodo(db, Number(req.params.id), localToday());
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
    "/api/todo/:id": {
      DELETE: (req: { params: { id: string } }) => {
        deleteTodo(db, Number(req.params.id));
        return json({ ok: true });
      },
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test todo-api.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add todo-api.ts todo-api.test.ts
git commit -m "feat: add todo-api routes"
```

---

### Task 3: `TodoApp.tsx` — frontend

**Files:**
- Create: `TodoApp.tsx`

**Interfaces:**
- Consumes: `/api/todo/due`, `POST /api/todo`, `POST /api/todo/:id/toggle`, `DELETE /api/todo/:id`, `GET /api/todo/completed-today` (Task 2)
- Produces: `export default function TodoApp({ openTodoId, onOpened }: { openTodoId?: number | null; onOpened?: () => void } = {})` — a React component matching the prop shape `frontend.tsx` already passes to `TheoryApp`/`GoalsApp`/`ExamApp` (`open<X>Id`/`onOpened`), so Task 5's wiring is a straight swap. Todo has no per-item detail view, so `openTodoId` just triggers `onOpened()` on mount (nothing to drill into).

- [ ] **Step 1: Write the implementation**

There's no meaningful unit test for a presentational React component in this codebase (none of `TheoryApp.tsx`/`GoalsApp.tsx`/`ExamApp.tsx` have `.test.tsx` files) — verification here is the manual smoke check in Task 8. Write the component directly:

```tsx
// TodoApp.tsx
import React, { useEffect, useState } from "react";
import type { Todo } from "./todo-db";
import { localToday } from "./scheduling";

interface Stats {
  dueCount: number;
  overdueCount: number;
  completedToday: number;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong.";

const api = {
  due: () => fetch("/api/todo/due").then((r) => json<{ due: Todo[]; stats: Stats }>(r)),
  create: (task: string, dueDate: string, notes: string | null) =>
    fetch("/api/todo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task, dueDate, notes }),
    }).then((r) => json<Todo>(r)),
  toggle: (id: number) => fetch(`/api/todo/${id}/toggle`, { method: "POST" }).then((r) => json<Todo>(r)),
  remove: (id: number) => fetch(`/api/todo/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
  completedToday: () => fetch("/api/todo/completed-today").then((r) => json<Todo[]>(r)),
};

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

type StatModal = "due" | "overdue" | "completed" | null;

function TodoListModal({
  title,
  emptyMessage,
  entries,
  onClose,
}: {
  title: string;
  emptyMessage: string;
  entries: Todo[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sorted = [...entries].sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {sorted.length === 0 ? (
          <p className="board-empty">{emptyMessage}</p>
        ) : (
          <ul className="modal-rows">
            {sorted.map((t) => (
              <li key={t.id}>
                <div className="modal-row">
                  <span className="modal-row-date">{t.due_date}</span>
                  <span className="modal-row-title">{t.task}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TodoStats({
  stats,
  due,
  onError,
}: {
  stats: Stats;
  due: Todo[];
  onError: (message: string | null) => void;
}) {
  const [openModal, setOpenModal] = useState<StatModal>(null);
  const [completedList, setCompletedList] = useState<Todo[] | null>(null);
  const today = localToday();

  useEffect(() => {
    setCompletedList(null);
  }, [stats.completedToday]);

  const overdue = due.filter((t) => t.due_date < today);

  const openCompleted = () => {
    setOpenModal("completed");
    if (completedList === null) {
      onError(null);
      api.completedToday().then(setCompletedList).catch((err) => onError(errorMessage(err)));
    }
  };

  return (
    <>
      <div className="stats stats-3">
        <button className="stat stat-due" onClick={() => setOpenModal("due")}>
          <span className="stat-num">{stats.dueCount}</span>
          <span className="stat-label">Due today</span>
        </button>
        <button className="stat stat-overdue" onClick={() => setOpenModal("overdue")}>
          <span className="stat-num">{stats.overdueCount}</span>
          <span className="stat-label">Overdue</span>
        </button>
        <button className="stat stat-completed" onClick={openCompleted}>
          <span className="stat-num">{stats.completedToday}</span>
          <span className="stat-label">Completed today</span>
        </button>
      </div>
      {openModal === "due" && (
        <TodoListModal title="Due today" emptyMessage="Nothing due today." entries={due} onClose={() => setOpenModal(null)} />
      )}
      {openModal === "overdue" && (
        <TodoListModal title="Overdue" emptyMessage="Nothing overdue." entries={overdue} onClose={() => setOpenModal(null)} />
      )}
      {openModal === "completed" && (
        <TodoListModal
          title="Completed today"
          emptyMessage="Nothing completed today yet."
          entries={completedList ?? []}
          onClose={() => setOpenModal(null)}
        />
      )}
    </>
  );
}

function NewTodoForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => Promise<void> }) {
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState(localToday());
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!task.trim() || !dueDate) {
          setError("Task and due date are both required.");
          return;
        }
        try {
          await api.create(task.trim(), dueDate, notes.trim() || null);
          await onCreated();
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <label>
        Task
        <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Write the SA for project" autoFocus />
      </label>
      <label>
        When to complete
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" />
      </label>
      <label>
        Link / description
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="https://... or a short note" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Add todo</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function TodoBoard({
  due,
  today,
  onToggle,
  onDelete,
}: {
  due: Todo[];
  today: string;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <section className="board" aria-label="Todo due today">
      <div className="section-head">
        <h2>Due today</h2>
        <span className="board-count">{due.length}</span>
      </div>
      {due.length === 0 ? (
        <p className="board-empty">Nothing due. Add a todo to get started.</p>
      ) : (
        <ul className="board-rows">
          {due.map((t, i) => {
            const overdue = daysBetween(t.due_date, today);
            const color = overdue > 0 ? "red" : "gold";
            return (
              <li key={t.id} style={{ animationDelay: `${i * 60}ms` }}>
                <label
                  className="board-row board-row-main step-row"
                  style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                >
                  <input type="checkbox" checked={false} onChange={() => onToggle(t.id)} />
                  <span className="tag">{overdue > 0 ? `${overdue}d late` : "due"}</span>
                  <span className="board-title">{t.task}</span>
                  {t.notes &&
                    (isValidUrl(t.notes) ? (
                      <a
                        className="board-row-review"
                        href={t.notes}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Open link"
                      >
                        ↗
                      </a>
                    ) : (
                      <span className="goal-deadline">{t.notes}</span>
                    ))}
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(t.id);
                    }}
                  >
                    Delete
                  </button>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function TodoApp({
  openTodoId,
  onOpened,
}: {
  openTodoId?: number | null;
  onOpened?: () => void;
} = {}) {
  const today = localToday();
  const [due, setDue] = useState<Todo[]>([]);
  const [stats, setStats] = useState<Stats>({ dueCount: 0, overdueCount: 0, completedToday: 0 });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return api
      .due()
      .then(({ due, stats }) => { setDue(due); setStats(stats); })
      .catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  // Todo has no per-item detail view — a deep link from Home just needs to
  // land on this tab, so immediately signal it's been "opened".
  useEffect(() => {
    if (openTodoId != null) onOpened?.();
  }, [openTodoId]);

  const toggle = (id: number) => {
    setError(null);
    api.toggle(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  const remove = (id: number) => {
    if (!confirm("Delete this todo?")) return;
    setError(null);
    api.remove(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  return (
    <div className="todo">
      <TodoStats stats={stats} due={due} onError={setError} />
      {error && <p className="form-error">{error}</p>}

      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add todo</button>
      </div>

      {adding && (
        <NewTodoForm
          onCancel={() => setAdding(false)}
          onCreated={async () => {
            setAdding(false);
            await refresh();
          }}
        />
      )}

      <TodoBoard due={due} today={today} onToggle={toggle} onDelete={remove} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add TodoApp.tsx
git commit -m "feat: add TodoApp frontend"
```

---

### Task 4: Wire Todo into the server, drop Theory/Goals server wiring

**Files:**
- Modify: `index.ts`
- Modify: `home-api.ts`

**Interfaces:**
- Consumes: `migrateTodo`, `todoApiRoutes` (Tasks 1–2)
- Produces: `home-api.ts` exports the same `HomeStats`/`DueItem`/`homeApiRoutes` shape as before, but `DueSource` narrows to `"leetcode" | "todo" | "exam"` and every `source: "theory"` / `source: "goals"` item is replaced by `source: "todo"`.

- [ ] **Step 1: Update `index.ts`**

Replace:

```ts
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";
```

with:

```ts
import { migrateTodo } from "./todo-db";
import { todoApiRoutes } from "./todo-api";
```

Replace:

```ts
const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
migrateTheory(db, localToday());
migrateGoals(db, localToday());
migrateExam(db, localToday());
```

with:

```ts
const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
// One-time cleanup: the Goals feature (projects/steps) was removed along
// with its data — see docs/superpowers/plans/2026-08-16-theory-to-todo-and-goals-removal.md.
// IF EXISTS makes this a no-op on every subsequent startup.
db.exec(`DROP TABLE IF EXISTS project_steps; DROP TABLE IF EXISTS projects;`);
migrateTodo(db);
migrateExam(db, localToday());
```

Replace:

```ts
    ...apiRoutes(db),
    ...theoryApiRoutes(db),
    ...goalsApiRoutes(db),
    ...examApiRoutes(db),
```

with:

```ts
    ...apiRoutes(db),
    ...todoApiRoutes(db),
    ...examApiRoutes(db),
```

- [ ] **Step 2: Update `home-api.ts`**

Replace the import block:

```ts
import { listDueTheory, countTheoryReviewsToday, listTheoryCompletedToday } from "./theory-db";
import { listDueSteps, countStepsCompletedToday, listStepsCompletedOn } from "./goals-db";
```

with:

```ts
import { listDueTodos, countTodosCompletedToday, listTodosCompletedToday } from "./todo-db";
```

Replace:

```ts
export type DueSource = "leetcode" | "theory" | "goals" | "exam";
```

with:

```ts
export type DueSource = "leetcode" | "todo" | "exam";
```

Replace the `theoryDue`/`goalsDue` functions:

```ts
function theoryDue(db: Database, today: string): DueItem[] {
  return listDueTheory(db, today).map((entry) => ({
    source: "theory" as const,
    id: entry.concept_day,
    title: entry.question,
    subtitle: entry.category,
    dueDate: entry.next_review,
    overdueDays: overdueDays(entry.next_review, today),
    linkId: entry.concept_day,
  }));
}

function goalsDue(db: Database, today: string): DueItem[] {
  return listDueSteps(db, today).map((step) => ({
    source: "goals" as const,
    id: step.id,
    title: step.label,
    subtitle: step.project_title,
    dueDate: step.due_date,
    overdueDays: overdueDays(step.due_date, today),
    linkId: step.project_id,
  }));
}
```

with a single `todoDue`:

```ts
function todoDue(db: Database, today: string): DueItem[] {
  return listDueTodos(db, today).map((t) => ({
    source: "todo" as const,
    id: t.id,
    title: t.task,
    subtitle: t.notes ?? "",
    dueDate: t.due_date,
    overdueDays: overdueDays(t.due_date, today),
    linkId: t.id,
  }));
}
```

Replace the `theoryCompletedToday`/`goalsCompletedToday` functions:

```ts
function theoryCompletedToday(db: Database, today: string): DueItem[] {
  return listTheoryCompletedToday(db, today).map((entry) => ({
    source: "theory" as const,
    id: entry.concept_day,
    title: entry.question,
    subtitle: entry.category,
    dueDate: today,
    overdueDays: 0,
    linkId: entry.concept_day,
  }));
}

function goalsCompletedToday(db: Database, today: string): DueItem[] {
  return listStepsCompletedOn(db, today).map((step) => ({
    source: "goals" as const,
    id: step.id,
    title: step.label,
    subtitle: step.project_title,
    dueDate: today,
    overdueDays: 0,
    linkId: step.project_id,
  }));
}
```

with:

```ts
function todoCompletedToday(db: Database, today: string): DueItem[] {
  return listTodosCompletedToday(db, today).map((t) => ({
    source: "todo" as const,
    id: t.id,
    title: t.task,
    subtitle: t.notes ?? "",
    dueDate: today,
    overdueDays: 0,
    linkId: t.id,
  }));
}
```

In `homeStats`, replace:

```ts
  const items = [
    ...leetcodeDue(db, today),
    ...leetcode150Due(db, today, leetcode150),
    ...theoryDue(db, today),
    ...goalsDue(db, today),
    ...examDue(db, today),
  ];
```

with:

```ts
  const items = [
    ...leetcodeDue(db, today),
    ...leetcode150Due(db, today, leetcode150),
    ...todoDue(db, today),
    ...examDue(db, today),
  ];
```

and replace:

```ts
    completedToday:
      countReviewsToday(db, today) +
      countTheoryReviewsToday(db, today) +
      countStepsCompletedToday(db, today) +
      examSubmittedToday +
      leetcode150CompletedCount,
```

with:

```ts
    completedToday:
      countReviewsToday(db, today) +
      countTodosCompletedToday(db, today) +
      examSubmittedToday +
      leetcode150CompletedCount,
```

In `homeApiRoutes`, replace both occurrences of:

```ts
          ...theoryDue(db, today),
          ...goalsDue(db, today),
```

with:

```ts
          ...todoDue(db, today),
```

(inside `/api/home/due`), and replace:

```ts
          ...leetcodeCompletedToday(db, today),
          ...leetcode150CompletedToday(db, today),
          ...theoryCompletedToday(db, today),
          ...goalsCompletedToday(db, today),
          ...examCompletedToday(db, today),
```

with:

```ts
          ...leetcodeCompletedToday(db, today),
          ...leetcode150CompletedToday(db, today),
          ...todoCompletedToday(db, today),
          ...examCompletedToday(db, today),
```

(inside `/api/home/completed-today`).

- [ ] **Step 3: Run the type checker**

Run: `bunx tsc --noEmit`
Expected: errors in `home-api.test.ts` (still references `theory-db`/`goals-db`) — expected, fixed in Task 6. `index.ts` and `home-api.ts` themselves should show no errors.

- [ ] **Step 4: Commit**

```bash
git add index.ts home-api.ts
git commit -m "feat: wire todo into server, drop theory/goals server wiring"
```

---

### Task 5: Wire Todo into the frontend, drop Theory/Goals tabs

**Files:**
- Modify: `frontend.tsx`

- [ ] **Step 1: Update imports**

Replace:

```ts
import TheoryApp from "./TheoryApp";
import GoalsApp from "./GoalsApp";
```

with:

```ts
import TodoApp from "./TodoApp";
```

- [ ] **Step 2: Update `Tab` and `DeepLink` types**

Replace:

```ts
type Tab = "home" | "leetcode" | "theory" | "goals" | "exam";

type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "theory"; conceptDay: number }
  | { tab: "goals"; projectId: number }
  | { tab: "exam"; course: string; week: number };
```

with:

```ts
type Tab = "home" | "leetcode" | "todo" | "exam";

type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "todo"; todoId: number }
  | { tab: "exam"; course: string; week: number };
```

- [ ] **Step 3: Update `navigate()`**

Replace:

```ts
  const navigate = (item: {
    source: "leetcode" | "theory" | "goals" | "exam";
    linkId: number;
    course?: string;
    externalUrl?: string;
  }) => {
    if (item.source === "leetcode" && item.externalUrl) {
      openExternal(item.externalUrl);
      return;
    }
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "theory") setDeepLink({ tab: "theory", conceptDay: item.linkId });
    else if (item.source === "goals") setDeepLink({ tab: "goals", projectId: item.linkId });
    else setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
    setTab(item.source);
  };
```

with:

```ts
  const navigate = (item: {
    source: "leetcode" | "todo" | "exam";
    linkId: number;
    course?: string;
    externalUrl?: string;
  }) => {
    if (item.source === "leetcode" && item.externalUrl) {
      openExternal(item.externalUrl);
      return;
    }
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "todo") setDeepLink({ tab: "todo", todoId: item.linkId });
    else setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
    setTab(item.source);
  };
```

- [ ] **Step 4: Update `TabBar`**

Replace:

```tsx
      <button
        className={tab === "theory" ? "tab tab-active" : "tab"}
        onClick={() => onChange("theory")}
      >
        Theory
      </button>
      <button
        className={tab === "goals" ? "tab tab-active" : "tab"}
        onClick={() => onChange("goals")}
      >
        Goals
      </button>
```

with:

```tsx
      <button
        className={tab === "todo" ? "tab tab-active" : "tab"}
        onClick={() => onChange("todo")}
      >
        Todo
      </button>
```

- [ ] **Step 5: Update `App()` rendering**

Replace:

```tsx
      {tab === "theory" && (
        <TheoryApp
          openConceptDay={deepLink?.tab === "theory" ? deepLink.conceptDay : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
      {tab === "goals" && (
        <GoalsApp
          openProjectId={deepLink?.tab === "goals" ? deepLink.projectId : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
```

with:

```tsx
      {tab === "todo" && (
        <TodoApp
          openTodoId={deepLink?.tab === "todo" ? deepLink.todoId : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
```

- [ ] **Step 6: Run the type checker**

Run: `bunx tsc --noEmit`
Expected: no new errors from `frontend.tsx` itself (remaining errors are the still-pending `home-api.test.ts`/`HomeApp.tsx` from Tasks 6–7).

- [ ] **Step 7: Commit**

```bash
git add frontend.tsx
git commit -m "feat: wire Todo tab into frontend, drop Theory/Goals tabs"
```

---

### Task 6: `HomeApp.tsx` — update source labels/colors

**Files:**
- Modify: `HomeApp.tsx`

- [ ] **Step 1: Update `SOURCE_LABEL` and `SOURCE_COLOR`**

Replace:

```ts
const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  theory: "Theory",
  goals: "Goals",
  exam: "Modules",
};

const SOURCE_COLOR: Record<DueSource, string> = {
  leetcode: "var(--cat-src-leetcode)",
  theory: "var(--cat-src-theory)",
  goals: "var(--cat-src-goals)",
  exam: "var(--cat-src-exam)",
};
```

with:

```ts
const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  todo: "Todo",
  exam: "Modules",
};

const SOURCE_COLOR: Record<DueSource, string> = {
  leetcode: "var(--cat-src-leetcode)",
  todo: "var(--cat-src-theory)",
  exam: "var(--cat-src-exam)",
};
```

(Reuses the existing `--cat-src-theory` CSS custom property for Todo's tag color — no CSS changes needed, per the Global Constraints.)

- [ ] **Step 2: Run the type checker**

Run: `bunx tsc --noEmit`
Expected: no errors from `HomeApp.tsx`.

- [ ] **Step 3: Commit**

```bash
git add HomeApp.tsx
git commit -m "feat: update HomeApp source labels for Todo"
```

---

### Task 7: Delete obsolete Theory/Goals files, rewrite `home-api.test.ts`

**Files:**
- Delete: `TheoryApp.tsx`, `theory-db.ts`, `theory-api.ts`, `theory-content.ts`, `theory-scheduling.ts`, `theory-db.test.ts`, `theory-api.test.ts`, `theory-content.test.ts`, `theory-scheduling.test.ts`
- Delete: `GoalsApp.tsx`, `goals-db.ts`, `goals-api.ts`, `goals-scheduling.ts`, `goals-db.test.ts`, `goals-api.test.ts`, `goals-scheduling.test.ts`
- Modify: `home-api.test.ts`

- [ ] **Step 1: Delete the files**

```bash
git rm TheoryApp.tsx theory-db.ts theory-api.ts theory-content.ts theory-scheduling.ts \
  theory-db.test.ts theory-api.test.ts theory-content.test.ts theory-scheduling.test.ts \
  GoalsApp.tsx goals-db.ts goals-api.ts goals-scheduling.ts \
  goals-db.test.ts goals-api.test.ts goals-scheduling.test.ts
```

- [ ] **Step 2: Rewrite `home-api.test.ts`**

Replace the whole file:

```ts
// home-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem, reviewProblem } from "./db";
import { migrateTodo, createTodo, toggleTodo } from "./todo-db";
import { migrateExam, gradeExamAnswer, submitExamPaper } from "./exam-db";
import { buildExamSchedule, weekStartDate, weekDueDate, listExamCourses, SEMESTER_START } from "./exam-content";
import { migrateLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";
import { homeApiRoutes } from "./home-api";
import { localToday, addDays } from "./scheduling";

const TODAY = localToday();
function examWeekItemCounts(): { dueToday: number; overdue: number } {
  let dueToday = 0;
  let overdue = 0;
  for (const { code } of listExamCourses()) {
    const weeks = new Set(buildExamSchedule().filter((p) => p.course === code).map((p) => p.week));
    for (const week of weeks) {
      if (weekStartDate(week) > TODAY) continue;
      if (weekDueDate(week) < TODAY) overdue++;
      else dueToday++;
    }
  }
  return { dueToday, overdue };
}
const EXAM_ITEM_COUNTS = examWeekItemCounts();
const LEETCODE150_DAILY_DUE = 1;
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateTodo(db);
  migrateExam(db, TODAY);
  migrateLeetcode150(db);
  server = Bun.serve({ port: 0, routes: homeApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/home/due includes a due todo", async () => {
  createTodo(db, "Write the SA for project", TODAY, null, TODAY);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "todo" && i.title === "Write the SA for project")).toBe(true);
});

test("GET /api/home/due includes a due LeetCode problem", async () => {
  createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const item = items.find((i) => i.source === "leetcode" && i.title === "Two Sum");
  expect(item).toBeTruthy();
  expect(item.title).toBe("Two Sum");
  expect(item.subtitle).toBe("java");
});

test("GET /api/home/due excludes a todo that isn't due yet", async () => {
  createTodo(db, "Not due yet", addDays(TODAY, 20), null, TODAY);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "todo")).toBe(false);
});

test("GET /api/home/due includes this week's exam item", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBe(EXAM_ITEM_COUNTS.dueToday + EXAM_ITEM_COUNTS.overdue);
  const info5995Item = examItems.find((i) => i.course === "INFO5995" && i.linkId === 1)!;
  expect(info5995Item).toBeTruthy();
  expect(info5995Item.linkId).toBe(1);
  expect(info5995Item.title).toContain("Week 1");
});

test("GET /api/home/due gives every exam item a collision-free id", async () => {
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES ('INFO5995', 1, 2)`).run();

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  const ids = examItems.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test("GET /api/home/due drops the week item once every paper in it is submitted", async () => {
  const paper = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, true));
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "exam" && i.course === "INFO5995" && i.linkId === 1)).toBe(false);
});

test("GET /api/home/due sorts all sources together by due date ascending", async () => {
  const beforeSemester = addDays(SEMESTER_START, -1);
  createTodo(db, "Overdue todo", beforeSemester, null, beforeSemester);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const dueDates = items.map((i) => i.dueDate);
  expect(dueDates).toEqual([...dueDates].sort());
  expect(items[0]!.source).toBe("todo");
});

test("GET /api/home/stats starts with one exam item per course (besides the daily LeetCode150 pointer) when there are no todos", async () => {
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({
    dueToday: EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE,
    overdue: EXAM_ITEM_COUNTS.overdue,
    completedToday: 0,
  });
});

test("GET /api/home/stats counts due todos", async () => {
  for (let i = 0; i < 5; i++) createTodo(db, `Task ${i}`, TODAY, null, TODAY);
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({
    dueToday: 5 + EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE,
    overdue: EXAM_ITEM_COUNTS.overdue,
    completedToday: 0,
  });
});

test("GET /api/home/stats counts dueToday and overdue across all three sources", async () => {
  createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  for (let i = 0; i < 5; i++) createTodo(db, `Task ${i}`, TODAY, null, TODAY);
  createTodo(db, "Overdue todo", addDays(TODAY, -3), null, addDays(TODAY, -3));

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.dueToday).toBe(6 + EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE);
  expect(stats.overdue).toBe(1 + EXAM_ITEM_COUNTS.overdue);
});

test("GET /api/home/stats counts completedToday across all three sources", async () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  reviewProblem(db, problem.id, "pass", TODAY);
  const todo = createTodo(db, "Task", TODAY, null, TODAY);
  toggleTodo(db, todo.id, TODAY);

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.completedToday).toBe(2);
});

test("GET /api/home/stats counts a submitted exam paper as completed today", async () => {
  const before: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(before.completedToday).toBe(0);

  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, true));
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const after: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(after.completedToday).toBe(1);
});

test("GET /api/home/completed-today merges completions across all three sources", async () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  reviewProblem(db, problem.id, "pass", TODAY);
  const todo = createTodo(db, "Task", TODAY, null, TODAY);
  toggleTodo(db, todo.id, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  expect(items.length).toBe(2);
  expect(items.every((i) => i.dueDate === TODAY)).toBe(true);
  expect(items.every((i) => i.overdueDays === 0)).toBe(true);
  expect(items.some((i) => i.source === "leetcode" && i.title === "Two Sum")).toBe(true);
  expect(items.some((i) => i.source === "todo" && i.title === "Task")).toBe(true);
});

test("GET /api/home/completed-today includes a submitted exam paper", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i !== 0));
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBe(1);
  expect(examItems.every((i) => i.subtitle === "Intro to Cybersecurity")).toBe(true);
  expect(items.every((i) => i.dueDate === TODAY && i.overdueDays === 0)).toBe(true);
});

test("GET /api/home/completed-today is empty when nothing was completed today", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  expect(items).toEqual([]);
});

test("overdueDays is 0 for an item due today and positive for an overdue item", async () => {
  createTodo(db, "Due today", TODAY, null, TODAY);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const todoToday = items.find((i) => i.source === "todo" && i.title === "Due today")!;
  expect(todoToday.overdueDays).toBe(0);

  createTodo(db, "Overdue", addDays(TODAY, -3), null, addDays(TODAY, -3));
  const items2: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const overdueItem = items2.find((i) => i.source === "todo" && i.title === "Overdue")!;
  expect(overdueItem.overdueDays).toBe(3);
});

test("GET /api/home/due includes the LeetCode150 daily pointer with an externalUrl", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const pointer = items.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(pointer).toBeTruthy();
  expect(pointer.title).toBe("209. Minimum Size Subarray Sum");
  expect(pointer.subtitle).toBe("Sliding Window · Medium");
  expect(pointer.overdueDays).toBe(0);
  expect(pointer.externalUrl).toBe("https://leetcode.com/problems/minimum-size-subarray-sum/");
});

test("GET /api/home/due shows the LeetCode150 daily pointer as overdue after a missed day", async () => {
  db.query(`UPDATE leetcode150_state SET due_since = ? WHERE id = 1`).run(addDays(TODAY, -2));
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const pointer = items.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(pointer.overdueDays).toBe(2);
});

test("solving the LeetCode150 daily pointer removes it from due and credits completedToday", async () => {
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    TODAY,
  );
  const dueItems: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const stillPending = dueItems.find(
    (i) => i.source === "leetcode" && i.title.startsWith("209."),
  );
  expect(stillPending).toBeFalsy();
  expect(dueItems.some((i) => i.source === "leetcode" && i.externalUrl)).toBe(false);

  const row = db.query(`SELECT due_since FROM leetcode150_state WHERE id = 1`).get() as { due_since: string };
  expect(row.due_since).toBe(addDays(TODAY, 1));

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.completedToday).toBe(1);

  const completedItems: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const solved = completedItems.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(solved).toBeTruthy();
  expect(solved.title).toBe(LEETCODE_150[29]!.number + ". " + LEETCODE_150[29]!.title);
});

test("solving the LeetCode150 daily pointer via a captured review (pass) does not double-count completedToday", async () => {
  const problem = createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    TODAY,
  );
  reviewProblem(db, problem.id, "pass", TODAY);

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.completedToday).toBe(1);

  const completedItems: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const leetcodeItems = completedItems.filter((i) => i.source === "leetcode");
  expect(leetcodeItems.length).toBe(1);
});
```

- [ ] **Step 3: Run the full test suite**

Run: `bun test`
Expected: PASS, no references to `theory-db`/`goals-db` remain anywhere.

- [ ] **Step 4: Run the type checker**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Theory/Goals modules, rewrite home-api tests for Todo"
```

---

### Task 8: Manual smoke check

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `bun --hot ./index.ts` (use a scratch DB to avoid touching real data, e.g. `SRS_DB_PATH=/tmp/smoke.db bun --hot ./index.ts`)

- [ ] **Step 2: Verify in a browser**

- Nav bar shows Home, LeetCode, Todo, Modules — no Goals tab.
- Todo tab: "+ Add todo" creates a task with a due date and optional link; it appears in "Due today" or the overdue bucket; the checkbox marks it done and it drops off the board; "Completed today" stat and modal reflect it; Delete removes it.
- Home tab: "Everything due" and the three stat tiles include todo items with the "Todo" tag/color; no "Goals"/"Theory" tags appear anywhere.
- Exam (Modules) tab: answering an MCQ question stays on that question, shows correct/wrong highlighting and the explanation, and only advances when Next is clicked (the fix from earlier in this session).

- [ ] **Step 3: Stop the dev server**

No commit — this task is verification only.
