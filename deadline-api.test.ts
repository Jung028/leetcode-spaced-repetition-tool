import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { migrateDeadlines, completeDeadline } from "./deadline-db";
import { deadlineApiRoutes, buildDeadlineViews } from "./deadline-api";
import { SEMESTER_DEADLINES, deadlineId } from "./semester-deadlines";

let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = new Database(":memory:");
  migrateDeadlines(db);
  server = Bun.serve({ port: 0, routes: deadlineApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

const DL = (over: Partial<(typeof SEMESTER_DEADLINES)[number]>) => ({
  course: "INFO5995",
  title: "Project 1",
  weight: "20%",
  dueDate: "2026-09-13",
  source: "manual" as const,
  ...over,
});

test("buildDeadlineViews drops uncompleted rows more than 3 days past due", () => {
  const rows = buildDeadlineViews([DL({ dueDate: "2026-08-20" })], [], "2026-09-02");
  expect(rows).toEqual([]);
});

test("buildDeadlineViews keeps an uncompleted row due within the last 3 days", () => {
  const rows = buildDeadlineViews([DL({ dueDate: "2026-08-30" })], [], "2026-09-02");
  expect(rows.map((r) => r.days)).toEqual([-3]);
  expect(rows[0]!.completedAt).toBeNull();
});

test("buildDeadlineViews attaches the full course name and, when on file, a description", () => {
  const known = buildDeadlineViews(
    [DL({ course: "COMP5348", title: "Assignment 1", dueDate: "2026-09-20" })],
    [],
    "2026-09-02",
  )[0]!;
  expect(known.courseName).toBe("Enterprise Scale Software Architecture");
  expect(known.note).toBe("Individual paper-based exercises (3 questions) on Weeks 1–6 material; submit a PDF via Canvas.");

  const unknown = buildDeadlineViews(
    [DL({ course: "XYZ9999", title: "Mystery task", dueDate: "2026-09-20" })],
    [],
    "2026-09-02",
  )[0]!;
  expect(unknown.courseName).toBe("XYZ9999"); // falls back to the code
  expect(unknown.note).toBe(""); // no blurb on file
});

test("buildDeadlineViews keeps a freshly completed row, drops one completed >3 days ago", () => {
  const fresh = DL({ title: "Project 1", dueDate: "2026-09-13" });
  const stale = DL({ title: "Early feedback quiz", dueDate: "2026-08-30" });
  const rows = buildDeadlineViews(
    [fresh, stale],
    [
      { id: deadlineId(fresh), completed_at: "2026-08-31" }, // 2 days ago -> shown
      { id: deadlineId(stale), completed_at: "2026-08-20" }, // 13 days ago -> hidden
    ],
    "2026-09-02",
  );
  expect(rows.map((r) => r.title)).toEqual(["Project 1"]);
  expect(rows[0]!.completedAt).toBe("2026-08-31");
});

test("buildDeadlineViews sorts incomplete before complete, then soonest first", () => {
  const a = DL({ title: "A", dueDate: "2026-09-20" });
  const b = DL({ title: "B", dueDate: "2026-09-05" });
  const c = DL({ title: "C", dueDate: "2026-09-10" });
  const rows = buildDeadlineViews(
    [a, b, c],
    [{ id: deadlineId(b), completed_at: "2026-09-02" }],
    "2026-09-02",
  );
  expect(rows.map((r) => r.title)).toEqual(["C", "A", "B"]);
});

test("GET /api/deadlines returns the live list with completedAt fields", async () => {
  const res = await fetch(`${base}/api/deadlines`);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.every((r: { id: string; completedAt: string | null }) => "id" in r && "completedAt" in r)).toBe(true);
});

test("PATCH /api/deadlines marks one done, then GET reflects it", async () => {
  const target = SEMESTER_DEADLINES.find((d) => d.title === "Early feedback quiz")!;
  const id = deadlineId(target);
  const res = await fetch(`${base}/api/deadlines`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, completed: true }),
  });
  expect(res.status).toBe(200);
  const list = (await res.json()) as { id: string; completedAt: string | null }[];
  expect(list.find((r) => r.id === id)?.completedAt).toBeTruthy();
});

test("PATCH /api/deadlines can undo a completion", async () => {
  const target = SEMESTER_DEADLINES.find((d) => d.title === "Project 1")!;
  const id = deadlineId(target);
  completeDeadline(db, id, "2026-09-02");
  const res = await fetch(`${base}/api/deadlines`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, completed: false }),
  });
  expect(res.status).toBe(200);
  const list = (await res.json()) as { id: string; completedAt: string | null }[];
  expect(list.find((r) => r.id === id)?.completedAt ?? null).toBeNull();
});

test("PATCH /api/deadlines rejects an unknown id with 404", async () => {
  const res = await fetch(`${base}/api/deadlines`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: "MADE|Up|2026-01-01", completed: true }),
  });
  expect(res.status).toBe(404);
});

test("PATCH /api/deadlines rejects a non-boolean completed with 400", async () => {
  const id = deadlineId(SEMESTER_DEADLINES[0]!);
  const res = await fetch(`${base}/api/deadlines`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, completed: "yes" }),
  });
  expect(res.status).toBe(400);
});
