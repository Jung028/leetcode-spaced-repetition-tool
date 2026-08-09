# Exam History / Retake Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-course History view inside the Modules (exam) tab that lists every visible week's papers regardless of submission status, and lets the user retake any submitted paper unlimited times — each retake a fresh attempt, past attempts kept and shown, feeding the existing spaced-repetition review system exactly like a first attempt.

**Architecture:** One new table (`exam_attempt_history`) plus one new `exam-db.ts` function (`retakeExamPaper`) that snapshots the current `exam_papers` row into it and resets `exam_papers`/`exam_answers` in place — after that, the *existing, unmodified* answer/grade/submit pipeline handles the retake exactly like a first attempt. A new `GET /api/exam/:course/history` route reuses the existing `groupExamPapersByWeek` (dropping its `due`-route caller's "hide fully-submitted weeks" filter) so week-aggregation logic isn't duplicated. `ExamApp.tsx` gets a new "History" view reusing the existing `PaperLoader`/`PaperView` components for actually retaking a paper.

**Tech Stack:** Bun, TypeScript, React 19, `bun:sqlite`, `bun test`.

## Global Constraints

- No changes to `exam_review_items`/`exam_review_log` schema or to `exam-scheduling.ts`'s spaced-repetition algorithm — retakes reuse `submitExamPaper`'s existing review-item creation untouched.
- No retake limits, cooldowns, or attempt caps.
- No per-question attempt history — only paper-level score history.
- History and retake are Modules-tab-only — no Home-tab exposure.
- Every task ends green on `bun test` before moving to the next, and `tsc --noEmit` stays clean (this project's continuous-testing requirement, per `CLAUDE.md`).

---

### Task 1: `exam_attempt_history` table + `retakeExamPaper()` + `listExamAttemptHistory()`

**Files:**
- Modify: `exam-db.ts`
- Test: `exam-db.test.ts`

**Interfaces:**
- Consumes: `getExamPaperRow(db, course, week, paperNumber): ExamPaperRow | null` (existing, `exam-db.ts:318`).
- Produces (for Task 2 and the frontend to consume):
  - `export interface ExamAttemptSummary { attemptNumber: number; submittedAt: string; scoreCorrect: number; scoreTotal: number }`
  - `export type RetakeResult = { ok: true } | { ok: false; reason: "not_found" | "not_submitted" }`
  - `export function retakeExamPaper(db: Database, course: string, week: number, paperNumber: number): RetakeResult`
  - `export function listExamAttemptHistory(db: Database, course: string, week: number, paperNumber: number): ExamAttemptSummary[]`

- [ ] **Step 1: Write the failing tests**

Add to `exam-db.test.ts` (after the existing `submitExamPaper`/review tests):

```ts
import { retakeExamPaper, listExamAttemptHistory } from "./exam-db";

function submitPaper1AsWrongThenRight(db: Database, correctAllExceptFirst: boolean) {
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, COURSE, 1, 1, i, correctAllExceptFirst ? i !== 0 : true));
  return submitExamPaper(db, COURSE, 1, 1, TODAY);
}

test("retakeExamPaper rejects a paper that was never submitted", () => {
  const result = retakeExamPaper(db, COURSE, 1, 1);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("not_submitted");
});

test("retakeExamPaper rejects an unknown paper", () => {
  const result = retakeExamPaper(db, COURSE, 99, 1);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe("not_found");
});

test("retakeExamPaper snapshots the prior attempt, then clears submission and answers", () => {
  submitPaper1AsWrongThenRight(db, true); // question 0 wrong, rest correct

  const result = retakeExamPaper(db, COURSE, 1, 1);
  expect(result.ok).toBe(true);

  const paperRow = getExamPaperRow(db, COURSE, 1, 1)!;
  expect(paperRow.submitted_at).toBeNull();
  expect(paperRow.score_correct).toBeNull();
  expect(paperRow.score_total).toBeNull();
  expect(listExamAnswers(db, COURSE, 1, 1)).toEqual([]);

  const history = listExamAttemptHistory(db, COURSE, 1, 1);
  expect(history.length).toBe(1);
  expect(history[0]!.attemptNumber).toBe(1);
  expect(history[0]!.submittedAt).toBe(TODAY);
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  expect(history[0]!.scoreCorrect).toBe(paper1.questions.length - 1);
  expect(history[0]!.scoreTotal).toBe(paper1.questions.length);
});

test("two consecutive retakes number attempts 1 and 2 in order", () => {
  submitPaper1AsWrongThenRight(db, true);
  retakeExamPaper(db, COURSE, 1, 1);
  submitPaper1AsWrongThenRight(db, false); // all correct this time
  retakeExamPaper(db, COURSE, 1, 1);

  const history = listExamAttemptHistory(db, COURSE, 1, 1);
  expect(history.map((h) => h.attemptNumber)).toEqual([1, 2]);
  const paper1 = buildExamSchedule().find((p) => p.course === COURSE && p.week === 1 && p.paperNumber === 1)!;
  expect(history[0]!.scoreCorrect).toBe(paper1.questions.length - 1); // attempt 1: question 0 wrong
  expect(history[1]!.scoreCorrect).toBe(paper1.questions.length); // attempt 2: all correct
});

test("retaking and resubmitting still-wrong reuses the existing review-item pipeline unchanged", () => {
  submitPaper1AsWrongThenRight(db, true); // question 0 wrong -> creates a review item
  const beforeRetake = listDueExamReviewItems(db, COURSE, addDays(TODAY, 1));
  expect(beforeRetake.length).toBe(1);

  retakeExamPaper(db, COURSE, 1, 1);
  submitPaper1AsWrongThenRight(db, true); // question 0 wrong again

  // ON CONFLICT DO NOTHING: still one review item, not duplicated, for the same question.
  const afterRetake = listDueExamReviewItems(db, COURSE, addDays(TODAY, 1));
  expect(afterRetake.length).toBe(1);
  expect(afterRetake[0]!.question_index).toBe(0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-db.test.ts`
Expected: FAIL — `retakeExamPaper`/`listExamAttemptHistory` are not exported from `./exam-db`.

- [ ] **Step 3: Add the table, migration wiring, and the two functions**

In `exam-db.ts`, add to the `CREATE TABLE IF NOT EXISTS` block inside `migrateExam` (right after the existing `exam_review_log` table):

```sql
    CREATE TABLE IF NOT EXISTS exam_attempt_history (
      course TEXT NOT NULL,
      week INTEGER NOT NULL,
      paper_number INTEGER NOT NULL,
      attempt_number INTEGER NOT NULL,
      submitted_at TEXT NOT NULL,
      score_correct INTEGER NOT NULL,
      score_total INTEGER NOT NULL,
      PRIMARY KEY (course, week, paper_number, attempt_number)
    );
```

Then, after `submitExamPaper` (below its closing brace, before `countExamPapersSubmittedToday`), add:

```ts
export interface ExamAttemptSummary {
  attemptNumber: number;
  submittedAt: string;
  scoreCorrect: number;
  scoreTotal: number;
}

export type RetakeResult = { ok: true } | { ok: false; reason: "not_found" | "not_submitted" };

export function retakeExamPaper(db: Database, course: string, week: number, paperNumber: number): RetakeResult {
  const paper = getExamPaperRow(db, course, week, paperNumber);
  if (!paper) return { ok: false, reason: "not_found" };
  if (!paper.submitted_at) return { ok: false, reason: "not_submitted" };

  const { n: attemptCount } = db
    .query(`SELECT COUNT(*) AS n FROM exam_attempt_history WHERE course = ? AND week = ? AND paper_number = ?`)
    .get(course, week, paperNumber) as { n: number };

  db.query(
    `INSERT INTO exam_attempt_history (course, week, paper_number, attempt_number, submitted_at, score_correct, score_total)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(course, week, paperNumber, attemptCount + 1, paper.submitted_at, paper.score_correct!, paper.score_total!);

  db.query(
    `UPDATE exam_papers SET submitted_at = NULL, score_correct = NULL, score_total = NULL
     WHERE course = ? AND week = ? AND paper_number = ?`,
  ).run(course, week, paperNumber);

  db.query(`DELETE FROM exam_answers WHERE course = ? AND week = ? AND paper_number = ?`).run(course, week, paperNumber);

  return { ok: true };
}

export function listExamAttemptHistory(db: Database, course: string, week: number, paperNumber: number): ExamAttemptSummary[] {
  const rows = db
    .query(
      `SELECT attempt_number, submitted_at, score_correct, score_total FROM exam_attempt_history
       WHERE course = ? AND week = ? AND paper_number = ? ORDER BY attempt_number`,
    )
    .all(course, week, paperNumber) as { attempt_number: number; submitted_at: string; score_correct: number; score_total: number }[];
  return rows.map((r) => ({
    attemptNumber: r.attempt_number,
    submittedAt: r.submitted_at,
    scoreCorrect: r.score_correct,
    scoreTotal: r.score_total,
  }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test exam-db.test.ts`
Expected: PASS, all tests including the 5 new ones.

- [ ] **Step 5: Typecheck and commit**

Run: `bunx tsc --noEmit` — expect no errors.

```bash
git add exam-db.ts exam-db.test.ts
git commit -m "feat: add exam paper retake with attempt history"
```

---

### Task 2: `POST /api/exam/:course/:week/:paperNumber/retake`

**Files:**
- Modify: `exam-api.ts`
- Test: `exam-api.test.ts`

**Interfaces:**
- Consumes: `retakeExamPaper` from Task 1; existing `isKnownCourse`, `parseWeek`, `parsePaperNumber` helpers (`exam-api.ts:32-47`).
- Produces: route `POST /api/exam/:course/:week/:paperNumber/retake` returning `{ ok: true }` on success, consumed by the frontend in Task 4.

- [ ] **Step 1: Write the failing tests**

Add to `exam-api.test.ts`:

```ts
async function submitWeek1Paper1(scoreAllCorrect: boolean) {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  for (let i = 0; i < paperRes.questions.length; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: scoreAllCorrect || i !== 0 }),
    });
  }
  return fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
}

