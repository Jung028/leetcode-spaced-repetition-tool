import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import { addDays } from "./scheduling";

const COURSE = "INFO5995";
const TODAY = "2026-08-05"; // a Wednesday in Week 1
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = new Database(":memory:");
  migrateExam(db, TODAY);
  server = Bun.serve({ port: 0, routes: examApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/exam/courses lists courses that have at least one paper", async () => {
  const body: any = await (await fetch(`${base}/api/exam/courses`)).json();
  expect(body.some((c: any) => c.code === "INFO5995")).toBe(true);
  expect(body.some((c: any) => c.code === "INFO5990")).toBe(false);
});

test("GET /api/exam/:course/due groups Week 1's 3 papers into one weeksDue entry", async () => {
  const body: any = await (await fetch(`${base}/api/exam/${COURSE}/due`)).json();
  expect(body.weeksDue.length).toBe(1);
  expect(body.weeksDue[0].week).toBe(1);
  expect(body.weeksDue[0].papers.length).toBe(3);
  expect(body.weeksDue[0].papers.every((p: any) => !p.submitted)).toBe(true);
  expect(body.reviewDue).toEqual([]);
  expect(body.stats.dueCount).toBe(3);
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

test("after submitting with one wrong answer, that question shows up as a review item tomorrow", async () => {
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

  const reviewRes = await fetch(`${base}/api/exam/review/${COURSE}/1/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  expect(reviewRes.status).toBe(200);
  const updated: any = await reviewRes.json();
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(TODAY, 3));
});

test("review rejects a bad result value", async () => {
  const res = await fetch(`${base}/api/exam/review/${COURSE}/1/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "meh" }),
  });
  expect(res.status).toBe(400);
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
