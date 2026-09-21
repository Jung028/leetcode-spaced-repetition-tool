# Evidence-Based Quiz Design — Design

**Status:** Sections 1–3 approved 2026-09-21 in brainstorming; awaiting spec review, then planning.

## Goal

The point of the Exam tab is to **learn** the lecture, not just to be scored on it. Today every
paper is recognition-only (pick one / pick many / true-false) and every question is asked cold,
before anything has been explained. This design applies proven retention methods to how each
week's quiz is generated and taken.

## In plain language

1. A paper becomes a series of small **rounds**. Each round starts with a short **reading card**
   (an everyday analogy, an example, a jargon decoder), then 3–6 questions on it.
2. Four new question formats join the existing ones: **fill in the blank**, **match pairs**,
   **put in order**, **sort into groups**. About 12 of a ~50-question paper use them.
3. Each paper ends with a **mixed-review round**: questions from earlier weeks plus jumbled
   topics from this week.
4. The Generate / Update buttons stop using one AI for everything. **Five specialist agents** run in
   order — Reader, Explainer, Planner, Writer, Checker — each handing a readable file to the next.
5. Existing papers are **not** touched. New and regenerated weeks get all of this.

## Research basis (from the learning-science literature; Dunlosky et al. 2013 and related work)

| Method | Where it lands in this design |
|---|---|
| Practice testing (retrieval) | Whole app; new formats strengthen it (produce, don't just recognise) |
| Spaced practice | Mixed-review round pulls questions from earlier weeks |
| Interleaving | Mixed-review round + alternating lookalike concepts inside rounds |
| Elaboration / "explain why" | ≥ ~10 "why / what happens if" questions per paper; model answers say why others are wrong |
| Generation effect | fillblank / match / order / sort |
| Explain-first for novices (worked examples) | Reading cards before each round |
| Dual coding | Mermaid diagram on a card when the idea is a process or structure |

## Decisions made in brainstorming

- Formats: fillblank (typed, accepted-list match), match, order, sort. Approach A — one new
  question type per format, following the `multi` precedent.
- Typed blanks: accepted-list match; case, spacing and punctuation ignored, spelling must match;
  a **"Mark me correct"** button appears after a wrong reveal.
- Mix per ~50-question paper: ~26 mcq, ~10 multi, ~2 truefalse, ~12 new formats (~3 each).
  Reading cards do not count toward the ~50 cap and are not scored.
- Reading cards are **mixed into the quiz** (one before each round), chosen over one primer per paper.
- Scope: new and regenerated weeks only. Existing papers untouched.
- Out of scope (deliberately): confidence tap before answering, pre-lecture warm-up paper,
  automatic re-surfacing of old weeks (the old review ladder was removed on purpose), partial
  credit, drag-and-drop, typed `short` / `scenario` questions (Phase 2 in CLAUDE.md is still
  not active — single-word blanks are exact-match gradable and are the only typed answer allowed).

## Section 1 — New question formats

### Schema (`exam-content/types.ts`)

```ts
type ExamQuestionType = "mcq" | "truefalse" | "short" | "scenario" | "multi"
  | "fillblank" | "match" | "order" | "sort";
```

New optional fields on `ExamQuestionSeed`:

| Field | Type | Used by | Meaning |
|---|---|---|---|
| `blanks` | `string[][]` | fillblank | Accepted answers per blank. `prompt` contains one `___` per blank, in order. |
| `pairs` | `{ left: string; right: string }[]` | match | 3–6 rows. Display order of `left` is the authored order. |
| `decoys` | `string[]` | match (optional) | Extra wrong right-hand choices (0–2). |
| `steps` | `string[]` | order | Authored in the **correct** order; 3–7 steps. |
| `groups` | `string[]` | sort | 2–3 labelled boxes. |
| `items` | `{ text: string; group: number }[]` | sort | 4–8 items; `group` indexes `groups`. |

`modelAnswer` stays required for every type and follows the existing teenager-style shape.

### Stored answer (`yourAnswer`, a JSON string — no DB migration)

- fillblank → `string[]` typed text, one per blank
- match → `number[]` — for each left row, the index into the canonical right list
  (`pairs.map(p => p.right)` followed by `decoys`); correct row `i` is `i`
- order → `number[]` — the student's arrangement as canonical step indices; correct is `[0..n-1]`
- sort → `number[]` — chosen group index per item

### Marking (`exam/grading.ts`, pure functions, unit-tested)

One mark, all-or-nothing, identical to every existing type. Functions: `normaliseBlank`
(lowercase, trim, collapse whitespace, strip punctuation), `isFillBlankCorrect`, `isMatchCorrect`,
`isOrderCorrect`, `isSortCorrect`. After grading, the UI highlights which parts were right/wrong
and reveals the correct arrangement.

`gradeExamAnswer` already upserts (`exam/db.ts:461`), so **"Mark me correct"** is just a second
`api.grade(..., true, yourAnswer)` after a wrong first grade — no server change.

### Display behaviour

- Match: fixed left column; per-row `<select>` over the shuffled right choices.
- Order: shuffled list with up/down buttons per row (no drag). The initial shuffle is
  deterministic per question and never equals the correct order.
- Sort: per item, one button per group.
- Fillblank: one text input per `___`, rendered inline in the prompt.
- Shuffles are deterministic (seeded from course/week/paper/question index) so a reload shows the
  same layout.
- Checked with a "Check answer" button (same as `multi`); reloading restores saved answers.

### Timer (`exam/timer.ts`, `BASE_SECONDS` is `Record<ExamQuestionType, number>` so the compiler
forces every type to be covered)

