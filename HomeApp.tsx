// HomeApp.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { DueItem, DueSource, HomeStats } from "./home-api";
import AnnouncementsBoard from "./AnnouncementsBoard";
import { SEMESTER_DEADLINES, deadlineId, courseNameFor, noteFor } from "./semester-deadlines";
import type { DeadlineView } from "./deadline-api";
import { TIMELINE_URL } from "./shared/timeline-link";
import { ED_DIGEST_URL } from "./ed-digest-link";
import { localToday } from "./shared/scheduling";

const EMPTY_STATS: HomeStats = { dueToday: 0, overdue: 0, completedToday: 0 };

const DEADLINE_COURSE_COLOR: Record<string, string> = {
  INFO5995: "var(--cat-info5995)",
  COMP5348: "var(--cat-comp5348)",
  INFO6007: "var(--cat-info6007)",
  INFO5990: "var(--cat-info5990)",
};

function daysUntil(dueDate: string, today: string): number {
  return Math.round((Date.parse(dueDate) - Date.parse(today)) / 86_400_000);
}

// Offline/error fallback: the static list computed exactly the way the
// server would with no completions on record — soonest-first, anything
// more than 3 days past due dropped.
function fallbackDeadlineViews(today: string): DeadlineView[] {
  return SEMESTER_DEADLINES.map((d) => ({
    id: deadlineId(d),
    course: d.course,
    courseName: courseNameFor(d.course),
    title: d.title,
    note: noteFor(d),
    weight: d.weight,
    dueDate: d.dueDate,
    days: daysUntil(d.dueDate, today),
    completedAt: null,
  }))
    .filter((d) => d.days >= -3)
    .sort((a, b) => a.days - b.days);
}

