// home-api.ts
import type { Database } from "bun:sqlite";
import { listProblems, countReviewsToday, listCompletedToday, levelDueLeetcode } from "./db";
import { listDueTodos, countTodosCompletedToday, listTodosCompletedToday } from "./todo-db";
import { listExamPaperRows, countExamPapersSubmittedToday, listExamPapersSubmittedToday } from "./exam-db";
import { buildExamSchedule, listExamCourses, COURSES, weekStartDate, groupExamPapersByWeek } from "./exam-content";
import { getCurrentLeetcode150, leetcode150CompletedCredit } from "./leetcode150-db";
import type { CurrentLeetcode150 } from "./leetcode150-db";
import { leetcode150Url } from "./leetcode150-content";
import { isDue, localToday, overdueDays } from "./scheduling";

export type DueSource = "leetcode" | "todo" | "exam";

export interface DueItem {
  source: DueSource;
  id: number;
  title: string;
  subtitle: string;
  dueDate: string;
  overdueDays: number;
  linkId: number;
  course?: string;
  // Set only for the LeetCode150 daily pointer item, which has no
  // `problems`-table row to deep-link to — clients should open this URL
  // directly instead of dispatching the normal source-based navigation.
  externalUrl?: string;
}

// Every exam id below folds in a course-derived offset so two different
// courses' items (e.g. both having a "Week 1") never collide once flattened
// into one cross-course due list — COURSES has at most a handful of entries,
// so a wide fixed stride leaves plenty of headroom under each course's slot.
function courseOffset(course: string): number {
  return COURSES.findIndex((c) => c.code === course) * 100_000_000;
}

function leetcodeDue(db: Database, today: string): DueItem[] {
  levelDueLeetcode(db, today);
  return listProblems(db)
    .filter((p) => isDue(p.next_review, today))
    .map((p) => ({
      source: "leetcode" as const,
      id: p.id,
      title: p.title,
      subtitle: p.language,
      dueDate: p.next_review,
      overdueDays: overdueDays(p.next_review, today),
      linkId: p.id,
    }));
}

// `current` lets callers that already fetched getCurrentLeetcode150 this
// request (e.g. homeStats, which also needs leetcode150CompletedToday) pass
// the result in directly. getCurrentLeetcode150 self-advances/mutates on
// read, so it must be called at most once per incoming request — omit the
// param and it fetches fresh, for callers that only need this one value.
function leetcode150Due(db: Database, today: string, current: CurrentLeetcode150 = getCurrentLeetcode150(db, today)): DueItem[] {
  const { item } = current;
  if (!item || !isDue(item.dueSince, today)) return [];
  return [
    {
      source: "leetcode" as const,
      id: -1,
      title: `${item.number}. ${item.title}`,
      subtitle: `${item.topic} · ${item.difficulty}`,
      dueDate: item.dueSince,
      overdueDays: overdueDays(item.dueSince, today),
      linkId: -1,
      externalUrl: leetcode150Url(item),
    },
  ];
}

function todoDue(db: Database, today: string): DueItem[] {
  return listDueTodos(db, today).map((t) => ({
    source: "todo" as const,
    id: t.id,
    title: t.task,
    subtitle: t.notes ?? "",
    dueDate: t.due_date,
    overdueDays: overdueDays(t.due_date, today),
    linkId: t.id,
  }));
}

function examDue(db: Database, today: string): DueItem[] {
  const items: DueItem[] = [];
  for (const { code, name } of listExamCourses()) {
    const visibleRows = listExamPaperRows(db, code).filter((r) => weekStartDate(r.week) <= today);
    const weeks = groupExamPapersByWeek(code, visibleRows, today).filter((w) => w.papers.some((p) => !p.submitted));
    for (const week of weeks) {
      const submittedCount = week.papers.filter((p) => p.submitted).length;
      items.push({
        source: "exam" as const,
        id: courseOffset(code) + week.week,
        title: `Week ${week.week} (${submittedCount}/${week.papers.length} submitted)`,
        subtitle: name,
        dueDate: week.dueDate,
        overdueDays: overdueDays(week.dueDate, today),
        linkId: week.week,
        course: code,
      });
    }
  }
  return items;
}

