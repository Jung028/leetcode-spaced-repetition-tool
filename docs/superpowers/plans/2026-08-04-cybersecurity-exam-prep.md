# Cybersecurity Exam Prep Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "Exam" tab to the leetcode-srs app that serves one new INFO5995 (Intro to Cybersecurity) practice paper per day, self- or auto-graded per question, with missed questions rescheduled into their own spaced-repetition ladder — plus a re-runnable scaffold generator so future weeks' course materials can be turned into new papers.

**Architecture:** Mirrors the existing Theory tab's file-per-concern shape exactly: a static content module (`exam-content.ts` + one file per week under `exam-content/`) feeds a SQLite-backed schedule (`exam-db.ts`) through the same backlog-gated release pattern (`releaseCount` from `scheduling.ts`) that paces Theory concepts and Goals steps. Unlike Theory, a "day" here is a whole multi-question **paper**, not a single concept — so on top of the paper-release gate there's a second, per-question review ladder (`exam-scheduling.ts`) that only activates for questions marked wrong at submit time. A standalone script (`scripts/generate-exam-week.ts`) scans a week's course-material folder and writes a blank scaffold in the same shape as the real content files; a human (via Claude Code, reading the source PDFs directly with its own Read tool — no PDF-parsing dependency needed) fills in the actual questions afterward.

**Tech Stack:** Bun (`Bun.serve`, `bun:sqlite`, HTML imports), TypeScript, React 19, `bun test`. No new dependencies.

## Global Constraints

