// HomeApp.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { DueItem, DueSource, HomeStats } from "./home-api";
import AnnouncementsBoard from "./AnnouncementsBoard";
import { ED_DIGEST_URL } from "./ed-digest-link";

const EMPTY_STATS: HomeStats = { dueToday: 0, overdue: 0, completedToday: 0 };

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

// Jump-nav for the Home page's long scroll. Each button scrolls its target
// section into view; targets carry matching ids in the render below.
function HomeToc() {
  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Smooth scrolling is unreliable here (a scroll handler elsewhere cancels
    // in-progress smooth scrolls), so jump straight to the section.
    el.scrollIntoView({ block: "start" });
  };
  return (
    <nav className="home-toc" aria-label="Jump to section">
      <span className="home-toc-label">Jump to</span>
      <button type="button" className="home-toc-link" onClick={() => jump("home-announcements")}>
        Announcements
      </button>
      <button type="button" className="home-toc-link" onClick={() => jump("home-everything-due")}>
        Everything due
      </button>
      <button type="button" className="home-toc-link" onClick={() => jump("home-calendar")}>
        Calendar
      </button>
    </nav>
  );
}

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
      <HomeToc />
      <WeeklyContentReminder />
      <div id="home-announcements">
        <AnnouncementsBoard />
      </div>
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
      <section className="board" id="home-everything-due" aria-label="Everything due">
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
      <div id="home-calendar">
        <GoogleCalendarEmbed />
      </div>
    </div>
  );
}
