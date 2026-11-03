import React, { useMemo, useState } from "react";
import { buildExamSchedule, listExamCourses, examWeekLabel, type ExamPaper } from "../exam/content";
import { PromptText, ModelAnswerText, DrawingLink } from "../exam/shared-ui";
import { MermaidDiagram } from "../exam/MermaidDiagram";
import { FillBlankQuestion, MatchQuestion, OrderQuestion, SortQuestion, ReadingCard, type GradeFn } from "../exam/FormatQuestions";
import { isMultiCorrect } from "../exam/grading";
import type { ExamQuestionSeed, ExamQuestionType } from "../exam-content/types";
import type { ExamQuestionView } from "../exam/api";

// A read-only, no-backend clone of the real exam app's question flow, for the
// GitHub Pages mirror: no login, no database, nothing saved between visits.
// Every answer is self-graded in memory only (see LocalAnswer below), reusing
// the real app's own pure grading/format components so the two never drift
// in how a question is marked.

type LocalAnswer = { yourAnswer: string; correct: number | null };

function toView(q: ExamQuestionSeed, index: number, answer: LocalAnswer | undefined): ExamQuestionView {
  return {
    index,
    type: q.type,
    prompt: q.prompt,
    options: q.options ?? null,
    correctIndex: q.correctIndex ?? null,
    correctIndices: q.correctIndices ?? null,
    modelAnswer: q.modelAnswer,
    promptImage: q.promptImage ?? null,
    promptDiagram: q.promptDiagram ?? null,
    answerDiagram: q.answerDiagram ?? null,
    requiresDrawing: q.requiresDrawing ?? false,
    blanks: q.blanks ?? null,
    pairs: q.pairs ?? null,
    decoys: q.decoys ?? null,
    steps: q.steps ?? null,
    groups: q.groups ?? null,
    items: q.items ?? null,
    yourAnswer: answer?.yourAnswer ?? "",
    correct: answer?.correct ?? null,
  };
}

const NEW_FORMATS = { fillblank: FillBlankQuestion, match: MatchQuestion, order: OrderQuestion, sort: SortQuestion } as const;
const isNewFormat = (t: ExamQuestionType): t is keyof typeof NEW_FORMATS => Object.hasOwn(NEW_FORMATS, t);

function LocalMcqQuestion({ question, onGraded }: { question: ExamQuestionView; onGraded: (correct: boolean, yourAnswer: string) => void }) {
  const graded = question.correct !== null;
  return (
    <div className="exam-question">
      <PromptText text={question.prompt} className="exam-prompt" />
      {question.promptImage && <img className="exam-prompt-image" src={question.promptImage} alt="Question reference" />}
      {question.promptDiagram && <MermaidDiagram chart={question.promptDiagram} />}
      <div className="exam-options">
        {question.options!.map((opt, i) => {
          const isChosen = question.yourAnswer === String(i);
          const cls = !graded
            ? "exam-option"
            : i === question.correctIndex
              ? "exam-option exam-option-correct"
              : isChosen
                ? "exam-option exam-option-wrong"
                : "exam-option";
          return (
            <label key={i} className={cls}>
              <input
                type="radio"
                name={`q-${question.index}`}
                checked={isChosen}
                disabled={graded}
                onChange={() => !graded && onGraded(i === question.correctIndex, String(i))}
              />
              {opt}
            </label>
          );
        })}
      </div>
      {graded && <PromptText text={question.modelAnswer} className="exam-explanation" />}
      {graded && question.answerDiagram && <MermaidDiagram chart={question.answerDiagram} />}
      {graded && question.requiresDrawing && <DrawingLink />}
    </div>
  );
}

