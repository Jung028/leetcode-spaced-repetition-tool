// One-off migration: collapses each week's 3 practice papers into a single
// paper (concatenating their questions in paper-1/2/3 order, so previously
// graded answers — which are keyed by array position, see exam-api.ts's
// `content.questions.map((q, index) => ...)` — keep matching the same
// question content for paper 1's original 14 questions). Run once per
// target file, then delete this script; it's not meant to be reusable
// tooling, just how this particular restructuring was done.
import type { ExamPaperSeed, ExamQuestionSeed } from "../exam-content/types";

function quote(s: string): string {
  return JSON.stringify(s);
}

function renderQuestion(q: ExamQuestionSeed): string {
  const lines: string[] = ["      {"];
  lines.push(`        type: ${quote(q.type)},`);
  lines.push(`        prompt: ${quote(q.prompt)},`);
  if (q.options) {
    lines.push(`        options: [${q.options.map(quote).join(", ")}],`);
  }
  if (q.correctIndex !== undefined) {
    lines.push(`        correctIndex: ${q.correctIndex},`);
  }
  lines.push(`        modelAnswer: ${quote(q.modelAnswer)},`);
  lines.push("      },");
  return lines.join("\n");
}

function renderPaper(p: ExamPaperSeed): string {
  const lines: string[] = ["  {"];
  lines.push(`    course: ${quote(p.course)},`);
  lines.push(`    week: ${p.week},`);
  lines.push(`    paperNumber: ${p.paperNumber},`);
  lines.push(`    title: ${quote(p.title)},`);
  lines.push(`    topics: ${quote(p.topics)},`);
  lines.push(`    sourceFiles: [${p.sourceFiles.map(quote).join(", ")}],`);
  lines.push("    questions: [");
  lines.push(p.questions.map(renderQuestion).join("\n"));
  lines.push("    ],");
  lines.push("  }");
  return lines.join("\n");
}

function combine(papers: ExamPaperSeed[]): ExamPaperSeed {
  const first = papers[0]!;
  return {
    course: first.course,
    week: first.week,
    paperNumber: 1,
    title: `Week ${first.week} Practice Paper`,
    topics: papers.map((p) => p.topics).join("; "),
    sourceFiles: first.sourceFiles,
    questions: papers.flatMap((p) => p.questions),
  };
}

async function combineFile(modulePath: string, exportName: string, filePath: string) {
  const mod = await import(modulePath);
  const papers: ExamPaperSeed[] = mod[exportName];
  if (papers.length === 1) {
    console.log(`${filePath}: already 1 paper, skipping`);
    return;
  }
  const combined = combine(papers);
  const source = `import type { ExamPaperSeed } from "../types";\n\nconst PAPER: ExamPaperSeed = \n${renderPaper(combined)}\n\nexport const ${exportName}: ExamPaperSeed[] = [PAPER];\n`;
  await Bun.write(filePath, source);
  console.log(`${filePath}: combined ${papers.length} papers -> 1 (${combined.questions.length} questions)`);
}

await combineFile("../exam-content/info5995/week-1", "WEEK_1_PAPERS", `${import.meta.dir}/../exam-content/info5995/week-1.ts`);
await combineFile("../exam-content/comp5348/week-1", "WEEK_1_PAPERS", `${import.meta.dir}/../exam-content/comp5348/week-1.ts`);
await combineFile("../exam-content/info6007/week-1", "WEEK_1_PAPERS", `${import.meta.dir}/../exam-content/info6007/week-1.ts`);
await combineFile("../exam-content/info6007/week-2", "WEEK_2_PAPERS", `${import.meta.dir}/../exam-content/info6007/week-2.ts`);
await combineFile("../exam-content/info5990/week-1", "WEEK_1_PAPERS", `${import.meta.dir}/../exam-content/info5990/week-1.ts`);
