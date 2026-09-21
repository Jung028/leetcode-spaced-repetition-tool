// The five-agent generation pipeline: stage definitions and prompt builders.
// Browser-safe on purpose (no node:* imports) — App.tsx imports STAGE_LABELS.
// generate.ts runs the stages; each is its own `claude -p` call that hands its
// output to the next as a file on disk.

export type StageName = "read" | "explain" | "plan" | "write" | "check";
export type GenerateMode = "generate" | "update";

export const STAGES: StageName[] = ["read", "explain", "plan", "write", "check"];

export const STAGE_LABELS: Record<StageName, string> = {
  read: "Reader",
  explain: "Explainer",
  plan: "Planner",
  write: "Writer",
  check: "Checker",
};

export interface StageContext {
  course: string;
  week: number;
  weekDir: string;
  mode: GenerateMode;
}

// Repo-relative file each stage must produce. The checker edits in place and
// produces no new file.
export function stageOutputPath(stage: StageName, course: string, week: number): string | null {
  const dir = `exam-content/${course.toLowerCase()}`;
  switch (stage) {
    case "read": return `${dir}/week-${week}-notes.md`;
    case "explain": return `${dir}/week-${week}-learning.md`;
    case "plan": return `${dir}/week-${week}-plan.md`;
    case "write": return `${dir}/week-${week}.ts`;
    case "check": return null;
  }
}

const HEADLESS =
  "You are running unattended in headless mode with no human present to ask questions — make reasonable, well-justified judgment calls yourself rather than stopping to ask.";

// Shared verbatim by the planner, writer and checker so all three enforce the
// same rule. Born from a real report: a question referred to "the deck's
// numbers" that the student could never see.
export const SELF_CONTAINED_RULE =
  `SELF-CONTAINED QUESTIONS (hard rule): every question must be self-contained — answerable from the question text itself, any reading card in the paper, and the student's knowledge. A question must never say "the deck", "the slides", "the lecture", "the worksheet", "the tutorial sheet", "the video", "as the lecturer said", or "the diagram on slide N" says / matches / shows / explained something unless it either states the actual numbers or facts in the question itself, or points the student to a reading card that contains them. The student cannot see the deck, slides, worksheet, tutorial sheet, video or diagrams.`;

function modeNote(ctx: StageContext): string {
  if (ctx.mode === "generate") return "";
  return `\n\nMODE: this week is ALREADY-AUTHORED (exam-content/${ctx.course.toLowerCase()}/week-${ctx.week}.ts exists). New material was added after it was written. Work only on what the new material adds; never reorder, delete, or rewrite the position of any existing question. Only append new questions to the END of an existing paper's questions array, and attach any new reading card at or after the old question count. Never create a new paperNumber.`;
}

