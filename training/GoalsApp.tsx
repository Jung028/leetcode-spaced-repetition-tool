import React, { useEffect, useState } from "react";
import type { Goal } from "./goals-db";
import { GOAL_CATEGORIES, GOAL_CATEGORY_LABEL, parseGoalText, type GoalCategory } from "./goal-text";

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
  create: (text: string, category: GoalCategory) =>
    fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, category }),
    }).then((r) => json<Goal>(r)),
  update: (id: number, text: string, category: GoalCategory) =>
    fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, category }),
    }).then((r) => json<Goal>(r)),
  toggle: (id: number) => fetch(`/api/goals/${id}/toggle`, { method: "POST" }).then((r) => json<Goal>(r)),
  remove: (id: number) => fetch(`/api/goals/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
};

function GoalForm({
  initialText,
  initialCategory,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initialText: string;
  initialCategory: GoalCategory;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (text: string, category: GoalCategory) => Promise<void>;
}) {
  const [text, setText] = useState(initialText);
  const [category, setCategory] = useState<GoalCategory>(initialCategory);
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
          await onSubmit(text.trim(), category);
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <label>
        Goal
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="10K: 38:47 → 36:30" autoFocus />
      </label>
      <label>
        Group
        <select value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)}>
          {GOAL_CATEGORIES.map((key) => (
            <option key={key} value={key}>{GOAL_CATEGORY_LABEL[key]}</option>
          ))}
        </select>
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function GoalCard({
  goal,
  onToggle,
  onDelete,
  onEdit,
}: {
  goal: Goal;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}) {
  const parts = parseGoalText(goal.text);
  return (
    <div className={goal.done ? "card goal-card goal-card-done" : "card goal-card"}>
      <label className="card-check">
        <input type="checkbox" checked={goal.done} onChange={() => onToggle(goal.id)} />
        <span className="card-title">{parts ? parts.title : goal.text}</span>
      </label>
      {parts && (
        <div>
          <div className="goal-card-target">{parts.target}</div>
          <div className="card-meta">from {parts.current}</div>
        </div>
      )}
      {parts?.note && <div className="card-meta">{parts.note}</div>}
      {goal.done && <span className="tag">achieved {goal.done_at}</span>}
      <div className="card-actions">
        <button type="button" className="btn" onClick={() => onEdit(goal.id)}>Edit</button>
        <button type="button" className="btn btn-danger" onClick={() => onDelete(goal.id)}>Delete</button>
      </div>
    </div>
  );
}

function groupByCategory(goals: Goal[]): { category: GoalCategory; goals: Goal[] }[] {
  return GOAL_CATEGORIES.map((category) => ({
    category,
    goals: goals.filter((goal) => goal.category === category),
  })).filter((group) => group.goals.length > 0);
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

  const saveEdit = async (goal: Goal, text: string, category: GoalCategory) => {
    await api.update(goal.id, text, category);
    setEditingId(null);
    await refresh();
  };

  const active = goals.filter((g) => !g.done);
  const achieved = goals.filter((g) => g.done);

  const renderGoal = (goal: Goal) =>
    goal.id === editingId ? (
      <GoalForm
        initialText={goal.text}
        initialCategory={goal.category}
        submitLabel="Save"
        onCancel={() => setEditingId(null)}
        onSubmit={(text, category) => saveEdit(goal, text, category)}
      />
    ) : (
      <GoalCard goal={goal} onToggle={toggle} onDelete={remove} onEdit={setEditingId} />
    );

  return (
    <div className="goals">
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add goal</button>
      </div>
      {adding && (
        <GoalForm
          initialText=""
          initialCategory="running"
          submitLabel="Add goal"
          onCancel={() => setAdding(false)}
          onSubmit={async (text, category) => {
            await api.create(text, category);
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
          groupByCategory(active).map((group) => (
            <div key={group.category} className="goal-group">
              <h3 className="card-kicker">
                {GOAL_CATEGORY_LABEL[group.category]} · {group.goals.length}
              </h3>
              <ul className="card-grid" style={{ "--card-min": "220px" } as React.CSSProperties}>
                {group.goals.map((goal, i) => (
                  <li key={goal.id} style={{ animationDelay: `${i * 60}ms` }}>
                    {renderGoal(goal)}
                  </li>
                ))}
              </ul>
            </div>
          ))
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
            <ul className="card-grid" style={{ "--card-min": "220px" } as React.CSSProperties}>
              {achieved.map((goal, i) => (
                <li key={goal.id} style={{ animationDelay: `${i * 60}ms` }}>
                  {renderGoal(goal)}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
