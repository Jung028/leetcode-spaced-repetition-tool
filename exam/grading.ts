// Pure grading helpers shared between the exam UI and its tests.

// A "multi" (select-all-that-apply) answer is correct only when the
// student's ticked set is exactly the correct set — every correct option
// and no incorrect one. Order and duplicates in either list are ignored.
export function isMultiCorrect(selected: number[], correct: number[]): boolean {
  const picked = new Set(selected);
  const answer = new Set(correct);
  if (picked.size !== answer.size) return false;
  for (const i of answer) {
    if (!picked.has(i)) return false;
  }
  return true;
}
