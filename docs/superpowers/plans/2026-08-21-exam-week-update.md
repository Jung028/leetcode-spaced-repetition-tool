# Update-Week-Content Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an **Update** button for a week that's already authored (has real content in `exam-content.ts`) so that when new material — a lecture/tutorial video, extra slides, etc. — gets added to that week's folder after the fact, the user can regenerate/enrich the week's existing papers with new questions from it, without a manual Claude Code session.

**Architecture:** This repo already has a full pipeline for authoring a *brand-new* week: `exam-generate.ts`'s `startGenerateJob` spawns headless `claude -p`, tracks status on disk (`.exam-generate/<course>-<week>/status.json`), auto-transcribes any video first, and `ExamApp.tsx`'s `SyncBanner` polls it. That pipeline is reused wholesale here — the only new pieces are: (1) a second prompt builder, `buildUpdatePrompt`, that tells Claude to read the *existing* week file first and only append new questions rather than rewrite it (never reordering existing questions, since `exam-db.ts` keys graded answer history by each question's array index); (2) a `mode: "generate" | "update"` switch on `StartJobDeps` so `startGenerateJob`/`runGeneration` pick the right prompt; (3) a new `POST /api/exam/:course/:week/update` route that requires the week to already exist (unlike `/generate`); (4) a small `UpdateWeekButton` frontend component, wired into both `WeekPicker` (current due weeks) and `HistoryView` (past/completed weeks), reusing the existing `/generate/status` endpoint for polling since update jobs share the same on-disk job key as generate jobs for that course/week.

**Tech Stack:** Bun (`Bun.spawn`, `Bun.file`/`Bun.write`), TypeScript, React (existing `ExamApp.tsx` patterns), `bun:test`, the `claude` CLI (already installed, headless `-p` mode) — all unchanged from the existing Generate feature this extends.

**Spec:** No separate SPEC.md — this plan extends the existing, already-implemented design in `docs/superpowers/specs/2026-08-11-exam-auto-generate-design.md` and `docs/exam-content-authoring-guide.md`; both are read directly by the tasks below.

## Global Constraints

- Use Bun natives, not Node equivalents, per project convention — see `/Users/adam/CLAUDE.md`.
- Every course/week route param follows this codebase's existing validation pattern in `exam-api.ts`: `isKnownCourse()`, `parseWeek()` returning `null` on invalid input, `json({ error }, status)` for failures.
- No frontend test framework exists in this repo (no `.test.tsx` files, no `@testing-library`) — the frontend task is verified manually in the browser, per `/Users/adam/CLAUDE.md`'s "For UI or frontend changes, start the dev server and use the feature in a browser."
- Every task ends by running the **full** `bun test` suite (not just the new/changed file).
- Never spawn the real `claude` CLI from `bun test` — all `claude`-invoking logic must accept an injectable function so tests fake it (`RunClaude`, already established by the existing Generate feature).
- **Critical invariant for the update prompt:** `exam-db.ts` keys a student's graded answer history by `(course, week, paper_number, question_index)` — `question_index` is the question's position in that paper's `questions` array. `buildUpdatePrompt` must explicitly forbid reordering, deleting, or renumbering any existing question — only appending new ones at the end of the relevant paper's array is safe. This is the one correctness-critical rule the whole feature exists to get right; get the wording of that instruction unambiguous.
- Per this project's standing spec requirement (see `/Users/adam/CLAUDE.md`, "Spec requirement: continuous testing"): this repo still has no `PostToolUse` hook wired to `bun test`/`tsc`. That remains an outstanding, not-yet-implemented requirement, unaffected by this feature — noted here rather than re-stated per task.

---

### Task 1: `exam-generate.ts` — `buildUpdatePrompt` and mode-based prompt selection

**Files:**
- Modify: `exam-generate.ts`
- Modify: `exam-generate.test.ts`
- Modify: `docs/exam-content-authoring-guide.md`

**Interfaces:**
- Consumes: nothing new — reuses this file's existing `JobStatus`, `StartJobDeps`, `startGenerateJob`, `runGeneration` (all already defined).
- Produces:
  - `export type GenerateMode = "generate" | "update";`
  - `export function buildUpdatePrompt(course: string, week: number, weekDir: string): string` — pure, same signature shape as the existing `buildGeneratePrompt`.
  - `StartJobDeps` gains an optional `mode?: GenerateMode` field (defaults to `"generate"` wherever read).
  - `runGeneration` picks `buildUpdatePrompt` vs `buildGeneratePrompt` based on the mode passed to it by `startGenerateJob`.

- [ ] **Step 1: Write the failing tests**

Add to `exam-generate.test.ts`, right after the existing `buildGeneratePrompt` test (after line 77, before the `buildClaudeArgs` test):

```ts
test("buildUpdatePrompt names the existing file, forbids reordering existing questions, and forbids touching exam-content.ts", () => {
  const prompt = buildUpdatePrompt("INFO5995", 3, "/fake/Desktop/INFO5995/Week 3");
  expect(prompt).toContain("exam-content/info5995/week-3.ts");
  expect(prompt).toContain("/fake/Desktop/INFO5995/Week 3");
  expect(prompt).toContain("ALREADY-AUTHORED");
  expect(prompt).toContain("never reorder, delete");
  expect(prompt).toContain("Do NOT touch exam-content.ts");
  expect(prompt).toContain("bun test");
});
```

Add to the top import block (alongside the existing `buildGeneratePrompt` import):

```ts
import {
  jobDir,
  readJobStatus,
  resolveWeekDir,
  buildGeneratePrompt,
  buildUpdatePrompt,
  buildClaudeArgs,
  ALLOWED_TOOLS,
  startGenerateJob,
  transcribeWeekVideos,
  type RunClaude,
  type TranscribeFn,
} from "./exam-generate";
```

Then append these two tests at the end of the file (after the last existing test):

```ts
test("startGenerateJob passes the update prompt to runClaude when deps.mode is 'update'", async () => {
  const root = makeTempDir();
  let seenPrompt = "";
  const fakeRunClaude: RunClaude = async (args) => {
    seenPrompt = args.at(-1) ?? "";
    return { stdout: "enriched", stderr: "", exitCode: 0 };
  };

  const result = await startGenerateJob("INFO5995", 30, "/fake/week/dir", {
    runClaude: fakeRunClaude,
    root,
    mode: "update",
  });
  if (result.ok) await result.done;

  expect(seenPrompt).toContain("ALREADY-AUTHORED");
});

test("startGenerateJob defaults to the generate prompt when deps.mode is omitted", async () => {
  const root = makeTempDir();
  let seenPrompt = "";
  const fakeRunClaude: RunClaude = async (args) => {
    seenPrompt = args.at(-1) ?? "";
    return { stdout: "wrote it", stderr: "", exitCode: 0 };
  };

  const result = await startGenerateJob("INFO5995", 31, "/fake/week/dir", { runClaude: fakeRunClaude, root });
  if (result.ok) await result.done;

  expect(seenPrompt).toContain("Author exam-content");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-generate.test.ts`
Expected: FAIL — `buildUpdatePrompt is not a function` / `Cannot find name 'buildUpdatePrompt'`, and the two new `startGenerateJob` tests fail because `deps.mode` isn't read yet (they'll see the generate prompt in both cases, so the update-mode assertion fails).

