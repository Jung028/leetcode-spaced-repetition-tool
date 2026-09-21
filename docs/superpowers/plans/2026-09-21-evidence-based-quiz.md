# Evidence-Based Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four new question formats (fill-in-the-blank, match, order, sort), per-round reading cards, and a five-agent generation pipeline, without changing any existing exam content.

**Architecture:** One new `ExamQuestionType` per format, following the existing `multi` precedent. Pure logic (marking, shuffling, step/card bookkeeping) lives in small tested modules; React components are thin. Reading cards are attached to a paper by position (`beforeQuestion`), never numbered like questions, so stored answer indices never shift. The single `claude -p` generation call becomes five sequential stage calls that hand off via files on disk.

**Tech Stack:** Bun (`bun test`, `Bun.serve`), TypeScript, React 19, `bun:sqlite`, Mermaid.

**Spec:** `docs/superpowers/specs/2026-09-21-evidence-based-quiz-design.md`

## Global Constraints

- Work only on branch `docs/evidence-based-quiz-design`. **Small commits. Never merge to `main`, never push.** Deleting the branch must fully revert the trial.
- Existing exam content (`exam-content/**/week-*.ts`) must not be edited and must keep passing `bun test`.
- Use Bun, not Node/npm (`bun test`, `bun <file>`, `bunx`).
- Marking is one mark, all-or-nothing, for every type. No partial credit.
- A student's answer is stored in the existing `yourAnswer` string column as JSON. **No DB migration.**
- Typed answers are limited to single-word/term blanks. `short` / `scenario` remain out of scope.
- Every change is verified by the PostToolUse hook (`bun test` + `bunx tsc --noEmit`); fix failures before moving on.
- Browser verification must run against a scratch DB: `SRS_DB_PATH=/tmp/quiz-verify.db PORT=3055 bun index.ts`. Never point it at `srs.db`.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `exam-content/types.ts` | modify | New question types, fields, `ExamReadingSeed`, `readings` |
| `scripts/check-exam-structure.ts` (+ `.test.ts`) | create | Validates new-format questions and readings across all content |
| `exam/grading.ts` (+ `grading.test.ts`) | modify | `normaliseBlank`, `isFillBlankCorrect`, `isMatchCorrect`, `isOrderCorrect`, `isSortCorrect` |
| `exam/formats.ts` (+ `formats.test.ts`) | create | Deterministic shuffles, `moveItem`, saved-answer parsers |
| `exam/reading.ts` (+ `reading.test.ts`) | create | Round/card bookkeeping (`roundRange`, `initialSeenCards`, `roundFullyGraded`) |
| `exam/timer.ts` (+ `timer.test.ts`) | modify | Time budgets for the new types |
| `exam/api.ts` (+ `question-view.test.ts`) | modify | `toQuestionView`, new view fields, `readings` |
| `exam/shared-ui.tsx` | create | `PromptText`, `DrawingLink` extracted from `App.tsx` |
| `exam/FormatQuestions.tsx` | create | Four question components + `ReadingCard` |
| `exam/App.tsx` | modify | Dispatch new types, reading-card flow, stage label |
| `index.css` | modify | Styles for the new components |
| `exam/pipeline.ts` (+ `pipeline.test.ts`) | create | Stage definitions and prompt builders (browser-safe: no `node:*` imports) |
| `exam/generate.ts` (+ `generate.test.ts`) | modify | Sequential stage runner, per-stage status, resume |
| `docs/exam-content-authoring-guide.md`, `CLAUDE.md`, `.claude/commands/generate-week-content.md` | modify | Rules and workflow docs |

---

### Task 1: Schema and structure validator

**Files:**
- Modify: `exam-content/types.ts`
- Create: `scripts/check-exam-structure.ts`, `scripts/check-exam-structure.test.ts`

**Interfaces:**
- Produces: `ExamQuestionType` now includes `"fillblank" | "match" | "order" | "sort"`; `ExamQuestionSeed` gains `blanks?: string[][]`, `pairs?: {left: string; right: string}[]`, `decoys?: string[]`, `steps?: string[]`, `groups?: string[]`, `items?: {text: string; group: number}[]`; new `interface ExamReadingSeed { beforeQuestion: number; title: string; body: string; diagram?: string }`; `ExamPaperSeed.readings?: ExamReadingSeed[]`; `findStructureIssues(papers: ExamPaperSeed[]): StructureIssue[]`.

- [ ] **Step 1: Write the failing test** — create `scripts/check-exam-structure.test.ts`:

```ts
import { test, expect } from "bun:test";
import { findStructureIssues } from "./check-exam-structure";
import type { ExamPaperSeed, ExamQuestionSeed } from "../exam-content/types";

function paperWith(questions: ExamQuestionSeed[], readings?: ExamPaperSeed["readings"]): ExamPaperSeed {
  return { course: "TEST", week: 1, paperNumber: 1, title: "T", topics: "t", sourceFiles: [], questions, readings };
}
const base = { modelAnswer: "because" };

const goodFill: ExamQuestionSeed = { ...base, type: "fillblank", prompt: "A ___ seals a message.", blanks: [["MAC", "message authentication code"]] };
const goodMatch: ExamQuestionSeed = {
  ...base, type: "match", prompt: "Match each term.",
  pairs: [{ left: "A", right: "one" }, { left: "B", right: "two" }, { left: "C", right: "three" }],
};
const goodOrder: ExamQuestionSeed = { ...base, type: "order", prompt: "Order these.", steps: ["first", "second", "third"] };
const goodSort: ExamQuestionSeed = {
  ...base, type: "sort", prompt: "Sort these.", groups: ["threat", "control"],
  items: [
    { text: "phishing", group: 0 }, { text: "malware", group: 0 },
    { text: "firewall", group: 1 }, { text: "MFA", group: 1 },
  ],
};

test("well-formed new-format questions produce no issues", () => {
  expect(findStructureIssues([paperWith([goodFill, goodMatch, goodOrder, goodSort])])).toEqual([]);
});

test("fillblank: blank count must equal ___ count", () => {
  const issues = findStructureIssues([paperWith([{ ...goodFill, prompt: "No gap here." }])]);
  expect(issues.map((i) => i.message).join()).toContain("___");
});

test("fillblank: every blank needs at least one non-empty accepted answer", () => {
  expect(findStructureIssues([paperWith([{ ...goodFill, blanks: [[""]] }])]).length).toBe(1);
  expect(findStructureIssues([paperWith([{ ...goodFill, blanks: [[]] }])]).length).toBe(1);
});

test("match: needs 3-6 pairs, unique right-hand texts, at most 2 decoys", () => {
  expect(findStructureIssues([paperWith([{ ...goodMatch, pairs: goodMatch.pairs!.slice(0, 2) }])]).length).toBe(1);
  const dup = { ...goodMatch, pairs: goodMatch.pairs!.map((p) => ({ ...p, right: "same" })) };
  expect(findStructureIssues([paperWith([dup])]).length).toBeGreaterThan(0);
  expect(findStructureIssues([paperWith([{ ...goodMatch, decoys: ["x", "y", "z"] }])]).length).toBe(1);
});

test("order: needs 3-7 distinct steps", () => {
  expect(findStructureIssues([paperWith([{ ...goodOrder, steps: ["a", "b"] }])]).length).toBe(1);
  expect(findStructureIssues([paperWith([{ ...goodOrder, steps: ["a", "a", "b"] }])]).length).toBe(1);
});

test("sort: 2-3 groups, 4-8 items, valid group indexes, every group used", () => {
  expect(findStructureIssues([paperWith([{ ...goodSort, groups: ["only"] }])]).length).toBeGreaterThan(0);
  const badIdx = { ...goodSort, items: goodSort.items!.map((it) => ({ ...it, group: 5 })) };
  expect(findStructureIssues([paperWith([badIdx])]).length).toBeGreaterThan(0);
  const unused = { ...goodSort, items: goodSort.items!.map((it) => ({ ...it, group: 0 })) };
  expect(findStructureIssues([paperWith([unused])]).length).toBe(1);
});

test("readings: beforeQuestion in range, unique, ascending; body at most 200 words", () => {
  const q = [goodOrder, goodOrder, goodOrder];
  const ok = paperWith(q, [{ beforeQuestion: 0, title: "a", body: "short" }, { beforeQuestion: 2, title: "b", body: "short" }]);
  expect(findStructureIssues([ok])).toEqual([]);
  expect(findStructureIssues([paperWith(q, [{ beforeQuestion: 3, title: "a", body: "x" }])]).length).toBe(1);
  expect(findStructureIssues([paperWith(q, [{ beforeQuestion: 1, title: "a", body: "x" }, { beforeQuestion: 1, title: "b", body: "x" }])]).length).toBeGreaterThan(0);
  const long = Array.from({ length: 201 }, () => "w").join(" ");
  expect(findStructureIssues([paperWith(q, [{ beforeQuestion: 0, title: "a", body: long }])]).length).toBe(1);
});

test("size ceiling applies only to papers using the new features", () => {
  const many = Array.from({ length: 60 }, () => ({ type: "mcq" as const, prompt: "p", options: ["a", "b"], correctIndex: 0, modelAnswer: "m" }));
  expect(findStructureIssues([paperWith(many)])).toEqual([]);
  expect(findStructureIssues([paperWith([...many, goodOrder])]).length).toBe(1);
});

test("all existing authored content passes untouched", async () => {
  const { buildExamSchedule } = await import("../exam/content");
  expect(findStructureIssues(buildExamSchedule())).toEqual([]);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bun test scripts/check-exam-structure.test.ts`
Expected: FAIL (cannot find module `./check-exam-structure`).

- [ ] **Step 3: Extend the schema** — in `exam-content/types.ts` replace the first line and add the new fields and interface:

```ts
export type ExamQuestionType =
  | "mcq" | "truefalse" | "short" | "scenario" | "multi"
  | "fillblank" | "match" | "order" | "sort";
```

Add inside `ExamQuestionSeed` (after `requiresDrawing`):

```ts
  // fillblank — accepted answers per blank. `prompt` holds one "___" per blank,
  // in order. Case, spacing and punctuation are ignored when marking.
  blanks?: string[][];
  // match — 3-6 rows; `left` order is the display order, `right` is its partner.
  pairs?: { left: string; right: string }[];
  // match — up to 2 extra wrong right-hand choices, so it can't be finished by elimination.
  decoys?: string[];
  // order — authored in the CORRECT order (3-7 steps); the UI shuffles them.
  steps?: string[];
  // sort — 2-3 labelled boxes and 4-8 items, each pointing at its box by index.
  groups?: string[];
  items?: { text: string; group: number }[];
```

Add above `ExamPaperSeed`, and add `readings?` to it:

```ts
// A short "read this first" card shown before a round of questions. Attached by
// POSITION (index of the round's first question), never numbered like a question,
// so a student's stored answers (keyed by question index) never shift.
export interface ExamReadingSeed {
  beforeQuestion: number;
  title: string;
  body: string; // PromptText style, 100-150 words, hard cap 200
  diagram?: string; // optional Mermaid
}
```

and inside `ExamPaperSeed`: `readings?: ExamReadingSeed[];`

- [ ] **Step 4: Implement the validator** — create `scripts/check-exam-structure.ts`:

