import { test, expect, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
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
} from "./generate";
import { STAGES, buildStagePrompt, type StageContext } from "./pipeline";

const tempDirs: string[] = [];
function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "exam-generate-test-"));
  tempDirs.push(dir);
  return dir;
}
afterEach(() => {
  while (tempDirs.length) rmSync(tempDirs.pop()!, { recursive: true, force: true });
});

// A RunClaude that blocks until release() is called, then lets this stage and
// every later stage of the pipeline finish immediately (a job now makes one
// claude call per stage, so a single resolver would only free the first stage).
function makeStuckRunClaude(): { runClaude: RunClaude; release: () => void } {
  let released = false;
  const waiting: Array<() => void> = [];
  const done = { stdout: "", stderr: "", exitCode: 0 };
  return {
    runClaude: () => (released ? Promise.resolve(done) : new Promise((resolve) => waiting.push(() => resolve(done)))),
    release: () => {
      released = true;
      waiting.splice(0).forEach((fn) => fn());
    },
  };
}

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
  expect(prompt).toContain("exam/content.ts");
});

test("buildUpdatePrompt names the existing file, forbids reordering existing questions, and forbids touching exam/content.ts", () => {
  const prompt = buildUpdatePrompt("INFO5995", 3, "/fake/Desktop/INFO5995/Week 3");
  expect(prompt).toContain("exam-content/info5995/week-3.ts");
  expect(prompt).toContain("/fake/Desktop/INFO5995/Week 3");
  expect(prompt).toContain("ALREADY-AUTHORED");
  expect(prompt).toContain("never reorder, delete");
  expect(prompt).toContain("Do NOT touch exam/content.ts");
  expect(prompt).toContain("bun test");
});

test("buildUpdatePrompt does not assume every week has two papers, and forbids creating a new paperNumber", () => {
  const prompt = buildUpdatePrompt("INFO5995", 3, "/fake/Desktop/INFO5995/Week 3");
  expect(prompt).toContain("This week may have ONE existing paper or TWO — do not assume there are two.");
  expect(prompt).toContain("Never create a new paperNumber, under any circumstances");
});

