
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Active exam prep priorities

- **INFO5990 Interactive Oral / Viva** — 10%, hurdle requirement, oral, no notes allowed, covers Weeks 1–6 (assessment slides) / 1–7 (marking rubric — unconfirmed conflict, see assessment_overview.md), held Week 8. See `exam-content/info5990/assessment_overview.md` for full assessment breakdown and the Viva marking rubric (Knowledge & Understanding /40, Communication & Clarity /40, Professionalism & Engagement /20). Only Week 1 content is authored so far (`exam-content/info5990/week-1.ts`) — remaining weeks need authoring per `docs/exam-content-authoring-guide.md` before the Week 8 Viva. Authoring must target the rubric (guide point 6): synthesis across concepts/weeks for Knowledge & Understanding depth, time-boxed structured answers for Communication & Clarity, unaided-recall model answers for Professionalism & Engagement.
- **Final exam prep, all courses**: `docs/exam-content-authoring-guide.md` (point 5) now requires authored weeks to include a few questions styled like each course's actual final exam format (per that course's `assessment_overview.md`), not just weekly-quiz-style recall.
- **INFO5990 Team Report / Group Assignment** — 35%, not a hurdle task, due Week 12. Full 13-criterion marking rubric (/70 total: org & industry context, business challenge & governance, methodology & timeline, stakeholder engagement, tech/cost/resource justification, IT governance & compliance, change management, QA & testing, risk/security/privacy, ethics, KPIs & monitoring, integration/research/presentation, SparkPlus peer evaluation) is in `exam-content/info5990/assessment_overview.md`. This is a deliverable-quality rubric, not a recall rubric — use it as a drafting/self-review checklist against the actual report content when helping with this assignment, not for SRS question generation.

## Exam content question format

Use the type mix and ratio from `docs/exam-content-authoring-guide.md` (mcq/truefalse/short/scenario) — questions are no longer restricted to `mcq` only. Every question must still include a written `modelAnswer`: for mcq/truefalse, why the correct option is correct; for short/scenario, the revealed answer itself. Always traceable to the source material, never invented.

### Question count per paper

Author enough questions to genuinely cover the source material — target
roughly **30–40 `mcq` questions and roughly 20 multiple-answer
(select-all-that-apply) questions per paper**, but let coverage drive the
count, not the other way around: reason about what's actually important in
the source material first, then write questions for it. Never skip a real
topic just to hit the numeric target, and never pad with filler or
near-duplicate questions just to reach the quota either — treat these
numbers as a floor to aim for when the material genuinely supports it, not
a ceiling and not a shortcut.

**Outstanding gap:** `ExamQuestionType` (`exam-content/types.ts:1`) is
currently `"mcq" | "truefalse" | "short" | "scenario"` — there is no
select-all-that-apply type yet, `correctIndex` is a single index (not a set
of indices), and `gradeExamAnswer`/the exam UI both assume one correct
option. Authoring "multiple-answer" questions per this target requires
adding that type to the schema, grading, and `ExamApp.tsx` first — treat
this as a prerequisite task, not something to fake with `mcq` in the
meantime.

Questions must be genuinely exam-hard, not easy recall:
- Distractor options must be *close* — plausible, same-category wrong answers that require real understanding to rule out (e.g. a term from the same lecture, a common misconception, an almost-right-but-subtly-wrong mechanism) — never filler options that are obviously unrelated or absurd, since those let a student guess correctly without knowing the material.
- Favor questions that require distinguishing between similar concepts, applying a concept to a new example, or spotting a subtle error, over questions that are answerable from the shape of the question alone (e.g. "which of these is a security term" when only one option is security-related).
- Keep every option the same rough length and level of detail — never let the correct option be noticeably longer, more specific, or more hedged than the distractors. That length tell lets a student guess right without knowing the material; distractors need the same care and specificity as the correct answer, not shorter afterthoughts. **This rule has been violated repeatedly by bulk/auto-authored batches even though it was already written down** — "keep it in mind" is not enough; run `bun scripts/check-mcq-lengths.ts [COURSE]` after authoring or editing any mcq content and fix every flagged question before considering the work done (see the mandatory step in "Exam content generation workflow" below).

