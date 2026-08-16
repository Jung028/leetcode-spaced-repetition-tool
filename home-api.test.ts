// home-api.test.ts
import { test, expect, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";
import { openDb, createProblem, reviewProblem } from "./db";
import { migrateTodo, createTodo, toggleTodo } from "./todo-db";
import { migrateExam, gradeExamAnswer, submitExamPaper } from "./exam-db";
import { buildExamSchedule, weekStartDate, weekDueDate, listExamCourses, SEMESTER_START } from "./exam-content";
import { migrateLeetcode150 } from "./leetcode150-db";
import { LEETCODE_150, leetcode150Url } from "./leetcode150-content";
import { homeApiRoutes } from "./home-api";
import { localToday, addDays } from "./scheduling";

const TODAY = localToday();
function examWeekItemCounts(): { dueToday: number; overdue: number } {
  let dueToday = 0;
  let overdue = 0;
  for (const { code } of listExamCourses()) {
    const weeks = new Set(buildExamSchedule().filter((p) => p.course === code).map((p) => p.week));
    for (const week of weeks) {
      if (weekStartDate(week) > TODAY) continue;
      if (weekDueDate(week) < TODAY) overdue++;
      else dueToday++;
    }
  }
  return { dueToday, overdue };
}
const EXAM_ITEM_COUNTS = examWeekItemCounts();
const LEETCODE150_DAILY_DUE = 1;
let db: Database;
let server: ReturnType<typeof Bun.serve>;
let base: string;

beforeEach(() => {
  db = openDb(":memory:");
  migrateTodo(db);
  migrateExam(db, TODAY);
  migrateLeetcode150(db);
  server = Bun.serve({ port: 0, routes: homeApiRoutes(db) });
  base = server.url.origin;
});

afterEach(() => server.stop(true));

test("GET /api/home/due includes a due todo", async () => {
  createTodo(db, "Write the SA for project", TODAY, null, TODAY);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "todo" && i.title === "Write the SA for project")).toBe(true);
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

test("GET /api/home/due excludes a todo that isn't due yet", async () => {
  createTodo(db, "Not due yet", addDays(TODAY, 20), null, TODAY);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "todo")).toBe(false);
});

test("GET /api/home/due includes this week's exam item", async () => {
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  expect(examItems.length).toBe(EXAM_ITEM_COUNTS.dueToday + EXAM_ITEM_COUNTS.overdue);
  const info5995Item = examItems.find((i) => i.course === "INFO5995" && i.linkId === 1)!;
  expect(info5995Item).toBeTruthy();
  expect(info5995Item.linkId).toBe(1);
  expect(info5995Item.title).toContain("Week 1");
});

test("GET /api/home/due gives every exam item a collision-free id", async () => {
  db.query(`INSERT INTO exam_papers (course, week, paper_number) VALUES ('INFO5995', 1, 2)`).run();

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const examItems = items.filter((i) => i.source === "exam");
  const ids = examItems.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test("GET /api/home/due drops the week item once every paper in it is submitted", async () => {
  const paper = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, true));
  submitExamPaper(db, "INFO5995", 1, 1, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  expect(items.some((i) => i.source === "exam" && i.course === "INFO5995" && i.linkId === 1)).toBe(false);
});

test("GET /api/home/due sorts all sources together by due date ascending", async () => {
  const beforeSemester = addDays(SEMESTER_START, -1);
  createTodo(db, "Overdue todo", beforeSemester, null, beforeSemester);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const dueDates = items.map((i) => i.dueDate);
  expect(dueDates).toEqual([...dueDates].sort());
  expect(items[0]!.source).toBe("todo");
});

test("GET /api/home/stats starts with one exam item per course (besides the daily LeetCode150 pointer) when there are no todos", async () => {
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({
    dueToday: EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE,
    overdue: EXAM_ITEM_COUNTS.overdue,
    completedToday: 0,
  });
});

test("GET /api/home/stats counts due todos", async () => {
  for (let i = 0; i < 5; i++) createTodo(db, `Task ${i}`, TODAY, null, TODAY);
  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats).toEqual({
    dueToday: 5 + EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE,
    overdue: EXAM_ITEM_COUNTS.overdue,
    completedToday: 0,
  });
});

test("GET /api/home/stats counts dueToday and overdue across all three sources", async () => {
  createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  for (let i = 0; i < 5; i++) createTodo(db, `Task ${i}`, TODAY, null, TODAY);
  createTodo(db, "Overdue todo", addDays(TODAY, -3), null, addDays(TODAY, -3));

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.dueToday).toBe(6 + EXAM_ITEM_COUNTS.dueToday + LEETCODE150_DAILY_DUE);
  expect(stats.overdue).toBe(1 + EXAM_ITEM_COUNTS.overdue);
});

test("GET /api/home/stats counts completedToday across all three sources", async () => {
  const problem = createProblem(
    db,
    { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", solution: "code" },
    addDays(TODAY, -1),
  );
  reviewProblem(db, problem.id, "pass", TODAY);
  const todo = createTodo(db, "Task", TODAY, null, TODAY);
  toggleTodo(db, todo.id, TODAY);

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.completedToday).toBe(2);
});

test("GET /api/home/stats counts a submitted exam paper as completed today", async () => {
  const before: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(before.completedToday).toBe(0);

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
  const todo = createTodo(db, "Task", TODAY, null, TODAY);
  toggleTodo(db, todo.id, TODAY);

  const items: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  expect(items.length).toBe(2);
  expect(items.every((i) => i.dueDate === TODAY)).toBe(true);
  expect(items.every((i) => i.overdueDays === 0)).toBe(true);
  expect(items.some((i) => i.source === "leetcode" && i.title === "Two Sum")).toBe(true);
  expect(items.some((i) => i.source === "todo" && i.title === "Task")).toBe(true);
});

test("GET /api/home/completed-today includes a submitted exam paper", async () => {
  const paper1 = buildExamSchedule().find((p) => p.course === "INFO5995" && p.week === 1 && p.paperNumber === 1)!;
  paper1.questions.forEach((_, i) => gradeExamAnswer(db, "INFO5995", 1, 1, i, i !== 0));
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
  createTodo(db, "Due today", TODAY, null, TODAY);
  const items: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const todoToday = items.find((i) => i.source === "todo" && i.title === "Due today")!;
  expect(todoToday.overdueDays).toBe(0);

  createTodo(db, "Overdue", addDays(TODAY, -3), null, addDays(TODAY, -3));
  const items2: any[] = await (await fetch(`${base}/api/home/due`)).json();
  const overdueItem = items2.find((i) => i.source === "todo" && i.title === "Overdue")!;
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
  expect(stillPending).toBeFalsy();
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
  reviewProblem(db, problem.id, "pass", TODAY);

  const stats: any = await (await fetch(`${base}/api/home/stats`)).json();
  expect(stats.completedToday).toBe(1);

  const completedItems: any[] = await (await fetch(`${base}/api/home/completed-today`)).json();
  const leetcodeItems = completedItems.filter((i) => i.source === "leetcode");
  expect(leetcodeItems.length).toBe(1);
});
