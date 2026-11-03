import React from "react";

const EXCALIDRAW_URL = "https://excalidraw.com";

export function DrawingLink() {
  return (
    <a className="exam-diagram-link" href={EXCALIDRAW_URL} target="_blank" rel="noreferrer">
      Open Excalidraw to sketch this ↗
    </a>
  );
}

function looksLikeCode(block: string): boolean {
  const lines = block.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return false;
  const codeLine = /^\s*(?:def\s+\w+|class\s+\w+|from\s+\S+\s+import\s+|import\s+\S+|return\s+\S|try:|except\b|finally:|if\s+.+:|for\s+.+:|while\s+.+:|(?:const|let|var|function|async\s+function)\b|[_A-Za-z$][\w.$]*\s*=\s*(?!=)\s*\S)/;
  return lines.filter((line) => codeLine.test(line)).length >= 2 || (/\{[\s\S]*\}/.test(block) && /[;=]/.test(block));
}

function TextBlocks({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n+/).filter((block) => block.trim());
  const rendered: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (looksLikeCode(block)) {
      rendered.push(<pre key={`code-${i}`} className="exam-code-block">{block}</pre>);
      continue;
    }

    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const isBulletBlock = lines.length > 0 && lines.every((line) => /^([•*-])\s+/.test(line));
    if (isBulletBlock) {
      const items = lines.map((line) => line.replace(/^([•*-])\s+/, ""));
      rendered.push(
        <ul key={`list-${i}`} className="exam-answer-list">
          {items.map((item, j) => <li key={j}>{item}</li>)}
        </ul>,
      );
      continue;
    }

    rendered.push(
      <p key={`text-${i}`} className={className}>
        {lines.join(" ").replace(/\s+/g, " ")}
      </p>,
    );
  }

  return <>{rendered}</>;
}

export function PromptText({ text, className }: { text: string; className?: string }) {
  return <TextBlocks text={text} className={className} />;
}

function answerParts(text: string): { letter: string; text: string }[] {
  const markers = [...text.matchAll(/^\s*\(([a-d])\)\s*(?:Full mark answer\s*:?\s*)?|^\s*([a-d])\)\s*(?:Full mark answer\s*:?\s*)?/gm)];
  if (markers.length < 2) return [];
  return markers.map((marker, index) => {
    const start = marker.index! + marker[0].length;
    const end = markers[index + 1]?.index ?? text.length;
    return { letter: marker[1] ?? marker[2], text: text.slice(start, end).trim() };
  });
}

type PartDetail = { letter: string; question: string; marks: number | null; markLabel: string };

function partDetails(prompt: string): Map<string, PartDetail> {
  const markers = [...prompt.matchAll(/^\s*(?:\d+\s*)?\(?([a-d])\)?[.)]?[ \t]+(?=[A-Z])/gm)];
  const result = new Map<string, PartDetail>();
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index! + markers[i][0].length;
    const end = markers[i + 1]?.index ?? prompt.length;
    const segment = prompt.slice(start, end).replace(/\s+/g, " ").trim();
    const mark = segment.match(/[\[(](\d+(?:\.\d+)?)\s*(marks?|points?)[\])]/i)
      ?? segment.match(/\b(\d+(?:\.\d+)?)\s+(marks?|points?)\b/i);
    const question = segment
      .replace(/[\[(]\d+(?:\.\d+)?\s*(?:marks?|points?)[\])]/ig, "")
      .replace(/\b\d+(?:\.\d+)?\s+(?:marks?|points?)\b/ig, "")
      .replace(/\s+/g, " ").trim();
    const value = mark ? Number(mark[1]) : null;
    result.set(markers[i][1], {
      letter: markers[i][1],
      question,
      marks: value,
      markLabel: mark ? `${mark[1]} ${mark[2].toLowerCase()}` : "",
    });
  }
  return result;
}

function answerPoints(text: string, totalMarks: number | null): { text: string; marks: number | null }[] {
  const clean = text
    .replace(/^\s*Full mark answer\s*:?\s*/i, "")
    .replace(/^\s*\[[^\]]+\]\s*/, "")
    .trim();
  const blocks = clean.split(/\n\s*\n+/).map((block) => block.trim()).filter(Boolean);
  const items: string[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.every((line) => /^([•*-])\s+/.test(line))) {
      items.push(...lines.map((line) => line.replace(/^([•*-])\s+/, "").replace(/^\[\d+(?:\.\d+)?\s*marks?\]\s*/i, "")));
      continue;
    }
    const prose = lines.join(" ").replace(/\s+/g, " ");
    // Explanatory analogies and closing repetitions are pleasant for oral answers,
    // but the rubric here should show the examinable claims directly.
    const useful = prose
      .replace(/^(?:Think of|Picture|Imagine|It(?:'s| is) like)\b[^.!?]*[.!?]\s*/i, "")
      .replace(/\s*So the answer is:?[\s\S]*$/i, "")
      .trim();
    if (!useful) continue;
    const sentences = useful.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map((x) => x.trim()).filter(Boolean);
    for (const sentence of sentences) {
      const clauses = sentence.split(/;\s+(?=[A-Z0-9])/).map((x) => x.trim()).filter(Boolean);
      items.push(...clauses);
    }
  }
  if (!items.length) return [{ text: clean, marks: totalMarks }];
  if (totalMarks === null) return items.map((item) => ({ text: item, marks: null }));

  const groupCount = Math.min(items.length, Math.max(1, Math.ceil(totalMarks)));
  const groups: string[][] = Array.from({ length: groupCount }, () => []);
  items.forEach((item, index) => groups[Math.min(groupCount - 1, Math.floor(index * groupCount / items.length))].push(item));
  const isWholeTotal = Number.isInteger(totalMarks);
  let remaining = totalMarks;
  return groups.map((group, index) => {
    let value: number;
    if (isWholeTotal && totalMarks % groupCount !== 0) {
      const base = Math.floor(totalMarks / groupCount);
      const remainder = totalMarks % groupCount;
      value = base + (index < remainder ? 1 : 0);
    } else {
      value = index === groups.length - 1 ? Number(remaining.toFixed(2)) : Number((totalMarks / groupCount).toFixed(2));
    }
    remaining -= value;
    return { text: group.join(" "), marks: value };
  });
}

export function ModelAnswerText({ text, prompt }: { text: string; prompt: string }) {
  const parts = answerParts(text);
  const details = partDetails(prompt);
  const sections = parts.length ? parts : [{ letter: "", text: text.trim().replace(/^Full mark answer\s*:?\s*/i, "") }];

  return (
    <div className="exam-answer-parts">
      {sections.map((part, index) => {
        const detail = details.get(part.letter);
        const points = answerPoints(part.text, detail?.marks ?? null);
        return (
          <section className="exam-answer-part" key={`${part.letter}-${index}`}>
            <h4>
              <span>{detail?.question ? `${part.letter}. ${detail.question}` : part.letter ? `${part.letter}. Full mark answer` : "Full mark answer"}</span>
              {detail?.markLabel && <span className="exam-mark-badge">{detail.markLabel} total</span>}
            </h4>
            <ul className="exam-rubric-list">
              {points.map((point, pointIndex) => (
                <li key={pointIndex}>
                  {point.marks !== null && <strong className="exam-rubric-mark">[{point.marks} {point.marks === 1 ? "mark" : "marks"}]</strong>}
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
