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
