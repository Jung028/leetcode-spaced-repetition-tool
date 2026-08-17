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
   between this week's material and earlier weeks' (per point 3). These
   are still `mcq` — write the prompt/options so the correct choice
   requires combining concepts, not just single-fact lookup.
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
     criterion: write `mcq` questions whose options require combining 2+
     concepts (possibly from different weeks) to correctly distinguish,
     not just restating one slide's definition.
   - For a "concise, structured, time-boxed" communication criterion: keep
     the `modelAnswer` itself concise and structured (claim, 2–3
     supporting points, one example) — something sayable within the
     stated time limit (e.g. 1–2 minutes), not a written-exam-style essay.
   - Don't author anything that resembles reading from notes — the rubric
     may explicitly reward *unaided* recall (no AI/notes reliance), so
     model answers should model what a well-prepared unaided answer sounds
     like, not a written-exam-style essay.

## Format

- **Two papers per week, tutorial split from lecture** — the tutorial is
  more important to drill in isolation, so it gets its own paper rather
  than being mixed into the week's combined set:
  `export const WEEK_N_PAPERS: ExamPaperSeed[] = [TUTORIAL_PAPER, LECTURE_PAPER];`
  - `paperNumber: 1`, title ending in "Tutorial" — questions written only
    from the week's tutorial material (worksheets, tutorial slides,
    in-class exercises).
  - `paperNumber: 2`, title ending in "Lecture" — questions written only
    from the week's lecture material.
  - List the tutorial paper first in the array — it's the one the student
    wants to practice first.
  - If a week genuinely has no separate tutorial material (lecture-only
    week), a single lecture-only paper (`paperNumber: 1`) is fine — don't
    invent a tutorial paper from nothing.
- Each paper's `questions` array holds every question for that half of the
  week — roughly 20-25 questions per paper is typical (down from ~40-50
  for a single combined paper, since it's now split in two).
- Every question must be type `mcq` (exam-style, multiple choice with
  `options` + `correctIndex`) — do not author `truefalse`, `short`, or
  `scenario` questions (see CLAUDE.md, "Exam content question format").
- Match the exact shape of `exam-content/types.ts`'s `ExamPaperSeed` /
  `ExamQuestionSeed` — see any existing `exam-content/<course>/week-N.ts`
  for a worked example.
- Every question's `modelAnswer` should be traceable to something the
  source material actually says, not invented — it's shown alongside the
  options as the written explanation of why the correct choice is correct.
- Distractors must be close, not filler: every wrong option should be
  plausible enough that only real understanding rules it out (a related
  term from the same lecture, a common misconception, a mechanism that's
  almost right but subtly wrong) — never an obviously-unrelated or absurd
  option a student could eliminate without knowing the material. Favor
  prompts that require distinguishing similar concepts or applying a
  concept to a new example over ones answerable from the question's shape
  alone (see CLAUDE.md, "Exam content question format").

## Wiring in

Update `exam-content.ts`:
1. Add an import: `import { WEEK_N_PAPERS as <COURSE>_WEEK_N_PAPERS } from "./exam-content/<course>/week-N";`
2. Append `...<COURSE>_WEEK_N_PAPERS` to the `ALL_PAPERS` array.

## Verification

Run `bun test` before considering the week done — it must pass with no
failures.
