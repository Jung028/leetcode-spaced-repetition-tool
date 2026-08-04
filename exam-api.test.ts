import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateExam } from "./exam-db";
import { examApiRoutes } from "./exam-api";
import { localToday, addDays } from "./scheduling";
import { TOTAL_PAPERS } from "./exam-content";

let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = new Database(":memory:");
  migrateExam(db, localToday());
  server = Bun.serve({ port: 0, routes: examApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/exam/due returns today's paper with full question content", async () => {
  const body: any = await (await fetch(`${base}/api/exam/due`)).json();
  expect(body.paper.paperDay).toBe(1);
  expect(body.paper.questions.length).toBeGreaterThan(0);
  expect(body.paper.questions[0].modelAnswer.length).toBeGreaterThan(0);
  expect(body.reviewDue).toEqual([]);
  expect(body.stats.completedToday).toBe(0);
});

test("POST /api/exam/:day/answer saves a draft without grading", async () => {
  const res = await fetch(`${base}/api/exam/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 0, yourAnswer: "draft" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].yourAnswer).toBe("draft");
  expect(updated.questions[0].correct).toBeNull();
});

test("POST /api/exam/:day/:questionIndex/grade records a verdict, and mcq can pass yourAnswer in the same call", async () => {
  const res = await fetch(`${base}/api/exam/1/0/grade`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ correct: true, yourAnswer: "1" }),
  });
  const updated: any = await res.json();
  expect(updated.questions[0].correct).toBe(1);
  expect(updated.questions[0].yourAnswer).toBe("1");
});

test("POST /api/exam/:day/submit fails while any question is ungraded, then succeeds once all are", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  const count = dueRes.paper.questions.length;

  const incomplete = await fetch(`${base}/api/exam/1/submit`, { method: "POST" });
  expect(incomplete.status).toBe(400);

  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  const submitRes = await fetch(`${base}/api/exam/1/submit`, { method: "POST" });
  expect(submitRes.status).toBe(200);
  const result: any = await submitRes.json();
  expect(result.scoreTotal).toBe(count);
  expect(result.scoreCorrect).toBe(count - 1);
});

test("submitting the same paper twice returns 400", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/1/submit`, { method: "POST" });
  const second = await fetch(`${base}/api/exam/1/submit`, { method: "POST" });
  expect(second.status).toBe(400);
});

test("after submitting with one wrong answer, that question shows up as a review item tomorrow", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: i !== 0 }),
    });
  }
  await fetch(`${base}/api/exam/1/submit`, { method: "POST" });

  const reviewRes = await fetch(`${base}/api/exam/review/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  expect(reviewRes.status).toBe(200);
  const updated: any = await reviewRes.json();
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(localToday(), 3));
});

test("review rejects a bad result value", async () => {
  const res = await fetch(`${base}/api/exam/review/1/0`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "meh" }),
  });
  expect(res.status).toBe(400);
});

test("day out of range is rejected with 400", async () => {
  for (const bad of ["0", String(TOTAL_PAPERS + 1), "abc"]) {
    const res = await fetch(`${base}/api/exam/${bad}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionIndex: 0, yourAnswer: "x" }),
    });
    expect(res.status).toBe(400);
  }
});

test("questionIndex out of range is rejected with 400", async () => {
  const res = await fetch(`${base}/api/exam/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ questionIndex: 999, yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("a missing questionIndex on /answer is rejected with 400, not silently treated as index 0", async () => {
  const res = await fetch(`${base}/api/exam/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ yourAnswer: "x" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/exam/completed-today lists papers submitted today", async () => {
  const dueRes: any = await (await fetch(`${base}/api/exam/due`)).json();
  const count = dueRes.paper.questions.length;
  for (let i = 0; i < count; i++) {
    await fetch(`${base}/api/exam/1/${i}/grade`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ correct: true }),
    });
  }
  await fetch(`${base}/api/exam/1/submit`, { method: "POST" });

  const completed: any = await (await fetch(`${base}/api/exam/completed-today`)).json();
  expect(completed.papers.length).toBe(1);
  expect(completed.papers[0].scoreCorrect).toBe(count);
});
