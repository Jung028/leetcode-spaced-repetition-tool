// Kicks off headless `claude -p` sessions that author a week's exam
// content, following docs/exam-content-authoring-guide.md — replacing the
// old "sync just tells you what's pending, a human runs Claude Code by
// hand" flow with a one-click Generate button.
//
// Job status lives entirely on disk (.exam-generate/<course>-<week>/), not
// in a JS variable: bun --hot reloads the module graph on any file save,
// and this job's whole purpose is to write files (the week's content,
// exam/content.ts) while it runs — an in-memory Map would risk getting
// wiped mid-job by the very save it triggers.
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { COURSE_DIRS, findWeekFolder } from "./sync";
import { scanWeekFolder } from "../scripts/generate-exam-week";
import { transcribeVideo, DEFAULT_MODEL as DEFAULT_WHISPER_MODEL } from "../scripts/transcribe-lecture";
import { STAGES, buildStagePrompt, stageOutputPath, type StageName, type StageContext, type GenerateMode } from "./pipeline";
export type { GenerateMode } from "./pipeline";

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

export const DEFAULT_JOB_ROOT = join(import.meta.dir, ".exam-generate");

export function jobDir(course: string, week: number, root: string = DEFAULT_JOB_ROOT): string {
  return join(root, `${course}-${week}`);
}

// If the dev server restarts or the spawned `claude` process hangs without
// exiting, status.json can stay `{state: "running"}` forever. Treat a
// running status older than this as failed when *reading* it (don't
// rewrite the file — just present it as failed to callers) so a fresh
// generation naturally becomes possible again.
const RUNNING_STALE_MS = 60 * 60 * 1000;

function withStaleness(status: JobStatus): JobStatus {
  const since = status.updatedAt ?? status.startedAt;
  if (status.state !== "running" || !since) return status;
  const age = Date.now() - new Date(since).getTime();
  if (age <= RUNNING_STALE_MS) return status;
  return {
    ...status,
    state: "failed",
    finishedAt: status.finishedAt ?? new Date().toISOString(),
    // Retry resumes at the stage that was running when the job went quiet.
    failedStage: status.stage,
    logTail: "Timed out: no update in over 1 hour (server likely restarted or the process hung). Click Retry.",
  };
}

