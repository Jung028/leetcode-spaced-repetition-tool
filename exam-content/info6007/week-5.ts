import type { ExamPaperSeed } from "../types";

const DISCUSSION_PAPER: ExamPaperSeed = {
  course: "INFO6007",
  week: 5,
  paperNumber: 1,
  title: "Week 5 Discussion Prep",
  topics:
    "Pre-lecture Ed Discussion prompt: Plan Quality Management vs Manage Quality vs Control Quality — why passing every planned functional test does not mean quality was successfully managed, and how an unplanned non-functional requirement (load/scalability) can slip through a quality plan that never accounted for it",
  sourceFiles: ["Ed Discussion — Week 5 pre-lecture prompt (announcement also noted: updated Week 1-4 slides posted on Canvas; Week 5 finalises project boards and begins project work)"],
  questions: [
    {
      type: "scenario",
      prompt:
        "A university's new online enrolment system passed every planned functional test case, had code reviews and security checks conducted, had no critical defects remaining before release, met its response-time target during testing, and was approved for launch by the client — the project manager reported the system as ready, having met all quality requirements. But when enrolment opened, thousands of students used the system simultaneously, it became extremely slow, some users received error messages, and several students were unsure whether their enrolment had gone through. If the system passed every planned test, can we say its quality was managed successfully? Where did the main problem occur: planning quality, managing quality, controlling quality — or somewhere else?",
      modelAnswer:
        "No — passing every planned test only tells you the plan was executed correctly, not that the plan itself was complete. The failure traces back to Plan Quality Management, not to Manage Quality or Control Quality. Control Quality (inspecting deliverables, running the test cases, verifying defect counts) and Manage Quality (following the quality processes, doing code reviews and security checks) both appear to have been carried out correctly and honestly — every planned check passed, which is exactly what those processes are meant to verify. The gap is that the quality plan itself never specified concurrent-load / scalability as a quality metric or acceptance criterion in the first place: the response-time target was apparently validated under normal or low-concurrency test conditions, not under a realistic peak-enrolment load, so 'meets response-time target' and 'handles thousands of simultaneous users' were silently treated as the same requirement when they aren't. This is a classic gap between functional correctness (does the feature work when used as tested) and non-functional requirements (does it keep working under real-world conditions like scale, concurrency, and peak load) — a system can be functionally flawless and still fail operationally if the quality plan never asked the right non-functional question. The fix isn't more testing of the same kind, it's going back to Plan Quality Management and adding load/stress/scalability testing with realistic peak-concurrency scenarios (e.g. a load test simulating the expected enrolment-day user spike) as an explicit quality metric and acceptance criterion before the next release, so Control Quality actually has something to check against.",
    },
  ],
};

export const WEEK_5_PAPERS: ExamPaperSeed[] = [DISCUSSION_PAPER];