export function buildStagePrompt(stage: StageName, ctx: StageContext, writerBase = ""): string {
  const lc = ctx.course.toLowerCase();
  const notes = `exam-content/${lc}/week-${ctx.week}-notes.md`;
  const learning = `exam-content/${lc}/week-${ctx.week}-learning.md`;
  const plan = `exam-content/${lc}/week-${ctx.week}-plan.md`;
  const note = modeNote(ctx);
  const update = ctx.mode === "update";

  switch (stage) {
    case "read":
      return `You are the READER for ${ctx.course} week ${ctx.week} of the leetcode-srs project. Follow docs/exam-content-authoring-guide.md, point 1.

Read all real material in "${ctx.weekDir}": slides, tutorial sheets, and every "*.transcript.md" (an auto-generated transcript of a lecture/tutorial recording — the video itself can't be opened). Also read exam-content/${lc}/unit_outline.md and exam-content/${lc}/assessment_overview.md if they exist.

Write ${notes} with these sections:
1. Important points from slides.
2. Important points only in the video (announcements, asides, verbal emphasis, worked examples).
3. Lecture-quiz questions: EVERY question the lecturer puts to the class (Mentimeter/poll/in-class quiz/"pause and think"/rhetorical-then-answered), copied verbatim, each with the answer the lecturer gave. If a quiz question refers to a slide, figure or table, copy the numbers and facts it depends on into the notes right next to the question.
4. Post-lecture Q&A: bullet points from the informal teacher/student discussion at the tail of the recording.
Do not write any quiz questions yet.${note}

${HEADLESS} When done, print one short summary line.`;

    case "explain":
      return `You are the EXPLAINER for ${ctx.course} week ${ctx.week}. Read ${notes} (and the raw material in "${ctx.weekDir}" only to check a fact).

The reader of your output is a smart 15-year-old who has never seen the jargon and prioritises understanding over sounding precise. Pick the 5-8 ideas that matter most this week. Write ${learning}: for each idea, a section with
• an everyday analogy FIRST (one or two sentences, before any technical term),
• a short worked example,
• a "jargon decoder" defining every acronym and technical term the first time it appears,
• a Mermaid diagram only if the idea is a process or structure.
Keep each idea to roughly 100-150 words; hard cap 200. No markdown bold; use "• " bullets and blank lines between blocks, and avoid () {} _ => == inside multi-line blocks.${note}

${HEADLESS} When done, print one short summary line.`;

    case "plan":
      return `You are the PLANNER for ${ctx.course} week ${ctx.week}. Read ${notes}, ${learning}, and exam-content/${lc}/week-${ctx.week - 1}.ts plus earlier weeks' files if they exist, plus docs/exam-content-authoring-guide.md.

Write ${plan} deciding, before any question is written:
1. Rounds: which ideas need a reading card first, and which questions belong to each round (3-6 questions per round).
2. A format for each idea: definitions → match; processes/protocols → order; classifications → sort; key terms → fillblank; distinguish/apply → mcq or multi; several true statements → multi.
${update
  ? `3. Quotas: apply only to the questions you are appending for the new material — keep the same proportions of new-format, mcq, multi and truefalse questions where they make sense. Do NOT plan to reach a fixed paper total.
4. Where EVERY lecture-quiz question from the new material lands — none dropped.
5. Do not add a new mixed-review round in update mode; leave any existing one untouched.
6. Include "why / what happens if" questions among the new ones where the material supports them.`
  : `3. Quotas for a ~50-question paper: about 12 new-format questions (about 3 each of fillblank/match/order/sort), about 26 mcq, about 10 multi, about 2 truefalse. Tutorial papers can be smaller.
4. Where EVERY lecture-quiz question from the notes lands — none dropped; they count toward the ~50.
5. A final mixed review round with no card: about 6-8 questions, at least 3 on concepts from earlier weeks (new questions, never copies), the rest jumbled topics from this week, no more than 2 consecutive on the same subtopic. Week 1 has no earlier weeks.
6. At least ~10 "why / what happens if" questions.`}
7. Where a diagram helps.
8. For any question that depends on specific numbers or facts from the slides (a lecture-quiz question that referred to a slide, for example), which reading card will carry those numbers or facts, or that the question itself will state them.
Keep questions exam-style and application-focused: cards teach the idea, questions apply it to a new example and never repeat a card sentence as the answer.

${SELF_CONTAINED_RULE}${note}

${HEADLESS} When done, print one short summary line.`;

    case "write":
      return `${writerBase}

PIPELINE ADDENDUM — you are the WRITER stage. The reader, explainer and planner have already run. Read ${plan}, ${learning} and ${notes} FIRST and follow the plan exactly; consult the raw material only to verify a fact.
• Turn each learning-set idea the plan gives a card into a reading card in the paper's "readings" array (beforeQuestion = the index of that round's first question; body ≤ 200 words, plain teen-style; format rules: every bullet starts with "• ", a blank line between blocks, no markdown bold or asterisks).
• ${update
  ? "The plan's quotas govern the questions you append and override any count in the base prompt above; do not pad the paper to a fixed total."
  : "The plan's ~50-question total and type-mix quotas (about 12 new-format, 26 mcq, 10 multi, 2 truefalse) override any smaller count in the base prompt above."}
• Use the new question types (fillblank, match, order, sort) exactly as exam-content/types.ts defines them.
• Follow docs/exam-content-authoring-guide.md for the count, mix, and the teenager-style modelAnswer shape.
• ${SELF_CONTAINED_RULE}
• Run "bun scripts/check-exam-structure.ts" and "bun scripts/check-mcq-lengths.ts ${ctx.course}" and fix every issue.${modeNote(ctx)}`;

    case "check":
      return `You are the CHECKER for ${ctx.course} week ${ctx.week} — an independent reviewer who did not write this. Audit exam-content/${lc}/week-${ctx.week}.ts against ${plan}, ${learning}, ${notes} and docs/exam-content-authoring-guide.md, and FIX problems in place:
• every lecture-quiz question from the notes is present (none dropped or merged away);
• ${update
  ? "the questions appended for the new material follow the plan's type mix; do not require a fixed paper total or a new review round;"
  : "question count is about 50 per lecture paper and the type mix is within tolerance;"}
• no reading card contains the answer sentence to a question in its round;
• every modelAnswer is traceable to the source material and follows the teenager-style shape;
• readings are attached at the right beforeQuestion indices and each body is ≤ 200 words;
• every question obeys the SELF-CONTAINED QUESTIONS rule below: treat any violation as a failure and fix it (rewrite the question to state the facts, or add them to a reading card);
• run "bun scripts/check-exam-structure.ts", "bun scripts/check-mcq-lengths.ts ${ctx.course}", and "bun test" and fix every failure until all pass.${ctx.mode === "update" ? `\n• run "git diff -- exam-content/${lc}/week-${ctx.week}.ts" and confirm every pre-existing question is unchanged and in its original position; only appended questions and cards are allowed.` : ""}

${SELF_CONTAINED_RULE}${modeNote(ctx)}

${HEADLESS} When done, print one short summary line and confirm bun test passes.`;
  }
}
