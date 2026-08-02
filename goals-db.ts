import type { Database } from "bun:sqlite";
import { projectProgress } from "./goals-scheduling";
import { releaseCount, MAX_ACTIVE_BACKLOG } from "./scheduling";

export interface Project {
  id: number;
  title: string;
  deadline: string;
  created_at: string;
  archived: boolean;
  link: string | null;
}

export interface ProjectStep {
  id: number;
  project_id: number;
  label: string;
  weight: number;
  due_date: string;
  done: boolean;
  done_at: string | null;
}

export interface ProjectDetail extends Project {
  steps: (ProjectStep & { released: boolean })[];
  progress: number;
}

interface ProjectRow {
  id: number;
  title: string;
  deadline: string;
  created_at: string;
  archived: number;
  link: string | null;
  steps_released: number;
}

interface ProjectStepRow {
  id: number;
  project_id: number;
  label: string;
  weight: number;
  due_date: string;
  done: number;
  done_at: string | null;
}

const toProject = (row: ProjectRow): Project => ({ ...row, archived: row.archived === 1 });
const toStep = (row: ProjectStepRow): ProjectStep => ({ ...row, done: row.done === 1 });

export function migrateGoals(db: Database, today: string): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      deadline TEXT NOT NULL,
      created_at TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS project_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      weight INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT
    );
  `);

  const columns = db.query(`PRAGMA table_info(projects)`).all() as { name: string }[];
  if (!columns.some((c) => c.name === "link")) {
    db.exec(`ALTER TABLE projects ADD COLUMN link TEXT`);
  }
  if (!columns.some((c) => c.name === "steps_released")) {
    db.exec(`ALTER TABLE projects ADD COLUMN steps_released INTEGER NOT NULL DEFAULT 0`);
    backfillStepsReleased(db, today);
  }
}

// Seeds each existing project's watermark from steps that were already
// done or already due under the old day-after-day model, capped at the
// backlog limit — anything beyond that was just sitting overdue and
// untouched, and is pulled back into the gated queue. Then tops up toward
// the cap with real backlog.
function backfillStepsReleased(db: Database, today: string): void {
  const projects = db.query(`SELECT id FROM projects`).all() as { id: number }[];
  for (const { id } of projects) {
    const steps = db
      .query(`SELECT due_date, done FROM project_steps WHERE project_id = ? ORDER BY id`)
      .all(id) as { due_date: string; done: number }[];
    let released = 0;
    for (const step of steps) {
      if (step.done === 1 || step.due_date <= today) released++;
      else break;
    }
    released = Math.min(released, MAX_ACTIVE_BACKLOG);
    db.query(`UPDATE projects SET steps_released = ? WHERE id = ?`).run(released, id);
    runGoalsReleaseGate(db, id, today);
  }
}

// Advances a project's watermark to bring its visible backlog back up to
// the cap, stamping each newly-released step's due_date as today.
// Idempotent — safe to call on every read and after every step creation.
function runGoalsReleaseGate(db: Database, projectId: number, today: string): void {
  const project = db.query(`SELECT steps_released FROM projects WHERE id = ?`).get(projectId) as
    | { steps_released: number }
    | null;
  if (!project) return;

  const stepIds = (
    db.query(`SELECT id FROM project_steps WHERE project_id = ? ORDER BY id`).all(projectId) as {
      id: number;
    }[]
  ).map((s) => s.id);

  const releasedIds = stepIds.slice(0, project.steps_released);
  const backlog =
    releasedIds.length === 0
      ? 0
      : ((
          db
            .query(
              `SELECT COUNT(*) AS n FROM project_steps
               WHERE id IN (${releasedIds.map(() => "?").join(",")}) AND due_date <= ? AND done = 0`,
            )
            .get(...releasedIds, today) as { n: number }
        ).n);

  const remaining = stepIds.length - project.steps_released;
  const toRelease = releaseCount(backlog, remaining);
  if (toRelease === 0) return;

  const newlyReleased = stepIds.slice(project.steps_released, project.steps_released + toRelease);
  for (const id of newlyReleased) {
    db.query(`UPDATE project_steps SET due_date = ? WHERE id = ?`).run(today, id);
  }
  db.query(`UPDATE projects SET steps_released = ? WHERE id = ?`).run(
    project.steps_released + toRelease,
    projectId,
  );
}

export function createProject(db: Database, title: string, deadline: string, today: string): Project {
  const row = db
    .query(`INSERT INTO projects (title, deadline, created_at, archived) VALUES (?, ?, ?, 0) RETURNING *`)
    .get(title, deadline, today) as ProjectRow;
  return toProject(row);
}

export function setProjectLink(db: Database, id: number, link: string | null): Project | null {
  const row = db
    .query(`UPDATE projects SET link = ? WHERE id = ? RETURNING *`)
    .get(link, id) as ProjectRow | null;
  return row ? toProject(row) : null;
}

export function listProjects(db: Database): Project[] {
  return (db.query(`SELECT * FROM projects WHERE archived = 0 ORDER BY deadline, id`).all() as ProjectRow[]).map(
    toProject,
  );
}

function getProjectRow(db: Database, id: number): ProjectRow | null {
  return db.query(`SELECT * FROM projects WHERE id = ?`).get(id) as ProjectRow | null;
}

function listStepsForProject(db: Database, projectId: number): ProjectStep[] {
  return (
    db.query(`SELECT * FROM project_steps WHERE project_id = ? ORDER BY id`).all(projectId) as ProjectStepRow[]
  ).map(toStep);
}

export function getProjectDetail(db: Database, id: number): ProjectDetail | null {
  const row = getProjectRow(db, id);
  if (!row) return null;
  const steps = listStepsForProject(db, id);
  const stepsWithReleased = steps.map((s, i) => ({ ...s, released: i < row.steps_released }));
  return { ...toProject(row), steps: stepsWithReleased, progress: projectProgress(steps) };
}

export function createStep(
  db: Database,
  projectId: number,
  label: string,
  weight: number,
  today: string,
): ProjectStep | null {
  const project = getProjectRow(db, projectId);
  if (!project) return null;
  const row = db
    .query(
      `INSERT INTO project_steps (project_id, label, weight, due_date, done, done_at)
       VALUES (?, ?, ?, ?, 0, NULL) RETURNING *`,
    )
    .get(projectId, label, weight, project.created_at) as ProjectStepRow;
  runGoalsReleaseGate(db, projectId, today);
  return toStep(getStepRow(db, row.id)!);
}

function getStepRow(db: Database, id: number): ProjectStepRow | null {
  return db.query(`SELECT * FROM project_steps WHERE id = ?`).get(id) as ProjectStepRow | null;
}

export function toggleStep(db: Database, stepId: number, today: string): ProjectStep | null {
  const stepRow = getStepRow(db, stepId);
  if (!stepRow) return null;

  const nowDone = stepRow.done === 0;
  const updated = db
    .query(`UPDATE project_steps SET done = ?, done_at = ? WHERE id = ? RETURNING *`)
    .get(nowDone ? 1 : 0, nowDone ? today : null, stepId) as ProjectStepRow;

  const steps = listStepsForProject(db, stepRow.project_id);
  const progress = projectProgress(steps);
  db.query(`UPDATE projects SET archived = ? WHERE id = ?`).run(progress >= 100 ? 1 : 0, stepRow.project_id);

  return toStep(updated);
}

export function countStepsCompletedToday(db: Database, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM project_steps WHERE done = 1 AND done_at = ?`)
    .get(today) as { n: number };
  return row.n;
}

