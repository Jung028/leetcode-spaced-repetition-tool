// notes/NotesView.tsx
import { useEffect, useMemo, useState } from "react";
import type { Note, NotesClient } from "./notes-client";
import { groupDaysByMonth, groupNotesByDay, labelForDateKey, todayKey } from "./notes-grouping";
import NotesSidebar from "./NotesSidebar";
import NotesComposer from "./NotesComposer";
import NotesTimeline from "./NotesTimeline";
import "./notes.css";

export default function NotesView({ client }: { client: NotesClient }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [hasUpdates, setHasUpdates] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState(() => todayKey());
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

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

  const groups = useMemo(() => groupNotesByDay(notes), [notes]);
  const months = useMemo(() => groupDaysByMonth(groups), [groups]);
  const selectedGroup = groups.find((g) => g.dateKey === selectedDayKey);
  const selectedNotes = selectedGroup?.notes ?? [];
  const selectedLabel = selectedGroup?.label ?? labelForDateKey(selectedDayKey);

  const runSync = async () => {
    setBusy(true);
    try {
      await client.sync();
      setLastSyncedAt(new Date());
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
      setLastSyncedAt(new Date());
      setStatus(null);
      setSelectedDayKey(todayKey());
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

  const startEdit = (note: Note) => {
    if (busy) return;
    setEditingId(note.id);
    setEditDraft(note.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const saveEdit = async () => {
    const text = editDraft.trim();
    if (!text || !editingId) return;
    setBusy(true);
    try {
      await client.updateNote(editingId, text);
      setEditingId(null);
      setEditDraft("");
      await load();
      await client.sync();
      setLastSyncedAt(new Date());
      setStatus(null);
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      await load();
      setBusy(false);
    }
  };

  return (
    <div className="notes-view">
      <NotesSidebar months={months} selectedDayKey={selectedDayKey} onSelectDay={setSelectedDayKey} />
      <div className="notes-content">
        <NotesComposer draft={draft} onDraftChange={setDraft} onSave={handleSaveAndSync} busy={busy} />
        <NotesTimeline
          dayLabel={selectedLabel}
          dateKey={selectedDayKey}
          notes={selectedNotes}
          status={status}
          busy={busy}
          lastSyncedAt={lastSyncedAt}
          hasUpdates={hasUpdates}
          onPull={handlePull}
          onSync={runSync}
          editingId={editingId}
          editDraft={editDraft}
          onEditDraftChange={setEditDraft}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
        />
      </div>
    </div>
  );
}
