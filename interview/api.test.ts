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

test("POST /api/interview/today/start-coding sets codingStartedAt once", async () => {
  const first: any = await (await fetch(`${base}/api/interview/today/start-coding`, { method: "POST" })).json();
  expect(first.codingStartedAt).not.toBeNull();
  const second: any = await (await fetch(`${base}/api/interview/today/start-coding`, { method: "POST" })).json();
  expect(second.codingStartedAt).toBe(first.codingStartedAt);
});

test("POST /api/interview/today/start-design sets designStartedAt once", async () => {
  const first: any = await (await fetch(`${base}/api/interview/today/start-design`, { method: "POST" })).json();
  expect(first.designStartedAt).not.toBeNull();
});

test("POST /api/interview/today/design-answer saves the answer and scene", async () => {
  const updated: any = await (
    await fetch(`${base}/api/interview/today/design-answer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answer: "my approach", scene: JSON.stringify({ elements: [] }) }),
    })
  ).json();
  expect(updated.sdAnswer).toBe("my approach");
  expect(updated.sdExcalidrawScene).toBe(JSON.stringify({ elements: [] }));
});

test("POST /api/interview/today/reveal sets sdRevealedAt", async () => {
  const updated: any = await (await fetch(`${base}/api/interview/today/reveal`, { method: "POST" })).json();
  expect(updated.sdRevealedAt).not.toBeNull();
});

test("POST /api/interview/today/rubric saves the checked array and rejects a non-boolean-array body", async () => {
  const rubricLength = allSystemDesignQuestions()[0]!.rubric.length;
  const checked = new Array(rubricLength).fill(false).map((_, i) => i === 0);
  const updated: any = await (
    await fetch(`${base}/api/interview/today/rubric`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checked }),
    })
  ).json();
  expect(updated.sdRubricChecked).toEqual(checked);

  const badRes = await fetch(`${base}/api/interview/today/rubric`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ checked: "nope" }),
  });
  expect(badRes.status).toBe(400);
});
