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
export function buildScaffold(course: string, week: number, paperCount: number, materials: string[]): ExamPaperSeed[] {
  const papers: ExamPaperSeed[] = [];
  for (let n = 1; n <= paperCount; n++) {
    papers.push({
      course,
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
// reveal instead. Keep each paper's mix roughly 8 mcq / 4 short / 2 scenario.
${videoNote}import type { ExamPaperSeed } from "../types";

export const WEEK_${week}_PAPERS: ExamPaperSeed[] = ${JSON.stringify(papers, null, 2)};
`;
}

export interface GenerateOptions {
  week: number;
  weekDir: string;
  outPath: string;
  course: string;
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
export async function generateWeekFile(options: GenerateOptions): Promise<GenerateResult> {
  const { week, weekDir, outPath, course, paperCount = 3, force = false } = options;
  if (!existsSync(weekDir)) {
    return { written: false, reason: `Week folder not found: ${weekDir}`, path: outPath };
  }
  if (existsSync(outPath) && !force) {
    return { written: false, reason: `${outPath} already exists — pass force to overwrite`, path: outPath };
  }
  const { materials, videos } = scanWeekFolder(weekDir);
  const papers = buildScaffold(course, week, paperCount, materials);
  const source = renderScaffoldModule(week, papers, videos);
  await Bun.write(outPath, source);
  return { written: true, path: outPath };
}

function parseArgs(argv: string[]): { week: number; course: string; courseDir?: string; papers: number; force: boolean } {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const week = Number(get("--week"));
  if (!Number.isInteger(week) || week < 1) {
    throw new Error(
      "Usage: bun scripts/generate-exam-week.ts --week <n> [--course <code>] [--course-dir <path>] [--papers <n>] [--force]",
    );
  }
  const papersArg = get("--papers");
  return {
    week,
    course: get("--course") ?? "INFO5995",
    courseDir: get("--course-dir"),
    papers: papersArg ? Number(papersArg) : 3,
    force: argv.includes("--force"),
  };
}

const DEFAULT_COURSE_DIR =
  "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO5995 Intro To Cybersecurity";

if (import.meta.main) {
  const { week, course, courseDir, papers, force } = parseArgs(process.argv.slice(2));
  const weekDir = join(courseDir ?? DEFAULT_COURSE_DIR, `Week ${week}`);
  const outPath = join(import.meta.dir, "..", "exam-content", course.toLowerCase(), `week-${week}.ts`);
  const result = await generateWeekFile({ week, weekDir, outPath, course, paperCount: papers, force });
  if (!result.written) {
    console.error(result.reason);
    process.exit(1);
  }
  console.log(`Wrote scaffold to ${result.path} — ask Claude Code to fill it in from ${weekDir}`);
}
