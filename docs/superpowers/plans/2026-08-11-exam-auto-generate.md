# One-Click Week Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Modules tab's passive "ask Claude Code to fill these in" sync banner with a per-week **Generate** button that spawns headless `claude -p` to actually author the week's exam content, following the existing authoring guide, with no manual Claude Code session required.

**Architecture:** A new `exam-generate.ts` module tracks job status entirely on disk (`.exam-generate/<course>-<week>/status.json`) rather than in memory, because `bun --hot` reloads the JS module graph on any file save — including the very files the generation job writes. Two new routes in `exam-api.ts` (`POST .../generate`, `GET .../generate/status`) wrap it. The frontend's `SyncBanner` gets a Generate button per pending week that starts polling the status endpoint until the job finishes.

**Tech Stack:** Bun (`Bun.spawn`, `Bun.file`/`Bun.write`), TypeScript, React (existing `ExamApp.tsx` patterns), `bun:test`, the `claude` CLI (already installed, headless `-p` mode).

## Global Constraints

- Use Bun natives, not Node equivalents, per project convention — `Bun.spawn`, `Bun.file`, `Bun.write` (see `/Users/adam/CLAUDE.md`).
- Every course/week/paper route param follows this codebase's existing validation pattern in `exam-api.ts`: `isKnownCourse()`, `parseWeek()` returning `null` on invalid input, `json({ error }, status)` for failures.
- No frontend test framework exists in this repo (no `.test.tsx` files, no `@testing-library`) — the frontend task is verified manually in the browser, per `/Users/adam/CLAUDE.md`'s "For UI or frontend changes, start the dev server and use the feature in a browser."
- Every task ends by running the **full** `bun test` suite (not just the new file) — this repo's own authoring guide requires this, and cross-file breakage from shared modules (`exam-sync.ts`) needs to be caught immediately.
- Never spawn the real `claude` CLI from `bun test` — all `claude`-invoking logic must accept an injectable function so tests fake it (matching `exam-sync.ts`'s existing `courseDirs` injection pattern).

---

### Task 1: Share week-folder resolution between `exam-sync.ts` and the new generator

**Files:**
- Modify: `exam-sync.ts`
- Test: `exam-sync.test.ts`

**Interfaces:**
- Produces: `export const WEEK_FOLDER_RE: RegExp` (currently a private `const` in `exam-sync.ts` — export it unchanged). `export function findWeekFolder(courseDir: string, week: number): string | null` — returns the full path to the first directory under `courseDir` whose name matches `WEEK_FOLDER_RE` with that week number, or `null` if the course dir doesn't exist or no folder matches.

- [ ] **Step 1: Write the failing tests**

Add to `exam-sync.test.ts` (uses the same `makeCourseDir()`/`tempDirs` fixture helpers already defined at the top of that file):

```ts
import { findWeekFolder } from "./exam-sync";

test("findWeekFolder finds a case-insensitively matching Week N folder", () => {
  const courseDir = makeCourseDir();
  mkdirSync(join(courseDir, "week 3"));
  expect(findWeekFolder(courseDir, 3)).toBe(join(courseDir, "week 3"));
});

test("findWeekFolder returns null when no folder matches the target week number", () => {
  const courseDir = makeCourseDir();
  mkdirSync(join(courseDir, "Week 1"));
  expect(findWeekFolder(courseDir, 2)).toBeNull();
});

test("findWeekFolder returns null for a missing course directory", () => {
  expect(findWeekFolder("/does/not/exist/anywhere", 1)).toBeNull();
});

test("findWeekFolder ignores non-'Week N' folders like the pending-weeks scan does", () => {
  const courseDir = makeCourseDir();
  mkdirSync(join(courseDir, "Readings"));
  mkdirSync(join(courseDir, "Week 7"));
  expect(findWeekFolder(courseDir, 7)).toBe(join(courseDir, "Week 7"));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-sync.test.ts`
Expected: FAIL with `findWeekFolder is not a function` (it isn't exported/defined yet).

- [ ] **Step 3: Export the regex and add `findWeekFolder`**

In `exam-sync.ts`, change:

```ts
const WEEK_FOLDER_RE = /^week\s*(\d+)$/i;
```

to:

```ts
export const WEEK_FOLDER_RE = /^week\s*(\d+)$/i;

// Finds the on-disk folder for one specific week (used by exam-generate.ts
// to locate real material before spawning a generation job) — shares the
// same matching rules findPendingWeeks() already uses below, so a folder
// that's "pending" is exactly a folder this can also resolve.
export function findWeekFolder(courseDir: string, week: number): string | null {
  if (!existsSync(courseDir)) return null;
  const entries = readdirSync(courseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(WEEK_FOLDER_RE);
    if (!match) continue;
    if (Number(match[1]) === week) return join(courseDir, entry.name);
  }
  return null;
}
```

(`existsSync`, `readdirSync`, and `join` are already imported at the top of `exam-sync.ts` — no new imports needed.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test`
Expected: PASS, full suite green (this task only adds exports, doesn't change `findPendingWeeks()`'s behavior).

- [ ] **Step 5: Commit**

```bash
git add exam-sync.ts exam-sync.test.ts
git commit -m "refactor: extract findWeekFolder from exam-sync.ts for reuse by the generator"
```

---

### Task 2: `exam-generate.ts` — job status and pure prompt/arg builders

**Files:**
- Create: `exam-generate.ts`
- Create: `exam-generate.test.ts`

**Interfaces:**
- Consumes: `COURSE_DIRS: Record<string, string>` and `findWeekFolder(courseDir, week): string | null` from `./exam-sync` (Task 1).
- Produces:
  - `export interface JobStatus { state: "idle" | "running" | "done" | "failed"; startedAt?: string; finishedAt?: string; exitCode?: number; logTail?: string }`
  - `export function jobDir(course: string, week: number, root?: string): string`
  - `export async function readJobStatus(course: string, week: number, root?: string): Promise<JobStatus>`
  - `export function resolveWeekDir(course: string, week: number, courseDirs?: Record<string, string>): string | null`
  - `export const ALLOWED_TOOLS: string`
  - `export function buildGeneratePrompt(course: string, week: number, weekDir: string): string`
  - `export function buildClaudeArgs(prompt: string): string[]`
  - `export const DEFAULT_JOB_ROOT: string` — later tasks reference this as the production default.

- [ ] **Step 1: Write the failing tests**

Create `exam-generate.test.ts`:

```ts
import { test, expect, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  jobDir,
  readJobStatus,
  resolveWeekDir,
  buildGeneratePrompt,
  buildClaudeArgs,
  ALLOWED_TOOLS,
} from "./exam-generate";

const tempDirs: string[] = [];
function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "exam-generate-test-"));
  tempDirs.push(dir);
  return dir;
}
afterEach(() => {
  while (tempDirs.length) rmSync(tempDirs.pop()!, { recursive: true, force: true });
});

