# One-Click Week Generation — Design

## Goal

Today, `GET /api/exam/sync` only detects which course/weeks have real
material on disk but no authored `exam-content/<course>/week-N.ts`
(`exam-sync.ts`), and the Modules tab just shows a passive banner listing
them ("...ask Claude Code to fill these in"). Actually authoring a week
still requires a human to open a Claude Code chat and manually read the
PDFs and write the file — exactly what happened by hand for Week 2 of
INFO5995/COMP5348 in the prior session.

This feature replaces that banner with a **Generate** button per pending
week that kicks off real content authoring itself, with no manual Claude
Code session required.

## Constraint that shapes the whole design: `bun --hot`

`bun run dev` is `bun --hot index.ts` (see `index.ts` /
`package.json`). Bun's hot-reload watches the whole project and re-evaluates
the module graph on any file change — and the generation job's entire
purpose is to write new files (`exam-content/<course>/week-N.ts`,
`exam-content.ts`) while it's running. That rules out tracking "is this job
still running" in an in-memory JS variable (a `Map`, a module-level
`let`) — a hot-reload triggered by the very file the job just wrote could
wipe that state mid-job.

**Decision: job status lives entirely on disk**, written by the spawned
shell process itself (not by a JS `.then()` callback), so it survives both
hot-reloads and a full dev-server restart.

## Architecture

```
Browser (ExamApp.tsx)
  │  POST /api/exam/:course/:week/generate         (kick off, returns fast)
  │  GET  /api/exam/:course/:week/generate/status   (poll every ~5s)
  ▼
exam-api.ts (routes)
  ▼
exam-generate.ts (new module)
  │  resolveWeekDir(course, week)   — find the real Week-N folder on disk
  │  buildGeneratePrompt(...)       — pure: the instructions for `claude`
  │  buildClaudeArgs(...)           — pure: the argv for the CLI
  │  startGenerateJob(...)          — spawns the process, writes status.json
  │  readJobStatus(course, week)    — reads status.json + log tail from disk
  ▼
.exam-generate/<course>-<week>/
  status.json   { state: "running" | "done" | "failed", startedAt, finishedAt?, exitCode? }
  log.txt       claude's combined stdout/stderr
  ▼
`claude -p` (headless, spawned via Bun's shell)
  reads the real course material, authors the week file, wires it in,
  runs `bun test`, exits
```

## Job status: files, not memory

`exam-generate.ts` exposes:

```ts
export interface JobStatus {
  state: "idle" | "running" | "done" | "failed";
  startedAt?: string;   // ISO
  finishedAt?: string;  // ISO
  exitCode?: number;
  logTail?: string;     // last ~40 lines, only when done/failed
}

export function jobDir(course: string, week: number): string; // .exam-generate/<course>-<week>
export function readJobStatus(course: string, week: number): JobStatus;
```

`readJobStatus` is pure filesystem reads: no `status.json` → `idle`; a
`status.json` present but no `exitcode` file yet → `running`; an `exitcode`
file present → `done` (exit 0) or `failed` (non-zero), with `logTail` read
from `log.txt`.

## Starting a job

```ts
export interface GenerateDeps {
  spawn: typeof Bun.$; // injectable for tests — see Testing below
}

export async function startGenerateJob(
  course: string,
  week: number,
  deps: GenerateDeps = { spawn: Bun.$ },
): Promise<{ ok: true } | { ok: false; reason: string }>
```

- Refuses (`{ ok: false }`) if `readJobStatus(course, week).state === "running"`
  — guards against a double-click spawning two agents on the same week.
- Refuses if `resolveWeekDir(course, week)` finds no matching folder (reuses
  the same `Week\s*(\d+)` matching `exam-sync.ts` already does, factored out
  so both modules share it instead of duplicating the regex/scan).
- Otherwise: writes `status.json` (`state: "running", startedAt: now`)
  synchronously *before* spawning, then spawns the whole thing as one shell
  pipeline via `Bun.$` (per this repo's convention of `Bun.$` over
  execa/child_process) so the **exit-code write happens inside the spawned
  shell itself**, not in a JS continuation that could be lost to a
  hot-reload:

  ```ts
  deps.spawn`
    claude -p --permission-mode acceptEdits \
      --allowedTools ${ALLOWED_TOOLS} \
      --output-format json \
      ${buildGeneratePrompt(course, week, weekDir)} \
      > ${jobDir}/log.txt 2>&1
    echo $? > ${jobDir}/exitcode
    date -u +%Y-%m-%dT%H:%M:%SZ > ${jobDir}/finishedAt
  `.cwd(repoRoot).nothrow();
  ```

  This call is **not awaited** by the route handler — it's fire-and-forget
  from the HTTP request's point of view; the route returns `202` as soon as
  `status.json` is written. `Bun.$` template interpolation escapes
  arguments automatically, so the prompt text (which embeds course/week
  strings we control, not arbitrary user input) is passed safely without
  manual shell-quoting.

## The `claude` invocation

- **Permissions**: `--permission-mode acceptEdits` (auto-approves file
  writes) plus a **scoped allowlist** —
  `--allowedTools "Read Write Edit Bash(bun test)"` — rather than
  `--dangerously-skip-permissions` (which Anthropic's own `--help` text
  calls "recommended only for sandboxes with no internet access"). The
  agent can read material, write/edit files, and run exactly `bun test`;
  nothing broader.
