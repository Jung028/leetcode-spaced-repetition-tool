import type { Database } from "bun:sqlite";

export interface Todo {
  id: number;
  task: string;
  due_date: string;
  notes: string | null;
  done: boolean;
  done_at: string | null;
  created_at: string;
}

interface TodoRow {
  id: number;
  task: string;
  due_date: string;
  notes: string | null;
  done: number;
  done_at: string | null;
  created_at: string;
}

const toTodo = (row: TodoRow): Todo => ({ ...row, done: row.done === 1 });

export function migrateTodo(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL,
      due_date TEXT NOT NULL,
      notes TEXT,
      done INTEGER NOT NULL DEFAULT 0,
      done_at TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export function createTodo(
  db: Database,
  task: string,
  dueDate: string,
  notes: string | null,
  today: string,
): Todo {
  const row = db
    .query(
      `INSERT INTO todos (task, due_date, notes, done, done_at, created_at)
       VALUES (?, ?, ?, 0, NULL, ?) RETURNING *`,
    )
    .get(task, dueDate, notes, today) as TodoRow;
  return toTodo(row);
}

export function listDueTodos(db: Database, today: string): Todo[] {
  return (
    db
      .query(`SELECT * FROM todos WHERE done = 0 AND due_date <= ? ORDER BY due_date, id`)
      .all(today) as TodoRow[]
  ).map(toTodo);
}

export function countOverdueTodos(db: Database, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM todos WHERE done = 0 AND due_date < ?`)
    .get(today) as { n: number };
  return row.n;
}

export function countTodosCompletedToday(db: Database, today: string): number {
  const row = db
    .query(`SELECT COUNT(*) AS n FROM todos WHERE done = 1 AND done_at = ?`)
    .get(today) as { n: number };
  return row.n;
}

export function listTodosCompletedToday(db: Database, today: string): Todo[] {
  return (
    db.query(`SELECT * FROM todos WHERE done = 1 AND done_at = ? ORDER BY id`).all(today) as TodoRow[]
  ).map(toTodo);
}

export function toggleTodo(db: Database, id: number, today: string): Todo | null {
  const current = db.query(`SELECT * FROM todos WHERE id = ?`).get(id) as TodoRow | null;
  if (!current) return null;
  const nowDone = current.done === 0;
  const row = db
    .query(`UPDATE todos SET done = ?, done_at = ? WHERE id = ? RETURNING *`)
    .get(nowDone ? 1 : 0, nowDone ? today : null, id) as TodoRow;
  return toTodo(row);
}

export function deleteTodo(db: Database, id: number): void {
  db.query(`DELETE FROM todos WHERE id = ?`).run(id);
}
