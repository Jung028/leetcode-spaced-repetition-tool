// notes/NotesTimeline.tsx
import { useState, type RefObject } from "react";
import type { Note } from "./notes-client";
import { formatFullDate, formatNoteTime, formatRelativeTime } from "./notes-grouping";

const TRUNCATE_AT = 320;

function NoteEntry({
  note,
  isEditing,
  editDraft,
  busy,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  note: Note;
  isEditing: boolean;
  editDraft: string;
  busy: boolean;
  onEditDraftChange: (text: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = note.text.length > TRUNCATE_AT;
  const shownText = isLong && !expanded ? `${note.text.slice(0, TRUNCATE_AT).trimEnd()}…` : note.text;

  if (isEditing) {
    return (
      <li className="notes-entry notes-entry-editing">
        <div className="notes-entry-body">
          <textarea
            className="notes-edit-textarea"
            value={editDraft}
            onChange={(e) => onEditDraftChange(e.target.value)}
            rows={3}
          />
          <div className="notes-edit-actions">
            <button onClick={onSaveEdit} disabled={busy || !editDraft.trim()}>
              Save & Sync
            </button>
            <button onClick={onCancelEdit} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="notes-entry" onClick={onStartEdit}>
      <div className="notes-entry-body">
        <span className="notes-entry-text">{shownText}</span>
        {isLong && (
          <button
            type="button"
            className="notes-entry-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
        <span className="notes-entry-time">{formatNoteTime(note.id)}</span>
      </div>
    </li>
  );
}

export default function NotesTimeline({
  dayLabel,
  dateKey,
  notes,
  status,
  busy,
  lastSyncedAt,
  hasUpdates,
  daysOpen,
  onOpenDays,
  daysToggleRef,
  onPull,
  onSync,
  editingId,
  editDraft,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  dayLabel: string;
  dateKey: string;
  notes: Note[];
  status: string | null;
  busy: boolean;
  lastSyncedAt: Date | null;
  hasUpdates: boolean;
  daysOpen: boolean;
  onOpenDays: () => void;
  daysToggleRef: RefObject<HTMLButtonElement | null>;
  onPull: () => void;
  onSync: () => void;
  editingId: string | null;
  editDraft: string;
  onEditDraftChange: (text: string) => void;
  onStartEdit: (note: Note) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}) {
  return (
    <section className="notes-main">
      <header className="notes-main-header">
        <button
          type="button"
          ref={daysToggleRef}
          className="notes-days-toggle"
          aria-expanded={daysOpen}
          aria-controls="notes-days"
          aria-label="Open day list"
          onClick={onOpenDays}
        >
          <span className="notes-days-toggle-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <div>
          <h2 className="notes-day-title">
            {dayLabel} <span className="notes-day-subtitle">· {formatFullDate(dateKey)}</span>
          </h2>
        </div>
        <div className="notes-sync-row">
          {hasUpdates && <span className="notes-badge">New notes available</span>}
          {lastSyncedAt && <span className="notes-sync-status">Synced {formatRelativeTime(lastSyncedAt)}</span>}
          <button onClick={onPull} disabled={busy}>
            Pull
          </button>
          <button onClick={onSync} disabled={busy}>
            Sync
          </button>
        </div>
      </header>
      {status && <p className="notes-status">{status}</p>}
      <ul className="notes-timeline">
        {notes.map((note) => (
          <NoteEntry
            key={note.id}
            note={note}
            isEditing={note.id === editingId}
            editDraft={editDraft}
            busy={busy}
            onEditDraftChange={onEditDraftChange}
            onStartEdit={() => onStartEdit(note)}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
          />
        ))}
        {notes.length === 0 && <li className="notes-empty">No notes yet.</li>}
      </ul>
    </section>
  );
}