fillblank 45, match 60, order 60, sort 60; plus 10s per blank/step/item/row beyond the fourth.

### Files

`exam-content/types.ts`, `exam/api.ts` (`ExamQuestionView` + `paperView` pass the new fields),
`exam/grading.ts`, `exam/timer.ts`, `exam/App.tsx` (four new question components, wired in both
the review and the live branches), `exam/*.test.ts`.

## Section 2 — Reading cards

### Schema

```ts
interface ExamReadingSeed {
  beforeQuestion: number;   // index of the first question of the round this card introduces
  title: string;
  body: string;             // PromptText style; 100–150 words, hard cap 200
  diagram?: string;         // optional Mermaid
}
// ExamPaperSeed gains:  readings?: ExamReadingSeed[]
```

A card is attached **by position**, not numbered like a question, so question indices — the key
under which a student's graded answers are stored — never shift. Updates still only append
questions; a new card may be attached before the first appended question. Existing papers have no
`readings` and behave exactly as today.

### Behaviour

- The paper is presented as an ordered list of steps: cards and questions. Header and progress bar
  count **questions only**; the submit gate is unchanged (every question graded).
- A card step has a Continue button and **no question timer** (timer is not shown / not running).
- **No peeking mid-round:** Previous does not step onto a card while any question in that round is
  still ungraded. Once the round is fully graded, and in review mode, the card is visible again
  (review mode renders each card above its round).
- Cards follow the same plain-language style as model answers: analogy first, short bullets,
  jargon defined inline, `PromptText` formatting rules.
- Cards teach the concept; the round's questions **apply** it (new example, lookalike, "what
  happens if") and must not repeat a card sentence as the answer.

### Files

`exam-content/types.ts`, `exam/api.ts` (`ExamPaperView.readings`), `exam/App.tsx` (step list,
card component, Previous rule), tests.

## Section 3 — Five-agent generation pipeline

Replaces the single `claude -p` call in `runGeneration` (`exam/generate.ts`). Each stage is its own
`claude -p` call with a narrow prompt and hands its output to the next as a file. Stages run
sequentially, and the existing one-job-at-a-time global lock stays (jobs share `exam/content.ts`).

| # | Agent | Reads | Writes | Job |
|---|---|---|---|---|
| 1 | Reader | week's slides, tutorial sheets, `*.transcript.md`, `unit_outline.md`, `assessment_overview.md` | `week-N-notes.md` | Key points (slide vs video-only), post-lecture Q&A, **every in-class quiz question verbatim** |
| 2 | Explainer | notes | `week-N-learning.md` | Pick the 5–8 ideas that matter; for each: analogy, worked example, jargon decoder, optional diagram. Becomes the cards and stands alone as a study guide. |
| 3 | Planner | notes, learning set, prior weeks' content | `week-N-plan.md` | Which ideas need a card first; rounds; a format per idea; quotas; where every lecture-quiz question lands; mixed-review round contents |
| 4 | Writer | plan, learning set, notes | `week-N.ts` (+ `exam/content.ts` wiring for a new week) | Cards and questions in the teen-style |
| 5 | Checker | all of the above | fixes in place | Independent audit against the checklist below; runs the checks; fixes before finishing |

**Format selection (Planner):** definitions → match; processes/protocols → order;
classifications ("threat vs control") → sort; key terms → fillblank; distinguish/apply → mcq or
multi; several true statements → multi.

**Writing rules the Planner and Writer follow (also added to the authoring guide):**