function leetcodeCompletedToday(db: Database, today: string): DueItem[] {
  return listCompletedToday(db, today).map((p) => ({
    source: "leetcode" as const,
    id: p.id,
    title: p.title,
    subtitle: p.language,
    dueDate: today,
    overdueDays: 0,
    linkId: p.id,
  }));
}

// See leetcode150Due's `current` param note above — same reasoning applies here.
function leetcode150CompletedToday(db: Database, today: string, current: CurrentLeetcode150 = getCurrentLeetcode150(db, today)): DueItem[] {
  const credit = leetcode150CompletedCredit(db, today, current);
  if (!credit) return [];
  return [
    {
      source: "leetcode" as const,
      id: -1,
      title: `${credit.number}. ${credit.title}`,
      subtitle: `${credit.topic} · ${credit.difficulty}`,
      dueDate: today,
      overdueDays: 0,
      linkId: -1,
      externalUrl: credit.url,
    },
  ];
}

function todoCompletedToday(db: Database, today: string): DueItem[] {
  return listTodosCompletedToday(db, today).map((t) => ({
    source: "todo" as const,
    id: t.id,
    title: t.task,
    subtitle: t.notes ?? "",
    dueDate: today,
    overdueDays: 0,
    linkId: t.id,
  }));
}

function examCompletedToday(db: Database, today: string): DueItem[] {
  const items: DueItem[] = [];
  for (const { code, name } of listExamCourses()) {
    const papers = listExamPapersSubmittedToday(db, code, today).map((row) => {
      const content = buildExamSchedule().find(
        (p) => p.course === code && p.week === row.week && p.paperNumber === row.paper_number,
      );
      return {
        source: "exam" as const,
        id: courseOffset(code) + row.week * 1000 + row.paper_number,
        title: content?.title ?? `Week ${row.week} Paper ${row.paper_number}`,
        subtitle: name,
        dueDate: today,
        overdueDays: 0,
        linkId: row.week,
        course: code,
      };
    });
    items.push(...papers);
  }
  return items;
}

export interface HomeStats {
  dueToday: number;
  overdue: number;
  completedToday: number;
}

function homeStats(db: Database, today: string): HomeStats {
  // Fetched once and threaded into both leetcode150Due/leetcode150CompletedToday
  // below — getCurrentLeetcode150 self-advances/mutates on read, so this
  // handler must not call it more than once.
  const leetcode150 = getCurrentLeetcode150(db, today);
  const items = [
    ...leetcodeDue(db, today),
    ...leetcode150Due(db, today, leetcode150),
    ...todoDue(db, today),
    ...examDue(db, today),
  ];
  const examSubmittedToday = listExamCourses().reduce(
    (sum, { code }) => sum + countExamPapersSubmittedToday(db, code, today),
    0,
  );
  const leetcode150CompletedCount = leetcode150CompletedToday(db, today, leetcode150).length;
  return {
    dueToday: items.filter((i) => i.overdueDays === 0).length,
    overdue: items.filter((i) => i.overdueDays > 0).length,
    completedToday:
      countReviewsToday(db, today) +
      countTodosCompletedToday(db, today) +
      examSubmittedToday +
      leetcode150CompletedCount,
  };
}

export function homeApiRoutes(db: Database) {
  return {
    "/api/home/due": {
      GET: () => {
        const today = localToday();
        const items = [
          ...leetcodeDue(db, today),
          ...leetcode150Due(db, today),
          ...todoDue(db, today),
          ...examDue(db, today),
        ];
        items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        return Response.json(items);
      },
    },
    "/api/home/stats": {
      GET: () => Response.json(homeStats(db, localToday())),
    },
    "/api/home/completed-today": {
      GET: () => {
        const today = localToday();
        const items = [
          ...leetcodeCompletedToday(db, today),
          ...leetcode150CompletedToday(db, today),
          ...todoCompletedToday(db, today),
          ...examCompletedToday(db, today),
        ];
        items.sort((a, b) => a.source.localeCompare(b.source) || a.title.localeCompare(b.title));
        return Response.json(items);
      },
    },
  };
}
