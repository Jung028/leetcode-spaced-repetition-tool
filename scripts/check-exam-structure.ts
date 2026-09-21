// Structural validator for the new question formats and reading cards. Runs over
// the whole schedule inside `bun test` (see check-exam-structure.test.ts), so a
// malformed authored question fails the suite — same idea as check-mcq-lengths.
import type { ExamPaperSeed, ExamQuestionSeed } from "../exam-content/types";
import { normaliseBlank } from "../exam/grading";

export interface StructureIssue {
  course: string;
  week: number;
  paperNumber: number;
  questionIndex: number | null;
  message: string;
}

export const MAX_PAPER_QUESTIONS = 55; // soft ceiling over the ~50 target
export const MAX_READING_WORDS = 200;
const NEW_TYPES = new Set(["fillblank", "match", "order", "sort"]);

const norm = (s: string) => s.trim().toLowerCase();
const distinct = (xs: string[]) => new Set(xs.map(norm)).size === xs.length;

function questionProblems(q: ExamQuestionSeed): string[] {
  const out: string[] = [];
  if (q.type === "fillblank") {
    const gaps = (q.prompt.match(/___/g) ?? []).length;
    if (!q.blanks || q.blanks.length === 0) return ["fillblank needs blanks"];
    if (gaps !== q.blanks.length) out.push(`prompt has ${gaps} "___" but blanks has ${q.blanks.length}`);
    q.blanks.forEach((accepted, i) => {
      if (accepted.length === 0 || accepted.some((a) => normaliseBlank(a) === "")) {
        out.push(`blank ${i} needs at least one accepted answer and none that is empty once case, spacing and punctuation are ignored`);
      }
    });
  } else if (q.type === "match") {
    const pairs = q.pairs ?? [];
    const decoys = q.decoys ?? [];
    if (pairs.length < 3 || pairs.length > 6) out.push(`match needs 3-6 pairs, has ${pairs.length}`);
    if (decoys.length > 2) out.push(`match allows at most 2 decoys, has ${decoys.length}`);
    if (!distinct([...pairs.map((p) => p.right), ...decoys])) out.push("match right-hand texts (incl. decoys) must be unique");
    if (!distinct(pairs.map((p) => p.left))) out.push("match left-hand texts must be unique");
  } else if (q.type === "order") {
    const steps = q.steps ?? [];
    if (steps.length < 3 || steps.length > 7) out.push(`order needs 3-7 steps, has ${steps.length}`);
    if (!distinct(steps)) out.push("order steps must be distinct");
  } else if (q.type === "sort") {
    const groups = q.groups ?? [];
    const items = q.items ?? [];
    if (groups.length < 2 || groups.length > 3) out.push(`sort needs 2-3 groups, has ${groups.length}`);
    if (items.length < 4 || items.length > 8) out.push(`sort needs 4-8 items, has ${items.length}`);
    if (items.some((it) => !Number.isInteger(it.group) || it.group < 0 || it.group >= groups.length)) {
      out.push("sort item group index out of range");
    } else {
      groups.forEach((_, g) => {
        if (!items.some((it) => it.group === g)) out.push(`sort group ${g} has no items`);
      });
    }
  }
  return out;
}

export function findStructureIssues(papers: ExamPaperSeed[]): StructureIssue[] {
  const issues: StructureIssue[] = [];
  for (const p of papers) {
    const add = (questionIndex: number | null, message: string) =>
      issues.push({ course: p.course, week: p.week, paperNumber: p.paperNumber, questionIndex, message });

    p.questions.forEach((q, i) => questionProblems(q).forEach((m) => add(i, m)));

    // The size ceiling only binds papers that use the new features, so the
    // existing (older, larger) papers keep passing untouched.
    const usesNew = (p.readings?.length ?? 0) > 0 || p.questions.some((q) => NEW_TYPES.has(q.type));
    if (usesNew && p.questions.length > MAX_PAPER_QUESTIONS) {
      add(null, `paper has ${p.questions.length} questions, ceiling is ${MAX_PAPER_QUESTIONS}`);
    }

    let prev = -1;
    for (const r of p.readings ?? []) {
      if (!Number.isInteger(r.beforeQuestion) || r.beforeQuestion < 0 || r.beforeQuestion >= p.questions.length) {
        add(null, `reading "${r.title}" beforeQuestion ${r.beforeQuestion} is out of range`);
      } else if (r.beforeQuestion <= prev) {
        add(null, `reading "${r.title}" beforeQuestion must be unique and ascending`);
      } else {
        prev = r.beforeQuestion;
      }
      const words = r.body.trim().split(/\s+/).filter(Boolean).length;
      if (words > MAX_READING_WORDS) add(null, `reading "${r.title}" is ${words} words, cap is ${MAX_READING_WORDS}`);
    }
  }
  return issues;
}

if (import.meta.main) {
  const { buildExamSchedule } = await import("../exam/content");
  const issues = findStructureIssues(buildExamSchedule());
  for (const i of issues) {
    console.log(`${i.course} week ${i.week} paper ${i.paperNumber} q${i.questionIndex ?? "-"}: ${i.message}`);
  }
  console.log(`TOTAL ISSUES: ${issues.length}`);
  if (issues.length > 0) process.exit(1);
}
