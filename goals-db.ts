import type { Database } from "bun:sqlite";
import { projectProgress } from "./goals-scheduling";

export interface Project {
  id: number;
  title: string;
  deadline: string;
  created_at: string;
  archived: boolean;
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
}

export function createProject(db: Database, title: string, deadline: string, today: string): Project {
  const row = db
    .query(`INSERT INTO projects (title, deadline, created_at, archived) VALUES (?, ?, ?, 0) RETURNING *`)
    .get(title, deadline, today) as ProjectRow;
  return toProject(row);
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
