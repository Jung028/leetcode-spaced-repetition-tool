import { test, expect } from "bun:test";
import { STAGES, STAGE_LABELS, SELF_CONTAINED_RULE, stageOutputPath, buildStagePrompt, type StageContext } from "./pipeline";

const ctx: StageContext = { course: "COMP5348", week: 5, weekDir: "/w/dir", mode: "generate" };

test("stages run in the agreed order with human labels", () => {
  expect(STAGES).toEqual(["read", "explain", "plan", "write", "check"]);
  expect(STAGE_LABELS.read).toBe("Reader");
  expect(STAGE_LABELS.check).toBe("Checker");
});

test("each stage names its output file; check writes none", () => {
  expect(stageOutputPath("read", "COMP5348", 5)).toBe("exam-content/comp5348/week-5-notes.md");
  expect(stageOutputPath("explain", "COMP5348", 5)).toBe("exam-content/comp5348/week-5-learning.md");
  expect(stageOutputPath("plan", "COMP5348", 5)).toBe("exam-content/comp5348/week-5-plan.md");
  expect(stageOutputPath("write", "COMP5348", 5)).toBe("exam-content/comp5348/week-5.ts");
  expect(stageOutputPath("check", "COMP5348", 5)).toBeNull();
});

test("reader prompt demands every in-class quiz question verbatim and reads the transcript", () => {
  const p = buildStagePrompt("read", ctx);
  expect(p).toContain("/w/dir");
  expect(p).toContain("week-5-notes.md");
  expect(p).toContain("verbatim");
  expect(p).toContain("transcript");
});

test("explainer prompt asks for analogy, worked example and jargon decoder for 5-8 ideas", () => {
  const p = buildStagePrompt("explain", ctx);
  expect(p).toContain("week-5-notes.md");
  expect(p).toContain("week-5-learning.md");
  expect(p).toContain("analogy");
  expect(p).toContain("jargon");
  expect(p).toMatch(/5.?8/);
});

test("planner prompt covers rounds, format selection, quotas and the mixed-review round", () => {
  const p = buildStagePrompt("plan", ctx);
  for (const s of ["week-5-plan.md", "match", "order", "sort", "fillblank", "mixed review", "about 12", "lecture-quiz"]) {
    expect(p).toContain(s);
  }
});

test("writer prompt wraps the base authoring prompt and points at the plan and learning set", () => {
  const p = buildStagePrompt("write", ctx, "BASE AUTHORING PROMPT");
  expect(p).toContain("BASE AUTHORING PROMPT");
  expect(p).toContain("week-5-plan.md");
  expect(p).toContain("week-5-learning.md");
  expect(p).toContain("readings");
});

test("checker prompt lists the audit checklist and the scripts to run", () => {
  const p = buildStagePrompt("check", ctx);
  for (const s of ["lecture-quiz", "check-exam-structure", "check-mcq-lengths", "bun test"]) expect(p).toContain(s);
});

test("update mode tells every stage the week is ALREADY-AUTHORED and forbids touching existing questions", () => {
  for (const stage of STAGES) {
    const p = buildStagePrompt(stage, { ...ctx, mode: "update" }, "BASE");
    expect(p).toContain("ALREADY-AUTHORED");
  }
  expect(buildStagePrompt("check", { ...ctx, mode: "update" })).toContain("git diff");
  expect(buildStagePrompt("write", { ...ctx, mode: "update" }, "BASE")).toContain("append");
});

test("planner, writer and checker all embed the identical shared self-contained rule", () => {
  for (const stage of ["plan", "write", "check"] as const) {
    expect(buildStagePrompt(stage, ctx, "BASE")).toContain(SELF_CONTAINED_RULE);
  }
  for (const s of ["the deck", "the worksheet", "the tutorial sheet", "the video", "as the lecturer said", "the diagram on slide N", "reading card"]) {
    expect(SELF_CONTAINED_RULE).toContain(s);
  }
  expect(buildStagePrompt("check", ctx)).toMatch(/self-contained[\s\S]*failure/i);
});

test("reader and explainer do not carry the question-writing rule", () => {
  expect(buildStagePrompt("read", ctx)).not.toContain("SELF-CONTAINED QUESTIONS");
  expect(buildStagePrompt("explain", ctx)).not.toContain("SELF-CONTAINED QUESTIONS");
});

test("reader copies the facts a slide-referring quiz question depends on", () => {
  expect(buildStagePrompt("read", ctx)).toContain("refers to a slide, figure or table");
});

test("generate mode demands the ~50 total and mix; update mode only constrains appended questions", () => {
  const gen = buildStagePrompt("plan", ctx);
  expect(gen).toContain("about 26 mcq");
  expect(gen).toContain("about 10 multi");
  expect(gen).toContain("about 2 truefalse");
  expect(gen).toContain("no earlier weeks");
  expect(buildStagePrompt("check", ctx)).toContain("about 50");

  const up = { ...ctx, mode: "update" as const };
  for (const stage of ["plan", "write", "check"] as const) {
    const p = buildStagePrompt(stage, up, "BASE");
    expect(p).not.toMatch(/~50|about 50/);
    expect(p).not.toContain("about 12");
  }
  expect(buildStagePrompt("plan", up)).not.toContain("mixed review round with no card");
  expect(buildStagePrompt("plan", up)).toContain("Do not add a new mixed-review round");
  expect(buildStagePrompt("check", up)).toContain("do not require a fixed paper total");
});

test("writer says the plan quotas override the base prompt's smaller count, and states card format rules", () => {
  const p = buildStagePrompt("write", ctx, "BASE");
  expect(p).toContain("override any smaller count in the base prompt");
  expect(p).toContain("~50-question total");
  expect(p).toContain("about 12 new-format, 26 mcq, 10 multi, 2 truefalse");
  expect(p).toContain("≤ 200 words");
  expect(p).toContain('starts with "• "');
  expect(p).toContain("no markdown bold");
  expect(buildStagePrompt("check", ctx)).toContain("≤ 200 words");
});