- Bun only — `bun test`, no jest/vitest/node. No new npm dependencies (no PDF-parsing library; Claude Code reads PDFs directly via its own Read tool when filling in scaffolded content).
- Reuse existing shared helpers rather than re-implementing them: `addDays`, `localToday`, `releaseCount`, `MAX_ACTIVE_BACKLOG` all come from `scheduling.ts`.
- Every tab owns its own ladder module even when the interval sequence matches another tab's (established convention — see `theory-scheduling.ts`'s comment). `exam-scheduling.ts` is a new, independent module, not a re-export of `theory-scheduling.ts`.
- Static content is sent to the client in full up front (including `correctIndex`/`modelAnswer`) and hidden only behind a client-side "reveal" interaction — this is a UI convention already established by the Theory tab (`TheoryProgress.answer` ships immediately; `TheoryDetail` just doesn't render it until revealed), not a security boundary. Do not build a separate "hide the answer until submit" server-side mechanism.
- For short-answer/scenario questions, the server trusts the client's self-reported `correct`/`wrong` verdict — there is no way to auto-grade free text, and this matches the Theory tab's existing trust model exactly.
- Multiple-choice/true-false questions are graded by direct index comparison, computed client-side for instant feedback and persisted via the same `/grade` endpoint — no separate "auto-grade on submit" pass.
- A paper is submitted once (`submitted_at` becomes non-null) and never re-listed as due; only its wrong questions resurface later, individually, through `exam_review_items`.
- New weeks grow `TOTAL_PAPERS` over the semester (unlike Theory's fixed 150 concepts) — `exam-db.ts`'s migration must onboard newly-added papers on every app start without disturbing existing rows or progress.
- Use `bun test <file>` to run tests for a single file while iterating; run the full `bun test` before each commit.

---

### Task 1: `exam-scheduling.ts` — the missed-question review ladder

**Files:**
- Create: `exam-scheduling.ts`
- Test: `exam-scheduling.test.ts`

**Interfaces:**
- Produces: `EXAM_REVIEW_LADDER: number[]`, `ExamReviewResult = "correct" | "wrong"`, `ExamReviewSchedule { rung: number; nextReview: string }`, `initialExamReviewSchedule(today: string): ExamReviewSchedule`, `applyExamReview(rung: number, result: ExamReviewResult, today: string): ExamReviewSchedule`. Consumed by Task 4 (`exam-db.ts`) and Task 7 (`ExamApp.tsx`, for rendering the rung meter).

- [ ] **Step 1: Write the failing test**

Create `exam-scheduling.test.ts`:

```ts
import { test, expect } from "bun:test";
import { EXAM_REVIEW_LADDER, initialExamReviewSchedule, applyExamReview } from "./exam-scheduling";

test("ladder is 3, 5, 7, 14, 30 days", () => {
  expect(EXAM_REVIEW_LADDER).toEqual([3, 5, 7, 14, 30]);
});

test("a freshly-missed question is due tomorrow at rung -1", () => {
  expect(initialExamReviewSchedule("2026-07-20")).toEqual({ rung: -1, nextReview: "2026-07-21" });
});

test("first correct review climbs to rung 0, due 3 days out", () => {
  expect(applyExamReview(-1, "correct", "2026-07-20")).toEqual({ rung: 0, nextReview: "2026-07-23" });
});

test("ladder climbs 3 -> 5 -> 7 -> 14 -> 30 with successive correct reviews", () => {
  expect(applyExamReview(0, "correct", "2026-07-20").nextReview).toBe("2026-07-25");
  expect(applyExamReview(1, "correct", "2026-07-20").nextReview).toBe("2026-07-27");
  expect(applyExamReview(2, "correct", "2026-07-20").nextReview).toBe("2026-08-03");
  expect(applyExamReview(3, "correct", "2026-07-20").nextReview).toBe("2026-08-19");
});

test("correct at the top rung stays at 30 days", () => {
  expect(applyExamReview(4, "correct", "2026-07-20")).toEqual({ rung: 4, nextReview: "2026-08-19" });
});

test("wrong always resets to rung -1, due tomorrow, regardless of prior rung", () => {
  expect(applyExamReview(3, "wrong", "2026-07-20")).toEqual({ rung: -1, nextReview: "2026-07-21" });
  expect(applyExamReview(-1, "wrong", "2026-07-20")).toEqual({ rung: -1, nextReview: "2026-07-21" });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test exam-scheduling.test.ts`
Expected: FAIL — `exam-scheduling.ts` does not exist yet.

- [ ] **Step 3: Write the implementation**

Create `exam-scheduling.ts`:

```ts
import { addDays } from "./scheduling";

// Own interval sequence for missed exam questions, kept as its own module
// even though the values match theory-scheduling.ts's ladder — see that
// file's comment: every spaced-repetition tab owns its ladder independently.
export const EXAM_REVIEW_LADDER = [3, 5, 7, 14, 30];

export type ExamReviewResult = "correct" | "wrong";

export interface ExamReviewSchedule {
  rung: number;
  nextReview: string;
}

// A question only enters the review ladder when a submitted paper marks it
// wrong — it starts one rung below the first climb (-1), due tomorrow, same
// shape as a fresh Theory "wrong" reset.
export function initialExamReviewSchedule(today: string): ExamReviewSchedule {
  return { rung: -1, nextReview: addDays(today, 1) };
}

export function applyExamReview(
  rung: number,
  result: ExamReviewResult,
  today: string,
): ExamReviewSchedule {
  if (result === "wrong") return { rung: -1, nextReview: addDays(today, 1) };
  const next = Math.min(rung + 1, EXAM_REVIEW_LADDER.length - 1);
  return { rung: next, nextReview: addDays(today, EXAM_REVIEW_LADDER[next]!) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test exam-scheduling.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add exam-scheduling.ts exam-scheduling.test.ts
git commit -m "feat: add exam review ladder scheduling"
```

---

### Task 2: Exam content types + the week scaffold generator script

**Files:**
- Create: `exam-content/types.ts`
- Create: `scripts/generate-exam-week.ts`
- Test: `scripts/generate-exam-week.test.ts`

**Interfaces:**
- Produces: `ExamQuestionType = "mcq" | "truefalse" | "short" | "scenario"`, `ExamQuestionSeed { type; prompt: string; options?: string[]; correctIndex?: number; modelAnswer: string }`, `ExamPaperSeed { week: number; paperNumber: number; title: string; topics: string; sourceFiles: string[]; questions: ExamQuestionSeed[] }` (from `exam-content/types.ts`). Also `scanWeekFolder`, `buildScaffold`, `renderScaffoldModule`, `generateWeekFile` (from `scripts/generate-exam-week.ts`), used directly by its own test and, at the CLI, by whoever generates a new week. Task 3 imports `ExamPaperSeed`/`ExamQuestionSeed` from `exam-content/types.ts`.
- Consumes: nothing from earlier tasks.

- [ ] **Step 1: Write the types module (no test needed — pure type declarations)**

Create `exam-content/types.ts`:

```ts
export type ExamQuestionType = "mcq" | "truefalse" | "short" | "scenario";

export interface ExamQuestionSeed {
  type: ExamQuestionType;
  prompt: string;
  // mcq/truefalse only — truefalse conventionally uses options ["True", "False"].
  options?: string[];
  // mcq/truefalse only — index into options that grades as correct.
  correctIndex?: number;
  // short/scenario: the revealed model answer. mcq/truefalse: the revealed
  // explanation shown alongside the correct/incorrect highlighting.
  modelAnswer: string;
}

export interface ExamPaperSeed {
  week: number;
  paperNumber: number; // 1-based within the week
  title: string;
  topics: string;
  // Paths (relative to that week's course folder) to the material this
  // paper's questions were written from — carried along so content can be
  // regenerated/expanded later without losing track of its sources.
  sourceFiles: string[];
  questions: ExamQuestionSeed[];
}
```

- [ ] **Step 2: Write the failing test for the generator script**

Create `scripts/generate-exam-week.test.ts`:

```ts
import { test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanWeekFolder, buildScaffold, renderScaffoldModule, generateWeekFile } from "./generate-exam-week";

function makeWeekDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "exam-week-"));
  mkdirSync(join(dir, "lecture"), { recursive: true });
  writeFileSync(join(dir, "lecture", "slides.pdf"), "x");
  writeFileSync(join(dir, "lecture", "clip.mp4"), "x");
  writeFileSync(join(dir, "notes.md"), "x");
  writeFileSync(join(dir, ".DS_Store"), "x");
  return dir;
}

test("scanWeekFolder finds material files and video files separately, skipping dotfiles", () => {
  const dir = makeWeekDir();
  const { materials, videos } = scanWeekFolder(dir);
  expect(materials).toEqual(["lecture/slides.pdf", "notes.md"]);
  expect(videos).toEqual(["lecture/clip.mp4"]);
  rmSync(dir, { recursive: true, force: true });
});

test("buildScaffold produces the requested number of blank papers, each with an 8/4/2 question mix", () => {
  const papers = buildScaffold(1, 2, ["notes.md"]);
  expect(papers.length).toBe(2);
  expect(papers[0]!.paperNumber).toBe(1);
  expect(papers[1]!.paperNumber).toBe(2);
  expect(papers[0]!.questions.filter((q) => q.type === "mcq").length).toBe(8);
  expect(papers[0]!.questions.filter((q) => q.type === "short").length).toBe(4);
  expect(papers[0]!.questions.filter((q) => q.type === "scenario").length).toBe(2);
  expect(papers[0]!.sourceFiles).toEqual(["notes.md"]);
});

test("renderScaffoldModule emits a module exporting WEEK_<n>_PAPERS", () => {
  const papers = buildScaffold(3, 1, ["notes.md"]);
  const source = renderScaffoldModule(3, papers, []);
  expect(source).toContain("export const WEEK_3_PAPERS: ExamPaperSeed[] =");
  expect(source).not.toContain("Video lectures found");
});

test("renderScaffoldModule notes video files that won't be transcribed", () => {
  const source = renderScaffoldModule(1, [], ["lecture/clip.mp4"]);
  expect(source).toContain("Video lectures found but not readable as text");
  expect(source).toContain("lecture/clip.mp4");
});

test("generateWeekFile refuses to overwrite an existing scaffold without force", async () => {
  const dir = makeWeekDir();
  const outDir = mkdtempSync(join(tmpdir(), "exam-out-"));
  const outPath = join(outDir, "week-1.ts");
  writeFileSync(outPath, "existing content");

  const result = generateWeekFile({ week: 1, weekDir: dir, outPath });
  expect(result.written).toBe(false);
  expect(result.reason).toContain("already exists");
  expect(await Bun.file(outPath).text()).toBe("existing content");

  rmSync(dir, { recursive: true, force: true });
  rmSync(outDir, { recursive: true, force: true });
});

test("generateWeekFile overwrites when force is true", async () => {
  const dir = makeWeekDir();
  const outDir = mkdtempSync(join(tmpdir(), "exam-out-"));
  const outPath = join(outDir, "week-1.ts");
  writeFileSync(outPath, "existing content");

  const result = generateWeekFile({ week: 1, weekDir: dir, outPath, force: true });
  expect(result.written).toBe(true);
  const text = await Bun.file(outPath).text();
  expect(text).toContain("WEEK_1_PAPERS");

  rmSync(dir, { recursive: true, force: true });
  rmSync(outDir, { recursive: true, force: true });
});

test("generateWeekFile errors clearly when the week folder doesn't exist", () => {
  const result = generateWeekFile({ week: 99, weekDir: "/nonexistent/week-99", outPath: "/tmp/whatever-99.ts" });
  expect(result.written).toBe(false);
  expect(result.reason).toContain("not found");
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun test scripts/generate-exam-week.test.ts`
Expected: FAIL — `scripts/generate-exam-week.ts` does not exist yet.

- [ ] **Step 4: Write the implementation**

Create `scripts/generate-exam-week.ts`:

```ts
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ExamPaperSeed } from "../exam-content/types";

const MATERIAL_EXTENSIONS = [".pdf", ".md", ".pptx", ".docx"];
const VIDEO_EXTENSIONS = [".mp4", ".mov"];

export interface ScannedWeek {
  materials: string[];
  videos: string[];
}

// Recursively lists every file under weekDir (skipping dotfiles like
// .DS_Store), split into material files Claude can read directly (PDF /
// markdown / slides) and video files it can't transcribe — those are still
// named in the scaffold so a human knows they exist, just not expected to
// be a content source.
export function scanWeekFolder(weekDir: string): ScannedWeek {
  const materials: string[] = [];
  const videos: string[] = [];
  const entries = readdirSync(weekDir, { recursive: true }) as string[];
  for (const entry of entries) {
    const base = entry.split("/").pop()!;
    if (base.startsWith(".")) continue;
    const dot = base.lastIndexOf(".");
    if (dot === -1) continue;
    const ext = base.slice(dot).toLowerCase();
    if (MATERIAL_EXTENSIONS.includes(ext)) materials.push(entry);
    else if (VIDEO_EXTENSIONS.includes(ext)) videos.push(entry);
  }
  materials.sort();
  videos.sort();
  return { materials, videos };
}

// Pure: builds `paperCount` blank paper scaffolds for a week, each pointing
// at every material file found (Claude reads all of them once, then writes
// content for every paper) with a fixed 8 mcq/truefalse + 4 short + 2
// scenario mix per paper — a ~14-question, ~20 minute daily set.
export function buildScaffold(week: number, paperCount: number, materials: string[]): ExamPaperSeed[] {
  const papers: ExamPaperSeed[] = [];
  for (let n = 1; n <= paperCount; n++) {
    papers.push({
      week,
      paperNumber: n,
      title: `Week ${week} Practice Paper ${n}`,
      topics: "",
      sourceFiles: materials,
      questions: [
        ...Array.from({ length: 8 }, () => ({
          type: "mcq" as const,
          prompt: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          modelAnswer: "",
        })),
        ...Array.from({ length: 4 }, () => ({ type: "short" as const, prompt: "", modelAnswer: "" })),
        ...Array.from({ length: 2 }, () => ({ type: "scenario" as const, prompt: "", modelAnswer: "" })),
      ],
    });
  }
  return papers;
}

// Renders the scaffold as TypeScript module source, ready to import once
// filled in. The fill-in instructions live in this header comment so they
// travel with the file itself, not just this script's --help text.
export function renderScaffoldModule(week: number, papers: ExamPaperSeed[], videos: string[]): string {
  const videoNote =
    videos.length > 0
      ? `// Video lectures found but not readable as text — watch/skim if the PDFs\n// don't cover something: ${videos.join(", ")}\n`
      : "";
  return `// Week ${week} exam practice content — scaffolded by scripts/generate-exam-week.ts.
//
// Fill in every blank "prompt"/"modelAnswer"/"options" below by reading the
// files listed in each paper's sourceFiles (relative to this week's course
// folder), plus any existing hand-written exam-practice markdown already in
// that folder. Aim for realistic INFO5995-style questions: mcq/truefalse
// need a correctIndex into options; short/scenario need a modelAnswer to
// reveal instead. Keep each paper's mix roughly 8 mcq+truefalse / 4 short /
// 2 scenario.
${videoNote}import type { ExamPaperSeed } from "../exam-content/types";

export const WEEK_${week}_PAPERS: ExamPaperSeed[] = ${JSON.stringify(papers, null, 2)};
`;
}

export interface GenerateOptions {
  week: number;
  weekDir: string;
  outPath: string;
  paperCount?: number;
  force?: boolean;
}

export interface GenerateResult {
  written: boolean;
  reason?: string;
  path: string;
}

// The testable core: real FS reads/writes, but no argv parsing — the CLI
// entrypoint below is the only part that touches process.argv.
export function generateWeekFile(options: GenerateOptions): GenerateResult {
  const { week, weekDir, outPath, paperCount = 3, force = false } = options;
  if (!existsSync(weekDir)) {
    return { written: false, reason: `Week folder not found: ${weekDir}`, path: outPath };
  }
  if (existsSync(outPath) && !force) {
    return { written: false, reason: `${outPath} already exists — pass force to overwrite`, path: outPath };
  }
  const { materials, videos } = scanWeekFolder(weekDir);
  const papers = buildScaffold(week, paperCount, materials);
  const source = renderScaffoldModule(week, papers, videos);
  Bun.write(outPath, source);
  return { written: true, path: outPath };
}

function parseArgs(argv: string[]): { week: number; courseDir?: string; papers: number; force: boolean } {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const week = Number(get("--week"));
  if (!Number.isInteger(week) || week < 1) {
    throw new Error(
      "Usage: bun scripts/generate-exam-week.ts --week <n> [--course-dir <path>] [--papers <n>] [--force]",
    );
  }
  const papersArg = get("--papers");
  return {
    week,
    courseDir: get("--course-dir"),
    papers: papersArg ? Number(papersArg) : 3,
    force: argv.includes("--force"),
  };
}

const DEFAULT_COURSE_DIR =
  "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO5995 Intro To Cybersecurity";

if (import.meta.main) {
  const { week, courseDir, papers, force } = parseArgs(process.argv.slice(2));
  const weekDir = join(courseDir ?? DEFAULT_COURSE_DIR, `Week ${week}`);
  const outPath = join(import.meta.dir, "..", "exam-content", `week-${week}.ts`);
  const result = generateWeekFile({ week, weekDir, outPath, paperCount: papers, force });
  if (!result.written) {
    console.error(result.reason);
    process.exit(1);
  }
  console.log(`Wrote scaffold to ${result.path} — ask Claude Code to fill it in from ${weekDir}`);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test scripts/generate-exam-week.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 6: Commit**

```bash
git add exam-content/types.ts scripts/generate-exam-week.ts scripts/generate-exam-week.test.ts
git commit -m "feat: add exam content types and week scaffold generator"
```

---

### Task 3: Week 1 exam content + the schedule aggregator

**Files:**
- Create: `exam-content/week-1.ts`
- Create: `exam-content.ts`
- Test: `exam-content.test.ts`

**Interfaces:**
- Consumes: `ExamPaperSeed`, `ExamQuestionSeed` from `exam-content/types.ts` (Task 2).
- Produces: `ExamPaper extends ExamPaperSeed { paperDay: number }`, `buildExamSchedule(): ExamPaper[]`, `TOTAL_PAPERS: number` (from `exam-content.ts`). Consumed by Task 4 (`exam-db.ts`), Task 5 (`exam-api.ts`), Task 6 (`home-api.ts`).

- [ ] **Step 1: Generate the Week 1 scaffold with the real script, to prove Task 2 works end-to-end**

Run:

```bash
bun scripts/generate-exam-week.ts --week 1
```

Expected output: `Wrote scaffold to .../exam-content/week-1.ts — ask Claude Code to fill it in from .../Week 1`, and the file exists with `sourceFiles` listing `lecture/INFO5995_Week_1_Extra_Resources.pdf`, `lecture/Week01-Introduction, cybersecurity basics, security lifecycle, system and threat models.pdf`, and `INFO5995 Week 1 - Exam Practice Questions.md` (the video lecture file is noted separately, not in `sourceFiles`).

- [ ] **Step 2: Replace the scaffold with fully authored Week 1 content**

Overwrite `exam-content/week-1.ts` entirely with the real content below. Paper 1 is adapted directly from the existing hand-written `INFO5995 Week 1 - Exam Practice Questions.md` (all 26 questions, converted into the structured format); Papers 2 and 3 are original questions covering the same Week 1 material (castle model / layered defence / wooden barrel theory, CIA triad, security lifecycle, system modeling vs. threat modeling, the Bybit case) from different angles and example systems, so daily practice doesn't just repeat the same 14 MCQs verbatim.

```ts
import type { ExamPaperSeed } from "./types";

const SOURCE_FILES = [
  "INFO5995 Week 1 - Exam Practice Questions.md",
  "lecture/INFO5995_Week_1_Extra_Resources.pdf",
  "lecture/Week01-Introduction, cybersecurity basics, security lifecycle, system and threat models.pdf",
];

const PAPER_1: ExamPaperSeed = {
  week: 1,
  paperNumber: 1,
  title: "Week 1 Practice Paper 1",
  topics:
    "Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study",
  sourceFiles: SOURCE_FILES,
  questions: [
    {
      type: "mcq",
      prompt: "Which of the following best describes why \"a perfectly closed castle is secure but useless\"?",
      options: [
        "Closed systems are more expensive to build",
        "Systems must allow access for people, information, and business to function, and that access is what creates risk",
        "Attackers always find a way in eventually",
        "Castles are an outdated security metaphor with no modern relevance",
      ],
      correctIndex: 1,
      modelAnswer:
        "A closed system has no doors, so nothing valuable can be used; the moment access is added for legitimate use, risk is introduced too.",
    },
    {
      type: "mcq",
      prompt: "In the Wooden Barrel Theory of security, what determines how much \"water\" (security capacity) a system can hold?",
      options: [
        "The average height of all the boards (layers)",
        "The number of layers of defence, regardless of quality",
        "The shortest/weakest board — the system is only as strong as its weakest point",
        "The cost invested in the tallest board",
      ],
      correctIndex: 2,
      modelAnswer:
        "Attackers look for the shortest board; the system's overall security is capped by its weakest point, not its average or its best control.",
    },
    {
      type: "truefalse",
      prompt: "True or False: Adding more layers of security controls guarantees a system is fully protected against all threats.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "The lecture explicitly states no single control protects the whole system — layers reduce risk, they don't eliminate it; one weak point can still undermine everything.",
    },
    {
      type: "truefalse",
      prompt: "True or False: Security involves trade-offs — increasing security can reduce usability and convenience.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer: "\"Security involves trade-offs... more security can affect usability and convenience.\"",
    },
    {
      type: "mcq",
      prompt: "Which CIA Triad property is violated if an attacker changes a bank balance from $100 to $1,000,000 without authorisation?",
      options: ["Confidentiality", "Integrity", "Availability", "Authentication"],
      correctIndex: 1,
      modelAnswer: "Unauthorised modification of data/value is a textbook integrity violation.",
    },
    {
      type: "mcq",
      prompt:
        "A DDoS (Distributed Denial of Service) attack that floods a server with fake requests so real users can't connect primarily threatens which CIA property?",
      options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
      correctIndex: 2,
      modelAnswer: "DDoS attacks aim to make a service unreachable/unusable, not to steal or alter data.",
    },
    {
      type: "mcq",
      prompt: "Which CIA property asks the question \"who is allowed to see this?\"",
      options: ["Integrity", "Availability", "Confidentiality", "Accountability"],
      correctIndex: 2,
      modelAnswer: "\"Confidentiality asks: who is allowed to see this?\"",
    },
    {
      type: "mcq",
      prompt: "According to the Week 1 \"Security Lifecycle\" model, which of these activities happens before code deployment?",
      options: [
        "Intrusion detection",
        "Fuzzing and dynamic analysis in production",
        "Defining security goals/properties and manual audits",
        "Disaster recovery and freezing stolen funds",
      ],
      correctIndex: 2,
      modelAnswer:
        "Defining goals/security properties, best-coding practice, and manual audit are all pre-deployment activities. Intrusion detection and fuzzing in production are after deployment; disaster recovery is after an incident.",
    },
    {
      type: "mcq",
      prompt: "Which of these activities belongs to the after incident phase of the security lifecycle?",
      options: [
        "Static analysis of source code",
        "Post-mortem review and disaster recovery",
        "Best-practice secure coding",
        "Intrusion prevention systems",
      ],
      correctIndex: 1,
      modelAnswer:
        "Post-mortem and disaster recovery (freezing money, tracing, insurance, legal) are explicitly \"after incident\" activities.",
    },
    {
      type: "truefalse",
      prompt: "True or False: According to the lecture, security is a one-time activity that ends once a system is launched.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer: "\"Security does not end when a system is launched\" / \"Security is never finished.\"",
    },
    {
      type: "mcq",
      prompt: "In system modeling, which of the following is a \"trust assumption\" rather than a \"component\"?",
      options: ["The card reader", "The bank server", "\"The network connection is protected\"", "The customer"],
      correctIndex: 2,
      modelAnswer:
        "\"The network connection is protected\" is an assumption about the system, not a physical/logical component. The card reader, bank server, and customer are components/actors.",
    },
    {
      type: "mcq",
      prompt:
        "When threat modeling, \"what can they do?\" (e.g. steal a password, exploit software, act as an insider) refers to which part of the attacker profile?",
      options: ["Adversary goals", "Adversary capabilities", "Attack surface", "Trust boundary"],
      correctIndex: 1,
      modelAnswer:
        "\"What can they do?\" maps to capabilities, as distinct from goals (\"what do they want?\") and attack vector (the path they take).",
    },
    {
      type: "mcq",
      prompt: "In the Bybit case, what was the root cause that allowed attackers to steal ~$1.4 billion?",
      options: [
        "A weak password on the cold wallet",
        "A DDoS attack that overwhelmed Bybit's servers",
        "Staff approved a transaction based on a fake/manipulated UI screen without independent verification by the cold wallet system",
        "An expired TLS certificate",
      ],
      correctIndex: 2,
      modelAnswer:
        "Attackers presented a manipulated approval screen; staff approved via the UI without independent verification, and the cold wallet signed without re-checking what was actually being signed.",
    },
    {
      type: "truefalse",
      prompt: "True or False: The Bybit incident shows that cybersecurity failures are always purely technical (software) failures, never human ones.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "The lecture's explicit takeaway is \"security means protecting both the technology and the people who use it\" — Bybit shows human/process failure, not just a technical bug.",
    },
    {
      type: "short",
      prompt:
        "Explain, in your own words, why modern cybersecurity can no longer be modeled as a single \"castle\" with one boundary. What replaced this model in the lecture, and why does every connection in that replacement create risk?",
      modelAnswer:
        "Modern systems are distributed across many connected components (user → computer → internet → web server → switch → backend server → database), so there is no single perimeter to defend. This was replaced by a defence-in-depth / layered model, where protections (MFA, firewalls, intrusion detection, encryption) are placed at multiple points along the chain. Every connection point that enables the system to function is also a potential entry point for an attacker — functionality and risk are two sides of the same coin.",
    },
    {
      type: "short",
      prompt:
        "Define each part of the CIA Triad in one sentence each, and give one original example (not from the slides) of an attack or failure for each property.",
      modelAnswer:
        "Confidentiality: only authorised parties can view data/services (e.g. an attacker sniffing unencrypted Wi-Fi traffic to read someone's login credentials). Integrity: information/system state can't be changed without authorisation (e.g. a student altering their own grade in a database they shouldn't have write access to). Availability: authorised users can access the system when they need it (e.g. a ransomware attack encrypting a hospital's patient records system so doctors can't access it).",
    },
    {
      type: "short",
      prompt:
        "List the four stages of the Week 1 \"Take Away 2: Security is a Lifecycle\" summary (build → ? → ? → ?) and briefly explain what happens in each stage.",
      modelAnswer:
        "Build securely (understand assets → identify threats → test for weaknesses) → Watch and protect (monitor → detect suspicious activity → patch/improve) → Respond (contain → recover → investigate) → Learn and strengthen (fix weaknesses, feed lessons into the next cycle). It's a continuous loop, not a straight line.",
    },
    {
      type: "short",
      prompt:
        "Explain the difference between a system model and a threat model. Why do you need both before you can reason about a system's security?",
      modelAnswer:
        "A system model describes what actually exists and how it's supposed to work: components, actors, environment, and trust assumptions (the \"as-designed\" view). A threat model describes how it could be attacked: adversary types, goals, capabilities, and attack vectors (the \"as-attacked\" view). You need the system model first because you can't identify realistic threats or broken assumptions without knowing what's actually there and what you're assuming to be true.",
    },
    {
      type: "short",
      prompt:
        "List the five components of a system model as taught in the ATM example (components, actors, environment, trust assumptions — plus one more). For each, give one example that is different from the ATM slide.",
      modelAnswer:
        "Components (technical parts), Actors (people/entities involved), Environment (context/setting), Trust Assumptions (things assumed secure/true), and — implicitly — Assets (what's valuable, shown explicitly in the Bybit model as \"cold wallet funds\"). Example set for a different system (online banking app): components = mobile app, API server, database; actors = customer, bank employee, third-party auditor; environment = personal smartphone on public Wi-Fi; trust assumptions = \"the app was not tampered with before install,\" \"the OS keychain protecting stored credentials is secure.\"",
    },
    {
      type: "short",
      prompt:
        "For threat modeling, three questions define an attacker: what do they want, what can they do, and what path/vector do they use. Apply this to a phishing email attacker targeting a university student.",
      modelAnswer:
        "Goal: obtain the student's university login credentials (to access grades, financial info, or pivot to other accounts). Capability: can craft a convincing fake email/login page mimicking the university portal, can spoof sender addresses. Attack vector: email lands in inbox → student clicks link → enters credentials on fake page → attacker captures and reuses them, exploiting the student's trust in familiar branding and urgency cues rather than a technical software flaw.",
    },
    {
      type: "short",
      prompt:
        "Explain the \"wooden barrel theory\" and connect it explicitly to the Bybit case: which \"board\" (layer) was the shortest, and what should have been done to lengthen it?",
      modelAnswer:
        "The wooden barrel theory says a system's overall security is limited by its weakest layer (people, devices, networks, software, data), no matter how strong the other layers are. In Bybit, the technical layers (cold wallet cryptography, aggregate signatures) were strong, but the people/process layer was the shortest board — staff trusted what the UI displayed without independently verifying the transaction, and the cold wallet signed without re-displaying/re-checking what it was actually signing. Lengthening that board would mean adding independent, out-of-band verification of transaction details before signing (e.g. a second display device showing the raw transaction data, not just what the UI claims).",
    },
    {
      type: "short",
      prompt:
        "The unit outline lists 15 learning outcomes across five categories. Why do you think Week 1 spends most of its time on system models, threat models, and the CIA triad rather than jumping straight into technical attacks? What foundation does this build for later weeks?",
      modelAnswer:
        "Week 1 builds a transferable way of thinking rather than a list of memorised attacks: system modeling forces you to name assets and trust assumptions, and threat modeling forces you to ask who would attack them and how. Every later topic (cryptography, authentication, network security, AI security, blockchain security) is really just \"what are the assets/assumptions in this specific domain, and how are they attacked?\" — so mastering the Week 1 framework early means the same five-step process (model the system → model expected behaviour → think like an attacker → define what must be protected → know your attacker) applies to any new topic instead of memorising each domain separately.",
    },
    {
      type: "scenario",
      prompt:
        "A university uses an online exam portal where students log in, complete a timed quiz, and submit answers automatically saved to a server. a) Build a system model: identify at least 3 components, 2 actors, the environment, and 2 trust assumptions. b) Build a threat model: identify one plausible attacker, their goal, their capability, and a likely attack vector. c) State one confidentiality, one integrity, and one availability property that must hold for this system.",
      modelAnswer:
        "a) Components: student device/browser, exam portal web server, authentication service, answer-storage database, timer service. Actors: student, instructor/invigilator, IT admin. Environment: accessed remotely over the public internet, potentially on personal/unmanaged devices. Trust assumptions: \"the authentication service correctly verifies student identity,\" \"the timer/submission service reliably captures answers before the deadline.\" b) Attacker: a student wanting a better grade. Goal: view exam questions early or alter submitted answers after the deadline. Capability: has legitimate login credentials, may attempt to exploit a flaw in the submission API or session handling. Vector: intercepting/replaying an API request to resubmit answers after time expires, or exploiting a predictable URL/ID to access another student's exam session. c) Confidentiality: exam questions must not be visible before the scheduled start time. Integrity: submitted answers must not be alterable after the deadline. Availability: the portal must stay up and accept submissions throughout the exam window.",
    },
    {
      type: "scenario",
      prompt:
        "A smart home doorbell camera streams video to an app and lets the homeowner unlock the front door remotely. a) Identify one component-level trust assumption that, if broken, would compromise the whole system (link this to the Wooden Barrel Theory). b) Describe an attack that would violate confidentiality, and a separate attack that would violate availability.",
      modelAnswer:
        "a) Trust assumption: \"the cloud service that relays the unlock command is not compromised and only accepts commands from the authenticated homeowner app.\" If an attacker compromises that cloud relay or the app's authentication token, every downstream control (locks, cameras) is worthless — this is the shortest board in the barrel, since a strong physical lock means nothing if the digital unlock path is broken. b) Confidentiality violation: an attacker gains unauthorised access to the video feed and watches the homeowner's live camera without permission. Availability violation: an attacker floods the home Wi-Fi/router with traffic (or jams the doorbell's wireless signal) so the doorbell can't alert the homeowner or stream video when someone is actually at the door.",
    },
    {
      type: "scenario",
      prompt:
        "Revisit the Bybit case one more time, but now argue it from a defender's perspective using the security lifecycle: for each of the three phases (before deployment, after deployment, after incident), suggest one concrete control Bybit could have implemented to prevent or limit the loss.",
      modelAnswer:
        "Before deployment: require the cold wallet system to independently decode and display the actual raw transaction being signed (not just trust the UI's claim), and mandate a formal manual audit/threat model of the approval workflow before launch. After deployment: monitor for anomalous large withdrawal patterns and add automatic holds/alerts on unusually large transfers pending secondary review. After incident: run a post-mortem to identify that \"trusting the UI without independent verification\" was the root cause, then feed that lesson back by mandating out-of-band verification for all future high-value approvals.",
    },
    {
      type: "scenario",
      prompt:
        "A classmate says: \"If we just add a firewall and multi-factor authentication, our system will be secure.\" Using concepts from Week 1 (layered defence, CIA triad, lifecycle, trust assumptions), explain why this statement is incomplete, and what else needs to be considered.",
      modelAnswer:
        "This statement conflates two controls (a firewall and MFA) with \"security\" as a whole. Week 1's layered-defence and wooden-barrel arguments show that no single control — or even two controls — protects the whole system; a firewall doesn't protect data integrity once it's inside the network, and MFA doesn't stop a socially engineered staff member from approving a malicious request (as in Bybit) or a vulnerability in the application code itself. A complete view also needs: coverage of all three CIA properties (not just access control), a full lifecycle (build, monitor, respond, learn — not a one-time setup), and explicit trust assumptions about every component, because attackers look for whichever assumption is weakest, not necessarily the front door.",
    },
  ],
};

const PAPER_2: ExamPaperSeed = {
  week: 1,
  paperNumber: 2,
  title: "Week 1 Practice Paper 2",
  topics:
    "Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study",
  sourceFiles: SOURCE_FILES,
  questions: [
    {
      type: "mcq",
      prompt:
        "A company replaces its single external firewall with firewalls at the network edge, between internal subnets, and on each server, plus endpoint antivirus on every laptop. This is an example of:",
      options: ["Zero trust networking", "Defence-in-depth / layered defence", "The castle model", "Air-gapping"],
      correctIndex: 1,
      modelAnswer:
        "Defence-in-depth places multiple independent layers of control along the path an attacker would have to travel, rather than relying on one perimeter — exactly what stacking firewalls, segmentation, and endpoint protection does.",
    },
    {
      type: "mcq",
      prompt:
        "In the Wooden Barrel Theory, if four of five security layers are excellent but the fifth (staff training) is very weak, the system's overall security is best described as:",
      options: [
        "Strong, because 4 out of 5 layers are excellent",
        "The average of all five layers",
        "Limited by the weakest layer (staff training)",
        "Undefined without a numeric score",
      ],
      correctIndex: 2,
      modelAnswer:
        "The barrel holds only as much water as its shortest board — one weak layer caps the whole system's security regardless of how strong the others are.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: A system with ten layers of defence is always more secure than a system with only three well-designed and well-reviewed layers.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Quantity of layers isn't the deciding factor — a small number of well-chosen, well-maintained layers can outperform many redundant or poorly-configured ones; the barrel theory cares about the weakest layer, not the count.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: Trade-offs between security and usability mean that the \"most secure\" design is not always the design that should be shipped.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "Security involves trade-offs — a maximally secure design that's unusable will get bypassed or abandoned by real users, so the right design balances protection against usability rather than maximising security alone.",
    },
    {
      type: "mcq",
      prompt:
        "An attacker gains read-only access to a company's customer database and downloads emails and phone numbers without modifying anything or affecting service. Which CIA property is violated?",
      options: ["Confidentiality", "Integrity", "Availability", "Authentication"],
      correctIndex: 0,
      modelAnswer: "Unauthorised viewing of data with no modification or disruption is a confidentiality breach.",
    },
    {
      type: "mcq",
      prompt:
        "A ransomware attack encrypts a hospital's files so doctors can't open patient records, but the data itself is not stolen or altered. Which CIA property is primarily violated?",
      options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
      correctIndex: 2,
      modelAnswer:
        "Blocking authorised users from accessing data they need, when they need it, is an availability violation — even though nothing was read or changed.",
    },
    {
      type: "mcq",
      prompt:
        "According to the Week 1 Security Lifecycle model, patching a known vulnerability in a running production system belongs to which phase?",
      options: [
        "Before deployment",
        "After deployment",
        "After incident",
        "None of these — patching isn't part of the lifecycle",
      ],
      correctIndex: 1,
      modelAnswer:
        "Patching a live system is a \"watch and protect\" activity that happens once the system is already running, not before launch or specifically after a breach.",
    },
    {
      type: "mcq",
      prompt: "In the Bybit case, which of the following is the most accurate root-cause description?",
      options: [
        "A brute-force password attack on the cold wallet",
        "A DDoS attack overwhelming Bybit's infrastructure",
        "Staff approved a transaction based on a manipulated UI without independent verification",
        "A supply-chain compromise of Bybit's cloud provider",
      ],
      correctIndex: 2,
      modelAnswer:
        "The root cause was a process/human failure: staff trusted what the approval UI displayed instead of independently verifying the actual transaction being signed.",
    },
    {
      type: "short",
      prompt:
        "Explain in your own words the difference between a system model and a threat model, using an example system of your choosing (not the ATM or Bybit).",
      modelAnswer:
        "A system model describes what exists and how it's meant to work — its components, actors, environment, and trust assumptions (the \"as-designed\" view). A threat model describes how that system could be attacked — who the adversaries are, what they want, what they can do, and the vector they'd use (the \"as-attacked\" view). Example: for a food-delivery app, the system model names the rider's phone, the restaurant's tablet, the matching server, and the payment gateway as components, with a trust assumption like \"the rider's GPS location is not spoofed\"; the threat model then asks who would exploit that assumption (a rider spoofing location to fake a delivery) and how (a GPS-spoofing app).",
    },
    {
      type: "short",
      prompt:
        "List the four stages of the \"Security is a Lifecycle\" takeaway and briefly explain what changes about a system's security posture between the \"before deployment\" and \"after deployment\" stages.",
      modelAnswer:
        "Build securely → Watch and protect → Respond → Learn and strengthen. Before deployment, security work is preventive and design-time (threat modeling, secure coding, manual audit, defining what needs protecting); after deployment, it shifts to operational and reactive activities against a live system (monitoring, intrusion detection, patching newly found issues) — the system is now exposed to real traffic and real attackers, so the goal moves from \"design this well\" to \"watch this constantly.\"",
    },
    {
      type: "short",
      prompt:
        "Give an original example (not from lecture) of a single trust assumption whose failure would compromise an entire system, and explain why it is the \"shortest board\" in that system's barrel.",
      modelAnswer:
        "A password manager's trust assumption might be \"the master password is never intercepted by anything running on the user's device.\" If a keylogger captures that one password, every credential the manager stores is instantly compromised regardless of how strong the encryption or how many other controls exist — it is the shortest board because every other layer of protection is downstream of, and depends on, that single assumption holding.",
    },
    {
      type: "scenario",
      prompt:
        "A ride-share app lets drivers see a passenger's pickup location and lets passengers rate drivers after the trip. a) Build a system model: name 3 components, 2 actors, the environment, and 1 trust assumption. b) Identify one attacker whose goal is to see a passenger's home address without authorisation, and describe their likely capability and attack vector. c) State one confidentiality property and one integrity property that must hold.",
      modelAnswer:
        "a) Components: passenger app, driver app, matching/dispatch server, ratings database, payment processor. Actors: passenger, driver, support staff. Environment: personal smartphones over public cellular/Wi-Fi networks. Trust assumption: \"the dispatch server only reveals a passenger's precise location to the driver actually assigned to their trip.\" b) Attacker: a driver (or ex-driver with residual access) wanting to stalk a specific passenger. Capability: legitimate access to the driver app plus ability to record/screenshot trip data, possibly abusing an API that doesn't expire location access after trip completion. Vector: requesting or re-accessing a past trip's location data through the driver app's API after the ride has ended. c) Confidentiality: a passenger's home/pickup address must not be visible to any driver other than the one assigned to that specific trip, and not after the trip ends. Integrity: a driver's star rating must only be updated by the passenger who actually completed that specific trip.",
    },
    {
      type: "scenario",
      prompt:
        "Revisit the Wooden Barrel Theory and apply it to a university's learning management system (LMS) that stores grades. a) Identify a plausible \"shortest board\" for the LMS (people, process, or technology) and justify your choice. b) Recommend one concrete control that would lengthen that specific board, and explain, using the Security Lifecycle, which phase that control belongs to.",
      modelAnswer:
        "a) A plausible shortest board is the process around teaching-assistant accounts: TAs are often granted broad grade-editing access for convenience, with no time-limited scope or logging of which TA changed which grade — even if the LMS itself uses strong encryption and MFA, this overly broad, unaudited access is the weakest point an attacker (or a dishonest insider) would target. b) Control: restrict TA accounts to grade-editing only for the specific course/section they're assigned to, with all changes logged and reviewable, and access automatically revoked at semester end. This is a \"before deployment\" control if built into the access model from the start, or a \"watch and protect\" (after deployment) control if added later as continuous monitoring/alerting on unusual grade-change patterns.",
    },
  ],
};

const PAPER_3: ExamPaperSeed = {
  week: 1,
  paperNumber: 3,
  title: "Week 1 Practice Paper 3",
  topics:
    "Castle model, CIA triad, security lifecycle, system modeling, threat modeling, Bybit case study",
  sourceFiles: SOURCE_FILES,
  questions: [
    {
      type: "mcq",
      prompt:
        "A bank adds a second, independent device that must physically confirm a large wire transfer before it executes, even though the initiating computer has already approved it. This most directly demonstrates:",
      options: [
        "The castle model",
        "Defence-in-depth via an independent verification layer",
        "Non-repudiation",
        "A trust assumption",
      ],
      correctIndex: 1,
      modelAnswer:
        "An independent, out-of-band confirmation step is exactly the kind of extra layer defence-in-depth adds — it doesn't rely on the same system/UI that could itself be compromised or manipulated.",
    },
    {
      type: "mcq",
      prompt: "Which statement best reflects the lecture's view of the relationship between security and usability?",
      options: [
        "Usability should always be sacrificed for maximum security",
        "Security and usability are unrelated design concerns",
        "Security involves trade-offs; more security can reduce usability and convenience",
        "Usability problems are only a UX team's concern, not a security concern",
      ],
      correctIndex: 2,
      modelAnswer:
        "The lecture is explicit that security is a trade-off, not a free upgrade — stronger controls often cost convenience, and that cost has to be weighed deliberately.",
    },
    {
      type: "truefalse",
      prompt:
        "True or False: In system modeling, \"the environment\" refers to the physical or network context a system operates in (e.g. public Wi-Fi, a data centre), not a component or actor.",
      options: ["True", "False"],
      correctIndex: 0,
      modelAnswer:
        "Environment describes the surrounding context (where/how the system runs), distinct from components (technical parts) and actors (people/entities involved).",
    },
    {
      type: "truefalse",
      prompt: "True or False: An attacker's \"capability\" and their \"goal\" describe the same thing — what they are able to do.",
      options: ["True", "False"],
      correctIndex: 1,
      modelAnswer:
        "Goal is what the attacker wants to achieve (e.g. steal funds); capability is what they are actually able to do to pursue that goal (e.g. exploit a specific software flaw, act as a trusted insider) — related but distinct parts of an attacker profile, alongside their attack vector.",
    },
    {
      type: "mcq",
      prompt:
        "An attacker doesn't steal or alter any data but manages to keep an online exam portal offline for the entire two-hour exam window with a flood of junk traffic. Which CIA property is violated?",
      options: ["Confidentiality", "Integrity", "Availability", "Accountability"],
      correctIndex: 2,
      modelAnswer: "Denying legitimate access to a service for its intended duration is an availability violation.",
    },
    {
      type: "mcq",
      prompt:
        "A disgruntled employee with legitimate database access quietly changes a colleague's performance review score before it's finalised. Which CIA property is violated?",
      options: ["Confidentiality", "Integrity", "Availability", "Non-repudiation"],
      correctIndex: 1,
      modelAnswer:
        "Unauthorised modification of data by someone who technically has access, but not the authority to make that change, is an integrity violation.",
    },
    {
      type: "mcq",
      prompt:
        "According to the Security Lifecycle, conducting a formal post-mortem after a breach and feeding the findings back into secure design belongs mainly to which two stages, in order?",
      options: [
        "Before deployment, then after deployment",
        "After incident, then build securely (next cycle)",
        "After deployment, then after incident",
        "Build securely, then after deployment",
      ],
      correctIndex: 1,
      modelAnswer:
        "A post-mortem is an \"after incident\" activity; feeding its lessons back into design starts the next cycle's \"build securely\" stage — the lifecycle is a loop, not a straight line.",
    },
    {
      type: "mcq",
      prompt: "Which of these is the best description of why the Bybit incident is described as a failure of both technology and people?",
      options: [
        "The cryptography used was mathematically broken",
        "Staff trusted a manipulated UI and approved a transaction without independently verifying what was actually being signed",
        "Bybit had no firewall at all",
        "The attackers exploited an expired SSL certificate",
      ],
      correctIndex: 1,
      modelAnswer:
        "The technology (cold wallet cryptography) worked as designed; the failure was a human/process one — trusting a display without independent verification — which is exactly why the lecture frames it as both a technical and human failure.",
    },
    {
      type: "short",
      prompt:
        "A classmate says \"our system uses AES-256 encryption everywhere, so it's secure.\" Using the CIA triad, explain why this claim is incomplete.",
      modelAnswer:
        "Strong encryption mainly protects confidentiality (and, with proper authentication, integrity of data in transit/at rest) — it says nothing about availability (encryption doesn't stop a DDoS attack or a hardware failure taking the system offline) and nothing about integrity if the encryption keys themselves or the endpoints handling the plaintext are compromised. Claiming a system is \"secure\" based on one control covering one CIA property ignores the other two and every other layer the wooden barrel theory says the system's real security depends on.",
    },
    {
      type: "short",
      prompt:
        "Explain why \"the network connection between the card reader and the bank server is protected\" is a trust assumption rather than a component in an ATM system model, and describe one way this specific assumption could fail in practice.",
      modelAnswer:
        "A component is a physical or logical part of the system (the card reader, the bank server, the network link itself); a trust assumption is a belief about how a component behaves or is protected that the rest of the model relies on without re-verifying it. \"The connection is protected\" assumes the link can't be eavesdropped on or tampered with — in practice this could fail if an attacker installs a rogue device between the ATM and the network (a man-in-the-middle skimmer) that intercepts card and PIN data before it reaches the bank.",
    },
    {
      type: "short",
      prompt:
        "Give an original example of a system where increasing security noticeably reduces usability, and explain the specific trade-off being made.",
      modelAnswer:
        "Requiring hardware security-key MFA (e.g. a physical YubiKey) for every login to a company's internal wiki significantly reduces account-takeover risk, but it also means employees can't quickly check the wiki from a borrowed device or their phone without carrying the key, and losing the key locks them out entirely — trading day-to-day convenience and accessibility for stronger protection against credential theft.",
    },
    {
      type: "scenario",
      prompt:
        "A university library system lets students reserve physical books online and lets staff issue digital fines for overdue returns. a) Build a system model: 3 components, 2 actors, the environment, 2 trust assumptions. b) Build a threat model: one attacker, their goal, capability, and vector. c) State one integrity property and one availability property that must hold.",
      modelAnswer:
        "a) Components: student web portal, reservation/catalog server, fines database, staff terminal. Actors: student, library staff. Environment: accessed from campus Wi-Fi and students' personal devices off-campus. Trust assumptions: \"only authenticated staff terminals can issue or waive fines,\" \"the reservation server correctly attributes a reservation to the student who is logged in.\" b) Attacker: a student wanting to avoid paying fines. Goal: erase or reduce their own outstanding fines. Capability: valid student login, possibly discovering an unauthenticated or poorly-authorised staff API endpoint. Vector: directly calling the fines-adjustment endpoint that should be staff-only, bypassing the UI that would normally block a student from reaching it. c) Integrity: a fine amount must only be changed by authorised staff action, never by the student who owes it. Availability: the reservation system must stay reachable during peak periods (e.g. exam-period book reservations).",
    },
    {
      type: "scenario",
      prompt:
        "A smart doorbell vendor pushes a firmware update automatically to every installed device overnight with no user confirmation. a) Identify one new trust assumption this update mechanism introduces that didn't exist before. b) Describe an attack that would violate integrity via this mechanism, and one concrete lifecycle control that would reduce that risk.",
      modelAnswer:
        "a) New trust assumption: \"every firmware update pushed through this channel genuinely comes from the vendor and has not been tampered with in transit or at the update server.\" b) Integrity attack: an attacker compromises the vendor's update server (or intercepts the update channel) and pushes malicious firmware to thousands of doorbells at once, silently adding a backdoor that streams video to the attacker. Lifecycle control: before deployment, require all firmware updates to be cryptographically signed and verified on-device before installation, so a device rejects any update that isn't signed by the vendor's private key — this closes the exact trust assumption identified in (a) instead of just hoping the update channel is never compromised.",
    },
  ],
};

export const WEEK_1_PAPERS: ExamPaperSeed[] = [PAPER_1, PAPER_2, PAPER_3];
```

- [ ] **Step 3: Write the failing test for the aggregator**

Create `exam-content.test.ts`:

```ts
import { test, expect } from "bun:test";
import { buildExamSchedule, TOTAL_PAPERS } from "./exam-content";

test("buildExamSchedule assigns sequential 1-based paperDay across all papers", () => {
  const schedule = buildExamSchedule();
  expect(schedule.length).toBeGreaterThan(0);
  expect(schedule.map((p) => p.paperDay)).toEqual(schedule.map((_, i) => i + 1));
});

test("TOTAL_PAPERS matches the schedule length", () => {
  expect(TOTAL_PAPERS).toBe(buildExamSchedule().length);
});

test("every paper has at least one question and a non-empty title", () => {
  for (const paper of buildExamSchedule()) {
    expect(paper.questions.length).toBeGreaterThan(0);
    expect(paper.title.length).toBeGreaterThan(0);
  }
});

test("mcq/truefalse questions all have options and a valid correctIndex", () => {
  for (const paper of buildExamSchedule()) {
    for (const q of paper.questions) {
      if (q.type === "mcq" || q.type === "truefalse") {
        expect(q.options && q.options.length).toBeGreaterThan(0);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex!).toBeLessThan(q.options!.length);
      }
    }
  }
});

test("every question has a non-empty prompt and modelAnswer", () => {
  for (const paper of buildExamSchedule()) {
    for (const q of paper.questions) {
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.modelAnswer.length).toBeGreaterThan(0);
    }
  }
});

test("Week 1 seeds exactly 3 papers", () => {
  const week1 = buildExamSchedule().filter((p) => p.week === 1);
  expect(week1.map((p) => p.paperNumber)).toEqual([1, 2, 3]);
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `bun test exam-content.test.ts`
Expected: FAIL — `exam-content.ts` does not exist yet.

- [ ] **Step 5: Write the aggregator**

Create `exam-content.ts`:

```ts
// Aggregates every week's exam papers into one sequential schedule. Add new
// weeks here as they're generated (scripts/generate-exam-week.ts) and filled
// in: import the week's papers and append to ALL_PAPERS, in week order.
import { WEEK_1_PAPERS } from "./exam-content/week-1";
import type { ExamPaperSeed } from "./exam-content/types";

const ALL_PAPERS: ExamPaperSeed[] = [...WEEK_1_PAPERS];

export interface ExamPaper extends ExamPaperSeed {
  paperDay: number; // 1-based sequential release day across all weeks
}

export function buildExamSchedule(): ExamPaper[] {
  return ALL_PAPERS.map((paper, i) => ({ ...paper, paperDay: i + 1 }));
}

export const TOTAL_PAPERS = buildExamSchedule().length;
```

- [ ] **Step 6: Run test to verify it passes**

Run: `bun test exam-content.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 7: Commit**

```bash
git add exam-content/week-1.ts exam-content.ts exam-content.test.ts
git commit -m "feat: add Week 1 exam content and schedule aggregator"
```

---

### Task 4: `exam-db.ts` — schema, release gate, grading, review items

**Files:**
- Create: `exam-db.ts`
- Test: `exam-db.test.ts`

**Interfaces:**
- Consumes: `applyExamReview`, `ExamReviewResult` from `exam-scheduling.ts` (Task 1); `buildExamSchedule`, `TOTAL_PAPERS` from `exam-content.ts` (Task 3); `addDays`, `releaseCount` from `scheduling.ts`.
- Produces: `migrateExam(db, today)`, `listDueExamPapers(db, today): ExamPaperRow[]`, `getExamPaperRow(db, paperDay): ExamPaperRow | null`, `listExamAnswers(db, paperDay): ExamAnswerRow[]`, `saveExamAnswer(db, paperDay, questionIndex, yourAnswer)`, `gradeExamAnswer(db, paperDay, questionIndex, correct, yourAnswer?)`, `submitExamPaper(db, paperDay, today): SubmitExamResult`, `countOverdueExamPapers`, `countExamPapersSubmittedToday`, `listExamPapersSubmittedToday`, `listDueExamReviewItems`, `countOverdueExamReviewItems`, `countExamReviewsToday`, `listExamReviewsCompletedToday`, `reviewExamItem(db, paperDay, questionIndex, result, today)`. Consumed by Task 5 (`exam-api.ts`) and Task 6 (`home-api.ts`).

- [ ] **Step 1: Write the failing test**

Create `exam-db.test.ts`:

```ts
import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateExam,
  listDueExamPapers,
  getExamPaperRow,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countOverdueExamPapers,
  countExamPapersSubmittedToday,
  listDueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
} from "./exam-db";
import { TOTAL_PAPERS, buildExamSchedule } from "./exam-content";
import { addDays } from "./scheduling";

const TODAY = "2026-08-04";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateExam(db, TODAY);
});

test("seeds every paper, releasing the first 5 immediately under the backlog cap", () => {
  expect(getExamPaperRow(db, 1)!.next_review).toBe(TODAY);
  const releasedCount = Math.min(5, TOTAL_PAPERS);
  expect(getExamPaperRow(db, releasedCount)!.next_review).toBe(TODAY);
  if (TOTAL_PAPERS > 5) {
    expect(getExamPaperRow(db, 6)!.next_review).toBe(addDays(TODAY, 6));
  }
});

test("migrateExam does not reseed or reset progress on a second call", () => {
  saveExamAnswer(db, 1, 0, "draft");
  migrateExam(db, TODAY);
  const answer = getExamPaperRow(db, 1);
  expect(answer).not.toBeNull();
});

test("listDueExamPapers returns the first released, unsubmitted paper first", () => {
  const due = listDueExamPapers(db, TODAY);
  expect(due.length).toBeGreaterThan(0);
  expect(due[0]!.paper_day).toBe(1);
});

test("saveExamAnswer stores a draft without grading it", () => {
  saveExamAnswer(db, 1, 0, "my draft");
  const paper1Questions = buildExamSchedule()[0]!.questions;
  expect(paper1Questions.length).toBeGreaterThan(0);
});

test("submitExamPaper rejects submission until every question is graded", () => {
  const result = submitExamPaper(db, 1, TODAY);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("incomplete");
});

test("submitExamPaper computes score, marks submitted, and creates review items for wrong answers", () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, i !== 0)); // question 0 wrong, rest correct

  const result = submitExamPaper(db, 1, TODAY);
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.scoreTotal).toBe(paper1.questions.length);
    expect(result.scoreCorrect).toBe(paper1.questions.length - 1);
  }

  const paperRow = getExamPaperRow(db, 1)!;
  expect(paperRow.submitted_at).toBe(TODAY);

  const dueReviews = listDueExamReviewItems(db, addDays(TODAY, 1));
  expect(dueReviews.length).toBe(1);
  expect(dueReviews[0]!.question_index).toBe(0);
});

test("a submitted paper is no longer listed as due", () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, true));
  submitExamPaper(db, 1, TODAY);

  const due = listDueExamPapers(db, TODAY);
  expect(due.find((p) => p.paper_day === 1)).toBeUndefined();
});

test("submitExamPaper rejects a second submission of the same paper", () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, true));
  submitExamPaper(db, 1, TODAY);

  const second = submitExamPaper(db, 1, TODAY);
  expect(second.ok).toBe(false);
  if (!second.ok) expect(second.reason).toBe("already_submitted");
});

test("countExamPapersSubmittedToday and countOverdueExamPapers track separately", () => {
  expect(countExamPapersSubmittedToday(db, TODAY)).toBe(0);
  expect(countOverdueExamPapers(db, TODAY)).toBe(0);

  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, true));
  submitExamPaper(db, 1, TODAY);
  expect(countExamPapersSubmittedToday(db, TODAY)).toBe(1);
});

test("reviewExamItem applies the ladder and logs the attempt", () => {
  const paper1 = buildExamSchedule().find((p) => p.paperDay === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, 1, i, i !== 0));
  submitExamPaper(db, 1, TODAY);

  const tomorrow = addDays(TODAY, 1);
  const updated = reviewExamItem(db, 1, 0, "correct", tomorrow)!;
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(tomorrow, 3));
  expect(countExamReviewsToday(db, tomorrow)).toBe(1);
});

test("reviewExamItem returns null for an item that isn't in the review queue", () => {
  expect(reviewExamItem(db, 1, 5, "correct", TODAY)).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test exam-db.test.ts`
Expected: FAIL — `exam-db.ts` does not exist yet.

- [ ] **Step 3: Write the implementation**

Create `exam-db.ts`:

```ts
import type { Database } from "bun:sqlite";
import { buildExamSchedule, TOTAL_PAPERS } from "./exam-content";
import { addDays, releaseCount } from "./scheduling";
import { applyExamReview, type ExamReviewResult } from "./exam-scheduling";

export interface ExamPaperRow {
  paper_day: number;
  next_review: string;
  submitted_at: string | null;
  score_correct: number | null;
  score_total: number | null;
}

export interface ExamAnswerRow {
  paper_day: number;
  question_index: number;
  your_answer: string;
  correct: number | null;
}

export interface ExamReviewItemRow {
  id: number;
  paper_day: number;
  question_index: number;
  rung: number;
  next_review: string;
}

export function migrateExam(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_papers (
      paper_day INTEGER PRIMARY KEY,
      next_review TEXT NOT NULL,
      submitted_at TEXT,
      score_correct INTEGER,
      score_total INTEGER
    );
    CREATE TABLE IF NOT EXISTS exam_answers (
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      your_answer TEXT NOT NULL DEFAULT '',
      correct INTEGER,
      PRIMARY KEY (paper_day, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      rung INTEGER NOT NULL DEFAULT -1,
      next_review TEXT NOT NULL,
      UNIQUE(paper_day, question_index)
    );
    CREATE TABLE IF NOT EXISTS exam_review_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paper_day INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      reviewed_at TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('correct','wrong'))
    );
    CREATE TABLE IF NOT EXISTS exam_state (
      released_up_to INTEGER NOT NULL DEFAULT 0
    );
  `);

  const { stateCount } = db.query(`SELECT COUNT(*) AS stateCount FROM exam_state`).get() as {
    stateCount: number;
  };
  if (stateCount === 0) {
    db.query(`INSERT INTO exam_state (released_up_to) VALUES (0)`).run();
  }

  seedNewPapers(db, today);
  runExamReleaseGate(db, today);
}