- [ ] **Step 3: Add `GenerateMode` and `buildUpdatePrompt` to `exam-generate.ts`**

Add this type right above `export function buildGeneratePrompt` (which currently starts the line after `ALLOWED_TOOLS`):

```ts
export type GenerateMode = "generate" | "update";
```

Add `buildUpdatePrompt` immediately after the existing `buildGeneratePrompt` function (right before `export function buildClaudeArgs`):

```ts
export function buildUpdatePrompt(course: string, week: number, weekDir: string): string {
  const courseLower = course.toLowerCase();
  return `Update the ALREADY-AUTHORED exam-content/${courseLower}/week-${week}.ts for the leetcode-srs project — new material (e.g. a lecture/tutorial video) was just added to "${weekDir}" after this week was first authored, and it needs to be incorporated.

Read the CURRENT exam-content/${courseLower}/week-${week}.ts first, in full, before touching anything — you're enriching it, not replacing it.

Re-read the material in "${weekDir}", including any "*.transcript.md" file — that's an auto-generated transcript of a lecture/tutorial recording (the video itself is transcribed automatically before this step and can't be opened directly). Compare it against what the existing questions already cover, and write new questions (following docs/exam-content-authoring-guide.md's format and difficulty rules exactly, same as authoring a new week) for whatever the new material adds that the existing paper(s) don't already ask about. Skip material that's already well-covered — this is an update, not a wholesale regenerate.

Route new questions to whichever of the two existing papers (paperNumber 1 = tutorial, paperNumber 2 = lecture) the new material actually belongs to. Append each new question to the END of that paper's questions array — never reorder, delete, rewrite the position of, or renumber any existing question. This repo keys a student's graded answer history by each question's array index (course/week/paperNumber/questionIndex in exam-db.ts), so moving an existing question corrupts their past scores; only appending at the end is safe. You may fix an existing question in place only to correct a factual error, never to relocate it in the array.

Add the new material's filename(s) to that paper's sourceFiles array (relative to "${weekDir}") so provenance stays accurate.

Do NOT touch exam-content.ts — this week is already imported and wired into ALL_PAPERS there.

Finally, run \`bun test\` and fix any failures until the full suite passes with no failures.

You are running unattended in headless mode with no human present to ask questions — make reasonable, well-justified authoring judgment calls yourself rather than stopping to ask. When you are completely done, print one short summary line of how many questions you added to which paper(s) and confirm bun test passes.`;
}
```

- [ ] **Step 4: Thread `mode` through `StartJobDeps`, `startGenerateJob`, and `runGeneration`**

In the `StartJobDeps` interface, add the new optional field:

```ts
export interface StartJobDeps {
  runClaude: RunClaude;
  root: string;
  transcribe?: TranscribeFn;
  whisperModel?: string;
  mode?: GenerateMode;
}
```

In `startGenerateJob`, find this existing call (inside the `try` block, right before `return { ok: true, done };`):

```ts
    const done = runGeneration(
      course,
      week,
      weekDir,
      statusPath,
      startedAt,
      deps.runClaude,
      deps.transcribe ?? transcribeVideo,
      deps.whisperModel ?? DEFAULT_WHISPER_MODEL,
    ).catch(() => {});
