import type { ExamPaperSeed, ExamQuestionSeed } from "../exam-content/types";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function wrap(text: string, width = 96, indent = ""): string {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = indent;
  for (const word of words) {
    if (line.length > indent.length && line.length + 1 + word.length > width) {
      lines.push(line);
      line = indent + word;
    } else {
      line = line.length > indent.length ? `${line} ${word}` : line + word;
    }
  }
  if (line.length > indent.length) lines.push(line);
  return lines.join("\n");
}

function renderOptionsBlock(q: ExamQuestionSeed): string {
  if (!q.options) return "";
  return q.options.map((opt, i) => wrap(`  ${LETTERS[i]}. ${opt}`, 96, "     ")).join("\n");
}

function renderAnswer(q: ExamQuestionSeed): string {
  switch (q.type) {
    case "mcq":
    case "truefalse": {
      const letter = LETTERS[q.correctIndex ?? 0];
      const text = q.options?.[q.correctIndex ?? 0] ?? "";
      return `${letter}. ${text}\n\n${wrap(q.modelAnswer)}`;
    }
    case "multi": {
      const letters = (q.correctIndices ?? []).map((i) => LETTERS[i]).join(", ");
      const texts = (q.correctIndices ?? []).map((i) => `${LETTERS[i]}. ${q.options?.[i] ?? ""}`).join("\n");
      return `${letters}\n${wrap(texts, 96, "   ")}\n\n${wrap(q.modelAnswer)}`;
    }
    case "fillblank": {
      const blanks = (q.blanks ?? []).map((accepted, i) => `   Blank ${i + 1}: ${accepted[0]}`).join("\n");
      return `${blanks}\n\n${wrap(q.modelAnswer)}`;
    }
    case "match": {
      const pairs = (q.pairs ?? []).map((p) => `   ${p.left} -> ${p.right}`).join("\n");
      return `${pairs}\n\n${wrap(q.modelAnswer)}`;
    }
    case "order": {
      const steps = (q.steps ?? []).map((s, i) => wrap(`   ${i + 1}. ${s}`, 96, "      ")).join("\n");
      return `${steps}\n\n${wrap(q.modelAnswer)}`;
    }
    case "sort": {
      const byGroup = new Map<number, string[]>();
      (q.items ?? []).forEach((item) => {
        const list = byGroup.get(item.group) ?? [];
        list.push(item.text);
        byGroup.set(item.group, list);
      });
      const groups = (q.groups ?? [])
        .map((g, i) => wrap(`   ${g}: ${(byGroup.get(i) ?? []).join(", ")}`, 96, "      "))
        .join("\n");
      return `${groups}\n\n${wrap(q.modelAnswer)}`;
    }
    case "short":
    case "scenario":
    default:
      return wrap(q.modelAnswer);
  }
}

function renderQuestion(q: ExamQuestionSeed, n: number): string {
  const parts: string[] = [];
  parts.push(`Q${n}. ${q.type.toUpperCase()}`);
  parts.push(wrap(q.prompt));
  const options = renderOptionsBlock(q);
  if (options) parts.push(options);
  parts.push("");
  parts.push("........................................ think, then check ........................................");
  parts.push("");
  parts.push("ANSWER:");
  parts.push(renderAnswer(q));
  return parts.join("\n");
}

const DIVIDER = "=".repeat(100);
const RULE = "-".repeat(100);

export function renderPaper(paper: ExamPaperSeed, counter: { n: number }): string {
  const lines: string[] = [];
  lines.push(RULE);
  lines.push(`WEEK ${paper.week} -- ${paper.title}`);
  lines.push(wrap(paper.topics));
  lines.push(RULE);
  lines.push("");
  for (const q of paper.questions) {
    lines.push(renderQuestion(q, counter.n));
    lines.push("");
    counter.n++;
  }
  return lines.join("\n");
}

export function renderSubjectScript(courseName: string, courseCode: string, papersByWeek: ExamPaperSeed[][]): string {
  const totalQuestions = papersByWeek.flat().reduce((sum, p) => sum + p.questions.length, 0);
  const header = [
    DIVIDER,
    `${courseCode} -- ${courseName}`,
    "MEMORISATION Q&A DRILL SCRIPT -- WEEKS 1-8",
    `${totalQuestions} questions. Read each Q aloud, say your answer out loud, then check against the ANSWER block.`,
    DIVIDER,
    "",
  ].join("\n");

  const counter = { n: 1 };
  const body = papersByWeek
    .flat()
    .map((paper) => renderPaper(paper, counter))
    .join("\n");

  return `${header}\n${body}`;
}
