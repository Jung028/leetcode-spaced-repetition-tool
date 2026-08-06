import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem } from "./db";
import { localToday } from "./scheduling";
import { migrateLeetcode150 } from "./leetcode150-db";
import { leetcode150ApiRoutes } from "./leetcode150-api";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateLeetcode150(db);
  server = Bun.serve({ port: 0, routes: leetcode150ApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/leetcode150/current returns the seeded current problem", async () => {
  const res = await fetch(`${base}/api/leetcode150/current`);
  expect(res.status).toBe(200);
  const body: any = await res.json();
  expect(body.position).toBe(30);
  expect(body.number).toBe(209);
  expect(body.title).toBe("Minimum Size Subarray Sum");
  expect(body.topic).toBe("Sliding Window");
  expect(body.difficulty).toBe("Medium");
  expect(body.url).toBe("https://leetcode.com/problems/minimum-size-subarray-sum/");
});

test("GET /api/leetcode150/current reflects advancement after a solve", async () => {
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    localToday(),
  );
  const body: any = await (await fetch(`${base}/api/leetcode150/current`)).json();
  expect(body.position).toBe(31);
});

test("GET /api/leetcode150/current returns done:true once all 150 are complete", async () => {
  db.query(`UPDATE leetcode150_state SET completed_count = 150 WHERE id = 1`).run();
  const body: any = await (await fetch(`${base}/api/leetcode150/current`)).json();
  expect(body).toEqual({ done: true });
});
