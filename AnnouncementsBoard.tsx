import React, { useEffect, useState } from "react";
import type { Announcement } from "./announcement-db";

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

export default function AnnouncementsBoard() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return api.list().then(setItems).catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

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
                </label>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
