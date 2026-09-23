import type { Database } from "bun:sqlite";
import { addDays } from "../shared/scheduling";

// One table for the whole job hunt. `kind` separates normal roles (the
// application pipeline: To apply → Applied → OA → Interview → Offer) from
// startups (cold outreach: Not started → Contacted → Replied → …).
export type JobKind = "role" | "startup";

export const ROLE_STATUSES = [
  "To apply",
  "Applied",
  "OA",
  "Interview",
  "Offer",
  "Rejected",
  "Skipped",
  "Not submitted",
  "Withdrawn",
] as const;

export const STARTUP_STATUSES = [
  "Not started",
  "Contacted",
  "Replied",
  "Interview",
  "Offer",
  "No reply",
  "Rejected",
] as const;

export const PRIORITIES = ["High", "Medium", "Low"] as const;

// Statuses that end a row's life — nothing left to do, so no Home action.
export const TERMINAL_STATUSES = new Set<string>([
  "Offer",
  "Rejected",
  "Skipped",
  "Not submitted",
  "Withdrawn",
  "No reply",
]);

// How long to wait after the last update before nudging a follow-up.
export const FOLLOW_UP_DAYS: Record<string, number> = {
  Applied: 21,
  OA: 7,
  Interview: 7,
  Contacted: 7, // startup cold message — follow up once after a week
  Replied: 3,
};

// "To apply" rows with a closing date show up on Home this many days early.
export const APPLY_LEAD_DAYS = 3;

// A computed follow-up that has sat unanswered this long after it fell due is
// treated as stale (the company ghosted, or you already chased it) and stops
// nagging on Home. Explicit next-action dates are never dropped.
export const FOLLOW_UP_STALE_DAYS = 14;

export interface Job {
  id: number;
  kind: JobKind;
  company: string;
  role: string | null;
  job_type: string | null;
  cycle: string | null;
  link: string | null;
  notes: string | null;
  status: string;
  priority: string | null;
  intl_ok: string | null;
  closes_on: string | null;
  applied_on: string | null; // applied (roles) or first contacted (startups)
  last_update: string | null;
  next_action: string | null;
  next_action_due: string | null;
  about: string | null;
  created_at: string;
}

export type JobInput = Partial<Omit<Job, "id" | "created_at">> & { company: string };

const FIELDS = [
  "kind",
  "company",
  "role",
  "job_type",
  "cycle",
  "link",
  "notes",
  "status",
  "priority",
  "intl_ok",
  "closes_on",
  "applied_on",
  "last_update",
  "next_action",
  "next_action_due",
  "about",
] as const;

export function statusesFor(kind: JobKind): readonly string[] {
  return kind === "startup" ? STARTUP_STATUSES : ROLE_STATUSES;
}

export function defaultStatus(kind: JobKind): string {
  return kind === "startup" ? "Not started" : "To apply";
}