test("jobDir joins the root, course, and week into one directory name", () => {
  expect(jobDir("INFO5995", 2, "/tmp/root")).toBe("/tmp/root/INFO5995-2");
});

test("readJobStatus returns idle when no status.json exists yet", async () => {
  const root = makeTempDir();
  expect(await readJobStatus("INFO5995", 2, root)).toEqual({ state: "idle" });
});

test("readJobStatus returns the parsed status.json when one exists", async () => {
  const root = makeTempDir();
  const dir = join(root, "INFO5995-2");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "status.json"),
    JSON.stringify({ state: "running", startedAt: "2026-08-11T00:00:00.000Z" }),
  );
  expect(await readJobStatus("INFO5995", 2, root)).toEqual({
    state: "running",
    startedAt: "2026-08-11T00:00:00.000Z",
  });
});

test("resolveWeekDir finds the real week folder via the injected courseDirs map", () => {
  const courseDir = makeTempDir();
  mkdirSync(join(courseDir, "Week 4"));
  expect(resolveWeekDir("TESTCRS", 4, { TESTCRS: courseDir })).toBe(join(courseDir, "Week 4"));
});

test("resolveWeekDir returns null for a course with no configured directory", () => {
  expect(resolveWeekDir("UNKNOWN", 1, {})).toBeNull();
});

test("buildGeneratePrompt names the exact output file, source folder, and required commands", () => {
  const prompt = buildGeneratePrompt("INFO5995", 3, "/fake/Desktop/INFO5995/Week 3");
  expect(prompt).toContain("exam-content/info5995/week-3.ts");
  expect(prompt).toContain("/fake/Desktop/INFO5995/Week 3");
  expect(prompt).toContain("docs/exam-content-authoring-guide.md");
  expect(prompt).toContain("bun test");
  expect(prompt).toContain("exam-content.ts");
});

