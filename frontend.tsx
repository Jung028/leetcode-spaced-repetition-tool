import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { LADDER, addDays, isDue, localToday } from "./scheduling";
import type { ProblemSummary, ProblemDetail } from "./db";
import { highlightCode } from "./highlight";
import { sydneyWallClockToUtc, toGoogleUtcStamp } from "./sydneyTime";
import TheoryApp from "./TheoryApp";
import GoalsApp from "./GoalsApp";
import "./index.css";

// Opens a one-click Google Calendar "quick add" tab for a review date — no
// OAuth needed, just the browser's own logged-in Google session. Always a
// full 22:00–00:00 Sydney-time slot; doesn't try to detect/avoid overlaps
// with other problems on the same day (Google's calendar UI stacks
// overlapping events fine, and computing a shared split here would need
// fetching every other problem due that day just to lay out one popup).
function openCalendarQuickAdd(title: string, url: string, nextReview: string) {
  const start = sydneyWallClockToUtc(nextReview, 22, 0);
  const end = sydneyWallClockToUtc(addDays(nextReview, 1), 0, 0);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `LeetCode review: ${title}`,
    dates: `${toGoogleUtcStamp(start)}/${toGoogleUtcStamp(end)}`,
    details: `Open on LeetCode: ${url}`,
  });
  window.open(
    `https://calendar.google.com/calendar/render?${params.toString()}`,
    "_blank",
    "noopener,noreferrer",
  );
}

type View =
  | { name: "board" }
  | { name: "add" }
  | { name: "detail"; id: number };

type ProblemFields = { title: string; url: string; solution: string; language: string };

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
  problems,
  onOpen,
  onClose,
}: {
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
          <h2>Tracked problems</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {sorted.length === 0 ? (
          <p className="board-empty">Nothing tracked yet.</p>
        ) : (
          <ul className="modal-rows">
            {sorted.map((p) => (
              <li key={p.id}>
                <button
                  className="modal-row"
                  onClick={() => {
                    onOpen(p.id);
                    onClose();
                  }}
                >
                  <span className="modal-row-date">{p.next_review}</span>
                  <span className="modal-row-title">{p.title}</span>
                  <span className="lang-tag">{p.language}</span>
                  <RungMeter rung={p.rung} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

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
  const [showTracked, setShowTracked] = useState(false);
  const due = problems.filter((p) => isDue(p.next_review, today)).length;
  const overdue = problems.filter((p) => p.next_review < today).length;
  return (
    <>
      <div className="stats">
        <button className="stat stat-total" onClick={() => setShowTracked(true)}>
          <span className="stat-num">{problems.length}</span>
          <span className="stat-label">Tracked</span>
        </button>
        <div className="stat stat-due">
          <span className="stat-num">{due}</span>
          <span className="stat-label">Due today</span>
        </div>
        <div className="stat stat-overdue">
          <span className="stat-num">{overdue}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat stat-completed">
          <span className="stat-num">{completedToday}</span>
          <span className="stat-label">Completed today</span>
        </div>
      </div>
      {showTracked && (
        <TrackedListModal
          problems={problems}
          onOpen={onOpen}
          onClose={() => setShowTracked(false)}
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
        <p className="board-empty">Nothing due. The next reviews are on the calendar below.</p>
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

// Each entry is overlaid in the embed with its own Google-palette color, so
// LeetCode reviews and the university timetable stay visually distinct
// instead of blending into one undifferentiated calendar.
const EMBEDDED_CALENDARS = [
  { id: "aedamjung@gmail.com", color: "#F4511E" }, // Tangerine — LeetCode reviews
  {
    id: "crc3t59ndtkt77bdu0j6tv35ant0erjl@import.calendar.google.com",
    color: "#039BE5", // Peacock — University of Sydney timetable
  },
];

function GoogleCalendarEmbed() {
  const src = useMemo(() => {
    const params = new URLSearchParams({
      mode: "MONTH",
      wkst: "2", // Monday
      ctz: "Australia/Sydney",
      showTitle: "0",
      showNav: "1",
      showDate: "1",
      showPrint: "0",
      showTabs: "1",
      showCalendars: "1",
      showTz: "0",
    });
    for (const cal of EMBEDDED_CALENDARS) {
      params.append("src", cal.id);
      params.append("color", cal.color);
    }
    return `https://calendar.google.com/calendar/embed?${params.toString()}`;
  }, []);

  return (
    <section className="calendar" aria-label="Review calendar">
      <div className="section-head">
        <h2>Calendar</h2>
      </div>
      <p className="rule-note">
        Add/Passed/Failed opens a one-click Google Calendar quick-add tab — click Save there to add it.
      </p>
      <div className="gcal-frame">
        <iframe src={src} title="Google Calendar — LeetCode reviews and study timetable" />
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
        initial={p}
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
    const res = await api.review(id, result);
    const updated: ProblemSummary = await res.json();
    openCalendarQuickAdd(updated.title, updated.url, updated.next_review);
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

function LeetCodeApp() {
  const today = localToday();
  const [view, setView] = useState<View>({ name: "board" });
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [completedToday, setCompletedToday] = useState(0);

  const refresh = () => {
    api.list().then(setProblems);
    api.stats().then((s) => setCompletedToday(s.completedToday));
  };
  useEffect(() => { refresh(); }, []);

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
          <Stats problems={problems} today={today} completedToday={completedToday} onOpen={open} />
          <p className="rule-note">
            Pass a review and the problem comes back later: 1 → 3 → 7 → 14 → 30
            days. Fail and it starts over, due tomorrow.
          </p>
          <DueBoard problems={problems} today={today} onOpen={open} />
          <GoogleCalendarEmbed />
        </>
      )}

      {view.name === "add" && (
        <ProblemForm
          initial={{ title: "", url: "", solution: "", language: "java" }}
          submitLabel="Add problem"
          onCancel={() => setView({ name: "board" })}
          onSubmit={async (v) => {
            const res = await api.create(v);
            const created: ProblemSummary = await res.json();
            openCalendarQuickAdd(created.title, created.url, created.next_review);
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

type Tab = "leetcode" | "theory" | "goals";

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabs" aria-label="Sections">
      <button
        className={tab === "leetcode" ? "tab tab-active" : "tab"}
        onClick={() => onChange("leetcode")}
      >
        LeetCode
      </button>
      <button
        className={tab === "theory" ? "tab tab-active" : "tab"}
        onClick={() => onChange("theory")}
      >
        Theory
      </button>
      <button
        className={tab === "goals" ? "tab tab-active" : "tab"}
        onClick={() => onChange("goals")}
      >
        Goals
      </button>
    </nav>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>("leetcode");
  return (
    <div className="app">
      <TabBar tab={tab} onChange={setTab} />
      {tab === "leetcode" && <LeetCodeApp />}
      {tab === "theory" && <TheoryApp />}
      {tab === "goals" && <GoalsApp />}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
