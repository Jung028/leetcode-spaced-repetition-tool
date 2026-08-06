# Modules Sync (Exam→Modules rename + in-app pending-week detection) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the "Exam" tab to "Modules" in the UI, and add a read-only "Sync" button that scans the local USYD course folders for weeks that have real material but no authored `week-N.ts` yet, surfacing them in the UI so nothing gets forgotten.

**Architecture:** A new `exam-sync.ts` module does a pure filesystem scan (no DB, no network, no writes) comparing each course's local folder against what `exam-content.ts` already has authored, reusing the existing `scanWeekFolder` material-detection helper from `scripts/generate-exam-week.ts`. A new `GET /api/exam/sync` route in `exam-api.ts` exposes it. `ExamApp.tsx` gets a "Sync" button that calls it and shows a dismissible banner. The tab rename is two one-line text changes with no route/type renaming.

**Tech Stack:** Bun, TypeScript, React 19, `node:fs`/`node:path` (via Bun's Node compat), `bun:sqlite` (unaffected by this plan), `bun test`.

## Global Constraints

- No runtime LLM/API calls anywhere in this plan — detection is a pure filesystem read.
- No writes to disk from the sync endpoint or button — read-only scan only.
- No changes to `exam-content/types.ts` (`ExamPaperSeed`/`ExamQuestionSeed` stay as-is).
- No renaming of the internal `Tab`/`DeepLink` `"exam"` value, `ExamApp` component name, or any `/api/exam/*` route path — the rename is UI text only.
- Every task ends green on `bun test` before moving to the next.

---

### Task 1: `exam-sync.ts` — pending-week detection

**Files:**
- Create: `exam-sync.ts`
- Test: `exam-sync.test.ts`

**Interfaces:**
- Consumes: `scanWeekFolder(weekDir: string): { materials: string[]; videos: string[] }` from `./scripts/generate-exam-week` (already exported); `buildExamSchedule(): ExamPaperSeed[]` from `./exam-content` (already exported).
- Produces: `COURSE_DIRS: Record<string, string>`, `PendingWeek` interface (`{ course: string; week: number }`), `findPendingWeeks(courseDirs?: Record<string, string>): PendingWeek[]` — all exported from `exam-sync.ts`, consumed by Task 2.

- [ ] **Step 1: Write the failing tests**

Create `exam-sync.test.ts`:

```ts
import { test, expect, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { findPendingWeeks } from "./exam-sync";

const tempDirs: string[] = [];

function makeCourseDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "exam-sync-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length) rmSync(tempDirs.pop()!, { recursive: true, force: true });
});

test("a week folder with only .DS_Store is not pending", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 1");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, ".DS_Store"), "");

  const pending = findPendingWeeks({ TESTCRS: courseDir });
  expect(pending).toEqual([]);
});

test("a week folder with real material and no existing content is pending", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 3");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "lecture.pdf"), "fake pdf bytes");

  const pending = findPendingWeeks({ TESTCRS: courseDir });
  expect(pending).toEqual([{ course: "TESTCRS", week: 3 }]);
});

test("a week already present in buildExamSchedule() is excluded even with material on disk", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "Week 1");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "lecture.pdf"), "fake pdf bytes");

  // INFO5995 Week 1 already has authored content in exam-content.ts.
  const pending = findPendingWeeks({ INFO5995: courseDir });
  expect(pending).toEqual([]);
});

test("non-'Week N' folders (Readings, Exam, a stray 'Week' with no number) are ignored", () => {
  const courseDir = makeCourseDir();
  for (const name of ["Readings", "Exam", "Week"]) {
    const dir = join(courseDir, name);
    mkdirSync(dir);
    writeFileSync(join(dir, "material.pdf"), "fake pdf bytes");
  }

  const pending = findPendingWeeks({ TESTCRS: courseDir });
  expect(pending).toEqual([]);
});

test("'week 2' (lowercase, no space-padding assumptions) matches case-insensitively", () => {
  const courseDir = makeCourseDir();
  const weekDir = join(courseDir, "week 2");
  mkdirSync(weekDir);
  writeFileSync(join(weekDir, "slides.pptx"), "fake pptx bytes");

  const pending = findPendingWeeks({ TESTCRS: courseDir });
  expect(pending).toEqual([{ course: "TESTCRS", week: 2 }]);
});

test("a missing course directory is skipped without throwing", () => {
  const pending = findPendingWeeks({ TESTCRS: "/does/not/exist/anywhere" });
  expect(pending).toEqual([]);
});

test("results are sorted by course then week", () => {
  const courseA = makeCourseDir();
  const courseB = makeCourseDir();
  mkdirSync(join(courseA, "Week 5"));
  writeFileSync(join(courseA, "Week 5", "lecture.pdf"), "x");
  mkdirSync(join(courseB, "Week 1"));
  writeFileSync(join(courseB, "Week 1", "lecture.pdf"), "x");
  mkdirSync(join(courseA, "Week 2"));
  writeFileSync(join(courseA, "Week 2", "lecture.pdf"), "x");

  const pending = findPendingWeeks({ BBB: courseB, AAA: courseA });
  expect(pending).toEqual([
    { course: "AAA", week: 2 },
    { course: "AAA", week: 5 },
    { course: "BBB", week: 1 },
  ]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-sync.test.ts`
Expected: FAIL — `exam-sync.ts` doesn't exist yet (module not found).

- [ ] **Step 3: Write the implementation**

Create `exam-sync.ts`:

```ts
// Read-only detection of USYD course weeks that have real material on disk
// but no authored exam-content/<course>/week-N.ts yet. Never writes
// anything — authoring still happens in a Claude Code session (interactive
// or the future Saturday launchd job), per
// docs/superpowers/specs/2026-08-06-exam-modules-sync-design.md.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { scanWeekFolder } from "./scripts/generate-exam-week";
import { buildExamSchedule } from "./exam-content";

export const COURSE_DIRS: Record<string, string> = {
  INFO5995: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO5995 Intro To Cybersecurity",
  COMP5348: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/COMP5348 Enterprise Scale",
  INFO6007: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO6007 Project Management",
  INFO5990: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO5990 Professional Practice in IT",
};

const WEEK_FOLDER_RE = /^week\s*(\d+)$/i;

export interface PendingWeek {
  course: string;
  week: number;
}

// courseDirs defaults to the real COURSE_DIRS map; tests pass a fixture map
// instead so this never touches the real Desktop folder in CI.
export function findPendingWeeks(courseDirs: Record<string, string> = COURSE_DIRS): PendingWeek[] {
  const existing = new Set(buildExamSchedule().map((p) => `${p.course}:${p.week}`));
  const pending: PendingWeek[] = [];

  for (const [course, dir] of Object.entries(courseDirs)) {
    if (!existsSync(dir)) continue;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const match = entry.name.match(WEEK_FOLDER_RE);
      if (!match) continue;
      const week = Number(match[1]);
      if (existing.has(`${course}:${week}`)) continue;
      const { materials } = scanWeekFolder(join(dir, entry.name));
      if (materials.length > 0) pending.push({ course, week });
    }
  }

  pending.sort((a, b) => (a.course === b.course ? a.week - b.week : a.course.localeCompare(b.course)));
  return pending;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test exam-sync.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add exam-sync.ts exam-sync.test.ts
git commit -m "feat: add read-only pending-week detection for course folders"
```

---

### Task 2: `GET /api/exam/sync` route

**Files:**
- Modify: `exam-api.ts`
- Modify: `exam-api.test.ts`

**Interfaces:**
- Consumes: `findPendingWeeks(): PendingWeek[]` from Task 1's `exam-sync.ts`.
- Produces: `GET /api/exam/sync` returning `{ pending: PendingWeek[] }`, consumed by Task 3's `ExamApp.tsx`.

- [ ] **Step 1: Write the failing test**

Add to `exam-api.test.ts` (near the other `/api/exam/courses`-style tests):

```ts
test("GET /api/exam/sync returns a pending list (shape check — content depends on the real Desktop folder)", async () => {
  const body: any = await (await fetch(`${base}/api/exam/sync`)).json();
  expect(Array.isArray(body.pending)).toBe(true);
  for (const item of body.pending) {
    expect(typeof item.course).toBe("string");
    expect(typeof item.week).toBe("number");
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test exam-api.test.ts -t "sync"`
Expected: FAIL — 404, route doesn't exist yet.

- [ ] **Step 3: Wire the route in**

In `exam-api.ts`, add the import near the top (alongside the existing `exam-content` import):

```ts
import { findPendingWeeks } from "./exam-sync";
```

Add a new top-level route entry inside the object returned by `examApiRoutes(db)` (e.g. right after `"/api/exam/courses"`):

```ts
    "/api/exam/sync": {
      GET: () => json({ pending: findPendingWeeks() }),
    },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test exam-api.test.ts`
Expected: PASS (all exam-api tests, including the new one)

- [ ] **Step 5: Commit**

```bash
git add exam-api.ts exam-api.test.ts
git commit -m "feat: expose GET /api/exam/sync"
```

---

### Task 3: Sync button + banner in `ExamApp.tsx`

**Files:**
- Modify: `ExamApp.tsx`

**Interfaces:**
- Consumes: `GET /api/exam/sync` from Task 2, returning `{ pending: { course: string; week: number }[] }`.
- Produces: nothing consumed by later tasks — this is the UI leaf.

No automated test for this step per the design spec (manual browser verification — one button, one banner, low complexity). Verify by hand after implementing.

- [ ] **Step 1: Add the `sync` API call**

In `ExamApp.tsx`'s `api` object (near the other `fetch` calls), add:

```ts
  sync: () => fetch("/api/exam/sync").then((r) => json<{ pending: { course: string; week: number }[] }>(r)),
```

- [ ] **Step 2: Add a `SyncBanner` component**

Add this component near the other small presentational components (e.g. after `ExamStats`):

```tsx
function SyncBanner({
  pending,
  onDismiss,
}: {
  pending: { course: string; week: number }[];
  onDismiss: () => void;
}) {
  return (
    <div className="board" style={{ marginBottom: "1rem" }}>
      <div className="board-row" style={{ justifyContent: "space-between" }}>
        <span>
          {pending.length === 0
            ? "Everything's generated — nothing pending."
            : `${pending.length} week${pending.length === 1 ? "" : "s"} ready to generate: ${pending
                .map((p) => `${p.course} Week ${p.week}`)
                .join(", ")} — ask Claude Code to fill these in.`}
        </span>
        <button className="modal-close" onClick={onDismiss} aria-label="Dismiss">×</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire state and the button into `ExamApp`**

In the `ExamApp` function body, add state near the other `useState` calls:

```ts
  const [syncPending, setSyncPending] = useState<{ course: string; week: number }[] | null>(null);
  const [syncing, setSyncing] = useState(false);

  const runSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const { pending } = await api.sync();
      setSyncPending(pending);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSyncing(false);
    }
  };
