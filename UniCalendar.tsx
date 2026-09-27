import React, { useMemo } from "react";

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
        Adam's primary calendar and university timetable, for reference.
      </p>
      <div className="gcal-frame">
        <iframe src={src} title="Google Calendar — LeetCode reviews and study timetable" />
      </div>
    </section>
  );
}

function WallCalendar() {
  return (
    <section className="calendar" aria-label="Semester wall calendar">
      <div className="section-head">
        <h2>Semester wall calendar</h2>
        <a
          className="section-head-link"
          href="/assets/student-wall-calendar.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in new tab ↗
        </a>
      </div>
      <div className="gcal-frame">
        <iframe src="/assets/student-wall-calendar.pdf" title="Student wall calendar" />
      </div>
    </section>
  );
}

export default function UniCalendar() {
  return (
    <div className="uni-calendar">
      <GoogleCalendarEmbed />
      <WallCalendar />
    </div>
  );
}
