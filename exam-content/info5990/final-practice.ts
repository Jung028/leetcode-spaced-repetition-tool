import type { ExamPaperSeed } from "../types";
import { INFO5990_PRACTICE_EXAM_PAPERS } from "./practice-exams";

const PAPER: ExamPaperSeed = {
  ...INFO5990_PRACTICE_EXAM_PAPERS[1],
  week: 8,
  paperNumber: 4,
  title: "Final Exam Practice Paper (Weeks 1–8, mixed review)",
  topics: "Mixed review final-exam paper in the supplied 50-mark format, with 10 single-best-answer MCQs and four written scenario problems. Questions apply core professional practice concepts to integrated cases.",
  sourceFiles: [
    "exam-content/info5990/week-1.ts",
    "exam-content/info5990/week-2.ts",
    "exam-content/info5990/week-3.ts",
    "exam-content/info5990/week-4.ts",
    "exam-content/info5990/week-5.ts",
    "exam-content/info5990/week-6.ts",
    "exam-content/info5990/week-7.ts",
    "exam-content/info5990/week-8.ts",
    ...INFO5990_PRACTICE_EXAM_PAPERS[1].sourceFiles,
  ],
};

export const INFO5990_FINAL_PRACTICE_PAPERS: ExamPaperSeed[] = [PAPER];
