# Exam → Modules Rename, In-App Sync Detection, Saturday Auto-Generate — Design

**Status:** Approved 2026-08-06, ready for planning.

## Relationship to the existing weekly-exam-generation-pipeline spec

`docs/superpowers/specs/2026-08-04-weekly-exam-generation-pipeline-design.md`
already designed a `launchd`-triggered local Claude Code job that detects
and authors new weeks unattended. That spec is still correct on its two
foundational calls — **no runtime LLM API in the app**, and **no
cloud-based scheduling** (the source PDFs live in a local
`~/Desktop/USYD/...` folder a cloud agent can't see) — this plan keeps
both.

Where this plan diverges: the 2026-08-04 spec gates the pipeline behind
two features that don't exist yet (`answerFormat` for diagram answers,
and marks-based scoring with structured `markingRubric`s), plus a
cumulative-review curriculum policy. Per this session's decision, this
plan builds a **leaner** version now — same detection logic, same
`claude -p` trigger mechanism, same "read the guide, author like a human
would" approach — but authoring plain `mcq`/`truefalse`/`short`/`scenario`
content exactly like every week authored so far, with no schema changes.
The richer version (rubrics, diagram answers, cumulative curriculum)
remains a valid future upgrade to layer on top of this, not a
prerequisite.

This plan also adds one thing the older spec didn't cover: an **in-app
Sync button**, so pending weeks are visible from inside the Modules tab
itself while browsing, not only inside the Saturday job's log.

## Non-Goals

- No runtime LLM API calls from the Bun server or browser — Sync only
  reads the filesystem and compares it against what's already imported
  into `exam-content.ts`. Authoring still happens in a Claude Code
  session (interactive, or the scheduled `claude -p` job).
- No PDF/pptx/docx text extraction in the app — the app never opens
  material files, it only checks whether they exist.
- No content-schema changes (`ExamPaperSeed`/`ExamQuestionSeed` stay as
  they are today).
- No writing of blank scaffold files to disk from Sync or the scheduled
  job — `scripts/generate-exam-week.ts` remains available but unused by
  this pipeline, since every week so far has been authored by reading the
  source material directly, not by filling in a scaffold.
- No push to any git remote from the scheduled job — local commit only,
  same policy as the 2026-08-04 spec.

## 1. In-App Sync (Modules tab)

### Detection logic — `exam-sync.ts`

A hardcoded course → local folder map, mirroring
`scripts/generate-exam-week.ts`'s `DEFAULT_COURSE_DIR` pattern:

```ts
const COURSE_DIRS: Record<string, string> = {
  INFO5995: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO5995 Intro To Cybersecurity",
  COMP5348: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/COMP5348 Enterprise Scale",
  INFO6007: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO6007 Project Management",
  INFO5990: "/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)/INFO5990 Professional Practice in IT",
};
```

`findPendingWeeks(): { course: string; week: number }[]` — for each course
directory, lists `Week N` subfolders (reusing
`scanWeekFolder`'s material/video file-extension split, imported from
`scripts/generate-exam-week.ts`), keeps the ones containing at least one
material file, and excludes any `(course, week)` pair already present in
`buildExamSchedule()`'s output (i.e. already imported into
`exam-content.ts`). This is a **read-only filesystem scan** — no writes.

### Route — `GET /api/exam/sync`

Returns `{ pending: { course: string; week: number }[] }`. Added to
`examApiRoutes(db)` in `exam-api.ts` alongside the existing exam routes
(no `db` access needed, but keeping it in the same route group matches
where the client already expects exam-related endpoints to live).

### UI — `ExamApp.tsx`

A "Sync" button next to `ExamStats` in the header. On click: calls the
route, then renders a dismissible banner above the weeks-due list:

> 3 weeks ready to generate: INFO6007 Week 3, COMP5348 Week 2, INFO5990
> Week 2 — ask Claude Code to fill these in.

Empty `pending` array → banner reads "Everything's generated — nothing
pending." No polling; it only runs on click, matching how every other
action in this app (submit, review, etc.) is user-triggered rather than
automatic.

## 2. Rename: Exam → Modules

Label-only change, no route/type renaming (avoids touching the `Tab`
type, API paths, or existing tests unnecessarily):

