import React, { useEffect, useState } from "react";
import { EXAM_REVIEW_LADDER } from "./exam-scheduling";
import { localToday } from "./scheduling";
import type { ExamPaperView, ExamQuestionView, ExamReviewView } from "./exam-api";

interface Stats {
  dueCount: number;
  overdueCount: number;
  completedToday: number;
}

type Result = "correct" | "wrong";
type View = { name: "board" } | { name: "paper" } | { name: "review"; item: ExamReviewView };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : "Something went wrong.");

const api = {
  due: () =>
    fetch("/api/exam/due").then((r) =>
      json<{ paper: ExamPaperView | null; reviewDue: ExamReviewView[]; stats: Stats }>(r),
    ),
  completedToday: () => fetch("/api/exam/completed-today").then((r) => json<{ papers: ExamPaperView[] }>(r)),
  saveAnswer: (paperDay: number, questionIndex: number, yourAnswer: string) =>
    fetch(`/api/exam/${paperDay}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex, yourAnswer }),
    }).then((r) => json<ExamPaperView>(r)),
  grade: (paperDay: number, questionIndex: number, correct: boolean, yourAnswer?: string) =>
    fetch(`/api/exam/${paperDay}/${questionIndex}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct, ...(yourAnswer !== undefined ? { yourAnswer } : {}) }),
    }).then((r) => json<ExamPaperView>(r)),
  submit: (paperDay: number) =>
    fetch(`/api/exam/${paperDay}/submit`, { method: "POST" }).then((r) =>
      json<{ scoreCorrect: number; scoreTotal: number }>(r),
    ),
  reviewItem: (paperDay: number, questionIndex: number, result: Result) =>
    fetch(`/api/exam/review/${paperDay}/${questionIndex}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }).then((r) => json<any>(r)),
};

function ExamStats({ stats, onOpenCompleted }: { stats: Stats; onOpenCompleted: () => void }) {
  return (
    <div className="stats stats-3">
      <div className="stat stat-due">
        <span className="stat-num">{stats.dueCount}</span>
        <span className="stat-label">Due today</span>
      </div>
      <div className="stat stat-overdue">
        <span className="stat-num">{stats.overdueCount}</span>
        <span className="stat-label">Overdue</span>
      </div>
      <button className="stat stat-completed" onClick={onOpenCompleted}>
        <span className="stat-num">{stats.completedToday}</span>
        <span className="stat-label">Completed today</span>
      </button>
    </div>
  );
}

function McqQuestion({
  question,
  paperDay,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  paperDay: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const graded = question.correct !== null;

  const choose = async (i: number) => {
    if (graded) return;
    onError(null);
    try {
      const updated = await api.grade(paperDay, question.index, i === question.correctIndex, String(i));
      onGraded(updated);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <div className="exam-question">
      <p className="exam-prompt">{question.prompt}</p>
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
                onChange={() => choose(i)}
              />
              {opt}
            </label>
          );
        })}
      </div>
      {graded && <p className="exam-explanation">{question.modelAnswer}</p>}
    </div>
  );
}

function ShortOrScenarioQuestion({
  question,
  paperDay,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  paperDay: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState(question.yourAnswer);
  const [revealed, setRevealed] = useState(question.correct !== null);
  const graded = question.correct !== null;

  const saveAndReveal = async () => {
    onError(null);
    try {
      await api.saveAnswer(paperDay, question.index, draft);
      setRevealed(true);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const grade = async (correct: boolean) => {
    onError(null);
    try {
      const updated = await api.grade(paperDay, question.index, correct);
      onGraded(updated);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <div className="exam-question">
      <p className="exam-prompt">{question.prompt}</p>
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
          <button className="btn" onClick={saveAndReveal}>Save answer</button>
        </div>
      )}
      {revealed && (
        <div className="theory-model-answer">
          <h3>Model answer</h3>
          <p>{question.modelAnswer}</p>
        </div>
      )}
      {!graded && revealed && (
        <div className="btn-row">
          <button className="btn btn-pass" onClick={() => grade(true)}>Correct</button>
          <button className="btn btn-fail" onClick={() => grade(false)}>Wrong</button>
        </div>
      )}
    </div>
  );
}

function PaperView({
  paper,
  onBack,
  onChanged,
  onError,
}: {
  paper: ExamPaperView;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [current, setCurrent] = useState(paper);
  const allGraded = current.questions.every((q) => q.correct !== null);

  const submit = async () => {
    onError(null);
    try {
      await api.submit(paper.paperDay);
      onChanged();
      onBack();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <article className="detail">
      <header className="detail-head">
        <h2>{current.title}</h2>
        <span className="tag">{current.questions.length} questions</span>
      </header>
      {current.questions.map((q) =>
        q.type === "mcq" || q.type === "truefalse" ? (
          <McqQuestion key={q.index} question={q} paperDay={paper.paperDay} onGraded={setCurrent} onError={onError} />
        ) : (
          <ShortOrScenarioQuestion
            key={q.index}
            question={q}
            paperDay={paper.paperDay}
            onGraded={setCurrent}
            onError={onError}
          />
        ),
      )}
      <div className="btn-row">
        <button className="btn btn-primary" disabled={!allGraded} onClick={submit}>
          Submit paper
        </button>
        <button className="btn" onClick={onBack}>Back</button>
      </div>
      {!allGraded && (
        <p className="board-empty">
          Grade every question — multiple choice grades itself on selection; reveal and mark short/scenario answers — before submitting.
        </p>
      )}
    </article>
  );
}

function ReviewDetail({
  item,
  onBack,
  onChanged,
  onError,
}: {
  item: ExamReviewView;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  const review = async (result: Result) => {
    onError(null);
    try {
      await api.reviewItem(item.paperDay, item.questionIndex, result);
      onChanged();
      onBack();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  return (
    <article className="detail theory-card">
      <header className="detail-head">
        <span className="rung" title={`rung ${item.rung + 1} of ${EXAM_REVIEW_LADDER.length}`}>
          {EXAM_REVIEW_LADDER.map((_, i) => (
            <span key={i} className={i <= item.rung ? "rung-on" : "rung-off"} />
          ))}
        </span>
      </header>
      <h2 className="theory-question">{item.prompt}</h2>
      {item.options && (
        <div className="exam-options">
          {item.options.map((opt, i) => (
            <label
              key={i}
              className={revealed && i === item.correctIndex ? "exam-option exam-option-correct" : "exam-option"}
            >
              {opt}
            </label>
          ))}
        </div>
      )}
      {revealed ? (
        <div className="theory-model-answer">
          <h3>Model answer</h3>
          <p>{item.modelAnswer}</p>
        </div>
      ) : (
        <button className="solution-cover" onClick={() => setRevealed(true)}>
          Model answer hidden — recall it yourself first, then reveal
        </button>
      )}
      <div className="btn-row">
        <button className="btn btn-pass" onClick={() => review("correct")}>Correct</button>
        <button className="btn btn-fail" onClick={() => review("wrong")}>Wrong</button>
        <span className="btn-spacer" />
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </article>
  );
}

export default function ExamApp({
  openPaperDay,
  onOpened,
}: {
  openPaperDay?: number | null;
  onOpened?: () => void;
} = {}) {
  const [view, setView] = useState<View>({ name: "board" });
  const [paper, setPaper] = useState<ExamPaperView | null>(null);
  const [reviewDue, setReviewDue] = useState<ExamReviewView[]>([]);
  const [stats, setStats] = useState<Stats>({ dueCount: 0, overdueCount: 0, completedToday: 0 });
  const [completedPapers, setCompletedPapers] = useState<ExamPaperView[] | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return api
      .due()
      .then(({ paper, reviewDue, stats }) => {
        setPaper(paper);
        setReviewDue(reviewDue);
        setStats(stats);
      })
      .catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  // Today's paper is the only exam deep-link target — a Home-tab review-item
  // click still lands here (same paperDay) but opens the board, since a
  // single missed question doesn't have its own drill-down view outside the
  // review-due list.
  useEffect(() => {
    if (openPaperDay != null) {
      onOpened?.();
    }
  }, [openPaperDay]);

  const openCompleted = () => {
    setShowCompleted(true);
    if (completedPapers === null) {
      api
        .completedToday()
        .then((r) => setCompletedPapers(r.papers))
        .catch((err) => setError(errorMessage(err)));
    }
  };

  return (
    <div className="theory">
      <ExamStats stats={stats} onOpenCompleted={openCompleted} />
      {error && <p className="form-error">{error}</p>}
      <p className="rule-note">
        One new practice paper unlocks per day. Missed questions come back for spaced review: 3 → 5 → 7 → 14 → 30 days.
      </p>

      {showCompleted && (
        <div className="modal-backdrop" onClick={() => setShowCompleted(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Completed today</h2>
              <button className="modal-close" onClick={() => setShowCompleted(false)} aria-label="Close">×</button>
            </div>
            {(completedPapers ?? []).length === 0 ? (
              <p className="board-empty">Nothing completed today yet.</p>
            ) : (
              <ul className="modal-rows">
                {(completedPapers ?? []).map((p) => (
                  <li key={p.paperDay} className="modal-row">
                    <span className="modal-row-title">{p.title}</span>
                    <span className="tag">{p.scoreCorrect}/{p.scoreTotal}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {view.name === "board" && (
        <>
          <section className="board" aria-label="Today's paper">
            <div className="section-head">
              <h2>Today's paper</h2>
            </div>
            {paper === null ? (
              <p className="board-empty">Nothing due. Tomorrow's paper unlocks then.</p>
            ) : (
              <button className="board-row board-row-main" onClick={() => setView({ name: "paper" })}>
                <span className="tag">due</span>
                <span className="board-title">{paper.title}</span>
                <span className="lang-tag">{paper.questions.length} questions</span>
              </button>
            )}
          </section>

          <section className="board" aria-label="Review due">
            <div className="section-head">
              <h2>Review due</h2>
              <span className="board-count">{reviewDue.length}</span>
            </div>
            {reviewDue.length === 0 ? (
              <p className="board-empty">No missed questions due for review.</p>
            ) : (
              <ul className="board-rows">
                {reviewDue.map((item) => (
                  <li key={`${item.paperDay}-${item.questionIndex}`}>
                    <button className="board-row board-row-main" onClick={() => setView({ name: "review", item })}>
                      <span className="tag">{item.nextReview < localToday() ? "overdue" : "due"}</span>
                      <span className="board-title">{item.prompt}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {view.name === "paper" && paper && (
        <PaperView paper={paper} onBack={() => setView({ name: "board" })} onChanged={refresh} onError={setError} />
      )}

      {view.name === "review" && (
        <ReviewDetail item={view.item} onBack={() => setView({ name: "board" })} onChanged={refresh} onError={setError} />
      )}
    </div>
  );
}
