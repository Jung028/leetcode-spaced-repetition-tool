const ROADMAP_SHEET_ID = "15GnY0ybJfHnwieykzgSTvtw3dtKU-krxmKIFfs8KWq4";
const ROADMAP_GID = "347329036";

// Empty until a "Races" tab exists in the roadmap sheet; while empty, only
// the undated A-race names from the roadmap rows are shown.
const ROADMAP_RACES_GID = "";

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

export interface RaceEntry {
  year: string;
  name: string;
  date: string | null;
  location: string | null;
  priority: "A" | "B" | null;
  entered: string | null;
  note: string | null;
}

export interface RoadmapData {
  rows: RoadmapRow[];
  notes: string[];
  races: RaceEntry[];
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

const TRAILING_PAREN_RE = /^(.*\S)\s*\(([^()]*)\)$/;

// The column is "A races", so an entry with no marker is priority A.
export function splitARaces(year: string, aRaces: string): RaceEntry[] {
  return aRaces
    .split("·")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map((part): RaceEntry => {
      const suffix = TRAILING_PAREN_RE.exec(part);
      const inside = suffix ? suffix[2]!.trim() : "";
      const isPriority = inside === "A" || inside === "B";
      return {
        year,
        name: suffix ? suffix[1]! : part,
        date: null,
        location: null,
        priority: isPriority ? inside : "A",
        entered: null,
        note: suffix && !isPriority ? inside : null,
      };
    });
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_RE = /^\d{4}$/;

const blankToNull = (value: string | undefined): string | null => {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
};

export function parseRacesCsv(csv: string): RaceEntry[] {
  const [, ...body] = parseCsvRows(csv);
  const races: RaceEntry[] = [];
  for (const [year, date, name, location, priority, entered] of body) {
    const cleanYear = (year ?? "").trim();
    const cleanName = (name ?? "").trim();
    if (!YEAR_RE.test(cleanYear) || cleanName === "") continue;
    const cleanDate = (date ?? "").trim();
    const cleanPriority = (priority ?? "").trim().toUpperCase();
    races.push({
      year: cleanYear,
      name: cleanName,
      date: ISO_DATE_RE.test(cleanDate) ? cleanDate : null,
      location: blankToNull(location),
      priority: cleanPriority === "A" || cleanPriority === "B" ? cleanPriority : null,
      entered: blankToNull(entered),
      note: null,
    });
  }
  return races;
}

// A year with Races-tab rows uses those alone: mixing in the roadmap row's
// names would list the same race twice.
export function racesForYear(
  rows: Pick<RoadmapRow, "year" | "aRaces">[],
  races: RaceEntry[],
  year: string,
): RaceEntry[] {
  const fromTab = races.filter((race) => race.year === year);
  if (fromTab.length === 0) {
    const row = rows.find((r) => r.year === year);
    return row ? splitARaces(year, row.aRaces) : [];
  }
  const dated = fromTab.filter((race) => race.date !== null).sort((a, b) => a.date!.localeCompare(b.date!));
  return [...dated, ...fromTab.filter((race) => race.date === null)];
}

export interface RaceMonth {
  label: string;
  races: RaceEntry[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function groupRacesByMonth(races: RaceEntry[]): RaceMonth[] {
  const months: RaceMonth[] = [];
  for (const race of races) {
    const label = race.date ? MONTH_NAMES[Number(race.date.slice(5, 7)) - 1]! : "Date TBC";
    const last = months[months.length - 1];
    if (last && last.label === label) last.races.push(race);
    else months.push({ label, races: [race] });
  }
  return months;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function raceDayLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${DAY_NAMES[new Date(year!, month! - 1, day!).getDay()]} ${day}/${month}`;
}

export function parseRoadmapCsv(csv: string): Pick<RoadmapData, "rows" | "notes"> {
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

async function fetchSheetCsv(gid: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${ROADMAP_SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch roadmap sheet: ${res.status}`);
  return res.text();
}

// The Races tab is optional: a missing or unreadable tab must leave the
// roadmap itself on screen, so its failure becomes "no dated races".
async function fetchRacesOrNone(): Promise<RaceEntry[]> {
  if (ROADMAP_RACES_GID === "") return [];
  try {
    return parseRacesCsv(await fetchSheetCsv(ROADMAP_RACES_GID));
  } catch {
    return [];
  }
}

export async function fetchRoadmapData(): Promise<RoadmapData> {
  const [csv, races] = await Promise.all([fetchSheetCsv(ROADMAP_GID), fetchRacesOrNone()]);
  return { ...parseRoadmapCsv(csv), races };
}
