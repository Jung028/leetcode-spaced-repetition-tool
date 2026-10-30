// flashcards-page/FlashcardsDeckUploader.tsx
import type { ChangeEvent } from "react";

const PLACEHOLDER = `# INFO5990 — Exam 2

### Q1. ...
...

### Q1b. ...
...`;

export default function FlashcardsDeckUploader({
  value,
  onChange,
  onSave,
  busy,
}: {
  value: string;
  onChange: (text: string) => void;
  onSave: () => void;
  busy: boolean;
}) {
  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    onChange(await file.text());
  };

  return (
    <details className="flashcards-uploader">
      <summary>Add / update a deck</summary>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={PLACEHOLDER} rows={10} />
      <div className="flashcards-uploader-footer">
        <input type="file" accept=".md,text/markdown" onChange={handleFile} />
        <button disabled={busy || !value.trim()} onClick={onSave}>
          Save deck
        </button>
      </div>
    </details>
  );
}