```ts
// Structural validator for the new question formats and reading cards. Runs over
// the whole schedule inside `bun test` (see check-exam-structure.test.ts), so a
// malformed authored question fails the suite — same idea as check-mcq-lengths.
import type { ExamPaperSeed, ExamQuestionSeed } from "../exam-content/types";

export interface StructureIssue {
  course: string;
  week: number;
  paperNumber: number;
  questionIndex: number | null;
  message: string;
}

export const MAX_PAPER_QUESTIONS = 55; // soft ceiling over the ~50 target
export const MAX_READING_WORDS = 200;
const NEW_TYPES = new Set(["fillblank", "match", "order", "sort"]);

const norm = (s: string) => s.trim().toLowerCase();
const distinct = (xs: string[]) => new Set(xs.map(norm)).size === xs.length;

function questionProblems(q: ExamQuestionSeed): string[] {
  const out: string[] = [];
  if (q.type === "fillblank") {
    const gaps = (q.prompt.match(/___/g) ?? []).length;
    if (!q.blanks || q.blanks.length === 0) return ["fillblank needs blanks"];
    if (gaps !== q.blanks.length) out.push(`prompt has ${gaps} "___" but blanks has ${q.blanks.length}`);
    q.blanks.forEach((accepted, i) => {
      if (accepted.length === 0 || accepted.some((a) => a.trim() === "")) {
        out.push(`blank ${i} needs at least one non-empty accepted answer and no empty ones`);
      }
    });
  } else if (q.type === "match") {
    const pairs = q.pairs ?? [];
    const decoys = q.decoys ?? [];
    if (pairs.length < 3 || pairs.length > 6) out.push(`match needs 3-6 pairs, has ${pairs.length}`);
    if (decoys.length > 2) out.push(`match allows at most 2 decoys, has ${decoys.length}`);
    if (!distinct([...pairs.map((p) => p.right), ...decoys])) out.push("match right-hand texts (incl. decoys) must be unique");
    if (!distinct(pairs.map((p) => p.left))) out.push("match left-hand texts must be unique");
  } else if (q.type === "order") {
    const steps = q.steps ?? [];
    if (steps.length < 3 || steps.length > 7) out.push(`order needs 3-7 steps, has ${steps.length}`);
    if (!distinct(steps)) out.push("order steps must be distinct");
  } else if (q.type === "sort") {
    const groups = q.groups ?? [];
    const items = q.items ?? [];
    if (groups.length < 2 || groups.length > 3) out.push(`sort needs 2-3 groups, has ${groups.length}`);
    if (items.length < 4 || items.length > 8) out.push(`sort needs 4-8 items, has ${items.length}`);
    if (items.some((it) => !Number.isInteger(it.group) || it.group < 0 || it.group >= groups.length)) {
      out.push("sort item group index out of range");
    } else {
      groups.forEach((_, g) => {
        if (!items.some((it) => it.group === g)) out.push(`sort group ${g} has no items`);
      });
    }
  }
  return out;
}

export function findStructureIssues(papers: ExamPaperSeed[]): StructureIssue[] {
  const issues: StructureIssue[] = [];
  for (const p of papers) {
    const add = (questionIndex: number | null, message: string) =>
      issues.push({ course: p.course, week: p.week, paperNumber: p.paperNumber, questionIndex, message });

    p.questions.forEach((q, i) => questionProblems(q).forEach((m) => add(i, m)));

    // The size ceiling only binds papers that use the new features, so the
    // existing (older, larger) papers keep passing untouched.
    const usesNew = (p.readings?.length ?? 0) > 0 || p.questions.some((q) => NEW_TYPES.has(q.type));
    if (usesNew && p.questions.length > MAX_PAPER_QUESTIONS) {
      add(null, `paper has ${p.questions.length} questions, ceiling is ${MAX_PAPER_QUESTIONS}`);
    }

    let prev = -1;
    for (const r of p.readings ?? []) {
      if (!Number.isInteger(r.beforeQuestion) || r.beforeQuestion < 0 || r.beforeQuestion >= p.questions.length) {
        add(null, `reading "${r.title}" beforeQuestion ${r.beforeQuestion} is out of range`);
      } else if (r.beforeQuestion <= prev) {
        add(null, `reading "${r.title}" beforeQuestion must be unique and ascending`);
      } else {
        prev = r.beforeQuestion;
      }
      const words = r.body.trim().split(/\s+/).filter(Boolean).length;
      if (words > MAX_READING_WORDS) add(null, `reading "${r.title}" is ${words} words, cap is ${MAX_READING_WORDS}`);
    }
  }
  return issues;
}

if (import.meta.main) {
  const { buildExamSchedule } = await import("../exam/content");
  const issues = findStructureIssues(buildExamSchedule());
  for (const i of issues) {
    console.log(`${i.course} week ${i.week} paper ${i.paperNumber} q${i.questionIndex ?? "-"}: ${i.message}`);
  }
  console.log(`TOTAL ISSUES: ${issues.length}`);
  if (issues.length > 0) process.exit(1);
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `bun test scripts/check-exam-structure.test.ts && bunx tsc --noEmit`
Expected: all pass; tsc clean. (Exhaustive-switch errors elsewhere are fixed by later tasks — if `tsc` reports `Record<ExamQuestionType, number>` missing keys in `exam/timer.ts`, that is expected until Task 3; note it and continue only if that is the sole error.)

- [ ] **Step 6: Commit**

```bash
git add exam-content/types.ts scripts/check-exam-structure.ts scripts/check-exam-structure.test.ts
git commit -m "feat(exam): schema and validator for fillblank/match/order/sort and reading cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Marking, shuffling and saved-answer helpers

**Files:**
- Modify: `exam/grading.ts`, `exam/grading.test.ts`
- Create: `exam/formats.ts`, `exam/formats.test.ts`

**Interfaces:**
- Produces (`exam/grading.ts`): `normaliseBlank(s: string): string`; `isFillBlankCorrect(typed: string[], blanks: string[][]): boolean`; `isMatchCorrect(chosen: number[], rowCount: number): boolean`; `isOrderCorrect(arrangement: number[], stepCount: number): boolean`; `isSortCorrect(chosen: number[], correct: number[]): boolean`.
- Produces (`exam/formats.ts`): `seedFor(...parts: (string | number)[]): number`; `seededShuffle<T>(items: T[], seed: number): T[]`; `shuffledNotIdentity(n: number, seed: number): number[]`; `matchChoiceOrder(pairCount: number, decoyCount: number, seed: number): number[]`; `moveItem(arr: number[], from: number, dir: -1 | 1): number[]`; `parseNumberArray(raw: string): number[] | null`; `parseStringArray(raw: string): string[] | null`.

- [ ] **Step 1: Write failing tests** — append to `exam/grading.test.ts` (extend its import to `import { isMultiCorrect, normaliseBlank, isFillBlankCorrect, isMatchCorrect, isOrderCorrect, isSortCorrect } from "./grading";`):

```ts
test("normaliseBlank ignores case, spacing and punctuation", () => {
  expect(normaliseBlank("  Message-Authentication   CODE. ")).toBe("message authentication code");
  expect(normaliseBlank("M.A.C.")).toBe("m a c");
});

test("isFillBlankCorrect accepts any listed spelling per blank, ignoring case/punctuation", () => {
  const blanks = [["MAC", "message authentication code"], ["hash"]];
  expect(isFillBlankCorrect(["mac", "Hash!"], blanks)).toBe(true);
  expect(isFillBlankCorrect(["Message Authentication Code", "hash"], blanks)).toBe(true);
});

test("isFillBlankCorrect is all-or-nothing and rejects empty or missing answers", () => {
  const blanks = [["mac"], ["hash"]];
  expect(isFillBlankCorrect(["mac", "nope"], blanks)).toBe(false);
  expect(isFillBlankCorrect(["mac"], blanks)).toBe(false);
  expect(isFillBlankCorrect(["mac", ""], blanks)).toBe(false);
});

test("isMatchCorrect requires every row to pick its own partner", () => {
  expect(isMatchCorrect([0, 1, 2], 3)).toBe(true);
  expect(isMatchCorrect([0, 2, 1], 3)).toBe(false);
  expect(isMatchCorrect([0, 1], 3)).toBe(false);
});

test("isOrderCorrect requires the exact authored order", () => {
  expect(isOrderCorrect([0, 1, 2, 3], 4)).toBe(true);
  expect(isOrderCorrect([1, 0, 2, 3], 4)).toBe(false);
  expect(isOrderCorrect([0, 1, 2], 4)).toBe(false);
});

test("isSortCorrect requires every item in its own group", () => {
  expect(isSortCorrect([0, 1, 1, 0], [0, 1, 1, 0])).toBe(true);
  expect(isSortCorrect([0, 1, 0, 0], [0, 1, 1, 0])).toBe(false);
  expect(isSortCorrect([0, 1], [0, 1, 1, 0])).toBe(false);
});
```

Create `exam/formats.test.ts`:

```ts
import { test, expect } from "bun:test";
import { seedFor, seededShuffle, shuffledNotIdentity, matchChoiceOrder, moveItem, parseNumberArray, parseStringArray } from "./formats";

test("seedFor is stable and sensitive to every part", () => {
  expect(seedFor("A", 1, 2, 3)).toBe(seedFor("A", 1, 2, 3));
  expect(seedFor("A", 1, 2, 3)).not.toBe(seedFor("A", 1, 2, 4));
});

test("seededShuffle is deterministic and a permutation", () => {
  const a = seededShuffle([1, 2, 3, 4, 5, 6], 42);
  expect(a).toEqual(seededShuffle([1, 2, 3, 4, 5, 6], 42));
  expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
});

test("shuffledNotIdentity is a permutation of 0..n-1 and never the identity (n>=2)", () => {
  for (let seed = 0; seed < 200; seed++) {
    for (const n of [2, 3, 4, 7]) {
      const p = shuffledNotIdentity(n, seed);
      expect([...p].sort((x, y) => x - y)).toEqual(Array.from({ length: n }, (_, i) => i));
      expect(p.every((v, i) => v === i)).toBe(false);
    }
  }
  expect(shuffledNotIdentity(1, 5)).toEqual([0]);
});

test("matchChoiceOrder covers every canonical right index (pairs then decoys) exactly once", () => {
  const order = matchChoiceOrder(4, 2, 9);
  expect([...order].sort((x, y) => x - y)).toEqual([0, 1, 2, 3, 4, 5]);
});

test("moveItem swaps neighbours and ignores moves off either end", () => {
  expect(moveItem([0, 1, 2], 0, 1)).toEqual([1, 0, 2]);
  expect(moveItem([0, 1, 2], 2, -1)).toEqual([0, 2, 1]);
  expect(moveItem([0, 1, 2], 0, -1)).toEqual([0, 1, 2]);
  expect(moveItem([0, 1, 2], 2, 1)).toEqual([0, 1, 2]);
});

test("parsers return null for bad or wrong-shaped JSON", () => {
  expect(parseNumberArray("[1,2,0]")).toEqual([1, 2, 0]);
  expect(parseNumberArray("")).toBeNull();
  expect(parseNumberArray("not json")).toBeNull();
  expect(parseNumberArray('["a"]')).toBeNull();
  expect(parseStringArray('["mac","hash"]')).toEqual(["mac", "hash"]);
  expect(parseStringArray("[1]")).toBeNull();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test exam/grading.test.ts exam/formats.test.ts`
