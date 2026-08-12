// home-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem, reviewProblem } from "./db";
import { migrateTheory, reviewTheoryConcept, saveTheoryContent } from "./theory-db";
import { migrateGoals, createProject, createStep, toggleStep } from "./goals-db";
import { migrateExam, gradeExamAnswer, submitExamPaper } from "./exam-db";
import { buildExamSchedule, weekStartDate, weekDueDate, listExamCourses } from "./exam-content";
import { migrateLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";
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
// A freshly migrated db always has exactly one LeetCode150 pointer item due
// today (due_since seeds to TODAY, so it's never overdue and never
// completed unless a test explicitly solves LEETCODE_150[29] itself — none
// of the existing tests below do, they all use "Two Sum" as their generic
// mock problem, which is never the current pointer's title).
const LEETCODE150_DAILY_DUE = 1;
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateTheory(db, TODAY);
  migrateGoals(db, TODAY);
  migrateExam(db, TODAY);
  migrateLeetcode150(db);
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
  const item = items.find((i) => i.source === "leetcode" && i.title === "Two Sum");
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

test("GET /api/home/due gives every exam item a collision-free id", async () => {
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES ('INFO5995', 1, 2)`).run();

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  const ids = examItems.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length); // no id collisions across any course's items
});

test("GET /api/home/due drops the week item once every paper in it is submitted", async () => {
  const paper = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, true));
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  // Scoped to week 1 (linkId) since INFO5995 Week 2 now has its own real,
  // visible, unsubmitted week item that would otherwise show up here too.
  expect(items.some((i) => i.source === "exam" && i.course === "INFO5995" && i.linkId === 1)).toBe(false);
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
    dueToday: EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE,
    overdue: EXAM_ITEM_COUNTS.overdue,
    completedToday: 0,
  }); // one grouped item per visible, unsubmitted week + the daily LeetCode150 pointer, in whichever bucket its own due date currently falls into
});

test("GET /api/home/stats counts theory concepts once they have content, up to the released cap", async () => {
  for (let day = 1; day <= 5; day++) saveTheoryContent(db, day, `Q${day}`, `A${day}`);
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({
    dueToday: 5 + EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE,
    overdue: EXAM_ITEM_COUNTS.overdue,
    completedToday: 0,
  }); // 5 theory + one exam item per visible, unsubmitted week + the daily LeetCode150 pointer, in whichever bucket its own due date currently falls into
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
  expect(stats.dueToday).toBe(6 + EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE); // leetcode problem + 5 theory concepts + one exam item per due, unsubmitted week + the daily LeetCode150 pointer
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

test("GET /api/home/completed-today includes a submitted exam paper", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i !== 0)); // question 0 wrong, rest correct
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBe(1);
  expect(examItems.every((i) => i.subtitle === "Intro to Cybersecurity")).toBe(true);
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

test("GET /api/home/due includes the LeetCode150 daily pointer with an externalUrl", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const pointer = items.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(pointer).toBeTruthy();
  expect(pointer.title).toBe("209. Minimum Size Subarray Sum");
  expect(pointer.subtitle).toBe("Sliding Window · Medium");
  expect(pointer.overdueDays).toBe(0);
  expect(pointer.externalUrl).toBe("https://leetcode.com/problems/minimum-size-subarray-sum/");
});

test("GET /api/home/due shows the LeetCode150 daily pointer as overdue after a missed day", async () => {
  db.query(`UPDATE leetcode150_state SET due_since = ? WHERE id = 1`).run(addDays(TODAY, -2));
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const pointer = items.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(pointer.overdueDays).toBe(2);
});

test("solving the LeetCode150 daily pointer removes it from due and credits completedToday", async () => {
  createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    TODAY,
  );
  const dueItems: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const stillPending = dueItems.find(
    (i) => i.source === "leetcode" && i.title.startsWith("209."),
  );
  expect(stillPending).toBeFalsy(); // pointer advanced past position 30, so it's no longer today's due item
  // The newly-advanced position (31) isn't due until the day after it was
  // solved either — no leetcode150 pointer item should show up as due today.
  expect(dueItems.some((i) => i.source === "leetcode" && i.externalUrl)).toBe(false);

  const row = db.query(`SELECT due_since FROM leetcode150_state WHERE id = 1`).get() as { due_since: string };
  expect(row.due_since).toBe(addDays(TODAY, 1));

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.completedToday).toBe(1);

  const completedItems: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const solved = completedItems.find((i) => i.source === "leetcode" && i.externalUrl);
  expect(solved).toBeTruthy();
  expect(solved.title).toBe(LEETCODE_150[29]!.number + ". " + LEETCODE_150[29]!.title);
});

test("solving the LeetCode150 daily pointer via a captured review (pass) does not double-count completedToday", async () => {
  const problem = createProblem(
    db,
    { title: LEETCODE_150[29]!.title, url: leetcode150Url(LEETCODE_150[29]!), solution: "x" },
    TODAY,
  );
  reviewProblem(db, problem.id, "pass", TODAY); // simulates the userscript's "Completed" capture path: problem + review row together

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  // Counted once via the ordinary review-based leetcode completedToday count,
  // not a second time via the leetcode150 pointer credit.
  expect(stats.completedToday).toBe(1);

  const completedItems: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const leetcodeItems = completedItems.filter((i) => i.source === "leetcode");
  expect(leetcodeItems.length).toBe(1); // the review-backed entry only, no synthesized pointer duplicate
});