export function migrateJobs(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL DEFAULT 'role',
      company TEXT NOT NULL,
      role TEXT,
      job_type TEXT,
      cycle TEXT,
      link TEXT,
      notes TEXT,
      status TEXT NOT NULL,
      priority TEXT,
      intl_ok TEXT,
      closes_on TEXT,
      applied_on TEXT,
      last_update TEXT,
      next_action TEXT,
      next_action_due TEXT,
      about TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jobs_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

// Imports the starting data exactly once per database. A flag (not "table is
// empty") guards it, so deleting every row later never brings the seed back.
export function seedJobsOnce(db: Database, rows: JobInput[], today: string): number {
  const seeded = db.query(`SELECT value FROM jobs_meta WHERE key = 'seeded'`).get();
  if (seeded) return 0;
  const tx = db.transaction(() => {
    for (const row of rows) createJob(db, row, today);
    db.query(`INSERT INTO jobs_meta (key, value) VALUES ('seeded', ?)`).run(today);
  });
  tx();
  return rows.length;
}

export function listJobs(db: Database): Job[] {
  return db.query(`SELECT * FROM jobs ORDER BY id`).all() as Job[];
}

export function getJob(db: Database, id: number): Job | null {
  return (db.query(`SELECT * FROM jobs WHERE id = ?`).get(id) as Job | null) ?? null;
}

export function createJob(db: Database, input: JobInput, today: string): Job {
  const kind: JobKind = input.kind === "startup" ? "startup" : "role";
  const row: Record<string, unknown> = { ...input, kind, status: input.status ?? defaultStatus(kind) };
  const values = FIELDS.map((f) => (row[f] === undefined ? null : row[f]));
  return db
    .query(
      `INSERT INTO jobs (${FIELDS.join(", ")}, created_at)
       VALUES (${FIELDS.map(() => "?").join(", ")}, ?) RETURNING *`,
    )
    .get(...(values as never[]), today) as Job;
}

// Partial update. A status change also stamps `last_update`, and the first
// move out of "To apply" / "Not started" stamps `applied_on`, so the Home
// follow-up clock starts without the user having to fill dates in by hand.
export function updateJob(db: Database, id: number, patch: Partial<JobInput>, today: string): Job | null {
  const current = getJob(db, id);
  if (!current) return null;
  const next: Record<string, unknown> = { ...current };
  for (const f of FIELDS) if (patch[f] !== undefined) next[f] = patch[f];

  const statusChanged = patch.status !== undefined && patch.status !== current.status;
  if (statusChanged) {
    if (patch.last_update === undefined) next.last_update = today;
    const leftStart = current.status === "To apply" || current.status === "Not started";
    if (leftStart && !next.applied_on && !TERMINAL_STATUSES.has(String(next.status))) next.applied_on = today;
    // An explicit next action belonged to the old stage — clear it unless replaced.
    if (patch.next_action_due === undefined) next.next_action_due = null;
  }

  return db
    .query(`UPDATE jobs SET ${FIELDS.map((f) => `${f} = ?`).join(", ")} WHERE id = ? RETURNING *`)
    .get(...(FIELDS.map((f) => (next[f] === undefined ? null : next[f])) as never[]), id) as Job;
}

export function deleteJob(db: Database, id: number): boolean {
  return db.query(`DELETE FROM jobs WHERE id = ?`).run(id).changes > 0;
}

export interface JobAction {
  job: Job;
  action: string;
  dueDate: string;
}

// The one thing to do next for a row, and from when. Returns null when there
// is nothing to do: finished rows, a startup nobody has messaged yet (those are
// a pool to pick from, not a daily obligation), a role whose applications have
// already closed, or a follow-up that has gone stale (FOLLOW_UP_STALE_DAYS).
export function nextJobAction(job: Job, today: string): JobAction | null {
  if (TERMINAL_STATUSES.has(job.status)) return null;
  if (job.next_action_due) {
    return { job, action: job.next_action || `Next step: ${job.company}`, dueDate: job.next_action_due };
  }
  if (job.status === "To apply") {
    if (job.closes_on && job.closes_on < today) return null;
    if (job.closes_on) {
      return { job, action: `Apply — closes ${job.closes_on}`, dueDate: addDays(job.closes_on, -APPLY_LEAD_DAYS) };
    }
    if (job.priority === "High") return { job, action: "Apply (high priority)", dueDate: job.created_at };
    return null;
  }
  const wait = FOLLOW_UP_DAYS[job.status];
  const since = job.last_update ?? job.applied_on;
  if (wait && since) {
    const dueDate = addDays(since, wait);
    if (addDays(dueDate, FOLLOW_UP_STALE_DAYS) < today) return null;
    const verb = job.kind === "startup" ? "Follow up on your message" : "Follow up / check status";
    return { job, action: job.next_action || verb, dueDate };
  }
  return null;
}

export function listJobActions(db: Database, today: string): JobAction[] {
  return listJobs(db)
    .map((job) => nextJobAction(job, today))
    .filter((a): a is JobAction => a !== null)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.job.id - b.job.id);
}

// Applications sent / startups first contacted today — counts toward Home's
// "Completed today".
export function listJobsStartedToday(db: Database, today: string): Job[] {
  return db
    .query(`SELECT * FROM jobs WHERE applied_on = ? ORDER BY id`)
    .all(today) as Job[];
}