Expected: FAIL (missing exports / module).

- [ ] **Step 3: Implement marking** — append to `exam/grading.ts`:

```ts
// Lowercase, turn punctuation into spaces, collapse runs of whitespace. Both the
// typed text and every accepted answer go through this, so "M.A.C." == "mac"
// only if the accepted list says so — spelling still has to match.
export function normaliseBlank(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Every blank must match one of its accepted answers; all-or-nothing.
export function isFillBlankCorrect(typed: string[], blanks: string[][]): boolean {
  if (typed.length !== blanks.length) return false;
  return blanks.every((accepted, i) => {
    const t = normaliseBlank(typed[i] ?? "");
    return t !== "" && accepted.some((a) => normaliseBlank(a) === t);
  });
}

// match: row i's correct partner is canonical right index i.
export function isMatchCorrect(chosen: number[], rowCount: number): boolean {
  return chosen.length === rowCount && chosen.every((c, i) => c === i);
}

// order: canonical step indices, correct when already 0..n-1.
export function isOrderCorrect(arrangement: number[], stepCount: number): boolean {
  return arrangement.length === stepCount && arrangement.every((v, i) => v === i);
}

// sort: the chosen group per item must equal the authored group per item.
export function isSortCorrect(chosen: number[], correct: number[]): boolean {
  return chosen.length === correct.length && chosen.every((c, i) => c === correct[i]);
}
```

- [ ] **Step 4: Implement helpers** — create `exam/formats.ts`:

```ts
// Pure helpers for the new question formats: deterministic shuffles (so a reload
// shows the same layout), the order-question move, and parsers for the JSON a
// student's answer is stored as. Kept free of React so it is unit-tested.

// FNV-1a over the parts joined — a small stable 32-bit hash.
export function seedFor(...parts: (string | number)[]): number {
  let h = 2166136261;
  for (const ch of parts.join("|")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// mulberry32 PRNG.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  const rand = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// A permutation of 0..n-1 that is never the identity (for n >= 2), so an order
// question never opens already solved.
export function shuffledNotIdentity(n: number, seed: number): number[] {
  const base = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return base;
  const p = seededShuffle(base, seed);
  return p.every((v, i) => v === i) ? [...p.slice(1), p[0]!] : p;
}

// Display order of a match question's right-hand choices, as canonical indices
// (pairs' rights first, then decoys).
export function matchChoiceOrder(pairCount: number, decoyCount: number, seed: number): number[] {
  return seededShuffle(Array.from({ length: pairCount + decoyCount }, (_, i) => i), seed);
}

export function moveItem(arr: number[], from: number, dir: -1 | 1): number[] {
  const to = from + dir;
  if (to < 0 || to >= arr.length) return arr;
  const out = [...arr];
  [out[from], out[to]] = [out[to]!, out[from]!];
  return out;
}

export function parseNumberArray(raw: string): number[] | null {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.every((x) => Number.isInteger(x)) ? (v as number[]) : null;
  } catch {
    return null;
  }
}

export function parseStringArray(raw: string): string[] | null {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Run to verify pass**

Run: `bun test exam/grading.test.ts exam/formats.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add exam/grading.ts exam/grading.test.ts exam/formats.ts exam/formats.test.ts
git commit -m "feat(exam): marking and helper functions for the four new formats

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Time budgets for the new types

**Files:**
- Modify: `exam/timer.ts`, `exam/timer.test.ts`

**Interfaces:**
- Consumes: `ExamQuestionType` (Task 1).
- Produces: `TimeBudgetQuestion` now also accepts `blanks`, `pairs`, `steps`, `items` (each `unknown[] | null | undefined`); `questionTimeBudget` unchanged in signature.

- [ ] **Step 1: Write failing tests** — append to `exam/timer.test.ts`:

```ts
test("base budgets for the new formats", () => {
  expect(questionTimeBudget({ type: "fillblank", blanks: [["a"]] })).toBe(45);
  expect(questionTimeBudget({ type: "match", pairs: [1, 2, 3] })).toBe(60);
  expect(questionTimeBudget({ type: "order", steps: [1, 2, 3] })).toBe(60);
  expect(questionTimeBudget({ type: "sort", items: [1, 2, 3, 4] })).toBe(60);
});

test("adds 10s per blank/row/step/item beyond the fourth", () => {
  expect(questionTimeBudget({ type: "match", pairs: [1, 2, 3, 4, 5, 6] })).toBe(80);
  expect(questionTimeBudget({ type: "order", steps: [1, 2, 3, 4, 5] })).toBe(70);
  expect(questionTimeBudget({ type: "sort", items: [1, 2, 3, 4, 5, 6, 7, 8] })).toBe(100);
  expect(questionTimeBudget({ type: "fillblank", blanks: [[], [], [], [], []] })).toBe(55);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test exam/timer.test.ts`
Expected: FAIL (type errors / wrong budgets).

- [ ] **Step 3: Implement** — in `exam/timer.ts` extend the interface, the table, and the function:

```ts
export interface TimeBudgetQuestion {
  type: ExamQuestionType;
  options?: string[] | null;
  promptImage?: string | null;
  promptDiagram?: string | null;
  blanks?: unknown[] | null;
  pairs?: unknown[] | null;
  steps?: unknown[] | null;
  items?: unknown[] | null;
}

const BASE_SECONDS: Record<ExamQuestionType, number> = {
  truefalse: 20,
  mcq: 30,
  multi: 45,
  fillblank: 45,
  match: 60,
  order: 60,
  sort: 60,
  short: 150,
  scenario: 180,
};
```

In `questionTimeBudget`, after the `extraOptions` lines add:

```ts
  const parts = q.blanks?.length ?? q.pairs?.length ?? q.steps?.length ?? q.items?.length ?? 0;
  seconds += Math.max(0, parts - 4) * 10;
```

- [ ] **Step 4: Run to verify pass**

Run: `bun test exam/timer.test.ts && bunx tsc --noEmit`
Expected: PASS; tsc clean.

- [ ] **Step 5: Commit**

```bash
git add exam/timer.ts exam/timer.test.ts
git commit -m "feat(exam): time budgets for fillblank/match/order/sort

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: API view carries the new fields and reading cards

**Files:**
- Modify: `exam/api.ts` (around lines 78–135)
- Create: `exam/question-view.test.ts`

**Interfaces:**
- Consumes: `ExamQuestionSeed`, `ExamReadingSeed` (Task 1).
- Produces: `toQuestionView(q: ExamQuestionSeed, index: number, answer?: { your_answer: string; correct: number | null }): ExamQuestionView`; `ExamQuestionView` gains `blanks: string[][] | null`, `pairs: {left: string; right: string}[] | null`, `decoys: string[] | null`, `steps: string[] | null`, `groups: string[] | null`, `items: {text: string; group: number}[] | null`; `ExamPaperView` gains `readings: ExamReadingSeed[]`.

- [ ] **Step 1: Write the failing test** — create `exam/question-view.test.ts`:

```ts
import { test, expect } from "bun:test";
import { toQuestionView } from "./api";
import type { ExamQuestionSeed } from "../exam-content/types";

test("toQuestionView passes the new-format fields through and nulls the absent ones", () => {
  const q: ExamQuestionSeed = { type: "order", prompt: "p", modelAnswer: "m", steps: ["a", "b", "c"] };
  const v = toQuestionView(q, 4, { your_answer: "[1,0,2]", correct: 0 });
  expect(v.index).toBe(4);
  expect(v.steps).toEqual(["a", "b", "c"]);
  expect(v.blanks).toBeNull();
  expect(v.pairs).toBeNull();
  expect(v.decoys).toBeNull();
  expect(v.groups).toBeNull();
  expect(v.items).toBeNull();
  expect(v.yourAnswer).toBe("[1,0,2]");
  expect(v.correct).toBe(0);
});

