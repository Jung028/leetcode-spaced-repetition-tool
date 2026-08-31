// Detector for the mcq "length tell": when a question's correct option is
// written noticeably longer/more detailed (or, less commonly, noticeably
// shorter) than every distractor, a student can guess right by shape alone
// without reading the content — see the "Exam content question format" and
// "Verify independently after each agent finishes" sections of CLAUDE.md.
// This only detects the problem; fixing it means rewriting distractor text
// with real plausible detail, which needs judgment this script doesn't have.
import type { ExamPaperSeed, ExamQuestionSeed } from "../exam-content/types";

export interface LengthTell {
  course: string;
  week: number;
  paperTitle: string;
  prompt: string;
  kind: "long" | "short";
  correctLength: number;
  otherLengths: number[];
}

// A flag fires when the correct option is the length outlier (max or min)
// by both a relative margin (35%+ longer/shorter than the next-closest
// other option) and an absolute one (25+ characters) — small, incidental
// gaps are normal and not a real tell.
const RELATIVE_MARGIN = 1.35;
const ABSOLUTE_MARGIN = 25;

export function findLengthTells(papers: ExamPaperSeed[]): LengthTell[] {
  const tells: LengthTell[] = [];
  for (const paper of papers) {
    for (const q of paper.questions) {
      const tell = checkQuestion(q);
      if (!tell) continue;
      tells.push({
        course: paper.course,
        week: paper.week,
        paperTitle: paper.title,
        prompt: q.prompt,
        ...tell,
      });
    }
  }
  return tells;
}

function checkQuestion(q: ExamQuestionSeed): { kind: "long" | "short"; correctLength: number; otherLengths: number[] } | null {
  if (q.type !== "mcq" || !q.options || q.correctIndex === undefined) return null;
  const lengths = q.options.map((o) => o.length);
  const correctLength = lengths[q.correctIndex]!;
  const others = lengths.filter((_, i) => i !== q.correctIndex);
  if (others.length === 0) return null;

  const maxOther = Math.max(...others);
  const minOther = Math.min(...others);

  if (correctLength === Math.max(...lengths) && correctLength > maxOther * RELATIVE_MARGIN && correctLength - maxOther > ABSOLUTE_MARGIN) {
    return { kind: "long", correctLength, otherLengths: others };
  }
  if (correctLength === Math.min(...lengths) && minOther > correctLength * RELATIVE_MARGIN && minOther - correctLength > ABSOLUTE_MARGIN) {
    return { kind: "short", correctLength, otherLengths: others };
  }
  return null;
}

if (import.meta.main) {
  const { buildExamSchedule } = await import("../exam/content");
  const allPapers = buildExamSchedule();
  const filterCourse = process.argv[2]?.toUpperCase();
  const papers = filterCourse ? allPapers.filter((p) => p.course.toUpperCase() === filterCourse) : allPapers;

  const tells = findLengthTells(papers);
  for (const t of tells) {
    console.log(
      `FLAG-${t.kind.toUpperCase()} ${t.course} week ${t.week} [${t.paperTitle}] correctLen=${t.correctLength} otherLens=${t.otherLengths.join(",")} :: ${t.prompt.slice(0, 80)}`,
    );
  }
  console.log(`TOTAL FLAGS: ${tells.length}`);
  if (tells.length > 0) process.exit(1);
}
