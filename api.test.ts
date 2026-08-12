import { test, expect, beforeEach, afterEach } from "bun:test";
import { openDb } from "./db";
import { apiRoutes } from "./api";
import { addDays, localToday } from "./scheduling";
import { migrateLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";

let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  const db = openDb(":memory:");
  migrateLeetcode150(db);
  server = Bun.serve({ port: 0, routes: apiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

const addProblem = (body: object = {
  title: "Two Sum",
  url: "https://leetcode.com/problems/two-sum/",
  solution: "code here",
}) =>
  fetch(`${base}/api/problems`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

test("POST /api/problems creates a scheduled problem", async () => {
  const res = await addProblem();
  expect(res.status).toBe(201);
  const p: any = await res.json();
  expect(p.title).toBe("Two Sum");
  expect(p.rung).toBe(0);
  expect(p.next_review > p.created_at).toBe(true);
});

test("POST /api/problems rejects blank fields", async () => {
  const res = await addProblem({ title: " ", url: "", solution: "x" });
  expect(res.status).toBe(400);
});

test("GET /api/problems lists problems", async () => {
  await addProblem();
  const list: any = await (await fetch(`${base}/api/problems`)).json();
  expect(list.length).toBe(1);
  expect(list[0].title).toBe("Two Sum");
});

test("GET /api/problems/:id returns detail, 404 when missing", async () => {
  const { id } = (await (await addProblem()).json()) as any;
  const detail: any = await (await fetch(`${base}/api/problems/${id}`)).json();
  expect(detail.solution).toBe("code here");
  expect(detail.reviews).toEqual([]);
  expect((await fetch(`${base}/api/problems/999`)).status).toBe(404);
});

test("POST /api/problems/:id/review applies pass/fail, rejects junk", async () => {
  const { id } = (await (await addProblem()).json()) as any;
  const res = await fetch(`${base}/api/problems/${id}/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "pass" }),
  });
  expect(res.status).toBe(200);
  expect(((await res.json()) as any).rung).toBe(1);

  const bad = await fetch(`${base}/api/problems/${id}/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "meh" }),
  });
  expect(bad.status).toBe(400);
});

test("PUT and DELETE /api/problems/:id", async () => {
  const { id } = (await (await addProblem()).json()) as any;
  const put = await fetch(`${base}/api/problems/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "3Sum", url: "https://x", solution: "y" }),
  });
  expect(((await put.json()) as any).title).toBe("3Sum");

  const del = await fetch(`${base}/api/problems/${id}`, { method: "DELETE" });
  expect(del.status).toBe(200);
  expect((await fetch(`${base}/api/problems/${id}`)).status).toBe(404);
});

const capture = (body: object) =>
  fetch(`${base}/api/capture`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

test("POST /api/capture with no result just creates a new problem (plain Add)", async () => {
  const res = await capture({
    title: "3Sum",
    url: "https://leetcode.com/problems/3sum/",
    solution: "class Solution {}",
    language: "java",
  });
  expect(res.status).toBe(201);
  const body: any = await res.json();
  expect(body.created).toBe(true);
  expect(body.rung).toBe(0);
  expect(body.language).toBe("java");
});

test("POST /api/capture with no result on an existing problem updates fields without touching the schedule (plain Add)", async () => {
  const original: any = await (await addProblem()).json();
  const res = await capture({
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/description/?envType=study-plan-v2",
    solution: "updated solution",
    language: "python3",
  });
  expect(res.status).toBe(200);
  const body: any = await res.json();
  expect(body.created).toBe(false);
  expect(body.rung).toBe(original.rung);
  expect(body.next_review).toBe(original.next_review);
  expect(body.language).toBe("python3");
});

test("POST /api/capture with result 'pass' on an unseen slug creates it and immediately advances past the initial rung", async () => {
  const res = await capture({
    title: "3Sum",
    url: "https://leetcode.com/problems/3sum/",
    solution: "class Solution {}",
    language: "java",
    result: "pass",
  });
  expect(res.status).toBe(201);
  const body: any = await res.json();
  expect(body.created).toBe(true);
  expect(body.rung).toBe(1);
  expect(body.next_review).toBe(addDays(localToday(), 3));
});

test("POST /api/capture with result 'pass' updates and advances an existing problem by slug", async () => {
  await addProblem();
  const res = await capture({
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/description/?envType=study-plan-v2",
    solution: "updated solution",
    language: "python3",
    result: "pass",
  });
  expect(res.status).toBe(200);
  const body: any = await res.json();
  expect(body.created).toBe(false);
  expect(body.rung).toBe(1);
  expect(body.language).toBe("python3");
});

test("POST /api/capture rejects blank fields", async () => {
  const res = await capture({ title: "", url: "", solution: "" });
  expect(res.status).toBe(400);
});

test("POST /api/capture with result 'fail' resets an existing problem's ladder", async () => {
  await addProblem();
  await capture({
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    solution: "attempt 1",
    language: "java",
    result: "pass",
  });
  const res = await capture({
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    solution: "attempt 2",
    language: "java",
    result: "fail",
  });
  const body: any = await res.json();
  expect(body.rung).toBe(0);
  expect(body.next_review).toBe(addDays(localToday(), 1));
});

test("GET /api/stats reports how many reviews happened today", async () => {
  const { id } = (await (await addProblem()).json()) as any;
  expect(((await (await fetch(`${base}/api/stats`)).json()) as any).completedToday).toBe(0);

  await fetch(`${base}/api/problems/${id}/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "pass" }),
  });
  expect(((await (await fetch(`${base}/api/stats`)).json()) as any).completedToday).toBe(1);
});

