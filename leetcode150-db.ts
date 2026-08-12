import type { Database } from "bun:sqlite";
import { listProblems, listCompletedToday } from "./db";
import { slugFromUrl } from "./leetcode";
import { LEETCODE_150, leetcode150Url, slugify } from "./leetcode150-content";
import type { Leetcode150Item } from "./leetcode150-content";
import { addDays, isDue } from "./scheduling";

const SEED_COMPLETED_COUNT = 29;

export function migrateLeetcode150(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leetcode150_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      completed_count INTEGER NOT NULL
    );
  `);
  const columns = db.query(`PRAGMA table_info(leetcode150_state)`).all() as { name: string }[];
  if (!columns.some((c) => c.name === "due_since")) {
    db.exec(`ALTER TABLE leetcode150_state ADD COLUMN due_since TEXT`);
  }
  if (!columns.some((c) => c.name === "last_completed_date")) {
    db.exec(`ALTER TABLE leetcode150_state ADD COLUMN last_completed_date TEXT`);
  }
  const existing = db.query(`SELECT completed_count FROM leetcode150_state WHERE id = 1`).get() as
    | { completed_count: number }
    | null;
  if (!existing) {
    db.query(`INSERT INTO leetcode150_state (id, completed_count) VALUES (1, ?)`).run(SEED_COMPLETED_COUNT);
  }
}

export interface CurrentLeetcode150 {
  item: (Leetcode150Item & { dueSince: string }) | null;
  completedCount: number;
  lastCompletedDate: string | null;
}

// Self-advances on every read: walks the pointer forward past any entries
// that already have a matching solved `problems` row, persisting the new
// position. This is the only place the pointer moves — there is no hook
// into createProblem/captureSubmission in db.ts/api.ts.
//
// due_since tracks when the CURRENT pointer position became due (seeds to
// `today` on first read, resets to the day AFTER today whenever the pointer
// advances — a newly-due item doesn't count as due again the same day it
// was just solved, and only goes overdue if a full day is genuinely missed.
// This is what lets callers compute overdueDays for a daily quota with no
// calendar date of its own). last_completed_date tracks the most recent
// day an advance happened (one credit per day, not one per position, even
// if multiple positions advance in a single call).
export function getCurrentLeetcode150(db: Database, today: string): CurrentLeetcode150 {
  const row = db
    .query(`SELECT completed_count, due_since, last_completed_date FROM leetcode150_state WHERE id = 1`)
    .get() as {
    completed_count: number;
    due_since: string | null;
    last_completed_date: string | null;
  };
  let completedCount = row.completed_count;
  let dueSince = row.due_since ?? today;

  const solvedSlugs = new Set(
    listProblems(db)
      .map((p) => slugFromUrl(p.url)?.toLowerCase() ?? null)
      .filter((s): s is string => s !== null),
  );

  const startCount = completedCount;
  while (
    completedCount < LEETCODE_150.length &&
    solvedSlugs.has(slugify(LEETCODE_150[completedCount]!.title))
  ) {
    completedCount++;
  }

  let lastCompletedDate = row.last_completed_date;
  if (completedCount > startCount) {
    dueSince = addDays(today, 1);
    lastCompletedDate = today;
  }

  if (
    completedCount !== row.completed_count ||
    dueSince !== row.due_since ||
    lastCompletedDate !== row.last_completed_date
  ) {
    db.query(
      `UPDATE leetcode150_state SET completed_count = ?, due_since = ?, last_completed_date = ? WHERE id = 1`,
    ).run(completedCount, dueSince, lastCompletedDate);
  }

  return {
    item: completedCount < LEETCODE_150.length ? { ...LEETCODE_150[completedCount]!, dueSince } : null,
    completedCount,
    lastCompletedDate,
  };
}

// Whether today's pointer advance (if any) should grant a fresh
// "completed today" credit, or null if nothing was solved today. Skips
// crediting when the same problem already has a same-day `reviews` row
// (e.g. captured via the userscript's "Completed" button, which creates
// both the problem row and a review row in one operation) — that solve is
// already counted by the ordinary review-based completed-today path, and
// crediting it again here would double-count the same real solve. Only
// credits when the solve was captured WITHOUT a same-day review (e.g. the
// manual "Add problem" form, which creates a problem row with no review).
export function leetcode150CompletedCredit(
  db: Database,
  today: string,
  current: CurrentLeetcode150,
): (Leetcode150Item & { url: string }) | null {
  const { completedCount, lastCompletedDate } = current;
  if (lastCompletedDate !== today || completedCount === 0) return null;
  const solved = LEETCODE_150[completedCount - 1]!;
  const url = leetcode150Url(solved);
  const slug = slugify(solved.title);
  const alreadyCountedByReview = listCompletedToday(db, today).some(
    (p) => slugFromUrl(p.url)?.toLowerCase() === slug,
  );
  if (alreadyCountedByReview) return null;
  return { ...solved, url };
}