- **Prompt** (`buildGeneratePrompt`, a pure function so it's unit-testable
  without spawning anything): tells the agent to follow
  `docs/exam-content-authoring-guide.md` for `<course>` Week `<week>`,
  points it at the real material folder (`resolveWeekDir`'s result), tells
  it to wire the new week into `exam-content.ts` the same way prior weeks
  are wired in, run `bun test` until green, and — since it's headless with
  no human to ask — make reasonable authoring judgment calls itself rather
  than stopping to ask a question.
- No `--model`/`--effort` flag: it inherits whatever model/effort the
  user's Claude Code account is normally configured with, same as an
  interactive session.

## API routes (`exam-api.ts`)

- `POST /api/exam/:course/:week/generate`
  - 400 unknown course (same validation `examApiRoutes` already does elsewhere)
  - 400 invalid week (non-positive-integer, mirroring the existing week-param validation)
  - 409 `{ error: "already generating" }` if a job for that course/week is already `running`
  - 404 if no matching Week-N folder exists on disk for that course
  - 202 `{}` once the job is kicked off
- `GET /api/exam/:course/:week/generate/status` → `JobStatus` as JSON (200), 400 for unknown course

## Frontend (`ExamApp.tsx`)

- `SyncBanner` renders one row per pending `{course, week}` with a
  **Generate** button instead of just text.
- New `api.generate(course, week)` / `api.generateStatus(course, week)` calls.
- Clicking Generate: `POST` to kick off, then start polling
  `generateStatus` every 5s for that row; button becomes
  `"Generating… (started Xm ago)"` and is disabled while `running`.
- On `done`: stop polling, re-run `api.sync()` (drops the row once the week
  is actually authored — `findPendingWeeks` naturally excludes it once
  `exam-content.ts` has it) and, if the generated course is the currently
  selected tab, `refresh(course)` too so the new week's due-item appears
  without a manual page reload.
- On `failed`: stop polling, show the row as failed with the log tail
  (`logTail`) and a **Retry** button (just calls generate again — the
  `.exam-generate/<course>-<week>` dir gets overwritten on the next attempt).
- If the user reloads the page mid-generation, `SyncBanner` re-polls on
  mount for any row it's showing and picks the in-progress state back up
  correctly, since state lives on disk, not in React state that a refresh
  would lose (the *initial* value is refetched from `/status` on mount).

## Error handling & edge cases

- Bun's `--hot` reload firing mid-job: doesn't affect anything, since the
  spawned shell/agent process, `status.json`, and `exitcode` writes are all
  independent of the Bun server's JS module state.
- Dev server fully restarted mid-job: the OS-level `claude` process is a
  child of the *old* `bun` process; if that process dies, its children are
  typically reparented/killed depending on how they were spawned — this is
  a known, accepted limitation for v1 (a personal, single-developer local
  tool): a genuinely killed job just sits at `running` with a stale
  `startedAt` forever. Documented as a follow-up (e.g., a staleness
  timeout) rather than solved now — YAGNI given how rarely the dev server
  is fully killed while a generation is in flight.
- Double-click / concurrent generate for the same week: guarded by the
  `readJobStatus` check before spawning (409).
- `bun test` failing inside the agent's own run: the prompt tells it to fix
  and re-run until green, matching what a human authoring session already
  does — if it truly can't get there, it exits non-zero (or the outer
  shell's `bun test` invocation fails), which `readJobStatus` surfaces as
  `failed` with the log tail for the user to read.

## Testing

`exam-generate.ts`'s testable surface is deliberately split so `bun test`
never actually shells out to `claude` (slow, costs real API usage, and
non-deterministic):

- `buildGeneratePrompt` / `buildClaudeArgs` / `resolveWeekDir` — pure
  functions, tested directly against fixture directories the same way
  `exam-sync.test.ts` already fakes `courseDirs` instead of touching the
  real Desktop folder.
- `readJobStatus` — tested by writing fixture `status.json`/`exitcode`/
  `log.txt` files into a temp dir and asserting the returned `JobStatus`.
- `startGenerateJob` — tested with a fake `deps.spawn` (a stub matching
  `Bun.$`'s tagged-template call shape) that records the command it would
  have run and resolves immediately, so the test asserts *what would be
  run* (correct args, correct `status.json` written first) without
  actually running `claude`.
- API route tests (`exam-api.test.ts`) exercise the 400/404/409/202 paths
  using the same fake-spawn injection.

### Automated Hooks, Continuous Testing, Autonomous Correction

Per this project's standing spec requirement: a `PostToolUse` hook on
Write/Edit should trigger the build, `bun test`, and `tsc`, and surface any
failure immediately so it gets fixed before the user has to intervene. This
repo has no such hook configured yet (no `.git/hooks/pre-commit`, no CI) —
until one exists, this remains an outstanding requirement, same as every
other SPEC.md in this project.

## Out of scope for this pass

- Cross-course "generate everything pending" batch button (explicitly
  deferred per the per-week-button decision).
- A staleness/timeout sweep for orphaned `running` jobs after a hard server
  restart.
- Configurable model/effort per generation.