```

Replace it with:

```ts
    const done = runGeneration(
      course,
      week,
      weekDir,
      statusPath,
      startedAt,
      deps.runClaude,
      deps.transcribe ?? transcribeVideo,
      deps.whisperModel ?? DEFAULT_WHISPER_MODEL,
      deps.mode ?? "generate",
    ).catch(() => {});
```

Then update `runGeneration`'s signature and body. Find:

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
): Promise<void> {
  try {
    // Any video in weekDir without a transcript yet gets one now, before
    // Claude ever runs — buildGeneratePrompt tells it to read
    // "*.transcript.md" files, which only exist once this step has run.
    await transcribeWeekVideos(weekDir, transcribe, whisperModel);
    const prompt = buildGeneratePrompt(course, week, weekDir);
```

Replace with:

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
): Promise<void> {
  try {
    // Any video in weekDir without a transcript yet gets one now, before
    // Claude ever runs — both prompt builders tell it to read
    // "*.transcript.md" files, which only exist once this step has run.
    await transcribeWeekVideos(weekDir, transcribe, whisperModel);
    const buildPrompt = mode === "update" ? buildUpdatePrompt : buildGeneratePrompt;
    const prompt = buildPrompt(course, week, weekDir);
```

(Leave the rest of `runGeneration`'s body — the `runClaude(args, REPO_ROOT)` call and status-writing — exactly as-is.)

- [ ] **Step 5: Add an "Updating an already-authored week" section to the authoring guide**

Append to `docs/exam-content-authoring-guide.md` (after the existing "## Verification" section, at the end of the file):

```markdown

## Updating an already-authored week with new material

When new material (most often a lecture/tutorial video) is added to a
week's folder *after* that week was already authored, use the app's
**Update** button (shown next to an already-authored week in the Modules
tab or History) instead of re-running Generate — Generate assumes the week
doesn't exist yet and would tell Claude to author it from scratch.

Update reuses the same job pipeline (auto-transcribes any new video first,
then runs headless `claude -p`), but with a different prompt
(`buildUpdatePrompt` in `exam-generate.ts`) that:

- Reads the existing `week-N.ts` first and only adds what the new material
  covers that isn't already asked about — not a wholesale rewrite.
- **Only ever appends new questions to the end of a paper's `questions`
  array.** Never reorders, deletes, or renumbers an existing question —
  `exam-db.ts` keys a student's graded answer history by each question's
  array index, so moving one silently corrupts past scores.
- Never touches `exam-content.ts` — the week's import/`ALL_PAPERS` entry is
  already wired in from when it was first authored.

If you're doing this by hand instead of via the button (e.g. no dev server
running), follow the same rules manually: read the existing file first,
append rather than rewrite, and never touch already-graded questions'
positions.
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `bun test`
Expected: PASS, full suite green.

- [ ] **Step 7: Commit**

```bash
git add exam-generate.ts exam-generate.test.ts docs/exam-content-authoring-guide.md
git commit -m "feat: add buildUpdatePrompt and mode switch for regenerating an already-authored week"
```

---

### Task 2: Wire `POST /api/exam/:course/:week/update` into `exam-api.ts`

**Files:**
- Modify: `exam-api.ts`
- Modify: `exam-generate-api.test.ts`

**Interfaces:**
- Consumes: `resolveWeekDir`, `startGenerateJob`, `buildExamSchedule` (already imported in `exam-api.ts`), and Task 1's `mode` field on `StartJobDeps`.
- Produces: a new route entry, `"/api/exam/:course/:week/update": { POST: ... }`, on the object `examApiRoutes` returns. No new exported types — reuses the existing `/generate/status` route for polling since update jobs share the same on-disk job key (`${course}-${week}`) as generate jobs.

- [ ] **Step 1: Write the failing tests**

Append to `exam-generate-api.test.ts` (after the last existing test, `"GET generate status defaults to idle..."`):

```ts
// INFO5990 Week 2 already has real authored content in exam-content.ts
// (unlike Week 3, which the existing 404 test above relies on being
// pending) — that's exactly the state an /update call requires.
test("POST update kicks off a job using the update prompt and GET status reflects it finishing", async () => {
  const calls: string[][] = [];
  const h = harness(async (args) => {
    calls.push(args);
    return { stdout: "enriched it", stderr: "", exitCode: 0 };
  });
  mkdirSync(join(h.desktopFixture, "Week 2"));
  try {
    const kickoff = await fetch(`${h.base}/api/exam/${COURSE}/2/update`, { method: "POST" });
    expect(kickoff.status).toBe(202);

    // The fake runClaude resolves on the next microtask; give it a tick.
    await new Promise((r) => setTimeout(r, 20));

    const statusRes = await fetch(`${h.base}/api/exam/${COURSE}/2/generate/status`);
    const status: any = await statusRes.json();
    expect(status.state).toBe("done");
    expect(status.logTail).toContain("enriched it");
    expect(calls[0]!.at(-1)).toContain("ALREADY-AUTHORED");
  } finally {
    h.cleanup();
  }
});

test("POST update returns 400 for a week that has never been generated", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/${COURSE}/99/update`, { method: "POST" });
    expect(res.status).toBe(400);
  } finally {
    h.cleanup();
  }
});