test("buildClaudeArgs scopes permissions to exactly Read/Write/Edit/Bash(bun test)", () => {
  expect(ALLOWED_TOOLS).toBe("Read Write Edit Bash(bun test)");
  expect(buildClaudeArgs("do the thing")).toEqual([
    "-p",
    "--permission-mode",
    "acceptEdits",
    "--allowedTools",
    ALLOWED_TOOLS,
    "--output-format",
    "json",
    "do the thing",
  ]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-generate.test.ts`
Expected: FAIL — `Cannot find module './exam-generate'` (the file doesn't exist yet).

- [ ] **Step 3: Write `exam-generate.ts`**

```ts
// Kicks off headless `claude -p` sessions that author a week's exam
// content, following docs/exam-content-authoring-guide.md — replacing the
// old "sync just tells you what's pending, a human runs Claude Code by
// hand" flow with a one-click Generate button.
//
// Job status lives entirely on disk (.exam-generate/<course>-<week>/), not
// in a JS variable: bun --hot reloads the module graph on any file save,
// and this job's whole purpose is to write files (the week's content,
// exam-content.ts) while it runs — an in-memory Map would risk getting
// wiped mid-job by the very save it triggers.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { COURSE_DIRS, findWeekFolder } from "./exam-sync";

export interface JobStatus {
  state: "idle" | "running" | "done" | "failed";
  startedAt?: string;
  finishedAt?: string;
  exitCode?: number;
  logTail?: string;
}

export const DEFAULT_JOB_ROOT = join(import.meta.dir, ".exam-generate");

export function jobDir(course: string, week: number, root: string = DEFAULT_JOB_ROOT): string {
  return join(root, `${course}-${week}`);
}

export async function readJobStatus(
  course: string,
  week: number,
  root: string = DEFAULT_JOB_ROOT,
): Promise<JobStatus> {
  const file = Bun.file(join(jobDir(course, week, root), "status.json"));
  if (!(await file.exists())) return { state: "idle" };
  return (await file.json()) as JobStatus;
}

// courseDirs defaults to the real COURSE_DIRS map (same default pattern as
// exam-sync.ts's findPendingWeeks); tests inject a fixture map instead.
export function resolveWeekDir(
  course: string,
  week: number,
  courseDirs: Record<string, string> = COURSE_DIRS,
): string | null {
  const courseDir = courseDirs[course];
  if (!courseDir) return null;
  return findWeekFolder(courseDir, week);
}

// Auto-approves file writes but pre-authorizes only the one Bash command
// the authoring workflow actually needs — deliberately narrower than
// --dangerously-skip-permissions, which Anthropic's own --help text calls
// "recommended only for sandboxes with no internet access."
export const ALLOWED_TOOLS = "Read Write Edit Bash(bun test)";

export function buildGeneratePrompt(course: string, week: number, weekDir: string): string {
  const courseLower = course.toLowerCase();
  return `Author exam-content/${courseLower}/week-${week}.ts for the leetcode-srs project, following docs/exam-content-authoring-guide.md exactly.

Read the real material in "${weekDir}" (skip video files — they can't be transcribed). Read exam-content/${courseLower}/unit_outline.md and exam-content/${courseLower}/assessment_overview.md if they exist, for the unit's learning outcomes and final-exam format. Skim exam-content/${courseLower}/week-${week - 1}.ts if it exists, for continuity with the prior week.

Write roughly 40-50 questions matching exam-content/types.ts's ExamPaperSeed/ExamQuestionSeed shape, exported as WEEK_${week}_PAPERS. Then wire it into exam-content.ts: add the import and append it to the ALL_PAPERS array, exactly the way every prior week is already wired in there.

Finally, run \`bun test\` and fix any failures until the full suite passes with no failures — including fixing any existing test elsewhere in the repo that turns out to hardcode an assumption your new week's content invalidates (for example, a test assuming a specific course still has only one week of content).

You are running unattended in headless mode with no human present to ask questions — make reasonable, well-justified authoring judgment calls yourself rather than stopping to ask. When you are completely done, print one short summary line of what you wrote and confirm bun test passes.`;
}

export function buildClaudeArgs(prompt: string): string[] {
  return ["-p", "--permission-mode", "acceptEdits", "--allowedTools", ALLOWED_TOOLS, "--output-format", "json", prompt];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test`
Expected: PASS, full suite green.

- [ ] **Step 5: Add `.exam-generate/` to `.gitignore`**

Append to `.gitignore`:

```
.exam-generate/
```

- [ ] **Step 6: Commit**

```bash
git add exam-generate.ts exam-generate.test.ts .gitignore
git commit -m "feat: add exam-generate.ts job status and prompt/arg builders"
```

---

### Task 3: `startGenerateJob` — the actual job spawner, with injectable `runClaude`

**Files:**
- Modify: `exam-generate.ts`
- Modify: `exam-generate.test.ts`

**Interfaces:**
- Consumes: `jobDir`, `readJobStatus`, `resolveWeekDir`, `buildGeneratePrompt`, `buildClaudeArgs`, `DEFAULT_JOB_ROOT` from Task 2 (same file).
- Produces:
  - `export type RunClaude = (args: string[], cwd: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>`
  - `export const defaultRunClaude: RunClaude`
  - `export interface StartJobDeps { runClaude: RunClaude; root: string }`
  - `export type StartResult = { ok: true; done: Promise<void> } | { ok: false; reason: string }`
  - `export async function startGenerateJob(course: string, week: number, weekDir: string, deps?: StartJobDeps): Promise<StartResult>`
  - `export const defaultGenerateDeps: StartJobDeps` — Task 4's routes default to this.

- [ ] **Step 1: Write the failing tests**

Append to `exam-generate.test.ts`:

```ts
import { startGenerateJob, type RunClaude } from "./exam-generate";

test("startGenerateJob writes a running status before runClaude resolves, then done on exit 0", async () => {
  const root = makeTempDir();
  let sawRunningWhileClaudeRan = false;
  const fakeRunClaude: RunClaude = async () => {
    sawRunningWhileClaudeRan = (await readJobStatus("INFO5995", 5, root)).state === "running";
    return { stdout: "did the thing", stderr: "", exitCode: 0 };
  };

  const result = await startGenerateJob("INFO5995", 5, "/fake/week/dir", { runClaude: fakeRunClaude, root });
  expect(result.ok).toBe(true);
  if (result.ok) await result.done;

  expect(sawRunningWhileClaudeRan).toBe(true);
  const status = await readJobStatus("INFO5995", 5, root);
  expect(status.state).toBe("done");
  expect(status.exitCode).toBe(0);
  expect(status.logTail).toContain("did the thing");
  expect(status.startedAt).toBeTruthy();
  expect(status.finishedAt).toBeTruthy();
});

test("startGenerateJob marks the job failed when runClaude exits non-zero", async () => {
  const root = makeTempDir();
  const fakeRunClaude: RunClaude = async () => ({ stdout: "", stderr: "bun test failed", exitCode: 1 });

  const result = await startGenerateJob("INFO5995", 5, "/fake/week/dir", { runClaude: fakeRunClaude, root });
  if (result.ok) await result.done;

  const status = await readJobStatus("INFO5995", 5, root);
  expect(status.state).toBe("failed");
  expect(status.exitCode).toBe(1);
  expect(status.logTail).toContain("bun test failed");
});

test("startGenerateJob refuses to spawn a second job while one is already running", async () => {
  const root = makeTempDir();
  let resolveClaude: (() => void) | undefined;
  const stuckRunClaude: RunClaude = () =>
    new Promise((resolve) => {
      resolveClaude = () => resolve({ stdout: "", stderr: "", exitCode: 0 });
    });

  const first = await startGenerateJob("INFO5995", 6, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  expect(first.ok).toBe(true);

  const second = await startGenerateJob("INFO5995", 6, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  expect(second).toEqual({ ok: false, reason: "already generating" });

  resolveClaude?.();
  if (first.ok) await first.done;
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-generate.test.ts`
Expected: FAIL — `startGenerateJob is not a function`.

- [ ] **Step 3: Implement `startGenerateJob` in `exam-generate.ts`**

Append to `exam-generate.ts` (after `buildClaudeArgs`):

```ts
export type RunClaude = (args: string[], cwd: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>;

// Spawns the real `claude` binary with an argv array (not a shell string),
// so there's no quoting/escaping ambiguity around the prompt text.
export const defaultRunClaude: RunClaude = async (args, cwd) => {
  const proc = Bun.spawn(["claude", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
};

export interface StartJobDeps {
  runClaude: RunClaude;
  root: string;
}

export const defaultGenerateDeps: StartJobDeps = { runClaude: defaultRunClaude, root: DEFAULT_JOB_ROOT };

export type StartResult = { ok: true; done: Promise<void> } | { ok: false; reason: string };

const REPO_ROOT = import.meta.dir;

export async function startGenerateJob(
  course: string,
  week: number,
  weekDir: string,
  deps: StartJobDeps = defaultGenerateDeps,
): Promise<StartResult> {
  const existing = await readJobStatus(course, week, deps.root);
  if (existing.state === "running") return { ok: false, reason: "already generating" };

  const dir = jobDir(course, week, deps.root);
  mkdirSync(dir, { recursive: true });
  const statusPath = join(dir, "status.json");
  const startedAt = new Date().toISOString();
  await Bun.write(statusPath, JSON.stringify({ state: "running", startedAt } satisfies JobStatus));

  // Fire-and-forget from the caller's point of view (an HTTP route handler
  // returns as soon as this function resolves, well before generation
  // finishes) — `done` exists purely so tests can await completion.
  const done = runGeneration(course, week, weekDir, statusPath, startedAt, deps.runClaude).catch(() => {});
  return { ok: true, done };
}

async function runGeneration(
  course: string,
  week: number,
  weekDir: string,
  statusPath: string,
  startedAt: string,
  runClaude: RunClaude,
): Promise<void> {
  const prompt = buildGeneratePrompt(course, week, weekDir);
  const args = buildClaudeArgs(prompt);
  const { stdout, stderr, exitCode } = await runClaude(args, REPO_ROOT);
  const status: JobStatus = {
    state: exitCode === 0 ? "done" : "failed",
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode,
    logTail: tailLines(`${stdout}\n${stderr}`, 40),
  };
  await Bun.write(statusPath, JSON.stringify(status));
}

function tailLines(text: string, maxLines: number): string {
  const lines = text.split("\n");
  return lines.slice(Math.max(0, lines.length - maxLines)).join("\n").trim();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test`
Expected: PASS, full suite green.

- [ ] **Step 5: Commit**

```bash
git add exam-generate.ts exam-generate.test.ts
git commit -m "feat: add startGenerateJob with injectable runClaude for testability"
```

---

### Task 4: Wire the generate routes into `exam-api.ts`

**Files:**
- Modify: `exam-api.ts`
- Create: `exam-generate-api.test.ts`

**Interfaces:**
- Consumes: `resolveWeekDir`, `startGenerateJob`, `readJobStatus`, `defaultGenerateDeps`, `type StartJobDeps` from `./exam-generate` (Tasks 2–3). `isKnownCourse`, `parseWeek`, `json` (all already private to `exam-api.ts` — reused, not re-exported).
- Produces: `examApiRoutes(db: Database, generateDeps?: StartJobDeps)` — **note the new optional second parameter**; `index.ts`'s existing call `examApiRoutes(db)` keeps working unchanged since it takes the default.
  - `POST /api/exam/:course/:week/generate` → 400 unknown course / 400 invalid week / 404 no material folder / 409 already generating / 202 kicked off.
  - `GET /api/exam/:course/:week/generate/status` → 400 unknown course / 400 invalid week / 200 `JobStatus`.

- [ ] **Step 1: Write the failing tests**

Create `exam-generate-api.test.ts` (a dedicated file, separate from the already-large `exam-api.test.ts`, since these tests each spin up their own server with custom `generateDeps` rather than sharing the module's default `db`/`server`/`base` fixture):

```ts
import { test, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import type { RunClaude, StartJobDeps } from "./exam-generate";
import { localToday } from "./scheduling";

// INFO5990 is a real, known course (per exam-content/COURSES) with no
// week-2 content authored yet — its *content* is real, but its folder
// resolution is faked via generateDeps.courseDirs below, so these tests
// never touch the real Desktop folder.
const COURSE = "INFO5990";

function harness(runClaude: RunClaude) {
  const root = mkdtempSync(join(tmpdir(), "exam-generate-api-root-"));
  const desktopFixture = mkdtempSync(join(tmpdir(), "exam-generate-api-desktop-"));
  const db = new Database(":memory:");
  migrateExam(db, localToday());
  const deps: StartJobDeps & { courseDirs: Record<string, string> } = {
    runClaude,
    root,
    courseDirs: { [COURSE]: desktopFixture },
  };
  const server = Bun.serve({ port: 0, routes: examApiRoutes(db, deps) });
  return {
    base: server.url.origin,
    desktopFixture,
    cleanup: () => {
      server.stop(true);
      rmSync(root, { recursive: true, force: true });
      rmSync(desktopFixture, { recursive: true, force: true });
    },
  };
}

test("POST generate kicks off a job and GET status reflects it finishing", async () => {
  const h = harness(async () => ({ stdout: "wrote it", stderr: "", exitCode: 0 }));
  mkdirSync(join(h.desktopFixture, "Week 2"));
  try {
    const kickoff = await fetch(`${h.base}/api/exam/${COURSE}/2/generate`, { method: "POST" });
    expect(kickoff.status).toBe(202);

    // The fake runClaude resolves on the next microtask; give it a tick.
    await new Promise((r) => setTimeout(r, 20));

    const statusRes = await fetch(`${h.base}/api/exam/${COURSE}/2/generate/status`);
    const status: any = await statusRes.json();
    expect(status.state).toBe("done");
    expect(status.logTail).toContain("wrote it");
  } finally {
    h.cleanup();
  }
});

test("POST generate returns 404 when no material folder exists for that week", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    // h.desktopFixture has no "Week 3" subfolder.
    const res = await fetch(`${h.base}/api/exam/${COURSE}/3/generate`, { method: "POST" });
    expect(res.status).toBe(404);
  } finally {
    h.cleanup();
  }
});

test("POST generate returns 409 when a job is already running for that week", async () => {
  let resolveClaude: (() => void) | undefined;
  const h = harness(
    () => new Promise((resolve) => { resolveClaude = () => resolve({ stdout: "", stderr: "", exitCode: 0 }); }),
  );
  mkdirSync(join(h.desktopFixture, "Week 2"));
  try {
    const first = await fetch(`${h.base}/api/exam/${COURSE}/2/generate`, { method: "POST" });
    expect(first.status).toBe(202);
    const second = await fetch(`${h.base}/api/exam/${COURSE}/2/generate`, { method: "POST" });
    expect(second.status).toBe(409);
  } finally {
    resolveClaude?.();
    h.cleanup();
  }
});

test("POST generate with an unknown course returns 400", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/UNKNOWN123/2/generate`, { method: "POST" });
    expect(res.status).toBe(400);
  } finally {
    h.cleanup();
  }
});

test("POST generate with an invalid week returns 400", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/${COURSE}/0/generate`, { method: "POST" });
    expect(res.status).toBe(400);
  } finally {
    h.cleanup();
  }
});

test("GET generate status defaults to idle for a week that was never generated", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/${COURSE}/2/generate/status`);
    const body: any = await res.json();
    expect(body).toEqual({ state: "idle" });
  } finally {
    h.cleanup();
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-generate-api.test.ts`
Expected: FAIL — routes don't exist yet (`examApiRoutes` doesn't accept a second argument, and `/generate`/`/generate/status` 404 at the framework level).

- [ ] **Step 3: Add the routes to `exam-api.ts`**

Add this import near the top of `exam-api.ts` (alongside the existing `import { findPendingWeeks } from "./exam-sync";`):

```ts
import { resolveWeekDir, startGenerateJob, readJobStatus, defaultGenerateDeps, type StartJobDeps } from "./exam-generate";
```

Change the `examApiRoutes` signature and add the two routes (insert the new route entries right after the existing `"/api/exam/sync"` entry, before `"/api/exam/:course/due"`):

```ts
export function examApiRoutes(
  db: Database,
  generateDeps: StartJobDeps & { courseDirs?: Record<string, string> } = defaultGenerateDeps,
) {
  return {
    "/api/exam/courses": {
      GET: () => json(listExamCourses()),
    },
    "/api/exam/sync": {
      GET: () => json({ pending: findPendingWeeks() }),
    },
    "/api/exam/:course/:week/generate": {
      POST: async (req: Request & { params: { course: string; week: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const weekDir = resolveWeekDir(course, week, generateDeps.courseDirs);
        if (!weekDir) return json({ error: "no material found for this week" }, 404);
        const result = await startGenerateJob(course, week, weekDir, generateDeps);
        if (!result.ok) return json({ error: result.reason }, 409);
        return json({}, 202);
      },
    },
    "/api/exam/:course/:week/generate/status": {
      GET: async (req: Request & { params: { course: string; week: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        return json(await readJobStatus(course, week, generateDeps.root));
      },
    },
    // ... rest of the existing routes unchanged
```

(Leave every other existing route in the returned object exactly as-is — this only adds the import, changes the function signature to accept the new optional second parameter, and inserts the two new route entries.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test`
Expected: PASS, full suite green. (`index.ts`'s existing `examApiRoutes(db)` call still compiles since `generateDeps` has a default.)

- [ ] **Step 5: Commit**

```bash
git add exam-api.ts exam-generate-api.test.ts
git commit -m "feat: add POST/GET generate routes to exam-api.ts"
```

---

### Task 5: Frontend — Generate button and polling in `ExamApp.tsx`

**Files:**
- Modify: `ExamApp.tsx`

**Interfaces:**
- Consumes: `POST /api/exam/:course/:week/generate` and `GET /api/exam/:course/:week/generate/status` (Task 4). `JobStatus` shape from `./exam-generate` (Task 2): `{ state: "idle" | "running" | "done" | "failed"; startedAt?: string; finishedAt?: string; exitCode?: number; logTail?: string }`.
- Produces: a `SyncBanner` that renders a Generate/Generating…/Retry button per pending row and calls its new `onGenerated` prop once a job completes.

- [ ] **Step 1: Add the `api` helpers and `JobStatus` import**

At the top of `ExamApp.tsx`, add to the existing type-only import block:

```ts
import type { JobStatus } from "./exam-generate";
```

In the `api` object (right after the existing `sync:` entry), add:

```ts
  generate: (course: string, week: number) =>
    fetch(`/api/exam/${course}/${week}/generate`, { method: "POST" }).then((r) => json<{}>(r)),
  generateStatus: (course: string, week: number) =>
    fetch(`/api/exam/${course}/${week}/generate/status`).then((r) => json<JobStatus>(r)),
```

- [ ] **Step 2: Replace `SyncBanner` with the per-row Generate version**

Replace the existing `SyncBanner` function entirely with:

```tsx
function jobKey(course: string, week: number): string {
  return `${course}:${week}`;
}

function SyncBanner({
  pending,
  onDismiss,
  onGenerated,
}: {
  pending: { course: string; week: number }[];
  onDismiss: () => void;
  onGenerated: () => void;
}) {
  const [jobs, setJobs] = useState<Record<string, JobStatus>>({});

  const poll = async (course: string, week: number) => {
    const status = await api.generateStatus(course, week).catch(() => null);
    if (!status) return;
    setJobs((prev) => ({ ...prev, [jobKey(course, week)]: status }));
    if (status.state === "done") onGenerated();
  };

  // Recover in-progress/failed state on mount — e.g. after a page reload
  // mid-generation, since job status lives on disk, not in this component's
  // state.
  useEffect(() => {
    pending.forEach((p) => poll(p.course, p.week));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const running = pending.filter((p) => jobs[jobKey(p.course, p.week)]?.state === "running");
    if (running.length === 0) return;
    const id = setInterval(() => running.forEach((p) => poll(p.course, p.week)), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, pending]);

  const generate = async (course: string, week: number) => {
    setJobs((prev) => ({ ...prev, [jobKey(course, week)]: { state: "running", startedAt: new Date().toISOString() } }));
    try {
      await api.generate(course, week);
    } catch (err) {
      setJobs((prev) => ({
        ...prev,
        [jobKey(course, week)]: { state: "failed", logTail: errorMessage(err) },
      }));
    }
  };

  return (
    <div className="board" style={{ marginBottom: "1rem" }}>
      <div className="board-row" style={{ justifyContent: "space-between" }}>
        <span>
          {pending.length === 0
            ? "Everything's generated — nothing pending."
            : `${pending.length} week${pending.length === 1 ? "" : "s"} ready to generate.`}
        </span>
        <button className="modal-close" onClick={onDismiss} aria-label="Dismiss">×</button>
      </div>
      {pending.length > 0 && (
        <ul className="board-rows">
          {pending.map((p) => {
            const job = jobs[jobKey(p.course, p.week)];
            const running = job?.state === "running";
            const failed = job?.state === "failed";
            return (
              <li key={jobKey(p.course, p.week)}>
                <div className="board-row" style={{ justifyContent: "space-between" }}>
                  <span className="board-title">{p.course} Week {p.week}</span>
                  <span>
                    {failed && <span className="tag">failed</span>}
                    <button className="btn btn-primary" disabled={running} onClick={() => generate(p.course, p.week)}>
                      {running ? "Generating…" : failed ? "Retry" : "Generate"}
                    </button>
                  </span>
                </div>
                {failed && job?.logTail && <p className="rule-note">{job.logTail}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire `onGenerated` where `SyncBanner` is mounted**

Find this existing line (inside the main exam-board component):

```tsx
{syncPending !== null && <SyncBanner pending={syncPending} onDismiss={() => setSyncPending(null)} />}
```

Replace it with:

```tsx
{syncPending !== null && (
  <SyncBanner
    pending={syncPending}
    onDismiss={() => setSyncPending(null)}
    onGenerated={() => {
      runSync();
      if (course) refresh(course);
    }}
  />
)}
```

(`runSync` and `refresh` are already defined above this point in the same component — `runSync` re-fetches the pending list, which will naturally drop a row once `findPendingWeeks()` no longer sees it as pending; `refresh(course)` re-fetches the due list so the newly-authored week's due-item appears without a manual page reload.)

- [ ] **Step 4: Manual verification in the browser**

This repo has no frontend test framework — verify by hand, per project convention:

1. Run: `bun run dev`
2. Open the app, go to Modules → any course tab, click **Sync**.
3. Confirm the banner now shows a **Generate** button next to each pending week (if none are pending right now, temporarily move a real `exam-content/<course>/week-N.ts` file aside to make one show up, then move it back afterward).
4. Click **Generate**. Confirm:
   - The button immediately becomes disabled and reads "Generating…".
   - Every ~5s it re-polls status (watch the Network tab for `GET .../generate/status` calls).
   - `.exam-generate/<course>-<week>/status.json` appears in the repo root while it runs.
5. Wait for it to finish (this genuinely takes a couple of minutes — the spawned `claude` session is doing the real authoring work). Confirm:
   - The row's status updates to reflect completion and the week's content actually lands in `exam-content/<course>/week-N.ts`, wired into `exam-content.ts`.
   - Since `bun --hot` picks up the newly-written files automatically, the due list updates without restarting the dev server.
6. Reload the page mid-generation once (on a fresh Generate click) to confirm the button correctly comes back as "Generating…" instead of resetting to "Generate" — this is the on-disk-status-survives-a-reload behavior the design depends on.

Expected: all of the above hold true; no console errors in the browser.

- [ ] **Step 5: Commit**

```bash
git add ExamApp.tsx
git commit -m "feat: add per-week Generate button with status polling to the Modules sync banner"
```

---

## Self-Review Notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-08-11-exam-auto-generate-design.md` maps to a task — filesystem-based job status (Task 2–3), scoped `claude` invocation (Task 2–3), the two API routes with their exact status-code behavior (Task 4), per-week Generate button + background polling (Task 5), `.exam-generate/` gitignored (Task 2). The design's "batch generate all" and "staleness timeout" items are explicitly out of scope and not tasked here, matching the design doc.
- **Continuous testing spec requirement:** this plan doc is not itself a SPEC.md, but per the project's standing requirement, note explicitly: this repo still has no `PostToolUse` hook wired to `bun test`/`tsc` — that remains an outstanding, not-yet-implemented requirement, unaffected by this feature.
- **Type consistency:** `JobStatus` (Task 2) is the one shape threaded through `readJobStatus` → routes (Task 4) → frontend `api.generateStatus` (Task 5) unchanged; `StartJobDeps`/`RunClaude`/`StartResult` (Task 3) are consumed as-is by Task 4's routes with no renaming.
