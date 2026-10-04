import React, { useEffect, useState } from "react";
import RaceCalendar from "./RaceCalendar";
import type { RoadmapData } from "./roadmap";

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
      <section className="board" aria-label="Race calendar">
        <div className="section-head">
          <h2>Race calendar</h2>
        </div>

        {failed && <p className="board-empty">Couldn't load the roadmap sheet right now.</p>}
        {!failed && !data && <p className="board-empty">Loading…</p>}

        {data && (
          <>
            <RaceCalendar data={data} />

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