test("POST /api/exam/:course/:week/:paperNumber/retake resets a submitted paper", async () => {
  await submitWeek1Paper1(true);

  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/retake`, { method: "POST" });
  expect(res.status).toBe(200);

  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  expect(paperRes.submittedAt).toBeNull();
  expect(paperRes.questions.every((q: any) => q.yourAnswer === "" && q.correct === null)).toBe(true);
});

test("POST retake on a paper never submitted returns 400", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/retake`, { method: "POST" });
  expect(res.status).toBe(400);
  const body: any = await res.json();
  expect(body.error).toBe("paper not yet submitted");
});

test("POST retake on an unknown course returns 400", async () => {
  const res = await fetch(`${base}/api/exam/UNKNOWN123/1/1/retake`, { method: "POST" });
  expect(res.status).toBe(400);
});

test("POST retake on a paper number that doesn't exist returns 404", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/999/retake`, { method: "POST" });
  expect(res.status).toBe(404);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-api.test.ts`
Expected: FAIL — 404 (route not found) on the retake requests.

- [ ] **Step 3: Add the route**

In `exam-api.ts`, add `retakeExamPaper` to the import from `./exam-db` (Step 1's import list at the top of the file), then add this route to `examApiRoutes(db)`, right after the existing `/submit` route:

```ts
    "/api/exam/:course/:week/:paperNumber/retake": {
      POST: (req: Request & { params: { course: string; week: string; paperNumber: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const week = parseWeek(req.params.week);
        if (week === null) return json({ error: "invalid week" }, 400);
        const paperNumber = parsePaperNumber(req.params.paperNumber, course, week);
        if (paperNumber === null) return json({ error: "paper not found" }, 404);
        const result = retakeExamPaper(db, course, week, paperNumber);
        if (!result.ok) {
          const status = result.reason === "not_found" ? 404 : 400;
          const message = result.reason === "not_found" ? "not found" : "paper not yet submitted";
          return json({ error: message }, status);
        }
        return json({ ok: true });
      },
    },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test exam-api.test.ts`
Expected: PASS, all tests including the 4 new ones.

- [ ] **Step 5: Typecheck and commit**

Run: `bunx tsc --noEmit` — expect no errors.

```bash
git add exam-api.ts exam-api.test.ts
git commit -m "feat: add POST /api/exam/:course/:week/:paperNumber/retake"
```

---

### Task 3: `GET /api/exam/:course/history`

**Files:**
- Modify: `exam-api.ts`
- Test: `exam-api.test.ts`

**Interfaces:**
- Consumes: `listExamAttemptHistory` from Task 1; existing `listExamPaperRows`, `weekStartDate`, `groupExamPapersByWeek` (already imported in `exam-api.ts`).
- Produces (consumed by the frontend in Task 4):
  - `export interface ExamHistoryPaper extends ExamWeekPaperSummary { pastAttempts: ExamAttemptSummary[] }`
  - `export interface ExamHistoryWeek { week: number; dueDate: string; papers: ExamHistoryPaper[] }`
  - route `GET /api/exam/:course/history` returning `{ weeks: ExamHistoryWeek[] }`, newest week first.

- [ ] **Step 1: Write the failing tests**

Add to `exam-api.test.ts`:

```ts
test("GET /api/exam/:course/history includes a fully-submitted week (which /due excludes)", async () => {
  await submitWeek1Paper1(true);

  const dueBody: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  expect(dueBody.weeksDue).toEqual([]); // confirms the gap this feature closes

  const historyBody: any = await (await fetch(`${base}/api/exam/${COURSE}/history`)).json();
  expect(historyBody.weeks.length).toBe(1);
  expect(historyBody.weeks[0].week).toBe(1);
  expect(historyBody.weeks[0].papers[0].submitted).toBe(true);
  expect(historyBody.weeks[0].papers[0].pastAttempts).toEqual([]);
});

test("GET /api/exam/:course/history includes a retake's past attempt", async () => {
  await submitWeek1Paper1(true);
  await fetch(`${base}/api/exam/${COURSE}/1/1/retake`, { method: "POST" });

  const historyBody: any = await (await fetch(`${base}/api/exam/${COURSE}/history`)).json();
  const paper = historyBody.weeks[0].papers[0];
  expect(paper.submitted).toBe(false); // reset, awaiting the next attempt
  expect(paper.pastAttempts.length).toBe(1);
  expect(paper.pastAttempts[0].attemptNumber).toBe(1);
});

test("GET /api/exam/:course/history excludes a week whose start date hasn't arrived yet", async () => {
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES (?, ?, ?)`).run(COURSE, 9999, 1);
  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/history`)).json();
  expect(body.weeks.some((w: any) => w.week === 9999)).toBe(false);
});

test("GET /api/exam/:course/history with an unknown course returns 400", async () => {
  const res = await fetch(`${base}/api/exam/UNKNOWN123/history`);
  expect(res.status).toBe(400);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test exam-api.test.ts`
Expected: FAIL — 404 (route not found) on the history requests.

- [ ] **Step 3: Add the types and route**

In `exam-api.ts`, add `listExamAttemptHistory` and `type ExamAttemptSummary` to the import from `./exam-db`, and `type ExamWeekPaperSummary` to the import from `./exam-content` (alongside the existing `type ExamWeekView`). Then, after the `ExamPaperView`/`paperView` block, add:

```ts
export interface ExamHistoryPaper extends ExamWeekPaperSummary {
  pastAttempts: ExamAttemptSummary[];
}

export interface ExamHistoryWeek {
  week: number;
  dueDate: string;
  papers: ExamHistoryPaper[];
}
```

Then add this route to `examApiRoutes(db)`, right after `/api/exam/:course/due`:

```ts
    "/api/exam/:course/history": {
      GET: (req: Request & { params: { course: string } }) => {
        const course = req.params.course;
        if (!isKnownCourse(course)) return json({ error: "unknown course" }, 400);
        const today = localToday();
        const visibleRows = listExamPaperRows(db, course).filter((r) => weekStartDate(r.week) <= today);
        const weeks: ExamHistoryWeek[] = groupExamPapersByWeek(course, visibleRows, today)
          .sort((a, b) => b.week - a.week)
          .map((w) => ({
            week: w.week,
            dueDate: w.dueDate,
            papers: w.papers.map((p) => ({
              ...p,
              pastAttempts: listExamAttemptHistory(db, course, w.week, p.paperNumber),
            })),
          }));
        return json({ weeks });
      },
    },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test exam-api.test.ts`
Expected: PASS, all tests including the 4 new ones.

- [ ] **Step 5: Typecheck and commit**

Run: `bunx tsc --noEmit` — expect no errors.

```bash
git add exam-api.ts exam-api.test.ts
git commit -m "feat: add GET /api/exam/:course/history"
```

---

### Task 4: Frontend — History view in `ExamApp.tsx`

**Files:**
- Modify: `ExamApp.tsx`

**Interfaces:**
- Consumes: `ExamHistoryWeek`, `ExamHistoryPaper` types from Task 3 (`import type { ... } from "./exam-api"`, alongside the existing `ExamPaperView`/`ExamQuestionView`/`ExamReviewView` import).
- Produces: no new exports — this is the leaf UI task.

This task has no `bun test` coverage of its own (matching how the existing Sync banner has none either — see `docs/superpowers/specs/2026-08-06-exam-modules-sync-design.md`'s Testing section for why). Its "test cycle" is: the full `bun test` suite still passes (nothing broken), `tsc --noEmit` is clean, and a manual browser check confirms the new UI works.

- [ ] **Step 1: Add the `history` view state, API calls, and types import**

In `ExamApp.tsx`:

1. Add to the `import type { ExamPaperView, ExamQuestionView, ExamReviewView }` line: `ExamHistoryWeek`.
2. Extend the `View` union (near the top of the file):

```ts
type View =
  | { name: "board" }
  | { name: "week"; week: number }
  | { name: "paper"; week: number; paperNumber: number }
  | { name: "review"; item: ExamReviewView }
  | { name: "history" }
  | { name: "history-paper"; week: number; paperNumber: number };
```

3. Add to the `api` object:

```ts
  history: (course: string) => fetch(`/api/exam/${course}/history`).then((r) => json<{ weeks: ExamHistoryWeek[] }>(r)),
  retake: (course: string, week: number, paperNumber: number) =>
    fetch(`/api/exam/${course}/${week}/${paperNumber}/retake`, { method: "POST" }).then((r) => json<{ ok: true }>(r)),
```

- [ ] **Step 2: Run the full suite to confirm nothing broke**

Run: `bun test`
Expected: PASS (this step only adds types/state, no behavior change yet).

- [ ] **Step 3: Add the `HistoryView` component**

Add this new component after `WeekPicker` (before `ReviewDetail`):

```tsx
function HistoryView({
  weeks,
  onBack,
  onOpenPaper,
  onRetake,
}: {
  weeks: ExamHistoryWeek[];
  onBack: () => void;
  onOpenPaper: (week: number, paperNumber: number) => void;
  onRetake: (week: number, paperNumber: number) => void;
}) {
  return (
    <article className="detail">
      <header className="detail-head">
        <h2>History</h2>
      </header>
      {weeks.length === 0 ? (
        <p className="board-empty">No past weeks yet.</p>
      ) : (
        weeks.map((w) => (
          <section key={w.week} className="board" aria-label={`Week ${w.week}`}>
            <div className="section-head">
              <h2>Week {w.week}</h2>
            </div>
            <ul className="board-rows">
              {w.papers.map((p) => (
                <li key={p.paperNumber}>
                  <div className="board-row board-row-main" style={{ "--urgency": "var(--green)" } as React.CSSProperties}>
                    <span className="tag">{p.submitted ? "done" : "reset"}</span>
                    <span className="board-title">{p.title}</span>
                    {p.submitted && (
                      <span className="lang-tag">{p.scoreCorrect}/{p.scoreTotal}</span>
                    )}
                    {p.submitted ? (
                      <button className="btn" onClick={() => onRetake(w.week, p.paperNumber)}>Retake</button>
                    ) : (
                      <button className="btn" onClick={() => onOpenPaper(w.week, p.paperNumber)}>Continue</button>
                    )}
                  </div>
                  {p.pastAttempts.length > 0 && (
                    <p className="rule-note">
                      {p.pastAttempts
                        .map((a) => `Attempt ${a.attemptNumber}: ${a.scoreCorrect}/${a.scoreTotal} (${a.submittedAt})`)
                        .join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      <div className="btn-row">
        <button className="btn" onClick={onBack}>Back</button>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Wire up state, the header button, and the two new view branches**

In the `ExamApp` component:

1. Add state: `const [history, setHistory] = useState<ExamHistoryWeek[]>([]);`
2. Add a loader function next to `openCompleted`:

```ts
  const openHistory = () => {
    setView({ name: "history" });
    if (course) {
      api
        .history(course)
        .then((r) => setHistory(r.weeks))
        .catch((err) => setError(errorMessage(err)));
    }
  };

  const retake = async (week: number, paperNumber: number) => {
    if (!course) return;
    setError(null);
    try {
      await api.retake(course, week, paperNumber);
      setView({ name: "history-paper", week, paperNumber });
      refresh(course);
    } catch (err) {
      setError(errorMessage(err));
    }
  };
```

3. Add a "History" button next to the existing "Sync" button (in the `btn-row` above `ExamStats`):

```tsx
        <button className="btn" onClick={openHistory}>History</button>
```

4. Add the two new view branches, right after the existing `view.name === "review"` block:

```tsx
      {view.name === "history" && (
        <HistoryView
          weeks={history}
          onBack={() => setView({ name: "board" })}
          onOpenPaper={(week, paperNumber) => setView({ name: "history-paper", week, paperNumber })}
          onRetake={retake}
        />
      )}

      {view.name === "history-paper" && (
        <PaperLoader
          course={course}
          week={view.week}
          paperNumber={view.paperNumber}
          onBack={() => setView({ name: "history" })}
          onChanged={() => {
            refresh(course);
            openHistory();
          }}
          onError={setError}
        />
      )}
```

(`PaperLoader`/`PaperView` are reused as-is — a reset paper looks identical to a never-attempted one, so no new paper-taking UI is needed. `onChanged` refreshes both the due-list stats and the History list, since submitting from here can move a paper back into `weeksDue` — e.g. a retake with a wrong answer keeps the paper unsubmitted until resubmitted — and always updates its `pastAttempts` once resubmitted.)

- [ ] **Step 5: Run the full suite and typecheck**

Run: `bun test && bunx tsc --noEmit`
Expected: PASS, no errors.

- [ ] **Step 6: Manual browser verification**

Run: `bun run dev` (skip if already running — check `lsof -iTCP -sTCP:LISTEN -P | grep bun` first).

In the browser, on the Modules tab:
1. Click "History" — confirm it opens (empty or showing existing weeks).
2. Submit a paper if none are submitted yet; open History again — confirm the fully-submitted week now appears (proving the gap this feature closes, since it no longer appears on the board view).
3. Click "Retake" on a submitted paper — confirm it reopens blank (no prior answers shown).
4. Answer and resubmit — confirm History shows the new score plus "Attempt 1: ..." under past attempts.

- [ ] **Step 7: Commit**

```bash
git add ExamApp.tsx
git commit -m "feat: add exam History view with paper retakes"
```