- `frontend.tsx`: `TabBar`'s `"Exam"` button text → `"Modules"`.
- `HomeApp.tsx`: the `exam: "Exam"` tab-name map entry → `exam:
"Modules"`.

The internal `Tab`/`DeepLink` type value stays `"exam"`, `ExamApp.tsx`'s
component name stays `ExamApp`, and every API route under `/api/exam/*`
stays as-is — this is purely what the user sees.

## 3. Authoring guide — `docs/exam-content-authoring-guide.md`

A short doc (not the older spec's rubric/answerFormat-laden version),
read by any authoring session — interactive or scheduled — before
writing content for a pending week:

- **Process:** read the week's real source material directly (PDFs,
  slides, docs — skip video files, they can't be transcribed); read that
  course's `unit_outline.md` for the stated learning outcomes; if a prior
  week's `week-N.ts` exists for the same course, skim it for continuity —
  where this week's material builds on or connects to an earlier concept,
  write at least one question that makes that connection explicit rather
  than treating each week as isolated.
- **Format:** 3 papers per week, 14 questions per paper (8
  `mcq`/`truefalse`, 4 `short`, 2 `scenario`), matching every week
  authored so far — see any existing `exam-content/<course>/week-N.ts`
  for the exact shape.
- **Wiring in:** update `exam-content.ts` to import the new week's
  `WEEK_N_PAPERS` and append it to `ALL_PAPERS`.
- **Verification:** run `bun test` before considering the week done.

This doc is the single reference both an interactive session and the
Saturday scheduled job point to, so the two stay consistent without
duplicating instructions.

## 4. Saturday auto-generate routine (designed here, not created yet)

Adapting the 2026-08-04 spec's mechanism, unblocked and simplified:

**`~/Library/LaunchAgents/com.adam.examcontentgen.plist`** —
`StartCalendarInterval` firing Saturday 10:00, running
**`~/bin/exam-content-gen.sh`** with working directory set to the
`leetcode-srs` repo, output logged to
`~/Library/Logs/exam-content-gen.launchd.log`. A missed fire (Mac asleep)
runs on wake, same as the existing `com.adam.diskcleanup` /
`com.adam.vault-autocommit` jobs.

**`~/bin/exam-content-gen.sh`** invokes `claude -p "<fixed prompt>"`
(non-interactive mode):

```
Read docs/exam-content-authoring-guide.md first.

Check every course folder under
"/Users/adam/Desktop/USYD/Semester 2 (Aug-Nov 2026)" for week
subfolders that have real material but no corresponding
exam-content/<course>/week-N.ts yet (same check the app's Sync
button uses, in exam-sync.ts).

For each pending week found, author its content following the guide
and wire it into exam-content.ts.

Run `bun test` to confirm everything passes before committing.

If anything was generated, commit it locally with a clear message
per week (e.g. "content: generate INFO6007 Week 3 exam content").
Do NOT push. If nothing was pending, do nothing and make no commit.
```

Per the earlier decision in this session, this component is designed now
but **not created** — it gets set up as a separate, deliberate step once
the Sync button and authoring guide have been used and confirmed to work
the way you want.

## Testing

- `exam-sync.test.ts`: `findPendingWeeks()` against a temp directory
  fixture — a week folder with only `.DS_Store` is not pending; a week
  folder with a real PDF and no `week-N.ts` is pending; a week already
  present in `buildExamSchedule()`'s output is excluded even if its
  folder has material.
- `exam-api.test.ts`: `GET /api/exam/sync` returns the expected shape.
- `ExamApp.tsx` gets no new automated UI test in this plan (existing exam
  UI tests don't cover the Sync banner) — manual browser verification is
  sufficient given the low complexity (one button, one banner).

## Out of Scope

- Detecting *new files added to an already-generated week* (e.g. a
  reading added after Week 3 was authored) — v1 only detects weeks
  missing entirely. Revisit if this actually comes up.
- The richer metadata/rubric/`answerFormat`/cumulative-curriculum upgrade
  from the 2026-08-04 spec — still valid, still a future layer, not
  touched here.
- Per-course Sync buttons — one global button covers all four courses
  (per this session's decision).
- Actually creating the `launchd` job and wrapper script — designed here,
  built in a later, separate step.
