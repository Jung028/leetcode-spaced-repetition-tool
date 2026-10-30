# Flashcards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Flashcards" tab next to "Notes" — in both the desktop dashboard (`remote-access/App.tsx`) and the published phone/website page (`remote-access/notes/capture-entry.tsx`) — that studies exam-prep flashcards pasted/uploaded as Markdown, stored in the same private `notes-data` GitHub repo as notes (in their own `flashcards/` folder), grouped by Subject → Exam, studied one card at a time with flip-to-reveal.

**Architecture:** Mirrors the existing Notes feature's dual-client design exactly: a pure markdown parser decides the data shape; a `FlashcardsClient` interface is implemented twice — once talking to a new local Bun API route backed by the already-cloned `notes-data` git working copy (desktop), once talking directly to GitHub's Contents API with a cached PAT (phone/published site, no backend). Both feed the same React UI, and a new shared `StudyTabs` component (replacing the tab-switch logic duplicated today) renders the Notes/Flashcards tabs in both entry points so the published site gets the exact same feature.

**Tech Stack:** Bun (`bun:test`, `Bun.$`, `Bun.file`/`Bun.write`, `Bun.serve`), React (HTML-import bundling, no build config), the existing `notes-data` git-backed storage.

**Spec:** No separate spec file — the design was worked out and approved in conversation; this plan's Goal/Architecture above and each task's detail are that design in full. Deviating from anything stated here needs a check-in, same as any other plan.

## Global Constraints

- Use `bun test`, never `jest`/`vitest`; use `Bun.file`/`Bun.write`, never `node:fs` read/write helpers (existing `node:fs` usage in `notes-repo.ts` is limited to `existsSync`/`mkdirSync`/`readdirSync`, which stays the established pattern here too).
- Follow the existing `notes/*` files as the literal reference implementation for every mirrored piece — when this plan says "mirror X," read `remote-access/notes/X` before writing the new file.
- New files live in `remote-access/flashcards-page/` (already created, currently holds only two empty placeholder files — see Task 8 for cleanup) except `StudyTabs.tsx`, which lives at `remote-access/StudyTabs.tsx` (it bridges both `notes/` and `flashcards-page/`, same level as `App.tsx`).
- The flashcard markdown format (document this nowhere else — it's fixed by `flashcard-parser.ts`'s regexes in Task 1):
  - Line 1: `# <Subject> — Exam <number>` (a plain `-` is also accepted in place of `—`).
  - Each card: `### Q<number><optional letters>. <question text>`, followed by its answer (everything down to the next `###` heading or end of file).
  - Letter-suffixed cards (`Q1b`, `Q1c`) belong to the family of the same-numbered unsuffixed card (`Q1`).
- No offline pending-queue for flashcards (unlike notes) — `saveDeck` always writes straight through (local git commit+push, or a direct GitHub PUT). This is a deliberate simplification: decks are pasted deliberately while online, not jotted down offline like notes.
- `FlashcardDeck` identity for overwrite purposes is `(subjectSlug, examSlug)`; saving a deck with the same subject+exam replaces that deck's file in place.

## Review Focus

- Pasting a deck copied from Windows (CRLF line endings) must parse identically to LF — the parser normalizes `\r\n` before processing (Task 1 test).
- Re-pasting the same Subject+Exam must overwrite that one deck, never duplicate it as a second file (Task 3 + Task 4 tests).
- A `##`/`###` heading inside an answer body that isn't a `Qn.`-shaped line (e.g. a student wrote `### Note:` inside their answer) must not be mistaken for a new card boundary (Task 1 test).
- An expired/rejected GitHub token on a flashcard save must clear the cached token and say so, exactly like the notes GitHub client already does — not leave the user stuck retrying with a dead token (Task 6 test).
- A stale GitHub `sha` on save (someone else — e.g. the phone — updated the same deck first) must retry once with the fresh `sha` and succeed rather than silently losing the edit (Task 6 test), and on the desktop/local side the existing `pullChanges`/`pushLocalChanges` rebase-with-theirs machinery must keep working when flashcards share the same clone as notes (Task 4 test, mirroring `notes-repo.test.ts`'s diverged-history coverage).

---

### Task 1: Flashcard markdown parser

**Files:**
- Create: `remote-access/flashcards-page/flashcard-parser.ts`
- Test: `remote-access/flashcards-page/flashcard-parser.test.ts`

**Interfaces:**
- Produces (used by every later task):
  ```ts
  export interface Flashcard {
    id: string;              // `q${number}${part ?? ""}`, e.g. "q1", "q1b"
    number: string;          // "1"
    part: string | null;     // "b", or null for the unsuffixed base question
    question: string;
    answer: string;
  }
  export interface FlashcardDeck {
    subject: string;      // as written, e.g. "INFO5990"
    subjectSlug: string;  // slugify(subject), e.g. "info5990"
    exam: string;         // as written, e.g. "2"
    examSlug: string;     // slugify(exam), e.g. "2"
    cards: Flashcard[];   // document order
  }
  export class FlashcardParseError extends Error {}
  export function parseFlashcardDeck(markdown: string): FlashcardDeck
  ```

- [ ] **Step 1: Write the failing tests**

```ts
import { test, expect } from "bun:test";
import { parseFlashcardDeck, FlashcardParseError } from "./flashcard-parser";

test("parses the subject/exam header and a single question", () => {
  const deck = parseFlashcardDeck(`# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`);
  expect(deck.subject).toBe("INFO5990");
  expect(deck.subjectSlug).toBe("info5990");
  expect(deck.exam).toBe("2");
  expect(deck.examSlug).toBe("2");
  expect(deck.cards).toEqual([
    { id: "q1", number: "1", part: null, question: "What is a MAC?", answer: "A shared-secret code." },
  ]);
});

test("accepts a plain hyphen instead of an em dash in the header", () => {
  const deck = parseFlashcardDeck(`# INFO5990 - Exam 2\n\n### Q1. x?\ny\n`);
  expect(deck.subject).toBe("INFO5990");
});

