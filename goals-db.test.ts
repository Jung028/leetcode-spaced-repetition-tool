import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateGoals,
  createProject,
  listProjects,
  getProjectDetail,
  createStep,
  toggleStep,
  listDueSteps,
  countStepsCompletedToday,
} from "./goals-db";

const TODAY = "2026-07-31";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateGoals(db);
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
  migrateGoals(db);
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

test("createStep assigns each subsequent step the day after the previous one", () => {
  const p = createProject(db, "Complete tracely onboarding", "2026-08-10", TODAY);
  createStep(db, p.id, "Complete signup page", 20, TODAY);
  const second = createStep(db, p.id, "Complete full test in incognito", 20, TODAY)!;
  expect(second.due_date).toBe("2026-08-01");
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
