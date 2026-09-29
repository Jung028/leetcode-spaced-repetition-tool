const ROADMAP_SHEET_ID = "15GnY0ybJfHnwieykzgSTvtw3dtKU-krxmKIFfs8KWq4";
const ROADMAP_GID = "347329036";

export interface RoadmapRow {
  year: string;
  age: string;
  phase: string;
  mainGoal: string;
  aRaces: string;
  aRaceCount: string;
  runTargets: string;
  bikeTarget: string;
  status: string;
}

export interface RoadmapData {
  rows: RoadmapRow[];
  notes: string[];
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (inQuotes) {
      if (c === '"' && csv[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseRoadmapCsv(csv: string): RoadmapData {
  const [, ...rest] = parseCsvRows(csv);
  const rows: RoadmapRow[] = [];
  let i = 0;
  for (; i < rest.length; i++) {
    const r = rest[i] ?? [];
    if (r.every((cell) => cell.trim() === "")) break;
    const [year, age, phase, mainGoal, aRaces, aRaceCount, runTargets, bikeTarget, status] = r;
    rows.push({
      year: year ?? "",
      age: age ?? "",
      phase: phase ?? "",
      mainGoal: mainGoal ?? "",
      aRaces: aRaces ?? "",
      aRaceCount: aRaceCount ?? "",
      runTargets: runTargets ?? "",
      bikeTarget: bikeTarget ?? "",
      status: status ?? "",
    });
  }

  const notes: string[] = [];
  for (; i < rest.length; i++) {
    const text = (rest[i]?.[1] ?? "").trim();
    if (text && text !== "Notes") notes.push(text);
  }

  return { rows, notes };
}

export async function fetchRoadmapData(): Promise<RoadmapData> {
  const url = `https://docs.google.com/spreadsheets/d/${ROADMAP_SHEET_ID}/export?format=csv&gid=${ROADMAP_GID}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch roadmap sheet: ${res.status}`);
  }
  return parseRoadmapCsv(await res.text());
}