function LocalMultiQuestion({ question, onGraded }: { question: ExamQuestionView; onGraded: (correct: boolean, yourAnswer: string) => void }) {
  const graded = question.correct !== null;
  const correctSet = new Set(question.correctIndices ?? []);
  const savedPicks: number[] = (() => {
    try {
      const parsed = JSON.parse(question.yourAnswer || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const [picks, setPicks] = useState<Set<number>>(new Set(savedPicks));

  const toggle = (i: number) => {
    if (graded) return;
    setPicks((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const check = () => {
    const chosen = [...picks].sort((a, b) => a - b);
    onGraded(isMultiCorrect(chosen, question.correctIndices ?? []), JSON.stringify(chosen));
  };

  return (
    <div className="exam-question">
      <PromptText text={question.prompt} className="exam-prompt" />
      {question.promptImage && <img className="exam-prompt-image" src={question.promptImage} alt="Question reference" />}
      {question.promptDiagram && <MermaidDiagram chart={question.promptDiagram} />}
      <p className="exam-multi-hint">Select all that apply.</p>
      <div className="exam-options">
        {question.options!.map((opt, i) => {
          const isChosen = graded ? savedPicks.includes(i) : picks.has(i);
          const cls = !graded
            ? "exam-option"
            : correctSet.has(i)
              ? "exam-option exam-option-correct"
              : isChosen
                ? "exam-option exam-option-wrong"
                : "exam-option";
          return (
            <label key={i} className={cls}>
              <input type="checkbox" checked={isChosen} disabled={graded} onChange={() => toggle(i)} />
              {opt}
            </label>
          );
        })}
      </div>
      {!graded && (
        <div className="btn-row">
          <button className="btn btn-primary" disabled={picks.size === 0} onClick={check}>
            Check answer
          </button>
        </div>
      )}
      {graded && <PromptText text={question.modelAnswer} className="exam-explanation" />}
      {graded && question.answerDiagram && <MermaidDiagram chart={question.answerDiagram} />}
      {graded && question.requiresDrawing && <DrawingLink />}
    </div>
  );
}

function LocalShortOrScenarioQuestion({ question, onGraded }: { question: ExamQuestionView; onGraded: (correct: boolean, yourAnswer: string) => void }) {
  const [draft, setDraft] = useState(question.yourAnswer);
  const [revealed, setRevealed] = useState(question.correct !== null);
  const graded = question.correct !== null;

  return (
    <div className="exam-question">
      <PromptText text={question.prompt} className="exam-prompt" />
      {question.promptImage && <img className="exam-prompt-image" src={question.promptImage} alt="Question reference" />}
      {question.promptDiagram && <MermaidDiagram chart={question.promptDiagram} />}
      <textarea
        className="theory-answer"
        rows={4}
        value={draft}
        disabled={graded}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write your own answer, then reveal the model answer..."
      />
      {!graded && (
        <div className="btn-row">
          <button className="btn" onClick={() => setRevealed(true)}>Save answer</button>
        </div>
      )}
      {revealed && (
        <div className="theory-model-answer">
          <h3>Model answer</h3>
          <ModelAnswerText text={question.modelAnswer} prompt={question.prompt} />
          {question.answerDiagram && <MermaidDiagram chart={question.answerDiagram} />}
          {question.requiresDrawing && <DrawingLink />}
        </div>
      )}
      {!graded && revealed && (
        <div className="btn-row">
          <button className="btn btn-pass" onClick={() => onGraded(true, draft)}>Correct</button>
          <button className="btn btn-fail" onClick={() => onGraded(false, draft)}>Wrong</button>
        </div>
      )}
    </div>
  );
}

function PaperView({ paper, onBack }: { paper: ExamPaper; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, LocalAnswer>>(new Map());
  const [seenCards, setSeenCards] = useState<Set<number>>(new Set());
  const [showFormulas, setShowFormulas] = useState(false);

  const readings = paper.readings ?? [];
  const total = paper.questions.length;
  const gradedCount = [...answers.values()].filter((a) => a.correct !== null).length;
  const correctCount = [...answers.values()].filter((a) => a.correct === 1).length;

  const grade = (i: number) => (correct: boolean, yourAnswer: string) => {
    setAnswers((prev) => new Map(prev).set(i, { yourAnswer, correct: correct ? 1 : 0 }));
  };

  const pendingCardIndex = readings.findIndex((r) => r.beforeQuestion === index && !seenCards.has(r.beforeQuestion));
  const showingCard = pendingCardIndex !== -1;

  const questionSeed = paper.questions[index]!;
  const question = toView(questionSeed, index, answers.get(index));

  return (
    <article className="detail exam-focus">
      <header className="detail-head">
        <h2>{paper.title}</h2>
        <span className="lang-tag">
          Question {index + 1} of {total} — {gradedCount} answered, {correctCount} correct
        </span>
      </header>
      {paper.formulas && paper.formulas.length > 0 && (
        <div className="exam-formulas">
          <button type="button" className="btn" aria-expanded={showFormulas} onClick={() => setShowFormulas((v) => !v)}>
            {showFormulas ? "Hide formula sheet" : "Show formula sheet"}
          </button>
          {showFormulas && (
            <dl className="exam-formulas-list">
              {paper.formulas.map((f) => (
                <React.Fragment key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.formula}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}
        </div>
      )}
      <div className="exam-progress-bar">
        <div className="exam-progress-fill" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      {showingCard ? (
        <ReadingCard
          reading={readings[pendingCardIndex]!}
          onContinue={() => setSeenCards((prev) => new Set(prev).add(readings[pendingCardIndex]!.beforeQuestion))}
        />
      ) : isNewFormat(question.type) ? (
        (() => {
          const Component = NEW_FORMATS[question.type];
          return (
            <Component
              key={`${index}-${question.correct}`}
              question={question}
              course={paper.course}
              week={paper.week}
              paperNumber={paper.paperNumber}
              onGrade={grade(index) as GradeFn}
              reviewing={false}
            />
          );
        })()
      ) : question.type === "mcq" || question.type === "truefalse" ? (
        <LocalMcqQuestion key={`${index}-${question.correct}`} question={question} onGraded={grade(index)} />
      ) : question.type === "multi" ? (
        <LocalMultiQuestion key={`${index}-${question.correct}`} question={question} onGraded={grade(index)} />
      ) : (
        <LocalShortOrScenarioQuestion key={`${index}-${question.correct}`} question={question} onGraded={grade(index)} />
      )}
      <div className="btn-row">
        <button className="btn" onClick={onBack}>Back to papers</button>
        <button className="btn" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
          ← Previous
        </button>
        <button
          className="btn btn-primary"
          disabled={showingCard || index === total - 1}
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
        >
          Next →
        </button>
      </div>
    </article>
  );
}

function CourseView({ course, name, onBack, onOpenPaper }: { course: string; name: string; onBack: () => void; onOpenPaper: (paper: ExamPaper) => void }) {
  const papers = useMemo(
    () =>
      buildExamSchedule()
        .filter((p) => p.course === course)
        .sort((a, b) => (a.week - b.week) || (a.paperNumber - b.paperNumber)),
    [course],
  );
  const byWeek = useMemo(() => {
    const map = new Map<number, ExamPaper[]>();
    for (const p of papers) {
      if (!map.has(p.week)) map.set(p.week, []);
      map.get(p.week)!.push(p);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [papers]);

  return (
    <section>
      <div className="btn-row">
        <button className="btn" onClick={onBack}>← All courses</button>
      </div>
      <h2>{name}</h2>
      {byWeek.map(([week, weekPapers]) => (
        <div key={week} className="exam-week-group">
          <h3>{examWeekLabel(course, week)}</h3>
          <ul className="card-grid">
            {weekPapers.map((p) => (
              <li key={p.paperNumber}>
                <button className="card card-click" onClick={() => onOpenPaper(p)}>
                  <span className="card-title">{p.title}</span>
                  <span className="card-meta">{p.questions.length} questions</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default function App() {
  const courses = useMemo(() => listExamCourses(), []);
  const [course, setCourse] = useState<string | null>(null);
  const [paper, setPaper] = useState<ExamPaper | null>(null);

  if (paper) {
    return (
      <main className="exam-static-app">
        <PaperView paper={paper} onBack={() => setPaper(null)} />
      </main>
    );
  }

  if (course) {
    const name = courses.find((c) => c.code === course)?.name ?? course;
    return (
      <main className="exam-static-app">
        <CourseView course={course} name={name} onBack={() => setCourse(null)} onOpenPaper={setPaper} />
      </main>
    );
  }

  return (
    <main className="exam-static-app">
      <header className="exam-static-header">
        <h1>Exam Practice</h1>
        <p className="card-meta">
          Read-only mirror for your phone — answers are checked instantly but nothing is saved between visits.
        </p>
      </header>
      <ul className="card-grid">
        {courses.map((c) => (
          <li key={c.code}>
            <button className="card card-click" onClick={() => setCourse(c.code)}>
              <span className="card-title">{c.name}</span>
              <span className="card-meta">{c.code}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
