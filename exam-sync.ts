// Read-only detection of USYD course weeks that have real material on disk
// but no authored exam-content/<course>/week-N.ts yet. Never writes
// anything — authoring still happens in a Claude Code session (interactive
// or the future Saturday launchd job), per
// docs/superpowers/specs/2026-08-06-exam-modules-sync-design.md.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { scanWeekFolder } from "./scripts/generate-exam-week";
import { buildExamSchedule } from "./exam-content";

export const COURSE_DIRS: Record<string, string> = {
  INFO5995: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO5995 Intro To Cybersecurity",
  COMP5348: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/COMP5348 Enterprise Scale",
  INFO6007: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO6007 Project Management",
  INFO5990: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO5990 Professional Practice in IT",
};

export const WEEK_FOLDER_RE = /^week\s*(\d+)$/i;

export interface PendingWeek {
  course: string;
  week: number;
}

// Finds the on-disk folder for one specific week (used by exam-generate.ts
// to locate real material before spawning a generation job) — shares the
// same matching rules findPendingWeeks() already uses below, so a folder
// that's "pending" is exactly a folder this can also resolve.
export function findWeekFolder(courseDir: string, week: number): string | null {
  if (!existsSync(courseDir)) return null;
  const entries = readdirSync(courseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const match = entry.name.match(WEEK_FOLDER_RE);
    if (!match) continue;
    if (Number(match[1]) === week) return join(courseDir, entry.name);
  }
  return null;
}

// courseDirs defaults to the real COURSE_DIRS map; tests pass a fixture map
// instead so this never touches the real Desktop folder in CI.
export function findPendingWeeks(courseDirs: Record<string, string> = COURSE_DIRS): PendingWeek[] {
  const existing = new Set(buildExamSchedule().map((p) => `${p.course}:${p.week}`));
  const pending: PendingWeek[] = [];

  for (const [course, dir] of Object.entries(courseDirs)) {
    if (!existsSync(dir)) continue;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const match = entry.name.match(WEEK_FOLDER_RE);
      if (!match) continue;
      const week = Number(match[1]);
      if (existing.has(`${course}:${week}`)) continue;
      const { materials } = scanWeekFolder(join(dir, entry.name));
      if (materials.length > 0) pending.push({ course, week });
    }
  }

  pending.sort((a, b) => (a.course === b.course ? a.week - b.week : a.course.localeCompare(b.course)));
  return pending;
}
