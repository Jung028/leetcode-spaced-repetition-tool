import React, { useEffect, useState } from "react";
import { buildTheorySchedule, type Category } from "./theory-content";
import type { TheoryProgress } from "./theory-db";
import { THEORY_LADDER } from "./theory-scheduling";
import { localToday } from "./scheduling";
import { sydneyWallClockToUtc, toGoogleUtcStamp } from "./sydneyTime";

// Pure and identical on server/client, so compute it once here rather than
// fetching it — only per-concept scheduling (rung, next_review, your answer)
// needs a network round trip.
const SCHEDULE = buildTheorySchedule();

const CATEGORY_COLORS: Record<Category, string> = {
  "System Design": "#ffa116",
  "Data Structures & Algorithms": "#00b8a3",
  "Distributed Systems": "#c084fc",
  Databases: "#38bdf8",
  "Networking & OS": "#ffc01e",
  Behavioral: "#ff375f",
};

interface Stats {
  dueCount: number;
  overdueCount: number;
  completedToday: number;
}

type Result = "correct" | "wrong";
type View = { name: "board" } | { name: "detail"; conceptDay: number };

const api = {
  due: () =>
    fetch("/api/theory/due").then(
      (r) => r.json() as Promise<{ due: TheoryProgress[]; stats: Stats }>,
    ),
  saveAnswer: (conceptDay: number, yourAnswer: string) =>
    fetch(`/api/theory/${conceptDay}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ yourAnswer }),
    }).then((r) => r.json() as Promise<TheoryProgress>),
  review: (conceptDay: number, result: Result) =>
    fetch(`/api/theory/${conceptDay}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }).then((r) => r.json() as Promise<TheoryProgress>),
};

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

// Same one-click quick-add popup leetcode-srs already uses for reviews (see
// openCalendarQuickAdd in frontend.tsx), pointed at the concept's newly
// scheduled next_review date — a different time slot (21:00-21:30) so it
// doesn't overlap the 22:00-00:00 leetcode review block on the same day.
function openTheoryCalendarAdd(category: string, question: string, nextReview: string) {
  const start = sydneyWallClockToUtc(nextReview, 21, 0);
  const end = sydneyWallClockToUtc(nextReview, 21, 30);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Theory review: ${category}`,
    dates: `${toGoogleUtcStamp(start)}/${toGoogleUtcStamp(end)}`,
    details: `${question}\n\n[theory-150]`,
  });
  window.open(
    `https://calendar.google.com/calendar/render?${params.toString()}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function TheoryRungMeter({ rung }: { rung: number }) {
  return (
    <span className="rung" title={`rung ${rung + 1} of ${THEORY_LADDER.length}`}>
      {THEORY_LADDER.map((_, i) => (
        <span key={i} className={i <= rung ? "rung-on" : "rung-off"} />
      ))}
    </span>
  );
}

function TheoryStats({ stats }: { stats: Stats }) {
  return (
    <div className="stats stats-3">
      <div className="stat stat-due">
        <span className="stat-num">{stats.dueCount}</span>
        <span className="stat-label">Due today</span>
      </div>
      <div className="stat stat-overdue">
        <span className="stat-num">{stats.overdueCount}</span>
        <span className="stat-label">Overdue</span>
      </div>
      <div className="stat stat-completed">
        <span className="stat-num">{stats.completedToday}</span>
        <span className="stat-label">Completed today</span>
      </div>
    </div>
  );
}