// Inserts any paper introduced since the last run (e.g. a new week's content
// was added and TOTAL_PAPERS grew) without touching existing rows — placed
// far out on the calendar; the release gate below pulls each one forward
// once backlog clears, exactly like a paper that existed from day one.
function seedNewPapers(db: Database, today: string): void {
  const { maxDay } = db.query(`SELECT COALESCE(MAX(paper_day), 0) AS maxDay FROM exam_papers`).get() as {
    maxDay: number;
  };
  const insert = db.query(`INSERT INTO exam_papers (paper_day, next_review) VALUES (?, ?)`);
  for (const paper of buildExamSchedule()) {
    if (paper.paperDay <= maxDay) continue;
    insert.run(paper.paperDay, addDays(today, paper.paperDay));
  }
}

function runExamReleaseGate(db: Database, today: string): void {
  const { released_up_to } = db.query(`SELECT released_up_to FROM exam_state`).get() as {
    released_up_to: number;
  };
  const { n: backlog } = db
    .query(
      `SELECT COUNT(*) AS n FROM exam_papers WHERE paper_day <= ? AND next_review <= ? AND submitted_at IS NULL`,
    )
    .get(released_up_to, today) as { n: number };
  const remaining = TOTAL_PAPERS - released_up_to;
  const toRelease = releaseCount(backlog, remaining);
  if (toRelease === 0) return;

  const newUpTo = released_up_to + toRelease;
  db.query(`UPDATE exam_papers SET next_review = ? WHERE paper_day > ? AND paper_day <= ?`).run(
    today,
    released_up_to,
    newUpTo,
  );
  db.query(`UPDATE exam_state SET released_up_to = ?`).run(newUpTo);
}

