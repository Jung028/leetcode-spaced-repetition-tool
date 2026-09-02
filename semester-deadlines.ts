// semester-deadlines.ts
// Real-world graded deadlines for Semester 2, 2026 — distinct from the
// exam-content practice papers (those are spaced-repetition drills; these
// are the actual assignments the marks are attached to).
//
// The `source: "scanned"` rows are rewritten every run by the weekly
// exam-autogen job (~/bin/exam-autogen.sh), which reads the assignment /
// exam brief PDFs under
//   ~/Desktop/USYD/Semester 2 (Aug-Nov 2026)/<course>/{Assignment,Assessment,Group Assignment,Exam}/
// and extracts every deliverable with an explicit calendar due date. A
// `source: "manual"` row is one added by hand that the scan has not (yet)
// found a dated equivalent for; a scanned row always wins over a manual one
// for the same course + title. Final exams stay out of this list until their
// timetable is published — they live in the full timeline instead.
export interface SemesterDeadline {
  course: string;
  title: string;
  weight: string;
  dueDate: string; // 'YYYY-MM-DD'
  source: "scanned" | "manual";
}

// Stable identifier for a deadline row. Keyed on course + title only (not
// dueDate) so that when the weekly scan revises a due date, the "done"
// checkbox for that assignment is preserved rather than being orphaned onto
// the old key. Course + title is unique within the current list; the same
// title ("Group project") only recurs across *different* courses.
export function deadlineId(d: Pick<SemesterDeadline, "course" | "title">): string {
  return `${d.course}|${d.title}`;
}

// Plain-English unit names, so a row can show "Introduction to Cybersecurity"
// next to the "INFO5995" code. Kept as a lookup rather than a per-row field
// because it is a property of the course, not the deadline — repeating it on
// every row (and in every scanned row the weekly job rewrites) would just be
// a chance to drift. `courseNameFor` falls back to the raw code.
export const COURSE_NAMES: Record<string, string> = {
  INFO5995: "Introduction to Cybersecurity",
  COMP5348: "Enterprise Scale Software Architecture",
  INFO6007: "Project Management in IT",
  INFO5990: "Professional Practice in IT",
};

export function courseNameFor(course: string): string {
  return COURSE_NAMES[course] ?? course;
}

// One-line, plain-English "what is this task" blurbs, keyed by deadlineId
// (course|title). Separate from SEMESTER_DEADLINES for the same reason the id
// dropped the due date: the weekly scan rewrites rows, but a task's nature
// doesn't change when its date shifts, so the description should survive that.
// Each line is paraphrased from the unit's assessment_overview.md /
// unit_schedule.md — no detail invented here.
export const DEADLINE_NOTES: Record<string, string> = {
  "INFO5995|Early feedback quiz": "Auto-graded quiz on Weeks 1–3 content; opens Week 3, due Week 4.",
  "INFO6007|Early Semester Feedback Task": "Individual open-book MCQ / true-false quiz on Weeks 1–3, on Canvas.",
  "INFO5995|Project 1": "Set up AI tools and use them to find vulnerabilities in Android apps (group task).",
  "COMP5348|Assignment 1": "Paper-based exercises on Weeks 1–6 material.",
  "INFO5995|Project 2": "Part A: AI-assisted Android vuln finding; Part B: open competition on real-world apps.",
  "COMP5348|Assignment 2": "Paper-based tasks on Weeks 7–10 material, plus reflection on lab experiences.",
  "COMP5348|Group project": "Group build integrating subsystems via communication technologies; includes the Week 13 presentation.",
  "INFO5990|Team Report": "Group report (teams of 4–5) analysing an organisation's IT-enabled business proposal.",
  "INFO6007|Group project": "Incremental group project on how IT projects are planned, executed and controlled (teams of 4–5).",
};

export function noteFor(d: Pick<SemesterDeadline, "course" | "title">): string {
  return DEADLINE_NOTES[deadlineId(d)] ?? "";
}

export const SEMESTER_DEADLINES: SemesterDeadline[] = [
  { course: "INFO5995", title: "Early feedback quiz", weight: "5%", dueDate: "2026-08-30", source: "manual" },
  { course: "INFO6007", title: "Early Semester Feedback Task", weight: "5%", dueDate: "2026-08-30", source: "manual" },
  { course: "INFO5995", title: "Project 1", weight: "20%", dueDate: "2026-09-13", source: "manual" },
  // Schedule + assessment overview both say "Week 7" (ends Sun 20 Sep);
  // confirm against Canvas in case its submission date runs a week later.
  { course: "COMP5348", title: "Assignment 1", weight: "10%", dueDate: "2026-09-20", source: "manual" },
  { course: "INFO5995", title: "Project 2", weight: "25%", dueDate: "2026-10-25", source: "manual" },
  { course: "COMP5348", title: "Assignment 2", weight: "10%", dueDate: "2026-10-25", source: "manual" },
  // Week 12 per the assessment overview (Week 13 is the Group Presentation).
  // Weight folds in the presentation (10% project + 10% presentation).
  { course: "COMP5348", title: "Group project", weight: "20%", dueDate: "2026-11-01", source: "manual" },
  // INFO5990 Team Report / Group Assignment — "submission in Week 12", no day
  // given, so dated to the Sunday of W12.
  { course: "INFO5990", title: "Team Report", weight: "35%", dueDate: "2026-11-01", source: "manual" },
  { course: "INFO6007", title: "Group project", weight: "25%", dueDate: "2026-11-08", source: "manual" },
];