function TheoryDueBoard({
  due,
  today,
  onOpen,
}: {
  due: TheoryProgress[];
  today: string;
  onOpen: (conceptDay: number) => void;
}) {
  return (
    <section className="board" aria-label="Theory due today">
      <div className="section-head">
        <h2>Due today</h2>
        <span className="board-count">{due.length}</span>
      </div>
      {due.length === 0 ? (
        <p className="board-empty">Nothing due. The next concept appears tomorrow.</p>
      ) : (
        <ul className="board-rows">
          {due.map((entry, i) => {
            const concept = SCHEDULE[entry.concept_day - 1]!;
            const overdue = daysBetween(entry.next_review, today);
            const color = overdue > 0 ? "red" : "gold";
            return (
              <li key={entry.concept_day} style={{ animationDelay: `${i * 60}ms` }}>
                <button
                  className="board-row board-row-main"
                  style={{ "--urgency": `var(--${color})` } as React.CSSProperties}
                  onClick={() => onOpen(entry.concept_day)}
                >
                  <span className="tag">{overdue > 0 ? `${overdue}d late` : "due"}</span>
                  <span
                    className="cat-tag"
                    style={{ "--cat-color": CATEGORY_COLORS[concept.category] } as React.CSSProperties}
                  >
                    {concept.category}
                  </span>
                  <span className="board-title">{concept.question}</span>
                  <TheoryRungMeter rung={entry.rung} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function TheoryDetail({
  entry,
  onBack,
  onChanged,
}: {
  entry: TheoryProgress;
  onBack: () => void;
  onChanged: () => void;
}) {
  const concept = SCHEDULE[entry.concept_day - 1]!;
  // Always starts blank, even if a previous answer was saved to this
  // concept — reopening is for practicing recall again, not reading back
  // what you wrote last time.
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);

  const saveAnswer = () => {
    setRevealed(false);
    return api.saveAnswer(entry.concept_day, draft);
  };

  const review = async (result: Result) => {
    await saveAnswer();
    const updated = await api.review(entry.concept_day, result);
    openTheoryCalendarAdd(concept.category, concept.question, updated.next_review);
    onChanged();
    onBack();
  };

  return (
    <article className="detail theory-card">
      <header className="detail-head">
        <span
          className="cat-tag"
          style={{ "--cat-color": CATEGORY_COLORS[concept.category] } as React.CSSProperties}
        >
          {concept.category}
        </span>
        <TheoryRungMeter rung={entry.rung} />
      </header>

      <h2 className="theory-question">{concept.question}</h2>

      <label className="theory-answer-label" htmlFor="theory-answer">Your answer</label>
      <textarea
        id="theory-answer"
        className="theory-answer"
        rows={8}
        spellCheck={false}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write your own answer before revealing the model answer..."
      />
      <div className="btn-row">
        <button className="btn" onClick={saveAnswer}>Save answer</button>
      </div>

      {revealed ? (
        <div className="theory-model-answer">
          <div className="theory-model-answer-head">
            <h3>Model answer</h3>
            <button className="btn theory-toggle" onClick={() => setRevealed(false)}>Hide</button>
          </div>
          <p>{concept.answer}</p>
        </div>
      ) : (
        <button className="solution-cover" onClick={() => setRevealed(true)}>
          Model answer hidden — write your own answer first, then reveal
        </button>
      )}

      <div className="btn-row">
        <button className="btn btn-pass" onClick={() => review("correct")}>
          Correct · next in {THEORY_LADDER[Math.min(entry.rung + 1, THEORY_LADDER.length - 1)]}d
        </button>
        <button className="btn btn-fail" onClick={() => review("wrong")}>
          Wrong · repeat tomorrow
        </button>
        <span className="btn-spacer" />
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </article>
  );
}

export default function TheoryApp({
  openConceptDay,
  onOpened,
}: {
  openConceptDay?: number | null;
  onOpened?: () => void;
} = {}) {
  const today = localToday();
  const [view, setView] = useState<View>({ name: "board" });
  const [due, setDue] = useState<TheoryProgress[]>([]);
  const [stats, setStats] = useState<Stats>({ dueCount: 0, overdueCount: 0, completedToday: 0 });
  const [loaded, setLoaded] = useState(false);

  const refresh = () => api.due().then(({ due, stats }) => { setDue(due); setStats(stats); setLoaded(true); });
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (openConceptDay != null) {
      setView({ name: "detail", conceptDay: openConceptDay });
      onOpened?.();
    }
  }, [openConceptDay]);

  return (
    <div className="theory">
      <TheoryStats stats={stats} />
      <p className="rule-note">
        Correct climbs the ladder: 3 → 5 → 7 → 14 → 30 days. Wrong resets it, due tomorrow.
      </p>

      {view.name === "board" && (
        <TheoryDueBoard due={due} today={today} onOpen={(conceptDay) => setView({ name: "detail", conceptDay })} />
      )}

      {view.name === "detail" && (() => {
        if (!loaded) return <p className="board-empty">Loading…</p>;
        const entry = due.find((d) => d.concept_day === view.conceptDay);
        return entry ? (
          <TheoryDetail
            entry={entry}
            onBack={() => setView({ name: "board" })}
            onChanged={refresh}
          />
        ) : (
          <p className="board-empty">
            This concept isn't due anymore.{" "}
            <button className="btn" onClick={() => setView({ name: "board" })}>Back to board</button>
          </p>
        );
      })()}
    </div>
  );
}