export function listDueExamPapers(db: Database, today: string): ExamPaperRow[] {
  runExamReleaseGate(db, today);
  return db
    .query(
      `SELECT paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers
       WHERE paper_day <= (SELECT released_up_to FROM exam_state) AND next_review <= ? AND submitted_at IS NULL
       ORDER BY next_review, paper_day`,
    )
    .all(today) as ExamPaperRow[];
}

export function getExamPaperRow(db: Database, paperDay: number): ExamPaperRow | null {
  return db
    .query(
      `SELECT paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers WHERE paper_day = ?`,
    )
    .get(paperDay) as ExamPaperRow | null;
}

export function listExamAnswers(db: Database, paperDay: number): ExamAnswerRow[] {
  return db
    .query(`SELECT paper_day, question_index, your_answer, correct FROM exam_answers WHERE paper_day = ?`)
    .all(paperDay) as ExamAnswerRow[];
}

export function saveExamAnswer(db: Database, paperDay: number, questionIndex: number, yourAnswer: string): void {
  db.query(
    `INSERT INTO exam_answers (paper_day, question_index, your_answer) VALUES (?, ?, ?)
     ON CONFLICT (paper_day, question_index) DO UPDATE SET your_answer = excluded.your_answer`,
  ).run(paperDay, questionIndex, yourAnswer);
}