test("normalizes CRLF line endings the same as LF", () => {
  const lf = parseFlashcardDeck("# S — Exam 1\n\n### Q1. x?\ny\n");
  const crlf = parseFlashcardDeck("# S — Exam 1\r\n\r\n### Q1. x?\r\ny\r\n");
  expect(crlf).toEqual(lf);
});

test("parses lettered sub-parts as belonging to the same number, in document order", () => {
  const deck = parseFlashcardDeck(
    `# S — Exam 1\n\n### Q1. stem?\nstem answer\n\n### Q1b. part b?\nb answer\n\n### Q2. next?\nnext answer\n`,
  );
  expect(deck.cards.map((c) => c.id)).toEqual(["q1", "q1b", "q2"]);
  expect(deck.cards[1]).toEqual({ id: "q1b", number: "1", part: "b", question: "part b?", answer: "b answer" });
});

test("a multi-paragraph answer is preserved, trimmed of leading/trailing blank lines", () => {
  const deck = parseFlashcardDeck(`# S — Exam 1\n\n### Q1. x?\nline one\n\nline two\n\n`);
  expect(deck.cards[0]!.answer).toBe("line one\n\nline two");
});

test("a heading inside an answer that isn't a Qn. line stays part of that card's answer", () => {
  const deck = parseFlashcardDeck(`# S — Exam 1\n\n### Q1. x?\n### Note: not a new card\nstill the answer\n`);
  expect(deck.cards.length).toBe(1);
  expect(deck.cards[0]!.answer).toBe("### Note: not a new card\nstill the answer");
});

test("slugifies subject and exam for filenames (spaces, case, punctuation)", () => {
  const deck = parseFlashcardDeck(`# COMP 5348, Enterprise — Exam Final\n\n### Q1. x?\ny\n`);
  expect(deck.subjectSlug).toBe("comp-5348-enterprise");
  expect(deck.examSlug).toBe("final");
});

test("throws a clear error when the header line is missing or malformed", () => {
  expect(() => parseFlashcardDeck("### Q1. x?\ny\n")).toThrow(FlashcardParseError);
  expect(() => parseFlashcardDeck("# just a subject\n\n### Q1. x?\ny\n")).toThrow(/Subject .* Exam/);
});

test("throws a clear error when there are zero questions", () => {
  expect(() => parseFlashcardDeck("# S — Exam 1\n\nno cards here\n")).toThrow(/no questions found/);
});

