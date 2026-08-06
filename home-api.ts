// home-api.ts
import type { Database } from "bun:sqlite";
import { listProblems, countReviewsToday, listCompletedToday } from "./db";
import { listDueTheory, countTheoryReviewsToday, listTheoryCompletedToday } from "./theory-db";
import { listDueSteps, countStepsCompletedToday, listStepsCompletedOn } from "./goals-db";
import {
  listExamPaperRows,
  listDueExamReviewItems,
  countExamPapersSubmittedToday,
  countExamReviewsToday,
  listExamPapersSubmittedToday,
  listExamReviewsCompletedToday,
} from "./exam-db";
import { buildExamSchedule, listExamCourses, COURSES, weekStartDate, groupExamPapersByWeek } from "./exam-content";
import { isDue, localToday } from "./scheduling";

export type DueSource = "leetcode" | "theory" | "goals" | "exam";

export interface DueItem {
  source: DueSource;
  id: number;
  title: string;
  subtitle: string;
  dueDate: string;
  overdueDays: number;
  linkId: number;
  course?: string;
}

function overdueDays(dueDate: string, today: string): number {
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(dueDate)) / 86_400_000));
}

// Every exam id below folds in a course-derived offset so two different
// courses' items (e.g. both having a "Week 1") never collide once flattened
// into one cross-course due list — COURSES has at most a handful of entries,
// so a wide fixed stride leaves plenty of headroom under each course's slot.
function courseOffset(course: string): number {
  return COURSES.findIndex((c) => c.code === course) * 100_000_000;
}

function leetcodeDue(db: Database, today: string): DueItem[] {
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

function theoryDue(db: Database, today: string): DueItem[] {
  return listDueTheory(db, today).map((entry) => ({
    source: "theory" as const,
    id: entry.concept_day,
    title: entry.question,
    subtitle: entry.category,
    dueDate: entry.next_review,
    overdueDays: overdueDays(entry.next_review, today),
    linkId: entry.concept_day,
  }));
}

function goalsDue(db: Database, today: string): DueItem[] {
  return listDueSteps(db, today).map((step) => ({
    source: "goals" as const,
    id: step.id,
    title: step.label,
    subtitle: step.project_title,
    dueDate: step.due_date,
    overdueDays: overdueDays(step.due_date, today),
    linkId: step.project_id,
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
    const reviews = listDueExamReviewItems(db, code, today).map((item) => {
      const content = buildExamSchedule().find(
        (p) => p.course === code && p.week === item.week && p.paperNumber === item.paper_number,
      );
      const question = content?.questions[item.question_index];
      return {
        source: "exam" as const,
        id: courseOffset(code) + item.week * 1_000_000 + item.paper_number * 1000 + item.question_index,
        title: question ? question.prompt.slice(0, 80) : "Exam review",
        subtitle: name,
        dueDate: item.next_review,
        overdueDays: overdueDays(item.next_review, today),
        linkId: item.week,
        course: code,
      };
    });
    items.push(...reviews);
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

function theoryCompletedToday(db: Database, today: string): DueItem[] {
  return listTheoryCompletedToday(db, today).map((entry) => ({
    source: "theory" as const,
    id: entry.concept_day,
    title: entry.question,
    subtitle: entry.category,
    dueDate: today,
    overdueDays: 0,
    linkId: entry.concept_day,
  }));
}

function goalsCompletedToday(db: Database, today: string): DueItem[] {
  return listStepsCompletedOn(db, today).map((step) => ({
    source: "goals" as const,
    id: step.id,
    title: step.label,
    subtitle: step.project_title,
    dueDate: today,
    overdueDays: 0,
    linkId: step.project_id,
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
    const reviews = listExamReviewsCompletedToday(db, code, today).map((item) => {
      const content = buildExamSchedule().find(
        (p) => p.course === code && p.week === item.week && p.paperNumber === item.paper_number,
      );
      const question = content?.questions[item.question_index];
      return {
        source: "exam" as const,
        id: courseOffset(code) + item.week * 1_000_000 + item.paper_number * 1000 + item.question_index,
        title: question ? question.prompt.slice(0, 80) : "Exam review",
        subtitle: name,
        dueDate: today,
        overdueDays: 0,
        linkId: item.week,
        course: code,
      };
    });
    items.push(...papers, ...reviews);
  }
  return items;
}

export interface HomeStats {
  dueToday: number;
  overdue: number;
  completedToday: number;
}

function homeStats(db: Database, today: string): HomeStats {
  const items = [...leetcodeDue(db, today), ...theoryDue(db, today), ...goalsDue(db, today), ...examDue(db, today)];
  const examSubmittedToday = listExamCourses().reduce(
    (sum, { code }) => sum + countExamPapersSubmittedToday(db, code, today),
    0,
  );
  const examReviewsToday = listExamCourses().reduce((sum, { code }) => sum + countExamReviewsToday(db, code, today), 0);
  return {
    dueToday: items.filter((i) => i.overdueDays === 0).length,
    overdue: items.filter((i) => i.overdueDays > 0).length,
    completedToday:
      countReviewsToday(db, today) + countTheoryReviewsToday(db, today) + countStepsCompletedToday(db, today) + examSubmittedToday + examReviewsToday,
  };
}

export function homeApiRoutes(db: Database) {
  return {
    "/api/home/due": {
      GET: () => {
        const today = localToday();
        const items = [
          ...leetcodeDue(db, today),
          ...theoryDue(db, today),
          ...goalsDue(db, today),
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
          ...theoryCompletedToday(db, today),
          ...goalsCompletedToday(db, today),
          ...examCompletedToday(db, today),
        ];
        items.sort((a, b) => a.source.localeCompare(b.source) || a.title.localeCompare(b.title));
        return Response.json(items);
      },
    },
  };
}