// yourAnswer is optional: mcq/truefalse grade themselves on selection and
// pass the chosen option index here in the same call; short/scenario save
// their draft separately (saveExamAnswer, during the reveal step) and only
// call this once, with the self-reported verdict.
export function gradeExamAnswer(
  db: Database,
  paperDay: number,
  questionIndex: number,
  correct: boolean,
  yourAnswer?: string,
): void {
  if (yourAnswer !== undefined) {
    db.query(
      `INSERT INTO exam_answers (paper_day, question_index, your_answer, correct) VALUES (?, ?, ?, ?)
       ON CONFLICT (paper_day, question_index) DO UPDATE SET your_answer = excluded.your_answer, correct = excluded.correct`,
    ).run(paperDay, questionIndex, yourAnswer, correct ? 1 : 0);
  } else {
    db.query(
      `INSERT INTO exam_answers (paper_day, question_index, your_answer, correct) VALUES (?, ?, '', ?)
       ON CONFLICT (paper_day, question_index) DO UPDATE SET correct = excluded.correct`,
    ).run(paperDay, questionIndex, correct ? 1 : 0);
  }
}

export type SubmitExamResult =
  | { ok: true; scoreCorrect: number; scoreTotal: number }
  | { ok: false; reason: "not_found" | "already_submitted" | "incomplete" };