test("throws on a duplicate question id within the same file", () => {
  expect(() =>
    parseFlashcardDeck(`# S — Exam 1\n\n### Q1. a?\nx\n\n### Q1. b?\ny\n`),
  ).toThrow(/duplicate question id/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test remote-access/flashcards-page/flashcard-parser.test.ts`
Expected: FAIL (`flashcard-parser.ts` doesn't exist yet)

- [ ] **Step 3: Implement `parseFlashcardDeck` in `remote-access/flashcards-page/flashcard-parser.ts`**

Use these exact patterns (they're the contract the tests above pin down):

```ts
const HEADER_RE = /^#\s+(.+?)\s*[—-]\s*Exam\s+(\S.*?)\s*$/i;
const QUESTION_RE = /^###\s+Q(\d+)([a-zA-Z]*)\.\s*(.*)$/i;

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
```

Algorithm: normalize `\r\n` → `\n` and split into lines. Skip leading blank lines, then match `HEADER_RE` against the first non-blank line — on failure throw `FlashcardParseError` with a message containing both "Subject" and "Exam" (e.g. `the first line must look like "# Subject — Exam N" (e.g. "# INFO5990 — Exam 2")`). Then walk the remaining lines: a line matching `QUESTION_RE` flushes the in-progress card (if any) and starts a new one (`number` = group 1, `part` = group 2 lowercased or `null` if empty, `question` = group 3); every other line appends to the current card's answer buffer (lines before the first question heading are ignored, not an error). At the end, flush the last card. Flushing builds `id` as `` `q${number}${part ?? ""}` ``, throws `FlashcardParseError` containing "duplicate question id" if that id was already flushed, trims `question`/joined-answer, and pushes the card. After the walk, throw `FlashcardParseError` containing "no questions found" if `cards.length === 0`. Return `{ subject, subjectSlug: slugify(subject), exam, examSlug: slugify(exam), cards }`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test remote-access/flashcards-page/flashcard-parser.test.ts`
Expected: PASS, all tests green

- [ ] **Step 5: Commit**

```bash
git add remote-access/flashcards-page/flashcard-parser.ts remote-access/flashcards-page/flashcard-parser.test.ts
git commit -m "feat(flashcards): add the flashcard markdown parser"
```

---

### Task 2: Deck grouping (Subject → Exam)

**Files:**
- Create: `remote-access/flashcards-page/flashcards-grouping.ts`
- Test: `remote-access/flashcards-page/flashcards-grouping.test.ts`

**Interfaces:**
- Consumes: `FlashcardDeck` from Task 1 (`./flashcard-parser`).
- Produces:
  ```ts
  export interface SubjectGroup {
    subject: string;
    subjectSlug: string;
    decks: FlashcardDeck[]; // sorted by exam, numeric-aware
  }
  export function groupDecksBySubject(decks: FlashcardDeck[]): SubjectGroup[]
  ```

- [ ] **Step 1: Write the failing tests**

```ts
import { test, expect } from "bun:test";
import { groupDecksBySubject } from "./flashcards-grouping";
import type { FlashcardDeck } from "./flashcard-parser";

function deck(subject: string, exam: string): FlashcardDeck {
  return {
    subject,
    subjectSlug: subject.toLowerCase(),
    exam,
    examSlug: exam.toLowerCase(),
    cards: [{ id: "q1", number: "1", part: null, question: "q", answer: "a" }],
  };
}

test("empty input returns an empty array", () => {
  expect(groupDecksBySubject([])).toEqual([]);
});

test("groups decks under the same subject and keeps the subject's display label", () => {
  const groups = groupDecksBySubject([deck("INFO5990", "1"), deck("INFO5990", "2")]);
  expect(groups.length).toBe(1);
  expect(groups[0]!.subject).toBe("INFO5990");
  expect(groups[0]!.decks.length).toBe(2);
});

test("sorts decks within a subject numerically, not lexically (Exam 2 before Exam 10)", () => {
  const groups = groupDecksBySubject([deck("S", "10"), deck("S", "2")]);
  expect(groups[0]!.decks.map((d) => d.exam)).toEqual(["2", "10"]);
});

test("falls back to string comparison when an exam label isn't numeric", () => {
  const groups = groupDecksBySubject([deck("S", "Final"), deck("S", "Mid")]);
  expect(groups[0]!.decks.map((d) => d.exam)).toEqual(["Final", "Mid"]);
});

test("sorts subjects alphabetically", () => {
  const groups = groupDecksBySubject([deck("INFO6007", "1"), deck("INFO5990", "1")]);
  expect(groups.map((g) => g.subject)).toEqual(["INFO5990", "INFO6007"]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test remote-access/flashcards-page/flashcards-grouping.test.ts`
Expected: FAIL (module doesn't exist)

- [ ] **Step 3: Implement `groupDecksBySubject` in `remote-access/flashcards-page/flashcards-grouping.ts`**

Group by `subjectSlug` into a `Map`, keeping the first-seen deck's `subject` label for the group. Sort each group's `decks` with a comparator that uses `Number(a.exam) - Number(b.exam)` when both sides parse as finite numbers, else `a.exam.localeCompare(b.exam)`. Sort the groups themselves by `a.subject.localeCompare(b.subject)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test remote-access/flashcards-page/flashcards-grouping.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add remote-access/flashcards-page/flashcards-grouping.ts remote-access/flashcards-page/flashcards-grouping.test.ts
git commit -m "feat(flashcards): group decks by subject and exam"
```

---

### Task 3: Git-backed flashcards repo (desktop storage)

**Files:**
- Modify: `remote-access/notes/notes-repo.ts` (export the existing private `assertOwnRepo` function — add the `export` keyword to its declaration; no behavior change)
- Create: `remote-access/flashcards-page/flashcards-repo.ts`
- Test: `remote-access/flashcards-page/flashcards-repo.test.ts`

**Interfaces:**
- Consumes: `parseFlashcardDeck`, `FlashcardDeck`, `FlashcardParseError` from Task 1; `assertOwnRepo` from `../notes/notes-repo` (after this task exports it).
- Produces:
  ```ts
  export async function readDecks(clonePath: string): Promise<FlashcardDeck[]>
  export async function writeDeck(clonePath: string, markdown: string): Promise<FlashcardDeck>
  ```
- Storage layout: `${clonePath}/flashcards/${deck.subjectSlug}/exam-${deck.examSlug}.md`, raw markdown as given (not re-serialized).

- [ ] **Step 1: Write the failing tests**

Mirror `remote-access/notes/notes-repo.test.ts`'s `beforeEach`/`afterEach` setup exactly (bare remote + `ensureNotesRepoCloned` + `configureIdentity`, imported from `../notes/notes-repo`).

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureNotesRepoCloned } from "../notes/notes-repo";
import { readDecks, writeDeck } from "./flashcards-repo";
import { FlashcardParseError } from "./flashcard-parser";

// ...same root/remoteDir/cloneDir beforeEach/afterEach as notes-repo.test.ts...

const SAMPLE = `# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`;

test("writeDeck creates a nested markdown file and readDecks returns the parsed deck", async () => {
  await writeDeck(cloneDir, SAMPLE);
  const decks = await readDecks(cloneDir);
  expect(decks.length).toBe(1);
  expect(decks[0]!.subject).toBe("INFO5990");
  expect(existsSync(join(cloneDir, "flashcards", "info5990", "exam-2.md"))).toBe(true);
});

test("readDecks returns an empty array when the flashcards directory doesn't exist yet", async () => {
  expect(await readDecks(cloneDir)).toEqual([]);
});

test("writeDeck for the same subject and exam overwrites rather than duplicating", async () => {
  await writeDeck(cloneDir, SAMPLE);
  const updated = SAMPLE.replace("What is a MAC?", "What is a nonce?");
  await writeDeck(cloneDir, updated);
  const decks = await readDecks(cloneDir);
  expect(decks.length).toBe(1);
  expect(decks[0]!.cards[0]!.question).toBe("What is a nonce?");
});

test("readDecks reads multiple subjects and multiple exams per subject", async () => {
  await writeDeck(cloneDir, SAMPLE);
  await writeDeck(cloneDir, SAMPLE.replace("Exam 2", "Exam 3"));
  await writeDeck(cloneDir, SAMPLE.replace("INFO5990", "INFO6007"));
  const decks = await readDecks(cloneDir);
  expect(decks.length).toBe(3);
});

test("writeDeck rejects malformed markdown before touching disk", async () => {
  await expect(writeDeck(cloneDir, "not a deck")).rejects.toThrow(FlashcardParseError);
  expect(existsSync(join(cloneDir, "flashcards"))).toBe(false);
});

test("writeDeck refuses to run when the clone path is not a git repository at all", async () => {
  const plainDir = join(root, "plain-dir");
  mkdirSync(plainDir, { recursive: true });
  await expect(writeDeck(plainDir, SAMPLE)).rejects.toThrow(/is not a git repository/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test remote-access/flashcards-page/flashcards-repo.test.ts`
Expected: FAIL

- [ ] **Step 3: Export `assertOwnRepo` from `remote-access/notes/notes-repo.ts`**

Change `async function assertOwnRepo(` to `export async function assertOwnRepo(` — nothing else in that file changes.

- [ ] **Step 4: Implement `readDecks`/`writeDeck` in `remote-access/flashcards-page/flashcards-repo.ts`**

`readDecks`: if `${clonePath}/flashcards` doesn't exist, return `[]`. Otherwise `readdirSync(dir, { withFileTypes: true })`, filter directories (one per subject), and for each subject directory `readdirSync` its `.md` files, `Bun.file(...).text()` each, `parseFlashcardDeck` it, and collect all decks into one flat array (order doesn't matter — the UI groups/sorts it).

`writeDeck`: `await assertOwnRepo(clonePath)` first (so the path-safety check runs before anything else, matching `writeNote`'s order), then `parseFlashcardDeck(markdown)` (so a parse error never touches disk), then `mkdirSync` the subject directory `recursive: true`, then `Bun.write` the raw `markdown` string to `exam-${deck.examSlug}.md` inside it, then return the parsed `deck`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test remote-access/flashcards-page/flashcards-repo.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add remote-access/notes/notes-repo.ts remote-access/flashcards-page/flashcards-repo.ts remote-access/flashcards-page/flashcards-repo.test.ts
git commit -m "feat(flashcards): add git-backed deck storage for the desktop app"
```

---

### Task 4: Local HTTP API + server wiring

**Files:**
- Create: `remote-access/flashcards-page/flashcards-api.ts`
- Test: `remote-access/flashcards-page/flashcards-api.test.ts`
- Modify: `index.ts` (wire the new routes in)

**Interfaces:**
- Consumes: `readDecks`, `writeDeck` from Task 3; `pullChanges`, `pushLocalChanges` from `../notes/notes-repo` (already exported); `FlashcardParseError` from Task 1.
- Produces: `export function flashcardsApiRoutes(clonePath: string)` — a `Bun.serve` `routes` fragment with one path, mirroring `notesApiRoutes`'s shape (`../notes/notes-api.ts`).
  - `GET /api/flashcards` → best-effort `pullChanges` (swallow failure, same as `notesApiRoutes`'s pattern elsewhere of not letting a sync nicety block a read) → `readDecks` → `200` with `FlashcardDeck[]`, or `503 { error }` if `readDecks` itself throws.
  - `POST /api/flashcards` → body `{ markdown: string }`; `400 { error: "markdown is required" }` if missing/blank; best-effort `pullChanges`; `writeDeck` + `pushLocalChanges`; `200` with the saved `FlashcardDeck` on success; `400 { error: <message> }` if `writeDeck` throws `FlashcardParseError`; `503 { error: "could not save flashcard deck: <message>" }` for any other failure.

- [ ] **Step 1: Write the failing tests**

Mirror `remote-access/notes/notes-api.test.ts`'s `beforeEach`/`afterEach` (bare remote with an initial commit, `ensureNotesRepoCloned`, `Bun.serve({ port: 0, routes: flashcardsApiRoutes(cloneDir) })`).

```ts
const SAMPLE = `# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`;

test("GET /api/flashcards returns an empty list initially", async () => {
  const res = await fetch(`${base}/api/flashcards`);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual([]);
});

test("POST /api/flashcards creates a deck and GET reflects it", async () => {
  const res = await fetch(`${base}/api/flashcards`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ markdown: SAMPLE }),
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.subject).toBe("INFO5990");
  const list = await (await fetch(`${base}/api/flashcards`)).json();
  expect(list.length).toBe(1);
});

test("POST /api/flashcards rejects missing markdown", async () => {
  const res = await fetch(`${base}/api/flashcards`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  expect(res.status).toBe(400);
});

test("POST /api/flashcards rejects malformed markdown with the parser's own message", async () => {
  const res = await fetch(`${base}/api/flashcards`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ markdown: "not a deck" }),
  });
  expect(res.status).toBe(400);
  expect((await res.json()).error).toMatch(/Subject .* Exam/);
});

test("POST /api/flashcards commits and pushes", async () => {
  await fetch(`${base}/api/flashcards`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ markdown: SAMPLE }),
  });
  const status = (await Bun.$`git status --porcelain`.cwd(cloneDir).quiet().text()).trim();
  expect(status).toBe("");
});

test("POST /api/flashcards for the same subject+exam twice overwrites, not duplicates", async () => {
  await fetch(`${base}/api/flashcards`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ markdown: SAMPLE }) });
  await fetch(`${base}/api/flashcards`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ markdown: SAMPLE.replace("MAC", "nonce") }) });
  const list = await (await fetch(`${base}/api/flashcards`)).json();
  expect(list.length).toBe(1);
});

