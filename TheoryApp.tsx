import React, { useEffect, useState } from "react";
import type { Category } from "./theory-content";
import type { TheoryAnswerFormat, TheoryProgress } from "./theory-db";
import { THEORY_LADDER } from "./theory-scheduling";
import { localToday } from "./scheduling";
import { sydneyWallClockToUtc, toGoogleUtcStamp } from "./sydneyTime";

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
type View = { name: "board" } | { name: "detail"; conceptDay: number } | { name: "addContent"; conceptDay: number; category: string };

// Fetch responses are trusted only after this check — a non-2xx response
// (e.g. the 400 the server returns on validation failure) still parses as
// valid JSON, so without this every failed request would silently look
// like a success to the caller.
async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

// Shared fallback so every catch site shows something readable even if the
// rejection wasn't an Error (e.g. a network failure) rather than leaving the
// user staring at a silently-failed action.
const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong.";

const api = {
  due: () =>
    fetch("/api/theory/due").then((r) => json<{ due: TheoryProgress[]; stats: Stats }>(r)),
  nextBlank: () =>
    fetch("/api/theory/next-blank").then((r) => json<{ conceptDay: number; category: string } | null>(r)),
  saveContent: (conceptDay: number, question: string, answer: string, answerFormat: TheoryAnswerFormat) =>
    fetch(`/api/theory/${conceptDay}/content`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, answer, answerFormat }),
    }).then((r) => json<TheoryProgress>(r)),
  saveAnswer: (conceptDay: number, yourAnswer: string) =>
    fetch(`/api/theory/${conceptDay}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ yourAnswer }),
    }).then((r) => json<TheoryProgress>(r)),
  review: (conceptDay: number, result: Result) =>
    fetch(`/api/theory/${conceptDay}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    }).then((r) => json<TheoryProgress>(r)),
  completedToday: () => fetch("/api/theory/completed-today").then((r) => json<TheoryProgress[]>(r)),
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

