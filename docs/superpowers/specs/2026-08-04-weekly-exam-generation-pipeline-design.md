# Weekly Exam-Generation Pipeline — Design

**Status:** Approved 2026-08-04, ready for planning (blocked on dependencies — see below).

## Problem

Exam content for each course is currently authored manually: a human asks
Claude Code, in an interactive session, to read a week's materials and
write the papers. There's no recurring mechanism that notices when a new
week's materials have landed in the USYD folder and prompts that
authoring work to happen — every week currently needs to be requested by
hand.

The original ask also wants each week's paper to explicitly revisit
earlier concepts at rising difficulty (a "cumulative curriculum"), to
avoid repeating past questions, and to carry richer per-paper/per-question
metadata (learning objectives, time estimate, difficulty rating, marking
rubric) that doesn't exist in the content model yet.

## Non-Goals (resolved during brainstorming)

- **No runtime LLM API pipeline.** Content generation stays exactly what
  it already is: a Claude Code session reading real source materials and
  authoring TypeScript content files. This plan only adds a *trigger* for
  that session and a *guide* for it to follow — no new AI-calling code in
  the app itself, no new API key, no new dependency.
- **No cloud-based scheduling.** The USYD materials live in a local
  folder (`/Users/adam/Desktop/USYD/...`) that a cloud-hosted scheduled
  agent cannot see. The only mechanism that can actually read them is a
  local trigger on this Mac.
- **No new "question history" database.** The already-committed
  `exam-content/<course>/week-N.ts` files are the complete history of
  every question ever authored — a future session avoiding repetition
  just means reading those files first, not maintaining a separate index.

## Dependencies (must land first)

This plan is **not implementable yet**. It assumes:
1. `docs/superpowers/specs/2026-08-04-exam-multi-course-design.md`
   (multi-course architecture) is built — content needs a `course` field
   and per-course schedules to exist across 4 courses.