test("buildClaudeArgs scopes permissions to Read/Write/Edit/Glob/Grep plus scoped Bash(bun test*, bun scripts/*, git diff*)", () => {
  expect(ALLOWED_TOOLS).toBe("Read Write Edit Glob Grep Bash(bun test*) Bash(bun scripts/*) Bash(git diff*)");
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
  const { runClaude: stuckRunClaude, release: resolveClaude } = makeStuckRunClaude();

  const first = await startGenerateJob("INFO5995", 6, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  expect(first.ok).toBe(true);

  const second = await startGenerateJob("INFO5995", 6, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  expect(second).toEqual({ ok: false, reason: "already generating" });

  resolveClaude();
  if (first.ok) await first.done;
});

test("startGenerateJob closes the dispatch-time race: two back-to-back calls without awaiting the first only start one job", async () => {
  const root = makeTempDir();
  const { runClaude: stuckRunClaude, release: resolveClaude } = makeStuckRunClaude();

  // Deliberately NOT awaited — both calls race before either has a chance
  // to write status.json. The in-memory lock must still let only one win.
  const firstPromise = startGenerateJob("INFO5995", 7, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  const secondPromise = startGenerateJob("INFO5995", 7, "/fake/week/dir", { runClaude: stuckRunClaude, root });

  const [first, second] = await Promise.all([firstPromise, secondPromise]);

  expect(first.ok).toBe(true);
  expect(second).toEqual({ ok: false, reason: "another generation is already running" });

  resolveClaude();
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
  const { runClaude: stuckRunClaude, release: resolveClaude } = makeStuckRunClaude();

  // Awaited, so the in-memory startingJobs guard is released by the time
  // this returns — only the disk-based scan (anyOtherJobRunning) is left to
  // catch a different course/week trying to start while this one runs.
  const first = await startGenerateJob("COMP5348", 2, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  expect(first.ok).toBe(true);

  const second = await startGenerateJob("INFO5990", 2, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  expect(second).toEqual({ ok: false, reason: "another generation is already running" });

  resolveClaude();
  if (first.ok) await first.done;
});

test("transcribeWeekVideos transcribes an untranscribed video and returns its transcript path", async () => {
  const weekDir = makeTempDir();
  writeFileSync(join(weekDir, "lecture.mp4"), "");
  const calls: Array<[string, string, string]> = [];
  const fakeTranscribe: TranscribeFn = async (input, model, outPath) => {
    calls.push([input, model, outPath]);
    writeFileSync(outPath, "# transcript");
  };

  const written = await transcribeWeekVideos(weekDir, fakeTranscribe, "fake-model.bin");

  expect(written).toEqual([join(weekDir, "lecture.transcript.md")]);
  expect(calls).toEqual([[join(weekDir, "lecture.mp4"), "fake-model.bin", join(weekDir, "lecture.transcript.md")]]);
  expect(existsSync(join(weekDir, "lecture.transcript.md"))).toBe(true);
});

test("transcribeWeekVideos skips a video that already has a transcript", async () => {
  const weekDir = makeTempDir();
  writeFileSync(join(weekDir, "lecture.mp4"), "");
  writeFileSync(join(weekDir, "lecture.transcript.md"), "# already done");
  const fakeTranscribe: TranscribeFn = async () => {
    throw new Error("should not be called");
  };

  const written = await transcribeWeekVideos(weekDir, fakeTranscribe, "fake-model.bin");

  expect(written).toEqual([]);
});

test("transcribeWeekVideos does nothing for a week with no videos", async () => {
  const weekDir = makeTempDir();
  writeFileSync(join(weekDir, "slides.pdf"), "");
  const fakeTranscribe: TranscribeFn = async () => {
    throw new Error("should not be called");
  };

  expect(await transcribeWeekVideos(weekDir, fakeTranscribe, "fake-model.bin")).toEqual([]);
});

test("transcribeWeekVideos returns empty for a week dir that doesn't exist, rather than throwing", async () => {
  const fakeTranscribe: TranscribeFn = async () => {
    throw new Error("should not be called");
  };
  expect(await transcribeWeekVideos("/does/not/exist", fakeTranscribe, "fake-model.bin")).toEqual([]);
});

test("startGenerateJob transcribes a week's video before invoking runClaude", async () => {
  const root = makeTempDir();
  const weekDir = makeTempDir();
  writeFileSync(join(weekDir, "lecture.mp4"), "");

  let transcribedBeforeClaudeRan = false;
  const fakeTranscribe: TranscribeFn = async (_input, _model, outPath) => {
    writeFileSync(outPath, "# transcript");
  };
  const fakeRunClaude: RunClaude = async () => {
    transcribedBeforeClaudeRan = existsSync(join(weekDir, "lecture.transcript.md"));
    return { stdout: "did the thing", stderr: "", exitCode: 0 };
  };

  const result = await startGenerateJob("INFO5995", 20, weekDir, {
    runClaude: fakeRunClaude,
    root,
    transcribe: fakeTranscribe,
    whisperModel: "fake-model.bin",
  });
  if (result.ok) await result.done;

  expect(transcribedBeforeClaudeRan).toBe(true);
});

test("startGenerateJob marks the job failed when transcription itself fails", async () => {
  const root = makeTempDir();
  const weekDir = makeTempDir();
  writeFileSync(join(weekDir, "lecture.mp4"), "");

  const failingTranscribe: TranscribeFn = async () => {
    throw new Error("whisper-cli not found on PATH");
  };
  let claudeRan = false;
  const fakeRunClaude: RunClaude = async () => {
    claudeRan = true;
    return { stdout: "", stderr: "", exitCode: 0 };
  };

  const result = await startGenerateJob("INFO5995", 21, weekDir, {
    runClaude: fakeRunClaude,
    root,
    transcribe: failingTranscribe,
    whisperModel: "fake-model.bin",
  });
  if (result.ok) await result.done;

  expect(claudeRan).toBe(false);
  const status = await readJobStatus("INFO5995", 21, root);
  expect(status.state).toBe("failed");
  expect(status.logTail).toContain("whisper-cli not found on PATH");
});

test("startGenerateJob's global in-memory lock blocks a different week's job fired concurrently before either writes status.json", async () => {
  const root = makeTempDir();
  const { runClaude: stuckRunClaude, release: resolveClaude } = makeStuckRunClaude();

  // Deliberately NOT awaited, and deliberately *different* course/week keys —
  // the global lock must block a second week's job just as it would the
  // same week's, since every job edits the same shared exam-content.ts.
  const firstPromise = startGenerateJob("COMP5348", 3, "/fake/week/dir", { runClaude: stuckRunClaude, root });
  const secondPromise = startGenerateJob("INFO5995", 3, "/fake/week/dir", { runClaude: stuckRunClaude, root });

  const [first, second] = await Promise.all([firstPromise, secondPromise]);

  expect(first.ok).toBe(true);
  expect(second).toEqual({ ok: false, reason: "another generation is already running" });

  resolveClaude();
  if (first.ok) await first.done;
});

test("startGenerateJob passes the update prompt to runClaude when deps.mode is 'update'", async () => {
  const root = makeTempDir();
  const prompts: string[] = [];
  const fakeRunClaude: RunClaude = async (args) => {
    prompts.push(args.at(-1) ?? "");
    return { stdout: "enriched", stderr: "", exitCode: 0 };
  };

  const result = await startGenerateJob("INFO5995", 30, "/fake/week/dir", {
    runClaude: fakeRunClaude,
    root,
    mode: "update",
  });
  if (result.ok) await result.done;

  expect(prompts.some((p) => p.includes("ALREADY-AUTHORED"))).toBe(true);
});

test("startGenerateJob defaults to the generate prompt when deps.mode is omitted", async () => {
  const root = makeTempDir();
  const prompts: string[] = [];
  const fakeRunClaude: RunClaude = async (args) => {
    prompts.push(args.at(-1) ?? "");
    return { stdout: "wrote it", stderr: "", exitCode: 0 };
  };

  const result = await startGenerateJob("INFO5995", 31, "/fake/week/dir", { runClaude: fakeRunClaude, root });
  if (result.ok) await result.done;

  expect(prompts.some((p) => p.includes("Author exam-content"))).toBe(true);
});

test("buildGeneratePrompt asks for about 50 questions per lecture paper, not the old 20-25", () => {
  const prompt = buildGeneratePrompt("INFO5995", 3, "/fake/week/dir");
  expect(prompt).toContain("About 50 questions per lecture paper");
  expect(prompt).not.toContain("20-25");
});

test("ALLOWED_TOOLS covers every bun/git command the stage prompts tell the agent to run", () => {
  // Bash(<prefix>*) patterns from the allowlist, as literal prefixes.
  const prefixes = [...ALLOWED_TOOLS.matchAll(/Bash\(([^)]*?)\*\)/g)].map((m) => m[1]!);
  const covered = (cmd: string) => prefixes.some((p) => cmd.startsWith(p));
  for (const mode of ["generate", "update"] as const) {
    const ctx: StageContext = { course: "INFO5995", week: 3, weekDir: "/fake/week/dir", mode };
    const base = mode === "update" ? buildUpdatePrompt("INFO5995", 3, "/fake/week/dir") : buildGeneratePrompt("INFO5995", 3, "/fake/week/dir");
    for (const stage of STAGES) {
      const prompt = buildStagePrompt(stage, ctx, base);
      // Commands are quoted ("bun ...") or backticked (`bun test`) in the prompts.
      const cmds = [...prompt.matchAll(/["`]((?:bun|git) [^"`]*)["`]/g)].map((m) => m[1]!);
      for (const cmd of cmds) expect({ stage, mode, cmd, covered: covered(cmd) }).toEqual({ stage, mode, cmd, covered: true });
    }
  }
  // Sanity: the checks above are not vacuous.
  const checker = buildStagePrompt("check", { course: "INFO5995", week: 3, weekDir: "/w", mode: "update" });
  expect(checker).toContain('"git diff"');
  expect(checker).toContain("bun scripts/check-mcq-lengths.ts");
});

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