test("GET /api/problems/completed-today lists problems reviewed today only", async () => {
  const { id } = (await (await addProblem()).json()) as any;
  await addProblem({
    title: "3Sum",
    url: "https://leetcode.com/problems/3sum/",
    solution: "y",
  });

  expect(await (await fetch(`${base}/api/problems/completed-today`)).json()).toEqual([]);

  await fetch(`${base}/api/problems/${id}/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ result: "pass" }),
  });
  const completed: any = await (await fetch(`${base}/api/problems/completed-today`)).json();
  expect(completed.length).toBe(1);
  expect(completed[0].title).toBe("Two Sum");
});

test("GET /api/stats credits the LeetCode150 pointer once when solved via plain Add (no review)", async () => {
  const before: any = await (await fetch(`${base}/api/stats`)).json();
  expect(before.completedToday).toBe(0);

  await addProblem({
    title: LEETCODE_150[29]!.title,
    url: leetcode150Url(LEETCODE_150[29]!),
    solution: "x",
  }); // plain "Add problem" — creates a problem row with no review row

  const after: any = await (await fetch(`${base}/api/stats`)).json();
  expect(after.completedToday).toBe(1);
});

test("GET /api/stats does not double-count the LeetCode150 pointer when solved via captured pass (userscript path)", async () => {
  await capture({
    title: LEETCODE_150[29]!.title,
    url: leetcode150Url(LEETCODE_150[29]!),
    solution: "x",
    result: "pass",
  }); // captures both the problem row and a same-day review row in one call

  const stats: any = await (await fetch(`${base}/api/stats`)).json();
  expect(stats.completedToday).toBe(1); // credited once via the review-based count, not again via the pointer credit
});

test("GET /api/problems/completed-today includes a synthesized entry for an Add-problem-only pointer solve", async () => {
  await addProblem({
    title: LEETCODE_150[29]!.title,
    url: leetcode150Url(LEETCODE_150[29]!),
    solution: "x",
  });

  const items: any[] = await (await fetch(`${base}/api/problems/completed-today`)).json();
  const synthesized = items.find((i) => i.id === -1);
  expect(synthesized).toBeTruthy();
  expect(synthesized.title).toBe(`${LEETCODE_150[29]!.number}. ${LEETCODE_150[29]!.title}`);
  expect(synthesized.url).toBe(leetcode150Url(LEETCODE_150[29]!));
});

test("GET /api/problems/completed-today does not add a synthesized entry when the pointer solve is already review-backed", async () => {
  await capture({
    title: LEETCODE_150[29]!.title,
    url: leetcode150Url(LEETCODE_150[29]!),
    solution: "x",
    result: "pass",
  });

  const items: any[] = await (await fetch(`${base}/api/problems/completed-today`)).json();
  expect(items.length).toBe(1); // the review-backed entry only, no synthesized duplicate
  expect(items.every((i) => i.id !== -1)).toBe(true);
});