```

In the JSX, right after `<CourseSelector .../>` and before `<ExamStats .../>`, add the button:

```tsx
      <div className="btn-row" style={{ marginBottom: "1rem" }}>
        <button className="btn" onClick={runSync} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync"}
        </button>
      </div>
      {syncPending !== null && <SyncBanner pending={syncPending} onDismiss={() => setSyncPending(null)} />}
```

- [ ] **Step 4: Manual verification**

Start the dev server (`bun --hot index.ts` if not already running), open the app, go to the Modules tab (renamed in Task 4 — if that task hasn't run yet, it'll still say "Exam"), click "Sync", and confirm:
- The button shows "Syncing…" briefly, then reverts to "Sync".
- A banner appears reporting either "Everything's generated" or a list of pending weeks matching what's actually in `~/Desktop/USYD/Semester 2 (Aug-Nov 2026)/`.
- Clicking the banner's × dismisses it.

- [ ] **Step 5: Commit**

```bash
git add ExamApp.tsx
git commit -m "feat: add Sync button and pending-weeks banner to the exam tab"
```

---

### Task 4: Rename "Exam" tab to "Modules"

**Files:**
- Modify: `frontend.tsx`
- Modify: `HomeApp.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks — pure UI text change.

- [ ] **Step 1: Update the tab bar button text**

