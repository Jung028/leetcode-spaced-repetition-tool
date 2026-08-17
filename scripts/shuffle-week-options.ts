// One-off/reusable fixer: an exam-content week file can end up with every
// question's correctIndex at the same position (e.g. all "A") when it was
// authored in a single pass without deliberately varying answer placement
// — a positional tell that lets a student game the paper without knowing
// the material. This rewrites every `options: [...]` / `correctIndex: N`
// pair in place with a shuffled option order (and matching new
// correctIndex), touching nothing else in the file — not prompt text,
// modelAnswer text, comments, or surrounding formatting/indentation style
// (single-line or multi-line arrays are both preserved as found).
import { readFileSync, writeFileSync } from "node:fs";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i]!, out[j]!] = [out[j]!, out[i]!];
  }
  return out;
}

// Scans forward from an `options: [` match's `[` to its matching `]`,
// respecting quoted strings (so a `]` or `,` inside an option's text can't
// be mistaken for structure).
function findMatchingBracket(source: string, openBracketIndex: number): number {
  let depth = 0;
  let inString: '"' | "'" | null = null;
  for (let i = openBracketIndex; i < source.length; i++) {
    const c = source[i];
    if (inString) {
      if (c === "\\") { i++; continue; }
      if (c === inString) inString = null;
      continue;
    }
    if (c === '"' || c === "'") { inString = c as '"' | "'"; continue; }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return i + 1; // just past the closing bracket
    }
  }
  throw new Error(`Unterminated options array starting at ${openBracketIndex}`);
}

interface Edit {
  start: number;
  end: number;
  replacement: string;
}

export function shuffleOptionsInSource(source: string, rng: () => number = Math.random): { output: string; count: number } {
  const edits: Edit[] = [];
  const optionsRe = /options: \[/g;
  let m: RegExpExecArray | null;
  while ((m = optionsRe.exec(source))) {
    const bracketOpen = m.index + m[0].length - 1; // index of '['
    const optionsEnd = findMatchingBracket(source, bracketOpen);
    const literalText = source.slice(bracketOpen, optionsEnd);
    const multiline = literalText.includes("\n");
    const options: string[] = new Function(`return ${literalText}`)();

    const ciRe = /correctIndex:\s*(\d+)/;
    const rest = source.slice(optionsEnd, optionsEnd + 200);
    const ciMatch = ciRe.exec(rest);
    if (!ciMatch) throw new Error(`No correctIndex found after options block at ${bracketOpen}`);
    const correctIndex = Number(ciMatch[1]);
    if (correctIndex < 0 || correctIndex >= options.length) {
      throw new Error(`correctIndex ${correctIndex} out of range for options block at ${bracketOpen}`);
    }
    const ciDigitsStart = optionsEnd + ciMatch.index + ciMatch[0].lastIndexOf(ciMatch[1]!);
    const ciDigitsEnd = ciDigitsStart + ciMatch[1]!.length;

    const correctText = options[correctIndex]!;
    // Re-roll until the order actually changes (a no-op shuffle on a small
    // array is common enough with Math.random that skipping this check
    // would silently leave some questions untouched).
    let shuffled = shuffle(options);
    let attempts = 0;
    while (shuffled.every((o, i) => o === options[i]) && attempts < 10) {
      shuffled = shuffle(options);
      attempts++;
    }
    const newIndex = shuffled.indexOf(correctText);

    const indent = multiline ? source.slice(source.lastIndexOf("\n", bracketOpen) + 1, m.index) : "";
    const rendered = multiline
      ? "[\n" + shuffled.map((o) => `${indent}  ${JSON.stringify(o)},\n`).join("") + `${indent}]`
      : "[" + shuffled.map((o) => JSON.stringify(o)).join(", ") + "]";

    edits.push({ start: bracketOpen, end: optionsEnd, replacement: rendered });
    edits.push({ start: ciDigitsStart, end: ciDigitsEnd, replacement: String(newIndex) });
  }

  edits.sort((a, b) => a.start - b.start);
  let output = "";
  let cursor = 0;
  for (const edit of edits) {
    output += source.slice(cursor, edit.start) + edit.replacement;
    cursor = edit.end;
  }
  output += source.slice(cursor);
  return { output, count: edits.length / 2 };
}

if (import.meta.main) {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: bun scripts/shuffle-week-options.ts <path/to/week-N.ts>");
    process.exit(1);
  }
  const source = readFileSync(path, "utf8");
  const { output, count } = shuffleOptionsInSource(source);
  writeFileSync(path, output);
  console.log(`Shuffled ${count} question(s) in ${path}`);
}
