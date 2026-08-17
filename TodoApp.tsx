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
