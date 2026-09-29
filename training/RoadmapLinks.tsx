import React from "react";

const CLUB_CALENDAR_URL =
  "https://docs.google.com/spreadsheets/d/1ymM5Mci6aOUXHF5jVVyKOlWowfYm9ISFwXCvPYOl5Ho/edit?gid=433256204#gid=433256204";
const CLUB_PLAN_URL =
  "https://docs.google.com/spreadsheets/d/1ymM5Mci6aOUXHF5jVVyKOlWowfYm9ISFwXCvPYOl5Ho/edit?gid=534939754#gid=534939754";
const RACE_ROADMAP_URL = "/assets/race-roadmap-2026-2031.xlsx";

interface RoadmapLink {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

const LINKS: RoadmapLink[] = [
  {
    title: "Club training calendar",
    description: "USYD 2026 Master Template — month view with race markers, blocks and down weeks",
    href: CLUB_CALENDAR_URL,
    linkLabel: "Open in Google Sheets",
  },
  {
    title: "Club training plan",
    description: "USYD 2026 Master Template — week-by-week running sessions, month by month",
    href: CLUB_PLAN_URL,
    linkLabel: "Open in Google Sheets",
  },
  {
    title: "5-Year Race Roadmap (2026–2031)",
    description: "SEA Games, Powerman and KL Marathon roadmap, year by year",
    href: RACE_ROADMAP_URL,
    linkLabel: "Download the spreadsheet",
  },
];

export default function RoadmapLinks() {
  return (
    <div className="roadmap-links">
      <section className="board" aria-label="Race calendar and roadmap">
        <div className="section-head">
          <h2>Race calendar &amp; roadmap</h2>
        </div>
        <ul className="board-rows">
          {LINKS.map((link, i) => (
            <li key={link.title} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="board-row board-row-main">
                <span className="board-title">{link.title}</span>
                <span className="goal-deadline">{link.description}</span>
                <a className="btn btn-primary" href={link.href} target="_blank" rel="noreferrer">
                  {link.linkLabel}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
