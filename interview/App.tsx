import React, { useEffect, useRef, useState } from "react";
import { Detail } from "../frontend";
import { ExcalidrawCanvas } from "./ExcalidrawCanvas";

interface SdQuestionView {
  id: string;
  company: string;
  prompt: string;
  modelAnswer: string;
  rubric: string[];
}

interface InterviewSessionView {
  date: string;
  codingStartedAt: string | null;
  designStartedAt: string | null;
  completedAt: string | null;
  leetcodeProblemId: number | null;
  sdQuestion: SdQuestionView;
  sdAnswer: string;
  sdExcalidrawScene: string | null;
  sdRubricChecked: boolean[];
  sdRevealedAt: string | null;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

const api = {
  today: () => fetch("/api/interview/today").then((r) => json<InterviewSessionView>(r)),
  startCoding: () => fetch("/api/interview/today/start-coding", { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  startDesign: () => fetch("/api/interview/today/start-design", { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  saveDesignAnswer: (answer: string, scene: string | null) =>
    fetch("/api/interview/today/design-answer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answer, scene }),
    }).then((r) => json<InterviewSessionView>(r)),
  reveal: () => fetch("/api/interview/today/reveal", { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  saveRubric: (checked: boolean[]) =>
    fetch("/api/interview/today/rubric", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checked }),
    }).then((r) => json<InterviewSessionView>(r)),
};

const PART_SECONDS = 45 * 60;

function looksLikeCode(block: string): boolean {
  return block.includes("\n") && /[{}()_]|:=|==|=>|\b(def|class|import|return)\b/.test(block);
}

function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((block, i) =>
        looksLikeCode(block) ? (
          <pre key={i} className="exam-code-block">{block}</pre>
        ) : (
          <p key={i} style={{ whiteSpace: "pre-wrap" }}>{block}</p>
        ),
      )}
    </>
  );
}

function notifyOvertime(): void {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification("Time's up", { body: "You're now in overtime." });
}

function Countdown({ startedAt }: { startedAt: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  const alertedRef = useRef(false);
  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);
  // Reset the one-time-alert flag whenever a new timer starts, so the other
  // part's timer (or a restarted one) can alert independently.
  useEffect(() => {
    alertedRef.current = false;
  }, [startedAt]);
  const elapsedSeconds = startedAt ? Math.floor((now - new Date(startedAt).getTime()) / 1000) : 0;
  const remaining = PART_SECONDS - elapsedSeconds;
  const overtime = startedAt !== null && remaining < 0;
  // Fires exactly once per timer instance, at the moment it first crosses
  // into overtime — not on every re-render while overtime is true.
  useEffect(() => {
    if (overtime && !alertedRef.current) {
      alertedRef.current = true;
      notifyOvertime();
    }
  }, [overtime]);
  if (!startedAt) return null;
  const displaySeconds = Math.abs(remaining);
  const mm = String(Math.floor(displaySeconds / 60)).padStart(2, "0");
  const ss = String(displaySeconds % 60).padStart(2, "0");
  return (
    <span className={overtime ? "interview-timer interview-timer-over" : "interview-timer"}>
      {overtime ? "+" : ""}
      {mm}:{ss}
    </span>
  );
}

type Part = "coding" | "design";

export default function InterviewApp() {
  const [session, setSession] = useState<InterviewSessionView | null>(null);
  const [part, setPart] = useState<Part>("coding");
  const [draft, setDraft] = useState("");
  const [scene, setScene] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = async () => {
    const s = await api.today();
    setSession(s);
    setDraft(s.sdAnswer);
    setScene(s.sdExcalidrawScene);
    if (s.leetcodeProblemId === null) setPart("design");
  };
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    refresh();
  }, []);

  useEffect(() => {
    if (!session) return;
    if (part === "coding" && session.leetcodeProblemId !== null && !session.codingStartedAt) {
      api.startCoding().then(setSession);
    }
    if (part === "design" && !session.designStartedAt) {
      api.startDesign().then(setSession);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part, session?.date]);

  const scheduleSave = (nextAnswer: string, nextScene: string | null) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const updated = await api.saveDesignAnswer(nextAnswer, nextScene);
      setSession(updated);
    }, 800);
  };

  const reveal = async () => {
    const updated = await api.reveal();
    setSession(updated);
  };

  const toggleRubric = async (index: number) => {
    if (!session) return;
    // sdRubricChecked starts as `[]` from the server until the first save, so spreading it
    // directly and indexing in can leave holes before `index` (e.g. checking item 2 first
    // produces `[<2 empty slots>, true]`). JSON.stringify serializes holes as `null`, which
    // fails the server's boolean-array validation. Build a full-length array of real
    // booleans first so every element is always `true`/`false`, never a hole.
    const next = session.sdQuestion.rubric.map((_, i) => session.sdRubricChecked[i] ?? false);
    next[index] = !next[index];
    const updated = await api.saveRubric(next);
    setSession(updated);
  };

  if (!session) return <p className="board-empty">Loading…</p>;

  const revealed = session.sdRevealedAt !== null;

  return (
    <>
      <header className="masthead">
        <span className="wordmark">Daily Interview Practice</span>
        <span className="masthead-date">{session.date}</span>
        {session.completedAt && <span className="cat-tag">Completed</span>}
      </header>

      <nav className="tabs interview-part-tabs" aria-label="Session parts">
        {session.leetcodeProblemId !== null && (
          <button className={part === "coding" ? "tab tab-active" : "tab"} onClick={() => setPart("coding")}>
            Part 1 · Coding <Countdown startedAt={session.codingStartedAt} />
          </button>
        )}
        <button className={part === "design" ? "tab tab-active" : "tab"} onClick={() => setPart("design")}>
          Part 2 · System Design <Countdown startedAt={session.designStartedAt} />
        </button>
      </nav>

      {part === "coding" && session.leetcodeProblemId !== null && (
        <Detail id={session.leetcodeProblemId} today={session.date} onBack={() => {}} onChanged={refresh} />
      )}

      {part === "design" && (
        <div className="exam-question">
          <h2>{session.sdQuestion.company}</h2>
          <PromptText text={session.sdQuestion.prompt} />
          <textarea
            className="theory-answer"
            rows={8}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              scheduleSave(e.target.value, scene);
            }}
            placeholder="Write your approach: requirements, high-level design, data model, trade-offs..."
          />
          <ExcalidrawCanvas
            initialScene={scene}
            onChange={(nextScene) => {
              setScene(nextScene);
              scheduleSave(draft, nextScene);
            }}
          />
          {!revealed && (
            <div className="btn-row">
              <button className="btn" disabled={draft.trim().length === 0} onClick={reveal}>
                Reveal model answer
              </button>
            </div>
          )}
          {revealed && (
            <div className="theory-model-answer">
              <h3>Model answer</h3>
              <PromptText text={session.sdQuestion.modelAnswer} />
              <h3>Self-assessment</h3>
              <ul className="interview-rubric">
                {session.sdQuestion.rubric.map((item, i) => (
                  <li key={item}>
                    <label>
                      <input type="checkbox" checked={session.sdRubricChecked[i] ?? false} onChange={() => toggleRubric(i)} />
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
