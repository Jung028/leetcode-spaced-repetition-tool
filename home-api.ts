// home-api.ts
import type { Database } from "bun:sqlite";
import { listProblems, countReviewsToday, listCompletedToday } from "./db";
import { listDueTheory, countTheoryReviewsToday, listTheoryCompletedToday } from "./theory-db";
import { listDueSteps, countStepsCompletedToday, listStepsCompletedOn } from "./goals-db";
import {
  listDueExamPapers,
  listDueExamReviewItems,
  countExamPapersSubmittedToday,
  countExamReviewsToday,
} from "./exam-db";
import { buildExamSchedule } from "./exam-content";
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
}

function overdueDays(dueDate: string, today: string): number {
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(dueDate)) / 86_400_000));
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
  const papers = listDueExamPapers(db, today).map((row) => {
    const content = buildExamSchedule().find((p) => p.paperDay === row.paper_day);
    return {
      source: "exam" as const,
      id: row.paper_day,
      title: content?.title ?? `Exam paper ${row.paper_day}`,
      subtitle: "Exam paper",
      dueDate: row.next_review,
      overdueDays: overdueDays(row.next_review, today),
      linkId: row.paper_day,
    };
  });
  const reviews = listDueExamReviewItems(db, today).map((item) => {
    const content = buildExamSchedule().find((p) => p.paperDay === item.paper_day);
    const question = content?.questions[item.question_index];
    return {
      source: "exam" as const,
      id: item.id,
      title: question ? question.prompt.slice(0, 80) : "Exam review",
      subtitle: "Exam review",
      dueDate: item.next_review,
      overdueDays: overdueDays(item.next_review, today),
      linkId: item.paper_day,
    };
  });
  return [...papers, ...reviews];
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

export interface HomeStats {
  dueToday: number;
  overdue: number;
  completedToday: number;
}

function homeStats(db: Database, today: string): HomeStats {
  const items = [...leetcodeDue(db, today), ...theoryDue(db, today), ...goalsDue(db, today), ...examDue(db, today)];
  return {
    dueToday: items.filter((i) => i.overdueDays === 0).length,
    overdue: items.filter((i) => i.overdueDays > 0).length,
    completedToday:
      countReviewsToday(db, today) +
      countTheoryReviewsToday(db, today) +
      countStepsCompletedToday(db, today) +
      countExamPapersSubmittedToday(db, today) +
      countExamReviewsToday(db, today),
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
        ];
        items.sort((a, b) => a.source.localeCompare(b.source) || a.title.localeCompare(b.title));
        return Response.json(items);
      },
    },
  };
}
