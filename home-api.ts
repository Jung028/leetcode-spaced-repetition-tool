// home-api.ts
import type { Database } from "bun:sqlite";
import { listProblems } from "./db";
import { listDueTheory } from "./theory-db";
import { listDueSteps } from "./goals-db";
import { isDue, localToday } from "./scheduling";
import { buildTheorySchedule } from "./theory-content";

const SCHEDULE = buildTheorySchedule();

export type DueSource = "leetcode" | "theory" | "goals";

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
  return listDueTheory(db, today)
    .filter((entry) => SCHEDULE[entry.concept_day - 1])
    .map((entry) => {
      const concept = SCHEDULE[entry.concept_day - 1]!;
      return {
        source: "theory" as const,
        id: entry.concept_day,
        title: concept.question,
        subtitle: concept.category,
        dueDate: entry.next_review,
        overdueDays: overdueDays(entry.next_review, today),
        linkId: entry.concept_day,
      };
    });
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

export function homeApiRoutes(db: Database) {
  return {
    "/api/home/due": {
      GET: () => {
        const today = localToday();
        const items = [...leetcodeDue(db, today), ...theoryDue(db, today), ...goalsDue(db, today)];
        items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        return Response.json(items);
      },
    },
  };
}
