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
        const deleted = deleteTodo(db, Number(req.params.id));
        return deleted ? json({ ok: true }) : json({ error: "not found" }, 404);
      },
    },
  };
}