In `frontend.tsx`, inside `TabBar`, change:

```tsx
      <button
        className={tab === "exam" ? "tab tab-active" : "tab"}
        onClick={() => onChange("exam")}
      >
        Exam
      </button>
```

to:

```tsx
      <button
        className={tab === "exam" ? "tab tab-active" : "tab"}
        onClick={() => onChange("exam")}
      >
        Modules
      </button>
```

(Only the visible text changes — `tab === "exam"` and `onChange("exam")` stay as-is.)

- [ ] **Step 2: Update the Home tab's source label**

In `HomeApp.tsx`, change:

```ts
const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  theory: "Theory",
  goals: "Goals",
  exam: "Exam",
};
```

to:

```ts
const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  theory: "Theory",
  goals: "Goals",
  exam: "Modules",
};
```

- [ ] **Step 3: Run the full test suite**

Run: `bun test`
Expected: PASS — no test asserts the literal string `"Exam"` anywhere (confirmed by grep before writing this plan), so this is a safe rename.

- [ ] **Step 4: Manual verification**

Reload the app in the browser. Confirm the top nav reads "Modules" instead of "Exam", and the Home tab's due-items list (if any exam items are due) labels them "Modules" too.

- [ ] **Step 5: Commit**

```bash
git add frontend.tsx HomeApp.tsx
git commit -m "rename: Exam tab label to Modules"
```

