import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { LADDER, isDue, localToday } from "./scheduling";
import type { ProblemSummary, ProblemDetail } from "./db";
import { highlightCode } from "./highlight";
import TodoApp from "./TodoApp";
import HomeApp from "./HomeApp";
import ExamApp from "./ExamApp";
import "./index.css";

type View =
  | { name: "board" }
  | { name: "add" }
  | { name: "detail"; id: number };

type ProblemFields = { title: string; url: string; solution: string; language: string; pattern: string; patternWhy: string };

const LANGUAGE_OPTIONS = [
  "java",
  "python3",
  "cpp",
  "c",
  "csharp",
  "javascript",
  "typescript",
  "golang",
  "ruby",
  "swift",
  "kotlin",
  "rust",
  "php",
];

const api = {
  list: () =>
    fetch("/api/problems").then((r) => r.json() as Promise<ProblemSummary[]>),
  get: (id: number) =>
    fetch(`/api/problems/${id}`).then((r) => r.json() as Promise<ProblemDetail>),
  stats: () =>
    fetch("/api/stats").then((r) => r.json() as Promise<{ completedToday: number }>),
  create: (body: ProblemFields) =>
    fetch("/api/problems", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  update: (id: number, body: ProblemFields) =>
    fetch(`/api/problems/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  review: (id: number, result: "pass" | "fail") =>
    fetch(`/api/problems/${id}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }),
  remove: (id: number) =>
    fetch(`/api/problems/${id}`, { method: "DELETE" }),
};

interface Leetcode150Current {
  position: number;
  number: number;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
  dueSince: string;
  overdueDays: number;
}

const leetcode150Api = {
  current: () =>
    fetch("/api/leetcode150/current").then(
      (r) => r.json() as Promise<Leetcode150Current | { done: true }>,
    ),
};

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

// Same visual language LeetCode uses for difficulty, repointed at how
// urgently a review is needed: green (on schedule) → gold (due today) → red (overdue).
function urgency(nextReview: string, today: string): "green" | "gold" | "red" {
  if (nextReview > today) return "green";
  return nextReview === today ? "gold" : "red";
}

const openExternal = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

function RungMeter({ rung }: { rung: number }) {
  return (
    <span className="rung" title={`rung ${rung + 1} of ${LADDER.length} — next interval ${LADDER[rung]}d`}>
      {LADDER.map((_, i) => (
        <span key={i} className={i <= rung ? "rung-on" : "rung-off"} />
      ))}
    </span>
  );
}