### Diagrams, symbols, and drawing

`exam-content/types.ts`'s `ExamQuestionSeed` supports visual content beyond plain text — use it whenever the source material's own diagrams matter to the question:
- Unicode symbols (→ ≥ λ Σ ∴ etc.) directly in `prompt`/`modelAnswer` text need no schema support — use them freely wherever they make a question clearer or more compact than spelling the relation out in words.
- `promptDiagram` / `answerDiagram` take Mermaid syntax (flowchart, sequence, etc. — see https://mermaid.js.org) and render live via `MermaidDiagram.tsx`. Use `promptDiagram` when the question references an existing diagram from the material (architecture diagram, sequence diagram); use `answerDiagram` when the diagram itself *is* the answer (e.g. "sketch the request flow for X").
- Set `requiresDrawing: true` on any question that expects the student to sketch something by hand before checking the answer — the app shows a link to excalidraw.com as a scratchpad alongside the revealed answer.
- **Whenever a question names or quotes a specific slide, worksheet, or document page** ("Using the tutorial's 'Time Unit Conversion' slide…", "Worksheet Q1: a retailer stores…", "Refer to the architecture diagram on slide 12…"), you MUST attach that exact source page as a `promptImage` (data URI) so the student sees what the question is talking about — never leave a document-referencing question with only a hand-retyped paraphrase of it. Export the page with `pdftoppm` and base64-encode it into a `data:image/png;base64,…` URI — prefer `-mono` (1-bit) over `-gray`/plain color for a text/numbers page: it's typically 3-6x smaller (tens of KB vs. hundreds) at the same DPI with no loss of legibility, which matters because this rule means the same image is often embedded many times over (see next bullet). If the exact page genuinely can't be located or rendered, reword the question so it stands alone without the reference rather than pointing at a document the student can't see.
- **The image goes on *every* question that depends on that source, not just the first/anchor one.** The app shows one question per screen (its own textarea, Save answer, Previous/Next) — a student can land on question 5 of a worksheet cluster without ever having seen question 1, so each one must be independently self-contained. If a worksheet ("Worksheet Q1") spawns a scenario question plus several mcq/short follow-ups that each dig into one part of it, attach the same `promptImage` to all of them, not only the scenario. Prefer this over inlining the doc's full content as prose on the sub-questions.
- **Reformat a dense reproduced word-problem for readability** — never paste a worksheet's prose, given-data list, and worked calculation as one run-on paragraph. `PromptText` (`exam/App.tsx`) splits `prompt`/`modelAnswer` on blank lines (`\n\n`) into separate paragraphs, and auto-renders a multi-line block containing math operators/parens as a monospace code block — so give it that structure: one `\n\n`-separated paragraph for the setup, a `\n`-separated bullet list for given data, and the worked calculation as its own `\n`-separated block (one step per line) so it renders as code, not prose.
- **Split a multi-part worksheet item into one question per part** where the source poses several distinct sub-parts (e.g. "identify the errors" bundling half a dozen distinct mistakes, or "(a) … (b) … (c) …"). Each part becomes its own `mcq`/`short`/`scenario` question — its own answer box and its own Next — rather than forcing everything into one giant catch-all prompt with a single answer box. Keep a single roll-up/capstone question too if the whole-picture version still has value, but don't let it stand in as the *only* way to answer the individual parts.
- **No live embed or link to the source document exists yet.** The schema and UI only support inlining the page as `promptImage` (or Mermaid via `promptDiagram`) — there's no field or route for linking out to / opening the original PDF from within a question, since source material lives outside the served app (e.g. a local Desktop folder). If that's ever wanted, it needs a new capability (an asset store or a served-file route plus a schema field), not something to improvise per-question.

## Exam content generation workflow (new video material)

When a new lecture/tutorial recording is added to a week's folder (or an
existing week needs its lecture paper enriched with a recording that
wasn't available when it was first authored), do it this way:

1. **Transcribe first** — `bun scripts/transcribe-lecture.ts <path-to-video>`,
   per `docs/exam-content-authoring-guide.md` point 1. Only needed when
   authoring by hand/via subagent like this workflow does; the app's
   Generate button now runs this automatically
   (`transcribeWeekVideos` in `exam-generate.ts`, wired into
   `runGeneration` before the authoring step) and skips videos that
   already have a transcript, so don't re-transcribe something Generate
   would have caught on its own. Long lectures (~1-2h) take real
   wall-clock time on CPU — run it with a background shell command, don't
   block on it inline.
2. **For a week that's already authored, click Update in the app instead
   of doing this by hand** — the Modules/History view's Update button
   (`buildUpdatePrompt` in `exam-generate.ts`) now runs exactly this
   workflow automatically: it re-scans the week's material, transcribes
   any new video, reads the existing week file, and appends new questions
   to whichever paper the new material belongs to without touching
   existing questions' order (see `docs/exam-content-authoring-guide.md`,
   "Updating an already-authored week with new material," for why order
   must never change). Only fall back to delegating to a `general-purpose`
   subagent by hand for genuinely manual cases — no dev server running, or
   a scope boundary too specific for the automated prompt to infer on its
   own (e.g. "leave TUTORIAL_PAPER untouched, only rewrite LECTURE_PAPER").