test("toQuestionView defaults an unanswered question to empty answer and null grade", () => {
  const q: ExamQuestionSeed = { type: "fillblank", prompt: "A ___", modelAnswer: "m", blanks: [["x"]] };
  const v = toQuestionView(q, 0);
  expect(v.blanks).toEqual([["x"]]);
  expect(v.yourAnswer).toBe("");
  expect(v.correct).toBeNull();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test exam/question-view.test.ts`
Expected: FAIL (`toQuestionView` not exported).

- [ ] **Step 3: Implement** — in `exam/api.ts`: add `import type { ExamQuestionSeed, ExamReadingSeed } from "../exam-content/types";` (merge with the existing types import if present). Extend the interfaces:

```ts
// in ExamQuestionView, after requiresDrawing:
  blanks: string[][] | null;
  pairs: { left: string; right: string }[] | null;
  decoys: string[] | null;
  steps: string[] | null;
  groups: string[] | null;
  items: { text: string; group: number }[] | null;
```

```ts
// in ExamPaperView, after questions:
  readings: ExamReadingSeed[];
```

Add and export this function above `paperView`:

```ts
export function toQuestionView(
  q: ExamQuestionSeed,
  index: number,
  answer?: { your_answer: string; correct: number | null },
): ExamQuestionView {
  return {
    index,
    type: q.type,
    prompt: q.prompt,
    options: q.options ?? null,
    correctIndex: q.correctIndex ?? null,
    correctIndices: q.correctIndices ?? null,
    modelAnswer: q.modelAnswer,
    promptImage: q.promptImage ?? null,
    promptDiagram: q.promptDiagram ?? null,
    answerDiagram: q.answerDiagram ?? null,
    requiresDrawing: q.requiresDrawing ?? false,
    blanks: q.blanks ?? null,
    pairs: q.pairs ?? null,
    decoys: q.decoys ?? null,
    steps: q.steps ?? null,
    groups: q.groups ?? null,
    items: q.items ?? null,
    yourAnswer: answer?.your_answer ?? "",
    correct: answer?.correct ?? null,
  };
}
```

In `paperView`, replace the inline `questions: content.questions.map(...)` block with:

```ts
    questions: content.questions.map((q, index) => toQuestionView(q, index, answers.get(index))),
    readings: content.readings ?? [],
```

- [ ] **Step 4: Run to verify pass and nothing regressed**

Run: `bun test && bunx tsc --noEmit`
Expected: full suite PASS (the existing `api.test.ts` still passes); tsc clean.

- [ ] **Step 5: Commit**

```bash
git add exam/api.ts exam/question-view.test.ts
git commit -m "feat(exam): expose new-format fields and reading cards in the paper view

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Reading-round bookkeeping (pure)

**Files:**
- Create: `exam/reading.ts`, `exam/reading.test.ts`

**Interfaces:**
- Consumes: `ExamReadingSeed` (Task 1).
- Produces: `roundRange(readings: ExamReadingSeed[], readingIdx: number, questionCount: number): [number, number]` (inclusive first, exclusive end); `readingFor(readings, questionIndex): number` (index of the reading whose round contains the question, or `-1`); `roundFullyGraded(readings, readingIdx, graded: (number | null)[]): boolean`; `initialSeenCards(readings, graded: (number | null)[], startIndex: number): Set<number>` (set of reading indices already seen).

- [ ] **Step 1: Write the failing test** — create `exam/reading.test.ts`:

```ts
import { test, expect } from "bun:test";
import { roundRange, readingFor, roundFullyGraded, initialSeenCards } from "./reading";
import type { ExamReadingSeed } from "../exam-content/types";

const R = (beforeQuestion: number): ExamReadingSeed => ({ beforeQuestion, title: `t${beforeQuestion}`, body: "b" });
const readings = [R(0), R(4)]; // rounds: q0-3 and q4-... ; 9 questions total

test("roundRange spans from a card to the next card (or the end)", () => {
  expect(roundRange(readings, 0, 9)).toEqual([0, 4]);
  expect(roundRange(readings, 1, 9)).toEqual([4, 9]);
});

test("readingFor finds the card whose round holds a question; -1 before any card", () => {
  expect(readingFor(readings, 2)).toBe(0);
  expect(readingFor(readings, 4)).toBe(1);
  expect(readingFor(readings, 8)).toBe(1);
  expect(readingFor([R(3)], 1)).toBe(-1);
});

test("roundFullyGraded is true only when every question in the round is graded", () => {
  const g = [1, 0, 1, null, null, null, null, null, null];
  expect(roundFullyGraded(readings, 0, g)).toBe(false);
  expect(roundFullyGraded(readings, 0, [1, 0, 1, 1, null, null, null, null, null])).toBe(true);
});

test("initialSeenCards marks cards for rounds already started or passed", () => {
  const none = Array(9).fill(null) as (number | null)[];
  expect([...initialSeenCards(readings, none, 0)]).toEqual([]);
  const midRound = [1, null, null, null, null, null, null, null, null];
  expect([...initialSeenCards(readings, midRound, 1)]).toEqual([0]);
  expect([...initialSeenCards(readings, none, 5)].sort()).toEqual([0]);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test exam/reading.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement** — create `exam/reading.ts`:

```ts
// Round/card bookkeeping. A reading card introduces a "round": the questions from
// its beforeQuestion up to (not including) the next card's beforeQuestion, or the
// end of the paper. Pure and React-free so it can be unit-tested.
import type { ExamReadingSeed } from "../exam-content/types";

export function roundRange(readings: ExamReadingSeed[], readingIdx: number, questionCount: number): [number, number] {
  const start = readings[readingIdx]!.beforeQuestion;
  const end = readings[readingIdx + 1]?.beforeQuestion ?? questionCount;
  return [start, end];
}

export function readingFor(readings: ExamReadingSeed[], questionIndex: number): number {
  let found = -1;
  readings.forEach((r, i) => {
    if (r.beforeQuestion <= questionIndex) found = i;
  });
  return found;
}

export function roundFullyGraded(readings: ExamReadingSeed[], readingIdx: number, graded: (number | null)[]): boolean {
  const [a, b] = roundRange(readings, readingIdx, graded.length);
  for (let i = a; i < b; i++) if (graded[i] === null || graded[i] === undefined) return false;
  return true;
}

// Cards the student has effectively already seen when a paper opens: any card
// whose round has a graded question, or that lies before the resume point.
export function initialSeenCards(readings: ExamReadingSeed[], graded: (number | null)[], startIndex: number): Set<number> {
  const seen = new Set<number>();
  readings.forEach((r, i) => {
    const [a, b] = roundRange(readings, i, graded.length);
    const started = graded.slice(a, b).some((g) => g !== null && g !== undefined);
    if (started || r.beforeQuestion < startIndex) seen.add(i);
  });
  return seen;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `bun test exam/reading.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add exam/reading.ts exam/reading.test.ts
git commit -m "feat(exam): pure round/card bookkeeping for reading cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Shared UI extraction and the four question components

No React test infrastructure exists in this repo, so this task is verified by `tsc` here and by the browser in Task 8. All logic that can be pure has already been tested in Tasks 2 and 5.

**Files:**
- Create: `exam/shared-ui.tsx`, `exam/FormatQuestions.tsx`
- Modify: `exam/App.tsx` (remove the local `DrawingLink`, `looksLikeCode`, `PromptText`, `EXCALIDRAW_URL` and import them), `index.css`

**Interfaces:**
- Consumes: `isFillBlankCorrect`, `isMatchCorrect`, `isOrderCorrect`, `isSortCorrect` (Task 2); `seedFor`, `shuffledNotIdentity`, `matchChoiceOrder`, `moveItem`, `parseNumberArray`, `parseStringArray` (Task 2); `ExamQuestionView`, `ExamReadingSeed` (Tasks 1, 4).
- Produces: `PromptText`, `DrawingLink` (from `exam/shared-ui.tsx`); from `exam/FormatQuestions.tsx`: `type GradeFn = (correct: boolean, yourAnswer: string) => Promise<void>`; `FillBlankQuestion`, `MatchQuestion`, `OrderQuestion`, `SortQuestion` each taking `{ question: ExamQuestionView; course: string; week: number; paperNumber: number; onGrade: GradeFn }`; `ReadingCard({ reading, onContinue? })`.

- [ ] **Step 1: Extract shared UI** — create `exam/shared-ui.tsx` by cutting `EXCALIDRAW_URL`, `DrawingLink`, `looksLikeCode` and `PromptText` (App.tsx lines 11–48 as of this plan) verbatim into it, adding `import React from "react";` and `export` on `DrawingLink` and `PromptText`. In `exam/App.tsx` delete those definitions and add `import { PromptText, DrawingLink } from "./shared-ui";`.

Run: `bun test && bunx tsc --noEmit`
Expected: PASS (pure refactor).

- [ ] **Step 2: Write the components** — create `exam/FormatQuestions.tsx`:

```tsx
import React, { useState } from "react";
import type { ExamQuestionView } from "./api";
import type { ExamReadingSeed } from "../exam-content/types";
import { MermaidDiagram } from "./MermaidDiagram";
import { PromptText, DrawingLink } from "./shared-ui";
import { isFillBlankCorrect, isMatchCorrect, isOrderCorrect, isSortCorrect } from "./grading";
import { seedFor, shuffledNotIdentity, matchChoiceOrder, moveItem, parseNumberArray, parseStringArray } from "./formats";

// Grades the question and persists the student's answer. App.tsx supplies the
// real implementation (api.grade + error handling); components stay API-free.
export type GradeFn = (correct: boolean, yourAnswer: string) => Promise<void>;

interface FormatProps {
  question: ExamQuestionView;
  course: string;
  week: number;
  paperNumber: number;
  onGrade: GradeFn;
}

function QuestionShell({ question, children }: { question: ExamQuestionView; children: React.ReactNode }) {
  const graded = question.correct !== null;
  return (
    <div className="exam-question">
      {question.type !== "fillblank" && <PromptText text={question.prompt} className="exam-prompt" />}
      {question.promptDiagram && <MermaidDiagram chart={question.promptDiagram} />}
      {children}
      {graded && <PromptText text={question.modelAnswer} className="exam-explanation" />}
      {graded && question.answerDiagram && <MermaidDiagram chart={question.answerDiagram} />}
      {graded && question.requiresDrawing && <DrawingLink />}
    </div>
  );
}

const rowClass = (graded: boolean, ok: boolean) =>
  !graded ? "exam-format-row" : ok ? "exam-format-row exam-option-correct" : "exam-format-row exam-option-wrong";

// ---------- fill in the blank ----------
export function FillBlankQuestion({ question, onGrade }: FormatProps) {
  const blanks = question.blanks ?? [];
  const graded = question.correct !== null;
  const saved = parseStringArray(question.yourAnswer);
  const [typed, setTyped] = useState<string[]>(() => blanks.map((_, i) => saved?.[i] ?? ""));
  const shown = graded ? (saved ?? typed) : typed;

  const check = () => onGrade(isFillBlankCorrect(typed, blanks), JSON.stringify(typed));
  // The reveal is fair to good answers worded differently: after a wrong grade the
  // student can overrule it. gradeExamAnswer upserts, so this is just a second grade.
  const overrule = () => onGrade(true, JSON.stringify(shown));

  const parts = question.prompt.split("___");
  return (
    <QuestionShell question={question}>
      <p className="exam-prompt exam-fill-line">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < blanks.length && (
              <input
                className="exam-blank-input"
                type="text"
                aria-label={`Blank ${i + 1}`}
                value={shown[i] ?? ""}
                disabled={graded}
                onChange={(e) => setTyped((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
              />
            )}
          </React.Fragment>
        ))}
      </p>
      {graded && question.correct === 0 && (
        <div className="exam-format-reveal">
          <p className="exam-multi-hint">Accepted: {blanks.map((b) => b.join(" / ")).join("  ·  ")}</p>
          <button className="btn" onClick={overrule}>Mark me correct</button>
        </div>
      )}
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" disabled={typed.every((t) => t.trim() === "")} onClick={check}>
            Check answer
          </button>
        </div>
      )}
    </QuestionShell>
  );
}

// ---------- match pairs ----------
export function MatchQuestion({ question, course, week, paperNumber, onGrade }: FormatProps) {
  const pairs = question.pairs ?? [];
  const decoys = question.decoys ?? [];
  const rights = [...pairs.map((p) => p.right), ...decoys];
  const graded = question.correct !== null;
  const saved = parseNumberArray(question.yourAnswer);
  const order = matchChoiceOrder(pairs.length, decoys.length, seedFor(course, week, paperNumber, question.index));
  const [chosen, setChosen] = useState<(number | null)[]>(() => pairs.map((_, i) => saved?.[i] ?? null));
  const shown = graded && saved ? saved : chosen;
  const complete = chosen.every((c) => c !== null);

  const check = () => onGrade(isMatchCorrect(chosen as number[], pairs.length), JSON.stringify(chosen));

  return (
    <QuestionShell question={question}>
      <div className="exam-options">
        {pairs.map((p, i) => (
          <label key={i} className={rowClass(graded, shown[i] === i)}>
            <span className="exam-format-left">{p.left}</span>
            <select
              value={shown[i] ?? ""}
              disabled={graded}
              onChange={(e) =>
                setChosen((prev) => prev.map((v, j) => (j === i ? (e.target.value === "" ? null : Number(e.target.value)) : v)))
              }
            >
              <option value="">Choose…</option>
              {order.map((ri) => (
                <option key={ri} value={ri}>{rights[ri]}</option>
              ))}
            </select>
            {graded && shown[i] !== i && <span className="exam-multi-hint">→ {p.right}</span>}
          </label>
        ))}
      </div>
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" disabled={!complete} onClick={check}>Check answer</button>
        </div>
      )}
    </QuestionShell>
  );
}

