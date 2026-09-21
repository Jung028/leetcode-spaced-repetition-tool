import React, { useState } from "react";
import type { ExamQuestionView } from "./api";
import type { ExamReadingSeed } from "../exam-content/types";
import { MermaidDiagram } from "./MermaidDiagram";
import { PromptText, DrawingLink } from "./shared-ui";
import { isBlankCorrect, isFillBlankCorrect, isMatchCorrect, isOrderCorrect, isSortCorrect } from "./grading";
import { seedFor, shuffledNotIdentity, matchChoiceOrder, moveItem, parseNumberArray, parseStringArray } from "./formats";

// Grades the question and persists the student's answer. App.tsx supplies the
// real implementation (api.grade + error handling); components stay API-free.
export type GradeFn = (correct: boolean, yourAnswer: string) => Promise<void>;

interface FormatProps {
  question: ExamQuestionView;
  course: string;
  week: number;
  paperNumber: number;
  onGrade: GradeFn;
}

// `lead` replaces the default prompt paragraph (fill-in-the-blank renders its
// prompt inline with the inputs). Order is always prompt -> image -> diagram -> body.
function QuestionShell({ question, lead, children }: { question: ExamQuestionView; lead?: React.ReactNode; children: React.ReactNode }) {
  const graded = question.correct !== null;
  return (
    <div className="exam-question">
      {lead ?? <PromptText text={question.prompt} className="exam-prompt" />}
      {question.promptImage && <img className="exam-prompt-image" src={question.promptImage} alt="Question reference" />}
      {question.promptDiagram && <MermaidDiagram chart={question.promptDiagram} />}
      {children}
      {graded && <PromptText text={question.modelAnswer} className="exam-explanation" />}
      {graded && question.answerDiagram && <MermaidDiagram chart={question.answerDiagram} />}
      {graded && question.requiresDrawing && <DrawingLink />}
    </div>
  );
}

const rowClass = (graded: boolean, ok: boolean) =>
  !graded ? "exam-format-row" : ok ? "exam-format-row exam-option-correct" : "exam-format-row exam-option-wrong";

// ---------- fill in the blank ----------
export function FillBlankQuestion({ question, onGrade }: FormatProps) {
  const blanks = question.blanks ?? [];
  const graded = question.correct !== null;
  const saved = parseStringArray(question.yourAnswer);
  const [typed, setTyped] = useState<string[]>(() => blanks.map((_, i) => saved?.[i] ?? ""));
  const shown = graded ? (saved ?? typed) : typed;

  const check = () => onGrade(isFillBlankCorrect(typed, blanks), JSON.stringify(typed));
  // The reveal is fair to good answers worded differently: after a wrong grade the
  // student can overrule it. gradeExamAnswer upserts, so this is just a second grade.
  const overrule = () => onGrade(true, JSON.stringify(shown));

  const parts = question.prompt.split("___");
  const blankClass = (i: number) => {
    if (!graded) return "exam-blank-input";
    const ok = question.correct === 1 || isBlankCorrect(shown[i] ?? "", blanks[i] ?? []);
    return `exam-blank-input ${ok ? "exam-blank-correct" : "exam-blank-wrong"}`;
  };
  const lead = (
    <p className="exam-prompt exam-fill-line">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < blanks.length && (
            <input
              className={blankClass(i)}
              type="text"
              aria-label={`Blank ${i + 1}`}
              value={shown[i] ?? ""}
              disabled={graded}
              onChange={(e) => setTyped((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
            />
          )}
        </React.Fragment>
      ))}
    </p>
  );
  return (
    <QuestionShell question={question} lead={lead}>
      {graded && question.correct === 0 && (
        <div className="exam-format-reveal">
          <p className="exam-multi-hint">Accepted: {blanks.map((b) => b.join(" / ")).join("  ·  ")}</p>
          <button className="btn" onClick={overrule}>Mark me correct</button>
        </div>
      )}
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" disabled={typed.every((t) => t.trim() === "")} onClick={check}>
            Check answer
          </button>
        </div>
      )}
    </QuestionShell>
  );
}

