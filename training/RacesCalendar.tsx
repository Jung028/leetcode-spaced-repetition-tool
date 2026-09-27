import React, { useEffect, useState } from "react";
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

interface RaceFields {
  name: string;
  discipline: string;
  location: string;
  date: string;
  approxYear: string;
  notes: string;
}

const EMPTY_FIELDS: RaceFields = { name: "", discipline: "", location: "", date: "", approxYear: "", notes: "" };

const toFields = (r: Race): RaceFields => ({
  name: r.name,
  discipline: r.discipline ?? "",
  location: r.location ?? "",
  date: r.date ?? "",
  approxYear: r.approx_year != null ? String(r.approx_year) : "",
  notes: r.notes ?? "",
});

function toBody(f: RaceFields) {
  return {
    name: f.name.trim(),
    discipline: f.discipline.trim() || null,
    location: f.location.trim() || null,
    date: f.date.trim() || null,
    approxYear: f.approxYear.trim() ? Number(f.approxYear.trim()) : null,
    notes: f.notes.trim() || null,
  };
}

const api = {
  list: () => fetch("/api/races").then((r) => json<Race[]>(r)),
  create: (f: RaceFields) =>
    fetch("/api/races", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(f)),
    }).then((r) => json<Race>(r)),
  update: (id: number, f: RaceFields) =>
    fetch(`/api/races/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toBody(f)),
    }).then((r) => json<Race>(r)),
  remove: (id: number) => fetch(`/api/races/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
};

function dateLabel(r: Race): string {
  if (r.date) return r.date;
  if (r.approx_year != null) return `Year: ${r.approx_year} (date TBD)`;
  return "Date TBD";
}

function RaceForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: RaceFields;
  submitLabel: string;
  onSubmit: (f: RaceFields) => Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const set = (k: keyof RaceFields) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

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
        if (!f.name.trim()) {
          setError("Name is required.");
          return;
        }
        if (f.approxYear.trim() && !/^\d{4}$/.test(f.approxYear.trim())) {
          setError("Year must be a 4-digit number.");
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
        Name
        <input value={f.name} onChange={set("name")} placeholder="Powerman Classic" autoFocus />
      </label>
      <label>
        Discipline
        <input value={f.discipline} onChange={set("discipline")} placeholder="10km run / 60km bike / 10km run" />
      </label>
      <label>
        Location
        <input value={f.location} onChange={set("location")} placeholder="Zell am See, Austria" />
      </label>
      <label>
        Date (if known)
        <input value={f.date} onChange={set("date")} type="date" />
      </label>
      <label>
        Year (if the exact date isn't set yet)
        <input value={f.approxYear} onChange={set("approxYear")} placeholder="2027" inputMode="numeric" />
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

export default function RacesCalendar() {
  const [races, setRaces] = useState<Race[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return api.list().then(setRaces).catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  const remove = (id: number) => {
    if (!confirm("Delete this race?")) return;
    setError(null);
    api.remove(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  return (
    <div className="races-calendar">
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add race</button>
      </div>
      {adding && (
        <RaceForm
          initial={EMPTY_FIELDS}
          submitLabel="Add race"
          onCancel={() => setAdding(false)}
          onSubmit={async (f) => {
            await api.create(f);
            setAdding(false);
            await refresh();
          }}
        />
      )}
      <section className="board" aria-label="Races">
        <div className="section-head">
          <h2>Races</h2>
          <span className="board-count">{races.length}</span>
        </div>
        {races.length === 0 ? (
          <p className="board-empty">No races yet. Add one to get started.</p>
        ) : (
          <ul className="board-rows">
            {races.map((r, i) => {
              if (r.id === editingId) {
                return (
                  <li key={r.id} style={{ animationDelay: `${i * 60}ms` }}>
                    <RaceForm
                      initial={toFields(r)}
                      submitLabel="Save"
                      onCancel={() => setEditingId(null)}
                      onSubmit={async (f) => {
                        await api.update(r.id, f);
                        setEditingId(null);
                        await refresh();
                      }}
                    />
                  </li>
                );
              }
              return (
                <li key={r.id} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="board-row board-row-main">
                    <span className="tag">{dateLabel(r)}</span>
                    <span className="board-title">{r.name}</span>
                    {r.discipline && <span className="goal-deadline">{r.discipline}</span>}
                    {r.location && <span className="goal-deadline">{r.location}</span>}
                    <button type="button" className="btn" onClick={() => setEditingId(r.id)}>Edit</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(r.id)}>Delete</button>
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