// ---------- put in order ----------
export function OrderQuestion({ question, course, week, paperNumber, onGrade }: FormatProps) {
  const steps = question.steps ?? [];
  const graded = question.correct !== null;
  const saved = parseNumberArray(question.yourAnswer);
  const [arr, setArr] = useState<number[]>(() => saved ?? shuffledNotIdentity(steps.length, seedFor(course, week, paperNumber, question.index)));
  const shown = graded && saved ? saved : arr;

  const check = () => onGrade(isOrderCorrect(arr, steps.length), JSON.stringify(arr));

  return (
    <QuestionShell question={question}>
      <p className="exam-multi-hint">Put these in the right order using the arrows.</p>
      <div className="exam-options">
        {shown.map((stepIdx, pos) => (
          <div key={stepIdx} className={rowClass(graded, stepIdx === pos)}>
            <span className="exam-format-left">{pos + 1}. {steps[stepIdx]}</span>
            {!graded && (
              <span className="exam-order-controls">
                <button className="btn" aria-label="Move up" disabled={pos === 0} onClick={() => setArr(moveItem(arr, pos, -1))}>↑</button>
                <button className="btn" aria-label="Move down" disabled={pos === shown.length - 1} onClick={() => setArr(moveItem(arr, pos, 1))}>↓</button>
              </span>
            )}
          </div>
        ))}
      </div>
      {graded && question.correct === 0 && (
        <p className="exam-multi-hint">Correct order: {steps.map((s, i) => `${i + 1}. ${s}`).join("  →  ")}</p>
      )}
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" onClick={check}>Check answer</button>
        </div>
      )}
    </QuestionShell>
  );
}

// ---------- sort into groups ----------
export function SortQuestion({ question, onGrade }: FormatProps) {
  const groups = question.groups ?? [];
  const items = question.items ?? [];
  const correct = items.map((it) => it.group);
  const graded = question.correct !== null;
  const saved = parseNumberArray(question.yourAnswer);
  const [chosen, setChosen] = useState<(number | null)[]>(() => items.map((_, i) => saved?.[i] ?? null));
  const shown = graded && saved ? saved : chosen;
  const complete = chosen.every((c) => c !== null);

  const check = () => onGrade(isSortCorrect(chosen as number[], correct), JSON.stringify(chosen));

  return (
    <QuestionShell question={question}>
      <div className="exam-options">
        {items.map((it, i) => (
          <div key={i} className={rowClass(graded, shown[i] === it.group)}>
            <span className="exam-format-left">{it.text}</span>
            <span className="exam-order-controls">
              {groups.map((g, gi) => (
                <button
                  key={gi}
                  className={shown[i] === gi ? "btn btn-primary" : "btn"}
                  disabled={graded}
                  aria-pressed={shown[i] === gi}
                  onClick={() => setChosen((prev) => prev.map((v, j) => (j === i ? gi : v)))}
                >
                  {g}
                </button>
              ))}
            </span>
            {graded && shown[i] !== it.group && <span className="exam-multi-hint">→ {groups[it.group]}</span>}
          </div>
        ))}
      </div>
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" disabled={!complete} onClick={check}>Check answer</button>
        </div>
      )}
    </QuestionShell>
  );
}

