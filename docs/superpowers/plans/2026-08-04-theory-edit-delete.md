# Theory Edit & Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an already-filled Theory concept be edited (question/answer/format) and deleted (cleared back to blank) from the running app, instead of only being reachable through the "fill in a blank slot" flow.

**Architecture:** `saveTheoryContent`/`PUT /api/theory/:day/content` already allow overwriting existing content — editing is mostly a UI change (reopen the existing content form, pre-filled). Deleting is new: a `clearTheoryContent` function and a `DELETE /api/theory/:day/content` route reset `question`/`answer`/`answer_format` back to blank defaults, leaving scheduling state (`rung`, `next_review`, `your_answer`) untouched. `TheoryDetail` gains local `editing` state (mirroring `frontend.tsx`'s `Detail` component's existing Edit/Delete pattern) instead of a new app-level view.

**Tech Stack:** Bun, `bun:sqlite`, TypeScript, React (via Bun's HTML-import bundling), `bun test`.

## Global Constraints

- Bun only — `bun test`, no jest/vitest/node.
- Editing always allows overwriting existing content (already true via `saveTheoryContent`/the existing `PUT` route — no change needed there).
- Delete means clear to blank in place: reset `question`, `answer`, `answer_format` to `''`, `''`, `'text'`. Do **not** touch `rung`, `next_review`, or `your_answer` — clearing content is a curriculum action, not a scheduling reset.
- No renumbering of `concept_day` slots, ever.
- No automated frontend tests for `TheoryApp.tsx` — this file's task is verified manually, matching the established convention for this codebase (see `docs/superpowers/specs/2026-08-03-theory-content-database-design.md` and its implementation plan).
- Use `bun test <file>` to run a single file's tests while iterating; run the full `bun test` before each commit.

---

### Task 1: `theory-db.ts` — `clearTheoryContent`

**Files:**
- Modify: `theory-db.ts`
- Test: `theory-db.test.ts`

**Interfaces:**
- Consumes: `getTheoryConcept(db, conceptDay): TheoryProgress | null` (already exists in this file).
- Produces: `clearTheoryContent(db: Database, conceptDay: number): TheoryProgress | null`. Consumed by Task 2 (`theory-api.ts`).

- [ ] **Step 1: Add the failing tests**

Add these four tests to `theory-db.test.ts`, inside the existing file (add `clearTheoryContent` to the existing `import { ... } from "./theory-db";` block at the top):

```ts
test("clearTheoryContent resets question, answer, and answer_format to blank", () => {
  saveTheoryContent(db, 1, "Q", "https://example.com/pic.png", "image");
  const cleared = clearTheoryContent(db, 1)!;
  expect(cleared.question).toBe("");
  expect(cleared.answer).toBe("");
  expect(cleared.answer_format).toBe("text");
});

test("clearTheoryContent does not touch rung, next_review, or your_answer", () => {
  saveTheoryContent(db, 1, "Q", "A");
  reviewTheoryConcept(db, 1, "correct", TODAY);
  saveTheoryAnswer(db, 1, "my draft");
  const cleared = clearTheoryContent(db, 1)!;
  expect(cleared.rung).toBe(0);
  expect(cleared.next_review).toBe(addDays(TODAY, 3));
  expect(cleared.your_answer).toBe("my draft");
});

test("clearTheoryContent on an unknown concept_day returns null", () => {
  expect(clearTheoryContent(db, 9999)).toBeNull();
});

test("a cleared concept drops out of the due list, same as never-filled content", () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  clearTheoryContent(db, 3);
  const due = listDueTheory(db, TODAY);
  expect(due.map((c) => c.concept_day)).toEqual([1, 2, 4, 5]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test theory-db.test.ts`
Expected: FAIL — `clearTheoryContent` is not exported from `theory-db.ts` yet.

- [ ] **Step 3: Implement `clearTheoryContent`**

Add this function to `theory-db.ts`, directly after `saveTheoryContent` (before the `NextBlankConcept` interface / `getNextBlankConcept`):

```ts
// Resets a concept's curriculum content back to blank — the same state a
// never-filled slot is in — without touching its scheduling progress
// (rung/next_review/your_answer). Mirrors saveTheoryContent's own
// pattern: no existence pre-check, the UPDATE simply matches nothing for
// an unknown concept_day, and the subsequent getTheoryConcept call
// returns null.
export function clearTheoryContent(db: Database, conceptDay: number): TheoryProgress | null {
  db.query(`UPDATE theory_schedule SET question = '', answer = '', answer_format = 'text' WHERE concept_day = ?`).run(
    conceptDay,
  );
  return getTheoryConcept(db, conceptDay);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test theory-db.test.ts`
Expected: PASS (all tests in the file, including the 4 new ones)

- [ ] **Step 5: Commit**

```bash
git add theory-db.ts theory-db.test.ts
git commit -m "feat: add clearTheoryContent to reset a concept back to blank"
```

---

### Task 2: `theory-api.ts` — `DELETE /api/theory/:day/content`

**Files:**
- Modify: `theory-api.ts`
- Test: `theory-api.test.ts`

**Interfaces:**
- Consumes: `clearTheoryContent` from `theory-db.ts` (Task 1); `parseConceptDay` (already exists in this file).
- Produces: `DELETE /api/theory/:day/content -> TheoryProgress`. Consumed by Task 3 (`TheoryApp.tsx`, via `fetch`).

- [ ] **Step 1: Add the failing tests**

Add these four tests to `theory-api.test.ts`:

```ts
test("DELETE /api/theory/:day/content clears question, answer, and answer_format to blank", async () => {
  await putContent(1, "Q", "https://example.com/pic.png", "image");
  const res = await fetch(`${base}/api/theory/1/content`, { method: "DELETE" });
  expect(res.status).toBe(200);
  const cleared: any = await res.json();
  expect(cleared.question).toBe("");
  expect(cleared.answer).toBe("");
  expect(cleared.answer_format).toBe("text");
});

test("DELETE /api/theory/:day/content leaves scheduling state untouched", async () => {
  await putContent(1, "Q", "A");
  await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  const res = await fetch(`${base}/api/theory/1/content`, { method: "DELETE" });
  const cleared: any = await res.json();
  expect(cleared.rung).toBe(0);
  expect(cleared.next_review).toBe(addDays(localToday(), 3));
});

test("DELETE /api/theory/:day/content removes the concept from the due list", async () => {
  await putContent(1, "Q", "A");
  await fetch(`${base}/api/theory/1/content`, { method: "DELETE" });
  const due: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(due.due.map((d: any) => d.concept_day)).not.toContain(1);
});

test("DELETE /api/theory/:day/content on an out-of-range day is rejected with 400", async () => {
  for (const bad of ["0", "151", "abc"]) {
    const res = await fetch(`${base}/api/theory/${bad}/content`, { method: "DELETE" });
    expect(res.status).toBe(400);
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test theory-api.test.ts`
Expected: FAIL — `DELETE` is not a handled method on `/api/theory/:day/content` yet (Bun returns 405 for an unhandled method on a route that only defines other verbs), so these tests fail on the `expect(res.status).toBe(...)` assertions.

- [ ] **Step 3: Add the `DELETE` handler**

Modify `theory-api.ts`:

1. Add `clearTheoryContent` to the import from `"./theory-db"`:

```ts
import type { Database } from "bun:sqlite";
import {
  clearTheoryContent,
  countOverdueTheory,
  countTheoryReviewsToday,
  getNextBlankConcept,
  listDueTheory,
  listTheoryCompletedToday,
  reviewTheoryConcept,
  saveTheoryAnswer,
  saveTheoryContent,
  type TheoryAnswerFormat,
} from "./theory-db";
```

2. Add a `DELETE` handler alongside the existing `PUT` handler on the `/api/theory/:day/content` route:

```ts
    "/api/theory/:day/content": {
      PUT: async (req: Request & { params: { day: string } }) => {
        const day = parseConceptDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_DAYS}` }, 400);
        const body = (await req.json().catch(() => null)) as
          | { question?: unknown; answer?: unknown; answerFormat?: unknown }
          | null;
        const question = typeof body?.question === "string" ? body.question.trim() : "";
        const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
        const answerFormat: TheoryAnswerFormat =
          body?.answerFormat === "image" || body?.answerFormat === "link" ? body.answerFormat : "text";
        if (!question || !answer) {
          return json({ error: "question and answer are required" }, 400);
        }
        if (answerFormat !== "text") {
          let isHttpUrl = false;
          try {
            const url = new URL(answer);
            isHttpUrl = url.protocol === "http:" || url.protocol === "https:";
          } catch {
            isHttpUrl = false;
          }
          if (!isHttpUrl) {
            return json({ error: `answer must be a valid http(s) URL when format is '${answerFormat}'` }, 400);
          }
        }
        const updated = saveTheoryContent(db, day, question, answer, answerFormat);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
      DELETE: (req: Request & { params: { day: string } }) => {
        const day = parseConceptDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_DAYS}` }, 400);
        const updated = clearTheoryContent(db, day);
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test theory-api.test.ts`
Expected: PASS (all tests in the file, including the 4 new ones)

