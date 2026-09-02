import type { Database } from "bun:sqlite";
import {
  completeDeadline,
  listDeadlineCompletions,
  uncompleteDeadline,
  type DeadlineCompletion,
} from "./deadline-db";
import {
  SEMESTER_DEADLINES,
  deadlineId,
  courseNameFor,
  noteFor,
  type SemesterDeadline,
} from "./semester-deadlines";
import { localToday } from "./shared/scheduling";

const json = (data: unknown, status = 200) => Response.json(data, { status });

// How long a finished deadline lingers (struck-through) before it drops off
// the panel — mirrors the existing "keep a row until 3 days past due" rule
// so completed and past-due items age out on the same clock.
const DONE_GRACE_DAYS = 3;

export interface DeadlineView {
  id: string;
  course: string;
  courseName: string; // plain-English unit name; falls back to the code
  title: string;
  note: string; // one-line "what is this task"; "" when none on file
  weight: string;
  dueDate: string;
  days: number; // whole days until due; negative once past
  completedAt: string | null;
}

function wholeDaysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

// Pure view builder: joins the hand-compiled deadline list with completion
// rows, applies the visibility window, and sorts active-first / soonest-first
// so a struck-through row never pushes a live one down.
export function buildDeadlineViews(
  deadlines: SemesterDeadline[],
  completions: DeadlineCompletion[],
  today: string,
): DeadlineView[] {
  const doneAt = new Map(completions.map((c) => [c.id, c.completed_at]));
  return deadlines
    .map((d) => {
      const id = deadlineId(d);
      return {
        id,
        course: d.course,
        courseName: courseNameFor(d.course),
        title: d.title,
        note: noteFor(d),
        weight: d.weight,
        dueDate: d.dueDate,
        days: wholeDaysBetween(today, d.dueDate),
        completedAt: doneAt.get(id) ?? null,
      };
    })
    .filter((v) =>
      v.completedAt === null
        ? v.days >= -DONE_GRACE_DAYS
        : wholeDaysBetween(v.completedAt, today) <= DONE_GRACE_DAYS,
    )
    .sort(
      (a, b) =>
        (a.completedAt ? 1 : 0) - (b.completedAt ? 1 : 0) ||
        a.days - b.days ||
        a.title.localeCompare(b.title),
    );
}

const KNOWN_IDS = new Set(SEMESTER_DEADLINES.map(deadlineId));

export function deadlineApiRoutes(db: Database) {
  const views = () =>
    buildDeadlineViews(SEMESTER_DEADLINES, listDeadlineCompletions(db), localToday());

  return {
    "/api/deadlines": {
      GET: () => json(views()),
      PATCH: async (req: Request) => {
        const body = (await req.json().catch(() => null)) as
          | { id?: unknown; completed?: unknown }
          | null;
        const id = typeof body?.id === "string" ? body.id : "";
        if (!id || !KNOWN_IDS.has(id)) return json({ error: "unknown deadline" }, 404);
        if (typeof body?.completed !== "boolean") {
          return json({ error: "completed must be a boolean" }, 400);
        }
        if (body.completed) completeDeadline(db, id, localToday());
        else uncompleteDeadline(db, id);
        return json(views());
      },
    },
  };
}
