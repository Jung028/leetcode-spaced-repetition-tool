import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem } from "../leetcode/db";
import { migrateInterview } from "./db";
import { interviewApiRoutes } from "./api";
import { allSystemDesignQuestions } from "./content";
import { addDays, localToday } from "../shared/scheduling";

const TODAY = localToday();
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateInterview(db);
  server = Bun.serve({ port: 0, routes: interviewApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/interview/today creates and returns today's session", async () => {
  const view: any = await (await fetch(`${base}/api/interview/today`)).json();
  expect(view.date).toBe(TODAY);
  expect(view.sdQuestion.id).toBe(allSystemDesignQuestions()[0]!.id);
  expect(view.sdQuestion.diagram).toBe(allSystemDesignQuestions()[0]!.diagram);
  expect(view.sdQuestion.diagram).toContain("flowchart");
  expect(view.leetcodeProblemId).toBeNull();
  expect(view.completedAt).toBeNull();
});

test("GET /api/interview/today includes the due LeetCode problem", async () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "x" },
    addDays(TODAY, -1),
  );
  const view: any = await (await fetch(`${base}/api/interview/today`)).json();
  expect(view.leetcodeProblemId).toBe(problem.id);
});

test("POST /api/interview/today/start-coding then pause-coding tracks elapsed time", async () => {
  const started: any = await (await fetch(`${base}/api/interview/today/start-coding?date=${TODAY}`, { method: "POST" })).json();
  expect(started.codingRunningSince).not.toBeNull();
  const paused: any = await (await fetch(`${base}/api/interview/today/pause-coding?date=${TODAY}`, { method: "POST" })).json();
  expect(paused.codingRunningSince).toBeNull();
  expect(paused.codingElapsedSeconds).toBeGreaterThanOrEqual(0);
});

test("POST /api/interview/today/start-coding rejects a stale date", async () => {
  const res = await fetch(`${base}/api/interview/today/start-coding?date=${addDays(TODAY, -1)}`, { method: "POST" });
  expect(res.status).toBe(409);
});

test("POST /api/interview/today/start-design then pause-design tracks elapsed time", async () => {
  const started: any = await (await fetch(`${base}/api/interview/today/start-design?date=${TODAY}`, { method: "POST" })).json();
  expect(started.designRunningSince).not.toBeNull();
  const paused: any = await (await fetch(`${base}/api/interview/today/pause-design?date=${TODAY}`, { method: "POST" })).json();
  expect(paused.designRunningSince).toBeNull();
});

test("POST /api/interview/today/design-answer saves the answer and scene", async () => {
  const updated: any = await (
    await fetch(`${base}/api/interview/today/design-answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: TODAY, answer: "my approach", scene: JSON.stringify({ elements: [] }) }),
    })
  ).json();
  expect(updated.sdAnswer).toBe("my approach");
  expect(updated.sdExcalidrawScene).toBe(JSON.stringify({ elements: [] }));
});

test("POST /api/interview/today/design-answer rejects a stale date", async () => {
  const res = await fetch(`${base}/api/interview/today/design-answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ date: addDays(TODAY, -1), answer: "my approach", scene: null }),
  });
  expect(res.status).toBe(409);
});

test("POST /api/interview/today/reveal sets sdRevealedAt", async () => {
  const updated: any = await (await fetch(`${base}/api/interview/today/reveal?date=${TODAY}`, { method: "POST" })).json();
  expect(updated.sdRevealedAt).not.toBeNull();
});

test("POST /api/interview/today/rubric saves the checked array and rejects a non-boolean-array body", async () => {
  const rubricLength = allSystemDesignQuestions()[0]!.rubric.length;
  const checked = new Array(rubricLength).fill(false).map((_, i) => i === 0);
  const updated: any = await (
    await fetch(`${base}/api/interview/today/rubric`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: TODAY, checked }),
    })
  ).json();
  expect(updated.sdRubricChecked).toEqual(checked);

  const badRes = await fetch(`${base}/api/interview/today/rubric`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ date: TODAY, checked: "nope" }),
  });
  expect(badRes.status).toBe(400);
});

test("POST /api/interview/today/rubric rejects a stale date", async () => {
  const res = await fetch(`${base}/api/interview/today/rubric`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ date: addDays(TODAY, -1), checked: [] }),
  });
  expect(res.status).toBe(409);
});

test("POST /api/interview/today/next replaces the question and resets today's progress", async () => {
  const before: any = await (await fetch(`${base}/api/interview/today`)).json();
  await fetch(`${base}/api/interview/today/design-answer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ date: TODAY, answer: "my approach", scene: null }),
  });
  await fetch(`${base}/api/interview/today/reveal?date=${TODAY}`, { method: "POST" });

  const after: any = await (await fetch(`${base}/api/interview/today/next?date=${TODAY}`, { method: "POST" })).json();
  expect(after.date).toBe(TODAY);
  expect(after.sdQuestion.id).not.toBe(before.sdQuestion.id);
  expect(after.sdAnswer).toBe("");
  expect(after.sdRevealedAt).toBeNull();
  expect(after.completedAt).toBeNull();
});

test("POST /api/interview/today/next rejects a stale date", async () => {
  const res = await fetch(`${base}/api/interview/today/next?date=${addDays(TODAY, -1)}`, { method: "POST" });
  expect(res.status).toBe(409);
});
