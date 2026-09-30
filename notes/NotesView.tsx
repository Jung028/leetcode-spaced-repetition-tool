// notes/NotesView.tsx
import { useEffect, useState } from "react";
import type { Note, NotesClient } from "./notes-client";
import "./notes.css";

export default function NotesView({ client }: { client: NotesClient }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [hasUpdates, setHasUpdates] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setNotes(await client.listNotes());
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  const checkUpdates = async () => {
    try {
      setHasUpdates(await client.checkForUpdates());
    } catch {
      // badge just doesn't update — not worth surfacing as an error
    }
  };

  useEffect(() => {
    load();
    checkUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSync = async () => {
    setBusy(true);
    try {
      await client.sync();
      setStatus(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      await load();
      setBusy(false);
    }
  };

  const handleSaveAndSync = async () => {
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    try {
      await client.addNote(text);
      setDraft("");
      await load();
      await client.sync();
      setStatus(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      // Reload after the sync attempt too, so the phone's list drops notes that just synced.
      await load();
      setBusy(false);
    }
  };

  const handlePull = async () => {
    setBusy(true);
    try {
      setNotes(await client.pull());
      setHasUpdates(false);
      setStatus(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="notes-view">
      <div className="notes-toolbar">
        {hasUpdates && <span className="notes-badge">New notes available</span>}
        <button onClick={handlePull} disabled={busy}>
          Pull
        </button>
        <button onClick={runSync} disabled={busy}>
          Sync
        </button>
      </div>
      {status && <p className="notes-status">{status}</p>}
      <div className="notes-add">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type or dictate a note…"
          rows={3}
        />
        <button onClick={handleSaveAndSync} disabled={busy || !draft.trim()}>
          Save & Sync
        </button>
      </div>
      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note.id} className="notes-item">
            <span className="notes-item-text">{note.text}</span>
            <span className="notes-item-date">{note.createdAt}</span>
          </li>
        ))}
        {notes.length === 0 && <li className="notes-empty">No notes yet.</li>}
      </ul>
    </div>
  );
}
