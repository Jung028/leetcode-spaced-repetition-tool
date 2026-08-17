import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import { buildExamSchedule, weekStartDate, weekDueDate } from "./exam-content";
import { addDays, localToday } from "./scheduling";

const COURSE = "INFO5995";
const TODAY = localToday();
// Each week's due date is fixed, but "today" is the real wall clock, and the
// course can have more than one week of content — so rather than assuming a
// single week, this walks every visible week and buckets it by whether its
// due date has passed yet, mirroring home-api.test.ts's examWeekItemCounts.
function courseWeekBuckets(course: string): { dueToday: number; overdue: number } {
  let dueToday = 0;
  let overdue = 0;
  const weeks = new Set(buildExamSchedule().filter((p) => p.course === course).map((p) => p.week));
  for (const week of weeks) {
    if (weekStartDate(week) > TODAY) continue; // not visible yet
    if (weekDueDate(week) < TODAY) overdue++;
    else dueToday++;
  }
  return { dueToday, overdue };
}
const COURSE_WEEK_COUNTS = courseWeekBuckets(COURSE);
let server: ReturnType<typeof Bun.serve>;
let base: string;
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateExam(db, TODAY);
  server = Bun.serve({ port: 0, routes: examApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/exam/courses lists courses that have at least one paper", async () => {
  const body: any = await (await fetch(`${base}/api/exam/courses`)).json();
  expect(body.some((c: any) => c.code === "INFO5995")).toBe(true);
  expect(body.some((c: any) => c.code === "INFO5990")).toBe(true);
});

test("GET /api/exam/sync returns a pending list (shape check — content depends on the real Desktop folder)", async () => {
  const body: any = await (await fetch(`${base}/api/exam/sync`)).json();
  expect(Array.isArray(body.pending)).toBe(true);
  for (const item of body.pending) {
    expect(typeof item.course).toBe("string");
    expect(typeof item.week).toBe("number");
  }
});

test("GET /api/exam/:course/due groups Week 1's combined paper into one weeksDue entry", async () => {
  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  const week1 = body.weeksDue.find((w: any) => w.week === 1);
  expect(week1).toBeTruthy();
  expect(week1.papers.length).toBe(1);
  expect(week1.papers.every((p: any) => !p.submitted)).toBe(true);
  // Every visible, unsubmitted week for this course, bucketed by due vs overdue.
  expect(body.stats.dueCount).toBe(COURSE_WEEK_COUNTS.dueToday);
  expect(body.stats.overdueCount).toBe(COURSE_WEEK_COUNTS.overdue);
});

test("GET /api/exam/:course/due hides a week whose start date hasn't arrived yet", async () => {
  // Week 9999's start date (weekStartDate is a pure function of SEMESTER_START,
  // 2026-08-03) is ~191 years out, so this reliably exercises the
  // weekStartDate(week) <= today gate on any real calendar day the suite runs,
  // without depending on "today" sitting before SEMESTER_START itself (which
  // is now permanently false — SEMESTER_START is a fixed past date, and the
  // /due route always reads the real localToday(), not an injected one).
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES (?, ?, ?)`).run(COURSE, 9999, 1);
  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  expect(body.weeksDue.some((w: any) => w.week === 9999)).toBe(false);
});

test("GET /api/exam/:course/due drops a week once every paper in it is submitted", async () => {
  for (const paperNumber of [1]) {
    const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/${paperNumber}`)).json();
    const count = paperRes.questions.length;
    for (let i = 0; i < count; i++) {
      await fetch(`${base}/api/exam/${COURSE}/1/${paperNumber}/${i}/grade`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ correct: true }),
      });
    }
    await fetch(`${base}/api/exam/${COURSE}/1/${paperNumber}/submit`, { method: "POST" });
  }
  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  expect(body.weeksDue.some((w: any) => w.week === 1)).toBe(false);
});

test("GET /api/exam/:course/due with an unknown course returns 400", async () => {
  const res = await fetch(`${base}/api/exam/UNKNOWN123/due`);
  expect(res.status).toBe(400);
});

test("GET /api/exam/:course/:week/:paperNumber returns full question content", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1`);
  const body: any = await res.json();
  expect(body.week).toBe(1);
  expect(body.paperNumber).toBe(1);
  expect(body.dueDate).toBe("2026-08-09");
  expect(body.questions.length).toBeGreaterThan(0);
  expect(body.questions[0].modelAnswer.length).toBeGreaterThan(0);
});

test("GET /api/exam/:course/:week/:paperNumber 404s for a paper number that doesn't exist", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/99`);
  expect(res.status).toBe(404);
});

test("POST /api/exam/:course/:week/:paperNumber/answer saves a draft without grading", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 0, yourAnswer: "draft" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].yourAnswer).toBe("draft");
  expect(updated.questions[0].correct).toBeNull();
});

