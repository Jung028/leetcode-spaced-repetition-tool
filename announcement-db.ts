import type { Database } from "bun:sqlite";

export interface Announcement {
  id: number;
  message: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface AnnouncementRow {
  id: number;
  message: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

const toAnnouncement = (row: AnnouncementRow): Announcement => ({ ...row, completed: row.completed === 1 });

export function migrateAnnouncements(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function createAnnouncement(db: Database, message: string, today: string): Announcement {
  const row = db
    .query(
      `INSERT INTO announcements (message, completed, created_at, updated_at)
       VALUES (?, 0, ?, ?) RETURNING *`,
    )
    .get(message, today, today) as AnnouncementRow;
  return toAnnouncement(row);
}

// Active reminders first (newest first), completed ones after (newest
// first) so a struck-through item doesn't push active reminders down.
export function listAnnouncements(db: Database): Announcement[] {
  return (
    db
      .query(`SELECT * FROM announcements ORDER BY completed ASC, id DESC`)
      .all() as AnnouncementRow[]
  ).map(toAnnouncement);
}

export function updateAnnouncement(
  db: Database,
  id: number,
  message: string,
  today: string,
): Announcement | null {
  const row = db
    .query(`UPDATE announcements SET message = ?, updated_at = ? WHERE id = ? RETURNING *`)
    .get(message, today, id) as AnnouncementRow | null;
  return row ? toAnnouncement(row) : null;
}

export function toggleAnnouncement(db: Database, id: number, today: string): Announcement | null {
  const current = db.query(`SELECT * FROM announcements WHERE id = ?`).get(id) as AnnouncementRow | null;
  if (!current) return null;
  const nowCompleted = current.completed === 0;
  const row = db
    .query(`UPDATE announcements SET completed = ?, updated_at = ? WHERE id = ? RETURNING *`)
    .get(nowCompleted ? 1 : 0, today, id) as AnnouncementRow;
  return toAnnouncement(row);
}

export function deleteAnnouncement(db: Database, id: number): boolean {
  return db.query(`DELETE FROM announcements WHERE id = ?`).run(id).changes > 0;
}
