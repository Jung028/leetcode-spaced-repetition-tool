import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateTheory } from "./theory-db";
import { theoryApiRoutes } from "./theory-api";
import { localToday, addDays } from "./scheduling";

let server: ReturnType<typeof Bun.serve>;
let base: string;

const putContent = (day: number | string, question: string, answer: string, answerFormat?: string) =>
  fetch(`${base}/api/theory/${day}/content`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, answer, ...(answerFormat !== undefined ? { answerFormat } : {}) }),
  });

beforeEach(() => {
  const db = new Database(":memory:");
  migrateTheory(db, localToday());
  server = Bun.serve({ port: 0, routes: theoryApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/theory/due starts empty until concepts have content, even though 5 are released under the cap", async () => {
  const body: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(body.due).toEqual([]);
  expect(body.stats).toEqual({ dueCount: 0, overdueCount: 0, completedToday: 0 });
});

test("GET /api/theory/due shows released concepts once they have content", async () => {
  await putContent(1, "Q1", "A1");
  await putContent(2, "Q2", "A2");
  const body: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(body.due.map((d: any) => d.concept_day)).toEqual([1, 2]);
  expect(body.stats.dueCount).toBe(2);
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
  for (let day = 1; day <= 6; day++) await putContent(day, `Q${day}`, `A${day}`);

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

  await putContent(1, "Q1", "A1");
  await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  const completed: any = await (await fetch(`${base}/api/theory/completed-today`)).json();
  expect(completed.length).toBe(1);
  expect(completed[0].concept_day).toBe(1);
});

test("GET /api/theory/:day returns the concept regardless of due status", async () => {
  await putContent(1, "Q1", "A1");
  const res = await fetch(`${base}/api/theory/1`);
  expect(res.status).toBe(200);
  const concept: any = await res.json();
  expect(concept.concept_day).toBe(1);
  expect(concept.question).toBe("Q1");
});

test("GET /api/theory/:day works even for a concept that is not currently due", async () => {
  await putContent(1, "Q1", "A1");
  await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  // Concept 1 is now scheduled 3 days out, so it's no longer in the due list —
  // but it must still be directly fetchable.
  const res = await fetch(`${base}/api/theory/1`);
  expect(res.status).toBe(200);
  const concept: any = await res.json();
  expect(concept.question).toBe("Q1");
  expect(concept.rung).toBe(0);
});

test("GET /api/theory/:day rejects an out-of-range day with 400", async () => {
  for (const bad of ["0", "151", "abc"]) {
    const res = await fetch(`${base}/api/theory/${bad}`);
    expect(res.status).toBe(400);
  }
});

test("day out of range (0, 151, non-numeric) is rejected with 400 on all per-day routes", async () => {
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

    const contentRes = await putContent(bad, "Q", "A");
    expect(contentRes.status).toBe(400);
  }
});

test("GET /api/theory/next-blank returns concept 1 with its category on a fresh install", async () => {
  const next: any = await (await fetch(`${base}/api/theory/next-blank`)).json();
  expect(next.conceptDay).toBe(1);
  expect(typeof next.category).toBe("string");
  expect(next.category.length).toBeGreaterThan(0);
});

test("GET /api/theory/next-blank advances as content is added", async () => {
  await putContent(1, "Q1", "A1");
  const next: any = await (await fetch(`${base}/api/theory/next-blank`)).json();
  expect(next.conceptDay).toBe(2);
});

test("GET /api/theory/next-blank returns null once all 150 concepts have content", async () => {
  for (let day = 1; day <= 150; day++) await putContent(day, `Q${day}`, `A${day}`);
  const next = await (await fetch(`${base}/api/theory/next-blank`)).json();
  expect(next).toBeNull();
});

test("PUT /api/theory/:day/content saves question and answer", async () => {
  const res = await putContent(3, "What is CAP theorem?", "Consistency, Availability, Partition tolerance.");
  expect(res.status).toBe(200);
  const updated: any = await res.json();
  expect(updated.concept_day).toBe(3);
  expect(updated.question).toBe("What is CAP theorem?");
  expect(updated.answer).toBe("Consistency, Availability, Partition tolerance.");
});

test("PUT /api/theory/:day/content rejects a blank question or answer", async () => {
  const res1 = await putContent(1, "", "An answer");
  expect(res1.status).toBe(400);
  const res2 = await putContent(1, "A question", "");
  expect(res2.status).toBe(400);
});

test("PUT /api/theory/:day/content can overwrite existing content", async () => {
  await putContent(1, "Old Q", "Old A");
  const res = await putContent(1, "New Q", "New A");
  const updated: any = await res.json();
  expect(updated.question).toBe("New Q");
  expect(updated.answer).toBe("New A");
});

test("PUT /api/theory/:day/content defaults answer_format to 'text' when omitted", async () => {
  const res = await putContent(1, "Q", "A");
  const updated: any = await res.json();
  expect(updated.answer_format).toBe("text");
});

test("PUT /api/theory/:day/content accepts 'image' format with a valid URL", async () => {
  const res = await putContent(1, "Q", "https://example.com/pic.png", "image");
  expect(res.status).toBe(200);
  const updated: any = await res.json();
  expect(updated.answer_format).toBe("image");
  expect(updated.answer).toBe("https://example.com/pic.png");
});

test("PUT /api/theory/:day/content accepts 'link' format with a valid URL", async () => {
  const res = await putContent(1, "Q", "https://example.com/article", "link");
  expect(res.status).toBe(200);
  const updated: any = await res.json();
  expect(updated.answer_format).toBe("link");
});

test("PUT /api/theory/:day/content rejects a non-URL answer for 'image'/'link' formats", async () => {
  const imageRes = await putContent(1, "Q", "not a url", "image");
  expect(imageRes.status).toBe(400);
  const linkRes = await putContent(2, "Q", "not a url", "link");
  expect(linkRes.status).toBe(400);
});

test("PUT /api/theory/:day/content rejects a javascript: URL for 'image'/'link' formats", async () => {
  const imageRes = await putContent(1, "Q", "javascript:alert(1)", "image");
  expect(imageRes.status).toBe(400);
  const linkRes = await putContent(2, "Q", "javascript:alert(1)", "link");
  expect(linkRes.status).toBe(400);
});

test("PUT /api/theory/:day/content does not URL-validate plain 'text' answers", async () => {
  const res = await putContent(1, "Q", "just some prose, not a url", "text");
  expect(res.status).toBe(200);
});

test("PUT /api/theory/:day/content silently defaults an unrecognized answerFormat to 'text'", async () => {
  const res = await putContent(1, "Q", "just some prose", "video");
  expect(res.status).toBe(200);
  const updated: any = await res.json();
  expect(updated.answer_format).toBe("text");
});

test("DELETE /api/theory/:day/content clears question, answer, and answer_format to blank", async () => {
  await putContent(1, "Q", "https://example.com/pic.png", "image");
  const res = await fetch(`${base}/api/theory/1/content`, { method: "DELETE" });
  expect(res.status).toBe(200);
  const cleared: any = await res.json();
  expect(cleared.question).toBe("");
  expect(cleared.answer).toBe("");
  expect(cleared.answer_format).toBe("text");
});

test("DELETE /api/theory/:day/content leaves scheduling state untouched", async () => {
  await putContent(1, "Q", "A");
  await fetch(`${base}/api/theory/1/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "correct" }),
  });
  const res = await fetch(`${base}/api/theory/1/content`, { method: "DELETE" });
  const cleared: any = await res.json();
  expect(cleared.rung).toBe(0);
  expect(cleared.next_review).toBe(addDays(localToday(), 3));
});

test("DELETE /api/theory/:day/content removes the concept from the due list", async () => {
  await putContent(1, "Q", "A");
  await fetch(`${base}/api/theory/1/content`, { method: "DELETE" });
  const due: any = await (await fetch(`${base}/api/theory/due`)).json();
  expect(due.due.map((d: any) => d.concept_day)).not.toContain(1);
});

test("DELETE /api/theory/:day/content on an out-of-range day is rejected with 400", async () => {
  for (const bad of ["0", "151", "abc"]) {
    const res = await fetch(`${base}/api/theory/${bad}/content`, { method: "DELETE" });
    expect(res.status).toBe(400);
  }
});
