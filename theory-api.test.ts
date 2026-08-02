import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { localToday, addDays } from "./scheduling";

let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = new Database(":memory:");
  migrateTheory(db, localToday());
  server = Bun.serve({ port: 0, routes: theoryApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/theory/due starts with the first 5 concepts released under the cap, no overdue, nothing completed", async () => {
  const body: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(body.due.map((d: any) => d.concept_day)).toEqual([1, 2, 3, 4, 5]);
  expect(body.stats).toEqual({ dueCount: 5, overdueCount: 0, completedToday: 0 });
});

test("POST /api/theory/:day/answer saves a draft without touching scheduling", async () => {
  const res = await fetch(`${base}/api/theory/1/answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ yourAnswer: "draft" }),
  });
  expect(res.status).toBe(200);
  const saved: any = await res.json();
  expect(saved.your_answer).toBe("draft");
  expect(saved.rung).toBe(-1);
});

test("POST /api/theory/:day/review 'correct' advances rung 3 days out, and the next concept fills the vacated slot", async () => {
  const res = await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  expect(res.status).toBe(200);
  const updated: any = await res.json();
  expect(updated.rung).toBe(0);
  expect(updated.next_review).toBe(addDays(localToday(), 3));

  const due: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(due.due.map((d: any) => d.concept_day)).toEqual([2, 3, 4, 5, 6]);
  expect(due.stats.completedToday).toBe(1);
});

test("POST /api/theory/:day/review 'wrong' reschedules tomorrow and stays off today's list", async () => {
  const res = await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "wrong" }),
  });
  const updated: any = await res.json();
  expect(updated.rung).toBe(-1);
  expect(updated.next_review).toBe(addDays(localToday(), 1));
});

test("review rejects a bad result value", async () => {
  const res = await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "meh" }),
  });
  expect(res.status).toBe(400);
});

test("GET /api/theory/completed-today lists concepts reviewed today only", async () => {
  expect(await (await fetch(`${base}/api/theory/completed-today`)).json()).toEqual([]);

  await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  const completed: any = await (await fetch(`${base}/api/theory/completed-today`)).json();
  expect(completed.length).toBe(1);
  expect(completed[0].concept_day).toBe(1);
});

test("day out of range (0, 151, non-numeric) is rejected with 400 on both routes", async () => {
  for (const bad of ["0", "151", "abc"]) {
    const answerRes = await fetch(`${base}/api/theory/${bad}/answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ yourAnswer: "x" }),
    });
    expect(answerRes.status).toBe(400);

    const reviewRes = await fetch(`${base}/api/theory/${bad}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result: "correct" }),
    });
    expect(reviewRes.status).toBe(400);
  }
});
