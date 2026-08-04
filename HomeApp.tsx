// HomeApp.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { DueItem, DueSource, HomeStats } from "./home-api";

const EMPTY_STATS: HomeStats = { dueToday: 0, overdue: 0, completedToday: 0 };

const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  theory: "Theory",
  goals: "Goals",
  exam: "Exam",
};

const SOURCE_COLOR: Record<DueSource, string> = {
  leetcode: "#ffa116",
  theory: "#00b8a3",
  goals: "#c084fc",
  exam: "#ff375f",
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
        Add/Passed/Failed opens a one-click Google Calendar quick-add tab — click Save there to add it.
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
      <section className="board" aria-label="Everything due">
        <div className="section-head">
          <h2>Everything due</h2>
          <span className="board-count">{items.length}</span>
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
