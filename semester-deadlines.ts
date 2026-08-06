// semester-deadlines.ts
// Real-world graded deadlines for Semester 2, 2026 — distinct from the
// exam-content practice papers (those are spaced-repetition drills; these
// are the actual assignments the marks are attached to). Hand-compiled from
// each unit's Week 1 "Assessments" slides. Only items with an explicit
// calendar date are listed here — final exams are scheduled later in the
// university exam period and don't have a date yet, so they're covered in
// the full timeline instead of this list.
export interface SemesterDeadline {
  course: string;
  title: string;
  weight: string;
  dueDate: string; // 'YYYY-MM-DD'
}

export const SEMESTER_DEADLINES: SemesterDeadline[] = [
  { course: "INFO5995", title: "Early feedback quiz", weight: "5%", dueDate: "2026-08-30" },
  { course: "INFO6007", title: "Early Semester Feedback Task", weight: "5%", dueDate: "2026-08-30" },
  { course: "INFO5995", title: "Project 1", weight: "20%", dueDate: "2026-09-13" },
  { course: "COMP5348", title: "Assignment 1", weight: "10%", dueDate: "2026-09-27" },
  { course: "INFO5995", title: "Project 2", weight: "25%", dueDate: "2026-10-25" },
  { course: "COMP5348", title: "Assignment 2", weight: "10%", dueDate: "2026-10-25" },
  { course: "COMP5348", title: "Group project", weight: "20%", dueDate: "2026-11-08" },
  { course: "INFO6007", title: "Group project", weight: "25%", dueDate: "2026-11-08" },
];
