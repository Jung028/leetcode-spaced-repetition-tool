import React, { useEffect, useRef, useState } from "react";
import type { ExamPaperView, ExamQuestionView, ExamHistoryWeek } from "./exam-api";
import type { ExamWeekView } from "./exam-content";
import type { JobStatus } from "./exam-generate";
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

type View =
  | { name: "board" }
  | { name: "week"; week: number }
  | { name: "paper"; week: number; paperNumber: number }
  | { name: "history" }
  | { name: "history-paper"; week: number; paperNumber: number };

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
    fetch(`/api/exam/${course}/due`).then((r) => json<{ weeksDue: ExamWeekView[]; stats: Stats }>(r)),
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
  sync: () => fetch("/api/exam/sync").then((r) => json<{ pending: { course: string; week: number }[] }>(r)),
  generate: (course: string, week: number) =>
    fetch(`/api/exam/${course}/${week}/generate`, { method: "POST" }).then((r) => json<{}>(r)),
  generateStatus: (course: string, week: number) =>
    fetch(`/api/exam/${course}/${week}/generate/status`).then((r) => json<JobStatus>(r)),
  history: (course: string) => fetch(`/api/exam/${course}/history`).then((r) => json<{ weeks: ExamHistoryWeek[] }>(r)),
  retake: (course: string, week: number, paperNumber: number) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/retake`, { method: "POST" }).then((r) => json<{ ok: true }>(r)),
  retakeWrong: (course: string, week: number, paperNumber: number) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/retake-wrong`, { method: "POST" }).then((r) => json<{ ok: true }>(r)),
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

function jobKey(course: string, week: number): string {
  return `${course}:${week}`;
}

function formatElapsed(startedAt: string, now: number): string {
  const secs = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
  return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;
}

function notifyGenerateDone(course: string, week: number, status: JobStatus): void {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(`${course} Week ${week} ${status.state === "done" ? "generated" : "failed"}`, {
    body: status.state === "failed" ? status.logTail : undefined,
  });
}

