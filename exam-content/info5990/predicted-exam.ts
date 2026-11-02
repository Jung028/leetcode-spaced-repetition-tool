import type { ExamPaperSeed } from "../types";
import { INFO5990_PRACTICE_EXAM_PAPERS } from "./practice-exams";

const PAPER: ExamPaperSeed = {
  ...INFO5990_PRACTICE_EXAM_PAPERS[0],
  week: 9,
  paperNumber: 3,
  title: "Predicted Exam Practice Paper",
  topics: "Predicted 50-mark practice exam in the supplied final-exam format: 10 single-best-answer MCQs and four written scenario problems. Covers applied professional practice across delivery, governance, stakeholder communication, change, quality, security and ethics.",
};

export const INFO5990_PREDICTED_EXAM_PAPERS: ExamPaperSeed[] = [PAPER];
