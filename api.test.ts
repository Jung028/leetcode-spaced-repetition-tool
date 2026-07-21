import { test, expect, beforeEach, afterEach } from "bun:test";
import { openDb } from "./db";
import { apiRoutes } from "./api";

let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  server = Bun.serve({ port: 0, routes: apiRoutes(openDb(":memory:")) });
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
