---
description: Author or update exam-content for a specified course week, in-session (no dev server needed)
argument-hint: <COURSE> <week>   (e.g. COMP5348 5  |  week 5  |  5 all)
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# Generate week content

Do this yourself in this session — don't just describe the plan. This is
the in-session equivalent of the app's Modules-tab buttons, for when
there's no dev server running:

- **Sync banner → "Generate"** — authors a brand-new week from scratch
  (`/api/exam/:course/:week/generate` → `startGenerateJob` with
  `buildGeneratePrompt`, in `exam/generate.ts`). This is the *normal
  generation* path.
- **"Update from new material"** — enriches an already-authored week with
  material that landed in its folder afterwards
  (`/api/exam/:course/:week/update` → `buildUpdatePrompt`).

Both prompt builders live in `exam/generate.ts`; the schedule/pending
detection lives in `exam/sync.ts` and `exam/content.ts` (the app's Sync
button calls `findPendingWeeks`). The authored data itself is under
`exam-content/<course>/` — that path was left untouched by the `exam/`
refactor.

**Scope: one week, unless told otherwise.** This command normally
authors/updates a single course week — the one named in the arguments. The
one exception is when a bare week number matches several courses and the
user answers `all` (see step 0).

## 0. Parse the target week

The invocation is `/generate-week-content $ARGUMENTS`. Expect a course code
and a week number, in either order, e.g. `COMP5348 5`, `5 COMP5348`,
`comp5348 week 5`.

- **No arguments** → stop and ask the user which course + week to generate.
  Do not run anything or fall back to "every pending week".
- **Course + week given** → that is `<COURSE>` and `<week>`; go to step 1
  with the single target.
- **Week number but no course** → run `bun scripts/find-week-updates.ts`,
  list every course that has that week number in `newWeeks` or
  `updatableWeeks`, and ask the user which one (offer the individual
  courses **and** an `all` option).
  - User picks one course → single target, as above.
  - User answers `all` → the target set is *every* listed course at that
    week number. Process them per step 3's "multiple targets" rule.

## 1. Confirm each target week is pending

Run:

```
bun scripts/find-week-updates.ts
```

For each target `<COURSE>`/`<week>`, find its entry in the output:

- In `newWeeks` → brand-new week (no `exam-content/<course>/week-N.ts`
  yet). Use `buildGeneratePrompt` in step 3. `weekDir` comes from that
  entry.
- In `updatableWeeks` → already authored, but its folder has material no
  paper's `sourceFiles` lists yet (`newSourceFiles`) and/or a video with
  no transcript (`pendingVideos`). Use `buildUpdatePrompt` in step 3.
  `weekDir` comes from that entry.
- **In neither** → tell the user that week is already up to date (or has no
  material on disk) and drop it from the target set. Do not touch any
  other week.

Show the user a one-line summary per target (new vs. updatable, and for
updatable, which new files / videos) before doing any writing.

## 2. Transcribe pending videos with the transcription tool

For each target with a non-empty `pendingVideos`, transcribe each video
**only** via the project's transcription tool:

```
bun scripts/transcribe-lecture.ts <path-to-video>
```

This runs a local open-source pipeline (`ffmpeg` + `whisper-cpp`,
`base.en` model) — it costs **zero API tokens** and no model/agent effort.

- **Never** transcribe a lecture by hand, and never feed the video, its
  audio, or extracted frames/screenshots to the model or to a subagent —
  that wastes tokens and produces a worse transcript than the tool.
- Long lectures (~1–2h) take real wall-clock time on CPU. Run each
  transcription as a **background** Bash command, but wait for it to finish
  before authoring that week.
- If the tool errors because `ffmpeg`/`whisper-cpp`/the ggml model isn't
  installed, report the exact install command it prints and stop for that
  week; don't substitute a manual transcription.

**The transcript is written once and kept.** The tool saves it as
`<video-name>.transcript.md` right next to the video (same rule as
`transcribeWeekVideos` in `exam/generate.ts`). `find-week-updates.ts`,
`transcribeWeekVideos`, and this command all skip any video that already
has a `.transcript.md` beside it — so once a recording is transcribed it is
never transcribed again. Leave that file in place; commit it alongside the
week's `.ts` so future runs (and other machines) reuse it. After a
transcription finishes, its `.transcript.md` now counts as a new source
file — factor it into step 3 (re-run `bun scripts/find-week-updates.ts` for
the refreshed `newSourceFiles` list if you want).

## 3. Author / update the target week(s) with a subagent

Get the exact authoring prompt by reusing the same builder the app itself
uses, so this command never drifts from what the app's buttons do:

```
bun -e "import { buildGeneratePrompt } from './exam/generate'; console.log(buildGeneratePrompt('<COURSE>', <week>, '<weekDir>'))"
```

for a `newWeeks` target, or

```
bun -e "import { buildUpdatePrompt } from './exam/generate'; console.log(buildUpdatePrompt('<COURSE>', <week>, '<weekDir>'))"
```

for an `updatableWeeks` target.

Dispatch one `general-purpose` Agent per target week. Pass the printed text
as the Agent's task prompt verbatim, plus one addition: tell the agent it's
running as an in-session subagent (not the headless `claude -p` job the
text describes) — same rules, same unattended judgment-call authority, just
report back to you instead of writing `status.json`.

**Multiple targets (`all`):** process them **one at a time, never in
parallel** — `newWeeks` first (they each add an import + `ALL_PAPERS` entry
to the shared `exam/content.ts`, so two at once race), then the
`updatableWeeks`. Wait for each agent to fully finish — including its own
`bun test` pass — and run step 4 for that week before starting the next.

This automatically gets the source-tracking behavior: `buildGeneratePrompt`
has the agent populate each paper's `sourceFiles` with every material file
it read (see any existing `week-N.ts` for the pattern), and
`buildUpdatePrompt` tells the agent to append the new material's
filename(s) — including any `.transcript.md` from step 2 — to the existing
paper's `sourceFiles` array.

## 4. Verify after each week

After an agent reports done, independently confirm — don't just trust its
summary:

```
bun test
```

and spot-check the touched `week-N.ts`'s `correctIndex:` values are roughly
even across 0–3 (known MCQ positional-bias risk, per CLAUDE.md; fix with
`bun scripts/shuffle-week-options.ts <file>` if skewed). Also run
`bun scripts/check-mcq-lengths.ts <COURSE>` and fix every flagged question
before considering that week done.

## 5. Final summary

Report to the user, per week: whether it was newly authored or updated, how
many questions were added / which new source files (including transcripts)
were folded in, and confirm the full `bun test` suite passes with no
failures.