---

### Task 5: Authoring guide doc

**Files:**
- Create: `docs/exam-content-authoring-guide.md`

**Interfaces:**
- Consumes: nothing (pure documentation).
- Produces: a doc path (`docs/exam-content-authoring-guide.md`) that a future Saturday `launchd` job's fixed prompt will reference (per the design spec) — not built in this plan, but the doc's existence and path are the contract that job will rely on.

- [ ] **Step 1: Write the doc**

Create `docs/exam-content-authoring-guide.md`:

```markdown
# Exam Content Authoring Guide

Read this before authoring exam content for any pending week (surfaced by
the Modules tab's Sync button, or found by hand).

## Process

1. Read the week's real source material directly — PDFs, slides, docs.
   Skip video files; they can't be transcribed.
2. Read that course's `exam-content/<course>/unit_outline.md` for the
   unit's stated learning outcomes.
3. If a prior week's `exam-content/<course>/week-N.ts` exists, skim it for
   continuity. Where this week's material builds on or connects to an
   earlier concept, write at least one question that makes that connection
   explicit — don't treat every week as fully isolated from the last.

## Format

- 3 papers per week (`PAPER_1`, `PAPER_2`, `PAPER_3`), exported together as
  `WEEK_N_PAPERS`.
- 14 questions per paper: 8 `mcq`/`truefalse`, 4 `short`, 2 `scenario`.
- Match the exact shape of `exam-content/types.ts`'s `ExamPaperSeed` /
  `ExamQuestionSeed` — see any existing `exam-content/<course>/week-N.ts`
  for a worked example.
- Every question's `modelAnswer` should be traceable to something the
  source material actually says, not invented.

## Wiring in

Update `exam-content.ts`:
1. Add an import: `import { WEEK_N_PAPERS as <COURSE>_WEEK_N_PAPERS } from "./exam-content/<course>/week-N";`
2. Append `...​<COURSE>_WEEK_N_PAPERS` to the `ALL_PAPERS` array.

## Verification

Run `bun test` before considering the week done — it must pass with no
failures.
```

- [ ] **Step 2: Commit**

```bash
git add docs/exam-content-authoring-guide.md
git commit -m "docs: add the exam content authoring guide"
```

---

## Self-Review Notes (for whoever executes this plan)

- Spec coverage: Task 1+2 cover the spec's §1 detection logic and route;
  Task 3 covers §1's UI; Task 4 covers §2; Task 5 covers §3. §4 (the
  Saturday `launchd` job) is intentionally out of scope for this plan per
  the spec's own "designed here, not created yet" note.
- No placeholders — every step has real code or an exact doc body.
- Type consistency: `PendingWeek` (Task 1) is the exact shape returned by
  `/api/exam/sync` (Task 2) and consumed inline in `ExamApp.tsx` (Task 3)
  as `{ course: string; week: number }` throughout.