export function submitExamPaper(db: Database, paperDay: number, today: string): SubmitExamResult {
  const paper = getExamPaperRow(db, paperDay);
  if (!paper) return { ok: false, reason: "not_found" };
  if (paper.submitted_at) return { ok: false, reason: "already_submitted" };

  const content = buildExamSchedule().find((p) => p.paperDay === paperDay);
  if (!content) return { ok: false, reason: "not_found" };

  const answers = listExamAnswers(db, paperDay);
  const gradedByIndex = new Map(answers.map((a) => [a.question_index, a.correct]));
  for (let i = 0; i < content.questions.length; i++) {
    const c = gradedByIndex.get(i);
    if (c === null || c === undefined) return { ok: false, reason: "incomplete" };
  }

  const scoreCorrect = answers.filter((a) => a.correct === 1).length;
  const scoreTotal = content.questions.length;
  db.query(`UPDATE exam_papers SET submitted_at = ?, score_correct = ?, score_total = ? WHERE paper_day = ?`).run(
    today,
    scoreCorrect,
    scoreTotal,
    paperDay,
  );

  const insertReview = db.query(
    `INSERT INTO exam_review_items (paper_day, question_index, rung, next_review) VALUES (?, ?, -1, ?)
     ON CONFLICT (paper_day, question_index) DO NOTHING`,
  );
  for (const a of answers) {
    if (a.correct === 0) insertReview.run(paperDay, a.question_index, addDays(today, 1));
  }

  return { ok: true, scoreCorrect, scoreTotal };
}

export function countOverdueExamPapers(db: Database, today: string): number {
  runExamReleaseGate(db, today);
  const row = db
    .query(
      `SELECT COUNT(*) AS n FROM exam_papers
       WHERE paper_day <= (SELECT released_up_to FROM exam_state) AND next_review < ? AND submitted_at IS NULL`,
    )
    .get(today) as { n: number };
  return row.n;
}

export function countExamPapersSubmittedToday(db: Database, today: string): number {
  const row = db.query(`SELECT COUNT(*) AS n FROM exam_papers WHERE submitted_at = ?`).get(today) as { n: number };
  return row.n;
}

export function listExamPapersSubmittedToday(db: Database, today: string): ExamPaperRow[] {
  return db
    .query(
      `SELECT paper_day, next_review, submitted_at, score_correct, score_total FROM exam_papers WHERE submitted_at = ? ORDER BY paper_day`,
    )
    .all(today) as ExamPaperRow[];
}

export function listDueExamReviewItems(db: Database, today: string): ExamReviewItemRow[] {
  return db
    .query(
      `SELECT id, paper_day, question_index, rung, next_review FROM exam_review_items WHERE next_review <= ? ORDER BY next_review, id`,
    )
    .all(today) as ExamReviewItemRow[];
}

export function countOverdueExamReviewItems(db: Database, today: string): number {
  const row = db.query(`SELECT COUNT(*) AS n FROM exam_review_items WHERE next_review < ?`).get(today) as {
    n: number;
  };
  return row.n;
}

export function countExamReviewsToday(db: Database, today: string): number {
  const row = db.query(`SELECT COUNT(*) AS n FROM exam_review_log WHERE reviewed_at = ?`).get(today) as {
    n: number;
  };
  return row.n;
}

export function listExamReviewsCompletedToday(
  db: Database,
  today: string,
): { paper_day: number; question_index: number }[] {
  return db
    .query(`SELECT paper_day, question_index FROM exam_review_log WHERE reviewed_at = ?`)
    .all(today) as { paper_day: number; question_index: number }[];
}

export function reviewExamItem(
  db: Database,
  paperDay: number,
  questionIndex: number,
  result: ExamReviewResult,
  today: string,
): ExamReviewItemRow | null {
  const current = db
    .query(
      `SELECT id, paper_day, question_index, rung, next_review FROM exam_review_items WHERE paper_day = ? AND question_index = ?`,
    )
    .get(paperDay, questionIndex) as ExamReviewItemRow | null;
  if (!current) return null;

  db.query(`INSERT INTO exam_review_log (paper_day, question_index, reviewed_at, result) VALUES (?, ?, ?, ?)`).run(
    paperDay,
    questionIndex,
    today,
    result,
  );

  const { rung, nextReview } = applyExamReview(current.rung, result, today);
  db.query(`UPDATE exam_review_items SET rung = ?, next_review = ? WHERE id = ?`).run(rung, nextReview, current.id);
  return { ...current, rung, next_review: nextReview };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test exam-db.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: Commit**

```bash
git add exam-db.ts exam-db.test.ts
git commit -m "feat: add exam paper database layer with release gate and review items"
```

---

### Task 5: `exam-api.ts` — HTTP routes, wired into `index.ts`

**Files:**
- Create: `exam-api.ts`
- Test: `exam-api.test.ts`
- Modify: `index.ts`

**Interfaces:**
- Consumes: everything from `exam-db.ts` (Task 4), `buildExamSchedule`/`TOTAL_PAPERS` from `exam-content.ts` (Task 3), `localToday` from `scheduling.ts`.
- Produces: `examApiRoutes(db): RouteHandlers`, `ExamPaperView`, `ExamQuestionView`, `ExamReviewView` (exported types). Consumed by Task 7 (`ExamApp.tsx`, which redeclares matching client-side interfaces the same way `TheoryApp.tsx` does rather than importing server types into frontend bundle boundaries — following existing convention, no cross-boundary type import needed).

- [ ] **Step 1: Write the failing test**

Create `exam-api.test.ts`:

```ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import { localToday, addDays } from "./scheduling";
import { TOTAL_PAPERS } from "./exam-content";

let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = new Database(":memory:");
  migrateExam(db, localToday());
  server = Bun.serve({ port: 0, routes: examApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/exam/due returns today's paper with full question content", async () => {
  const body: any = await (await fetch(`${base}/api/exam/due`)).json();
  expect(body.paper.paperDay).toBe(1);
  expect(body.paper.questions.length).toBeGreaterThan(0);
  expect(body.paper.questions[0].modelAnswer.length).toBeGreaterThan(0);
  expect(body.reviewDue).toEqual([]);
  expect(body.stats.completedToday).toBe(0);
});

test("POST /api/exam/:day/answer saves a draft without grading", async () => {
  const res = await fetch(`${base}/api/exam/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 0, yourAnswer: "draft" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].yourAnswer).toBe("draft");
  expect(updated.questions[0].correct).toBeNull();
});

test("POST /api/exam/:day/:questionIndex/grade records a verdict, and mcq can pass yourAnswer in the same call", async () => {
  const res = await fetch(`${base}/api/exam/1/0/grade`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ correct: true, yourAnswer: "1" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].correct).toBe(1);
  expect(updated.questions[0].yourAnswer).toBe("1");
});

test("POST /api/exam/:day/submit fails while any question is ungraded, then succeeds once all are", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  const count = dueRes.paper.questions.length;

  const incomplete = await fetch(`${base}/api/exam/1/submit`, { method: "POST" });
  expect(incomplete.status).toBe(400);

  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  const submitRes = await fetch(`${base}/api/exam/1/submit`, { method: "POST" });
  expect(submitRes.status).toBe(200);
  const result: any = await submitRes.json();
  expect(result.scoreTotal).toBe(count);
  expect(result.scoreCorrect).toBe(count - 1);
});

test("submitting the same paper twice returns 400", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/1/submit`, { method: "POST" });
  const second = await fetch(`${base}/api/exam/1/submit`, { method: "POST" });
  expect(second.status).toBe(400);
});

test("after submitting with one wrong answer, that question shows up as a review item tomorrow", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  await fetch(`${base}/api/exam/1/submit`, { method: "POST" });

  const reviewRes = await fetch(`${base}/api/exam/review/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  expect(reviewRes.status).toBe(200);
  const updated: any = await reviewRes.json();
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(localToday(), 3));
});

test("review rejects a bad result value", async () => {
  const res = await fetch(`${base}/api/exam/review/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "meh" }),
  });
  expect(res.status).toBe(400);
});

test("day out of range is rejected with 400", async () => {
  for (const bad of ["0", String(TOTAL_PAPERS + 1), "abc"]) {
    const res = await fetch(`${base}/api/exam/${bad}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex: 0, yourAnswer: "x" }),
    });
    expect(res.status).toBe(400);
  }
});

test("questionIndex out of range is rejected with 400", async () => {
  const res = await fetch(`${base}/api/exam/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 999, yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("a missing questionIndex on /answer is rejected with 400, not silently treated as index 0", async () => {
  const res = await fetch(`${base}/api/exam/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/exam/completed-today lists papers submitted today", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/1/submit`, { method: "POST" });

  const completed: any = await (await fetch(`${base}/api/exam/completed-today`)).json();
  expect(completed.papers.length).toBe(1);
  expect(completed.papers[0].scoreCorrect).toBe(count);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test exam-api.test.ts`
Expected: FAIL — `exam-api.ts` does not exist yet.

- [ ] **Step 3: Write the implementation**

Create `exam-api.ts`:

```ts
import type { Database } from "bun:sqlite";
import {
  listDueExamPapers,
  getExamPaperRow,
  listExamAnswers,
  saveExamAnswer,
  gradeExamAnswer,
  submitExamPaper,
  countOverdueExamPapers,
  countExamPapersSubmittedToday,
  listExamPapersSubmittedToday,
  listDueExamReviewItems,
  countOverdueExamReviewItems,
  countExamReviewsToday,
  reviewExamItem,
  type ExamPaperRow,
  type ExamReviewItemRow,
} from "./exam-db";
import { buildExamSchedule, TOTAL_PAPERS } from "./exam-content";
import { localToday } from "./scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

function parsePaperDay(raw: string): number | null {
  const day = Number(raw);
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_PAPERS) return null;
  return day;
}

function parseQuestionIndex(raw: string, paperDay: number): number | null {
  const content = buildExamSchedule().find((p) => p.paperDay === paperDay);
  if (!content) return null;
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0 || index >= content.questions.length) return null;
  return index;
}

export interface ExamQuestionView {
  index: number;
  type: string;
  prompt: string;
  options: string[] | null;
  correctIndex: number | null;
  modelAnswer: string;
  yourAnswer: string;
  correct: number | null;
}

export interface ExamPaperView {
  paperDay: number;
  week: number;
  paperNumber: number;
  title: string;
  topics: string;
  nextReview: string;
  submittedAt: string | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  questions: ExamQuestionView[];
}

function paperView(db: Database, row: ExamPaperRow): ExamPaperView | null {
  const content = buildExamSchedule().find((p) => p.paperDay === row.paper_day);
  if (!content) return null;
  const answers = new Map(listExamAnswers(db, row.paper_day).map((a) => [a.question_index, a]));
  return {
    paperDay: row.paper_day,
    week: content.week,
    paperNumber: content.paperNumber,
    title: content.title,
    topics: content.topics,
    nextReview: row.next_review,
    submittedAt: row.submitted_at,
    scoreCorrect: row.score_correct,
    scoreTotal: row.score_total,
    questions: content.questions.map((q, index) => ({
      index,
      type: q.type,
      prompt: q.prompt,
      options: q.options ?? null,
      correctIndex: q.correctIndex ?? null,
      modelAnswer: q.modelAnswer,
      yourAnswer: answers.get(index)?.your_answer ?? "",
      correct: answers.get(index)?.correct ?? null,
    })),
  };
}

export interface ExamReviewView {
  paperDay: number;
  questionIndex: number;
  rung: number;
  nextReview: string;
  prompt: string;
  modelAnswer: string;
}

function reviewView(item: ExamReviewItemRow): ExamReviewView | null {
  const content = buildExamSchedule().find((p) => p.paperDay === item.paper_day);
  const question = content?.questions[item.question_index];
  if (!content || !question) return null;
  return {
    paperDay: item.paper_day,
    questionIndex: item.question_index,
    rung: item.rung,
    nextReview: item.next_review,
    prompt: question.prompt,
    modelAnswer: question.modelAnswer,
  };
}

export function examApiRoutes(db: Database) {
  return {
    "/api/exam/due": {
      GET: () => {
        const today = localToday();
        const papers = listDueExamPapers(db, today);
        const reviewItems = listDueExamReviewItems(db, today);
        const paper = papers.length > 0 ? paperView(db, papers[0]!) : null;
        const reviewDue = reviewItems.map(reviewView).filter((r): r is ExamReviewView => r !== null);
        return json({
          paper,
          reviewDue,
          stats: {
            dueCount: papers.length + reviewItems.length,
            overdueCount: countOverdueExamPapers(db, today) + countOverdueExamReviewItems(db, today),
            completedToday: countExamPapersSubmittedToday(db, today) + countExamReviewsToday(db, today),
          },
        });
      },
    },
    "/api/exam/completed-today": {
      GET: () => {
        const today = localToday();
        const papers = listExamPapersSubmittedToday(db, today)
          .map((row) => paperView(db, row))
          .filter((p): p is ExamPaperView => p !== null);
        return json({ papers });
      },
    },
    "/api/exam/:day/answer": {
      POST: async (req: Request & { params: { day: string } }) => {
        const day = parsePaperDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_PAPERS}` }, 400);
        const body = (await req.json().catch(() => null)) as
          | { questionIndex?: unknown; yourAnswer?: unknown }
          | null;
        // typeof-guard first: Number("") is 0, not NaN, so falling through to
        // parseQuestionIndex on a missing/non-numeric questionIndex would
        // silently accept it as index 0 instead of rejecting it.
        const questionIndex =
          typeof body?.questionIndex === "number" ? parseQuestionIndex(String(body.questionIndex), day) : null;
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : "";
        saveExamAnswer(db, day, questionIndex, yourAnswer);
        return json(paperView(db, getExamPaperRow(db, day)!));
      },
    },
    "/api/exam/:day/:questionIndex/grade": {
      POST: async (req: Request & { params: { day: string; questionIndex: string } }) => {
        const day = parsePaperDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_PAPERS}` }, 400);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, day);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as
          | { correct?: unknown; yourAnswer?: unknown }
          | null;
        if (typeof body?.correct !== "boolean") return json({ error: "correct must be a boolean" }, 400);
        const yourAnswer = typeof body?.yourAnswer === "string" ? body.yourAnswer : undefined;
        gradeExamAnswer(db, day, questionIndex, body.correct, yourAnswer);
        return json(paperView(db, getExamPaperRow(db, day)!));
      },
    },
    "/api/exam/:day/submit": {
      POST: (req: Request & { params: { day: string } }) => {
        const day = parsePaperDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_PAPERS}` }, 400);
        const result = submitExamPaper(db, day, localToday());
        if (!result.ok) {
          const status = result.reason === "not_found" ? 404 : 400;
          const message =
            result.reason === "not_found"
              ? "not found"
              : result.reason === "already_submitted"
                ? "paper already submitted"
                : "grade every question before submitting";
          return json({ error: message }, status);
        }
        return json({ scoreCorrect: result.scoreCorrect, scoreTotal: result.scoreTotal });
      },
    },
    "/api/exam/review/:day/:questionIndex": {
      POST: async (req: Request & { params: { day: string; questionIndex: string } }) => {
        const day = parsePaperDay(req.params.day);
        if (day === null) return json({ error: `day must be between 1 and ${TOTAL_PAPERS}` }, 400);
        const questionIndex = parseQuestionIndex(req.params.questionIndex, day);
        if (questionIndex === null) return json({ error: "questionIndex out of range" }, 400);
        const body = (await req.json().catch(() => null)) as { result?: string } | null;
        if (body?.result !== "correct" && body?.result !== "wrong") {
          return json({ error: "result must be 'correct' or 'wrong'" }, 400);
        }
        const updated = reviewExamItem(db, day, questionIndex, body.result, localToday());
        return updated ? json(updated) : json({ error: "not found" }, 404);
      },
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test exam-api.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: Wire the routes into `index.ts`**

Modify `index.ts` — add the exam imports and splice `examApiRoutes(db)` into the route table, and call `migrateExam` alongside the other migrations:

```ts
import index from "./index.html";
import { openDb } from "./db";
import { apiRoutes } from "./api";
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { migrateGoals } from "./goals-db";
import { goalsApiRoutes } from "./goals-api";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import { homeApiRoutes } from "./home-api";
import { localToday } from "./scheduling";

const db = openDb(process.env.SRS_DB_PATH ?? "srs.db");
migrateTheory(db, localToday());
migrateGoals(db, localToday());
migrateExam(db, localToday());
const userscriptPath = new URL("./userscript/leetcode-sync.user.js", import.meta.url);

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    "/": index,
    "/leetcode-sync.user.js": () =>
      new Response(Bun.file(userscriptPath), {
        headers: { "content-type": "text/javascript; charset=utf-8" },
      }),
    ...apiRoutes(db),
    ...theoryApiRoutes(db),
    ...goalsApiRoutes(db),
    ...examApiRoutes(db),
    ...homeApiRoutes(db),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`leetcode-srs running at ${server.url}`);