export function listStepsCompletedOn(db: Database, today: string): (ProjectStep & { project_title: string })[] {
  const rows = db
    .query(
      `SELECT s.*, p.title AS project_title
       FROM project_steps s
       JOIN projects p ON p.id = s.project_id
       WHERE s.done = 1 AND s.done_at = ?
       ORDER BY s.due_date, s.id`,
    )
    .all(today) as (ProjectStepRow & { project_title: string })[];
  return rows.map((row) => ({ ...toStep(row), project_title: row.project_title }));
}

export function listDueSteps(db: Database, today: string): (ProjectStep & { project_title: string })[] {
  for (const { id } of listProjects(db)) {
    runGoalsReleaseGate(db, id, today);
  }
  const rows = db
    .query(
      `SELECT s.*, p.title AS project_title
       FROM project_steps s
       JOIN projects p ON p.id = s.project_id
       WHERE s.due_date <= ? AND s.done = 0 AND p.archived = 0
         AND (
           SELECT COUNT(*) FROM project_steps s2
           WHERE s2.project_id = s.project_id AND s2.id <= s.id
         ) <= p.steps_released
       ORDER BY s.due_date, s.id`,
    )
    .all(today) as (ProjectStepRow & { project_title: string })[];
  return rows.map((row) => ({ ...toStep(row), project_title: row.project_title }));
}
