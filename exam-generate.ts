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
