import type { Database } from "bun:sqlite";
import { listProblems } from "./db";
import { slugFromUrl } from "./leetcode";
import { LEETCODE_150, slugify } from "./leetcode150-content";
import type { Leetcode150Item } from "./leetcode150-content";

const SEED_COMPLETED_COUNT = 29;

export function migrateLeetcode150(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leetcode150_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      completed_count INTEGER NOT NULL
    );
  `);
  const existing = db.query(`SELECT completed_count FROM leetcode150_state WHERE id = 1`).get() as
    | { completed_count: number }
    | null;
  if (!existing) {
    db.query(`INSERT INTO leetcode150_state (id, completed_count) VALUES (1, ?)`).run(SEED_COMPLETED_COUNT);
  }
}

// Self-advances on every read: walks the pointer forward past any entries
// that already have a matching solved `problems` row, persisting the new
// position. This is the only place the pointer moves — there is no hook
// into createProblem/captureSubmission in db.ts/api.ts.
export function getCurrentLeetcode150(db: Database): Leetcode150Item | null {
  const row = db.query(`SELECT completed_count FROM leetcode150_state WHERE id = 1`).get() as {
    completed_count: number;
  };
  let completedCount = row.completed_count;

  const solvedSlugs = new Set(
    listProblems(db)
      .map((p) => slugFromUrl(p.url))
      .filter((s): s is string => s !== null),
  );

  while (
    completedCount < LEETCODE_150.length &&
    solvedSlugs.has(slugify(LEETCODE_150[completedCount]!.title))
  ) {
    completedCount++;
  }

  if (completedCount !== row.completed_count) {
    db.query(`UPDATE leetcode150_state SET completed_count = ? WHERE id = 1`).run(completedCount);
  }

  return completedCount < LEETCODE_150.length ? LEETCODE_150[completedCount]! : null;
}
