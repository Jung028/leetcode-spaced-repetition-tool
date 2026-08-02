import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { addDays } from "./scheduling";
import {
  migrateGoals,
  createProject,
  listProjects,
  getProjectDetail,
  createStep,
  toggleStep,
  listDueSteps,
  countStepsCompletedToday,
  listStepsCompletedOn,
  setProjectLink,
} from "./goals-db";

const TODAY = "2026-07-31";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db, TODAY);
});

test("createProject starts unarchived with no steps", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  expect(p.title).toBe("Complete tracely onboarding");
  expect(p.deadline).toBe("2026-08-10");
  expect(p.created_at).toBe(TODAY);
  expect(p.archived).toBe(false);
});

test("migrateGoals does not reset existing data on a second call", () => {
  createProject(db, "A", "2026-08-10", TODAY);
  migrateGoals(db, TODAY);
  expect(listProjects(db).length).toBe(1);
});

test("listProjects returns only active (non-archived) projects, ordered by deadline", () => {
  createProject(db, "Later", "2026-09-01", TODAY);
  createProject(db, "Sooner", "2026-08-01", TODAY);
  expect(listProjects(db).map((p) => p.title)).toEqual(["Sooner", "Later"]);
});

test("getProjectDetail returns the project with an empty step list and 0 progress", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const detail = getProjectDetail(db, p.id)!;
  expect(detail.steps).toEqual([]);
  expect(detail.progress).toBe(0);
});

test("getProjectDetail on an unknown id returns null", () => {
  expect(getProjectDetail(db, 9999)).toBeNull();
});

test("createStep assigns the project's created_at as the first step's due date", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const step = createStep(db, p.id, "Complete signup page", 20, TODAY)!;
  expect(step.due_date).toBe(TODAY);
  expect(step.weight).toBe(20);
  expect(step.done).toBe(false);
});

test("createStep releases each subsequent step immediately too, while the project is under the backlog cap", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  createStep(db, p.id, "Complete signup page", 20, TODAY);
  const second = createStep(db, p.id, "Complete full test in incognito", 20, TODAY)!;
  expect(second.due_date).toBe(TODAY);
});

test("createStep on an unknown project returns null", () => {
  expect(createStep(db, 9999, "x", 10, TODAY)).toBeNull();
});

test("toggleStep marks a step done and stamps done_at", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const step = createStep(db, p.id, "Complete signup page", 20, TODAY)!;
  const toggled = toggleStep(db, step.id, TODAY)!;
  expect(toggled.done).toBe(true);
  expect(toggled.done_at).toBe(TODAY);
});

test("toggleStep toggles back to undone and clears done_at", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const step = createStep(db, p.id, "Complete signup page", 20, TODAY)!;
  toggleStep(db, step.id, TODAY);
  const untoggled = toggleStep(db, step.id, TODAY)!;
  expect(untoggled.done).toBe(false);
  expect(untoggled.done_at).toBeNull();
});

test("toggleStep on an unknown step returns null", () => {
  expect(toggleStep(db, 9999, TODAY)).toBeNull();
});

test("a project auto-archives once done steps' weights reach 100 and drops off listProjects", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Complete signup page", 60, TODAY)!;
  const s2 = createStep(db, p.id, "Complete full test in incognito", 40, TODAY)!;
  toggleStep(db, s1.id, TODAY);
  toggleStep(db, s2.id, TODAY);
  expect(listProjects(db)).toEqual([]);
  expect(getProjectDetail(db, p.id)!.archived).toBe(true);
});

test("un-toggling a step below 100 re-activates the project", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Complete signup page", 100, TODAY)!;
  toggleStep(db, s1.id, TODAY);
  expect(listProjects(db)).toEqual([]);
  toggleStep(db, s1.id, TODAY);
  expect(listProjects(db).length).toBe(1);
});

test("listDueSteps returns undone steps due today or earlier, joined with project title", () => {
  const p1 = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  createStep(db, p1.id, "Complete signup page", 20, TODAY);
  const p2 = createProject(db, "Later project", "2026-09-01", "2026-08-05");
  createStep(db, p2.id, "Not due yet", 20, "2026-08-05");

  const due = listDueSteps(db, TODAY);
  expect(due.length).toBe(1);
  expect(due[0]!.project_title).toBe("Complete tracely onboarding");
});

test("listDueSteps excludes steps already marked done", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const step = createStep(db, p.id, "Complete signup page", 20, TODAY)!;
  toggleStep(db, step.id, TODAY);
  expect(listDueSteps(db, TODAY)).toEqual([]);
});

test("listDueSteps excludes an undone step whose project has auto-archived", () => {
  // Create the project and both steps with due dates safely in the past so
  // both remain "due" (<= TODAY) without depending on TODAY itself.
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", "2026-07-01");
  const s1 = createStep(db, p.id, "Complete signup page", 100, "2026-07-01")!;
  const s2 = createStep(db, p.id, "Complete full test in incognito", 20, "2026-07-02")!;
  expect(s1.due_date <= TODAY).toBe(true);
  expect(s2.due_date <= TODAY).toBe(true);

  // Toggling only s1 (weight 100) already reaches >= 100%, auto-archiving the
  // project while s2 is left undone and still due.
  toggleStep(db, s1.id, TODAY);
  expect(getProjectDetail(db, p.id)!.archived).toBe(true);

  const due = listDueSteps(db, TODAY);
  expect(due.map((s) => s.id)).not.toContain(s2.id);
});