// ---------- reading card ----------
export function ReadingCard({ reading, onContinue }: { reading: ExamReadingSeed; onContinue?: () => void }) {
  return (
    <section className="exam-reading">
      <h3 className="exam-reading-title">{reading.title}</h3>
      <PromptText text={reading.body} className="exam-reading-body" />
      {reading.diagram && <MermaidDiagram chart={reading.diagram} />}
      {onContinue && (
        <div className="btn-row">
          <button className="btn btn-primary" onClick={onContinue}>Continue</button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Add styles** — append to `index.css` (after the `.exam-multi-hint` rule; use only existing tokens):

```css
.exam-fill-line {
  line-height: 2.2;
}

.exam-blank-input {
  min-width: 8rem;
  margin: 0 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  color: inherit;
  font: inherit;
}

.exam-format-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem 0.75rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
}

.exam-format-left {
  flex: 1 1 12rem;
}

.exam-order-controls {
  display: flex;
  gap: 0.35rem;
}

.exam-format-reveal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.exam-reading {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  padding: 1rem 1.25rem;
  margin: 0.5rem 0 1rem;
}

.exam-reading-title {
  margin: 0 0 0.5rem;
}

.exam-reading-body {
  color: var(--dim);
}
```

- [ ] **Step 4: Type-check**

Run: `bunx tsc --noEmit && bun test`
Expected: clean (the components are not yet used, which is fine).

- [ ] **Step 5: Commit**

```bash
git add exam/shared-ui.tsx exam/FormatQuestions.tsx exam/App.tsx index.css
git commit -m "feat(exam): fillblank/match/order/sort components and reading card

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Wire the new types and reading cards into the paper view

**Files:**
- Modify: `exam/App.tsx` (`PaperView`, roughly lines 890–1140)

**Interfaces:**
- Consumes: everything from Tasks 4–6.
- Produces: none (leaf).

- [ ] **Step 1: Import and adapter** — add to the imports at the top of `exam/App.tsx`:

```tsx
import { FillBlankQuestion, MatchQuestion, OrderQuestion, SortQuestion, ReadingCard, type GradeFn } from "./FormatQuestions";
import { readingFor, roundFullyGraded, initialSeenCards } from "./reading";
```

Inside `PaperView`, after `const reload = ...`, add:

```tsx
  // Adapter handed to the new-format components: they report (correct, answer);
  // this persists it through the API and refreshes the paper.
  const gradeQuestion = (questionIndex: number): GradeFn => async (correct, yourAnswer) => {
    onError(null);
    try {
      setCurrent(await api.grade(course, paper.week, paper.paperNumber, questionIndex, correct, yourAnswer));
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const NEW_FORMATS = { fillblank: FillBlankQuestion, match: MatchQuestion, order: OrderQuestion, sort: SortQuestion } as const;
  const renderNewFormat = (q: ExamQuestionView) => {
    const Component = NEW_FORMATS[q.type as keyof typeof NEW_FORMATS];
    return (
      <Component
        key={`${q.index}-${q.correct}`}
        question={q}
        course={course}
        week={paper.week}
        paperNumber={paper.paperNumber}
        onGrade={gradeQuestion(q.index)}
      />
    );
  };
  const isNewFormat = (q: ExamQuestionView) => q.type in NEW_FORMATS;
```

- [ ] **Step 2: Reading-card state** — after the existing `useState` for `index`, add:

```tsx
  const readings = current.readings;
  const gradedList = current.questions.map((q) => q.correct);
  const [seenCards, setSeenCards] = useState<Set<number>>(() =>
    initialSeenCards(paper.readings, paper.questions.map((q) => q.correct), index),
  );
  // A card is shown when the student first lands on the first question of its round.
  const pendingCard = readings.findIndex((r, i) => r.beforeQuestion === index && !seenCards.has(i));
  const showingCard = !reviewing && pendingCard !== -1;
  const markSeen = (i: number) => setSeenCards((prev) => new Set(prev).add(i));
  // Once a round is fully graded its card is available again (no peeking mid-round).
  const currentReading = readingFor(readings, index);
  const canReread = currentReading !== -1 && roundFullyGraded(readings, currentReading, gradedList);
```

- [ ] **Step 3: Header, timer and body** — in the JSX, replace the non-reviewing header branch so the timer is not rendered on a card page:

```tsx
        ) : showingCard ? (
          <span className="lang-tag">Reading — before question {index + 1} of {current.questions.length}</span>
        ) : (
          <>
            <span className="lang-tag">Question {index + 1} of {current.questions.length} — {remaining} left</span>
            <QuestionTimer
              budgetSeconds={questionTimeBudget(question)}
              questionKey={question.index}
              frozen={question.correct !== null}
              onExpire={timeUp}
            />
          </>
        )}
```

In the live (non-reviewing) body, wrap the question area: when `showingCard`, render only the card; otherwise the question. Replace the existing ternary chain `{question.type === "mcq" || ... }` with:

```tsx
          {showingCard ? (
            <ReadingCard reading={readings[pendingCard]!} onContinue={() => markSeen(pendingCard)} />
          ) : (
            <>
              {canReread && (
                <details className="exam-reread">
                  <summary>Re-read this round's card</summary>
                  <ReadingCard reading={readings[currentReading]!} />
                </details>
              )}
              {isNewFormat(question) ? (
                renderNewFormat(question)
              ) : question.type === "mcq" || question.type === "truefalse" ? (
                /* existing McqQuestion JSX unchanged */
              ) : question.type === "multi" ? (
                /* existing MultiQuestion JSX unchanged */
              ) : (
                /* existing ShortOrScenarioQuestion JSX unchanged */
              )}
            </>
          )}
```

(Keep the three existing element blocks exactly as they are in the file; only nest them as shown.)

Previous/Next: when `showingCard`, keep them enabled — Next is disabled while the card is showing (the student must press Continue), Previous still works. Set the Next button to `disabled={showingCard || index === current.questions.length - 1}`.

- [ ] **Step 4: Review mode** — in the `reviewing` branch, render each card above its round's first question and add the new-format branch. Replace `current.questions.map((q) => ...)` with:

```tsx
        current.questions.map((q) => (
          <React.Fragment key={`${q.index}-${q.correct}`}>
            {readings.filter((r) => r.beforeQuestion === q.index).map((r) => (
              <ReadingCard key={`r-${r.beforeQuestion}`} reading={r} />
            ))}
            {isNewFormat(q) ? (
              renderNewFormat(q)
            ) : q.type === "mcq" || q.type === "truefalse" ? (
              /* existing McqQuestion JSX unchanged */
            ) : q.type === "multi" ? (
              /* existing MultiQuestion JSX unchanged */
            ) : (
              /* existing ShortOrScenarioQuestion JSX unchanged */
            )}
          </React.Fragment>
        ))
```

Also update the "Grade every question — …" hint text to say `multiple choice grades itself on selection; every other format grades on "Check answer"; reveal and mark short/scenario answers`.

- [ ] **Step 5: Type-check and run the suite**

Run: `bunx tsc --noEmit && bun test`
Expected: clean; all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add exam/App.tsx
git commit -m "feat(exam): render the new formats and reading cards in the paper view

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Verify in the browser with a throwaway fixture

**Files:**
- Create (never committed): `exam-content/tracely/week-2-demo.ts`
- Modify temporarily (never committed): `exam/content.ts`

Everything here runs against a scratch DB. **Do not `git add` the fixture or `exam/content.ts`.** Load the `claude-in-chrome` skill first (`/claude-in-chrome`) and follow its tab-context rules.

- [ ] **Step 1: Create the fixture** — `exam-content/tracely/week-2-demo.ts`:

```ts
import type { ExamPaperSeed } from "../types";

export const WEEK_2_PAPERS: ExamPaperSeed[] = [
  {
    course: "TRACELY", week: 2, paperNumber: 1, title: "Week 2 Demo", topics: "demo", sourceFiles: [],
    readings: [
      { beforeQuestion: 0, title: "Warm-up", body: "Think of a MAC (Message Authentication Code) as a personalised wax seal on a letter.\n\n• Seal: proves nobody changed the letter." },
      { beforeQuestion: 2, title: "Second round", body: "Threats attack you; controls defend you." },
    ],
    questions: [
      { type: "fillblank", prompt: "A ___ is a wax seal for a message, and a ___ turns any input into a fixed fingerprint.", blanks: [["MAC", "message authentication code"], ["hash"]], modelAnswer: "Seal = MAC, fingerprint = hash." },
      { type: "match", prompt: "Match each term.", pairs: [{ left: "MAC", right: "wax seal" }, { left: "Hash", right: "fingerprint" }, { left: "Key", right: "shared secret" }], decoys: ["padlock"], modelAnswer: "Each has one partner." },
      { type: "order", prompt: "Put the handshake in order.", steps: ["Hello", "Certificate", "Key exchange", "Finished"], modelAnswer: "Hello first, Finished last." },
      { type: "sort", prompt: "Threat or control?", groups: ["Threat", "Control"], items: [{ text: "Phishing", group: 0 }, { text: "Firewall", group: 1 }, { text: "Malware", group: 0 }, { text: "MFA", group: 1 }], modelAnswer: "Attacks vs defences." },
    ],
  },
];
```

- [ ] **Step 2: Wire it temporarily** — in `exam/content.ts` add `import { WEEK_2_PAPERS as TRACELY_WEEK_2_PAPERS } from "../exam-content/tracely/week-2-demo";` and `...TRACELY_WEEK_2_PAPERS,` at the end of `ALL_PAPERS`.

- [ ] **Step 3: Start the app on a scratch DB**

Run (background): `SRS_DB_PATH=/tmp/quiz-verify.db PORT=3055 bun index.ts`
Expected: server listening on 3055.

- [ ] **Step 4: Drive it in Chrome** at `http://localhost:3055` → Exam tab → TRACELY → Week 2 → Demo paper. Check and record each:
  1. A "Warm-up" reading card appears first; no timer is shown; Next is disabled until **Continue**.
  2. Fillblank: type `mac` and `HASH!` → Check → graded **correct**. Reload the page → answer still shown.
  3. Match: pick all three correctly → correct; the "padlock" decoy is a choice. Try a wrong pairing on a second run (retake) → wrong rows highlighted with `→ partner`.
  4. Round 2 card appears before the Order question; **Previous** from it mid-round does not show the card again.
  5. Order: opens shuffled (not solved); use arrows to solve → correct; a wrong arrangement reveals the correct order.
  6. Sort: pick correctly → correct; wrong shows `→ Group`.
  7. Fillblank wrong (type `zzz`) → **Mark me correct** appears and flips it to correct.
  8. After the last question **Submit paper** works; review mode shows each card above its round.
  Check the browser console for errors after each step.

- [ ] **Step 5: Clean up**

Run: `git checkout exam/content.ts && rm exam-content/tracely/week-2-demo.ts && rm -f /tmp/quiz-verify.db` and stop the background server.
Expected: `git status` shows no changes from this task.

If any check fails, fix it in the relevant task's files, re-run `bun test && bunx tsc --noEmit`, commit the fix (`git commit -m "fix(exam): <what>"`), and repeat the failed browser check.

---

### Task 9: Pipeline stages (pure prompts)

**Files:**
- Create: `exam/pipeline.ts`, `exam/pipeline.test.ts`

**Interfaces:**
- Produces: `type StageName = "read" | "explain" | "plan" | "write" | "check"`; `type GenerateMode = "generate" | "update"`; `STAGES: StageName[]`; `STAGE_LABELS: Record<StageName, string>`; `interface StageContext { course: string; week: number; weekDir: string; mode: GenerateMode }`; `stageOutputPath(stage: StageName, course: string, week: number): string | null`; `buildStagePrompt(stage: StageName, ctx: StageContext, writerBase?: string): string`. Must not import any `node:*` module (the browser imports `STAGE_LABELS`).

- [ ] **Step 1: Write the failing test** — create `exam/pipeline.test.ts`:

```ts
import { test, expect } from "bun:test";
import { STAGES, STAGE_LABELS, stageOutputPath, buildStagePrompt, type StageContext } from "./pipeline";

const ctx: StageContext = { course: "COMP5348", week: 5, weekDir: "/w/dir", mode: "generate" };

test("stages run in the agreed order with human labels", () => {
  expect(STAGES).toEqual(["read", "explain", "plan", "write", "check"]);
  expect(STAGE_LABELS.read).toBe("Reader");
  expect(STAGE_LABELS.check).toBe("Checker");
});

test("each stage names its output file; check writes none", () => {
  expect(stageOutputPath("read", "COMP5348", 5)).toBe("exam-content/comp5348/week-5-notes.md");
  expect(stageOutputPath("explain", "COMP5348", 5)).toBe("exam-content/comp5348/week-5-learning.md");
  expect(stageOutputPath("plan", "COMP5348", 5)).toBe("exam-content/comp5348/week-5-plan.md");
  expect(stageOutputPath("write", "COMP5348", 5)).toBe("exam-content/comp5348/week-5.ts");
  expect(stageOutputPath("check", "COMP5348", 5)).toBeNull();
});

test("reader prompt demands every in-class quiz question verbatim and reads the transcript", () => {
  const p = buildStagePrompt("read", ctx);
  expect(p).toContain("/w/dir");
  expect(p).toContain("week-5-notes.md");
  expect(p).toContain("verbatim");
  expect(p).toContain("transcript");
});

test("explainer prompt asks for analogy, worked example and jargon decoder for 5-8 ideas", () => {
  const p = buildStagePrompt("explain", ctx);
  expect(p).toContain("week-5-notes.md");
  expect(p).toContain("week-5-learning.md");
  expect(p).toContain("analogy");
  expect(p).toContain("jargon");
  expect(p).toMatch(/5.?8/);
});

test("planner prompt covers rounds, format selection, quotas and the mixed-review round", () => {
  const p = buildStagePrompt("plan", ctx);
  for (const s of ["week-5-plan.md", "match", "order", "sort", "fillblank", "mixed review", "about 12", "lecture-quiz"]) {
    expect(p).toContain(s);
  }
});

test("writer prompt wraps the base authoring prompt and points at the plan and learning set", () => {
  const p = buildStagePrompt("write", ctx, "BASE AUTHORING PROMPT");
  expect(p).toContain("BASE AUTHORING PROMPT");
  expect(p).toContain("week-5-plan.md");
  expect(p).toContain("week-5-learning.md");
  expect(p).toContain("readings");
});

test("checker prompt lists the audit checklist and the scripts to run", () => {
  const p = buildStagePrompt("check", ctx);
  for (const s of ["lecture-quiz", "check-exam-structure", "check-mcq-lengths", "bun test"]) expect(p).toContain(s);
});

test("update mode tells every stage the week is ALREADY-AUTHORED and forbids touching existing questions", () => {
  for (const stage of STAGES) {
    const p = buildStagePrompt(stage, { ...ctx, mode: "update" }, "BASE");
    expect(p).toContain("ALREADY-AUTHORED");
  }
  expect(buildStagePrompt("check", { ...ctx, mode: "update" })).toContain("git diff");
  expect(buildStagePrompt("write", { ...ctx, mode: "update" }, "BASE")).toContain("append");
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test exam/pipeline.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement** — create `exam/pipeline.ts`:

```ts
// The five-agent generation pipeline: stage definitions and prompt builders.
// Browser-safe on purpose (no node:* imports) — App.tsx imports STAGE_LABELS.
// generate.ts runs the stages; each is its own `claude -p` call that hands its
// output to the next as a file on disk.

export type StageName = "read" | "explain" | "plan" | "write" | "check";
export type GenerateMode = "generate" | "update";

export const STAGES: StageName[] = ["read", "explain", "plan", "write", "check"];

export const STAGE_LABELS: Record<StageName, string> = {
  read: "Reader",
  explain: "Explainer",
  plan: "Planner",
  write: "Writer",
  check: "Checker",
};

export interface StageContext {
  course: string;
  week: number;
  weekDir: string;
  mode: GenerateMode;
}

// Repo-relative file each stage must produce. The checker edits in place and
// produces no new file.
export function stageOutputPath(stage: StageName, course: string, week: number): string | null {
  const dir = `exam-content/${course.toLowerCase()}`;
  switch (stage) {
    case "read": return `${dir}/week-${week}-notes.md`;
    case "explain": return `${dir}/week-${week}-learning.md`;
    case "plan": return `${dir}/week-${week}-plan.md`;
    case "write": return `${dir}/week-${week}.ts`;
    case "check": return null;
  }
}

const HEADLESS =
  "You are running unattended in headless mode with no human present to ask questions — make reasonable, well-justified judgment calls yourself rather than stopping to ask.";

function modeNote(ctx: StageContext): string {
  if (ctx.mode === "generate") return "";
  return `\n\nMODE: this week is ALREADY-AUTHORED (exam-content/${ctx.course.toLowerCase()}/week-${ctx.week}.ts exists). New material was added after it was written. Work only on what the new material adds; never reorder, delete, or rewrite the position of any existing question. Only append new questions to the END of an existing paper's questions array, and attach any new reading card at or after the old question count. Never create a new paperNumber.`;
}

export function buildStagePrompt(stage: StageName, ctx: StageContext, writerBase = ""): string {
  const lc = ctx.course.toLowerCase();
  const notes = `exam-content/${lc}/week-${ctx.week}-notes.md`;
  const learning = `exam-content/${lc}/week-${ctx.week}-learning.md`;
  const plan = `exam-content/${lc}/week-${ctx.week}-plan.md`;
  const note = modeNote(ctx);

  switch (stage) {
    case "read":
      return `You are the READER for ${ctx.course} week ${ctx.week} of the leetcode-srs project. Follow docs/exam-content-authoring-guide.md, point 1.

Read all real material in "${ctx.weekDir}": slides, tutorial sheets, and every "*.transcript.md" (an auto-generated transcript of a lecture/tutorial recording — the video itself can't be opened). Also read exam-content/${lc}/unit_outline.md and exam-content/${lc}/assessment_overview.md if they exist.

Write ${notes} with these sections:
1. Important points from slides.
2. Important points only in the video (announcements, asides, verbal emphasis, worked examples).
3. Lecture-quiz questions: EVERY question the lecturer puts to the class (Mentimeter/poll/in-class quiz/"pause and think"/rhetorical-then-answered), copied verbatim, each with the answer the lecturer gave.
4. Post-lecture Q&A: bullet points from the informal teacher/student discussion at the tail of the recording.
Do not write any quiz questions yet.${note}

${HEADLESS} When done, print one short summary line.`;

    case "explain":
      return `You are the EXPLAINER for ${ctx.course} week ${ctx.week}. Read ${notes} (and the raw material in "${ctx.weekDir}" only to check a fact).

The reader of your output is a smart 15-year-old who has never seen the jargon and prioritises understanding over sounding precise. Pick the 5-8 ideas that matter most this week. Write ${learning}: for each idea, a section with
• an everyday analogy FIRST (one or two sentences, before any technical term),
• a short worked example,
• a "jargon decoder" defining every acronym and technical term the first time it appears,
• a Mermaid diagram only if the idea is a process or structure.
Keep each idea to roughly 100-150 words; hard cap 200. No markdown bold; use "• " bullets and blank lines between blocks, and avoid () {} _ => == inside multi-line blocks.${note}

${HEADLESS} When done, print one short summary line.`;

    case "plan":
      return `You are the PLANNER for ${ctx.course} week ${ctx.week}. Read ${notes}, ${learning}, and exam-content/${lc}/week-${ctx.week - 1}.ts plus earlier weeks' files if they exist, plus docs/exam-content-authoring-guide.md.

Write ${plan} deciding, before any question is written:
1. Rounds: which ideas need a reading card first, and which questions belong to each round (3-6 questions per round).
2. A format for each idea: definitions → match; processes/protocols → order; classifications → sort; key terms → fillblank; distinguish/apply → mcq or multi; several true statements → multi.
3. Quotas for a ~50-question paper: about 12 new-format questions (about 3 each of fillblank/match/order/sort), about 26 mcq, about 10 multi, about 2 truefalse. Tutorial papers can be smaller.
4. Where EVERY lecture-quiz question from the notes lands — none dropped; they count toward the ~50.
5. A final mixed review round with no card: about 6-8 questions, at least 3 on concepts from earlier weeks (new questions, never copies), the rest jumbled topics from this week, no more than 2 consecutive on the same subtopic. Week 1 has no earlier weeks.
6. At least ~10 "why / what happens if" questions.
7. Where a diagram helps.
Keep questions exam-style and application-focused: cards teach the idea, questions apply it to a new example and never repeat a card sentence as the answer.${note}

${HEADLESS} When done, print one short summary line.`;

    case "write":
      return `${writerBase}

PIPELINE ADDENDUM — you are the WRITER stage. The reader, explainer and planner have already run. Read ${plan}, ${learning} and ${notes} FIRST and follow the plan exactly; consult the raw material only to verify a fact.
• Turn each learning-set idea the plan gives a card into a reading card in the paper's "readings" array (beforeQuestion = the index of that round's first question; body ≤ 200 words, plain teen-style).
• Use the new question types (fillblank, match, order, sort) exactly as exam-content/types.ts defines them.
• Follow docs/exam-content-authoring-guide.md for the count, mix, and the teenager-style modelAnswer shape.
• Run "bun scripts/check-exam-structure.ts" and "bun scripts/check-mcq-lengths.ts ${ctx.course}" and fix every issue.${modeNote(ctx)}`;

    case "check":
      return `You are the CHECKER for ${ctx.course} week ${ctx.week} — an independent reviewer who did not write this. Audit exam-content/${lc}/week-${ctx.week}.ts against ${plan}, ${learning}, ${notes} and docs/exam-content-authoring-guide.md, and FIX problems in place:
• every lecture-quiz question from the notes is present (none dropped or merged away);
• question count is about 50 per lecture paper and the type mix is within tolerance;
• no reading card contains the answer sentence to a question in its round;
• every modelAnswer is traceable to the source material and follows the teenager-style shape;
• readings are attached at the right beforeQuestion indices and each body is ≤ 200 words;
• run "bun scripts/check-exam-structure.ts", "bun scripts/check-mcq-lengths.ts ${ctx.course}", and "bun test" and fix every failure until all pass.${ctx.mode === "update" ? `\n• run "git diff" on exam-content/${lc}/week-${ctx.week}.ts and confirm every pre-existing question is unchanged and in its original position; only appended questions and cards are allowed.` : ""}${modeNote(ctx)}

${HEADLESS} When done, print one short summary line and confirm bun test passes.`;
  }
}
```

- [ ] **Step 4: Run to verify pass**

Run: `bun test exam/pipeline.test.ts && bunx tsc --noEmit`
Expected: PASS; tsc clean.

- [ ] **Step 5: Commit**

```bash
git add exam/pipeline.ts exam/pipeline.test.ts
git commit -m "feat(exam): five-stage pipeline definitions and prompt builders

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Run the pipeline in the job runner

**Files:**
- Modify: `exam/generate.ts`, `exam/generate.test.ts`, `exam/App.tsx` (stage label)

**Interfaces:**
- Consumes: `STAGES`, `STAGE_LABELS`, `StageName`, `GenerateMode`, `buildStagePrompt`, `stageOutputPath` (Task 9).
- Produces: `JobStatus` gains `stage?: StageName`, `mode?: GenerateMode`, `failedStage?: StageName`, `updatedAt?: string`; `StartJobDeps` gains `checkStageOutput?: (stage: StageName, ctx: StageContext) => Promise<boolean>`; `defaultGenerateDeps` sets the real checker; `ALLOWED_TOOLS` becomes `"Read Write Edit Glob Grep Bash(bun test*) Bash(bun scripts/*) Bash(git diff*)"`.

- [ ] **Step 1: Update and add tests** in `exam/generate.test.ts`:

  a. Change the `buildClaudeArgs` test's expected `ALLOWED_TOOLS` literal to `"Read Write Edit Glob Grep Bash(bun test*) Bash(bun scripts/*) Bash(git diff*)"` (and rename the test to mention the added scoped Bash commands).

  b. In the two mode tests ("passes the update prompt…", "defaults to the generate prompt…") capture **all** prompts and assert on them:

```ts
  const prompts: string[] = [];
  const fakeRunClaude: RunClaude = async (args) => {
    prompts.push(args.at(-1) ?? "");
    return { stdout: "enriched", stderr: "", exitCode: 0 };
  };
  // …after the job:
  expect(prompts.some((p) => p.includes("ALREADY-AUTHORED"))).toBe(true);   // update test
  expect(prompts.some((p) => p.includes("Author exam-content"))).toBe(true); // generate test
```

  c. Add new tests:

```ts
import { STAGES } from "./pipeline";

test("startGenerateJob runs the five stages in order, one claude call each", async () => {
  const root = makeTempDir();
  const seen: string[] = [];
  const fake: RunClaude = async (args) => {
    seen.push(args.at(-1) ?? "");
    return { stdout: "ok", stderr: "", exitCode: 0 };
  };
  const result = await startGenerateJob("INFO5995", 40, "/fake", { runClaude: fake, root });
  if (result.ok) await result.done;
  expect(seen.length).toBe(STAGES.length);
  expect(seen[0]).toContain("READER");
  expect(seen[1]).toContain("EXPLAINER");
  expect(seen[2]).toContain("PLANNER");
  expect(seen[3]).toContain("WRITER");
  expect(seen[4]).toContain("CHECKER");
  expect((await readJobStatus("INFO5995", 40, root)).state).toBe("done");
});

test("status records the running stage while it runs", async () => {
  const root = makeTempDir();
  const stagesSeen: (string | undefined)[] = [];
  const fake: RunClaude = async () => {
    stagesSeen.push((await readJobStatus("INFO5995", 41, root)).stage);
    return { stdout: "ok", stderr: "", exitCode: 0 };
  };
  const result = await startGenerateJob("INFO5995", 41, "/fake", { runClaude: fake, root });
  if (result.ok) await result.done;
  expect(stagesSeen).toEqual(["read", "explain", "plan", "write", "check"]);
});

test("a failing stage stops the pipeline and records failedStage", async () => {
  const root = makeTempDir();
  let calls = 0;
  const fake: RunClaude = async () => {
    calls++;
    return calls === 3 ? { stdout: "", stderr: "boom", exitCode: 1 } : { stdout: "ok", stderr: "", exitCode: 0 };
  };
  const result = await startGenerateJob("INFO5995", 42, "/fake", { runClaude: fake, root });
  if (result.ok) await result.done;
  const status = await readJobStatus("INFO5995", 42, root);
  expect(calls).toBe(3);
  expect(status.state).toBe("failed");
  expect(status.failedStage).toBe("plan");
  expect(status.exitCode).toBe(1);
});

test("retry after a failure resumes from the failed stage", async () => {
  const root = makeTempDir();
  let first = true;
  const failPlan: RunClaude = async (args) => {
    const p = args.at(-1) ?? "";
    return first && p.includes("PLANNER") ? { stdout: "", stderr: "x", exitCode: 1 } : { stdout: "ok", stderr: "", exitCode: 0 };
  };
  let r = await startGenerateJob("INFO5995", 43, "/fake", { runClaude: failPlan, root });
  if (r.ok) await r.done;
  first = false;
  const seen: string[] = [];
  const ok: RunClaude = async (args) => {
    seen.push(args.at(-1) ?? "");
    return { stdout: "ok", stderr: "", exitCode: 0 };
  };
  r = await startGenerateJob("INFO5995", 43, "/fake", { runClaude: ok, root });
  if (r.ok) await r.done;
  expect(seen.length).toBe(3); // plan, write, check
  expect(seen[0]).toContain("PLANNER");
  expect((await readJobStatus("INFO5995", 43, root)).state).toBe("done");
});

test("a stage that exits 0 but did not write its output file fails the job", async () => {
  const root = makeTempDir();
  const fake: RunClaude = async () => ({ stdout: "ok", stderr: "", exitCode: 0 });
  const result = await startGenerateJob("INFO5995", 44, "/fake", {
    runClaude: fake,
    root,
    checkStageOutput: async () => false,
  });
  if (result.ok) await result.done;
  const status = await readJobStatus("INFO5995", 44, root);
  expect(status.state).toBe("failed");
  expect(status.failedStage).toBe("read");
  expect(status.logTail).toContain("did not write");
});

test("staleness is measured from the last stage update, not from the job start", async () => {
  const root = makeTempDir();
  const dir = join(root, "INFO5995-45");
  mkdirSync(dir, { recursive: true });
  const startedAt = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const updatedAt = new Date().toISOString();
  writeFileSync(join(dir, "status.json"), JSON.stringify({ state: "running", startedAt, updatedAt, stage: "write" }));
  expect((await readJobStatus("INFO5995", 45, root)).state).toBe("running");
});
```

- [ ] **Step 2: Run to verify failure**

Run: `bun test exam/generate.test.ts`
Expected: FAIL (new tests and updated literal).

- [ ] **Step 3: Implement** in `exam/generate.ts`:

  a. Imports and re-exports — add at the top:

```ts
import { STAGES, buildStagePrompt, stageOutputPath, type StageName, type StageContext, type GenerateMode } from "./pipeline";
export type { GenerateMode } from "./pipeline";
```

  and delete the local `export type GenerateMode = "generate" | "update";` line.

  b. `JobStatus`:

```ts
export interface JobStatus {
  state: "idle" | "running" | "done" | "failed";
  startedAt?: string;
  updatedAt?: string;
  finishedAt?: string;
  exitCode?: number;
  logTail?: string;
  stage?: StageName;
  mode?: GenerateMode;
  failedStage?: StageName;
}
```

  c. `withStaleness` — measure from the last update:

```ts
  const since = status.updatedAt ?? status.startedAt;
  if (status.state !== "running" || !since) return status;
  const age = Date.now() - new Date(since).getTime();
```

  d. `ALLOWED_TOOLS = "Read Write Edit Glob Grep Bash(bun test*) Bash(bun scripts/*) Bash(git diff*)"`.

  e. In `buildGeneratePrompt`, replace the sentence `Roughly 20-25 questions per paper.` with `About 50 questions per lecture paper (see the authoring guide's "Question count per paper"); a tutorial paper can be smaller.` Confirm `bun test exam/generate.test.ts` prompt tests still pass.

  f. `StartJobDeps` and default:

```ts
export type CheckStageOutput = (stage: StageName, ctx: StageContext) => Promise<boolean>;

export interface StartJobDeps {
  runClaude: RunClaude;
  root: string;
  transcribe?: TranscribeFn;
  whisperModel?: string;
  mode?: GenerateMode;
  checkStageOutput?: CheckStageOutput;
}

// Real check: the stage's output file exists and is non-empty. Tests inject their
// own (or omit it, which skips the check).
export const defaultCheckStageOutput: CheckStageOutput = async (stage, ctx) => {
  const rel = stageOutputPath(stage, ctx.course, ctx.week);
  if (rel === null) return true;
  const file = Bun.file(join(REPO_ROOT, rel));
  return (await file.exists()) && file.size > 0;
};
```

  Add `checkStageOutput: defaultCheckStageOutput,` to `defaultGenerateDeps`. (`REPO_ROOT` is a `const` declared later in the file; move its declaration above this block.)

  g. `startGenerateJob`: compute the resume point before writing the "running" status and pass `deps.checkStageOutput` through:

```ts
    const mode = deps.mode ?? "generate";
    const resumeFrom: StageName =
      existing.state === "failed" && existing.failedStage && existing.mode === mode ? existing.failedStage : "read";
    await Bun.write(statusPath, JSON.stringify({ state: "running", startedAt, updatedAt: startedAt, stage: resumeFrom, mode } satisfies JobStatus));
```

  and call `runGeneration(course, week, weekDir, statusPath, startedAt, deps.runClaude, deps.transcribe ?? transcribeVideo, deps.whisperModel ?? DEFAULT_WHISPER_MODEL, mode, resumeFrom, deps.checkStageOutput)`.

  h. Replace `runGeneration`'s body:

```ts
async function runGeneration(
  course: string,
  week: number,
  weekDir: string,
  statusPath: string,
  startedAt: string,
  runClaude: RunClaude,
  transcribe: TranscribeFn,
  whisperModel: string,
  mode: GenerateMode,
  resumeFrom: StageName,
  checkStageOutput?: CheckStageOutput,
): Promise<void> {
  const ctx: StageContext = { course, week, weekDir, mode };
  const writerBase = mode === "update" ? buildUpdatePrompt(course, week, weekDir) : buildGeneratePrompt(course, week, weekDir);
  let lastLog = "";
  let currentStage: StageName = resumeFrom;
  try {
    // Transcribe any untranscribed video before the reader runs.
    if (resumeFrom === "read") await transcribeWeekVideos(weekDir, transcribe, whisperModel);
    for (const stage of STAGES.slice(STAGES.indexOf(resumeFrom))) {
      currentStage = stage;
      await Bun.write(
        statusPath,
        JSON.stringify({ state: "running", startedAt, updatedAt: new Date().toISOString(), stage, mode } satisfies JobStatus),
      );
      const args = buildClaudeArgs(buildStagePrompt(stage, ctx, writerBase));
      const { stdout, stderr, exitCode } = await runClaude(args, REPO_ROOT);
      lastLog = summarizeOutput(stdout, stderr);
      if (exitCode !== 0) {
        await Bun.write(
          statusPath,
          JSON.stringify({ state: "failed", startedAt, finishedAt: new Date().toISOString(), exitCode, logTail: lastLog, failedStage: stage, mode } satisfies JobStatus),
        );
        return;
      }
      if (checkStageOutput && !(await checkStageOutput(stage, ctx))) {
        await Bun.write(
          statusPath,
          JSON.stringify({
            state: "failed", startedAt, finishedAt: new Date().toISOString(), exitCode,
            logTail: `The ${stage} stage finished but did not write ${stageOutputPath(stage, course, week)}.`,
            failedStage: stage, mode,
          } satisfies JobStatus),
        );
        return;
      }
    }
    await Bun.write(
      statusPath,
      JSON.stringify({ state: "done", startedAt, finishedAt: new Date().toISOString(), exitCode: 0, logTail: lastLog, mode } satisfies JobStatus),
    );
  } catch (err) {
    await Bun.write(
      statusPath,
      JSON.stringify({
        state: "failed", startedAt, finishedAt: new Date().toISOString(),
        logTail: err instanceof Error ? err.message : String(err), failedStage: currentStage, mode,
      } satisfies JobStatus),
    );
  }
}
```

  i. `exam/App.tsx` — add `import { STAGE_LABELS, STAGES } from "./pipeline";` and change the running label in `SyncBanner` (and the single-week counterpart if it builds the same string — grep for `Generating…`) to:

```tsx
? `Generating… ${job!.stage ? `${STAGE_LABELS[job!.stage]} ${STAGES.indexOf(job!.stage) + 1}/${STAGES.length} ` : ""}${formatElapsed(job!.startedAt!, tick)}`
```

- [ ] **Step 4: Run to verify pass**

Run: `bun test && bunx tsc --noEmit`
Expected: full suite PASS (including the untouched existing generate tests: "non-zero exit → failed with exitCode 1", the lock tests, the transcription tests); tsc clean.

- [ ] **Step 5: Commit**

```bash
git add exam/generate.ts exam/generate.test.ts exam/App.tsx
git commit -m "feat(exam): run generation as five sequential agent stages with resume

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Docs and the in-session command

**Files:**
- Modify: `docs/exam-content-authoring-guide.md`, `CLAUDE.md`, `.claude/commands/generate-week-content.md`

- [ ] **Step 1: Authoring guide** — in `docs/exam-content-authoring-guide.md`:
  - In "## Format", replace the bullet beginning `- Each paper's \`questions\` array holds every question…` and the bullet beginning `- Each paper's question types follow the mix…` with:

```markdown
- A lecture paper is about 50 questions (a tutorial paper ~30–35). Reading cards
  do not count toward that and are not scored. Per ~50: about 26 `mcq`, 10 `multi`,
  2 `truefalse`, and about 12 new-format questions (about 3 each of `fillblank`,
  `match`, `order`, `sort`). `short` / `scenario` are Phase 2 and are not authored yet.
- **New formats** (see `exam-content/types.ts`): `fillblank` (`blanks` = accepted
  answers per blank, one `___` per blank in `prompt`; single word/term only),
  `match` (`pairs`, optional `decoys`), `order` (`steps` authored in the correct
  order), `sort` (`groups` + `items`). Choose by the idea: definitions → match,
  processes → order, classifications → sort, key terms → fillblank, distinguish/apply
  → mcq or multi.
- **Reading cards** (`readings` on the paper): one short card (100–150 words, hard
  cap 200) before each round of 3–6 related questions, in the teenager style —
  analogy first, a worked example, jargon decoded, a Mermaid `diagram` when the idea
  is a process or structure. `beforeQuestion` is the index of the round's first
  question. Cards teach; the questions apply the idea to a new example and never
  repeat a card sentence as the answer.
- **Mixed-review round**: the last round of a paper has no card — about 6–8
  questions, at least 3 on earlier weeks' concepts (written as new questions), the
  rest jumbled topics from this week; no more than 2 consecutive on one subtopic.
  Week 1 has no earlier weeks.
- At least ~10 "why / what happens if" questions per paper.
- Run `bun scripts/check-exam-structure.ts` after authoring; it must report 0 issues.
```

  - Add a new section before "## Verification":

```markdown
## The five-agent process

Generate and Update run five sequential stages, each handing a file to the next:
Reader → `week-N-notes.md`; Explainer → `week-N-learning.md` (the cards and a
standalone study guide); Planner → `week-N-plan.md` (rounds, which ideas need a
card, a format per idea, quotas, where every lecture-quiz question lands); Writer →
`week-N.ts`; Checker — an independent audit that fixes problems in place. In Update
mode the Writer only appends and the Checker confirms with `git diff` that no
existing question moved. A failed stage is retried from that stage.
```

- [ ] **Step 2: CLAUDE.md** — in the project `CLAUDE.md`:
  - In "Generation phase — Phase 1", after the bullet list of allowed types add `- \`fillblank\`, \`match\`, \`order\`, \`sort\` (single-word typed blanks are exact-match gradable, so they are allowed now)`; keep "Do NOT author `short` or `scenario` questions".
  - Delete the whole "**Outstanding gap:**" paragraph (`multi` exists).
  - In "Question count per paper", replace the sentence `Aim for roughly 33 \`mcq\`, 14 multiple-answer and 3 \`truefalse\` in a lecture paper` with `Aim for roughly 26 \`mcq\`, 10 multiple-answer, 2 \`truefalse\` and about 12 new-format questions (\`fillblank\`/\`match\`/\`order\`/\`sort\`) in a lecture paper`.
  - In the "Spec requirement: continuous testing" section, replace `This repo currently has no such hook configured (no \`.git/hooks/pre-commit\`, no CI). Until one exists, treat this as an outstanding requirement — any SPEC.md that omits it is incomplete.` with `The PostToolUse hook is configured in \`.claude/settings.json\` (runs \`bun test\` and \`tsc --noEmit\`); any SPEC.md must still include this section.`

- [ ] **Step 3: In-session command** — in `.claude/commands/generate-week-content.md`, replace the body of "## 3. Author / update the target week(s) with a subagent" (from the heading through the paragraph ending `…report back to you instead of writing \`status.json\`.`) with:

```markdown
## 3. Author / update the target week(s) with five subagents

The app runs five sequential stages (`STAGES` in `exam/pipeline.ts`): Reader →
Explainer → Planner → Writer → Checker. Do the same here, one `general-purpose`
Agent per stage, **sequentially** — each stage reads the file the previous one wrote.

For each stage, print the exact prompt the app would use and pass it verbatim as the
Agent's task (plus one line saying it is an in-session subagent, not the headless job):

​```
bun -e "import { buildStagePrompt } from './exam/pipeline'; import { buildGeneratePrompt, buildUpdatePrompt } from './exam/generate'; const ctx = { course: '<COURSE>', week: <week>, weekDir: '<weekDir>', mode: '<generate|update>' as const }; const base = ctx.mode === 'update' ? buildUpdatePrompt(ctx.course, ctx.week, ctx.weekDir) : buildGeneratePrompt(ctx.course, ctx.week, ctx.weekDir); console.log(buildStagePrompt('<read|explain|plan|write|check>', ctx, base))"
​```

Use `mode: 'generate'` for a `newWeeks` target and `'update'` for an `updatableWeeks`
target. After each stage confirm its output file exists (`stageOutputPath` in
`exam/pipeline.ts`) before starting the next; if a stage fails, re-run from that stage.
```

(Remove the zero-width space shown before the fences above; they only keep this plan's fence nesting intact.) Leave the "Multiple targets (`all`)" paragraph, which applies per stage sequence, and step 4 onward unchanged.

- [ ] **Step 4: Verify and commit**

Run: `bun test && bunx tsc --noEmit`
Expected: PASS.

```bash
git add docs/exam-content-authoring-guide.md CLAUDE.md .claude/commands/generate-week-content.md
git commit -m "docs(exam): authoring rules, five-agent process, and command for new formats and reading cards

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Final verification and hand-off

- [ ] **Step 1: Full checks**

Run: `bun test && bunx tsc --noEmit && bun scripts/check-exam-structure.ts && git status --short && git log --oneline main..HEAD`
Expected: all tests PASS; tsc clean; `TOTAL ISSUES: 0`; only the pre-existing `.DS_Store` noise in `git status`; the log shows only this branch's small commits.

- [ ] **Step 2: Confirm existing content is untouched**

Run: `git diff main..HEAD --stat -- exam-content ':!exam-content/types.ts'`
Expected: no output (no existing week file changed).

- [ ] **Step 3: Report** — tell the user: the branch name, that nothing is merged or pushed, how to try it (the next Generate/Update click runs the five stages; existing weeks unchanged), and how to revert (`git checkout main && git branch -D docs/evidence-based-quiz-design`). Do not merge or push.
