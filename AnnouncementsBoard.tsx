import React, { useEffect, useState } from "react";
import type { Announcement } from "./announcement-db";
import { MODULE_ITEM_KINDS, type ModuleItemKind } from "./module-items-db";
import type { Module } from "./modules-db";

const KIND_LABEL: Record<ModuleItemKind, string> = {
  assignment: "Assignment",
  presentation: "Presentation",
  viva: "Viva",
  quiz: "Quiz",
  exam: "Exam",
  other: "Other",
};

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
  list: () => fetch("/api/announcements").then((r) => json<Announcement[]>(r)),
  create: (message: string) =>
    fetch("/api/announcements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
    }).then((r) => json<Announcement>(r)),
  update: (id: number, message: string) =>
    fetch(`/api/announcements/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
    }).then((r) => json<Announcement>(r)),
  toggle: (id: number) =>
    fetch(`/api/announcements/${id}/toggle`, { method: "POST" }).then((r) => json<Announcement>(r)),
  remove: (id: number) => fetch(`/api/announcements/${id}`, { method: "DELETE" }).then((r) => json<{ ok: true }>(r)),
};

function AnnouncementForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState(initial);
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!message.trim()) {
          setError("Announcement can't be empty.");
          return;
        }
        try {
          await onSubmit(message.trim());
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <label>
        Announcement / reminder
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="e.g. Dear Teaching Team, for Assessment 1..."
          autoFocus
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function DeadlineQuickForm({
  announcement,
  modules,
  onDone,
  onCancel,
}: {
  announcement: Announcement;
  modules: Module[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const firstLine = announcement.message.split("\n")[0]!.slice(0, 80);
  const [course, setCourse] = useState(modules[0]?.code ?? "");
  const [kind, setKind] = useState<ModuleItemKind>("assignment");
  const [title, setTitle] = useState(firstLine);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState(announcement.message);
  const [error, setError] = useState("");

  return (
    <form
      className="form mp-form announcement-deadline-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!course) return setError("Pick a module.");
        if (!title.trim()) return setError("Title is required.");
        if (!date) return setError("Due date is required.");
        try {
          const res = await fetch("/api/module-items", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              course,
              kind,
              title: title.trim(),
              due_at: time ? `${date}T${time}` : date,
              weight: weight.trim() || undefined,
              description: notes,
            }),
          });
          if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Failed");
          onDone();
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      <div className="mp-form-row">
        <label>
          Module
          <select value={course} onChange={(e) => setCourse(e.target.value)}>
            {modules.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
          </select>
        </label>
        <label>
          Type
          <select value={kind} onChange={(e) => setKind(e.target.value as ModuleItemKind)}>
            {MODULE_ITEM_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
        </label>
        <label>
          Weight
          <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 10%" />
        </label>
      </div>
      <div className="mp-form-row">
        <label>
          Due date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Time
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Notes
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Add to deadlines</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AnnouncementsBoard() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [modulesError, setModulesError] = useState(false);
  const [deadlineFor, setDeadlineFor] = useState<number | null>(null);
  const [addedFor, setAddedFor] = useState<number | null>(null);

  const refresh = () => {
    setError(null);
    return api.list().then(setItems).catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((m: Module[]) => setModules(m.filter((x) => !x.hidden)))
      .catch(() => setModulesError(true));
  }, []);

  const toggle = (id: number) => {
    setError(null);
    api.toggle(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  const remove = (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    setError(null);
    api.remove(id).then(refresh).catch((err) => setError(errorMessage(err)));
  };

  return (
    <section className="board announcements-board" aria-label="Announcements">
      <div className="section-head">
        <h2>Announcements</h2>
        <span className="board-count">{items.length}</span>
      </div>
      {error && <p className="form-error">{error}</p>}

      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Add announcement</button>
      </div>

      {adding && (
        <AnnouncementForm
          initial=""
          submitLabel="Add announcement"
          onCancel={() => setAdding(false)}
          onSubmit={async (message) => {
            await api.create(message);
            setAdding(false);
            await refresh();
          }}
        />
      )}

      {items.length === 0 ? (
        <p className="board-empty">No announcements yet. Add one so you don't forget it.</p>
      ) : (
        <ul className="board-rows">
          {items.map((a, i) =>
            editingId === a.id ? (
              <li key={a.id} style={{ animationDelay: `${i * 60}ms` }}>
                <AnnouncementForm
                  initial={a.message}
                  submitLabel="Save changes"
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (message) => {
                    await api.update(a.id, message);
                    setEditingId(null);
                    await refresh();
                  }}
                />
              </li>
            ) : (
              <li key={a.id} style={{ animationDelay: `${i * 60}ms` }}>
                <label className={a.completed ? "board-row board-row-main step-row announcement-done" : "board-row board-row-main step-row"}>
                  <input type="checkbox" checked={a.completed} onChange={() => toggle(a.id)} />
                  <span className="board-title announcement-message">{a.message}</span>
                  <button
                    type="button"
                    className="btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingId(a.id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      remove(a.id);
                    }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={modulesError}
                    title={modulesError ? "Couldn't load modules" : "Add this as a deadline"}
                    onClick={(e) => {
                      e.preventDefault();
                      setDeadlineFor(a.id);
                    }}
                  >
                    + Add to deadlines
                  </button>
                </label>
                {deadlineFor === a.id && (
                  <DeadlineQuickForm
                    announcement={a}
                    modules={modules}
                    onCancel={() => setDeadlineFor(null)}
                    onDone={() => {
                      setDeadlineFor(null);
                      setAddedFor(a.id);
                      setTimeout(() => setAddedFor(null), 2500);
                    }}
                  />
                )}
                {addedFor === a.id && <p className="announcement-added">✓ Added to deadlines</p>}
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
