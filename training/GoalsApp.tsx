import React, { useEffect, useState } from "react";
import type { Goal } from "./goals-db";
import type { Race } from "./races-db";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong.";

interface GoalFields {
  title: string;
  currentValue: string;
  targetValue: string;
  targetDate: string;
  raceId: string;
  notes: string;
}

const EMPTY_FIELDS: GoalFields = { title: "", currentValue: "", targetValue: "", targetDate: "", raceId: "", notes: "" };

const toFields = (g: Goal, races: Race[]): GoalFields => ({
  title: g.title,
  currentValue: g.current_value,
  targetValue: g.target_value,
  targetDate: g.target_date ?? "",
  raceId: g.race_id != null && races.some((r) => r.id === g.race_id) ? String(g.race_id) : "",
  notes: g.notes ?? "",
});

function toBody(f: GoalFields) {
  return {
    title: f.title.trim(),
    currentValue: f.currentValue.trim(),
    targetValue: f.targetValue.trim(),
    targetDate: f.targetDate.trim() || null,
    raceId: f.raceId.trim() ? Number(f.raceId.trim()) : null,
    notes: f.notes.trim() || null,
  };
}

const api = {
  listGoals: () => fetch("/api/goals").then((r) => json<Goal[]>(r)),
  listRaces: () => fetch("/api/races").then((r) => json<Race[]>(r)),
  create: (f: GoalFields) =>
    fetch("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(f)),
    }).then((r) => json<Goal>(r)),
  update: (id: number, f: GoalFields) =>
    fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(f)),
    }).then((r) => json<Goal>(r)),
  remove: (id: number) => fetch(`/api/goals/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
};

function GoalForm({
  initial,
  races,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: GoalFields;
  races: Race[];
  submitLabel: string;
  onSubmit: (f: GoalFields) => Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const set = (k: keyof GoalFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

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
        if (!f.title.trim() || !f.currentValue.trim() || !f.targetValue.trim()) {
          setError("Title, current value and target value are all required.");
          return;
        }
        try {
          await onSubmit(f);
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <label>
        Title
        <input value={f.title} onChange={set("title")} placeholder="10km run leg" autoFocus />
      </label>
      <label>
        Current
        <input value={f.currentValue} onChange={set("currentValue")} placeholder="40:00" />
      </label>
      <label>
        Target
        <input value={f.targetValue} onChange={set("targetValue")} placeholder="33:30" />
      </label>
      <label>
        Target date (optional)
        <input value={f.targetDate} onChange={set("targetDate")} type="date" />
      </label>
      <label>
        Supports race (optional)
        <select value={f.raceId} onChange={set("raceId")}>
          <option value="">None</option>
          {races.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>
      <label>
        Notes
        <input value={f.notes} onChange={set("notes")} placeholder="Optional" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function GoalsApp() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return Promise.all([api.listGoals(), api.listRaces()])
      .then(([g, r]) => {
        setGoals(g);
        setRaces(r);
      })
      .catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  const raceNameById = new Map(races.map((r) => [r.id, r.name]));

  const remove = (id: number) => {
    if (!confirm("Delete this goal?")) return;
    setError(null);
    api.remove(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  return (
    <div className="goals">
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add goal</button>
      </div>
      {adding && (
        <GoalForm
          initial={EMPTY_FIELDS}
          races={races}
          submitLabel="Add goal"
          onCancel={() => setAdding(false)}
          onSubmit={async (f) => {
            await api.create(f);
            setAdding(false);
            await refresh();
          }}
        />
      )}
      <section className="board" aria-label="Goals">
        <div className="section-head">
          <h2>Goals</h2>
          <span className="board-count">{goals.length}</span>
        </div>
        {goals.length === 0 ? (
          <p className="board-empty">No goals yet. Add one to get started.</p>
        ) : (
          <ul className="board-rows">
            {goals.map((g, i) => {
              if (g.id === editingId) {
                return (
                  <li key={g.id} style={{ animationDelay: `${i * 60}ms` }}>
                    <GoalForm
                      initial={toFields(g, races)}
                      races={races}
                      submitLabel="Save"
                      onCancel={() => setEditingId(null)}
                      onSubmit={async (f) => {
                        await api.update(g.id, f);
                        setEditingId(null);
                        await refresh();
                      }}
                    />
                  </li>
                );
              }
              const raceName = g.race_id != null ? raceNameById.get(g.race_id) : undefined;
              return (
                <li key={g.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="board-row board-row-main">
                    <span className="board-title">{g.title}</span>
                    <span className="goal-deadline">{g.current_value} → {g.target_value}</span>
                    {g.target_date && <span className="tag">{g.target_date}</span>}
                    {raceName && <span className="goal-deadline">supports: {raceName}</span>}
                    <button type="button" className="btn" onClick={() => setEditingId(g.id)}>Edit</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(g.id)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
