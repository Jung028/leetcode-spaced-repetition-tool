// Read-only diff between what's authored (exam-content/<course>/week-N.ts,
// via each paper's sourceFiles) and what's actually sitting in a course's
// real week folder on disk. Powers the /generate-week-content command:
// "new weeks" need authoring from scratch (same set findPendingWeeks()
// already finds); "updatable weeks" already have content, but new material
// has landed in the folder since — a video still needing transcription, or
// a material file no paper's sourceFiles lists yet.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { COURSE_DIRS, findPendingWeeks, findWeekFolder } from "../exam/sync";
import { scanWeekFolder } from "./generate-exam-week";
import { buildExamSchedule } from "../exam/content";
import type { ExamPaperSeed } from "../exam-content/types";

export interface NewWeek {
  course: string;
  week: number;
  weekDir: string;
}

export interface UpdatableWeek {
  course: string;
  week: number;
  weekDir: string;
  // Material files (relative to weekDir) no existing paper's sourceFiles
  // lists yet — these are what an update pass should read and cover.
  newSourceFiles: string[];
  // Videos (relative to weekDir) with no "<name>.transcript.md" yet —
  // transcribe these first, then re-scan; the transcript becomes a
  // newSourceFiles entry once it exists.
  pendingVideos: string[];
}

export interface WeekUpdatePlan {
  newWeeks: NewWeek[];
  updatableWeeks: UpdatableWeek[];
}

function knownSourceFiles(papers: ExamPaperSeed[], course: string, week: number): Set<string> {
  const known = new Set<string>();
  for (const p of papers) {
    if (p.course !== course || p.week !== week) continue;
    for (const f of p.sourceFiles) known.add(f);
  }
  return known;
}

function transcriptRelPath(videoRelPath: string): string {
  return videoRelPath.replace(/\.(mp4|mov)$/i, ".transcript.md");
}

// courseDirs defaults to the real COURSE_DIRS map (same pattern as
// findPendingWeeks/resolveWeekDir); tests inject a fixture map instead.
export function findWeekUpdates(courseDirs: Record<string, string> = COURSE_DIRS): WeekUpdatePlan {
  const papers = buildExamSchedule();

  const newWeeks: NewWeek[] = findPendingWeeks(courseDirs).map(({ course, week }) => ({
    course,
    week,
    weekDir: findWeekFolder(courseDirs[course]!, week)!,
  }));

  const authoredWeeks = new Map<string, { course: string; week: number }>();
  for (const p of papers) authoredWeeks.set(`${p.course}:${p.week}`, { course: p.course, week: p.week });

  const updatableWeeks: UpdatableWeek[] = [];
  for (const { course, week } of authoredWeeks.values()) {
    const courseDir = courseDirs[course];
    if (!courseDir) continue; // no real folder for this course (e.g. TRACELY)
    const weekDir = findWeekFolder(courseDir, week);
    if (!weekDir || !existsSync(weekDir)) continue;

    const known = knownSourceFiles(papers, course, week);
    const { materials, videos } = scanWeekFolder(weekDir);
    const newSourceFiles = materials.filter((m) => !known.has(m));
    const pendingVideos = videos.filter((v) => !materials.includes(transcriptRelPath(v)));

    if (newSourceFiles.length > 0 || pendingVideos.length > 0) {
      updatableWeeks.push({ course, week, weekDir, newSourceFiles, pendingVideos });
    }
  }

  updatableWeeks.sort((a, b) => (a.course === b.course ? a.week - b.week : a.course.localeCompare(b.course)));
  return { newWeeks, updatableWeeks };
}

if (import.meta.main) {
  console.log(JSON.stringify(findWeekUpdates(), null, 2));
}
