import type { Database } from "bun:sqlite";
import { nextStepDueDate, projectProgress } from "./goals-scheduling";

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
  steps: ProjectStep[];
  progress: number;
}

interface ProjectRow {
  id: number;
  title: string;
  deadline: string;
  created_at: string;
  archived: number;
  link: string | null;
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

export function migrateGoals(db: Database): void {
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
    db.query(`SELECT * FROM project_steps WHERE project_id = ? ORDER BY due_date, id`).all(projectId) as ProjectStepRow[]
  ).map(toStep);
}

export function getProjectDetail(db: Database, id: number): ProjectDetail | null {
  const row = getProjectRow(db, id);
  if (!row) return null;
  const steps = listStepsForProject(db, id);
  return { ...toProject(row), steps, progress: projectProgress(steps) };
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
  const existing = listStepsForProject(db, projectId);
  const dueDate = nextStepDueDate({ created_at: project.created_at }, existing, today);
  const row = db
    .query(
      `INSERT INTO project_steps (project_id, label, weight, due_date, done, done_at)
       VALUES (?, ?, ?, ?, 0, NULL) RETURNING *`,
    )
    .get(projectId, label, weight, dueDate) as ProjectStepRow;
  return toStep(row);
}

export function toggleStep(db: Database, stepId: number, today: string): ProjectStep | null {
  const stepRow = db.query(`SELECT * FROM project_steps WHERE id = ?`).get(stepId) as ProjectStepRow | null;
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

export function listDueSteps(db: Database, today: string): (ProjectStep & { project_title: string })[] {
  const rows = db
    .query(
      `SELECT s.*, p.title AS project_title
       FROM project_steps s
       JOIN projects p ON p.id = s.project_id
       WHERE s.due_date <= ? AND s.done = 0 AND p.archived = 0
       ORDER BY s.due_date, s.id`,
    )
    .all(today) as (ProjectStepRow & { project_title: string })[];
  return rows.map((row) => ({ ...toStep(row), project_title: row.project_title }));
}
