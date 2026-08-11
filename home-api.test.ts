// home-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem, reviewProblem } from "./db";
import { migrateTheory, reviewTheoryConcept, saveTheoryContent } from "./theory-db";
import { migrateGoals, createProject, createStep, toggleStep } from "./goals-db";
import { migrateExam, gradeExamAnswer, submitExamPaper, reviewExamItem } from "./exam-db";
import { buildExamSchedule, weekStartDate, weekDueDate, listExamCourses } from "./exam-content";
import { homeApiRoutes } from "./home-api";
import { localToday, addDays } from "./scheduling";

const TODAY = localToday();
// Each course's due date per week is fixed (SEMESTER_START is a literal),
// but "today" is the real wall clock, and different courses can sit at
// different numbers of weeks-with-content — so rather than assuming one
// due-item per course, this walks every course's actual weeks and buckets
// each visible, unsubmitted week by whether its due date has passed yet.
// This keeps the stats tests below correct as more weeks are authored and
// as the real calendar advances, without hardcoding a per-course count.
function examWeekItemCounts(): { dueToday: number; overdue: number } {
  let dueToday = 0;
  let overdue = 0;
  for (const { code } of listExamCourses()) {
    const weeks = new Set(buildExamSchedule().filter((p) => p.course === code).map((p) => p.week));
    for (const week of weeks) {
      if (weekStartDate(week) > TODAY) continue; // not visible yet
      if (weekDueDate(week) < TODAY) overdue++;
      else dueToday++;
    }
  }
  return { dueToday, overdue };
}
const EXAM_ITEM_COUNTS = examWeekItemCounts();
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
  expect(examItems.length).toBe(EXAM_ITEM_COUNTS.dueToday + EXAM_ITEM_COUNTS.overdue); // each visible, unsubmitted week collapses into one due-item
  const info5995Item = examItems.find((i) => i.course === "INFO5995" && i.linkId === 1)!;
  expect(info5995Item).toBeTruthy();
  expect(info5995Item.linkId).toBe(1); // week 1
  expect(info5995Item.title).toContain("Week 1");
});

test("GET /api/home/due gives the week item and exam review items collision-free ids", async () => {
  // Every real week is a single combined paper now, so a submitted week's
  // item disappears entirely. To get a week item and a review item
  // coexisting under the same course/week without depending on a second
  // week's real-calendar visibility date, manually seed a synthetic second
  // paper row for INFO5995's week 1 — groupExamPapersByWeek falls back to a
  // generic title for rows without matching content, so this doesn't need
  // real multi-paper content to exist.
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES ('INFO5995', 1, 2)`).run();

  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, 1, addDays(TODAY, -1)); // review item's next_review lands on TODAY

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  const info5995Items = examItems.filter((i) => i.course === "INFO5995");
  // The week item (synthetic paper 2 still unsubmitted) and review item (paper 1's wrong question) coexist distinctly.
  expect(info5995Items.length).toBe(2);
  const weekItem = info5995Items.find((i) => i.title.includes("submitted"));
  const reviewItem = info5995Items.find((i) => i.title.includes("review"));
  expect(weekItem).toBeTruthy();
  expect(weekItem.title).toBe("Week 1 (1/2 submitted)");
  expect(reviewItem).toBeTruthy();
  expect(reviewItem.title).toBe("Week 1 review (1 due)");
  const ids = examItems.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length); // no id collisions across any course's items
});

test("GET /api/home/due collapses a week's multiple due exam review items into one row", async () => {
  const paper = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  // Grade the first three questions wrong (and everything else right) so submitting
  // creates three separate exam_review_items rows, all due today.
  paper.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i >= 3));
  submitExamPaper(db, "INFO5995", 1, 1, addDays(TODAY, -1)); // review items' next_review lands on TODAY

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const info5995Items = items.filter((i) => i.source === "exam" && i.course === "INFO5995");
  // Three wrong answers in the same week must show up as one due-item, not three.
  expect(info5995Items.length).toBe(1);
  expect(info5995Items[0].title).toBe("Week 1 review (3 due)");
  expect(info5995Items[0].linkId).toBe(1);
});

test("GET /api/home/due drops the week item once every paper in it is submitted", async () => {
  const paper = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, true));
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "exam" && i.course === "INFO5995")).toBe(false);
});

test("GET /api/home/due sorts all sources together by due date ascending", async () => {
  const project = createProject(db, "Complete tracely onboarding", addDays(TODAY, 10), addDays(TODAY, -5));
  createStep(db, project.id, "Overdue step", 20, addDays(TODAY, -5));
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const dueDates = items.map((i) => i.dueDate);
  expect(dueDates).toEqual([...dueDates].sort());
  expect(items[0]!.source).toBe("goals");
});

test("GET /api/home/stats starts with one exam item per course (this week, besides theory) when theory concepts are all blank", async () => {
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({
    dueToday: EXAM_ITEM_COUNTS.dueToday,
    overdue: EXAM_ITEM_COUNTS.overdue,
    completedToday: 0,
  }); // one grouped item per visible, unsubmitted week, in whichever bucket its own due date currently falls into
});

test("GET /api/home/stats counts theory concepts once they have content, up to the released cap", async () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({
    dueToday: 5 + EXAM_ITEM_COUNTS.dueToday,
    overdue: EXAM_ITEM_COUNTS.overdue,
    completedToday: 0,
  }); // 5 theory + one exam item per visible, unsubmitted week, in whichever bucket its own due date currently falls into
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
  expect(stats.dueToday).toBe(6 + EXAM_ITEM_COUNTS.dueToday); // leetcode problem + 5 theory concepts + one exam item per due, unsubmitted week
  expect(stats.overdue).toBe(1 + EXAM_ITEM_COUNTS.overdue); // the goals step, plus one exam item per overdue, unsubmitted week
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