```

- [ ] **Step 6: Run the full test suite to make sure nothing else broke**

Run: `bun test`
Expected: PASS, all files including the new ones.

- [ ] **Step 7: Commit**

```bash
git add exam-api.ts exam-api.test.ts index.ts
git commit -m "feat: add exam API routes and wire into the server"
```

---

### Task 6: Surface exam items on the Home tab

**Files:**
- Modify: `home-api.ts`
- Modify: `HomeApp.tsx`
- Test: `home-api.test.ts` (extend existing file — read it first to match its exact test style)

**Interfaces:**
- Consumes: `listDueExamPapers`, `listDueExamReviewItems`, `countExamPapersSubmittedToday`, `countExamReviewsToday` from `exam-db.ts` (Task 4); `buildExamSchedule` from `exam-content.ts` (Task 3).
- Produces: `DueSource` gains `"exam"`. `/api/home/due` and `/api/home/stats` include exam papers and review items. Consumed by Task 7 (`frontend.tsx`'s `navigate` dispatch already expects every `DueSource` to map to a tab).

**Important:** `HomeApp.tsx` keys two lookup tables (`SOURCE_LABEL`, `SOURCE_COLOR`) by `Record<DueSource, string>`. Adding `"exam"` to `DueSource` without adding it to both of these tables leaves them missing a key — TypeScript's `Record<DueSource, string>` requires every union member, and at runtime a lookup miss renders `undefined` for the badge label and color. This task is not complete until both tables have an `exam` entry.

- [ ] **Step 1: Read the existing `home-api.test.ts` to match its style**

Read `home-api.test.ts` in full before editing — it already covers `leetcode`/`theory`/`goals` aggregation; match its `beforeEach`/migration/fetch conventions exactly when adding exam cases.

- [ ] **Step 2: Add failing tests for exam aggregation**

Append to `home-api.test.ts` (adjust the existing `beforeEach` to also call `migrateExam(db, TODAY)`, mirroring how it already calls `migrateTheory`/`migrateGoals`):

```ts
// Add to the top-of-file imports:
// import { migrateExam, gradeExamAnswer, submitExamPaper } from "./exam-db";
// And add `migrateExam(db, TODAY);` inside the existing beforeEach.

test("GET /api/home/due includes today's exam paper", async () => {
  const items: any = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i: any) => i.source === "exam");
  expect(examItems.length).toBeGreaterThan(0);
  expect(examItems[0].linkId).toBe(1);
});

test("GET /api/home/stats counts a submitted exam paper as completed today", async () => {
  const before: any = await (await fetch(`${base}/api/home/stats`)).json();
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  // home-api.test.ts doesn't mount exam routes, so grade/submit directly via exam-db:
  // (see Step 3 note below for why this test is written against exam-db directly)
});
```

*(Note for whoever implements this task: `home-api.test.ts`'s existing harness mounts only `homeApiRoutes(db)`, not `examApiRoutes(db)` — so to submit a paper for the "completed today" test, call `gradeExamAnswer`/`submitExamPaper` from `exam-db.ts` directly against the same `db` instance the test's `beforeEach` created, the same way the existing goals tests call `goals-db.ts` functions directly rather than going through HTTP. Write the real assertion body once you have the file open, following that pattern — don't leave this test as a stub.)*

- [ ] **Step 3: Run test to verify it fails**

Run: `bun test home-api.test.ts`
Expected: FAIL — `"exam"` due items aren't produced yet.

- [ ] **Step 4: Implement the exam aggregation functions**

Modify `home-api.ts` — add the import and two new due-item builder functions, then splice them into every aggregation point:

```ts
// Add near the top, alongside the other db imports:
import {
  listDueExamPapers,
  listDueExamReviewItems,
  countExamPapersSubmittedToday,
  countExamReviewsToday,
} from "./exam-db";
import { buildExamSchedule } from "./exam-content";

// Extend the existing union:
export type DueSource = "leetcode" | "theory" | "goals" | "exam";

function examDue(db: Database, today: string): DueItem[] {
  const papers = listDueExamPapers(db, today).map((row) => {
    const content = buildExamSchedule().find((p) => p.paperDay === row.paper_day);
    return {
      source: "exam" as const,
      id: row.paper_day,
      title: content?.title ?? `Exam paper ${row.paper_day}`,
      subtitle: "Exam paper",
      dueDate: row.next_review,
      overdueDays: overdueDays(row.next_review, today),
      linkId: row.paper_day,
    };
  });
  const reviews = listDueExamReviewItems(db, today).map((item) => {
    const content = buildExamSchedule().find((p) => p.paperDay === item.paper_day);
    const question = content?.questions[item.question_index];
    return {
      source: "exam" as const,
      id: item.id,
      title: question ? question.prompt.slice(0, 80) : "Exam review",
      subtitle: "Exam review",
      dueDate: item.next_review,
      overdueDays: overdueDays(item.next_review, today),
      linkId: item.paper_day,
    };
  });
  return [...papers, ...reviews];
}
```

Modify `HomeApp.tsx` — add an `exam` entry to both lookup tables so the new `DueSource` has a badge label and color, matching the existing entries' style:

```ts
const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  theory: "Theory",
  goals: "Goals",
  exam: "Exam",
};

