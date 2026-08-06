// home-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem, reviewProblem } from "./db";
import { migrateTheory, reviewTheoryConcept, saveTheoryContent } from "./theory-db";
import { migrateGoals, createProject, createStep, toggleStep } from "./goals-db";
import { migrateExam, gradeExamAnswer, submitExamPaper, reviewExamItem } from "./exam-db";
import { buildExamSchedule } from "./exam-content";
import { homeApiRoutes } from "./home-api";
import { localToday, addDays, MAX_ACTIVE_BACKLOG } from "./scheduling";

const TODAY = localToday();
// migrateExam releases papers up to the backlog cap immediately, so a fresh
// db already has this many exam papers due today before any test acts.
// Weekly pacing has no backlog cap — every paper in the current week (Week 1,
// which TODAY falls inside) is due at once, so this is simply that week's
// paper count for INFO5995, not a capped value.
const EXAM_DUE_ON_MIGRATE = buildExamSchedule().filter((p) => p.course === "INFO5995" && p.week === 1).length;
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateTheory(db, TODAY);
  migrateGoals(db, TODAY);
  migrateExam(db, TODAY);
  server = Bun.serve({ port: 0, routes: homeApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/home/due includes a theory concept once it has content", async () => {
  saveTheoryContent(db, 1, "Q1", "A1");
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "theory" && i.linkId === 1)).toBe(true);
});

test("GET /api/home/due includes a due LeetCode problem", async () => {
  createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const item = items.find((i) => i.source === "leetcode");
  expect(item).toBeTruthy();
  expect(item.title).toBe("Two Sum");
  expect(item.subtitle).toBe("java");
});

test("GET /api/home/due includes a due Goals step, with the project title as subtitle", async () => {
  const project = createProject(db, "Complete tracely onboarding", addDays(TODAY, 10), TODAY);
  createStep(db, project.id, "Complete signup page", 20, TODAY);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const item = items.find((i) => i.source === "goals");
  expect(item).toBeTruthy();
  expect(item.title).toBe("Complete signup page");
  expect(item.subtitle).toBe("Complete tracely onboarding");
  expect(item.linkId).toBe(project.id);
});

test("GET /api/home/due excludes a Goals step that isn't due yet", async () => {
  const project = createProject(db, "Later project", addDays(TODAY, 30), addDays(TODAY, 20));
  createStep(db, project.id, "Not due yet", 20, addDays(TODAY, 20));
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "goals")).toBe(false);
});

test("GET /api/home/due includes this week's exam item", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBe(1); // Week 1's 3 papers collapse into one due-item
  expect(examItems[0]!.linkId).toBe(1); // week 1
  expect(examItems[0]!.title).toContain("Week 1");
});

test("GET /api/home/due gives the week item and exam review items collision-free ids", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, 1, addDays(TODAY, -1)); // review item's next_review lands on TODAY

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  // The week item (papers 2/3 still unsubmitted) and the review item (paper 1's wrong question) coexist distinctly.
  expect(examItems.length).toBe(2);
  const weekItem = examItems.find((i) => i.title.startsWith("Week "));
  const reviewItem = examItems.find((i) => !i.title.startsWith("Week "));
  expect(weekItem).toBeTruthy();
  expect(weekItem.title).toBe("Week 1 (1/3 submitted)");
  expect(reviewItem).toBeTruthy();
  const ids = examItems.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length); // no id collisions between the week item and the review item
});

test("GET /api/home/due drops the week item once every paper in it is submitted", async () => {
  for (const paperNumber of [1, 2, 3] as const) {
    const paper = buildExamSchedule().find(
      (p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === paperNumber,
    )!;
    paper.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, paperNumber, i, true));
    submitExamPaper(db, "INFO5995", 1, paperNumber, TODAY);
  }

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "exam")).toBe(false);
});

test("GET /api/home/due sorts all sources together by due date ascending", async () => {
  const project = createProject(db, "Complete tracely onboarding", addDays(TODAY, 10), addDays(TODAY, -5));
  createStep(db, project.id, "Overdue step", 20, addDays(TODAY, -5));
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const dueDates = items.map((i) => i.dueDate);
  expect(dueDates).toEqual([...dueDates].sort());
  expect(items[0]!.source).toBe("goals");
});

