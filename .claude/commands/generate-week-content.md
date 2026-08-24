---
description: Scan every course module for new or unauthored week material and author/update exam-content accordingly, in-session (no dev server needed)
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# Generate week content

Do this yourself in this session — don't just describe the plan. This is the
manual/in-session equivalent of the app's Modules-tab Generate/Update
buttons (`exam-generate.ts`), for when there's no dev server running.

## 1. Detect what's pending

Run:

```
bun scripts/find-week-updates.ts
```

This prints `{ newWeeks, updatableWeeks }` JSON:

- `newWeeks` — a course/week has real material on disk but no
  `exam-content/<course>/week-N.ts` yet.
- `updatableWeeks` — a week is already authored, but its folder now has
  material no paper's `sourceFiles` lists yet (`newSourceFiles`), and/or a
  video with no transcript yet (`pendingVideos`).

If both arrays are empty, tell the user every module is up to date and stop
here.

Otherwise, show the user a short summary (which course/weeks are new, which
are updatable and why) before doing any writing.

## 2. Transcribe pending videos first

For every `updatableWeeks` entry with a non-empty `pendingVideos`, run (per
`docs/exam-content-authoring-guide.md` point 1):

```
bun scripts/transcribe-lecture.ts <path-to-video>
```

Long lectures take real wall-clock time on CPU — run each as a background
Bash command rather than blocking, but wait for it to finish before
authoring that week (the transcript is what makes the new material
readable). After all transcriptions for a week finish, re-run
`bun scripts/find-week-updates.ts` (or reason locally: the video's
`<name>.transcript.md` now counts as a `newSourceFiles` entry) so the
authoring step below sees the real up-to-date file list.

## 3. Process weeks ONE AT A TIME, never in parallel

Both `newWeeks` and `updatableWeeks` edit the shared `exam-content.ts` (new
weeks) or risk racing on the same course's files (updates), so dispatch one
`general-purpose` Agent per week and wait for it to fully finish — including
its own `bun test` pass — before starting the next. Process `newWeeks`
before `updatableWeeks` (or interleave in whatever course/week order makes
sense) but never run two of these agents concurrently.

For each week, get the exact authoring prompt by reusing the same builders
the app itself uses, so the instructions this command gives never drift
from what the app's buttons already do:

```
bun -e "import { buildGeneratePrompt } from './exam-generate'; console.log(buildGeneratePrompt('<COURSE>', <week>, '<weekDir>'))"
```

for a `newWeeks` entry, or

```
bun -e "import { buildUpdatePrompt } from './exam-generate'; console.log(buildUpdatePrompt('<COURSE>', <week>, '<weekDir>'))"
```

for an `updatableWeeks` entry (`<COURSE>`, `<week>`, `<weekDir>` from that
entry's JSON). Pass the printed text as the Agent's task prompt verbatim,
plus one addition: tell the agent it's running as an in-session subagent
(not the headless `claude -p` job the text describes) — same rules, same
unattended judgment-call authority, just report back to you instead of
writing `status.json`.

This automatically gets you the source-tracking behavior the user asked
for: `buildGeneratePrompt` has the agent populate each paper's
`sourceFiles` with every material file it read (see any existing
`week-N.ts` for the pattern), and `buildUpdatePrompt` explicitly tells the
agent to append the new material's filename(s) to the existing paper's
`sourceFiles` array — so "add it to the list" happens as part of normal
authoring, not a separate bookkeeping step.

## 4. Verify after each week, and again at the end

After each agent reports done, independently confirm — don't just trust its
summary:

```
bun test
```

and spot-check the touched `week-N.ts`'s `correctIndex:` values are roughly
even across 0–3 (known MCQ positional-bias risk, per CLAUDE.md).

## 5. Final summary

Once every pending week is processed, report to the user: which weeks were
newly authored, which were updated (and with how many new questions / which
new source files), and confirm the full `bun test` suite passes with no
failures.
