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

// Returns a comparison KEY with case, spacing and punctuation all removed:
// NFKC-normalise, lowercase, then drop every character that is not a letter or
// number. Both the typed text and every accepted answer go through this, so
// "M.A.C.", "e-mail" and "TCP/IP" match "mac", "email" and "tcp ip".
export function normaliseBlank(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

// One blank: typed text must match one accepted answer once normalised; an
// empty (or all-punctuation) answer is never correct.
export function isBlankCorrect(typed: string, accepted: string[]): boolean {
  const t = normaliseBlank(typed);
  return t !== "" && accepted.some((a) => normaliseBlank(a) === t);
}

// Every blank must match one of its accepted answers; all-or-nothing.
export function isFillBlankCorrect(typed: string[], blanks: string[][]): boolean {
  if (typed.length !== blanks.length) return false;
  return blanks.every((accepted, i) => isBlankCorrect(typed[i] ?? "", accepted));
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