export async function readJobStatus(
  course: string,
  week: number,
  root: string = DEFAULT_JOB_ROOT,
): Promise<JobStatus> {
  const file = Bun.file(join(jobDir(course, week, root), "status.json"));
  if (!(await file.exists())) return { state: "idle" };
  return withStaleness((await file.json()) as JobStatus);
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

// Auto-approves file writes but pre-authorizes only the Bash commands the
// pipeline's stage prompts tell the agent to run (bun test, the bun scripts/
// check-* validators, and git diff for the update-mode checker) — deliberately narrower
// than --dangerously-skip-permissions, which Anthropic's own --help text calls
// "recommended only for sandboxes with no internet access."
export const ALLOWED_TOOLS = "Read Write Edit Glob Grep Bash(bun test*) Bash(bun scripts/check-*) Bash(git diff *)";

export function buildGeneratePrompt(course: string, week: number, weekDir: string): string {
  const courseLower = course.toLowerCase();
  return `Author exam-content/${courseLower}/week-${week}.ts for the leetcode-srs project, following docs/exam-content-authoring-guide.md exactly.

Read the real material in "${weekDir}", including any "*.transcript.md" file — that's an auto-generated transcript of a lecture/tutorial recording (the video itself is transcribed automatically before this step and can't be opened directly, so the transcript is how its content reaches you). Per the authoring guide, use the transcript specifically to catch what the slides alone wouldn't — verbal asides, emphasis, examples worked through out loud, in-class questions — not just a prose re-read of the slide content. Read exam-content/${courseLower}/unit_outline.md and exam-content/${courseLower}/assessment_overview.md if they exist, for the unit's learning outcomes and final-exam format. Skim exam-content/${courseLower}/week-${week - 1}.ts if it exists, for continuity with the prior week.

Write two separate papers matching exam-content/types.ts's ExamPaperSeed/ExamQuestionSeed shape, exported together as WEEK_${week}_PAPERS: paperNumber 1 is a tutorial-only paper (questions written only from the week's tutorial material — worksheets, tutorial slides, in-class exercises), and paperNumber 2 is a lecture-only paper (questions written only from the week's lecture material). List the tutorial paper first — it's the one to practice first. About 50 questions per lecture paper (see the authoring guide's "Question count per paper"); a tutorial paper can be smaller. If this week genuinely has no separate tutorial material, a single lecture-only paperNumber-1 paper is fine. Then wire it into exam/content.ts: add the import and append it to the ALL_PAPERS array, exactly the way every prior week is already wired in there.

Finally, run \`bun test\` and fix any failures until the full suite passes with no failures — including fixing any existing test elsewhere in the repo that turns out to hardcode an assumption your new week's content invalidates (for example, a test assuming a specific course still has only one week of content).

You are running unattended in headless mode with no human present to ask questions — make reasonable, well-justified authoring judgment calls yourself rather than stopping to ask. When you are completely done, print one short summary line of what you wrote and confirm bun test passes.`;
}

export function buildUpdatePrompt(course: string, week: number, weekDir: string): string {
  const courseLower = course.toLowerCase();
  return `Update the ALREADY-AUTHORED exam-content/${courseLower}/week-${week}.ts for the leetcode-srs project — new material (e.g. a lecture/tutorial video) was just added to "${weekDir}" after this week was first authored, and it needs to be incorporated.

Read the CURRENT exam-content/${courseLower}/week-${week}.ts first, in full, before touching anything — you're enriching it, not replacing it.

Re-read the material in "${weekDir}", including any "*.transcript.md" file — that's an auto-generated transcript of a lecture/tutorial recording (the video itself is transcribed automatically before this step and can't be opened directly). Compare it against what the existing questions already cover, and write new questions (following docs/exam-content-authoring-guide.md's format and difficulty rules exactly, same as authoring a new week) for whatever the new material adds that the existing paper(s) don't already ask about. Skip material that's already well-covered — this is an update, not a wholesale regenerate.

This week may have ONE existing paper or TWO — do not assume there are two. Route new questions into whichever EXISTING paper (by paperNumber, based on what you actually read in the file) the new material belongs to. Append each new question to the END of that paper's questions array — never reorder, delete, rewrite the position of, or renumber any existing question. This repo keys a student's graded answer history by each question's array index (course/week/paperNumber/questionIndex in exam-db.ts), so moving an existing question corrupts their past scores; only appending at the end is safe. You may fix an existing question in place only to correct a factual error, never to relocate it in the array.

Never create a new paperNumber, under any circumstances — only route into a paperNumber that already exists in the week file you read. New exam paper rows are only created once, at process startup (seedNewPapers in exam-db.ts, run from migrateExam at module load); a paperNumber invented mid-job gets no DB row until the dev server restarts, which you cannot do, so it would be broken output — invisible in the UI and impossible to grade. If the new material doesn't cleanly fit any existing paper's scope, put it in whichever existing paper is the closest fit rather than inventing a new one.

Add the new material's filename(s) to that paper's sourceFiles array (relative to "${weekDir}") so provenance stays accurate.

Do NOT touch exam/content.ts — this week is already imported and wired into ALL_PAPERS there.

Finally, run \`bun test\` and fix any failures until the full suite passes with no failures.

You are running unattended in headless mode with no human present to ask questions — make reasonable, well-justified authoring judgment calls yourself rather than stopping to ask. When you are completely done, print one short summary line of how many questions you added to which paper(s) and confirm bun test passes.`;
}

export function buildClaudeArgs(prompt: string): string[] {
  return ["-p", "--permission-mode", "acceptEdits", "--allowedTools", ALLOWED_TOOLS, "--output-format", "json", prompt];
}

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

export type TranscribeFn = (input: string, model: string, outPath: string) => Promise<void>;

// `since` is the epoch-ms time just before the stage's claude call started; a
// stage's output only counts if it was (re)written at or after that moment.
// A failing result may carry a reason (e.g. the first lines of an import error),
// which the runner appends to the failure note.
export type CheckResult = boolean | { ok: false; reason: string };
export type CheckStageOutput = (stage: StageName, ctx: StageContext, since?: number) => Promise<CheckResult>;

export interface StartJobDeps {
  runClaude: RunClaude;
  root: string;
  transcribe?: TranscribeFn;
  whisperModel?: string;
  mode?: GenerateMode;
  checkStageOutput?: CheckStageOutput;
  // Repo checkout the agent runs in and whose files are snapshotted/restored.
  // Defaults to the real repo; tests point it at a temp dir.
  repoRoot?: string;
}

// import.meta.dir is exam/, so the repo root is one level up.
const REPO_ROOT = join(import.meta.dir, "..");

const MTIME_SLACK_MS = 1000;

function weekFileRel(course: string, week: number): string {
  return `exam-content/${course.toLowerCase()}/week-${week}.ts`;
}

// True if the file parses as TypeScript. Uses Bun's in-process transpiler (no
// spawn), which throws on syntax errors.
function parsesAsTypeScript(path: string): boolean {
  try {
    new Bun.Transpiler({ loader: "ts" }).transformSync(readFileSync(path, "utf8"));
    return true;
  } catch {
    return false;
  }
}

// Real check for a stage's output. A file only counts if it exists, is
// non-empty, and was modified at or after `since` — otherwise a stage that
// wrote nothing would pass on the previous run's file (in update mode the week
// file ALWAYS pre-exists, so the agent must genuinely have edited it). For the
// write stage's week file, and the week file left behind by the check stage,
// syntax is checked first (cheap), then the app's real import graph is loaded
// in a subprocess (exam/content.ts), which catches an unresolvable import in
// content.ts or a week file that parses but cannot load. That spawn lives only
// here: tests inject their own checker (or omit it, which skips the check) so
// nothing spawns or touches the real repo.
export function makeCheckStageOutput(repoRoot: string): CheckStageOutput {
  return async (stage, ctx, since) => {
    const rel = stageOutputPath(stage, ctx.course, ctx.week);
    let weekFile: string;
    if (rel === null) {
      // The checker edits in place: no fresh-write requirement, but what it
      // leaves behind must still parse and load.
      weekFile = join(repoRoot, weekFileRel(ctx.course, ctx.week));
      if (!existsSync(weekFile)) return false;
    } else {
      const path = join(repoRoot, rel);
      if (!existsSync(path)) return false;
      const st = statSync(path);
      if (st.size === 0) return false;
      if (since !== undefined && st.mtimeMs < since - MTIME_SLACK_MS) return false;
      if (stage !== "write") return true;
      weekFile = path;
    }
    if (!parsesAsTypeScript(weekFile)) return false;
    return appStillImports(repoRoot);
  };
}

// Loads exam/content.ts (which pulls in every week file) in a fresh bun
// process, so an unresolvable import or a module that throws at load time fails.
async function appStillImports(repoRoot: string): Promise<CheckResult> {
  const target = join(repoRoot, "exam/content.ts");
  const proc = Bun.spawn(["bun", "-e", `await import(${JSON.stringify(target)})`], {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stderr, exitCode] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
  if (exitCode === 0) return true;
  const firstLines = stderr.trim().split("\n").slice(0, 8).join("\n");
  return { ok: false, reason: `exam/content.ts no longer imports cleanly:\n${firstLines}` };
}

export const defaultCheckStageOutput: CheckStageOutput = makeCheckStageOutput(REPO_ROOT);

export const defaultGenerateDeps: StartJobDeps = {
  runClaude: defaultRunClaude,
  root: DEFAULT_JOB_ROOT,
  transcribe: transcribeVideo,
  whisperModel: DEFAULT_WHISPER_MODEL,
  checkStageOutput: defaultCheckStageOutput,
};

// RISK: the write and check stages edit the shared week file and exam/content.ts
// in place. A stage that fails midway can leave a half-written week file or an
// import in content.ts pointing at one, which would break the whole app at the
// next reload (and a retry in update mode would then append onto the broken
// file). So before the write and check stages we snapshot both files and put
// them back if that stage fails. "Did not exist" is recorded too, so a failed
// first-time write deletes the new file instead of leaving it behind.
interface FileSnapshot {
  path: string;
  content: Buffer | null;
}

function snapshotFiles(repoRoot: string, course: string, week: number): FileSnapshot[] {
  return [join(repoRoot, weekFileRel(course, week)), join(repoRoot, "exam", "content.ts")].map((path) => ({
    path,
    content: existsSync(path) ? readFileSync(path) : null,
  }));
}

function restoreSnapshot(snapshot: FileSnapshot[]): void {
  for (const { path, content } of snapshot) {
    if (content === null) {
      rmSync(path, { force: true });
    } else if (!existsSync(path) || !readFileSync(path).equals(content)) {
      writeFileSync(path, content);
    }
  }
}

// Atomic (write a temp file, then rename over it) so a status poll never reads
// a truncated status.json.
async function writeStatus(statusPath: string, status: JobStatus): Promise<void> {
  const tmp = `${statusPath}.tmp`;
  await Bun.write(tmp, JSON.stringify(status));
  renameSync(tmp, statusPath);
}

// Transcribes every video in weekDir that doesn't already have a
// "<name>.transcript.md" sitting next to it, so buildGeneratePrompt's
// "read *.transcript.md" instruction has something to find — a video
// dropped into a week folder is otherwise invisible to the generate step,
// since Claude can't open the video file itself. Skips weekDir entirely
// when it doesn't exist (test fixtures use fake paths) rather than letting
// scanWeekFolder's readdirSync throw.
export async function transcribeWeekVideos(weekDir: string, transcribe: TranscribeFn, model: string): Promise<string[]> {
  if (!existsSync(weekDir)) return [];
  const { videos } = scanWeekFolder(weekDir);
  const written: string[] = [];
  for (const relPath of videos) {
    const videoPath = join(weekDir, relPath);
    const outPath = join(dirname(videoPath), `${basename(videoPath, extname(videoPath))}.transcript.md`);
    if (existsSync(outPath)) continue;
    await transcribe(videoPath, model, outPath);
    written.push(outPath);
  }
  return written;
}

export type StartResult = { ok: true; done: Promise<void> } | { ok: false; reason: string };

// Closes the narrow dispatch-time race where two near-simultaneous calls
// (e.g. a double-click) both pass the disk-based "not already running"
// check before either write lands. This is a same-process, in-memory guard
// only — it's checked/added synchronously (no `await` gap) so there's no
// window for a second call to slip through, and the key is released as
// soon as the initial "running" status.json write completes, at which
// point the durable disk-based readJobStatus check takes over as the
// source of truth (including across hot-reload/page-reload).
const startingJobs = new Set<string>();

// Scans deps.root for any *other* job directory whose status is "running"
// (staleness-aware, via withStaleness) — the disk-based half of the global
// concurrency lock. Two different-week jobs would otherwise both be able to
// edit the shared exam/content.ts file at once and corrupt it.
async function anyOtherJobRunning(root: string, excludeKey: string): Promise<boolean> {
  if (!existsSync(root)) return false;
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === excludeKey) continue;
    const file = Bun.file(join(root, entry.name, "status.json"));
    if (!(await file.exists())) continue;
    const status = withStaleness((await file.json()) as JobStatus);
    if (status.state === "running") return true;
  }
  return false;
}