function TheoryListModal({
  title,
  emptyMessage,
  entries,
  onOpen,
  onClose,
}: {
  title: string;
  emptyMessage: string;
  entries: TheoryProgress[];
  onOpen: (conceptDay: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sorted = [...entries].sort((a, b) => a.next_review.localeCompare(b.next_review));

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
            {sorted.map((entry) => (
              <li key={entry.concept_day}>
                <button
                  className="modal-row"
                  onClick={() => {
                    onOpen(entry.concept_day);
                    onClose();
                  }}
                >
                  <span className="modal-row-date">{entry.next_review}</span>
                  <span
                    className="cat-tag"
                    style={{ "--cat-color": CATEGORY_COLORS[entry.category as Category] } as React.CSSProperties}
                  >
                    {entry.category}
                  </span>
                  <span className="modal-row-title">{entry.question}</span>
                  <TheoryRungMeter rung={entry.rung} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type StatModal = "due" | "overdue" | "completed" | null;

function TheoryStats({
  stats,
  due,
  today,
  onOpen,
  onError,
}: {
  stats: Stats;
  due: TheoryProgress[];
  today: string;
  onOpen: (conceptDay: number) => void;
  onError: (message: string | null) => void;
}) {
  const [openModal, setOpenModal] = useState<StatModal>(null);
  const [completedList, setCompletedList] = useState<TheoryProgress[] | null>(null);

  // Reset the cached completed-today list whenever the underlying count
  // changes (e.g. after a review elsewhere on the board), so a stale list
  // isn't shown next time this modal is reopened without a tab switch.
  useEffect(() => {
    setCompletedList(null);
  }, [stats.completedToday]);

  const overdue = due.filter((entry) => entry.next_review < today);

  const openCompleted = () => {
    setOpenModal("completed");
    if (completedList === null) {
      onError(null);
      api
        .completedToday()
        .then(setCompletedList)
        .catch((err) => onError(errorMessage(err)));
    }
  };

  return (
    <>
      <div className="stats stats-3">
        <button className="stat stat-due" onClick={() => setOpenModal("due")}>
          <span className="stat-num">{stats.dueCount}</span>
          <span className="stat-label">Due today</span>
        </button>
        <button className="stat stat-overdue" onClick={() => setOpenModal("overdue")}>
          <span className="stat-num">{stats.overdueCount}</span>
          <span className="stat-label">Overdue</span>
        </button>
        <button className="stat stat-completed" onClick={openCompleted}>
          <span className="stat-num">{stats.completedToday}</span>
          <span className="stat-label">Completed today</span>
        </button>
      </div>
      {openModal === "due" && (
        <TheoryListModal
          title="Due today"
          emptyMessage="Nothing due today."
          entries={due}
          onOpen={onOpen}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "overdue" && (
        <TheoryListModal
          title="Overdue"
          emptyMessage="Nothing overdue."
          entries={overdue}
          onOpen={onOpen}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "completed" && (
        <TheoryListModal
          title="Completed today"
          emptyMessage="Nothing completed today yet."
          entries={completedList ?? []}
          onOpen={onOpen}
          onClose={() => setOpenModal(null)}
        />
      )}
    </>
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
                    style={{ "--cat-color": CATEGORY_COLORS[entry.category as Category] } as React.CSSProperties}
                  >
                    {entry.category}
                  </span>
                  <span className="board-title">{entry.question}</span>
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

const ANSWER_FIELD_LABEL: Record<TheoryAnswerFormat, string> = {
  text: "Answer",
  image: "Image URL",
  link: "Link URL",
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

function AddTheoryContentForm({
  conceptDay,
  category,
  onCancel,
  onSaved,
}: {
  conceptDay: number;
  category: string;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [format, setFormat] = useState<TheoryAnswerFormat>("text");
  const [error, setError] = useState("");

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) {
          setError("Question and answer are both required.");
          return;
        }
        if (format !== "text" && !isValidUrl(answer.trim())) {
          setError(`Answer must be a valid http(s) URL when format is '${format}'.`);
          return;
        }
        try {
          await api.saveContent(conceptDay, question.trim(), answer.trim(), format);
          await onSaved();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to save.");
        }
      }}
    >
      <span
        className="cat-tag"
        style={{ "--cat-color": CATEGORY_COLORS[category as Category] } as React.CSSProperties}
      >
        {category}
      </span>
      <label>
        Question
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} autoFocus />
      </label>
      <label>
        Answer format
        <select value={format} onChange={(e) => setFormat(e.target.value as TheoryAnswerFormat)}>
          <option value="text">Text</option>
          <option value="image">Image (URL)</option>
          <option value="link">Link (URL)</option>
        </select>
      </label>
      <label>
        {ANSWER_FIELD_LABEL[format]}
        {format === "text" ? (
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} />
        ) : (
          <input type="url" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="https://..." />
        )}
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">Save concept {conceptDay}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function TheoryDetail({
  entry,
  onBack,
  onChanged,
  onError,
}: {
  entry: TheoryProgress;
  onBack: () => void;
  onChanged: () => void;
  onError: (message: string | null) => void;
}) {
  // Always starts blank, even if a previous answer was saved to this
  // concept — reopening is for practicing recall again, not reading back
  // what you wrote last time.
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);

  // Saving reveals the model answer immediately (so you can compare right
  // away) and clears the draft — the answer's already saved server-side,
  // no need to keep looking at what you just typed.
  const saveAnswer = async () => {
    await api.saveAnswer(entry.concept_day, draft);
    setRevealed(true);
    setDraft("");
  };

  const review = async (result: Result) => {
    await saveAnswer();
    const updated = await api.review(entry.concept_day, result);
    openTheoryCalendarAdd(entry.category, entry.question, updated.next_review);
    onChanged();
    onBack();
  };

  // saveAnswer/review are also called from each other (review awaits
  // saveAnswer directly, so a failure there still stops review from
  // continuing) — these wrappers are only for the button click handlers,
  // so a rejection surfaces in the top-level error banner instead of
  // becoming an unhandled rejection.
  const handleSaveAnswer = () => {
    onError(null);
    saveAnswer().catch((err) => onError(errorMessage(err)));
  };

  const handleReview = (result: Result) => {
    onError(null);
    review(result).catch((err) => onError(errorMessage(err)));
  };

  return (
    <article className="detail theory-card">
      <header className="detail-head">
        <span
          className="cat-tag"
          style={{ "--cat-color": CATEGORY_COLORS[entry.category as Category] } as React.CSSProperties}
        >
          {entry.category}
        </span>
        <TheoryRungMeter rung={entry.rung} />
      </header>

      <h2 className="theory-question">{entry.question}</h2>

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
        <button className="btn" onClick={handleSaveAnswer}>Save answer</button>
      </div>

      {revealed ? (
        <div className="theory-model-answer">
          <div className="theory-model-answer-head">
            <h3>Model answer</h3>
            <button className="btn theory-toggle" onClick={() => setRevealed(false)}>Hide</button>
          </div>
          {entry.answer_format === "image" ? (
            <img className="theory-model-answer-image" src={entry.answer} alt="Model answer" />
          ) : entry.answer_format === "link" ? (
            <a
              className="theory-model-answer-link"
              href={entry.answer}
              target="_blank"
              rel="noopener noreferrer"
            >
              {entry.answer}
            </a>
          ) : (
            <p>{entry.answer}</p>
          )}
        </div>
      ) : (
        <button className="solution-cover" onClick={() => setRevealed(true)}>
          Model answer hidden — write your own answer first, then reveal
        </button>
      )}

      <div className="btn-row">
        <button className="btn btn-pass" onClick={() => handleReview("correct")}>
          Correct · next in {THEORY_LADDER[Math.min(entry.rung + 1, THEORY_LADDER.length - 1)]}d
        </button>
        <button className="btn btn-fail" onClick={() => handleReview("wrong")}>
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
  const [nextBlankNotice, setNextBlankNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    return api
      .due()
      .then(({ due, stats }) => { setDue(due); setStats(stats); setLoaded(true); })
      .catch((err) => setError(errorMessage(err)));
  };
  useEffect(() => { refresh(); }, []);

  const startAddingContent = async () => {
    setError(null);
    try {
      const slot = await api.nextBlank();
      if (slot === null) {
        setNextBlankNotice("All 150 concepts have content.");
        return;
      }
      setNextBlankNotice(null);
      setView({ name: "addContent", conceptDay: slot.conceptDay, category: slot.category });
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  useEffect(() => {
    if (openConceptDay != null) {
      setView({ name: "detail", conceptDay: openConceptDay });
      onOpened?.();
    }
  }, [openConceptDay]);

  return (
    <div className="theory">
      <TheoryStats
        stats={stats}
        due={due}
        today={today}
        onOpen={(conceptDay) => setView({ name: "detail", conceptDay })}
        onError={setError}
      />
      {error && <p className="form-error">{error}</p>}
      <p className="rule-note">
        Correct climbs the ladder: 3 → 5 → 7 → 14 → 30 days. Wrong resets it, due tomorrow.
      </p>

      {view.name === "board" && (
        <>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={startAddingContent}>+ Add theory</button>
          </div>
          {nextBlankNotice && <p className="board-empty">{nextBlankNotice}</p>}
          <TheoryDueBoard due={due} today={today} onOpen={(conceptDay) => setView({ name: "detail", conceptDay })} />
        </>
      )}

      {view.name === "addContent" && (
        <AddTheoryContentForm
          conceptDay={view.conceptDay}
          category={view.category}
          onCancel={() => setView({ name: "board" })}
          onSaved={async () => {
            await refresh();
            setView({ name: "board" });
          }}
        />
      )}

      {view.name === "detail" && (() => {
        if (!loaded) return <p className="board-empty">Loading…</p>;
        const entry = due.find((d) => d.concept_day === view.conceptDay);
        return entry ? (
          <TheoryDetail
            entry={entry}
            onBack={() => setView({ name: "board" })}
            onChanged={refresh}
            onError={setError}
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
