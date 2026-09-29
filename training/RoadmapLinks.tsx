import React, { useEffect, useState } from "react";

interface RoadmapRow {
  year: string;
  age: string;
  phase: string;
  mainGoal: string;
  aRaces: string;
  aRaceCount: string;
  runTargets: string;
  bikeTarget: string;
  status: string;
}

interface RoadmapData {
  rows: RoadmapRow[];
  notes: string[];
}

export default function RoadmapLinks() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/training/roadmap")
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  return (
    <div className="roadmap-links">
      <section className="board" aria-label="5-Year Race Roadmap">
        <div className="section-head">
          <h2>5-Year Race Roadmap (2026–2031)</h2>
        </div>

        {failed && <p className="board-empty">Couldn't load the roadmap sheet right now.</p>}
        {!failed && !data && <p className="board-empty">Loading…</p>}

        {data && (
          <>
            <div className="roadmap-table-wrap">
              <table className="roadmap-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Age</th>
                    <th>Phase</th>
                    <th>Main goal</th>
                    <th>A races</th>
                    <th>A-race count</th>
                    <th>Run targets</th>
                    <th>Bike target</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.year}>
                      <td>{row.year}</td>
                      <td>{row.age}</td>
                      <td>{row.phase}</td>
                      <td>{row.mainGoal}</td>
                      <td>{row.aRaces}</td>
                      <td>{row.aRaceCount}</td>
                      <td>{row.runTargets}</td>
                      <td>{row.bikeTarget}</td>
                      <td>{row.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.notes.length > 0 && (
              <ul className="roadmap-notes">
                {data.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
