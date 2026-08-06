import React, { useEffect, useState } from "react";
import { EXAM_REVIEW_LADDER } from "./exam-scheduling";
import { localToday } from "./scheduling";
import type { ExamPaperView, ExamQuestionView, ExamReviewView } from "./exam-api";
import type { ExamWeekView } from "./exam-content";
import { TIMELINE_URL, TIMELINE_ANCHORS } from "./timeline-link";

interface Stats {
  dueCount: number;
  overdueCount: number;
  completedToday: number;
}

interface ExamCourse {
  code: string;
  name: string;
}

type Result = "correct" | "wrong";
type View =
  | { name: "board" }
  | { name: "week"; week: number }
  | { name: "paper"; week: number; paperNumber: number }
  | { name: "review"; item: ExamReviewView };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : "Something went wrong.");

const api = {
  courses: () => fetch("/api/exam/courses").then((r) => json<ExamCourse[]>(r)),
  due: (course: string) =>
    fetch(`/api/exam/${course}/due`).then((r) =>
      json<{ weeksDue: ExamWeekView[]; reviewDue: ExamReviewView[]; stats: Stats }>(r),
    ),
  completedToday: (course: string) =>
    fetch(`/api/exam/${course}/completed-today`).then((r) => json<{ papers: ExamPaperView[] }>(r)),
  paper: (course: string, week: number, paperNumber: number) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}`).then((r) => json<ExamPaperView>(r)),
  saveAnswer: (course: string, week: number, paperNumber: number, questionIndex: number, yourAnswer: string) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex, yourAnswer }),
    }).then((r) => json<ExamPaperView>(r)),
  grade: (
    course: string,
    week: number,
    paperNumber: number,
    questionIndex: number,
    correct: boolean,
    yourAnswer?: string,
  ) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/${questionIndex}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct, ...(yourAnswer !== undefined ? { yourAnswer } : {}) }),
    }).then((r) => json<ExamPaperView>(r)),
  submit: (course: string, week: number, paperNumber: number) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/submit`, { method: "POST" }).then((r) =>
      json<{ scoreCorrect: number; scoreTotal: number }>(r),
    ),
  reviewItem: (course: string, week: number, paperNumber: number, questionIndex: number, result: Result) =>
    fetch(`/api/exam/review/${course}/${week}/${paperNumber}/${questionIndex}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }).then((r) => json<any>(r)),
  sync: () => fetch("/api/exam/sync").then((r) => json<{ pending: { course: string; week: number }[] }>(r)),
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

function SyncBanner({
  pending,
  onDismiss,
}: {
  pending: { course: string; week: number }[];
  onDismiss: () => void;
}) {
  return (
    <div className="board" style={{ marginBottom: "1rem" }}>
      <div className="board-row" style={{ justifyContent: "space-between" }}>
        <span>
          {pending.length === 0
            ? "Everything's generated — nothing pending."
            : `${pending.length} week${pending.length === 1 ? "" : "s"} ready to generate: ${pending
                .map((p) => `${p.course} Week ${p.week}`)
                .join(", ")} — ask Claude Code to fill these in.`}
        </span>
        <button className="modal-close" onClick={onDismiss} aria-label="Dismiss">×</button>
      </div>
    </div>
  );
}

function CourseSelector({
  courses,
  selected,
  onSelect,
}: {
  courses: ExamCourse[];
  selected: string;
  onSelect: (code: string) => void;
}) {
  return (
    <nav className="tabs" aria-label="Courses" style={{ marginBottom: "1rem" }}>
      {courses.map((c) => (
        <button key={c.code} className={c.code === selected ? "tab tab-active" : "tab"} onClick={() => onSelect(c.code)}>
          {c.name}
        </button>
      ))}
    </nav>
  );
}

function McqQuestion({
  question,
  course,
  week,
  paperNumber,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  course: string;
  week: number;
  paperNumber: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const graded = question.correct !== null;

  const choose = async (i: number) => {
    if (graded) return;
    onError(null);
    try {
      const updated = await api.grade(course, week, paperNumber, question.index, i === question.correctIndex, String(i));
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
  course,
  week,
  paperNumber,
  onGraded,
  onError,
}: {
  question: ExamQuestionView;
  course: string;
  week: number;
  paperNumber: number;
  onGraded: (updated: ExamPaperView) => void;
  onError: (message: string | null) => void;
}) {
  const [draft, setDraft] = useState(question.yourAnswer);
  const [revealed, setRevealed] = useState(question.correct !== null);
  const graded = question.correct !== null;

  const saveAndReveal = async () => {
    onError(null);
    try {
      await api.saveAnswer(course, week, paperNumber, question.index, draft);
      setRevealed(true);
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const grade = async (correct: boolean) => {
    onError(null);
    try {
      const updated = await api.grade(course, week, paperNumber, question.index, correct);
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
  course,
  onBack,
  onChanged,
  onError,
}: {
  paper: ExamPaperView;
  course: string;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [current, setCurrent] = useState(paper);
  const allGraded = current.questions.every((q) => q.correct !== null);

  const submit = async () => {
    onError(null);
    try {
      await api.submit(course, paper.week, paper.paperNumber);
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
        <span className="lang-tag">Due {current.dueDate}</span>
      </header>
      {current.questions.map((q) =>
        q.type === "mcq" || q.type === "truefalse" ? (
          <McqQuestion
            key={q.index}
            question={q}
            course={course}
            week={paper.week}
            paperNumber={paper.paperNumber}
            onGraded={setCurrent}
            onError={onError}
          />
        ) : (
          <ShortOrScenarioQuestion
            key={q.index}
            question={q}
            course={course}
            week={paper.week}
            paperNumber={paper.paperNumber}
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

// Fetches and shows one paper's full content on demand — the weeksDue
// response only carries per-paper titles/submitted flags for the picker,
// not full question content, so opening a specific paper needs its own load.
function PaperLoader({
  course,
  week,
  paperNumber,
  onBack,
  onChanged,
  onError,
}: {
  course: string;
  week: number;
  paperNumber: number;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [paper, setPaper] = useState<ExamPaperView | null>(null);

  useEffect(() => {
    api
      .paper(course, week, paperNumber)
      .then(setPaper)
      .catch((err) => onError(errorMessage(err)));
  }, [course, week, paperNumber]);

  if (!paper) return <p className="board-empty">Loading…</p>;
  return <PaperView paper={paper} course={course} onBack={onBack} onChanged={onChanged} onError={onError} />;
}

function WeekPicker({
  weekView,
  onBack,
  onPickPaper,
}: {
  weekView: ExamWeekView;
  onBack: () => void;
  onPickPaper: (paperNumber: number) => void;
}) {
  return (
    <article className="detail">
      <header className="detail-head">
        <h2>Week {weekView.week}</h2>
        <span className="tag">{weekView.overdue ? "overdue" : "due"} — {weekView.dueDate}</span>
      </header>
      <ul className="board-rows">
        {weekView.papers.map((p) => (
          <li key={p.paperNumber}>
            {p.submitted ? (
              <div className="board-row board-row-main" style={{ "--urgency": "var(--green)" } as React.CSSProperties}>
                <span className="tag">done</span>
                <span className="board-title">{p.title}</span>
                <span className="lang-tag">{p.scoreCorrect}/{p.scoreTotal}</span>
              </div>
            ) : (
              <button className="board-row board-row-main" onClick={() => onPickPaper(p.paperNumber)}>
                <span className="tag">due</span>
                <span className="board-title">{p.title}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="btn-row">
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </article>
  );
}

function ReviewDetail({
  item,
  course,
  onBack,
  onChanged,
  onError,
}: {
  item: ExamReviewView;
  course: string;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  const review = async (result: Result) => {
    onError(null);
    try {
      await api.reviewItem(course, item.week, item.paperNumber, item.questionIndex, result);
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
  openCourse,
  openWeek,
  onOpened,
}: {
  openCourse?: string | null;
  openWeek?: number | null;
  onOpened?: () => void;
} = {}) {
  const [view, setView] = useState<View>({ name: "board" });
  const [courses, setCourses] = useState<ExamCourse[]>([]);
  const [course, setCourse] = useState<string | null>(null);
  const [weeksDue, setWeeksDue] = useState<ExamWeekView[]>([]);
  const [reviewDue, setReviewDue] = useState<ExamReviewView[]>([]);
  const [stats, setStats] = useState<Stats>({ dueCount: 0, overdueCount: 0, completedToday: 0 });
  const [completedPapers, setCompletedPapers] = useState<ExamPaperView[] | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncPending, setSyncPending] = useState<{ course: string; week: number }[] | null>(null);
  const [syncing, setSyncing] = useState(false);

  const runSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const { pending } = await api.sync();
      setSyncPending(pending);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    api
      .courses()
      .then((list) => {
        setCourses(list);
        if (list.length > 0) setCourse((current) => current ?? list[0]!.code);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const refresh = (activeCourse: string) => {
    setError(null);
    return api
      .due(activeCourse)
      .then(({ weeksDue, reviewDue, stats }) => {
        setWeeksDue(weeksDue);
        setReviewDue(reviewDue);
        setStats(stats);
      })
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(() => {
    if (course) {
      setView({ name: "board" });
      setCompletedPapers(null);
      refresh(course);
    }
  }, [course]);

  // Submitting a week's last remaining paper drops that week out of
  // weeksDue entirely (groupExamPapersByWeek excludes fully-submitted
  // weeks). Without this, staying on { name: "week" } would render nothing
  // — currentWeek's lookup below would come back empty — so snap back to
  // the board once the week view's target no longer has an entry.
  useEffect(() => {
    if (view.name === "week" && !weeksDue.some((w) => w.week === view.week)) {
      setView({ name: "board" });
    }
  }, [weeksDue, view]);

  // A Home-tab click only switches course and returns to the board — it
  // doesn't drill into a specific week, matching how review-item deep links
  // already worked before this plan (no per-item drill-down target).
  useEffect(() => {
    if (openCourse != null || openWeek != null) {
      if (openCourse != null) setCourse(openCourse);
      onOpened?.();
    }
  }, [openCourse, openWeek]);

  const openCompleted = () => {
    setShowCompleted(true);
    if (completedPapers === null && course) {
      api
        .completedToday(course)
        .then((r) => setCompletedPapers(r.papers))
        .catch((err) => setError(errorMessage(err)));
    }
  };

  if (!course) {
    return (
      <div className="theory">
        {error ? <p className="form-error">{error}</p> : <p className="board-empty">Loading…</p>}
      </div>
    );
  }

  const currentWeek = view.name === "week" || view.name === "paper" ? weeksDue.find((w) => w.week === view.week) : undefined;

  return (
    <div className="theory">
      <CourseSelector courses={courses} selected={course} onSelect={setCourse} />
      <div className="btn-row" style={{ marginBottom: "1rem" }}>
        <button className="btn" onClick={runSync} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync"}
        </button>
      </div>
      {syncPending !== null && <SyncBanner pending={syncPending} onDismiss={() => setSyncPending(null)} />}
      <ExamStats stats={stats} onOpenCompleted={openCompleted} />
      {error && <p className="form-error">{error}</p>}
      <p className="rule-note">
        Each week's papers are due by Sunday. Missed questions come back for spaced review: 3 → 5 → 7 → 14 → 30 days.
      </p>
      <div className="detail-meta">
        <a href={`${TIMELINE_URL}#${TIMELINE_ANCHORS[course] ?? ""}`} target="_blank" rel="noopener noreferrer">
          View full semester timeline ↗
        </a>
      </div>

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
                  <li key={`${p.week}-${p.paperNumber}`} className="modal-row">
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
          <section className="board" aria-label="Weeks due">
            <div className="section-head">
              <h2>This week's papers</h2>
            </div>
            {weeksDue.length === 0 ? (
              <p className="board-empty">Nothing due. Next week's papers unlock then.</p>
            ) : (
              <ul className="board-rows">
                {weeksDue.map((w) => {
                  const submittedCount = w.papers.filter((p) => p.submitted).length;
                  return (
                    <li key={w.week}>
                      <button className="board-row board-row-main" onClick={() => setView({ name: "week", week: w.week })}>
                        <span className="tag">{w.overdue ? "overdue" : "due"}</span>
                        <span className="board-title">Week {w.week}</span>
                        <span className="lang-tag">{submittedCount}/{w.papers.length} submitted · due {w.dueDate}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
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
                  <li key={`${item.week}-${item.paperNumber}-${item.questionIndex}`}>
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

      {view.name === "week" && currentWeek && (
        <WeekPicker
          weekView={currentWeek}
          onBack={() => setView({ name: "board" })}
          onPickPaper={(paperNumber) => setView({ name: "paper", week: view.week, paperNumber })}
        />
      )}

      {view.name === "paper" && (
        <PaperLoader
          course={course}
          week={view.week}
          paperNumber={view.paperNumber}
          onBack={() => setView({ name: "week", week: view.week })}
          onChanged={() => refresh(course)}
          onError={setError}
        />
      )}

      {view.name === "review" && (
        <ReviewDetail
          item={view.item}
          course={course}
          onBack={() => setView({ name: "board" })}
          onChanged={() => refresh(course)}
          onError={setError}
        />
      )}
    </div>
  );
}
