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
  codingElapsedSeconds: number;
  codingRunningSince: string | null;
  designElapsedSeconds: number;
  designRunningSince: string | null;
  completedAt: string | null;
  leetcodeProblemId: number | null;
  sdQuestion: SdQuestionView;
  sdAnswer: string;
  sdExcalidrawScene: string | null;
  sdRubricChecked: boolean[];
  sdRevealedAt: string | null;
}

class StaleSessionError extends Error {}

async function json<T>(res: Response): Promise<T> {
  if (res.status === 409) throw new StaleSessionError();
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

const api = {
  today: () => fetch("/api/interview/today").then((r) => json<InterviewSessionView>(r)),
  startCoding: (date: string) =>
    fetch(`/api/interview/today/start-coding?date=${encodeURIComponent(date)}`, { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  startDesign: (date: string) =>
    fetch(`/api/interview/today/start-design?date=${encodeURIComponent(date)}`, { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  pauseCoding: (date: string) =>
    fetch(`/api/interview/today/pause-coding?date=${encodeURIComponent(date)}`, { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  pauseDesign: (date: string) =>
    fetch(`/api/interview/today/pause-design?date=${encodeURIComponent(date)}`, { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  saveDesignAnswer: (date: string, answer: string, scene: string | null) =>
    fetch("/api/interview/today/design-answer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date, answer, scene }),
    }).then((r) => json<InterviewSessionView>(r)),
  reveal: (date: string) =>
    fetch(`/api/interview/today/reveal?date=${encodeURIComponent(date)}`, { method: "POST" }).then((r) => json<InterviewSessionView>(r)),
  saveRubric: (date: string, checked: boolean[]) =>
    fetch("/api/interview/today/rubric", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date, checked }),
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

// Renders the model answer's lightweight markdown: `#`..`###` headings, fenced
// ``` blocks (kept as un-wrapped monospace so ASCII diagrams survive), `---`
// rules, and `Draw:` / `[Image]` labels. Everything else is a pre-wrap paragraph.
function ModelAnswerText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push(
      <p key={key++} style={{ whiteSpace: "pre-wrap" }}>
        {para.join("\n")}
      </p>,
    );
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushPara();
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        code.push(lines[i] ?? "");
        i++;
      }
      blocks.push(
        <pre key={key++} className="ma-code">
          {code.join("\n")}
        </pre>,
      );
      continue;
    }

    if (trimmed === "---") {
      flushPara();
      blocks.push(<hr key={key++} className="ma-rule" />);
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushPara();
      const level = (heading[1] ?? "").length;
      const Tag = level <= 1 ? "h4" : level === 2 ? "h5" : "h6";
      blocks.push(<Tag key={key++}>{heading[2] ?? ""}</Tag>);
      continue;
    }

    if (trimmed === "Draw:" || trimmed === "[Draw:]" || trimmed.startsWith("[Image")) {
      flushPara();
      blocks.push(
        <p key={key++} className="ma-draw-label">
          {trimmed.replace(/[[\]:]/g, "")}
        </p>,
      );
      continue;
    }

    if (trimmed === "") {
      flushPara();
      continue;
    }

    para.push(line);
  }
  flushPara();

  return <>{blocks}</>;
}

function notifyOvertime(): void {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification("Time's up", { body: "You're now in overtime." });
}

function TimerControls({
  elapsedSeconds,
  runningSince,
  alertedRef,
  onStart,
  onPause,
}: {
  elapsedSeconds: number;
  runningSince: string | null;
  // Owned by the parent (InterviewApp), not this component, so switching
  // tabs — which unmounts/remounts TimerControls — doesn't reset the flag
  // and re-fire the alert for a part that's already in overtime.
  alertedRef: { current: boolean };
  onStart: () => void;
  onPause: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!runningSince) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [runningSince]);

  const liveSeconds = runningSince ? Math.floor((Date.now() - new Date(runningSince).getTime()) / 1000) : 0;
  const totalElapsed = elapsedSeconds + liveSeconds;
  const remaining = PART_SECONDS - totalElapsed;
  const overtime = remaining < 0;

  // Fires exactly once per session-part, the moment total elapsed time first
  // crosses into overtime — not on every re-render while overtime is true,
  // and not re-armed by a pause/resume or a tab switch away and back.
  useEffect(() => {
    if (overtime && !alertedRef.current) {
      alertedRef.current = true;
      notifyOvertime();
    }
  }, [overtime, alertedRef]);

  const displaySeconds = Math.abs(remaining);
  const mm = String(Math.floor(displaySeconds / 60)).padStart(2, "0");
  const ss = String(displaySeconds % 60).padStart(2, "0");

  return (
    <div className="interview-timer-controls">
      <span className={overtime ? "interview-timer interview-timer-over" : "interview-timer"}>
        {overtime ? "+" : ""}
        {mm}:{ss}
      </span>
      {runningSince ? (
        <button className="btn" onClick={onPause}>Pause</button>
      ) : (
        <button className="btn" onClick={onStart}>{totalElapsed > 0 ? "Resume" : "Start"}</button>
      )}
    </div>
  );
}

type Part = "coding" | "design";

export default function InterviewApp() {
  const [session, setSession] = useState<InterviewSessionView | null>(null);
  const [part, setPart] = useState<Part>("coding");
  const [draft, setDraft] = useState("");
  const [scene, setScene] = useState<string | null>(null);
  // Post-reveal view controls: local only, so you can hide the answer again and
  // keep practicing, or put it beside your own answer to compare.
  const [answerVisible, setAnswerVisible] = useState(true);
  const [splitView, setSplitView] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codingAlertedRef = useRef(false);
  const designAlertedRef = useRef(false);

  useEffect(() => {
    codingAlertedRef.current = false;
    designAlertedRef.current = false;
    setAnswerVisible(true);
    setSplitView(false);
  }, [session?.date]);

  const refresh = async () => {
    const s = await api.today();
    setSession(s);
    setDraft(s.sdAnswer);
    setScene(s.sdExcalidrawScene);
    if (s.leetcodeProblemId === null) setPart("design");
  };

  const runOrRefresh = async (fn: () => Promise<InterviewSessionView>) => {
    try {
      setSession(await fn());
    } catch (e) {
      if (e instanceof StaleSessionError) {
        await refresh();
        return;
      }
      throw e;
    }
  };

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    refresh();
  }, []);

  const scheduleSave = (nextAnswer: string, nextScene: string | null) => {
    if (!session) return;
    const date = session.date;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      runOrRefresh(() => api.saveDesignAnswer(date, nextAnswer, nextScene));
    }, 800);
  };

  const reveal = async () => {
    if (!session) return;
    await runOrRefresh(() => api.reveal(session.date));
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
    await runOrRefresh(() => api.saveRubric(session.date, next));
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
            Part 1 · Coding
          </button>
        )}
        <button className={part === "design" ? "tab tab-active" : "tab"} onClick={() => setPart("design")}>
          Part 2 · System Design
        </button>
      </nav>

      {part === "coding" && session.leetcodeProblemId !== null && (
        <TimerControls
          elapsedSeconds={session.codingElapsedSeconds}
          runningSince={session.codingRunningSince}
          alertedRef={codingAlertedRef}
          onStart={() => runOrRefresh(() => api.startCoding(session.date))}
          onPause={() => runOrRefresh(() => api.pauseCoding(session.date))}
        />
      )}
      {part === "design" && (
        <TimerControls
          elapsedSeconds={session.designElapsedSeconds}
          runningSince={session.designRunningSince}
          alertedRef={designAlertedRef}
          onStart={() => runOrRefresh(() => api.startDesign(session.date))}
          onPause={() => runOrRefresh(() => api.pauseDesign(session.date))}
        />
      )}

      {part === "coding" && session.leetcodeProblemId !== null && (
        <Detail id={session.leetcodeProblemId} today={session.date} onBack={() => setPart("design")} onChanged={refresh} />
      )}

      {part === "design" && (
        <div className="exam-question">
          <h2>{session.sdQuestion.company}</h2>
          <PromptText text={session.sdQuestion.prompt} />

          {revealed && (
            <div className="interview-answer-controls">
              <button className="btn" onClick={() => setAnswerVisible((v) => !v)}>
                {answerVisible ? "Hide answer" : "Show answer"}
              </button>
              <button className="btn" disabled={!answerVisible} onClick={() => setSplitView((v) => !v)}>
                {splitView ? "Stacked view" : "Side by side"}
              </button>
            </div>
          )}

          <div className={revealed && answerVisible && splitView ? "interview-answer-split" : undefined}>
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
            {revealed && answerVisible && (
              <div className="theory-model-answer interview-model-answer">
                <h3>Model answer</h3>
                <ModelAnswerText text={session.sdQuestion.modelAnswer} />
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
        </div>
      )}
    </>
  );
}