- [ ] **Step 5: Run the full suite**

Run: `bun test`
Expected: PASS, all files.

- [ ] **Step 6: Commit**

```bash
git add theory-api.ts theory-api.test.ts
git commit -m "feat: add DELETE /api/theory/:day/content to clear a concept back to blank"
```

---

### Task 3: `TheoryApp.tsx` — Edit and Delete UI

**Files:**
- Modify: `TheoryApp.tsx`

**Interfaces:**
- Consumes: `DELETE /api/theory/:day/content` (Task 2, via `fetch`).
- Produces: none consumed by later tasks — this is the last task in this plan.

**No automated test** — per this codebase's established convention (no frontend test harness for `TheoryApp.tsx`), this task is verified manually in the browser.

- [ ] **Step 1: Add a `deleteContent` helper to the `api` object**

In `TheoryApp.tsx`, find the `api` object (it currently has `due`, `nextBlank`, `saveContent`, `saveAnswer`, `review`, `completedToday`). Add a `deleteContent` entry:

```ts
const api = {
  due: () =>
    fetch("/api/theory/due").then((r) => json<{ due: TheoryProgress[]; stats: Stats }>(r)),
  nextBlank: () =>
    fetch("/api/theory/next-blank").then((r) => json<{ conceptDay: number; category: string } | null>(r)),
  saveContent: (conceptDay: number, question: string, answer: string, answerFormat: TheoryAnswerFormat) =>
    fetch(`/api/theory/${conceptDay}/content`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, answer, answerFormat }),
    }).then((r) => json<TheoryProgress>(r)),
  deleteContent: (conceptDay: number) =>
    fetch(`/api/theory/${conceptDay}/content`, { method: "DELETE" }).then((r) => json<TheoryProgress>(r)),
  saveAnswer: (conceptDay: number, yourAnswer: string) =>
    fetch(`/api/theory/${conceptDay}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ yourAnswer }),
    }).then((r) => json<TheoryProgress>(r)),
  review: (conceptDay: number, result: Result) =>
    fetch(`/api/theory/${conceptDay}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }).then((r) => json<TheoryProgress>(r)),
  completedToday: () => fetch("/api/theory/completed-today").then((r) => json<TheoryProgress[]>(r)),
};
```

- [ ] **Step 2: Let `AddTheoryContentForm` pre-fill from existing content**

Find `AddTheoryContentForm` and change its props/initial state to accept an optional `initial` value, and its submit button's label to reflect edit vs. add:

```tsx
function AddTheoryContentForm({
  conceptDay,
  category,
  initial,
  onCancel,
  onSaved,
}: {
  conceptDay: number;
  category: string;
  initial?: { question: string; answer: string; answerFormat: TheoryAnswerFormat };
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [format, setFormat] = useState<TheoryAnswerFormat>(initial?.answerFormat ?? "text");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) {
          setError("Question and answer are both required.");
          return;
        }
        if (format !== "text" && !isValidUrl(answer.trim())) {
          setError(`Answer must be a valid http(s) URL when format is '${format}'.`);
          return;
        }
        try {
          await api.saveContent(conceptDay, question.trim(), answer.trim(), format);
          await onSaved();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to save.");
        }
      }}
    >
      <span
        className="cat-tag"
        style={{ "--cat-color": CATEGORY_COLORS[category as Category] } as React.CSSProperties}
      >
        {category}
      </span>
      <label>
        Question
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} autoFocus />
      </label>
      <label>
        Answer format
        <select value={format} onChange={(e) => setFormat(e.target.value as TheoryAnswerFormat)}>
          <option value="text">Text</option>
          <option value="image">Image (URL)</option>
          <option value="link">Link (URL)</option>
        </select>
      </label>
      <label>
        {ANSWER_FIELD_LABEL[format]}
        {format === "text" ? (
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} />
        ) : (
          <input type="url" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="https://..." />
        )}
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">
          {initial ? "Save changes" : `Save concept ${conceptDay}`}
        </button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Add Edit and Delete to `TheoryDetail`**

Replace the full `TheoryDetail` component with this version — it adds local `editing` state (matching `frontend.tsx`'s `Detail` component's own Edit/Delete pattern) and an early return that renders `AddTheoryContentForm` pre-filled when editing:

```tsx
function TheoryDetail({
  entry,
  onBack,
  onChanged,
  onError,
}: {
  entry: TheoryProgress;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  // Always starts blank, even if a previous answer was saved to this
  // concept — reopening is for practicing recall again, not reading back
  // what you wrote last time.
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);

  // Saving reveals the model answer immediately (so you can compare right
  // away) and clears the draft — the answer's already saved server-side,
  // no need to keep looking at what you just typed.
  const saveAnswer = async () => {
    await api.saveAnswer(entry.concept_day, draft);
    setRevealed(true);
    setDraft("");
  };

  const review = async (result: Result) => {
    await saveAnswer();
    const updated = await api.review(entry.concept_day, result);
    openTheoryCalendarAdd(entry.category, entry.question, updated.next_review);
    onChanged();
    onBack();
  };

  // saveAnswer/review are also called from each other (review awaits
  // saveAnswer directly, so a failure there still stops review from
  // continuing) — these wrappers are only for the button click handlers,
  // so a rejection surfaces in the top-level error banner instead of
  // becoming an unhandled rejection.
  const handleSaveAnswer = () => {
    onError(null);
    saveAnswer().catch((err) => onError(errorMessage(err)));
  };

  const handleReview = (result: Result) => {
    onError(null);
    review(result).catch((err) => onError(errorMessage(err)));
  };

  const handleDelete = () => {
    if (!confirm("Delete this concept's content? It resets to blank and won't show up again until refilled.")) {
      return;
    }
    onError(null);
    api
      .deleteContent(entry.concept_day)
      .then(() => {
        onChanged();
        onBack();
      })
      .catch((err) => onError(errorMessage(err)));
  };

  if (editing) {
    return (
      <AddTheoryContentForm
        conceptDay={entry.concept_day}
        category={entry.category}
        initial={{ question: entry.question, answer: entry.answer, answerFormat: entry.answer_format }}
        onCancel={() => setEditing(false)}
        onSaved={async () => {
          setEditing(false);
          onChanged();
          onBack();
        }}
      />
    );
  }

  return (
    <article className="detail theory-card">
      <header className="detail-head">
        <span
          className="cat-tag"
          style={{ "--cat-color": CATEGORY_COLORS[entry.category as Category] } as React.CSSProperties}
        >
          {entry.category}
        </span>
        <TheoryRungMeter rung={entry.rung} />
      </header>

      <h2 className="theory-question">{entry.question}</h2>

      <label className="theory-answer-label" htmlFor="theory-answer">Your answer</label>
      <textarea
        id="theory-answer"
        className="theory-answer"
        rows={8}
        spellCheck={false}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write your own answer before revealing the model answer..."
      />
      <div className="btn-row">
        <button className="btn" onClick={handleSaveAnswer}>Save answer</button>
      </div>

      {revealed ? (
        <div className="theory-model-answer">
          <div className="theory-model-answer-head">
            <h3>Model answer</h3>
            <button className="btn theory-toggle" onClick={() => setRevealed(false)}>Hide</button>
          </div>
          {entry.answer_format === "image" ? (
            <img className="theory-model-answer-image" src={entry.answer} alt="Model answer" />
          ) : entry.answer_format === "link" ? (
            <a
              className="theory-model-answer-link"
              href={entry.answer}
              target="_blank"
              rel="noopener noreferrer"
            >
              {entry.answer}
            </a>
          ) : (
            <p>{entry.answer}</p>
          )}
        </div>
      ) : (
        <button className="solution-cover" onClick={() => setRevealed(true)}>
          Model answer hidden — write your own answer first, then reveal
        </button>
      )}

      <div className="btn-row">
        <button className="btn btn-pass" onClick={() => handleReview("correct")}>
          Correct · next in {THEORY_LADDER[Math.min(entry.rung + 1, THEORY_LADDER.length - 1)]}d
        </button>
        <button className="btn btn-fail" onClick={() => handleReview("wrong")}>
          Wrong · repeat tomorrow
        </button>
        <span className="btn-spacer" />
        <button className="btn" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Run the full test suite (regression check)**

Run: `bun test`
Expected: PASS, all files (this task adds no new automated tests, but must not break any existing ones — e.g. the `.btn-danger` class already exists in `index.css` from the LeetCode tab's delete button, so no CSS changes are needed).

- [ ] **Step 5: Manually verify in the browser**

Run: `bun run dev`, open the app, go to the Theory tab, open a concept that already has content:
- **Edit:** click "Edit" — the form opens pre-filled with the current question/answer/format. Change the question text and save — you're returned to the board, and reopening the same concept shows the updated question.
- **Delete:** open a filled concept, click "Delete", confirm the dialog — you're returned to the board and that concept no longer appears in the due list. Use "+ Add theory" (it should now offer that same concept_day again, since `getNextBlankConcept` finds it) to confirm the concept's rung/next_review picked up where they left off rather than resetting (if the concept had already been reviewed before deleting its content).
- Confirm cancelling out of Edit (clicking "Cancel") returns to the detail view without saving changes.

- [ ] **Step 6: Commit**

```bash
git add TheoryApp.tsx
git commit -m "feat: add Edit and Delete to the Theory detail view"
```
