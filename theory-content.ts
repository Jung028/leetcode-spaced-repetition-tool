// Static curriculum content for the Theory tab — 150 concept cards, grouped
// by category below and interleaved into a single day-by-day schedule by
// buildTheorySchedule(). This is pure content (no DB), so it's imported
// directly by both the server and the frontend, same as scheduling.ts.

export type Category =
  | "System Design"
  | "Data Structures & Algorithms"
  | "Distributed Systems"
  | "Databases"
  | "Networking & OS"
  | "Behavioral";

export interface ConceptSeed {
  question: string;
  answer: string;
}

export interface Concept extends ConceptSeed {
  day: number;
  category: Category;
}

export const SYSTEM_DESIGN: ConceptSeed[] = [
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
];

export const DSA: ConceptSeed[] = [
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
];

export const DISTRIBUTED: ConceptSeed[] = [
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
];

export const DATABASES: ConceptSeed[] = [
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
];

export const NETWORKING_OS: ConceptSeed[] = [
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
];

export const BEHAVIORAL: ConceptSeed[] = [
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
];

const CATEGORY_GROUPS: [Category, ConceptSeed[]][] = [
  ["System Design", SYSTEM_DESIGN],
  ["Data Structures & Algorithms", DSA],
  ["Distributed Systems", DISTRIBUTED],
  ["Databases", DATABASES],
  ["Networking & OS", NETWORKING_OS],
  ["Behavioral", BEHAVIORAL],
];

// Interleaves the category groups proportionally to their size (a group with
// 50 items appears roughly 3.3x as often as one with 15) while preserving
// each group's internal order — a fractional round-robin (Bresenham-style):
// every group accumulates its own share (size/total) each step, and the
// group with the largest accumulated share is picked next and decremented by
// 1, so error never builds up in one direction the way naive rounding would.
export function buildTheorySchedule(): Concept[] {
  const total = CATEGORY_GROUPS.reduce((sum, [, items]) => sum + items.length, 0);
  const indices = CATEGORY_GROUPS.map(() => 0);
  const share = CATEGORY_GROUPS.map(([, items]) => items.length / total);
  const acc = CATEGORY_GROUPS.map(() => 0);
  const result: Concept[] = [];

  for (let day = 1; day <= total; day++) {
    let best = -1;
    for (let g = 0; g < CATEGORY_GROUPS.length; g++) {
      acc[g]! += share[g]!;
      if (indices[g]! < CATEGORY_GROUPS[g]![1].length && (best === -1 || acc[g]! > acc[best]!)) {
        best = g;
      }
    }
    const [category, items] = CATEGORY_GROUPS[best]!;
    const seed = items[indices[best]!]!;
    result.push({ day, category, question: seed.question, answer: seed.answer });
    indices[best]! += 1;
    acc[best]! -= 1;
  }

  return result;
}

export const TOTAL_DAYS = buildTheorySchedule().length;
