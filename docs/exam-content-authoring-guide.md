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
