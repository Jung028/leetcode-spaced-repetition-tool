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
  "INFO5990|Early Semester Feedback Task": "Individual auto-graded MCQ quiz on Weeks 1–3 content, due Week 4.",
  "INFO5995|Project 1": "Set up AI tools and use them to find vulnerabilities in Android apps (group task); live presentation in the Week 7 tutorial.",
  "COMP5348|Assignment 1": "Individual paper-based exercises (3 questions) on Weeks 1–6 material; submit a PDF via Canvas.",
  "INFO5990|Interactive Oral (Viva)": "Secured oral exam, no notes, covering Weeks 1–6 (rubric says 1–7). Hurdle task — held in your Week 8 tutorial; confirm the exact slot on Canvas.",
  "INFO5995|Project 2": "Part A: AI-assisted Android vuln finding; Part B: open competition on real-world apps.",
  "COMP5348|Assignment 2": "Individual paper-based tasks on Weeks 7–10 material, plus reflection on lab experiences. (Brief not yet on Canvas — date from the assessment overview.)",
  "COMP5348|Group project — code & report": "Part A: submit the integrated subsystem source code + architecture report via Canvas (Week 11).",
  "COMP5348|Group presentation & live challenge": "Part B: group presentation of the submitted design plus an unseen live challenge, in the Week 12–13 tutorials.",
  "INFO5990|Team Report": "Group report (teams of 4–5) analysing an organisation's IT-enabled business proposal; progressive weekly templates, one submission end of Week 12.",
  "INFO6007|Group project": "Incremental Project Management Plan (teams of 4–5); single submission end of Week 13. Weekly stand-ups in tutorials (Weeks 6–12) are marked separately.",
};

export function noteFor(d: Pick<SemesterDeadline, "course" | "title">): string {
  return DEADLINE_NOTES[deadlineId(d)] ?? "";
}

// Kept in date order. Dates verified against each unit's assignment brief /
// assessment overview (the briefs under ~/Desktop/USYD/Semester 2 …) where one
// exists; week-only tasks are dated to that teaching week using the same
// calendar as the exam board (Week 1 Mon = 2026-08-03, one-week mid-semester
// break after Week 8). Final exams are deliberately omitted until the formal
// exam timetable is published — they live in the full semester timeline.
export const SEMESTER_DEADLINES: SemesterDeadline[] = [
  // --- Week 4 (24–30 Aug): the three early-feedback quizzes ---
  { course: "INFO5995", title: "Early feedback quiz", weight: "5%", dueDate: "2026-08-30", source: "manual" },
  { course: "INFO6007", title: "Early Semester Feedback Task", weight: "5%", dueDate: "2026-08-30", source: "manual" },
  { course: "INFO5990", title: "Early Semester Feedback Task", weight: "5%", dueDate: "2026-08-30", source: "manual" },
  // --- Week 6 (7–13 Sep) ---
  // INFO5995 unit schedule: "Project 1 due (Sunday 11:55pm)" in Week 6.
  { course: "INFO5995", title: "Project 1", weight: "20%", dueDate: "2026-09-13", source: "manual" },
  // --- Week 7 (14–20 Sep) ---
  // Assessment 1 brief: "Submission Due: Week 7, Sunday 11:55 pm (Sydney time)".
  { course: "COMP5348", title: "Assignment 1", weight: "10%", dueDate: "2026-09-20", source: "manual" },
  // --- Week 8 (21–27 Sep) ---
  // INFO5990 assessment overview: Viva held Week 8, hurdle task. Exact
  // day/slot not published — dated to the start of the teaching week.
  { course: "INFO5990", title: "Interactive Oral (Viva)", weight: "10%", dueDate: "2026-09-21", source: "manual" },
  // --- Week 11 (19–25 Oct) ---
  // COMP5348 Assignment 2: assessment overview says Week 11; no brief on
  // Canvas yet, so this date is provisional.
  { course: "COMP5348", title: "Assignment 2", weight: "10%", dueDate: "2026-10-25", source: "manual" },
  // COMP5348 Group Project brief: "Code and Report Due: Week 11, Sunday 23:55".
  { course: "COMP5348", title: "Group project — code & report", weight: "10%", dueDate: "2026-10-25", source: "manual" },
  // INFO5995 unit schedule: "Project 2 due (Sunday 11:55pm)" in Week 11.
  { course: "INFO5995", title: "Project 2", weight: "25%", dueDate: "2026-10-25", source: "manual" },
  // --- Week 12 (26 Oct – 1 Nov) ---
  // INFO5990 assignment overview: "Deadline: End of Week 12."
  { course: "INFO5990", title: "Team Report", weight: "35%", dueDate: "2026-11-01", source: "manual" },
  // --- Week 13 (2–8 Nov) ---
  // COMP5348 Group Project brief: presentation in the Week 12–13 tutorials;
  // Canvas announcement gives Sun 8 Nov as the hard date.
  { course: "COMP5348", title: "Group presentation & live challenge", weight: "10%", dueDate: "2026-11-08", source: "manual" },
  // INFO6007 assessment overview: Group project "due 08 Nov 2026 23:59".
  { course: "INFO6007", title: "Group project", weight: "25%", dueDate: "2026-11-08", source: "manual" },
];