test("a step past the backlog cap stays hidden from the due list until earlier steps clear", () => {
  const p = createProject(db, "Big project", "2026-09-01", TODAY);
  const steps = Array.from({ length: 6 }, (_, i) => createStep(db, p.id, `Step ${i + 1}`, 10, TODAY)!);

  const due = listDueSteps(db, TODAY);
  expect(due.map((s) => s.id)).toEqual(steps.slice(0, 5).map((s) => s.id));

  toggleStep(db, steps[0]!.id, TODAY);
  const dueAfter = listDueSteps(db, TODAY);
  expect(dueAfter.length).toBe(5);
  expect(dueAfter.map((s) => s.id)).toContain(steps[5]!.id);
});

test("getProjectDetail marks steps released up to the watermark and keeps creation order even as later steps release", () => {
  const p = createProject(db, "Big project", "2026-09-01", TODAY);
  const steps = Array.from({ length: 6 }, (_, i) => createStep(db, p.id, `Step ${i + 1}`, 10, TODAY)!);

  const before = getProjectDetail(db, p.id)!;
  expect(before.steps.map((s) => s.id)).toEqual(steps.map((s) => s.id));
  expect(before.steps.map((s) => s.released)).toEqual([true, true, true, true, true, false]);

  toggleStep(db, steps[0]!.id, TODAY); // clears backlog
  listDueSteps(db, TODAY); // runs the release gate, releasing step 6

  const after = getProjectDetail(db, p.id)!;
  expect(after.steps.map((s) => s.id)).toEqual(steps.map((s) => s.id)); // still creation order, not date order
  expect(after.steps.map((s) => s.released)).toEqual([true, true, true, true, true, true]);
});

test("migrating a pre-existing db backfills steps_released from already-due/done steps, capped at the backlog limit", () => {
  const legacy = new Database(":memory:");
  legacy.exec(`
    CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      deadline TEXT NOT NULL,
      created_at TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE project_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      weight INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT
    );
  `);
  const project = legacy
    .query(`INSERT INTO projects (title, deadline, created_at, archived) VALUES (?, ?, ?, 0) RETURNING *`)
    .get("Old project", "2026-09-01", "2026-07-01") as { id: number };
  const insertStep = legacy.query(
    `INSERT INTO project_steps (project_id, label, weight, due_date, done, done_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
  );
  // 8 steps, all already due under the old day-after-day model — exactly the
  // stuck pile this migration is meant to fix.
  const stepIds: number[] = [];
  for (let i = 1; i <= 8; i++) {
    const row = insertStep.get(project.id, `Step ${i}`, 10, addDays("2026-07-01", i - 1), 0, null) as {
      id: number;
    };
    stepIds.push(row.id);
  }

  migrateGoals(legacy, "2026-07-31");

  const due = listDueSteps(legacy, "2026-07-31");
  expect(due.map((s) => s.id)).toEqual(stepIds.slice(0, 5));
});

test("countStepsCompletedToday counts steps toggled done today, not other days", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Step A", 20, TODAY)!;
  const s2 = createStep(db, p.id, "Step B", 20, TODAY)!;
  toggleStep(db, s1.id, TODAY);
  toggleStep(db, s2.id, "2026-07-25");
  expect(countStepsCompletedToday(db, TODAY)).toBe(1);
});

test("countStepsCompletedToday excludes a step that was toggled done then un-toggled", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Step A", 20, TODAY)!;
  toggleStep(db, s1.id, TODAY);
  toggleStep(db, s1.id, TODAY);
  expect(countStepsCompletedToday(db, TODAY)).toBe(0);
});

test("countStepsCompletedToday is 0 when nothing has been completed", () => {
  expect(countStepsCompletedToday(db, TODAY)).toBe(0);
});

test("listStepsCompletedOn returns steps done today, joined with project title", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Step A", 20, TODAY)!;
  createStep(db, p.id, "Step B (not done)", 20, TODAY);
  toggleStep(db, s1.id, TODAY);

  const completed = listStepsCompletedOn(db, TODAY);
  expect(completed.length).toBe(1);
  expect(completed[0]!.id).toBe(s1.id);
  expect(completed[0]!.project_title).toBe("Complete tracely onboarding");
});

test("listStepsCompletedOn excludes steps done on a different day", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Step A", 20, TODAY)!;
  toggleStep(db, s1.id, "2026-07-25");
  expect(listStepsCompletedOn(db, TODAY)).toEqual([]);
});

test("listStepsCompletedOn includes a step even if its project has since auto-archived", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const s1 = createStep(db, p.id, "Step A", 100, TODAY)!;
  toggleStep(db, s1.id, TODAY); // completes the project, auto-archiving it
  expect(getProjectDetail(db, p.id)!.archived).toBe(true);

  const completed = listStepsCompletedOn(db, TODAY);
  expect(completed.map((s) => s.id)).toContain(s1.id);
});

test("a new project starts with no link", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  expect(p.link).toBeNull();
  expect(getProjectDetail(db, p.id)!.link).toBeNull();
});

test("setProjectLink sets the link on a project", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  const updated = setProjectLink(db, p.id, "https://notion.so/my-project")!;
  expect(updated.link).toBe("https://notion.so/my-project");
  expect(getProjectDetail(db, p.id)!.link).toBe("https://notion.so/my-project");
});

test("setProjectLink can clear a link back to null", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  setProjectLink(db, p.id, "https://notion.so/my-project");
  const cleared = setProjectLink(db, p.id, null)!;
  expect(cleared.link).toBeNull();
});

test("setProjectLink on an unknown project returns null", () => {
  expect(setProjectLink(db, 9999, "https://example.com")).toBeNull();
});
