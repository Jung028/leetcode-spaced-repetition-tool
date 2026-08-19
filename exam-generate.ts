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
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { COURSE_DIRS, findWeekFolder } from "./exam-sync";
import { scanWeekFolder } from "./scripts/generate-exam-week";
import { transcribeVideo, DEFAULT_MODEL as DEFAULT_WHISPER_MODEL } from "./scripts/transcribe-lecture";

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

// If the dev server restarts or the spawned `claude` process hangs without
// exiting, status.json can stay `{state: "running"}` forever. Treat a
// running status older than this as failed when *reading* it (don't
// rewrite the file — just present it as failed to callers) so a fresh
// generation naturally becomes possible again.
const RUNNING_STALE_MS = 60 * 60 * 1000;

function withStaleness(status: JobStatus): JobStatus {
  if (status.state !== "running" || !status.startedAt) return status;
  const age = Date.now() - new Date(status.startedAt).getTime();
  if (age <= RUNNING_STALE_MS) return status;
  return {
    ...status,
    state: "failed",
    finishedAt: status.finishedAt ?? new Date().toISOString(),
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

// Auto-approves file writes but pre-authorizes only the one Bash command
// the authoring workflow actually needs — deliberately narrower than
// --dangerously-skip-permissions, which Anthropic's own --help text calls
// "recommended only for sandboxes with no internet access."
export const ALLOWED_TOOLS = "Read Write Edit Glob Grep Bash(bun test*)";

export function buildGeneratePrompt(course: string, week: number, weekDir: string): string {
  const courseLower = course.toLowerCase();
  return `Author exam-content/${courseLower}/week-${week}.ts for the leetcode-srs project, following docs/exam-content-authoring-guide.md exactly.

Read the real material in "${weekDir}", including any "*.transcript.md" file — that's an auto-generated transcript of a lecture/tutorial recording (the video itself is transcribed automatically before this step and can't be opened directly, so the transcript is how its content reaches you). Per the authoring guide, use the transcript specifically to catch what the slides alone wouldn't — verbal asides, emphasis, examples worked through out loud, in-class questions — not just a prose re-read of the slide content. Read exam-content/${courseLower}/unit_outline.md and exam-content/${courseLower}/assessment_overview.md if they exist, for the unit's learning outcomes and final-exam format. Skim exam-content/${courseLower}/week-${week - 1}.ts if it exists, for continuity with the prior week.

Write two separate papers matching exam-content/types.ts's ExamPaperSeed/ExamQuestionSeed shape, exported together as WEEK_${week}_PAPERS: paperNumber 1 is a tutorial-only paper (questions written only from the week's tutorial material — worksheets, tutorial slides, in-class exercises), and paperNumber 2 is a lecture-only paper (questions written only from the week's lecture material). List the tutorial paper first — it's the one to practice first. Roughly 20-25 questions per paper. If this week genuinely has no separate tutorial material, a single lecture-only paperNumber-1 paper is fine. Then wire it into exam-content.ts: add the import and append it to the ALL_PAPERS array, exactly the way every prior week is already wired in there.

Finally, run \`bun test\` and fix any failures until the full suite passes with no failures — including fixing any existing test elsewhere in the repo that turns out to hardcode an assumption your new week's content invalidates (for example, a test assuming a specific course still has only one week of content).

You are running unattended in headless mode with no human present to ask questions — make reasonable, well-justified authoring judgment calls yourself rather than stopping to ask. When you are completely done, print one short summary line of what you wrote and confirm bun test passes.`;
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

export interface StartJobDeps {
  runClaude: RunClaude;
  root: string;
  transcribe?: TranscribeFn;
  whisperModel?: string;
}

export const defaultGenerateDeps: StartJobDeps = {
  runClaude: defaultRunClaude,
  root: DEFAULT_JOB_ROOT,
  transcribe: transcribeVideo,
  whisperModel: DEFAULT_WHISPER_MODEL,
};

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

const REPO_ROOT = import.meta.dir;

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
// edit the shared exam-content.ts file at once and corrupt it.
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
  // exam-content.ts file.
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
    await Bun.write(statusPath, JSON.stringify({ state: "running", startedAt } satisfies JobStatus));

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
): Promise<void> {
  try {
    // Any video in weekDir without a transcript yet gets one now, before
    // Claude ever runs — buildGeneratePrompt tells it to read
    // "*.transcript.md" files, which only exist once this step has run.
    await transcribeWeekVideos(weekDir, transcribe, whisperModel);
    const prompt = buildGeneratePrompt(course, week, weekDir);
    const args = buildClaudeArgs(prompt);
    const { stdout, stderr, exitCode } = await runClaude(args, REPO_ROOT);
    const status: JobStatus = {
      state: exitCode === 0 ? "done" : "failed",
      startedAt,
      finishedAt: new Date().toISOString(),
      exitCode,
      logTail: summarizeOutput(stdout, stderr),
    };
    await Bun.write(statusPath, JSON.stringify(status));
  } catch (err) {
    const status: JobStatus = {
      state: "failed",
      startedAt,
      finishedAt: new Date().toISOString(),
      logTail: err instanceof Error ? err.message : String(err),
    };
    await Bun.write(statusPath, JSON.stringify(status));
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
