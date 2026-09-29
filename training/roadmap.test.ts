import { test, expect } from "bun:test";
import { parseRoadmapCsv } from "./roadmap";

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
