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
  if (!q.options) return null;

  // Which option indices grade as correct: one for mcq, a set for multi.
  let correctIdx: number[];
  if (q.type === "mcq" && q.correctIndex !== undefined) {
    correctIdx = [q.correctIndex];
  } else if (q.type === "multi" && q.correctIndices && q.correctIndices.length > 0) {
    correctIdx = q.correctIndices;
  } else {
    return null;
  }

  const correctSet = new Set(correctIdx);
  const lengths = q.options.map((o) => o.length);
  const correctLengths = lengths.filter((_, i) => correctSet.has(i));
  const others = lengths.filter((_, i) => !correctSet.has(i));
  if (others.length === 0 || correctLengths.length === 0) return null;

  const maxOther = Math.max(...others);
  const minOther = Math.min(...others);
  // For multi, "the correct option" is a set: a tell means every correct
  // option is the length outlier (all longer, or all shorter) — measured
  // at the correct side that's closest to the distractors.
  const correctNearLong = Math.min(...correctLengths); // weakest "long" case
  const correctNearShort = Math.max(...correctLengths); // weakest "short" case

  if (correctNearLong > maxOther && correctNearLong > maxOther * RELATIVE_MARGIN && correctNearLong - maxOther > ABSOLUTE_MARGIN) {
    return { kind: "long", correctLength: correctNearLong, otherLengths: others };
  }
  if (correctNearShort < minOther && minOther > correctNearShort * RELATIVE_MARGIN && minOther - correctNearShort > ABSOLUTE_MARGIN) {
    return { kind: "short", correctLength: correctNearShort, otherLengths: others };
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