3. **Run these subagents sequentially, not in parallel**, when more than
   one week needs authoring in the same session — they wire into the
   shared `exam-content.ts` (new import + `ALL_PAPERS` entry for a brand
   new week), and two agents editing that file at once can race.
4. **Verify independently after each agent finishes** — don't just trust
   its self-reported summary. Rerun `bun test` yourself (this runs
   `scripts/check-mcq-lengths.test.ts`'s `buildExamSchedule()` regression
   check, so a length tell anywhere in the aggregated content already
   fails the suite), and grep the new/changed file's `correctIndex:`
   values to confirm they're roughly even across 0-3 (see the known MCQ
   positional-bias risk — auto-authored MCQs skew toward one index unless
   deliberately checked; `bun scripts/shuffle-week-options.ts <file>` fixes
   this). Also run `bun scripts/check-mcq-lengths.ts [COURSE]` directly —
   it prints every mcq question whose correct option is a length/detail
   outlier (too long *or* too short vs. its distractors) and exits nonzero
   if any remain; **do not consider authoring done while it reports any
   flags**. This is the same length-tell called out in the "Exam content
   question format" rule above, and like positional bias it recurs by
   default in bulk/auto-authored batches unless something actually
   measures it — a prose reminder alone was not enough to stop it
   recurring, which is why this script exists. Fix flags by rewriting the
   short distractors to match the correct option's length and specificity
   (or, for the rarer inverse case, lengthening a too-short correct
   option) — never by trimming a correct option that's long because it's
   genuinely more detailed; cutting detail from the right answer degrades
   the model answer's usefulness for studying.

## Spec requirement: continuous testing

Every SPEC.md (or equivalent spec/plan doc) written for this project must include a section requiring the following, verbatim in intent:

- **Automated Hooks**: a hook fires every time the AI saves a change (PostToolUse on Write/Edit).
- **Continuous Testing**: that hook triggers the build step, the test suite (`bun test`), and the type checker (`tsc`).
- **Autonomous Correction**: if a test fails, the AI sees the failure output immediately and attempts to fix its own mistake before the user has to intervene, so the user always returns to a green (passing) state.

This repo currently has no such hook configured (no `.git/hooks/pre-commit`, no CI). Until one exists, treat this as an outstanding requirement — any SPEC.md that omits it is incomplete.
