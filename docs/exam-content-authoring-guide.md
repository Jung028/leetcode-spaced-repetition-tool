# Exam Content Authoring Guide

Read this before authoring exam content for any pending week (surfaced by
the Modules tab's Sync button, or found by hand).

## Process

1. Read the week's real source material directly — PDFs, slides, docs.
   Skip video files; they can't be transcribed.
2. Read that course's `exam-content/<course>/unit_outline.md` for the
   unit's stated learning outcomes.
3. If a prior week's `exam-content/<course>/week-N.ts` exists, skim it for
   continuity. Where this week's material builds on or connects to an
   earlier concept, write at least one question that makes that connection
   explicit — don't treat every week as fully isolated from the last.
4. Beyond single-concept recall, include questions that force connecting
   the dots: between two or more concepts within the same lecture, and
   between this week's material and earlier weeks' (per point 3). Prefer
   `short`/`scenario` types for these — the point is synthesis, not lookup.
5. Read that course's `exam-content/<course>/assessment_overview.md` (if it
   exists) for how the *final exam* is actually structured — closed/open
   book, case-study based, etc. Write at least a couple of questions in
   that same style/format so practice isn't only shaped like a weekly quiz,
   but rehearses the format the final exam will actually use.
6. If `assessment_overview.md` also contains a marking rubric (e.g. an
   oral/viva rubric scored on dimensions like Knowledge & Understanding,
   Communication & Clarity, Professionalism & Engagement), author toward
   the rubric, not just toward a right/wrong answer key:
   - For a "depth beyond the answer guide" / "integrates multiple ideas"
     criterion: make `scenario` questions require combining 2+ concepts
     (possibly from different weeks) to answer well, not just restating one
     slide's definition.
   - For a "concise, structured, time-boxed" communication criterion: note
     in the question (or a comment) that a strong spoken answer should fit
     in the stated time limit (e.g. 1–2 minutes) — this shapes which
     concepts get a `short` prompt (say it in one breath) vs a `scenario`
     prompt (worth structuring as: claim, 2–3 supporting points, one
     example).
   - Don't author anything that resembles reading from notes — the rubric
     may explicitly reward *unaided* recall (no AI/notes reliance), so
     model answers should model what a well-prepared unaided answer sounds
     like, not a written-exam-style essay.

## Format

- One paper per week (`PAPER`), exported as a single-element array:
  `export const WEEK_N_PAPERS: ExamPaperSeed[] = [PAPER];`
- The paper's `questions` array holds every question for that week —
  roughly 40-50 questions is typical, keeping the same rough ratio as a
  14-question set (about 8 `mcq`/`truefalse` : 4 `short` : 2 `scenario`
  per 14, scaled up).
- Match the exact shape of `exam-content/types.ts`'s `ExamPaperSeed` /
  `ExamQuestionSeed` — see any existing `exam-content/<course>/week-N.ts`
  for a worked example.
- Every question's `modelAnswer` should be traceable to something the
  source material actually says, not invented.

## Wiring in

Update `exam-content.ts`:
1. Add an import: `import { WEEK_N_PAPERS as <COURSE>_WEEK_N_PAPERS } from "./exam-content/<course>/week-N";`
2. Append `...<COURSE>_WEEK_N_PAPERS` to the `ALL_PAPERS` array.

## Verification

Run `bun test` before considering the week done — it must pass with no
failures.
