import { useState } from "react";
import { localToday } from "../shared/scheduling";
import { groupRacesByMonth, raceDayLabel, racesForYear } from "./roadmap";
import type { RaceEntry, RoadmapData } from "./roadmap";

function RaceCard({ race }: { race: RaceEntry }) {
  return (
    <div className={race.entered ? "card race-card race-card-entered" : "card race-card"}>
      <div className="card-top">
        <span className="card-meta">{race.date ? raceDayLabel(race.date) : "Date TBC"}</span>
        {race.priority && <span className="tag">{race.priority} race</span>}
      </div>
      <div className="card-title">{race.name}</div>
      {race.location && <div className="card-meta">{race.location}</div>}
      {race.note && <div className="card-meta">{race.note}</div>}
      {race.entered && <span className="race-entered">Entered · {race.entered}</span>}
    </div>
  );
}

export default function RaceCalendar({ data }: { data: RoadmapData }) {
  const years = data.rows.map((row) => row.year);
  const thisYear = localToday().slice(0, 4);
  const [year, setYear] = useState(years.includes(thisYear) ? thisYear : (years[0] ?? thisYear));
  const row = data.rows.find((r) => r.year === year);
  const races = racesForYear(data.rows, data.races, year);

  return (
    <div className="race-calendar">
      <div className="section-head">
        <label className="race-year">
          <span className="card-kicker">Year</span>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <h2>{year} competitions</h2>
        <span className="board-count">{races.length}</span>
      </div>

      {races.length === 0 ? (
        <p className="board-empty">No competitions listed for {year} yet.</p>
      ) : (
        <div className="race-strip">
          {groupRacesByMonth(races).map((month) => (
            <section key={month.label} className="race-month">
              <h3 className="race-month-label">{month.label}</h3>
              <ul className="race-month-cards">
                {month.races.map((race) => (
                  <li key={`${race.name}-${race.date ?? "tbc"}`}>
                    <RaceCard race={race} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {row && (
        <dl className="race-glance">
          <div><dt>Phase</dt><dd>{row.phase}</dd></div>
          <div><dt>Age</dt><dd>{row.age}</dd></div>
          <div><dt>Main goal</dt><dd>{row.mainGoal}</dd></div>
          <div><dt>Run targets</dt><dd>{row.runTargets}</dd></div>
          <div><dt>Bike target</dt><dd>{row.bikeTarget}</dd></div>
          <div><dt>Status</dt><dd>{row.status || "—"}</dd></div>
        </dl>
      )}
    </div>
  );
}
