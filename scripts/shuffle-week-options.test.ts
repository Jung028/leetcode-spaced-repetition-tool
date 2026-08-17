import { test, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { shuffleOptionsInSource } from "./shuffle-week-options";

// Writes shuffled fixture output to a real .ts file and imports it with
// Bun (which transpiles TS on the fly) so extraction exercises the actual
// file — type annotations, `import type`, and all — instead of a
// hand-rolled JS-only re-parse of the source text.
async function loadPapers(source: string): Promise<any[]> {
  const dir = mkdtempSync(join(tmpdir(), "shuffle-test-"));
  try {
    await Bun.write(join(dir, "types.ts"), "export {};\n");
    const weekPath = join(dir, "week-1.ts");
    await Bun.write(weekPath, source);
    const mod = await import(weekPath + `?t=${Date.now()}-${Math.random()}`);
    return mod.WEEK_1_PAPERS;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const SINGLE_LINE_FIXTURE = `import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  course: "TEST",
  week: 1,
  paperNumber: 1,
  title: "Test Paper",
  topics: "testing",
  sourceFiles: [],
  questions: [
    {
      type: "mcq",
      prompt: "Question one?",
      options: ["Correct one", "Wrong A", "Wrong B", "Wrong C"],
      correctIndex: 0,
      modelAnswer: "Because correct one is correct.",
    },
    {
      type: "mcq",
      prompt: "Question two?",
      options: ["Wrong X", "Correct two", "Wrong Y"],
      correctIndex: 1,
      modelAnswer: "Because correct two is correct.",
    },
  ],
};

export const WEEK_1_PAPERS: ExamPaperSeed[] = [PAPER];
`;

const MULTI_LINE_FIXTURE = `import type { ExamPaperSeed } from "../types";

const PAPER: ExamPaperSeed = {
  course: "TEST",
  week: 1,
  paperNumber: 1,
  title: "Test Paper",
  topics: "testing",
  sourceFiles: [],
  questions: [
    {
      type: "mcq",
      prompt: "Question one?",
      options: [
        "Correct one",
        "Wrong A",
        "Wrong B",
        "Wrong C",
      ],
      correctIndex: 0,
      modelAnswer: "Because correct one is correct.",
    },
  ],
};

export const WEEK_1_PAPERS: ExamPaperSeed[] = [PAPER];
`;

async function extractOptionsAndCorrect(source: string, questionIndex: number): Promise<{ options: string[]; correctIndex: number }> {
  const papers = await loadPapers(source);
  const q = papers[0].questions[questionIndex];
  return { options: q.options, correctIndex: q.correctIndex };
}

test("shuffleOptionsInSource preserves the option set and repoints correctIndex at the same text, single-line style", async () => {
  const { output, count } = shuffleOptionsInSource(SINGLE_LINE_FIXTURE);
  expect(count).toBe(2);

  const q1 = await extractOptionsAndCorrect(output, 0);
  expect(new Set(q1.options)).toEqual(new Set(["Correct one", "Wrong A", "Wrong B", "Wrong C"]));
  expect(q1.options[q1.correctIndex]).toBe("Correct one");

  const q2 = await extractOptionsAndCorrect(output, 1);
  expect(new Set(q2.options)).toEqual(new Set(["Wrong X", "Correct two", "Wrong Y"]));
  expect(q2.options[q2.correctIndex]).toBe("Correct two");
});

test("shuffleOptionsInSource leaves prompt, modelAnswer, and every other field untouched", () => {
  const { output } = shuffleOptionsInSource(SINGLE_LINE_FIXTURE);
  expect(output).toContain('prompt: "Question one?"');
  expect(output).toContain('modelAnswer: "Because correct one is correct."');
  expect(output).toContain('prompt: "Question two?"');
  expect(output).toContain('modelAnswer: "Because correct two is correct."');
  expect(output).toContain('title: "Test Paper"');
});

test("shuffleOptionsInSource preserves multi-line array formatting", async () => {
  const { output, count } = shuffleOptionsInSource(MULTI_LINE_FIXTURE);
  expect(count).toBe(1);
  expect(output).toMatch(/options: \[\n(\s+".*",\n){4}\s+\],/);

  const q = await extractOptionsAndCorrect(output, 0);
  expect(new Set(q.options)).toEqual(new Set(["Correct one", "Wrong A", "Wrong B", "Wrong C"]));
  expect(q.options[q.correctIndex]).toBe("Correct one");
});

test("shuffleOptionsInSource actually reorders (doesn't just leave the same order) across repeated runs", async () => {
  // Statistical, not deterministic: with 4! = 24 orderings, seeing the exact
  // original order in every one of 20 independent shuffles is astronomically
  // unlikely unless the shuffle is silently a no-op.
  let sawDifferentOrder = false;
  for (let i = 0; i < 20; i++) {
    const { output } = shuffleOptionsInSource(SINGLE_LINE_FIXTURE);
    const q1 = await extractOptionsAndCorrect(output, 0);
    if (q1.options.join("|") !== "Correct one|Wrong A|Wrong B|Wrong C") {
      sawDifferentOrder = true;
      break;
    }
  }
  expect(sawDifferentOrder).toBe(true);
});