test("GET /api/home/stats starts with 1 exam item (this week, besides theory) when theory concepts are all blank", async () => {
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: 1, overdue: 0, completedToday: 0 }); // 1 grouped week-item, not EXAM_DUE_ON_MIGRATE papers
});

test("GET /api/home/stats counts theory concepts once they have content, up to the released cap", async () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({ dueToday: 6, overdue: 0, completedToday: 0 }); // 5 theory + 1 exam week-item
});

test("GET /api/home/stats counts dueToday and overdue across all four sources", async () => {
  createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  ); // due today
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const overdueProject = createProject(db, "Overdue project", addDays(TODAY, 10), addDays(TODAY, -3));
  createStep(db, overdueProject.id, "Overdue step", 20, addDays(TODAY, -3)); // overdue

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.dueToday).toBe(7); // leetcode problem + 5 theory concepts + 1 exam week-item
  expect(stats.overdue).toBe(1); // the goals step
});

test("GET /api/home/stats counts completedToday across all three sources", async () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  reviewProblem(db, problem.id, "pass", TODAY);
  reviewTheoryConcept(db, 1, "correct", TODAY);
  const project = createProject(db, "Complete tracely onboarding", addDays(TODAY, 10), TODAY);
  const step = createStep(db, project.id, "Complete signup page", 20, TODAY)!;
  toggleStep(db, step.id, TODAY);

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.completedToday).toBe(3);
});

test("GET /api/home/stats counts a submitted exam paper as completed today", async () => {
  const before: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(before.completedToday).toBe(0);

  // home-api.test.ts doesn't mount exam routes (only homeApiRoutes), so grade
  // and submit directly via exam-db against the same db instance, mirroring
  // how the goals/theory completions above are set up through their own db
  // layers rather than through HTTP.
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, true));
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const after: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(after.completedToday).toBe(1);
});

test("GET /api/home/completed-today merges completions across all three sources", async () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  reviewProblem(db, problem.id, "pass", TODAY);
  saveTheoryContent(db, 1, "Q1", "A1");
  reviewTheoryConcept(db, 1, "correct", TODAY);
  const project = createProject(db, "Complete tracely onboarding", addDays(TODAY, 10), TODAY);
  const step = createStep(db, project.id, "Complete signup page", 20, TODAY)!;
  toggleStep(db, step.id, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  expect(items.length).toBe(3);
  expect(items.every((i) => i.dueDate === TODAY)).toBe(true);
  expect(items.every((i) => i.overdueDays === 0)).toBe(true);
  expect(items.some((i) => i.source === "leetcode" && i.title === "Two Sum")).toBe(true);
  expect(items.some((i) => i.source === "theory" && i.linkId === 1)).toBe(true);
  expect(items.some((i) => i.source === "goals" && i.title === "Complete signup page")).toBe(true);
});

test("GET /api/home/completed-today includes a submitted exam paper and a reviewed exam item", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, 1, TODAY); // creates a review item for question 0
  reviewExamItem(db, "INFO5995", 1, 1, 0, "correct", TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBe(2); // the submitted paper + the reviewed question
  expect(examItems.every((i) => i.subtitle === "Intro to Cybersecurity")).toBe(true);
  expect(new Set(examItems.map((i) => i.id)).size).toBe(2); // distinct ids
  expect(items.every((i) => i.dueDate === TODAY && i.overdueDays === 0)).toBe(true);
});

test("GET /api/home/completed-today is empty when nothing was completed today", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  expect(items).toEqual([]);
});

test("overdueDays is 0 for an item due today and positive for an overdue item", async () => {
  saveTheoryContent(db, 1, "Q1", "A1");
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const conceptOne = items.find((i) => i.source === "theory" && i.linkId === 1)!;
  expect(conceptOne.overdueDays).toBe(0);

  const project = createProject(db, "Overdue project", addDays(TODAY, 10), addDays(TODAY, -3));
  createStep(db, project.id, "Overdue step", 20, addDays(TODAY, -3));
  const items2: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const overdueItem = items2.find((i) => i.source === "goals")!;
  expect(overdueItem.overdueDays).toBe(3);
});
