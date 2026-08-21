# Exam Content Authoring Guide

Read this before authoring exam content for any pending week (surfaced by
the Modules tab's Sync button, or found by hand).

## Process

1. Read the week's real source material directly — PDFs, slides, docs. For
   any video recording (lecture/tutorial capture), it needs a
   `<name>.transcript.md` transcript sitting next to it before it can be
   used — the video file itself can't be opened directly. Clicking
   Generate in the app now does this automatically (`transcribeWeekVideos`
   in `exam-generate.ts` runs before the authoring step, skipping videos
   that already have a transcript), so no manual step is needed there. If
   you're authoring by hand outside the Generate button, transcribe first:
   `bun scripts/transcribe-lecture.ts <path-to-video>` writes the
   `<name>.transcript.md`, which then reads like any other material. Video
   is the one source that captures things the slides don't — announcements,
   asides, stories, in-class quizzes/questions, verbal emphasis on what
   actually matters — so treat the transcript as a dedicated pass for
   exactly that, not just a re-read of the slide content in prose form.
2. Read that course's `exam-content/<course>/unit_outline.md` for the
   unit's stated learning outcomes.
3. If a prior week's `exam-content/<course>/week-N.ts` exists, skim it for
   continuity. Where this week's material builds on or connects to an
   earlier concept, write at least one question that makes that connection
   explicit — don't treat every week as fully isolated from the last.
4. Beyond single-concept recall, include questions that force connecting
   the dots: between two or more concepts within the same lecture, and
   between this week's material and earlier weeks' (per point 3). Write
   these as `mcq` when the options can express the distinction cleanly, or
   `short`/`scenario` when the connection is better explained in prose —
   either way, the correct answer must require combining concepts, not
   just single-fact lookup.
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
- Each paper's question types follow the mix `buildScaffold()` in
  `scripts/generate-exam-week.ts` seeds by default: 8 `mcq`, 4 `short`, 2
  `scenario`. `truefalse` is also available (see
  `exam-content/types.ts`'s `ExamQuestionType`) where it genuinely fits a
  question better than mcq — it isn't part of the default scaffold ratio,
  so add it deliberately rather than as a default choice.
- Match the exact shape of `exam-content/types.ts`'s `ExamPaperSeed` /
  `ExamQuestionSeed` — see any existing `exam-content/<course>/week-N.ts`
  for a worked example.
- Every question's `modelAnswer` should be traceable to something the
  source material actually says, not invented — mcq/truefalse show it
  alongside the options as the explanation of why the correct choice is
  correct; short/scenario reveal it as the answer itself.
- Use `promptDiagram` / `answerDiagram` (Mermaid syntax) and
  `requiresDrawing` (links to excalidraw.com) where a question is about an
  actual diagram or expects the student to sketch one — see CLAUDE.md,
  "Diagrams, symbols, and drawing". Plain Unicode symbols (→ ≥ λ Σ) in
  `prompt`/`modelAnswer` need no schema support at all.
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

## Updating an already-authored week with new material

When new material (most often a lecture/tutorial video) is added to a
week's folder *after* that week was already authored, use the app's
**Update** button (shown next to an already-authored week in the Modules
tab or History) instead of re-running Generate — Generate assumes the week
doesn't exist yet and would tell Claude to author it from scratch.

Update reuses the same job pipeline (auto-transcribes any new video first,
then runs headless `claude -p`), but with a different prompt
(`buildUpdatePrompt` in `exam-generate.ts`) that:

- Reads the existing `week-N.ts` first and only adds what the new material
  covers that isn't already asked about — not a wholesale rewrite.
- **Only ever appends new questions to the end of a paper's `questions`
  array.** Never reorders, deletes, or renumbers an existing question —
  `exam-db.ts` keys a student's graded answer history by each question's
  array index, so moving one silently corrupts past scores.
- Never touches `exam-content.ts` — the week's import/`ALL_PAPERS` entry is
  already wired in from when it was first authored.

If you're doing this by hand instead of via the button (e.g. no dev server
running), follow the same rules manually: read the existing file first,
append rather than rewrite, and never touch already-graded questions'
positions.