test("POST update returns 404 when no material folder exists for that week", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    // h.desktopFixture has no "Week 2" subfolder, even though INFO5990
    // Week 2 content exists in the real exam-content.ts.
    const res = await fetch(`${h.base}/api/exam/${COURSE}/2/update`, { method: "POST" });
    expect(res.status).toBe(404);
  } finally {
    h.cleanup();
  }
});

test("POST update with an unknown course returns 400", async () => {
  const h = harness(async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  try {
    const res = await fetch(`${h.base}/api/exam/UNKNOWN123/2/update`, { method: "POST" });
    expect(res.status).toBe(400);
  } finally {
    h.cleanup();
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-generate-api.test.ts`
Expected: FAIL — 404 (route doesn't exist) for all four new tests.

- [ ] **Step 3: Add the route to `exam-api.ts`**

Find the existing `"/api/exam/:course/:week/generate/status"` route block:

```ts
    "/api/exam/:course/:week/generate/status": {
      GET: async (req: Request & { params: { course: string; week: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        return json(await readJobStatus(course, week, generateDeps.root));
      },
    },
```

Insert a new route right after it (still before `"/api/exam/:course/due"`):

```ts
    "/api/exam/:course/:week/update": {
      POST: async (req: Request & { params: { course: string; week: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const alreadyAuthored = buildExamSchedule().some((p) => p.course === course && p.week === week);
        if (!alreadyAuthored) return json({ error: "week not yet generated — use Generate instead" }, 400);
        const weekDir = resolveWeekDir(course, week, generateDeps.courseDirs);
        if (!weekDir) return json({ error: "no material found for this week" }, 404);
        const result = await startGenerateJob(course, week, weekDir, { ...generateDeps, mode: "update" });
        if (!result.ok) return json({ error: result.reason }, 409);
        return json({}, 202);
      },
    },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test`
Expected: PASS, full suite green.

- [ ] **Step 5: Commit**

```bash
git add exam-api.ts exam-generate-api.test.ts
git commit -m "feat: add POST /api/exam/:course/:week/update route"
```

---

### Task 3: Frontend — `UpdateWeekButton` in `ExamApp.tsx`, wired into `WeekPicker` and `HistoryView`

**Files:**
- Modify: `ExamApp.tsx`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `POST /api/exam/:course/:week/update` and the existing `GET /api/exam/:course/:week/generate/status` (Task 2). Existing module-scope helpers already in `ExamApp.tsx`: `jobKey`, `formatElapsed`, `notifyGenerateDone`, `errorMessage`, and the `api` object.
- Produces: `UpdateWeekButton` — a small self-contained component (`{ course, week, onUpdated }` props) rendered inside both `WeekPicker` and `HistoryView`.

- [ ] **Step 1: Add `api.update`**

In the `api` object, right after the existing `generateStatus` entry, add:

```ts
  update: (course: string, week: number) =>
    fetch(`/api/exam/${course}/${week}/update`, { method: "POST" }).then((r) => json<{}>(r)),
```

- [ ] **Step 2: Add the `UpdateWeekButton` component**

Insert this new function right after the existing `SyncBanner` function (i.e. right before `function CourseSelector`):

```tsx
// A single-week counterpart to SyncBanner's per-row Generate button: same
// on-disk job status (course/week share the same job key whether the job
// came from Generate or Update), same "survive a page reload" mount-time
// poll, but scoped to one already-authored week rather than a list of
// pending ones — so no queue is needed (the server's global one-job-at-a-
// time lock already returns 409 if something else is running).
function UpdateWeekButton({
  course,
  week,
  onUpdated,
}: {
  course: string;
  week: number;
  onUpdated: () => void;
}) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [tick, setTick] = useState(() => Date.now());
  const notifiedRef = useRef(false);

  useEffect(() => {
    api.generateStatus(course, week).then(setJob).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, week]);

  const running = job?.state === "running";
  const failed = job?.state === "failed";

  useEffect(() => {
    if (!running) return;
    const poll = async () => {
      const status = await api.generateStatus(course, week).catch(() => null);
      if (!status) return;
      setJob(status);
      if ((status.state === "done" || status.state === "failed") && !notifiedRef.current) {
        notifiedRef.current = true;
        notifyGenerateDone(course, week, status);
      }
      if (status.state === "done") onUpdated();
    };
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, course, week]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const handleClick = async () => {
    if (running) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    notifiedRef.current = false;
    setJob({ state: "running", startedAt: new Date().toISOString() });
    try {
      await api.update(course, week);
    } catch (err) {
      setJob({ state: "failed", logTail: errorMessage(err) });
    }
  };

  const label = running
    ? `Updating… ${formatElapsed(job!.startedAt!, tick)}`
    : failed
      ? "Retry update"
      : "Update from new material";

  return (
    <span className="update-week">
      <button className="btn" disabled={running} onClick={handleClick}>
        {label}
      </button>
      {failed && job?.logTail && <p className="rule-note">{job.logTail}</p>}
    </span>
  );
}
```

- [ ] **Step 3: Wire it into `WeekPicker`**

Find the current `WeekPicker` function signature and header:

```tsx
function WeekPicker({
  weekView,
  onBack,
  onPickPaper,
}: {
  weekView: ExamWeekView;
  onBack: () => void;
  onPickPaper: (paperNumber: number) => void;
}) {
  return (
    <article className="detail">
      <header className="detail-head">
        <h2>Week {weekView.week}</h2>
        <span className="tag">{weekView.overdue ? "overdue" : "due"} — {weekView.dueDate}</span>
      </header>
```

Replace with:

```tsx
function WeekPicker({
  weekView,
  course,
  onBack,
  onPickPaper,
  onUpdated,
}: {
  weekView: ExamWeekView;
  course: string;
  onBack: () => void;
  onPickPaper: (paperNumber: number) => void;
  onUpdated: () => void;
}) {
  return (
    <article className="detail">
      <header className="detail-head">
        <h2>Week {weekView.week}</h2>
        <span className="tag">{weekView.overdue ? "overdue" : "due"} — {weekView.dueDate}</span>
        <UpdateWeekButton course={course} week={weekView.week} onUpdated={onUpdated} />
      </header>
```

(`.detail-head h2` already has `flex: 1` in `index.css`, so the tag and new button naturally sit to the right — no CSS changes needed.)

Find the `<WeekPicker ... />` call site:

```tsx
      {view.name === "week" && currentWeek && (
        <WeekPicker
          weekView={currentWeek}
          onBack={() => setView({ name: "board" })}
          onPickPaper={(paperNumber) => setView({ name: "paper", week: view.week, paperNumber })}
        />
      )}
```

Replace with:

```tsx
      {view.name === "week" && currentWeek && (
        <WeekPicker
          weekView={currentWeek}
          course={course}
          onBack={() => setView({ name: "board" })}
          onPickPaper={(paperNumber) => setView({ name: "paper", week: view.week, paperNumber })}
          onUpdated={() => refresh(course)}
        />
      )}
```

- [ ] **Step 4: Wire it into `HistoryView`**

Find the current `HistoryView` function signature and per-week section header:

```tsx
function HistoryView({
  weeks,
  onBack,
  onOpenPaper,
  onRetake,
  onRetakeWrong,
}: {
  weeks: ExamHistoryWeek[];
  onBack: () => void;
  onOpenPaper: (week: number, paperNumber: number) => void;
  onRetake: (week: number, paperNumber: number) => void;
  onRetakeWrong: (week: number, paperNumber: number) => void;
}) {
```

Replace with:

```tsx
function HistoryView({
  weeks,
  course,
  onBack,
  onOpenPaper,
  onRetake,
  onRetakeWrong,
  onUpdated,
}: {
  weeks: ExamHistoryWeek[];
  course: string;
  onBack: () => void;
  onOpenPaper: (week: number, paperNumber: number) => void;
  onRetake: (week: number, paperNumber: number) => void;
  onRetakeWrong: (week: number, paperNumber: number) => void;
  onUpdated: () => void;
}) {
```

Find the per-week section header:

```tsx
          <section key={w.week} className="board" aria-label={`Week ${w.week}`}>
            <div className="section-head">
              <h2>Week {w.week}</h2>
            </div>
```

Replace with:

```tsx
          <section key={w.week} className="board" aria-label={`Week ${w.week}`}>
            <div className="section-head">
              <h2>Week {w.week}</h2>
              <span style={{ marginLeft: "auto" }}>
                <UpdateWeekButton course={course} week={w.week} onUpdated={onUpdated} />
              </span>
            </div>
```

Find the `<HistoryView ... />` call site:

```tsx
      {view.name === "history" && (
        <HistoryView
          weeks={history}
          onBack={() => setView({ name: "board" })}
          onOpenPaper={(week, paperNumber) => setView({ name: "history-paper", week, paperNumber })}
          onRetake={retake}
          onRetakeWrong={retakeWrong}
        />
      )}
```

Replace with:

```tsx
      {view.name === "history" && (
        <HistoryView
          weeks={history}
          course={course}
          onBack={() => setView({ name: "board" })}
          onOpenPaper={(week, paperNumber) => setView({ name: "history-paper", week, paperNumber })}
          onRetake={retake}
          onRetakeWrong={retakeWrong}
          onUpdated={loadHistory}
        />
      )}
```

- [ ] **Step 5: Run the full test suite (backend tests only — this task has no `.test.tsx` coverage)**

Run: `bun test`
Expected: PASS, full suite green (this task only touches `.tsx`, so this confirms nothing else broke; `tsc` — see Step 6 — is what actually type-checks the new JSX).

Run: `bunx tsc --noEmit`
Expected: no new type errors introduced by this task's changes.

- [ ] **Step 6: Manual verification in the browser**

1. Run: `bun run dev`
2. Open the app, select a course with an already-authored week (e.g. INFO5990, which has Weeks 1–3 authored).
3. Click into that week (or open **History**) and confirm an **Update from new material** button now appears next to the week header.
4. Click it. Confirm:
   - The button immediately becomes disabled and reads "Updating… 0:0X".
   - Every ~5s it re-polls status (watch the Network tab for `GET .../generate/status` calls) — same endpoint the existing Generate button already uses.
   - `.exam-generate/<course>-<week>/status.json` appears/updates in the repo root while it runs.
5. Wait for it to finish (this genuinely takes real wall-clock time — the spawned `claude` session does real authoring work). Confirm:
   - The button returns to "Update from new material" (or shows "Retry update" + a log tail if it failed).
   - `exam-content/<course>/week-N.ts` gained new questions appended to the end of the relevant paper's `questions` array — the existing questions and their order are unchanged (spot-check a couple of `question_index` positions against what was there before, if you have prior graded answers for that week).
   - `exam-content.ts` was **not** modified (no duplicate import, no changed `ALL_PAPERS` entry).
6. Reload the page mid-update once to confirm the button correctly comes back as "Updating…" instead of resetting — same on-disk-status-survives-a-reload guarantee the existing Generate button already has.

Expected: all of the above hold true; no console errors in the browser.

- [ ] **Step 7: Update `CLAUDE.md`'s existing manual workflow section to point at the new button**

In this project's `CLAUDE.md`, find the "Exam content generation workflow (new video material)" section's numbered list, specifically bullet 2, which currently reads:

```
2. **Delegate the actual authoring to a `general-purpose` subagent**,
   don't read the transcript/PDFs/tutorial project files inline in the
   main session — a lecture transcript plus slides plus a tutorial's Java
   project is a lot of raw material for no benefit to the main
   conversation's context. Give the subagent: exact file paths, which
   `docs/exam-content-authoring-guide.md` process to follow, and an
   explicit scope boundary — e.g. "leave TUTORIAL_PAPER untouched, only
   rewrite LECTURE_PAPER" when only one paper needs the new source, rather
   than a full week regenerate that risks needlessly rewriting content
   that was already fine.
```

Replace it with:

```
2. **For a week that's already authored, click Update in the app instead
   of doing this by hand** — the Modules/History view's Update button
   (`buildUpdatePrompt` in `exam-generate.ts`) now runs exactly this
   workflow automatically: it re-scans the week's material, transcribes
   any new video, reads the existing week file, and appends new questions
   to whichever paper the new material belongs to without touching
   existing questions' order (see `docs/exam-content-authoring-guide.md`,
   "Updating an already-authored week with new material," for why order
   must never change). Only fall back to delegating to a `general-purpose`
   subagent by hand for genuinely manual cases — no dev server running, or
   a scope boundary too specific for the automated prompt to infer on its
   own (e.g. "leave TUTORIAL_PAPER untouched, only rewrite LECTURE_PAPER").
```

- [ ] **Step 8: Commit**

```bash
git add ExamApp.tsx CLAUDE.md
git commit -m "feat: add Update button for already-authored weeks in WeekPicker and HistoryView"
```

---

## Self-Review Notes

- **Spec coverage:** the ask ("add a button to update, which will generate new questions from the content in the week, because I added new video mp4 and material") maps to: mode-aware prompt (Task 1), a dedicated `/update` route distinct from `/generate` (Task 2), and a visible button wired into both places an already-authored week is reachable from the UI (Task 3). Video handling specifically is already covered for free — `transcribeWeekVideos` runs before either prompt, generate or update, unchanged.
- **The one correctness-critical risk** — silently corrupting a student's graded history by letting Claude reorder questions during an update — is addressed at three layers: the prompt text itself (Task 1, explicit and repeated), the authoring guide (Task 1, Step 5, so it's discoverable outside the generated prompt string too), and this plan's Global Constraints section flagging it as the thing to get right.
- **Type consistency:** `GenerateMode` (Task 1) flows into `StartJobDeps.mode` (Task 1) → `startGenerateJob`'s existing `deps: StartJobDeps` parameter (unchanged signature — Task 2's route just passes `{ ...generateDeps, mode: "update" }`) → `runGeneration`'s new `mode` parameter (Task 1). No new status endpoint or `JobStatus` shape was introduced — Task 3's `UpdateWeekButton` reuses `api.generateStatus` verbatim, which is safe because update and generate jobs for the same course/week share one job directory (`jobDir(course, week)`) by design, and are already mutually exclusive via the existing global one-job-at-a-time lock.
- **Placeholder scan:** no TBD/"add appropriate handling" phrases; every step has literal code or literal doc prose to write.
