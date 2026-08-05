// Aggregates every course's exam papers into one flat array, each paper
// carrying its own course tag. Add new courses/weeks here as they're
// generated: import the week's papers and append to ALL_PAPERS.
import { WEEK_1_PAPERS } from "./exam-content/info5995/week-1";
import type { ExamPaperSeed } from "./exam-content/types";

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

export interface ExamPaper extends ExamPaperSeed {
  paperDay: number; // 1-based within this paper's own course
}

export function buildExamSchedule(): ExamPaper[] {
  const counters = new Map<string, number>();
  return ALL_PAPERS.map((paper) => {
    const next = (counters.get(paper.course) ?? 0) + 1;
    counters.set(paper.course, next);
    return { ...paper, paperDay: next };
  });
}

export function totalPapersForCourse(course: string): number {
  return buildExamSchedule().filter((p) => p.course === course).length;
}

// Cross-references COURSES against which course codes actually appear in
// buildExamSchedule()'s output — a course only shows up here (and therefore
// anywhere in the API/UI) once it has at least one paper.
export function listExamCourses(): { code: string; name: string }[] {
  const present = new Set(buildExamSchedule().map((p) => p.course));
  return COURSES.filter((c) => present.has(c.code));
}
