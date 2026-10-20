// notes/NotesComposer.tsx
import type { KeyboardEvent } from "react";

export default function NotesComposer({
  draft,
  onDraftChange,
  onSave,
  busy,
}: {
  draft: string;
  onDraftChange: (text: string) => void;
  onSave: () => void;
  busy: boolean;
}) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!busy && draft.trim()) onSave();
    }
  };

  return (
    <div className="notes-composer">
      <textarea
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type or dictate a note…"
        rows={3}
      />
      <div className="notes-composer-footer">
        <span className="notes-composer-hint">⌘/Ctrl + Enter to save · saves and syncs</span>
        <button onClick={onSave} disabled={busy || !draft.trim()}>
          Save & Sync
        </button>
      </div>
    </div>
  );
}
