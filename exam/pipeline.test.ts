import { test, expect } from "bun:test";
import { STAGES, STAGE_LABELS, stageOutputPath, buildStagePrompt, type StageContext } from "./pipeline";

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

test("planner, writer and checker all carry the same self-contained-questions rule", () => {
  for (const stage of ["plan", "write", "check"] as const) {
    const p = buildStagePrompt(stage, ctx, "BASE");
    expect(p).toContain("SELF-CONTAINED QUESTIONS");
    expect(p).toContain("self-contained");
    expect(p).toContain("the deck");
    expect(p).toContain("reading card");
  }
  expect(buildStagePrompt("check", ctx)).toMatch(/self-contained[\s\S]*fail/i);
});

test("reader and explainer do not carry the question-writing rule", () => {
  expect(buildStagePrompt("read", ctx)).not.toContain("SELF-CONTAINED QUESTIONS");
  expect(buildStagePrompt("explain", ctx)).not.toContain("SELF-CONTAINED QUESTIONS");
});
