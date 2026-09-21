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

// Lowercase, turn punctuation into spaces, collapse runs of whitespace. Both the
// typed text and every accepted answer go through this, so "M.A.C." == "mac"
// only if the accepted list says so — spelling still has to match.
export function normaliseBlank(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Every blank must match one of its accepted answers; all-or-nothing.
export function isFillBlankCorrect(typed: string[], blanks: string[][]): boolean {
  if (typed.length !== blanks.length) return false;
  return blanks.every((accepted, i) => {
    const t = normaliseBlank(typed[i] ?? "");
    return t !== "" && accepted.some((a) => normaliseBlank(a) === t);
  });
}

// match: row i's correct partner is canonical right index i.
export function isMatchCorrect(chosen: number[], rowCount: number): boolean {
  return chosen.length === rowCount && chosen.every((c, i) => c === i);
}

// order: canonical step indices, correct when already 0..n-1.
export function isOrderCorrect(arrangement: number[], stepCount: number): boolean {
  return arrangement.length === stepCount && arrangement.every((v, i) => v === i);
}

// sort: the chosen group per item must equal the authored group per item.
export function isSortCorrect(chosen: number[], correct: number[]): boolean {
  return chosen.length === correct.length && chosen.every((c, i) => c === correct[i]);
}