function SyncBanner({
  pending,
  onDismiss,
  onGenerated,
}: {
  pending: { course: string; week: number }[];
  onDismiss: () => void;
  onGenerated: () => void;
}) {
  const [jobs, setJobs] = useState<Record<string, JobStatus>>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [tick, setTick] = useState(() => Date.now());
  const notifiedRef = useRef<Set<string>>(new Set());

  const generate = async (course: string, week: number) => {
    setJobs((prev) => ({ ...prev, [jobKey(course, week)]: { state: "running", startedAt: new Date().toISOString() } }));
    try {
      await api.generate(course, week);
    } catch (err) {
      setJobs((prev) => ({
        ...prev,
        [jobKey(course, week)]: { state: "failed", logTail: errorMessage(err) },
      }));
    }
  };

  const poll = async (course: string, week: number) => {
    const status = await api.generateStatus(course, week).catch(() => null);
    if (!status) return;
    const key = jobKey(course, week);
    setJobs((prev) => ({ ...prev, [key]: status }));
    if (status.state === "done") onGenerated();
    if ((status.state === "done" || status.state === "failed") && !notifiedRef.current.has(key)) {
      notifiedRef.current.add(key);
      notifyGenerateDone(course, week, status);
      setQueue((prev) => {
        const [next, ...rest] = prev;
        if (next) {
          const [c, w] = next.split(":");
          generate(c!, Number(w));
        }
        return rest;
      });
    }
  };

  // Recover in-progress/failed state on mount — e.g. after a page reload
  // mid-generation, since job status lives on disk, not in this component's
  // state.
  useEffect(() => {
    pending.forEach((p) => poll(p.course, p.week));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anyRunning = pending.some((p) => jobs[jobKey(p.course, p.week)]?.state === "running");

  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => pending.forEach((p) => poll(p.course, p.week)), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, pending]);

  // Drives the live "Generating… m:ss" label — separate from the 5s status
  // poll above since the timer needs to tick every second, not every poll.
  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [anyRunning]);

  const handleClick = (course: string, week: number) => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    if (anyRunning) {
      const key = jobKey(course, week);
      setQueue((prev) => (prev.includes(key) ? prev : [...prev, key]));
    } else {
      generate(course, week);
    }
  };

  return (
    <div className="board" style={{ marginBottom: "1rem" }}>
      <div className="board-row" style={{ justifyContent: "space-between" }}>
        <span>
          {pending.length === 0
            ? "Everything's generated — nothing pending."
            : `${pending.length} week${pending.length === 1 ? "" : "s"} ready to generate.`}
        </span>
        <button className="modal-close" onClick={onDismiss} aria-label="Dismiss">×</button>
      </div>
      {pending.length > 0 && (
        <ul className="board-rows">
          {pending.map((p) => {
            const key = jobKey(p.course, p.week);
            const job = jobs[key];
            const running = job?.state === "running";
            const failed = job?.state === "failed";
            const queuePosition = queue.indexOf(key);
            const queued = queuePosition !== -1;
            const label = running
              ? `Generating… ${formatElapsed(job!.startedAt!, tick)}`
              : queued
                ? `Queued · #${queuePosition + 1}`
                : failed
                  ? "Retry"
                  : "Generate";
            return (
              <li key={key}>
                <div className="board-row" style={{ justifyContent: "space-between" }}>
                  <span className="board-title">{p.course} Week {p.week}</span>
                  <span>
                    {failed && <span className="tag">failed</span>}
                    <button className="btn btn-primary" disabled={running || queued} onClick={() => handleClick(p.course, p.week)}>
                      {label}
                    </button>
                  </span>
                </div>
                {failed && job?.logTail && <p className="rule-note">{job.logTail}</p>}
              </li>
            );
          })}
        </ul>
      )}
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
  const [index, setIndex] = useState(() => {
    // Resume at the first ungraded question — or, if every question is
    // already graded but the paper was never submitted, land on the last
    // question, since that's where Submit actually lives.
    const firstUngraded = paper.questions.findIndex((q) => q.correct === null);
    return firstUngraded === -1 ? paper.questions.length - 1 : firstUngraded;
  });
  const allGraded = current.questions.every((q) => q.correct !== null);
  const reviewing = current.submittedAt !== null;
  const wrongCount = current.questions.filter((q) => q.correct === 0).length;
  const remaining = current.questions.filter((q) => q.correct === null).length;

  const reload = () => api.paper(course, paper.week, paper.paperNumber).then(setCurrent);

  // Grading a question auto-advances to the next ungraded one — landing on
  // the last question once everything's graded, so Submit is reachable.
  const advance = (updated: ExamPaperView) => {
    setCurrent(updated);
    const next = updated.questions.findIndex((q) => q.correct === null);
    setIndex(next === -1 ? updated.questions.length - 1 : next);
  };

  const submit = async () => {
    onError(null);
    try {
      await api.submit(course, paper.week, paper.paperNumber);
      onChanged();
      await reload();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const retakeWrongOnly = async () => {
    onError(null);
    try {
      await api.retakeWrong(course, paper.week, paper.paperNumber);
      onChanged();
      await reload();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const retakeWhole = async () => {
    onError(null);
    try {
      await api.retake(course, paper.week, paper.paperNumber);
      onChanged();
      await reload();
    } catch (err) {
      onError(errorMessage(err));
    }
  };

  const question = current.questions[index]!;

  return (
    <article className={reviewing ? "detail" : "detail exam-focus"}>
      <header className="detail-head">
        <h2>{current.title}</h2>
        {reviewing ? (
          <>
            <span className="tag">{current.questions.length} questions</span>
            <span className="lang-tag">{current.scoreCorrect}/{current.scoreTotal} correct</span>
          </>
        ) : (
          <span className="lang-tag">Question {index + 1} of {current.questions.length} — {remaining} left</span>
        )}
      </header>
      {reviewing ? (
        current.questions.map((q) =>
          q.type === "mcq" || q.type === "truefalse" ? (
            <McqQuestion
              key={`${q.index}-${q.correct}`}
              question={q}
              course={course}
              week={paper.week}
              paperNumber={paper.paperNumber}
              onGraded={setCurrent}
              onError={onError}
            />
          ) : (
            <ShortOrScenarioQuestion
              key={`${q.index}-${q.correct}`}
              question={q}
              course={course}
              week={paper.week}
              paperNumber={paper.paperNumber}
              onGraded={setCurrent}
              onError={onError}
            />
          ),
        )
      ) : (
        <>
          <div className="exam-progress-bar">
            <div className="exam-progress-fill" style={{ width: `${(index / current.questions.length) * 100}%` }} />
          </div>
          {question.type === "mcq" || question.type === "truefalse" ? (
            <McqQuestion
              key={`${question.index}-${question.correct}`}
              question={question}
              course={course}
              week={paper.week}
              paperNumber={paper.paperNumber}
              onGraded={advance}
              onError={onError}
            />
          ) : (
            <ShortOrScenarioQuestion
              key={`${question.index}-${question.correct}`}
              question={question}
              course={course}
              week={paper.week}
              paperNumber={paper.paperNumber}
              onGraded={advance}
              onError={onError}
            />
          )}
          <div className="btn-row">
            <button className="btn" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              Previous
            </button>
            <button
              className="btn"
              disabled={index === current.questions.length - 1}
              onClick={() => setIndex((i) => Math.min(current.questions.length - 1, i + 1))}
            >
              Next
            </button>
            <span className="btn-spacer" />
            {index === current.questions.length - 1 && (
              <button className="btn btn-primary" disabled={!allGraded} onClick={submit}>
                Submit paper
              </button>
            )}
            <button className="btn" onClick={onBack}>Back</button>
          </div>
          {index === current.questions.length - 1 && !allGraded && (
            <p className="board-empty">
              Grade every question — multiple choice grades itself on selection; reveal and mark short/scenario answers — before submitting.
            </p>
          )}
        </>
      )}
      {reviewing && (
        <div className="btn-row">
          {wrongCount > 0 && (
            <button className="btn btn-fail" onClick={retakeWrongOnly}>Retake wrong only ({wrongCount})</button>
          )}
          <button className="btn" onClick={retakeWhole}>Retake whole paper</button>
          <button className="btn" onClick={onBack}>Back</button>
        </div>
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
              <button
                className="board-row board-row-main"
                style={{ "--urgency": "var(--green)" } as React.CSSProperties}
                onClick={() => onPickPaper(p.paperNumber)}
              >
                <span className="tag">done</span>
                <span className="board-title">{p.title}</span>
                <span className="lang-tag">{p.scoreCorrect}/{p.scoreTotal}</span>
              </button>
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

function HistoryView({
  weeks,
  onBack,
  onOpenPaper,
  onRetake,
  onRetakeWrong,
}: {
  weeks: ExamHistoryWeek[];
  onBack: () => void;
  onOpenPaper: (week: number, paperNumber: number) => void;
  onRetake: (week: number, paperNumber: number) => void;
  onRetakeWrong: (week: number, paperNumber: number) => void;
}) {
  return (
    <article className="detail">
      <header className="detail-head">
        <h2>History</h2>
      </header>
      {weeks.length === 0 ? (
        <p className="board-empty">No past weeks yet.</p>
      ) : (
        weeks.map((w) => (
          <section key={w.week} className="board" aria-label={`Week ${w.week}`}>
            <div className="section-head">
              <h2>Week {w.week}</h2>
            </div>
            <ul className="board-rows">
              {w.papers.map((p) => (
                <li key={p.paperNumber}>
                  <div className="board-row board-row-main" style={{ "--urgency": "var(--green)" } as React.CSSProperties}>
                    <span className="tag">{p.submitted ? "done" : "reset"}</span>
                    <span className="board-title">{p.title}</span>
                    {p.submitted && (
                      <span className="lang-tag">{p.scoreCorrect}/{p.scoreTotal}</span>
                    )}
                    {p.submitted ? (
                      <>
                        <button className="btn" onClick={() => onOpenPaper(w.week, p.paperNumber)}>View</button>
                        {p.scoreCorrect! < p.scoreTotal! && (
                          <button className="btn" onClick={() => onRetakeWrong(w.week, p.paperNumber)}>Retake wrong only</button>
                        )}
                        <button className="btn" onClick={() => onRetake(w.week, p.paperNumber)}>Retake whole paper</button>
                      </>
                    ) : (
                      <button className="btn" onClick={() => onOpenPaper(w.week, p.paperNumber)}>Continue</button>
                    )}
                  </div>
                  {p.pastAttempts.length > 0 && (
                    <p className="rule-note">
                      {p.pastAttempts
                        .map((a) => `Attempt ${a.attemptNumber}: ${a.scoreCorrect}/${a.scoreTotal} (${a.submittedAt})`)
                        .join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      <div className="btn-row">
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
  const [stats, setStats] = useState<Stats>({ dueCount: 0, overdueCount: 0, completedToday: 0 });
  const [completedPapers, setCompletedPapers] = useState<ExamPaperView[] | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncPending, setSyncPending] = useState<{ course: string; week: number }[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [history, setHistory] = useState<ExamHistoryWeek[]>([]);

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
      .then(({ weeksDue, stats }) => {
        setWeeksDue(weeksDue);
        setStats(stats);
      })
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(() => {
    if (course) {
      setView({ name: "board" });
      setCompletedPapers(null);
      setHistory([]);
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

  const loadHistory = () => {
    if (!course) return;
    api
      .history(course)
      .then((r) => setHistory(r.weeks))
      .catch((err) => setError(errorMessage(err)));
  };

  const openHistory = () => {
    setView({ name: "history" });
    loadHistory();
  };

  const retake = async (week: number, paperNumber: number) => {
    if (!course) return;
    setError(null);
    try {
      await api.retake(course, week, paperNumber);
      setView({ name: "history-paper", week, paperNumber });
      refresh(course);
      loadHistory();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const retakeWrong = async (week: number, paperNumber: number) => {
    if (!course) return;
    setError(null);
    try {
      await api.retakeWrong(course, week, paperNumber);
      setView({ name: "history-paper", week, paperNumber });
      refresh(course);
      loadHistory();
    } catch (err) {
      setError(errorMessage(err));
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
        <button className="btn" onClick={openHistory}>History</button>
      </div>
      {syncPending !== null && (
        <SyncBanner
          pending={syncPending}
          onDismiss={() => setSyncPending(null)}
          onGenerated={() => {
            runSync();
            if (course) refresh(course);
          }}
        />
      )}
      <ExamStats stats={stats} onOpenCompleted={openCompleted} />
      {error && <p className="form-error">{error}</p>}
      <p className="rule-note">
        Each week's papers are due by Sunday. After submitting, wrong questions are highlighted — retake just those or the whole paper.
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
                  // A single-paper week has nothing to pick between — skip
                  // straight to the paper (resuming where they left off)
                  // instead of an intermediate picker with one row in it.
                  const goDirectly = () =>
                    w.papers.length === 1
                      ? setView({ name: "paper", week: w.week, paperNumber: w.papers[0]!.paperNumber })
                      : setView({ name: "week", week: w.week });
                  return (
                    <li key={w.week}>
                      <button className="board-row board-row-main" onClick={goDirectly}>
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
          // A single-paper week is opened directly from the board (skipping
          // the picker), so Back should return there too, not to a picker
          // screen with just the one paper the user never chose to visit.
          onBack={() =>
            setView(currentWeek?.papers.length === 1 ? { name: "board" } : { name: "week", week: view.week })
          }
          onChanged={() => refresh(course)}
          onError={setError}
        />
      )}

      {view.name === "history" && (
        <HistoryView
          weeks={history}
          onBack={() => setView({ name: "board" })}
          onOpenPaper={(week, paperNumber) => setView({ name: "history-paper", week, paperNumber })}
          onRetake={retake}
          onRetakeWrong={retakeWrong}
        />
      )}

      {view.name === "history-paper" && (
        <PaperLoader
          course={course}
          week={view.week}
          paperNumber={view.paperNumber}
          onBack={() => setView({ name: "history" })}
          onChanged={() => {
            refresh(course);
            openHistory();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}