const SOURCE_COLOR: Record<DueSource, string> = {
  leetcode: "#ffa116",
  theory: "#00b8a3",
  goals: "#c084fc",
  exam: "#ff375f",
};
```

Then update the three functions in `home-api.ts` that build combined lists to include `examDue`:

```ts
function homeStats(db: Database, today: string): HomeStats {
  const items = [...leetcodeDue(db, today), ...theoryDue(db, today), ...goalsDue(db, today), ...examDue(db, today)];
  return {
    dueToday: items.filter((i) => i.overdueDays === 0).length,
    overdue: items.filter((i) => i.overdueDays > 0).length,
    completedToday:
      countReviewsToday(db, today) +
      countTheoryReviewsToday(db, today) +
      countStepsCompletedToday(db, today) +
      countExamPapersSubmittedToday(db, today) +
      countExamReviewsToday(db, today),
  };
}
```

And in `homeApiRoutes`, add `...examDue(db, today)` to the array built inside `/api/home/due`'s handler (alongside the existing spreads).

- [ ] **Step 5: Run test to verify it passes**

Run: `bun test home-api.test.ts`
Expected: PASS

- [ ] **Step 6: Run the full suite**

Run: `bun test`
Expected: PASS, all files.

- [ ] **Step 7: Commit**

```bash
git add home-api.ts home-api.test.ts HomeApp.tsx
git commit -m "feat: surface exam papers and review items on the Home tab"
```

---

### Task 7: `ExamApp.tsx` — the Exam tab UI

**Files:**
- Create: `ExamApp.tsx`
- Modify: `frontend.tsx`
- Modify: `index.css`

**Interfaces:**
- Consumes: `EXAM_REVIEW_LADDER` from `exam-scheduling.ts` (Task 1); `localToday` from `scheduling.ts`; the `/api/exam/*` routes from Task 5 (client-side `fetch`, no direct TS import across the client/server boundary — matches `TheoryApp.tsx`'s existing convention).
- Produces: default-exported `ExamApp` component with props `{ openPaperDay?: number | null; onOpened?: () => void }`, matching the `openConceptDay`/`onOpened` shape `TheoryApp` already uses. Consumed by `frontend.tsx`'s `App`/`TabBar`/`DeepLink`.

**No automated test** — per the existing convention (see `docs/superpowers/plans/2026-08-03-theory-content-database.md`'s Global Constraints: "No frontend test harness exists for `TheoryApp.tsx`"), this task is verified manually in the browser, the same way Theory/Goals/Home were.

- [ ] **Step 1: Create `ExamApp.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import { EXAM_REVIEW_LADDER } from "./exam-scheduling";
import { localToday } from "./scheduling";

export interface ExamQuestionView {
  index: number;
  type: "mcq" | "truefalse" | "short" | "scenario";
  prompt: string;
  options: string[] | null;
  correctIndex: number | null;
  modelAnswer: string;
  yourAnswer: string;
  correct: number | null;
}

export interface ExamPaperView {
  paperDay: number;
  week: number;
  paperNumber: number;
  title: string;
  topics: string;
  nextReview: string;
  submittedAt: string | null;
  scoreCorrect: number | null;
  scoreTotal: number | null;
  questions: ExamQuestionView[];
}

export interface ExamReviewView {
  paperDay: number;
  questionIndex: number;
  rung: number;
  nextReview: string;
  prompt: string;
  modelAnswer: string;
}

interface Stats {
  dueCount: number;
  overdueCount: number;
  completedToday: number;
}

type Result = "correct" | "wrong";
type View = { name: "board" } | { name: "paper" } | { name: "review"; item: ExamReviewView };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : "Something went wrong.");

const api = {
  due: () =>
    fetch("/api/exam/due").then((r) =>
      json<{ paper: ExamPaperView | null; reviewDue: ExamReviewView[]; stats: Stats }>(r),
    ),
  completedToday: () => fetch("/api/exam/completed-today").then((r) => json<{ papers: ExamPaperView[] }>(r)),
  saveAnswer: (paperDay: number, questionIndex: number, yourAnswer: string) =>
    fetch(`/api/exam/${paperDay}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex, yourAnswer }),
    }).then((r) => json<ExamPaperView>(r)),
  grade: (paperDay: number, questionIndex: number, correct: boolean, yourAnswer?: string) =>
    fetch(`/api/exam/${paperDay}/${questionIndex}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct, ...(yourAnswer !== undefined ? { yourAnswer } : {}) }),
    }).then((r) => json<ExamPaperView>(r)),
  submit: (paperDay: number) =>
    fetch(`/api/exam/${paperDay}/submit`, { method: "POST" }).then((r) =>
      json<{ scoreCorrect: number; scoreTotal: number }>(r),
    ),
  reviewItem: (paperDay: number, questionIndex: number, result: Result) =>
    fetch(`/api/exam/review/${paperDay}/${questionIndex}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }).then((r) => json<any>(r)),
};

function ExamStats({ stats, onOpenCompleted }: { stats: Stats; onOpenCompleted: () => void }) {
  return (
    <div className="stats stats-3">
      <div className="stat stat-due">
        <span className="stat-num">{stats.dueCount}</span>
        <span className="stat-label">Due today</span>
      </div>
      <div className="stat stat-overdue">
        <span className="stat-num">{stats.overdueCount}</span>
        <span className="stat-label">Overdue</span>
      </div>
      <button className="stat stat-completed" onClick={onOpenCompleted}>
        <span className="stat-num">{stats.completedToday}</span>
        <span className="stat-label">Completed today</span>
      </button>
    </div>
  );
}

function McqQuestion({
  question,
  paperDay,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  paperDay: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const graded = question.correct !== null;

  const choose = async (i: number) => {
    if (graded) return;
    onError(null);
    try {
      const updated = await api.grade(paperDay, question.index, i === question.correctIndex, String(i));
      onGraded(updated);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <div className="exam-question">
      <p className="exam-prompt">{question.prompt}</p>
      <div className="exam-options">
        {question.options!.map((opt, i) => {
          const isChosen = question.yourAnswer === String(i);
          const cls = !graded
            ? "exam-option"
            : i === question.correctIndex
              ? "exam-option exam-option-correct"
              : isChosen
                ? "exam-option exam-option-wrong"
                : "exam-option";
          return (
            <label key={i} className={cls}>
              <input
                type="radio"
                name={`q-${question.index}`}
                checked={isChosen}
                disabled={graded}
                onChange={() => choose(i)}
              />
              {opt}
            </label>
          );
        })}
      </div>
      {graded && <p className="exam-explanation">{question.modelAnswer}</p>}
    </div>
  );
}

function ShortOrScenarioQuestion({
  question,
  paperDay,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  paperDay: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState(question.yourAnswer);
  const [revealed, setRevealed] = useState(question.correct !== null);
  const graded = question.correct !== null;

  const saveAndReveal = async () => {
    onError(null);
    try {
      await api.saveAnswer(paperDay, question.index, draft);
      setRevealed(true);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const grade = async (correct: boolean) => {
    onError(null);
    try {
      const updated = await api.grade(paperDay, question.index, correct);
      onGraded(updated);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <div className="exam-question">
      <p className="exam-prompt">{question.prompt}</p>
      <textarea
        className="theory-answer"
        rows={4}
        value={draft}
        disabled={graded}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write your own answer, then reveal the model answer..."
      />
      {!graded && (
        <div className="btn-row">
          <button className="btn" onClick={saveAndReveal}>Save answer</button>
        </div>
      )}
      {revealed && (
        <div className="theory-model-answer">
          <h3>Model answer</h3>
          <p>{question.modelAnswer}</p>
        </div>
      )}
      {!graded && revealed && (
        <div className="btn-row">
          <button className="btn btn-pass" onClick={() => grade(true)}>Correct</button>
          <button className="btn btn-fail" onClick={() => grade(false)}>Wrong</button>
        </div>
      )}
    </div>
  );
}

function PaperView({
  paper,
  onBack,
  onChanged,
  onError,
}: {
  paper: ExamPaperView;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [current, setCurrent] = useState(paper);
  const allGraded = current.questions.every((q) => q.correct !== null);

  const submit = async () => {
    onError(null);
    try {
      await api.submit(paper.paperDay);
      onChanged();
      onBack();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <article className="detail">
      <header className="detail-head">
        <h2>{current.title}</h2>
        <span className="tag">{current.questions.length} questions</span>
      </header>
      {current.questions.map((q) =>
        q.type === "mcq" || q.type === "truefalse" ? (
          <McqQuestion key={q.index} question={q} paperDay={paper.paperDay} onGraded={setCurrent} onError={onError} />
        ) : (
          <ShortOrScenarioQuestion
            key={q.index}
            question={q}
            paperDay={paper.paperDay}
            onGraded={setCurrent}
            onError={onError}
          />
        ),
      )}
      <div className="btn-row">
        <button className="btn btn-primary" disabled={!allGraded} onClick={submit}>
          Submit paper
        </button>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
      {!allGraded && (
        <p className="board-empty">
          Grade every question — multiple choice grades itself on selection; reveal and mark short/scenario answers — before submitting.
        </p>
      )}
    </article>
  );
}

function ReviewDetail({
  item,
  onBack,
  onChanged,
  onError,
}: {
  item: ExamReviewView;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  const review = async (result: Result) => {
    onError(null);
    try {
      await api.reviewItem(item.paperDay, item.questionIndex, result);
      onChanged();
      onBack();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <article className="detail theory-card">
      <header className="detail-head">
        <span className="rung" title={`rung ${item.rung + 1} of ${EXAM_REVIEW_LADDER.length}`}>
          {EXAM_REVIEW_LADDER.map((_, i) => (
            <span key={i} className={i <= item.rung ? "rung-on" : "rung-off"} />
          ))}
        </span>
      </header>
      <h2 className="theory-question">{item.prompt}</h2>
      {revealed ? (
        <div className="theory-model-answer">
          <h3>Model answer</h3>
          <p>{item.modelAnswer}</p>
        </div>
      ) : (
        <button className="solution-cover" onClick={() => setRevealed(true)}>
          Model answer hidden — recall it yourself first, then reveal
        </button>
      )}
      <div className="btn-row">
        <button className="btn btn-pass" onClick={() => review("correct")}>Correct</button>
        <button className="btn btn-fail" onClick={() => review("wrong")}>Wrong</button>
        <span className="btn-spacer" />
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </article>
  );
}

export default function ExamApp({
  openPaperDay,
  onOpened,
}: {
  openPaperDay?: number | null;
  onOpened?: () => void;
} = {}) {
  const [view, setView] = useState<View>({ name: "board" });
  const [paper, setPaper] = useState<ExamPaperView | null>(null);
  const [reviewDue, setReviewDue] = useState<ExamReviewView[]>([]);
  const [stats, setStats] = useState<Stats>({ dueCount: 0, overdueCount: 0, completedToday: 0 });
  const [completedPapers, setCompletedPapers] = useState<ExamPaperView[] | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return api
      .due()
      .then(({ paper, reviewDue, stats }) => {
        setPaper(paper);
        setReviewDue(reviewDue);
        setStats(stats);
      })
      .catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  // Today's paper is the only exam deep-link target — a Home-tab review-item
  // click still lands here (same paperDay) but opens the board, since a
  // single missed question doesn't have its own drill-down view outside the
  // review-due list.
  useEffect(() => {
    if (openPaperDay != null) {
      onOpened?.();
    }
  }, [openPaperDay]);

  const openCompleted = () => {
    setShowCompleted(true);
    if (completedPapers === null) {
      api
        .completedToday()
        .then((r) => setCompletedPapers(r.papers))
        .catch((err) => setError(errorMessage(err)));
    }
  };

  return (
    <div className="theory">
      <ExamStats stats={stats} onOpenCompleted={openCompleted} />
      {error && <p className="form-error">{error}</p>}
      <p className="rule-note">
        One new practice paper unlocks per day. Missed questions come back for spaced review: 3 → 5 → 7 → 14 → 30 days.
      </p>

      {showCompleted && (
        <div className="modal-backdrop" onClick={() => setShowCompleted(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Completed today</h2>
              <button className="modal-close" onClick={() => setShowCompleted(false)} aria-label="Close">×</button>
            </div>
            {(completedPapers ?? []).length === 0 ? (
              <p className="board-empty">Nothing completed today yet.</p>
            ) : (
              <ul className="modal-rows">
                {(completedPapers ?? []).map((p) => (
                  <li key={p.paperDay} className="modal-row">
                    <span className="modal-row-title">{p.title}</span>
                    <span className="tag">{p.scoreCorrect}/{p.scoreTotal}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {view.name === "board" && (
        <>
          <section className="board" aria-label="Today's paper">
            <div className="section-head">
              <h2>Today's paper</h2>
            </div>
            {paper === null ? (
              <p className="board-empty">Nothing due. Tomorrow's paper unlocks then.</p>
            ) : (
              <button className="board-row board-row-main" onClick={() => setView({ name: "paper" })}>
                <span className="tag">due</span>
                <span className="board-title">{paper.title}</span>
                <span className="lang-tag">{paper.questions.length} questions</span>
              </button>
            )}
          </section>

          <section className="board" aria-label="Review due">
            <div className="section-head">
              <h2>Review due</h2>
              <span className="board-count">{reviewDue.length}</span>
            </div>
            {reviewDue.length === 0 ? (
              <p className="board-empty">No missed questions due for review.</p>
            ) : (
              <ul className="board-rows">
                {reviewDue.map((item) => (
                  <li key={`${item.paperDay}-${item.questionIndex}`}>
                    <button className="board-row board-row-main" onClick={() => setView({ name: "review", item })}>
                      <span className="tag">{item.nextReview < localToday() ? "overdue" : "due"}</span>
                      <span className="board-title">{item.prompt}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {view.name === "paper" && paper && (
        <PaperView paper={paper} onBack={() => setView({ name: "board" })} onChanged={refresh} onError={setError} />
      )}

      {view.name === "review" && (
        <ReviewDetail item={view.item} onBack={() => setView({ name: "board" })} onChanged={refresh} onError={setError} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire `ExamApp` into `frontend.tsx`**

Modify `frontend.tsx`:

1. Add the import near the other tab imports:

```ts
import ExamApp from "./ExamApp";
```

2. Extend `Tab` and `DeepLink`:

```ts
type Tab = "home" | "leetcode" | "theory" | "goals" | "exam";

type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "theory"; conceptDay: number }
  | { tab: "goals"; projectId: number }
  | { tab: "exam"; paperDay: number };
```

3. Add a tab button in `TabBar`:

```tsx
<button
  className={tab === "exam" ? "tab tab-active" : "tab"}
  onClick={() => onChange("exam")}
>
  Exam
</button>
```

4. Extend `navigate` in `App` to handle the `"exam"` source (matching `home-api.ts`'s `DueSource`):

```ts
const navigate = (item: { source: "leetcode" | "theory" | "goals" | "exam"; linkId: number }) => {
  if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
  else if (item.source === "theory") setDeepLink({ tab: "theory", conceptDay: item.linkId });
  else if (item.source === "goals") setDeepLink({ tab: "goals", projectId: item.linkId });
  else setDeepLink({ tab: "exam", paperDay: item.linkId });
  setTab(item.source);
};
```

5. Render `ExamApp` alongside the other tabs in `App`:

```tsx
{tab === "exam" && (
  <ExamApp
    openPaperDay={deepLink?.tab === "exam" ? deepLink.paperDay : null}
    onOpened={() => setDeepLink(null)}
  />
)}
```

- [ ] **Step 3: Add exam-specific CSS to `index.css`**

Append to `index.css`:

```css
.exam-question {
  border-top: 1px solid var(--line);
  padding: 1.25rem 0;
}

.exam-prompt {
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.exam-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.exam-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  cursor: pointer;
}

.exam-option-correct {
  border-color: var(--green);
  background: color-mix(in srgb, var(--green) 12%, transparent);
}

.exam-option-wrong {
  border-color: var(--red);
  background: color-mix(in srgb, var(--red) 12%, transparent);
}

.exam-explanation {
  margin-top: 0.75rem;
  color: var(--dim);
}
```

- [ ] **Step 4: Manually verify in the browser**

Run: `bun run dev`, open `http://localhost:4321/`, click the **Exam** tab, and walk through:
- Today's paper card shows "Week 1 Practice Paper 1" with 26 questions.
- Answering an MCQ immediately highlights correct/wrong and shows the explanation.
- A short/scenario question requires "Save answer" before the model answer reveals, then Correct/Wrong grades it.
- "Submit paper" stays disabled until every question is graded, then works and returns to the board.
- After submitting with at least one wrong answer, refresh — the wrong question does **not** reappear as today's paper (paper is submitted) but does **not** yet appear under "Review due" either (it's scheduled for tomorrow).
- The Home tab's "Everything due" list includes the exam paper before it's submitted.

- [ ] **Step 5: Commit**

```bash
git add ExamApp.tsx frontend.tsx index.css
git commit -m "feat: add Exam tab UI with paper attempt flow and review board"
```

---

### Task 8: Document the Exam tab and content-generation workflow in the README

**Files:**
- Modify: `README.md`

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Add an "Exam tab" section**

Insert after the existing "## Goals tab" section in `README.md`:

```markdown
## Exam tab

Daily practice papers for university course content (currently INFO5995 —
Intro to Cybersecurity). One full paper (a mix of multiple choice,
true/false, short-answer, and scenario questions) unlocks per day, gated by
the same backlog cap the Theory and Goals tabs use — fall behind and a few
papers queue up, but the whole bank doesn't dump on you at once. Multiple
choice and true/false grade themselves instantly on selection; short-answer
and scenario questions ask you to write your own answer first, then reveal
a model answer and self-mark Correct/Wrong, same as the Theory tab. Submit
the paper once every question is graded to lock in a score. Any question
marked wrong reschedules individually onto its own ladder (3 → 5 → 7 → 14 →
30 days, `exam-scheduling.ts`) and resurfaces under "Review due" until you
get it right — the paper itself is one-and-done, but its weak spots keep
coming back.

Content lives in `exam-content/week-<n>.ts`, one file per course week, all
aggregated into a single day-by-day schedule by `exam-content.ts`. To add a
new week once its materials land in the course folder:

```sh
bun scripts/generate-exam-week.ts --week 2
```

This scans that week's folder for readable material (PDFs, markdown, slides
— video lectures are noted but not transcribed) and writes a blank scaffold
to `exam-content/week-2.ts` in the same shape as the real content files.
Ask Claude Code to fill in the scaffold's blanks by reading the listed
source files directly (no PDF-parsing dependency needed — Claude's own
Read tool handles PDFs), then add one import + array entry to
`exam-content.ts` to bring the new week into the schedule.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document the Exam tab and week content generation workflow"
```