1. Every lecture-quiz question included (existing rule); they count toward the ~50.
2. Final round = **mixed review**, no card: ~6–8 questions, ≥3 from earlier weeks, written as
   *new* questions on those concepts (never copies) so no existing index is affected. Week 1 has
   no earlier weeks, so its review round is jumbled this-week topics only.
3. Inside rounds, alternate lookalike concepts; in the review round, no more than 2 consecutive
   questions on the same subtopic.
4. ≥ ~10 "why / what happens if" questions per paper.
5. A diagram on a card or question whenever the idea is a process or structure.
6. New-format quota ~12 of 50 (~3 per format), used where the content fits.
7. Existing rules stay: exam-style, close distractors, no length tell, roughly even
   `correctIndex`, `modelAnswer` in the teenager shape.

**Checker checklist:** all lecture-quiz questions present; count ≈ 50 and mix within tolerance;
no card sentence answers a question; answers traceable to source; structure validator passes;
`bun scripts/check-mcq-lengths.ts` clean; `bun test` green. In Update mode also: every pre-existing
question unchanged and in place (`git diff`).

**Update mode** runs the same five stages but scoped to the new material; the Writer only appends
questions (and cards attached at or after the old length); the Checker enforces this.

### Job status and UI

`JobStatus` gains `stage` (`read | explain | plan | write | check`) and, on failure,
`failedStage`. A stage that exits successfully but did not produce its output file is treated as
failed. **Retry resumes from the failed stage** (its inputs already exist on disk); a fresh
Generate starts at Reader. The Modules-tab label becomes `Generating… <Stage> n/5 m:ss`.

### Files

- New `exam/pipeline.ts` — stage definitions and prompt builders (keeps `generate.ts` focused on
  orchestration).
- `exam/generate.ts` — sequential stage runner, per-stage status, resume, output-file checks.
- `ALLOWED_TOOLS` gains `Bash(git diff*)` and `Bash(bun scripts/*)`, still no broader.
- `.claude/commands/generate-week-content.md` — the in-session equivalent runs the same five
  stages with subagents, in the same order.
- `exam/App.tsx` — stage label.

## Validation (`scripts/check-exam-structure.ts` + `.test.ts`, runs inside `bun test`)

Runs over `buildExamSchedule()` so a malformed authored question fails the suite, mirroring
`check-mcq-lengths.test.ts`:

- fillblank: count of `___` in `prompt` equals `blanks.length`; every blank has ≥1 non-empty answer
- match: 3–6 pairs; right-hand texts unique across pairs and decoys; ≤2 decoys
- order: 3–7 steps, all distinct
- sort: 2–3 groups; 4–8 items; every `group` valid; every group used at least once
- readings: `beforeQuestion` in range, unique, ascending; body ≤ 200 words
- paper size ≤ ~55 questions (soft ceiling over the ~50 target)

Existing content must keep passing untouched.

## Docs updated

- `docs/exam-content-authoring-guide.md` — new types, cards, rounds, mixed review, the five-agent
  process, the writing rules above.
- `CLAUDE.md` — Phase 1 rule amended (single-word typed blanks allowed; `short`/`scenario` still
  Phase 2); the stale "Outstanding gap" note removed (`multi` exists); question-mix line updated.

## Error handling

- Malformed authored question → validator fails `bun test`; Checker fixes before the job ends.
- Corrupt or missing saved `yourAnswer` JSON → component falls back to a blank state (same as
  `MultiQuestion`'s `savedPicks` guard).
- Stage failure → status `failed` with `failedStage` and log tail; Retry resumes there.

## Testing

Unit tests for each grading function (including blank normalisation and multi-blank all-or-nothing),
timer budgets for the new types, the structure validator (pass and fail cases), the pipeline (stage
order, resume-from-failed-stage, missing-output = failure, using the existing fake-`runClaude`
pattern), and `paperView` passing the new fields. The UI is verified in the browser with the
Claude-in-Chrome tool against a throwaway fixture paper (removed before merge): each format —
answer right, answer wrong, reload, "Mark me correct" — and a card round including the Previous
rule.

## Spec requirement: continuous testing

- **Automated Hooks:** a hook fires every time the AI saves a change (PostToolUse on Write/Edit).
  This is already configured in `.claude/settings.json`.
- **Continuous Testing:** that hook runs the test suite (`bun test`) and the type checker
  (`tsc --noEmit`). This project has no separate build step.
- **Autonomous Correction:** if a test or type check fails, the AI sees the output immediately and
  fixes its own mistake before the user has to intervene, so the user always returns to green.
