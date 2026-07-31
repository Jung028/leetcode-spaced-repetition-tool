// HomeApp.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { DueItem, DueSource } from "./home-api";

const SOURCE_LABEL: Record<DueSource, string> = {
  leetcode: "LeetCode",
  theory: "Theory",
  goals: "Goals",
};

const SOURCE_COLOR: Record<DueSource, string> = {
  leetcode: "#ffa116",
  theory: "#00b8a3",
  goals: "#c084fc",
};

// Same two calendars leetcode-srs already overlays elsewhere: Adam's
// primary calendar and his university timetable import.
const EMBEDDED_CALENDARS = [
  { id: "aedamjung@gmail.com", color: "#F4511E" },
  { id: "crc3t59ndtkt77bdu0j6tv35ant0erjl@import.calendar.google.com", color: "#039BE5" },
];

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

export default function HomeApp({ onNavigate }: { onNavigate: (item: DueItem) => void }) {
  const [items, setItems] = useState<DueItem[]>([]);
  const [loadError, setLoadError] = useState(false);

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
  }, []);

  return (
    <div className="home">
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