// Real assignment/project due dates, separate from the spaced-repetition
// exam board. Completion state lives server-side (/api/deadlines): a
// finished row greys out and strikes through, lingers ~3 days, then drops
// off on the same clock as a past-due row.
function DeadlinesPanel() {
  const today = localToday();
  const [rows, setRows] = useState<DeadlineView[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/deadlines")
      .then((r) => (r.ok ? (r.json() as Promise<DeadlineView[]>) : Promise.reject()))
      .then(setRows)
      .catch(() => setRows(fallbackDeadlineViews(today)));
  }, [today]);

  const list = rows ?? [];
  const activeCount = list.filter((d) => d.completedAt === null).length;

  const toggle = (d: DeadlineView) => {
    const nextCompleted = d.completedAt === null;
    setBusy(d.id);
    // Optimistic: reflect the flip immediately, reconcile with the server's
    // filtered/sorted list on response.
    setRows((cur) =>
      (cur ?? []).map((r) => (r.id === d.id ? { ...r, completedAt: nextCompleted ? today : null } : r)),
    );
    fetch("/api/deadlines", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: d.id, completed: nextCompleted }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<DeadlineView[]>) : Promise.reject()))
      .then(setRows)
      .catch(() =>
        // Revert on failure.
        setRows((cur) =>
          (cur ?? []).map((r) => (r.id === d.id ? { ...r, completedAt: d.completedAt } : r)),
        ),
      )
      .finally(() => setBusy(null));
  };

  return (
    <details className="board deadlines-panel" open aria-label="Semester deadlines">
      <summary className="section-head deadlines-summary">
        <span className="deadlines-chevron" aria-hidden="true">›</span>
        <h2>Semester deadlines</h2>
        <span className="board-count">{activeCount}</span>
        <a
          className="section-head-link"
          href={TIMELINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Full timeline ↗
        </a>
      </summary>
      {list.length === 0 ? (
        <p className="board-empty">No graded deadlines with a confirmed date left this semester.</p>
      ) : (
        <ul className="board-rows">
          {list.map((d, i) => {
            const done = d.completedAt !== null;
            const color = done ? "dim" : d.days < 0 ? "red" : d.days <= 3 ? "gold" : "green";
            const label = done
              ? "done"
              : d.days < 0
                ? `${-d.days}d ago`
                : d.days === 0
                  ? "today"
                  : `in ${d.days}d`;
            return (
              <li key={d.id} style={{ animationDelay: `${i * 60}ms` }}>
                <label
                  className={done ? "board-row board-row-main step-row deadline-done" : "board-row board-row-main step-row"}
                  style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                >
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={busy === d.id}
                    onChange={() => toggle(d)}
                    aria-label={done ? `Mark ${d.title} not done` : `Mark ${d.title} done`}
                  />
                  <span className="tag">{label}</span>
                  <span className="cat-tag" style={{ "--cat-color": DEADLINE_COURSE_COLOR[d.course] } as React.CSSProperties}>
                    {d.course}
                  </span>
                  <span className="deadline-main">
                    <span className="board-title deadline-title">{d.title}</span>
                    <span className="deadline-sub">
                      {d.courseName}
                      {d.note ? ` · ${d.note}` : ""}
                    </span>
                  </span>
                  <span className="goal-deadline">{d.weight} · {d.dueDate}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </details>
  );
}

// Twice-weekly nudge to keep the exam-content pipeline fed: Wednesday and
// Friday are when new lecture material typically lands, so those mornings
// get a standing reminder to pull it in. Computed from the local date, not
// stored — nothing to go stale.
function WeeklyContentReminder() {
  const day = new Date().getDay(); // 0 = Sunday ... 6 = Saturday
  if (day !== 3 && day !== 5) return null;
  const label = day === 3 ? "Wednesday" : "Friday";
  return (
    <div className="reminder-banner" role="note">
      <span className="tag">{label}</span>
      <span>Download this week's lecture video, then ask Claude to generate updated slides notes and exam-style questions from it.</span>
    </div>
  );
}

const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  todo: "Todo",
  exam: "Modules",
  interview: "Interview",
  "module-item": "Deadline",
};

const SOURCE_COLOR: Record<DueSource, string> = {
  leetcode: "var(--cat-src-leetcode)",
  todo: "var(--cat-src-theory)",
  exam: "var(--cat-src-exam)",
  interview: "var(--cat-src-interview)",
  "module-item": "var(--cat-src-goals)",
};

// Same two calendars leetcode-srs already overlays elsewhere: Adam's
// primary calendar and his university timetable import.
const EMBEDDED_CALENDARS = [
  { id: "aedamjung@gmail.com", color: "#F4511E" },
  { id: "crc3t59ndtkt77bdu0j6tv35ant0erjl@import.calendar.google.com", color: "#039BE5" },
];

function HomeListModal({
  title,
  emptyMessage,
  items,
  onNavigate,
  onClose,
}: {
  title: string;
  emptyMessage: string;
  items: DueItem[];
  onNavigate: (item: DueItem) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sorted = [...items].sort((a, b) => a.title.localeCompare(b.title));

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
            {sorted.map((item) => (
              <li key={`${item.source}-${item.id}`}>
                <button
                  className="modal-row"
                  onClick={() => {
                    onNavigate(item);
                    onClose();
                  }}
                >
                  <span className="cat-tag" style={{ "--cat-color": SOURCE_COLOR[item.source] } as React.CSSProperties}>
                    {SOURCE_LABEL[item.source]}
                  </span>
                  <span className="modal-row-title">{item.title}</span>
                  <span className="goal-deadline">{item.subtitle}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function GoogleCalendarEmbed() {
  const src = useMemo(() => {
    const params = new URLSearchParams({
      mode: "MONTH",
      wkst: "2",
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
        Adam's primary calendar and university timetable, for reference.
      </p>
      <div className="gcal-frame">
        <iframe src={src} title="Google Calendar — LeetCode reviews and study timetable" />
      </div>
    </section>
  );
}

type StatModal = "due" | "overdue" | "completed" | null;

export default function HomeApp({ onNavigate }: { onNavigate: (item: DueItem) => void }) {
  const [items, setItems] = useState<DueItem[]>([]);
  const [stats, setStats] = useState<HomeStats>(EMPTY_STATS);
  const [loadError, setLoadError] = useState(false);
  const [openModal, setOpenModal] = useState<StatModal>(null);
  const [completedList, setCompletedList] = useState<DueItem[] | null>(null);

  const dueToday = items.filter((item) => item.overdueDays === 0);
  const overdue = items.filter((item) => item.overdueDays > 0);

  const openCompleted = () => {
    setOpenModal("completed");
    if (completedList === null) {
      fetch("/api/home/completed-today")
        .then((r) => (r.ok ? r.json() : []))
        .then(setCompletedList)
        .catch(() => setCompletedList([]));
    }
  };

  useEffect(() => {
    fetch("/api/home/due")
      .then((r) => {
        if (!r.ok) throw new Error(`/api/home/due responded ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setItems(data);
        setLoadError(false);
      })
      .catch(() => {
        setLoadError(true);
      });

    fetch("/api/home/stats")
      .then((r) => (r.ok ? r.json() : EMPTY_STATS))
      .then(setStats)
      .catch(() => setStats(EMPTY_STATS));
  }, []);

  return (
    <div className="home">
      <div className="stats stats-3">
        <button className="stat stat-due" onClick={() => setOpenModal("due")}>
          <span className="stat-num">{stats.dueToday}</span>
          <span className="stat-label">Due today</span>
        </button>
        <button className="stat stat-overdue" onClick={() => setOpenModal("overdue")}>
          <span className="stat-num">{stats.overdue}</span>
          <span className="stat-label">Overdue</span>
        </button>
        <button className="stat stat-completed" onClick={openCompleted}>
          <span className="stat-num">{stats.completedToday}</span>
          <span className="stat-label">Completed today</span>
        </button>
      </div>
      <WeeklyContentReminder />
      <AnnouncementsBoard />
      {openModal === "due" && (
        <HomeListModal
          title="Due today"
          emptyMessage="Nothing due today."
          items={dueToday}
          onNavigate={onNavigate}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "overdue" && (
        <HomeListModal
          title="Overdue"
          emptyMessage="Nothing overdue."
          items={overdue}
          onNavigate={onNavigate}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "completed" && (
        <HomeListModal
          title="Completed today"
          emptyMessage="Nothing completed today yet."
          items={completedList ?? []}
          onNavigate={onNavigate}
          onClose={() => setOpenModal(null)}
        />
      )}
      <DeadlinesPanel />
      <section className="board" aria-label="Everything due">
        <div className="section-head">
          <h2>Everything due</h2>
          <span className="board-count">{items.length}</span>
          <a
            className="section-head-link"
            href={ED_DIGEST_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ed digest ↗
          </a>
        </div>
        {loadError ? (
          <p className="board-empty">Couldn't load what's due.</p>
        ) : items.length === 0 ? (
          <p className="board-empty">Nothing due — you're all caught up.</p>
        ) : (
          <ul className="board-rows">
            {items.map((item, i) => {
              const color = item.overdueDays > 0 ? "red" : "gold";
              return (
                <li key={`${item.source}-${item.id}`} style={{ animationDelay: `${i * 60}ms` }}>
                  <button
                    className="board-row board-row-main"
                    style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                    onClick={() => onNavigate(item)}
                  >
                    <span className="tag">{item.overdueDays > 0 ? `${item.overdueDays}d late` : "due"}</span>
                    <span className="cat-tag" style={{ "--cat-color": SOURCE_COLOR[item.source] } as React.CSSProperties}>
                      {SOURCE_LABEL[item.source]}
                    </span>
                    <span className="board-title">{item.title}</span>
                    <span className="goal-deadline">{item.subtitle}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <GoogleCalendarEmbed />
    </div>
  );
}
