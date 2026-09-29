import React, { useEffect, useState } from "react";
import type { Goal } from "./goals-db";

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
  list: () => fetch("/api/goals").then((r) => json<Goal[]>(r)),
  create: (text: string) =>
    fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => json<Goal>(r)),
  update: (id: number, text: string) =>
    fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => json<Goal>(r)),
  toggle: (id: number) => fetch(`/api/goals/${id}/toggle`, { method: "POST" }).then((r) => json<Goal>(r)),
  remove: (id: number) => fetch(`/api/goals/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
};

function NewGoalForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => Promise<void> }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) {
          setError("Write something first.");
          return;
        }
        try {
          await api.create(text.trim());
          await onCreated();
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <label>
        Goal
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="10K: 38:47 → 36:30" autoFocus />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Add goal</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function EditGoalForm({
  goal,
  onCancel,
  onSaved,
}: {
  goal: Goal;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [text, setText] = useState(goal.text);
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) {
          setError("Write something first.");
          return;
        }
        try {
          await api.update(goal.id, text.trim());
          await onSaved();
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <label>
        Goal
        <input value={text} onChange={(e) => setText(e.target.value)} autoFocus />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Save</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function GoalRow({
  goal,
  editingId,
  onToggle,
  onDelete,
  onEdit,
  onCancelEdit,
  onSaved,
}: {
  goal: Goal;
  editingId: number | null;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onCancelEdit: () => void;
  onSaved: () => Promise<void>;
}) {
  if (goal.id === editingId) {
    return <EditGoalForm goal={goal} onCancel={onCancelEdit} onSaved={onSaved} />;
  }
  return (
    <label className={goal.done ? "board-row board-row-main step-row step-row-done" : "board-row board-row-main step-row"}>
      <input type="checkbox" checked={goal.done} readOnly={goal.done} onChange={() => onToggle(goal.id)} />
      {goal.done && <span className="tag">achieved {goal.done_at}</span>}
      <span className={goal.done ? "board-title board-title-done" : "board-title"}>{goal.text}</span>
      <button
        type="button"
        className="btn"
        onClick={(e) => {
          e.preventDefault();
          onEdit(goal.id);
        }}
      >
        Edit
      </button>
      <button
        type="button"
        className="btn btn-danger"
        onClick={(e) => {
          e.preventDefault();
          onDelete(goal.id);
        }}
      >
        Delete
      </button>
    </label>
  );
}

export default function GoalsApp() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAchieved, setShowAchieved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return api.list().then(setGoals).catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  const toggle = (id: number) => {
    setError(null);
    api.toggle(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  const remove = (id: number) => {
    if (!confirm("Delete this goal?")) return;
    setError(null);
    api.remove(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  const saveEdit = async () => {
    setEditingId(null);
    await refresh();
  };

  const active = goals.filter((g) => !g.done);
  const achieved = goals.filter((g) => g.done);

  const rowProps = {
    editingId,
    onToggle: toggle,
    onDelete: remove,
    onEdit: setEditingId,
    onCancelEdit: () => setEditingId(null),
    onSaved: saveEdit,
  };

  return (
    <div className="goals">
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add goal</button>
      </div>
      {adding && (
        <NewGoalForm
          onCancel={() => setAdding(false)}
          onCreated={async () => {
            setAdding(false);
            await refresh();
          }}
        />
      )}
      <section className="board" aria-label="Goals">
        <div className="section-head">
          <h2>Goals</h2>
          <span className="board-count">{active.length}</span>
        </div>
        {active.length === 0 ? (
          <p className="board-empty">No goals yet. Add one to get started.</p>
        ) : (
          <ul className="board-rows">
            {active.map((g, i) => (
              <li key={g.id} style={{ animationDelay: `${i * 60}ms` }}>
                <GoalRow goal={g} {...rowProps} />
              </li>
            ))}
          </ul>
        )}
      </section>
      {achieved.length > 0 && (
        <section className="board" aria-label="Achieved goals">
          <button type="button" className="section-head board-toggle" onClick={() => setShowAchieved((v) => !v)}>
            <h2>Achieved</h2>
            <span className="board-count">{achieved.length}</span>
            <span className="board-toggle-arrow">{showAchieved ? "▾" : "▸"}</span>
          </button>
          {showAchieved && (
            <ul className="board-rows">
              {achieved.map((g, i) => (
                <li key={g.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <GoalRow goal={g} {...rowProps} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