function TrackedListModal({
  title = "Tracked problems",
  emptyMessage = "Nothing tracked yet.",
  problems,
  onOpen,
  onClose,
}: {
  title?: string;
  emptyMessage?: string;
  problems: ProblemSummary[];
  onOpen: (id: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sorted = [...problems].sort((a, b) => a.next_review.localeCompare(b.next_review));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {sorted.length === 0 ? (
          <p className="board-empty">{emptyMessage}</p>
        ) : (
          <ul className="modal-rows">
            {sorted.map((p) => (
              <li key={p.id}>
                <div className="modal-row">
                  <button
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0, textAlign: "left" }}
                    onClick={() => openExternal(p.url)}
                  >
                    <span className="modal-row-date">{p.next_review}</span>
                    <span className="modal-row-title">{p.title}</span>
                    <span className="lang-tag">{p.language}</span>
                    <RungMeter rung={p.rung} />
                  </button>
                  <button
                    className="board-row-review"
                    onClick={() => {
                      onOpen(p.id);
                      onClose();
                    }}
                    title="View details & mark review"
                    aria-label="View details"
                  >
                    ⋯
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type StatModal = "tracked" | "due" | "overdue" | "completed" | null;

function Stats({
  problems,
  today,
  completedToday,
  onOpen,
}: {
  problems: ProblemSummary[];
  today: string;
  completedToday: number;
  onOpen: (id: number) => void;
}) {
  const [openModal, setOpenModal] = useState<StatModal>(null);
  const [completedList, setCompletedList] = useState<ProblemSummary[] | null>(null);

  // Reset the cached completed-today list whenever the underlying count
  // changes (e.g. after a review elsewhere on the board), so a stale list
  // isn't shown next time this modal is reopened without a tab switch.
  useEffect(() => {
    setCompletedList(null);
  }, [completedToday]);

  const dueProblems = problems.filter((p) => isDue(p.next_review, today));
  const overdueProblems = problems.filter((p) => p.next_review < today);

  const openCompleted = () => {
    setOpenModal("completed");
    if (completedList === null) {
      fetch("/api/problems/completed-today")
        .then((r) => r.json())
        .then(setCompletedList);
    }
  };

  return (
    <>
      <div className="stats">
        <button className="stat stat-total" onClick={() => setOpenModal("tracked")}>
          <span className="stat-num">{problems.length}</span>
          <span className="stat-label">Tracked</span>
        </button>
        <button className="stat stat-due" onClick={() => setOpenModal("due")}>
          <span className="stat-num">{dueProblems.length}</span>
          <span className="stat-label">Due today</span>
        </button>
        <button className="stat stat-overdue" onClick={() => setOpenModal("overdue")}>
          <span className="stat-num">{overdueProblems.length}</span>
          <span className="stat-label">Overdue</span>
        </button>
        <button className="stat stat-completed" onClick={openCompleted}>
          <span className="stat-num">{completedToday}</span>
          <span className="stat-label">Completed today</span>
        </button>
      </div>
      {openModal === "tracked" && (
        <TrackedListModal
          problems={problems}
          onOpen={onOpen}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "due" && (
        <TrackedListModal
          title="Due today"
          emptyMessage="Nothing due today."
          problems={dueProblems}
          onOpen={onOpen}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "overdue" && (
        <TrackedListModal
          title="Overdue"
          emptyMessage="Nothing overdue."
          problems={overdueProblems}
          onOpen={onOpen}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "completed" && (
        <TrackedListModal
          title="Completed today"
          emptyMessage="Nothing completed today yet."
          problems={completedList ?? []}
          onOpen={onOpen}
          onClose={() => setOpenModal(null)}
        />
      )}
    </>
  );
}

function DueBoard({
  problems,
  today,
  onOpen,
}: {
  problems: ProblemSummary[];
  today: string;
  onOpen: (id: number) => void;
}) {
  const due = problems.filter((p) => isDue(p.next_review, today));
  return (
    <section className="board" aria-label="Due today">
      <div className="section-head">
        <h2>Due today</h2>
        <span className="board-count">{due.length}</span>
      </div>
      {due.length === 0 ? (
        <p className="board-empty">Nothing due. The next reviews are on the calendar on the Home tab.</p>
      ) : (
        <ul className="board-rows">
          {due.map((p, i) => {
            const overdue = daysBetween(p.next_review, today);
            const color = urgency(p.next_review, today);
            return (
              <li key={p.id} style={{ animationDelay: `${i * 60}ms` }}>
                <div
                  className="board-row"
                  style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                >
                  <button className="board-row-main" onClick={() => openExternal(p.url)}>
                    <span className="tag">{overdue > 0 ? `${overdue}d late` : "due"}</span>
                    <span className="board-title">{p.title}</span>
                    <span className="lang-tag">{p.language}</span>
                    <RungMeter rung={p.rung} />
                  </button>
                  <button
                    className="board-row-review"
                    onClick={() => onOpen(p.id)}
                    title="View details & mark review"
                    aria-label="View details"
                  >
                    ⋯
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function NextProblemBanner() {
  const [current, setCurrent] = useState<Leetcode150Current | { done: true } | null>(null);

  useEffect(() => {
    leetcode150Api.current().then(setCurrent);
  }, []);

  if (current === null) return null;
  if ("done" in current) {
    return (
      <section className="board next-problem-banner" aria-label="Top Interview 150 progress">
        <p className="board-empty">🎉 All 150 Top Interview problems done!</p>
      </section>
    );
  }

  return (
    <section className="board next-problem-banner" aria-label="Next Top Interview 150 problem">
      <div className="board-row">
        <button className="board-row-main" onClick={() => openExternal(current.url)}>
          <span className="tag">next up</span>
          <span className="board-title">
            {current.number}. {current.title}
          </span>
          <span className="lang-tag">{current.topic} · {current.difficulty}</span>
        </button>
      </div>
    </section>
  );
}

function ProblemForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ProblemFields;
  submitLabel: string;
  onSubmit: (v: ProblemFields) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  const [error, setError] = useState("");
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV({ ...v, [k]: e.target.value });

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v.title.trim() || !v.url.trim() || !v.solution.trim()) {
          setError("Title, link and solution are all required.");
          return;
        }
        await onSubmit(v);
      }}
    >
      <label>
        Title
        <input value={v.title} onChange={set("title")} placeholder="Two Sum" autoFocus />
      </label>
      <label>
        LeetCode link
        <input value={v.url} onChange={set("url")} type="url" placeholder="https://leetcode.com/problems/two-sum/" />
      </label>
      <label>
        Language
        <select value={v.language} onChange={set("language")}>
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </label>
      <label>
        Your solution
        <textarea value={v.solution} onChange={set("solution")} rows={14} spellCheck={false} placeholder="Paste the solution you want to re-derive later" />
      </label>
      <label>
        Pattern
        <input value={v.pattern} onChange={set("pattern")} placeholder="Sliding Window, Two Pointers, Greedy, ..." />
      </label>
      <label>
        Why this pattern
        <textarea value={v.patternWhy} onChange={set("patternWhy")} rows={4} placeholder="Why this pattern fits this specific problem" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function Detail({
  id,
  today,
  onBack,
  onChanged,
}: {
  id: number;
  today: string;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [p, setP] = useState<ProblemDetail | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = () => api.get(id).then(setP);
  useEffect(() => { load(); }, [id]);

  const highlighted = useMemo(
    () => (p ? highlightCode(p.solution, p.language) : ""),
    [p],
  );

  if (!p) return <p className="board-empty">Loading…</p>;

  if (editing)
    return (
      <ProblemForm
        initial={{ title: p.title, url: p.url, solution: p.solution, language: p.language, pattern: p.pattern, patternWhy: p.pattern_why }}
        submitLabel="Save changes"
        onCancel={() => setEditing(false)}
        onSubmit={async (v) => {
          await api.update(id, v);
          setEditing(false);
          onChanged();
          load();
        }}
      />
    );

  const review = async (result: "pass" | "fail") => {
    await api.review(id, result);
    onChanged();
    onBack();
  };

  return (
    <article className="detail">
      <header className="detail-head">
        <h2>{p.title}</h2>
        <span className="lang-tag">{p.language}</span>
        <RungMeter rung={p.rung} />
      </header>
      <p className="detail-meta">
        <a href={p.url} target="_blank" rel="noreferrer">Open on LeetCode ↗</a>
        <span>
          {isDue(p.next_review, today)
            ? "Due now"
            : `Next review ${p.next_review}`}
        </span>
        <span>Added {p.created_at}</span>
      </p>

      {revealed ? (
        <pre className={`solution language-${p.language}`}>
          <code
            className={`language-${p.language}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      ) : (
        <button className="solution-cover" onClick={() => setRevealed(true)}>
          Solution hidden — try solving it first, then reveal
        </button>
      )}

      {revealed && (p.pattern || p.pattern_why) && (
        <section className="pattern-section">
          <h3>Pattern</h3>
          {p.pattern && <span className="lang-tag pattern-tag">{p.pattern}</span>}
          {p.pattern_why && <p className="pattern-why">{p.pattern_why}</p>}
        </section>
      )}

      <div className="btn-row">
        <button className="btn btn-pass" onClick={() => review("pass")}>
          Passed · next in {LADDER[Math.min(p.rung + 1, LADDER.length - 1)]}d
        </button>
        <button className="btn btn-fail" onClick={() => review("fail")}>
          Failed · restart, due tomorrow
        </button>
        <span className="btn-spacer" />
        <button className="btn" onClick={() => setEditing(true)}>Edit</button>
        <button
          className="btn btn-danger"
          onClick={async () => {
            if (confirm(`Delete “${p.title}”?`)) {
              await api.remove(id);
              onChanged();
              onBack();
            }
          }}
        >
          Delete
        </button>
      </div>

      {p.reviews.length > 0 && (
        <section className="history">
          <h3>History</h3>
          <ul>
            {p.reviews.map((r) => (
              <li key={r.id}>
                <span className={r.result === "pass" ? "hist-pass" : "hist-fail"}>
                  {r.result}
                </span>{" "}
                {r.reviewed_at}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function LeetCodeApp({
  openProblemId,
  onOpened,
}: {
  openProblemId?: number | null;
  onOpened?: () => void;
} = {}) {
  const today = localToday();
  const [view, setView] = useState<View>({ name: "board" });
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [completedToday, setCompletedToday] = useState(0);

  const refresh = async () => {
    const [list, stats] = await Promise.all([api.list(), api.stats()]);
    setCompletedToday(stats.completedToday);
    setProblems(list);
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (openProblemId != null) {
      setView({ name: "detail", id: openProblemId });
      onOpened?.();
    }
  }, [openProblemId]);

  const open = (id: number) => setView({ name: "detail", id });

  return (
    <>
      <header className="masthead">
        <button className="wordmark" onClick={() => setView({ name: "board" })}>
          Review Board
        </button>
        <span className="masthead-date">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
        {view.name === "board" && (
          <button className="btn btn-primary" onClick={() => setView({ name: "add" })}>
            Add problem
          </button>
        )}
      </header>

      {view.name === "board" && (
        <>
          <NextProblemBanner />
          <Stats problems={problems} today={today} completedToday={completedToday} onOpen={open} />
          <p className="rule-note">
            Pass a review and the problem comes back later: 1 → 3 → 7 → 14 → 30
            days. Fail and it starts over, due tomorrow.
          </p>
          <DueBoard problems={problems} today={today} onOpen={open} />
        </>
      )}

      {view.name === "add" && (
        <ProblemForm
          initial={{ title: "", url: "", solution: "", language: "java", pattern: "", patternWhy: "" }}
          submitLabel="Add problem"
          onCancel={() => setView({ name: "board" })}
          onSubmit={async (v) => {
            await api.create(v);
            await refresh();
            setView({ name: "board" });
          }}
        />
      )}

      {view.name === "detail" && (
        <Detail
          id={view.id}
          today={today}
          onBack={() => setView({ name: "board" })}
          onChanged={refresh}
        />
      )}
    </>
  );
}

type Tab = "home" | "leetcode" | "todo" | "exam";

type DeepLink =
  | { tab: "leetcode"; problemId: number }
  | { tab: "todo"; todoId: number }
  | { tab: "exam"; course: string; week: number };

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      // localStorage inaccessible (e.g. blocked storage) — fall through to system preference
    }
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage inaccessible — theme still applies for this session, just won't persist
    }
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      {theme === "light" ? "☾︎" : "☀︎"}
    </button>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabs" aria-label="Sections">
      <button
        className={tab === "home" ? "tab tab-active" : "tab"}
        onClick={() => onChange("home")}
      >
        Home
      </button>
      <button
        className={tab === "leetcode" ? "tab tab-active" : "tab"}
        onClick={() => onChange("leetcode")}
      >
        LeetCode
      </button>
      <button
        className={tab === "todo" ? "tab tab-active" : "tab"}
        onClick={() => onChange("todo")}
      >
        Todo
      </button>
      <button
        className={tab === "exam" ? "tab tab-active" : "tab"}
        onClick={() => onChange("exam")}
      >
        Modules
      </button>
      <ThemeToggle />
    </nav>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [deepLink, setDeepLink] = useState<DeepLink | null>(null);

  const navigate = (item: {
    source: "leetcode" | "todo" | "exam";
    linkId: number;
    course?: string;
    externalUrl?: string;
  }) => {
    if (item.source === "leetcode" && item.externalUrl) {
      openExternal(item.externalUrl);
      return;
    }
    if (item.source === "leetcode") setDeepLink({ tab: "leetcode", problemId: item.linkId });
    else if (item.source === "todo") setDeepLink({ tab: "todo", todoId: item.linkId });
    else setDeepLink({ tab: "exam", course: item.course!, week: item.linkId });
    setTab(item.source);
  };

  return (
    <div className="app">
      <TabBar tab={tab} onChange={setTab} />
      {tab === "home" && <HomeApp onNavigate={navigate} />}
      {tab === "leetcode" && (
        <LeetCodeApp
          openProblemId={deepLink?.tab === "leetcode" ? deepLink.problemId : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
      {tab === "todo" && (
        <TodoApp
          openTodoId={deepLink?.tab === "todo" ? deepLink.todoId : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
      {tab === "exam" && (
        <ExamApp
          openCourse={deepLink?.tab === "exam" ? deepLink.course : null}
          openWeek={deepLink?.tab === "exam" ? deepLink.week : null}
          onOpened={() => setDeepLink(null)}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
