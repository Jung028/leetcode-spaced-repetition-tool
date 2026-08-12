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
  startGenerateJob,
  type RunClaude,
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
  const startedAt = new Date().toISOString();
  writeFileSync(join(dir, "status.json"), JSON.stringify({ state: "running", startedAt }));
  expect(await readJobStatus("INFO5995", 2, root)).toEqual({
    state: "running",
    startedAt,
  });
});

test("readJobStatus downgrades a running status older than 1 hour to failed", async () => {
  const root = makeTempDir();
  const dir = join(root, "INFO5995-9");
  mkdirSync(dir, { recursive: true });
  const startedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  writeFileSync(join(dir, "status.json"), JSON.stringify({ state: "running", startedAt }));
  const status = await readJobStatus("INFO5995", 9, root);
  expect(status.state).toBe("failed");
  expect(status.logTail).toContain("Timed out");
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

test("buildClaudeArgs scopes permissions to Read/Write/Edit/Glob/Grep/Bash(bun test*)", () => {
  expect(ALLOWED_TOOLS).toBe("Read Write Edit Glob Grep Bash(bun test*)");
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

test("startGenerateJob closes the dispatch-time race: two back-to-back calls without awaiting the first only start one job", async () => {
  const root = makeTempDir();
  let resolveClaude: (() => void) | undefined;
  const stuckRunClaude: RunClaude = () =>
    new Promise((resolve) => {
      resolveClaude = () => resolve({ stdout: "", stderr: "", exitCode: 0 });
    });

  // Deliberately NOT awaited — both calls race before either has a chance
  // to write status.json. The in-memory lock must still let only one win.
  const firstPromise = startGenerateJob("INFO5995", 7, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  const secondPromise = startGenerateJob("INFO5995", 7, "/fake/week/dir", { runClaude: stuckRunClaude, root });

  const [first, second] = await Promise.all([firstPromise, secondPromise]);

  expect(first.ok).toBe(true);
  expect(second).toEqual({ ok: false, reason: "another generation is already running" });

  resolveClaude?.();
  if (first.ok) await first.done;
});

test("startGenerateJob prefers the parsed JSON result field over the raw stdout envelope", async () => {
  const root = makeTempDir();
  const fakeRunClaude: RunClaude = async () => ({
    stdout: JSON.stringify({ result: "wrote 42 questions" }),
    stderr: "",
    exitCode: 0,
  });

  const result = await startGenerateJob("INFO5995", 10, "/fake/week/dir", { runClaude: fakeRunClaude, root });
  if (result.ok) await result.done;

  const status = await readJobStatus("INFO5995", 10, root);
  expect(status.logTail).toBe("wrote 42 questions");
});

test("startGenerateJob caps a non-JSON logTail to 4000 characters", async () => {
  const root = makeTempDir();
  const fakeRunClaude: RunClaude = async () => ({
    stdout: "x".repeat(5000),
    stderr: "",
    exitCode: 1,
  });

  const result = await startGenerateJob("INFO5995", 11, "/fake/week/dir", { runClaude: fakeRunClaude, root });
  if (result.ok) await result.done;

  const status = await readJobStatus("INFO5995", 11, root);
  expect(status.logTail!.length).toBeLessThanOrEqual(4000);
});

test("startGenerateJob marks the job failed when runClaude rejects instead of resolving", async () => {
  const root = makeTempDir();
  const throwingRunClaude: RunClaude = async () => {
    throw new Error("claude binary not found on PATH");
  };

  const result = await startGenerateJob("INFO5995", 8, "/fake/week/dir", { runClaude: throwingRunClaude, root });
  expect(result.ok).toBe(true);
  if (result.ok) await result.done;

  const status = await readJobStatus("INFO5995", 8, root);
  expect(status.state).toBe("failed");
  expect(status.logTail).toContain("claude binary not found on PATH");
  expect(status.finishedAt).toBeTruthy();
});

test("startGenerateJob's global lock blocks a different week's job (not just the same week) while one is already running on disk", async () => {
  const root = makeTempDir();
  let resolveClaude: (() => void) | undefined;
  const stuckRunClaude: RunClaude = () =>
    new Promise((resolve) => {
      resolveClaude = () => resolve({ stdout: "", stderr: "", exitCode: 0 });
    });

  // Awaited, so the in-memory startingJobs guard is released by the time
  // this returns — only the disk-based scan (anyOtherJobRunning) is left to
  // catch a different course/week trying to start while this one runs.
  const first = await startGenerateJob("COMP5348", 2, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  expect(first.ok).toBe(true);

  const second = await startGenerateJob("INFO5990", 2, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  expect(second).toEqual({ ok: false, reason: "another generation is already running" });

  resolveClaude?.();
  if (first.ok) await first.done;
});

test("startGenerateJob's global in-memory lock blocks a different week's job fired concurrently before either writes status.json", async () => {
  const root = makeTempDir();
  let resolveClaude: (() => void) | undefined;
  const stuckRunClaude: RunClaude = () =>
    new Promise((resolve) => {
      resolveClaude = () => resolve({ stdout: "", stderr: "", exitCode: 0 });
    });

  // Deliberately NOT awaited, and deliberately *different* course/week keys —
  // the global lock must block a second week's job just as it would the
  // same week's, since every job edits the same shared exam-content.ts.
  const firstPromise = startGenerateJob("COMP5348", 3, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  const secondPromise = startGenerateJob("INFO5995", 3, "/fake/week/dir", { runClaude: stuckRunClaude, root });

  const [first, second] = await Promise.all([firstPromise, secondPromise]);

  expect(first.ok).toBe(true);
  expect(second).toEqual({ ok: false, reason: "another generation is already running" });

  resolveClaude?.();
  if (first.ok) await first.done;
});