test("a deck pushed from a different clone shows up after a GET (pull-before-read)", async () => {
  const otherCloneDir = join(root, "other-clone");
  await ensureNotesRepoCloned(otherCloneDir, remoteDir);
  await Bun.$`git config user.email test@example.com`.cwd(otherCloneDir).quiet();
  await Bun.$`git config user.name "Test User"`.cwd(otherCloneDir).quiet();
  const otherServer = Bun.serve({ port: 0, routes: flashcardsApiRoutes(otherCloneDir) });
  await fetch(`${otherServer.url.origin}/api/flashcards`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ markdown: SAMPLE }) });
  otherServer.stop(true);

  const list = await (await fetch(`${base}/api/flashcards`)).json();
  expect(list.length).toBe(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test remote-access/flashcards-page/flashcards-api.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `flashcardsApiRoutes` in `remote-access/flashcards-page/flashcards-api.ts`**

Follow `../notes/notes-api.ts`'s structure/error-shape conventions exactly (its `json()` helper, try/catch-to-status-code pattern). `await pullChanges(clonePath).catch(() => {})` before both the `GET` read and the `POST` write, same reasoning as `NotesView`'s existing "pull is a nicety, never block on it" behavior elsewhere in this codebase.

- [ ] **Step 4: Wire the routes into `index.ts`**

Add `import { flashcardsApiRoutes } from "./remote-access/flashcards-page/flashcards-api";` near the existing `notesApiRoutes` import, and `...flashcardsApiRoutes(NOTES_CLONE_PATH),` right after `...notesApiRoutes(NOTES_CLONE_PATH),` in the `routes` object — same `clonePath`, since flashcards live in the same `notes-data` clone as notes, just a different subfolder.

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test remote-access/flashcards-page/flashcards-api.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add remote-access/flashcards-page/flashcards-api.ts remote-access/flashcards-page/flashcards-api.test.ts index.ts
git commit -m "feat(flashcards): add the local flashcards HTTP API"
```

---

### Task 5: `FlashcardsClient` interface + local browser client (desktop)

**Files:**
- Modify: `remote-access/notes/local-client.ts` (export the existing private `readErrorMessage` function — add `export`; no behavior change)
- Create: `remote-access/flashcards-page/flashcards-client.ts`
- Create: `remote-access/flashcards-page/flashcards-local-client.ts`
- Test: `remote-access/flashcards-page/flashcards-local-client.test.ts`

**Interfaces:**
- Consumes: `FlashcardDeck` from Task 1; `readErrorMessage`, `FetchLike` from `../notes/local-client` (after this task exports `readErrorMessage`; `FetchLike` is already exported); `flashcardsApiRoutes` from Task 4 (test only); `ensureNotesRepoCloned` from `../notes/notes-repo` (test only).
- Produces:
  ```ts
  // flashcards-client.ts
  export interface FlashcardsClient {
    listDecks(): Promise<FlashcardDeck[]>;
    saveDeck(markdown: string): Promise<FlashcardDeck>;
  }
  // flashcards-local-client.ts
  export function createFlashcardsLocalClient(fetchFn?: FetchLike): FlashcardsClient
  ```

- [ ] **Step 1: Write the failing tests**

Mirror `remote-access/notes/local-client.test.ts`'s `beforeEach`/`afterEach` (real temp git remote+clone, real `Bun.serve` on the Task 4 routes, `scopedFetch` wrapper).

```ts
const SAMPLE = `# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`;

test("listDecks returns an empty array initially", async () => {
  expect(await client.listDecks()).toEqual([]);
});

test("saveDeck then listDecks round-trips the deck", async () => {
  const saved = await client.saveDeck(SAMPLE);
  expect(saved.subject).toBe("INFO5990");
  const decks = await client.listDecks();
  expect(decks.some((d) => d.subjectSlug === "info5990" && d.examSlug === "2")).toBe(true);
});

test("the server's JSON error field becomes the thrown message", async () => {
  const stubFetch: FetchLike = async () => Response.json({ error: "flashcards repo not available: boom" }, { status: 503 });
  await expect(createFlashcardsLocalClient(stubFetch).listDecks()).rejects.toThrow(
    new Error("flashcards repo not available: boom"),
  );
});

test("a non-JSON error response falls back to the status-code message", async () => {
  const stubFetch: FetchLike = async () => new Response("<html>bad gateway</html>", { status: 502 });
  await expect(createFlashcardsLocalClient(stubFetch).saveDeck(SAMPLE)).rejects.toThrow(
    new Error("could not save flashcard deck (502)"),
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test remote-access/flashcards-page/flashcards-local-client.test.ts`
Expected: FAIL

- [ ] **Step 3: Export `readErrorMessage` from `remote-access/notes/local-client.ts`**

Change `async function readErrorMessage(` to `export async function readErrorMessage(`.

- [ ] **Step 4: Implement `flashcards-client.ts` and `flashcards-local-client.ts`**

`flashcards-client.ts` is just the interface above, importing `FlashcardDeck` as a type from `./flashcard-parser`.

`createFlashcardsLocalClient` mirrors `createLocalClient` in `../notes/local-client.ts`: `listDecks` does `GET /api/flashcards`, throws via `readErrorMessage(res, \`could not load flashcards (${res.status})\`)` on failure, else returns the JSON body as `FlashcardDeck[]`. `saveDeck(markdown)` does `POST /api/flashcards` with `{ markdown }` as the JSON body, throws via `readErrorMessage(res, \`could not save flashcard deck (${res.status})\`)` on failure, else returns the JSON body as `FlashcardDeck`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test remote-access/flashcards-page/flashcards-local-client.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add remote-access/notes/local-client.ts remote-access/flashcards-page/flashcards-client.ts remote-access/flashcards-page/flashcards-local-client.ts remote-access/flashcards-page/flashcards-local-client.test.ts
git commit -m "feat(flashcards): add the FlashcardsClient interface and the desktop's local client"
```

---

### Task 6: GitHub-direct browser client (phone / published site)

**Files:**
- Modify: `remote-access/notes/github-client.ts` (export three existing private helpers — add `export` to `throwIfAuthFailure`, `toBase64`, `fromBase64`; no behavior change)
- Create: `remote-access/flashcards-page/flashcards-github-client.ts`
- Test: `remote-access/flashcards-page/flashcards-github-client.test.ts`

**Interfaces:**
- Consumes: `throwIfAuthFailure`, `toBase64`, `fromBase64`, `TOKEN_STORAGE_KEY` from `../notes/github-client` (first three after this task exports them; `TOKEN_STORAGE_KEY` is already exported); `parseFlashcardDeck`, `FlashcardDeck` from Task 1.
- Produces:
  ```ts
  export function createFlashcardsGithubClient(opts: {
    owner: string; repo: string; token: string; storage: Storage; fetchFn?: typeof fetch;
  }): FlashcardsClient
  ```
- Contents API paths: list subjects via `GET contents/flashcards` (dirs), list a subject's decks via `GET contents/flashcards/<subjectSlug>` (files), read/write a deck via `contents/flashcards/<subjectSlug>/exam-<examSlug>.md`.

- [ ] **Step 1: Write the failing tests**

Reuse the `MemoryStorage` class from `remote-access/notes/github-client.test.ts` (copy it in — it's an 18-line local test double, not worth importing across a test file).

```ts
const SAMPLE = `# INFO5990 — Exam 2\n\n### Q1. What is a MAC?\nA shared-secret code.\n`;

test("saveDeck PUTs to the correct nested contents URL with the auth header", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") { calls.push({ url, init: init! }); return Response.json({ content: { sha: "s1" } }, { status: 201 }); }
    return new Response("Not Found", { status: 404 }); // no existing file — fresh create
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.saveDeck(SAMPLE);
  expect(calls.length).toBe(1);
  expect(calls[0]!.url).toContain("api.github.com/repos/me/notes-data/contents/flashcards/info5990/exam-2.md");
  expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe("Bearer t");
});

test("saveDeck with malformed markdown throws before any network call", async () => {
  const fetchFn = (async () => { throw new Error("should not be called"); }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await expect(client.saveDeck("not a deck")).rejects.toThrow(/Subject .* Exam/);
});

test("listDecks lists subject directories, then each subject's deck files, decoding and parsing each", async () => {
  const fetchFn = (async (url: string) => {
    if (url.endsWith("/contents/flashcards")) return Response.json([{ name: "info5990", type: "dir" }]);
    if (url.endsWith("/contents/flashcards/info5990")) return Response.json([{ name: "exam-2.md", type: "file" }]);
    if (url.endsWith("/contents/flashcards/info5990/exam-2.md")) return Response.json({ content: btoa(SAMPLE), sha: "sha-1" });
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  const decks = await client.listDecks();
  expect(decks).toEqual([expect.objectContaining({ subject: "INFO5990", exam: "2" })]);
});

test("listDecks returns an empty array when the flashcards directory doesn't exist yet", async () => {
  const fetchFn = (async () => new Response("Not Found", { status: 404 })) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  expect(await client.listDecks()).toEqual([]);
});

test("saveDeck on a 401 clears the stored token and says so", async () => {
  storage.setItem(TOKEN_STORAGE_KEY, "expired");
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") return new Response("Bad credentials", { status: 401 });
    return new Response("Not Found", { status: 404 });
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "expired", storage, fetchFn });
  await expect(client.saveDeck(SAMPLE)).rejects.toThrow(/Refresh this page to enter a new one/);
  expect(storage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
});

test("saveDeck retries once with a fresh sha when GitHub rejects a stale one, then succeeds", async () => {
  let currentSha = "sha-v1";
  let putAttempts = 0;
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") {
      putAttempts += 1;
      const sentSha = JSON.parse(String(init.body)).sha;
      if (sentSha !== currentSha && sentSha !== undefined) return new Response("Conflict", { status: 409 });
      currentSha = "sha-after-update";
      return Response.json({ content: { sha: currentSha } }, { status: 200 });
    }
    if (url.endsWith("/exam-2.md")) return Response.json({ content: btoa(SAMPLE), sha: currentSha });
    return new Response("Not Found", { status: 404 });
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await client.saveDeck(SAMPLE); // caches sha-v1
  currentSha = "sha-v2"; // simulate the phone updating it first
  await client.saveDeck(SAMPLE.replace("MAC", "nonce"));
  expect(putAttempts).toBeGreaterThanOrEqual(2);
});

test("saveDeck surfaces a clear error when the retry also hits a stale sha", async () => {
  const fetchFn = (async (url: string, init?: RequestInit) => {
    if (init?.method === "PUT") return new Response("Conflict", { status: 409 });
    return new Response("Not Found", { status: 404 });
  }) as unknown as typeof fetch;
  const client = createFlashcardsGithubClient({ owner: "me", repo: "notes-data", token: "t", storage, fetchFn });
  await expect(client.saveDeck(SAMPLE)).rejects.toThrow(/\(409\)/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test remote-access/flashcards-page/flashcards-github-client.test.ts`
Expected: FAIL

- [ ] **Step 3: Export the three helpers from `remote-access/notes/github-client.ts`**

Add `export` to `function throwIfAuthFailure(`, `function toBase64(`, and `function fromBase64(`. No other change to that file.

- [ ] **Step 4: Implement `createFlashcardsGithubClient` in `remote-access/flashcards-page/flashcards-github-client.ts`**

Build `contentsUrl(path)` exactly like `../notes/github-client.ts`. `listDecks`: `GET contents/flashcards` (404 → `[]`; else `throwIfAuthFailure` then filter `type === "dir"`), then for each subject dir `GET contents/flashcards/<subjectSlug>` (404 → skip; filter `type === "file" && name.endsWith(".md")`), then for each file `GET contents/flashcards/<subjectSlug>/<name>`, `throwIfAuthFailure`, decode via `fromBase64`, `parseFlashcardDeck` it, cache its `sha` keyed by `` `${subjectSlug}/${examSlug}` `` for later saves, and collect into the returned array. `saveDeck(markdown)`: `parseFlashcardDeck(markdown)` first (so malformed input never reaches `fetch`, per the test above); look up a cached `sha` for the deck's key, falling back to a `GET` on its path (404 → no `sha`, this is a new file); `PUT` with `{ message, content: toBase64(markdown), sha? }`; on `409`/`422`, re-`GET` the path for a fresh `sha` and retry the `PUT` once — if that also fails, throw `` `GitHub rejected the deck (${status})` ``; `throwIfAuthFailure` after every GitHub call; on success cache the returned `content.sha` and return the parsed `deck`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test remote-access/flashcards-page/flashcards-github-client.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add remote-access/notes/github-client.ts remote-access/flashcards-page/flashcards-github-client.ts remote-access/flashcards-page/flashcards-github-client.test.ts
git commit -m "feat(flashcards): add the GitHub-direct client for the phone/published site"
```

---

### Task 7: Flashcards UI

**Files:**
- Create: `remote-access/flashcards-page/FlashcardsSidebar.tsx`
- Create: `remote-access/flashcards-page/FlashcardsDeckUploader.tsx`
- Create: `remote-access/flashcards-page/FlashcardsCard.tsx`
- Modify: `remote-access/flashcards-page/FlashcardsView.tsx` (currently empty)
- Modify: `remote-access/notes/notes.css` (append flashcard + tab styles; this file is intentionally the single shared stylesheet both the desktop tab and the phone bundle load — see its own header comment)

**Interfaces:**
- Consumes: `SubjectGroup` (Task 2), `FlashcardDeck`/`Flashcard` (Task 1), `FlashcardsClient` (Task 5).
- Produces: `export default function FlashcardsView({ client }: { client: FlashcardsClient }): JSX.Element` — the piece `StudyTabs` (Task 8) renders.

No new test files in this task — this codebase's existing presentational components (`NotesComposer`, `NotesSidebar`, `NotesTimeline`) have no unit tests either; they're verified by running the app (Task 8's final step covers that for the whole feature, UI included).

- [ ] **Step 1: `FlashcardsSidebar.tsx`**

Props: `{ groups: SubjectGroup[]; selectedSubjectSlug: string | null; selectedExamSlug: string | null; onSelectDeck: (subjectSlug: string, examSlug: string) => void }`. Structurally mirror `../notes/NotesSidebar.tsx`: a `<nav className="flashcards-sidebar">`, one `<section className="flashcards-subject">` per group with an `<h3 className="flashcards-subject-heading">{group.subject}</h3>`, and a `<ul className="flashcards-deck-list">` of `<button className="flashcards-deck-item">` (plus `flashcards-deck-item-active` when `group.subjectSlug === selectedSubjectSlug && deck.examSlug === selectedExamSlug`) reading `Exam {deck.exam}` with a `<span className="flashcards-deck-count">{deck.cards.length}</span>`. When `groups.length === 0`, render `<p className="flashcards-empty">No decks yet — paste one below</p>`.

- [ ] **Step 2: `FlashcardsDeckUploader.tsx`**

Props: `{ value: string; onChange: (text: string) => void; onSave: () => void; busy: boolean }`. A `<details className="flashcards-uploader">` (collapsed by default — matches this codebase's existing collapsed-by-default `<details className="notes-training">` convention in `remote-access/App.tsx`) with `<summary>Add / update a deck</summary>`, a `<textarea>` bound to `value`/`onChange` with a placeholder showing the format (`# INFO5990 — Exam 2`, a blank line, `### Q1. ...`, the answer, a blank line, `### Q1b. ...`), a `<div className="flashcards-uploader-footer">` holding a `<input type="file" accept=".md,text/markdown">` whose `onChange` reads `e.target.files?.[0]` via `await file.text()` into `onChange(...)` (then resets `e.target.value = ""` so picking the same file twice still fires `onChange`), and a `<button disabled={busy || !value.trim()} onClick={onSave}>Save deck</button>`.

- [ ] **Step 3: `FlashcardsCard.tsx`**

Props: `{ deck: FlashcardDeck; cardIndex: number; flipped: boolean; onFlip: () => void; onPrev: () => void; onNext: () => void }`. `const card = deck.cards[cardIndex]`; if `card.part` is non-null, look up `deck.cards.find(c => c.number === card.number && c.part === null)` as the `stem` and, if found, render it pinned above the card in a `<p className="flashcards-card-stem">` (label `Q{stem.number}` in a `<span className="flashcards-card-stem-label">`, then `stem.question`). Render the card itself as a `<button type="button" className="flashcards-card" onClick={onFlip}>` containing a `<span className="flashcards-card-label">` reading `` `Q${card.number}${card.part ? card.part.toUpperCase() : ""}` ``, a `<p className="flashcards-card-text">{flipped ? card.answer : card.question}</p>` (CSS already has `white-space: pre-wrap` for this — see Step 5), and a `<span className="flashcards-card-hint">` reading "Tap to reveal the answer" / "Tap to see the question". Below it, a `<div className="flashcards-card-nav">` with a Prev button (`disabled={cardIndex === 0}`), a `<span className="flashcards-card-progress">Card {cardIndex + 1} of {deck.cards.length}</span>`, and a Next button (`disabled={cardIndex === deck.cards.length - 1}`).

- [ ] **Step 4: `FlashcardsView.tsx`**

State: `decks: FlashcardDeck[]`, `status: string | null`, `busy: boolean`, `uploadText: string`, `selectedSubjectSlug: string | null`, `selectedExamSlug: string | null`, `cardIndex: number`, `flipped: boolean`. On mount, `client.listDecks()` into `decks` (catch into `status`, same pattern as `NotesView`'s `load`). `groups = useMemo(() => groupDecksBySubject(decks), [decks])`. `selectedDeck = decks.find(d => d.subjectSlug === selectedSubjectSlug && d.examSlug === selectedExamSlug) ?? null`. `selectDeck(subjectSlug, examSlug)` sets both slugs, resets `cardIndex` to `0` and `flipped` to `false`. `handleSave` trims `uploadText`, no-ops if empty, sets `busy`, calls `client.saveDeck`, on success clears `uploadText`/`status`, reloads `decks`, and calls `selectDeck` with the saved deck's slugs; on failure sets `status` to the error message; `finally` clears `busy`. `goPrev`/`goNext` clamp `cardIndex` within `[0, selectedDeck.cards.length - 1]` and reset `flipped` to `false`. Render: `<div className="flashcards-view">` with `FlashcardsSidebar`, then a `<div className="flashcards-content">` holding (in order) the `status` paragraph (`<p className="notes-status">` — reuse the existing class, it's generic), `FlashcardsDeckUploader`, and — when `selectedDeck` exists — a `<h2 className="flashcards-deck-title">` reading `{subject label} · Exam {selectedDeck.exam}` (look the label up from `groups`) followed by `FlashcardsCard`; otherwise a `<p className="flashcards-empty">Pick a subject and exam on the left, or paste a new deck above.</p>`. Import `../notes/notes.css` at the top (same pattern as `NotesView.tsx`).

- [ ] **Step 5: Append flashcard + tab styles to `remote-access/notes/notes.css`**

Add a new block at the end of the file (after the existing `@media (prefers-reduced-motion: reduce)` block) covering: `.notes-tabs` and `.notes-tabs button`/`.active` (the tab switcher — currently unstyled; needed by both the desktop tab and the published page once Task 8 wires `StudyTabs` into both), and the full set of `.flashcards-*` classes referenced by Steps 1–4 above (`flashcards-view`, `flashcards-sidebar`, `flashcards-sidebar-heading`, `flashcards-subject(+subject)`, `flashcards-subject-heading`, `flashcards-deck-list`, `flashcards-deck-item(-active)`, `flashcards-deck-count`, `flashcards-content`, `flashcards-uploader` (+ its `textarea`), `flashcards-uploader-footer` (+ `button`), `flashcards-deck-title`, `flashcards-card-wrap`, `flashcards-card-stem(-label)`, `flashcards-card`, `flashcards-card-label`, `flashcards-card-text` (`white-space: pre-wrap`), `flashcards-card-hint`, `flashcards-card-nav` (+ `button`), `flashcards-card-progress`, `flashcards-empty`), all built from the existing `var(--notes-*)` tokens (no new tokens — this file's whole point, per its own header comment, is working standalone in both themes already) plus one `@media (max-width: 640px)` rule stacking `.flashcards-view` into a column, matching `.notes-view`'s existing narrow-screen treatment.

- [ ] **Step 6: Commit**

```bash
git add remote-access/flashcards-page/FlashcardsSidebar.tsx remote-access/flashcards-page/FlashcardsDeckUploader.tsx remote-access/flashcards-page/FlashcardsCard.tsx remote-access/flashcards-page/FlashcardsView.tsx remote-access/notes/notes.css
git commit -m "feat(flashcards): build the flashcards study UI"
```

---

### Task 8: Wire both entry points, fix the broken deploy, verify end-to-end

**Files:**
- Create: `remote-access/StudyTabs.tsx`
- Modify: `remote-access/App.tsx` (desktop dashboard entry point)
- Modify: `remote-access/notes/capture-entry.tsx` (published phone/website entry point)
- Modify: `.github/workflows/deploy-notes-capture.yml` (currently broken — still points at the pre-move `notes/` path; last successful deploy was before the Oct 20 "moved to remote access folder" commit)
- Delete: `remote-access/flashcards-page/FlashcardsView` (a stray empty, extension-less file — not source, safe to remove)

**Interfaces:**
- Consumes everything from Tasks 1–7.
- Produces: `export default function StudyTabs({ notesClient, flashcardsClient }: { notesClient: NotesClient; flashcardsClient: FlashcardsClient }): JSX.Element`.

- [ ] **Step 1: Delete the stray placeholder file**

It's untracked (not yet committed), so a plain removal is enough — no `git rm` needed:

```bash
rm remote-access/flashcards-page/FlashcardsView
```

- [ ] **Step 2: Create `remote-access/StudyTabs.tsx`**

This replaces the tab-switch markup currently inline in `remote-access/App.tsx` (lines 11–39 and the `<main>` block at 41–47 today), unchanged in behavior — just parameterized by client instead of hardcoding `createLocalClient()`:

```tsx
import { useState } from "react";
import type { NotesClient } from "./notes/notes-client";
import type { FlashcardsClient } from "./flashcards-page/flashcards-client";
import NotesView from "./notes/NotesView";
import FlashcardsView from "./flashcards-page/FlashcardsView";

type Tab = "notes" | "flashcards";

export default function StudyTabs({
  notesClient,
  flashcardsClient,
}: {
  notesClient: NotesClient;
  flashcardsClient: FlashcardsClient;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");

  return (
    <>
      <nav className="notes-tabs" aria-label="Study sections">
        <button type="button" className={activeTab === "notes" ? "active" : ""} onClick={() => setActiveTab("notes")}>
          Notes
        </button>
        <button
          type="button"
          className={activeTab === "flashcards" ? "active" : ""}
          onClick={() => setActiveTab("flashcards")}
        >
          Flashcards
        </button>
      </nav>
      <main>{activeTab === "notes" ? <NotesView client={notesClient} /> : <FlashcardsView client={flashcardsClient} />}</main>
    </>
  );
}
```

- [ ] **Step 3: Simplify `remote-access/App.tsx`**

Keep the `<details className="notes-training">…</details>` block and its imports (`WeeklyPlanView`, `TRAINING_PLAN`) exactly as they are today — that part is desktop-dashboard-only and out of scope. Replace the rest: construct `const notesClient = createLocalClient();` and `const flashcardsClient = createFlashcardsLocalClient();` (import from `./flashcards-page/flashcards-local-client`) at module scope, drop the inline `Tab` type and tab markup, and render `<StudyTabs notesClient={notesClient} flashcardsClient={flashcardsClient} />` after the `<details>` block.

- [ ] **Step 4: Update `remote-access/notes/capture-entry.tsx`**

Keep `getOrPromptToken()` as-is. After it resolves `token`, construct both clients with it against the same `notes-data` repo:

```tsx
import StudyTabs from "../StudyTabs";
import { createFlashcardsGithubClient } from "../flashcards-page/flashcards-github-client";
// ...existing imports...

const token = getOrPromptToken();
const notesClient = createGithubClient({ owner: "Jung028", repo: "notes-data", token, storage: localStorage });
const flashcardsClient = createFlashcardsGithubClient({ owner: "Jung028", repo: "notes-data", token, storage: localStorage });

createRoot(document.getElementById("root")!).render(
  <StudyTabs notesClient={notesClient} flashcardsClient={flashcardsClient} />,
);
```

- [ ] **Step 5: Fix the deploy workflow's stale paths**

In `.github/workflows/deploy-notes-capture.yml`, change the `paths:` trigger list's `"notes/**"` to `"remote-access/notes/**"` and add `"remote-access/flashcards-page/**"` as an additional path (so a flashcards-only change also redeploys), and change the build step from `bun build ./notes/capture-entry.tsx --outdir ./notes-capture` to `bun build ./remote-access/notes/capture-entry.tsx --outdir ./notes-capture`.

- [ ] **Step 6: Run the full test suite**

Run: `bun test`
Expected: every test passes, including all of Tasks 1–6's new files and the pre-existing suite (confirms the `export` additions in Tasks 3/5/6 didn't change any existing behavior).

- [ ] **Step 7: Type-check**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Verify in the browser, per this project's standing rule to test UI changes live before calling them done**

Start the dev server (`bun --hot index.ts`, or whatever this repo's existing dev-server convention is — check `package.json`'s scripts first). Using the claude-in-chrome browser tool: open the dashboard, go to the Notes tab, confirm the Notes/Flashcards tab switcher renders and is styled (not bare unstyled buttons); switch to Flashcards; paste a small sample deck (e.g. the `SAMPLE` constant used in the tests above) into the uploader and save it; confirm it appears under its Subject/Exam in the sidebar; select it, confirm the first card shows the question, flipping reveals the answer, and Prev/Next move through the deck; paste a second card with a lettered part (e.g. add a `### Q1b.` to the sample) and confirm the pinned "Q1" stem line appears while viewing it. Note any console errors. This step is about the UI actually working, not just compiling — don't skip it or call the feature done on `bun test` alone.

- [ ] **Step 9: Commit**

```bash
git add remote-access/StudyTabs.tsx remote-access/App.tsx remote-access/notes/capture-entry.tsx .github/workflows/deploy-notes-capture.yml
git commit -m "feat(flashcards): wire Flashcards into both the dashboard and the published site, fix the broken deploy workflow"
```
