// Round/card bookkeeping. A reading card introduces a "round": the questions from
// its beforeQuestion up to (not including) the next card's beforeQuestion, or the
// end of the paper. Pure and React-free so it can be unit-tested.
import type { ExamReadingSeed } from "../exam-content/types";

export function roundRange(readings: ExamReadingSeed[], readingIdx: number, questionCount: number): [number, number] {
  const start = readings[readingIdx]!.beforeQuestion;
  const end = readings[readingIdx + 1]?.beforeQuestion ?? questionCount;
  return [start, end];
}

export function readingFor(readings: ExamReadingSeed[], questionIndex: number): number {
  let found = -1;
  readings.forEach((r, i) => {
    if (r.beforeQuestion <= questionIndex) found = i;
  });
  return found;
}

export function roundFullyGraded(readings: ExamReadingSeed[], readingIdx: number, graded: (number | null)[]): boolean {
  const [a, b] = roundRange(readings, readingIdx, graded.length);
  for (let i = a; i < b; i++) if (graded[i] === null || graded[i] === undefined) return false;
  return true;
}

// Cards the student has effectively already seen when a paper opens: any card
// whose round has a graded question, or that lies before the resume point.
export function initialSeenCards(readings: ExamReadingSeed[], graded: (number | null)[], startIndex: number): Set<number> {
  const seen = new Set<number>();
  readings.forEach((r, i) => {
    const [a, b] = roundRange(readings, i, graded.length);
    const started = graded.slice(a, b).some((g) => g !== null && g !== undefined);
    if (started || r.beforeQuestion < startIndex) seen.add(i);
  });
  return seen;
}