2. The Exam `answerFormat` feature (text/image/link on model answers,
   referenced in that same spec's Plan B) is built — drawing questions
   (COMP5348 architecture diagrams, INFO6007 network diagrams) need a
   link-based model answer, not just plain text.
3. `docs/superpowers/specs/2026-08-04-exam-marks-based-scoring-design.md`
   (marks-based scoring) is built — the authoring guide requires every
   question to carry a structured `markingRubric`, which only exists once
   that spec's content-schema change lands.
4. At least the currently-available weeks (COMP5348 Week 1, INFO6007
   Weeks 1-2) have been authored once by hand, establishing the
   per-course content file structure this pipeline will extend.

This spec is written now while the design is fresh; the implementation
plan for it should be written and executed only once 1-4 above exist.

## 1. Trigger Mechanism

A local `launchd` agent, mirroring the existing `com.adam.diskcleanup` /
`com.adam.vault-autocommit` jobs on this machine:

**`~/Library/LaunchAgents/com.adam.examcontentgen.plist`** — `StartCalendarInterval`
firing Monday 23:00, running **`~/bin/exam-content-gen.sh`** with working
directory set to the `leetcode-srs` repo, output logged to
`~/Library/Logs/exam-content-gen.launchd.log`. Like the disk-cleanup job,
a missed fire (Mac asleep at 11pm) runs shortly after wake — this is
launchd's normal behavior for `StartCalendarInterval`, not something this
plan needs to handle specially.

**`~/bin/exam-content-gen.sh`** is a thin wrapper: `cd` into the repo,
then invoke `claude -p "<fixed prompt>"` (Claude Code's non-interactive
mode) with the prompt below. All actual logic — detection, authoring,
testing, committing — happens inside that Claude Code invocation, exactly
the way a human would ask for it interactively; the script's only job is
firing it unattended on schedule.

The fixed prompt (exact text, not a placeholder — this is what ships in
the wrapper script):

```
Read docs/exam-content-authoring-guide.md first — it has the rules for
everything below.

For each course folder under
"/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)": check which week
subfolders have real material (PDFs, slides, docs — not just empty
folders) but no corresponding exam-content/<course>/week-N.ts file yet.

For each such week found, author its exam content following the
authoring guide: read the real source materials directly, write
genuine exam-style questions (mcq/truefalse/short/scenario, using
answerFormat for drawing/calculation questions where the guide calls
for it), and update exam-content.ts to include the new week.

Run `bun test` and `bunx tsc --noEmit` to confirm everything passes
before committing.

If you generated anything, commit it locally with a clear commit
message per week authored (e.g. "content: generate INFO6007 Week 3
exam content"). Do NOT push. If nothing was ready to generate (no new
weeks found), do nothing and make no commit.
```

## 2. Detecting "New Material"

No new tracking file or database. "Is this week ready to generate?" is
answered by: does `exam-content/<course>/week-N.ts` already exist? If
not, and the corresponding USYD folder for that week contains real
material files (reusing the exact same material/video extension
distinction `scripts/generate-exam-week.ts` already established), it's
ready. This check is folded into the fixed prompt above — the scheduled
session runs it directly rather than a separate script computing it in
advance, since the actual authoring work has to be a Claude Code session
regardless and the check itself is cheap.

## 3. The Authoring Guide

**`docs/exam-content-authoring-guide.md`** — read by every future
scheduled (or manual) content-authoring session before writing anything.
Contents:

- **Cumulative review policy:** each week's paper(s) should include some
  questions that deliberately revisit earlier weeks' concepts, phrased at
  rising difficulty and explicitly integrated with the current week's new
  material — not verbatim repeats of earlier questions. Roughly:
  early weeks are almost entirely new material; by mid-course, a
  meaningful fraction of each paper (guideline, not a hard rule enforced
  by code) should connect back to prior weeks.
- **Avoiding repetition:** before writing new questions, skim that
  course's already-committed `exam-content/<course>/week-*.ts` files —
  the existing content **is** the history; there is nothing else to
  consult.
- **Required metadata per paper:** `learningObjectives: string[]`,
  `estimatedMinutes: number`, `difficultyRating: "easy" | "medium" | "hard"`.
- **Per-question marking rubric:** every question's `markingRubric` is a
  structured list of criteria with marks, not prose — see
  `docs/superpowers/specs/2026-08-04-exam-marks-based-scoring-design.md`
  for the exact shape (`RubricPoint[]`, `totalMarks()`) and how it's
  graded. That spec is a dependency of this one, same tier as the
  multi-course and `answerFormat` plans — the authoring guide just needs
  to reference its rules when writing rubrics, not redefine them here.
- **When to use `answerFormat`:** a drawing question (e.g. "draw an ER
  diagram for X") is authored as a `scenario`-shaped question whose
  `modelAnswer` is a link (`answerFormat: "link"`) to a reference
  Excalidraw board or image, per the `answerFormat` design. A calculation
  question is authored the same way when the worked answer is easier to
  show as an image/link than to transcribe as text (e.g. a critical-path
  diagram with computed float values) — otherwise plain text is fine.

## 4. Content Schema Additions

This plan only adds the **paper-level** metadata fields — the
per-question marking rubric and its marks-based scoring model belong to
the separate marks-based-scoring spec referenced above and are not
redefined here. `ExamPaperSeed` (in `exam-content/types.ts`) gains:

```ts
learningObjectives: string[];
estimatedMinutes: number;
difficultyRating: "easy" | "medium" | "hard";
```

These are required fields (not optional) — every paper authored from this
point forward, across every course, carries them; there is no "legacy
content without this metadata" case to support, since it's added before
any of the pipeline's own generated content exists. (The already-authored
INFO5995 Week 1 content predates this field and needs it backfilled as
part of whichever plan implements this schema change — not deferred as an
optional field.)

## 5. UI: Surfacing the Metadata

In `ExamApp.tsx`'s `PaperView`, a small metadata block renders above the
question list: estimated time, difficulty rating, and the learning
objectives list. The per-question rubric display (alongside the model
answer) is part of the marks-based-scoring spec's UI section, not
duplicated here.

## Out of Scope

- No enforcement in code of the cumulative-review ratio, difficulty
  progression, or repetition-avoidance — these are authoring guidance for
  a human-equivalent (Claude) session to apply judgment to, not an
  algorithm.
- No retry/alerting if the scheduled `claude -p` invocation fails or
  produces nothing usable — check the launchd log manually, same as the
  existing disk-cleanup job's failure mode.
- No UI for editing the new metadata fields as part of this plan (that's
  what the separate Exam edit/delete plan, once it reaches Exam, would
  cover — this plan only adds the fields and displays them).
- No push-to-remote as part of the scheduled run (see Commit Policy).