test("POST /api/exam/:course/:week/:paperNumber/:questionIndex/grade records a verdict", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/0/grade`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ correct: true, yourAnswer: "1" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].correct).toBe(1);
  expect(updated.questions[0].yourAnswer).toBe("1");
});

test("POST /api/exam/:course/:week/:paperNumber/submit fails while any question is ungraded, then succeeds once all are", async () => {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  const count = paperRes.questions.length;

  const incomplete = await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
  expect(incomplete.status).toBe(400);

  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  const submitRes = await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
  expect(submitRes.status).toBe(200);
  const result: any = await submitRes.json();
  expect(result.scoreTotal).toBe(count);
  expect(result.scoreCorrect).toBe(count - 1);
});

test("submitting the same paper twice returns 400", async () => {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  const count = paperRes.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
  const second = await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });
  expect(second.status).toBe(400);
});

test("POST /api/exam/:course/:week/:paperNumber/retake-wrong clears only the wrong answer", async () => {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  const count = paperRes.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });

  const retakeRes = await fetch(`${base}/api/exam/${COURSE}/1/1/retake-wrong`, { method: "POST" });
  expect(retakeRes.status).toBe(200);

  const reopened: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  expect(reopened.submittedAt).toBeNull();
  expect(reopened.questions[0].correct).toBeNull(); // the wrong one, reopened
  expect(reopened.questions[1].correct).toBe(1); // the rest, still locked in as correct
});

test("an invalid week is rejected with 400", async () => {
  for (const bad of ["0", "-1", "abc"]) {
    const res = await fetch(`${base}/api/exam/${COURSE}/${bad}/1/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex: 0, yourAnswer: "x" }),
    });
    expect(res.status).toBe(400);
  }
});

test("a paperNumber that doesn't exist for the given week is rejected with 404", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/99/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 0, yourAnswer: "x" }),
  });
  expect(res.status).toBe(404);
});

test("questionIndex out of range is rejected with 400", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 999, yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("a missing questionIndex on /answer is rejected with 400, not silently treated as index 0", async () => {
  const res = await fetch(`${base}/api/exam/${COURSE}/1/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/exam/:course/completed-today lists papers submitted today", async () => {
  const paperRes: any = await (await fetch(`${base}/api/exam/${COURSE}/1/1`)).json();
  const count = paperRes.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/${COURSE}/1/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/${COURSE}/1/1/submit`, { method: "POST" });

  const completed: any = await (await fetch(`${base}/api/exam/${COURSE}/completed-today`)).json();
  expect(completed.papers.length).toBe(1);
  expect(completed.papers[0].scoreCorrect).toBe(count);
});

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

test("GET /api/exam/:course/history includes a fully-submitted week (which /due excludes)", async () => {
  await submitWeek1Paper1(true);

  const dueBody: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  expect(dueBody.weeksDue.some((w: any) => w.week === 1)).toBe(false); // confirms the gap this feature closes

  const historyBody: any = await (await fetch(`${base}/api/exam/${COURSE}/history`)).json();
  const week1 = historyBody.weeks.find((w: any) => w.week === 1);
  expect(week1).toBeTruthy();
  expect(week1.papers[0].submitted).toBe(true);
  expect(week1.papers[0].pastAttempts).toEqual([]);
});

test("GET /api/exam/:course/history includes a retake's past attempt", async () => {
  await submitWeek1Paper1(true);
  await fetch(`${base}/api/exam/${COURSE}/1/1/retake`, { method: "POST" });

  const historyBody: any = await (await fetch(`${base}/api/exam/${COURSE}/history`)).json();
  const week1 = historyBody.weeks.find((w: any) => w.week === 1);
  const paper = week1.papers[0];
  expect(paper.submitted).toBe(false); // reset, awaiting the next attempt
  expect(paper.pastAttempts.length).toBe(1);
  expect(paper.pastAttempts[0].attemptNumber).toBe(1);
});

test("GET /api/exam/:course/history excludes a week whose start date hasn't arrived yet", async () => {
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES (?, ?, ?)`).run(COURSE, 9999, 1);
  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/history`)).json();
  expect(body.weeks.some((w: any) => w.week === 9999)).toBe(false);
});

test("GET /api/exam/:course/history sorts weeks newest-first", async () => {
  // Week 0's start date (2026-07-27, one week before SEMESTER_START) is
  // always in the past by the time this test runs — unlike a "normal" week
  // number, which is only visible once the real calendar reaches it — so
  // this reliably puts a second, lower-numbered week alongside Week 1
  // without depending on the exact day the suite runs. Mirrors how the
  // "hides a week whose start date hasn't arrived yet" test above uses week
  // 9999 for the opposite (always-invisible) extreme.
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES (?, ?, ?)`).run(COURSE, 0, 1);

  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/history`)).json();
  const weeks = body.weeks.map((w: any) => w.week);
  expect(weeks.length).toBeGreaterThanOrEqual(2);
  expect(weeks).toEqual([...weeks].sort((a: number, b: number) => b - a));
});

test("GET /api/exam/:course/history with an unknown course returns 400", async () => {
  const res = await fetch(`${base}/api/exam/UNKNOWN123/history`);
  expect(res.status).toBe(400);
});
