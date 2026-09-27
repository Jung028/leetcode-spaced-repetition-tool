import type { Database } from "bun:sqlite";

export interface Race {
  id: number;
  name: string;
  discipline: string | null;
  location: string | null;
  date: string | null;
  approx_year: number | null;
  notes: string | null;
  created_at: string;
}

export interface RaceInput {
  name: string;
  discipline?: string | null;
  location?: string | null;
  date?: string | null;
  approxYear?: number | null;
  notes?: string | null;
}

export function migrateRaces(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS races (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      discipline TEXT,
      location TEXT,
      date TEXT,
      approx_year INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS races_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function createRace(db: Database, input: RaceInput, today: string): Race {
  return db
    .query(
      `INSERT INTO races (name, discipline, location, date, approx_year, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .get(
      input.name,
      input.discipline ?? null,
      input.location ?? null,
      input.date ?? null,
      input.approxYear ?? null,
      input.notes ?? null,
      today,
    ) as Race;
}

function raceSortKey(r: Race): [number, string] {
  if (r.date) return [0, r.date];
  if (r.approx_year != null) return [1, String(r.approx_year).padStart(4, "0")];
  return [2, ""];
}

function compareRaces(a: Race, b: Race): number {
  const [tierA, keyA] = raceSortKey(a);
  const [tierB, keyB] = raceSortKey(b);
  if (tierA !== tierB) return tierA - tierB;
  if (keyA !== keyB) return keyA < keyB ? -1 : 1;
  return a.id - b.id;
}

export function listRaces(db: Database): Race[] {
  const rows = db.query(`SELECT * FROM races`).all() as Race[];
  return rows.sort(compareRaces);
}

export function updateRace(db: Database, id: number, input: RaceInput): Race | null {
  const row = db
    .query(
      `UPDATE races SET name = ?, discipline = ?, location = ?, date = ?, approx_year = ?, notes = ?
       WHERE id = ? RETURNING *`,
    )
    .get(
      input.name,
      input.discipline ?? null,
      input.location ?? null,
      input.date ?? null,
      input.approxYear ?? null,
      input.notes ?? null,
      id,
    ) as Race | undefined;
  return row ?? null;
}

export function deleteRace(db: Database, id: number): boolean {
  return db.query(`DELETE FROM races WHERE id = ?`).run(id).changes > 0;
}

export function seedRacesOnce(db: Database, rows: RaceInput[], today: string): number {
  const seeded = db.query(`SELECT value FROM races_meta WHERE key = 'seeded'`).get();
  if (seeded) return 0;
  const tx = db.transaction(() => {
    for (const row of rows) createRace(db, row, today);
    db.query(`INSERT INTO races_meta (key, value) VALUES ('seeded', ?)`).run(today);
  });
  tx();
  return rows.length;
}