export async function startGenerateJob(
  course: string,
  week: number,
  weekDir: string,
  deps: StartJobDeps = defaultGenerateDeps,
): Promise<StartResult> {
  const key = `${course}-${week}`;
  // Global, not per-key: only one generation job may be in-flight across the
  // whole app at a time, since every job edits the same shared
  // exam/content.ts file.
  if (startingJobs.size > 0) return { ok: false, reason: "another generation is already running" };
  startingJobs.add(key);

  try {
    const existing = await readJobStatus(course, week, deps.root);
    if (existing.state === "running") return { ok: false, reason: "already generating" };

    if (await anyOtherJobRunning(deps.root, key)) {
      return { ok: false, reason: "another generation is already running" };
    }

    const dir = jobDir(course, week, deps.root);
    mkdirSync(dir, { recursive: true });
    const statusPath = join(dir, "status.json");
    const startedAt = new Date().toISOString();
    const mode = deps.mode ?? "generate";
    // A failed job resumes from the stage that failed (same mode only); anything
    // else starts from the top.
    const resumeFrom: StageName =
      existing.state === "failed" && existing.failedStage && existing.mode === mode ? existing.failedStage : "read";
    await writeStatus(statusPath, { state: "running", startedAt, updatedAt: startedAt, stage: resumeFrom, mode });

    // Fire-and-forget from the caller's point of view (an HTTP route handler
    // returns as soon as this function resolves, well before generation
    // finishes) — `done` exists purely so tests can await completion.
    const done = runGeneration(
      course,
      week,
      weekDir,
      statusPath,
      startedAt,
      deps.runClaude,
      deps.transcribe ?? transcribeVideo,
      deps.whisperModel ?? DEFAULT_WHISPER_MODEL,
      mode,
      resumeFrom,
      deps.checkStageOutput,
      deps.repoRoot ?? REPO_ROOT,
    ).catch(() => {});
    return { ok: true, done };
  } finally {
    startingJobs.delete(key);
  }
}

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
  checkStageOutput: CheckStageOutput | undefined,
  repoRoot: string,
): Promise<void> {
  const ctx: StageContext = { course, week, weekDir, mode };
  const writerBase = mode === "update" ? buildUpdatePrompt(course, week, weekDir) : buildGeneratePrompt(course, week, weekDir);
  let lastLog = "";
  let currentStage: StageName = resumeFrom;
  // Set for the write and check stages only; restored if that stage fails.
  let restoreTo: FileSnapshot[] | undefined;
  const restoreNote = (): string => {
    if (!restoreTo) return "";
    try {
      restoreSnapshot(restoreTo);
      return "\n(Restored the week file and exam/content.ts to their state before this stage.)";
    } catch (e) {
      return `\n(Could NOT restore the week file / exam/content.ts: ${e instanceof Error ? e.message : String(e)})`;
    }
  };
  const fail = async (failure: Partial<JobStatus>): Promise<void> =>
    writeStatus(statusPath, { state: "failed", startedAt, finishedAt: new Date().toISOString(), failedStage: currentStage, mode, ...failure });
  try {
    if (resumeFrom === "read") {
      // Transcription can take a long time; keep updatedAt fresh so it does not
      // count against staleness, and (via the stage write below) so it does not
      // eat into the first stage's clock afterwards.
      await writeStatus(statusPath, { state: "running", startedAt, updatedAt: new Date().toISOString(), stage: "read", mode });
      // Any video in weekDir without a transcript yet gets one now, before the
      // reader runs — the stage prompts tell the agent to read "*.transcript.md"
      // files, which only exist once this step has run.
      await transcribeWeekVideos(weekDir, transcribe, whisperModel);
    }
    for (const stage of STAGES.slice(STAGES.indexOf(resumeFrom))) {
      currentStage = stage;
      restoreTo = undefined;
      await writeStatus(statusPath, { state: "running", startedAt, updatedAt: new Date().toISOString(), stage, mode });
      // Snapshot before write (undo a half-written week) and before check (the
      // post-write state, which is what a failed check must fall back to).
      if (stage === "write" || stage === "check") restoreTo = snapshotFiles(repoRoot, course, week);
      const stageStart = Date.now();
      const args = buildClaudeArgs(buildStagePrompt(stage, ctx, writerBase));
      const { stdout, stderr, exitCode } = await runClaude(args, repoRoot);
      lastLog = summarizeOutput(stdout, stderr);
      if (exitCode !== 0) {
        await fail({ exitCode, logTail: lastLog + restoreNote() });
        return;
      }
      const checked = checkStageOutput ? await checkStageOutput(stage, ctx, stageStart) : true;
      if (checked !== true) {
        const target = stageOutputPath(stage, course, week);
        const msg = target
          ? `The ${stage} stage finished but did not write a fresh, valid ${target}.`
          : `The ${stage} stage finished but left a week file that is missing or does not parse.`;
        const reason = typeof checked === "object" ? `\n${checked.reason}` : "";
        await fail({ exitCode, logTail: msg + reason + restoreNote() });
        return;
      }
    }
    await writeStatus(statusPath, { state: "done", startedAt, finishedAt: new Date().toISOString(), exitCode: 0, logTail: lastLog, mode });
  } catch (err) {
    await fail({ logTail: (err instanceof Error ? err.message : String(err)) + restoreNote() });
  }
}

const LOG_TAIL_MAX_CHARS = 4000;

function summarizeOutput(stdout: string, stderr: string): string {
  const parsed = parseClaudeJsonResult(stdout);
  return capChars(parsed ?? tailLines(`${stdout}\n${stderr}`, 40), LOG_TAIL_MAX_CHARS);
}

function parseClaudeJsonResult(stdout: string): string | null {
  try {
    const data = JSON.parse(stdout.trim());
    if (typeof data.result === "string") return data.result;
    if (typeof data.error === "string") return data.error;
  } catch {
    // stdout wasn't a single JSON object (or didn't have result/error) — fall back to the raw tail
  }
  return null;
}

function capChars(text: string, maxChars: number): string {
  return text.length > maxChars ? text.slice(text.length - maxChars) : text;
}

function tailLines(text: string, maxLines: number): string {
  const lines = text.split("\n");
  return lines.slice(Math.max(0, lines.length - maxLines)).join("\n").trim();
}
