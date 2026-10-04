import { test, expect } from "bun:test";
import {
  parseRoadmapCsv,
  splitARaces,
  parseRacesCsv,
  racesForYear,
  groupRacesByMonth,
  raceDayLabel,
} from "./roadmap";

const SAMPLE_CSV = `Year,Age,Phase,Main goal,A races,A-race count,Run targets,Bike target,Status
2026,23,Injury comeback + bike block,Heal the shin; build FTP,Cycling TTs (B),0,Injury: cycling only until cleared; walk–run from ~Nov if pain-free,FTP test Oct; 250 W by Mar 2027,
2027,24,Engine + first duathlons,First Malaysian results; SEA Games stretch,TriFactor Malaysia · Asia Duathlon Cup · Sydney 10 · SEA Games (if selected),4,5k <17:00 · 10k <35:30 · HM ~1:20,FTP 250 → 280 W,
,,,,,,,,
,Notes,,,,,,,
,A-race count is a formula from the Race Calendar tab; keep it to about 4–6 per year (one every 8–10 weeks).,,,,,,,
,"Yellow cells (Status, Result) are for you to fill in.",,,,,,,
`;

test("parses the roadmap table rows up to the blank separator row", () => {
  const { rows } = parseRoadmapCsv(SAMPLE_CSV);
  expect(rows).toHaveLength(2);
  expect(rows[0]).toEqual({
    year: "2026",
    age: "23",
    phase: "Injury comeback + bike block",
    mainGoal: "Heal the shin; build FTP",
    aRaces: "Cycling TTs (B)",
    aRaceCount: "0",
    runTargets: "Injury: cycling only until cleared; walk–run from ~Nov if pain-free",
    bikeTarget: "FTP test Oct; 250 W by Mar 2027",
    status: "",
  });
});

test("parses notes after the Notes marker row, unwrapping quoted commas", () => {
  const { notes } = parseRoadmapCsv(SAMPLE_CSV);
  expect(notes).toEqual([
    "A-race count is a formula from the Race Calendar tab; keep it to about 4–6 per year (one every 8–10 weeks).",
    "Yellow cells (Status, Result) are for you to fill in.",
  ]);
});

test("splitARaces splits on the middle dot and treats unmarked entries as A races", () => {
  const races = splitARaces("2027", "TriFactor Malaysia · Asia Duathlon Cup · Sydney 10 · SEA Games (if selected)");
  expect(races.map((r) => [r.name, r.priority, r.note])).toEqual([
    ["TriFactor Malaysia", "A", null],
    ["Asia Duathlon Cup", "A", null],
    ["Sydney 10", "A", null],
    ["SEA Games", "A", "if selected"],
  ]);
  expect(races.every((r) => r.year === "2027" && r.date === null)).toBe(true);
});

test("splitARaces reads a (B) marker as the priority, not a note", () => {
  expect(splitARaces("2026", "Cycling TTs (B)").map((r) => [r.name, r.priority, r.note])).toEqual([
    ["Cycling TTs", "B", null],
  ]);
});

test("splitARaces returns nothing for an empty cell", () => {
  expect(splitARaces("2026", "")).toEqual([]);
});

const RACES_CSV = `Year,Date,Competition,Location,Priority,Entered
2026,2026-05-17,Sydney 10,SOPAC,a,10km
2026,,NSW Road Relays,The Crest,,
2026,2026-04-11,Canberra Marathon,Canberra,A,21km
soon,2026-01-01,Bad year,,,
2026,17/5,Odd date,,,
`;

test("parseRacesCsv skips rows without a 4-digit year and nulls a non-ISO date", () => {
  const races = parseRacesCsv(RACES_CSV);
  expect(races.map((r) => r.name)).toEqual(["Sydney 10", "NSW Road Relays", "Canberra Marathon", "Odd date"]);
  expect(races[0]).toEqual({
    year: "2026",
    name: "Sydney 10",
    date: "2026-05-17",
    location: "SOPAC",
    priority: "A",
    entered: "10km",
    note: null,
  });
  expect(races[3]!.date).toBeNull();
});

const ROWS = [
  { year: "2026", aRaces: "Cycling TTs (B)" },
  { year: "2027", aRaces: "Sydney 10" },
];

test("racesForYear uses the Races tab alone when it has rows for that year, dated first", () => {
  expect(racesForYear(ROWS, parseRacesCsv(RACES_CSV), "2026").map((r) => r.name)).toEqual([
    "Canberra Marathon",
    "Sydney 10",
    "NSW Road Relays",
    "Odd date",
  ]);
});

test("racesForYear falls back to the roadmap row when the tab has nothing for that year", () => {
  expect(racesForYear(ROWS, parseRacesCsv(RACES_CSV), "2027").map((r) => r.name)).toEqual(["Sydney 10"]);
  expect(racesForYear(ROWS, [], "2031")).toEqual([]);
});

test("groupRacesByMonth bands dated races by month and puts undated ones last", () => {
  const races = racesForYear(ROWS, parseRacesCsv(RACES_CSV), "2026");
  expect(groupRacesByMonth(races).map((m) => [m.label, m.races.length])).toEqual([
    ["April", 1],
    ["May", 1],
    ["Date TBC", 2],
  ]);
});

test("raceDayLabel renders weekday and day/month", () => {
  expect(raceDayLabel("2026-04-11")).toBe("Sat 11/4");
});