// ---------- match pairs ----------
export function MatchQuestion({ question, course, week, paperNumber, onGrade }: FormatProps) {
  const pairs = question.pairs ?? [];
  const decoys = question.decoys ?? [];
  const rights = [...pairs.map((p) => p.right), ...decoys];
  const graded = question.correct !== null;
  const saved = parseNumberArray(question.yourAnswer);
  const order = matchChoiceOrder(pairs.length, decoys.length, seedFor(course, week, paperNumber, question.index));
  const [chosen, setChosen] = useState<(number | null)[]>(() => pairs.map((_, i) => saved?.[i] ?? null));
  const shown = graded && saved ? saved : chosen;
  const complete = chosen.every((c) => c !== null);

  const check = () => onGrade(isMatchCorrect(chosen as number[], pairs.length), JSON.stringify(chosen));

  return (
    <QuestionShell question={question}>
      <div className="exam-options">
        {pairs.map((p, i) => (
          <label key={i} className={rowClass(graded, shown[i] === i)}>
            <span className="exam-format-left">{p.left}</span>
            <select
              value={shown[i] ?? ""}
              disabled={graded}
              onChange={(e) =>
                setChosen((prev) => prev.map((v, j) => (j === i ? (e.target.value === "" ? null : Number(e.target.value)) : v)))
              }
            >
              <option value="">Choose…</option>
              {order.map((ri) => (
                <option key={ri} value={ri}>{rights[ri]}</option>
              ))}
            </select>
            {graded && shown[i] !== i && <span className="exam-multi-hint">→ {p.right}</span>}
          </label>
        ))}
      </div>
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" disabled={!complete} onClick={check}>Check answer</button>
        </div>
      )}
    </QuestionShell>
  );
}

// ---------- put in order ----------
export function OrderQuestion({ question, course, week, paperNumber, onGrade }: FormatProps) {
  const steps = question.steps ?? [];
  const graded = question.correct !== null;
  const saved = parseNumberArray(question.yourAnswer);
  const [arr, setArr] = useState<number[]>(() => saved ?? shuffledNotIdentity(steps.length, seedFor(course, week, paperNumber, question.index)));
  const shown = graded && saved ? saved : arr;

  const check = () => onGrade(isOrderCorrect(arr, steps.length), JSON.stringify(arr));

  return (
    <QuestionShell question={question}>
      <p className="exam-multi-hint">Put these in the right order using the arrows.</p>
      <div className="exam-options">
        {shown.map((stepIdx, pos) => (
          <div key={stepIdx} className={rowClass(graded, stepIdx === pos)}>
            <span className="exam-format-left">{pos + 1}. {steps[stepIdx]}</span>
            {!graded && (
              <span className="exam-order-controls">
                <button className="btn" aria-label="Move up" disabled={pos === 0} onClick={() => setArr(moveItem(arr, pos, -1))}>↑</button>
                <button className="btn" aria-label="Move down" disabled={pos === shown.length - 1} onClick={() => setArr(moveItem(arr, pos, 1))}>↓</button>
              </span>
            )}
          </div>
        ))}
      </div>
      {graded && question.correct === 0 && (
        <p className="exam-multi-hint">Correct order: {steps.map((s, i) => `${i + 1}. ${s}`).join("  →  ")}</p>
      )}
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" onClick={check}>Check answer</button>
        </div>
      )}
    </QuestionShell>
  );
}

// ---------- sort into groups ----------
export function SortQuestion({ question, onGrade }: FormatProps) {
  const groups = question.groups ?? [];
  const items = question.items ?? [];
  const correct = items.map((it) => it.group);
  const graded = question.correct !== null;
  const saved = parseNumberArray(question.yourAnswer);
  const [chosen, setChosen] = useState<(number | null)[]>(() => items.map((_, i) => saved?.[i] ?? null));
  const shown = graded && saved ? saved : chosen;
  const complete = chosen.every((c) => c !== null);

  const check = () => onGrade(isSortCorrect(chosen as number[], correct), JSON.stringify(chosen));

  return (
    <QuestionShell question={question}>
      <div className="exam-options">
        {items.map((it, i) => (
          <div key={i} className={rowClass(graded, shown[i] === it.group)}>
            <span className="exam-format-left">{it.text}</span>
            <span className="exam-order-controls">
              {groups.map((g, gi) => (
                <button
                  key={gi}
                  className={shown[i] === gi ? "btn btn-primary" : "btn"}
                  disabled={graded}
                  aria-pressed={shown[i] === gi}
                  onClick={() => setChosen((prev) => prev.map((v, j) => (j === i ? gi : v)))}
                >
                  {g}
                </button>
              ))}
            </span>
            {graded && shown[i] !== it.group && <span className="exam-multi-hint">→ {groups[it.group]}</span>}
          </div>
        ))}
      </div>
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" disabled={!complete} onClick={check}>Check answer</button>
        </div>
      )}
    </QuestionShell>
  );
}

// ---------- reading card ----------
export function ReadingCard({ reading, onContinue }: { reading: ExamReadingSeed; onContinue?: () => void }) {
  return (
    <section className="exam-reading">
      <h3 className="exam-reading-title">{reading.title}</h3>
      <PromptText text={reading.body} className="exam-reading-body" />
      {reading.diagram && <MermaidDiagram chart={reading.diagram} />}
      {onContinue && (
        <div className="btn-row">
          <button className="btn btn-primary" onClick={onContinue}>Continue</button>
        </div>
      )}
    </section>
  );
}
