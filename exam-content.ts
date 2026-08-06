// Aggregates every course's exam papers into one flat array, each paper
// carrying its own course tag. Add new courses/weeks here as they're
// generated: import the week's papers and append to ALL_PAPERS.
import { WEEK_1_PAPERS } from "./exam-content/info5995/week-1";
import type { ExamPaperSeed } from "./exam-content/types";
import { addDays } from "./scheduling";

const ALL_PAPERS: ExamPaperSeed[] = [...WEEK_1_PAPERS];

// COURSES lists every course this app knows about, including ones with zero
// papers so far (e.g. INFO5990) — listExamCourses() below is what filters
// down to "courses that actually have content."
export const COURSES: { code: string; name: string }[] = [
  { code: "INFO5995", name: "Intro to Cybersecurity" },
  { code: "COMP5348", name: "Enterprise Scale" },
  { code: "INFO6007", name: "Project Management" },
  { code: "INFO5990", name: "Professional Practice in IT" },
];

// A paper's identity is (course, week, paperNumber) — all present directly
// on ExamPaperSeed already, so there's nothing left to compute per-paper.
export type ExamPaper = ExamPaperSeed;

export function buildExamSchedule(): ExamPaper[] {
  return ALL_PAPERS;
}

// Cross-references COURSES against which course codes actually appear in
// buildExamSchedule()'s output — a course only shows up here (and therefore
// anywhere in the API/UI) once it has at least one paper.
export function listExamCourses(): { code: string; name: string }[] {
  const present = new Set(ALL_PAPERS.map((p) => p.course));
  return COURSES.filter((c) => present.has(c.code));
}

// Monday of Week 1 — the same real calendar week for every course, since
// they're all taken in the same semester.
export const SEMESTER_START = "2026-08-03";

// A week's papers become visible once its Monday arrives.
export function weekStartDate(week: number): string {
  return addDays(SEMESTER_START, (week - 1) * 7);
}

// A week's papers are due through its Sunday.
export function weekDueDate(week: number): string {
  return addDays(SEMESTER_START, (week - 1) * 7 + 6);
}

export interface ExamWeekPaperSummary {
  paperNumber: number;
  title: string;
  submitted: boolean;
  scoreCorrect: number | null;
  scoreTotal: number | null;
}

export interface ExamWeekView {
  week: number;
  dueDate: string;
  overdue: boolean;
  papers: ExamWeekPaperSummary[];
}

interface PaperProgressRow {
  week: number;
  paper_number: number;
  submitted_at: string | null;
  score_correct: number | null;
  score_total: number | null;
}

// Groups flat per-paper progress rows into one entry per week, looking up
// each paper's title from the static content. Shared by exam-api.ts (the
// due-list/paper-picker response) and home-api.ts (the Home due-list), so
// both aggregate weeks identically — this is the one place that logic
// lives.
export function groupExamPapersByWeek(
  course: string,
  rows: PaperProgressRow[],
  today: string,
): ExamWeekView[] {
  const byWeek = new Map<number, PaperProgressRow[]>();
  for (const row of rows) {
    if (!byWeek.has(row.week)) byWeek.set(row.week, []);
    byWeek.get(row.week)!.push(row);
  }
  const groups: ExamWeekView[] = [];
  for (const [week, weekRows] of byWeek) {
    const papers: ExamWeekPaperSummary[] = weekRows
      .slice()
      .sort((a, b) => a.paper_number - b.paper_number)
      .map((r) => {
        const content = ALL_PAPERS.find(
          (p) => p.course === course && p.week === week && p.paperNumber === r.paper_number,
        );
        return {
          paperNumber: r.paper_number,
          title: content?.title ?? `Week ${week} Paper ${r.paper_number}`,
          submitted: r.submitted_at !== null,
          scoreCorrect: r.score_correct,
          scoreTotal: r.score_total,
        };
      });
    groups.push({ week, dueDate: weekDueDate(week), overdue: weekDueDate(week) < today, papers });
  }
  return groups.sort((a, b) => a.week - b.week);
}
