import { join } from "node:path";
import type { ExamPaperSeed } from "../exam-content/types";
import { renderSubjectScript } from "./generate-memorisation-script";

interface SubjectDef {
  dir: string;
  code: string;
  name: string;
}

const SUBJECTS: SubjectDef[] = [
  { dir: "comp5348", code: "COMP5348", name: "Software Architecture for Large-Scale Enterprises" },
  { dir: "info5990", code: "INFO5990", name: "IT Professional Practice" },
  { dir: "info5995", code: "INFO5995", name: "Introduction to Cybersecurity" },
  { dir: "info6007", code: "INFO6007", name: "Project Management in IT" },
];

async function loadWeekPapers(courseDir: string, week: number): Promise<ExamPaperSeed[]> {
  const mod = await import(`../exam-content/${courseDir}/week-${week}.ts`);
  const key = `WEEK_${week}_PAPERS`;
  const papers = mod[key] as ExamPaperSeed[] | undefined;
  if (!papers) throw new Error(`${courseDir}/week-${week}.ts does not export ${key}`);
  return papers;
}

async function buildSubject(subject: SubjectDef): Promise<void> {
  const papersByWeek: ExamPaperSeed[][] = [];
  for (let week = 1; week <= 8; week++) {
    papersByWeek.push(await loadWeekPapers(subject.dir, week));
  }

  const script = renderSubjectScript(subject.name, subject.code, papersByWeek);

  const outDir = join(import.meta.dir, "..", "exam-content", subject.dir);
  const txtPath = join(outDir, "memorisation-script.txt");
  const pdfPath = join(outDir, "memorisation-script.pdf");
  await Bun.write(txtPath, script);

  const proc = Bun.spawn(["cupsfilter", txtPath], { stdout: "pipe", stderr: "pipe" });
  const [pdfBytes, stderrText, exitCode] = await Promise.all([
    new Response(proc.stdout).arrayBuffer(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    throw new Error(`cupsfilter failed for ${subject.code} (exit ${exitCode}): ${stderrText}`);
  }
  await Bun.write(pdfPath, pdfBytes);

  const questionCount = papersByWeek.flat().reduce((sum, p) => sum + p.questions.length, 0);
  console.log(`${subject.code}: ${questionCount} questions -> ${pdfPath}`);
}

const requested = process.argv.slice(2);
const subjects = requested.length > 0 ? SUBJECTS.filter((s) => requested.includes(s.dir)) : SUBJECTS;

for (const subject of subjects) {
  await buildSubject(subject);
}
