import { test, expect } from "bun:test";
import { GOAL_SEED } from "./goals-seed";
import { inferGoalCategory, isGoalCategory, parseGoalText } from "./goal-text";

test("parseGoalText splits a simple title: current → target line", () => {
  expect(parseGoalText("5K: 17:36 → 16:00")).toEqual({
    title: "5K",
    current: "17:36",
    target: "16:00",
    note: null,
  });
});

test("parseGoalText keeps a parenthetical in the title and lifts one off the target into the note", () => {
  expect(parseGoalText("Powerman Bike (60km): 1:45 → 1:28 (~280–300W)")).toEqual({
    title: "Powerman Bike (60km)",
    current: "1:45",
    target: "1:28",
    note: "~280–300W",
  });
});

test("parseGoalText folds a third arrow segment into the note", () => {
  expect(parseGoalText("FTP (20-min test): ~215–230W → 250W (Mar 2027) → 280–300W (2028)")).toEqual({
    title: "FTP (20-min test)",
    current: "~215–230W",
    target: "250W",
    note: "Mar 2027 · then 280–300W (2028)",
  });
});

test("parseGoalText returns null when the text has no title or no arrow", () => {
  expect(parseGoalText("Join Suvelo")).toBeNull();
  expect(parseGoalText("Sleep: 8 hours")).toBeNull();
});

test("every seeded goal parses", () => {
  for (const text of GOAL_SEED) expect(parseGoalText(text)).not.toBeNull();
});

test("inferGoalCategory files each seeded goal under the right sport", () => {
  expect(GOAL_SEED.map(inferGoalCategory)).toEqual([
    "recovery",
    "running",
    "running",
    "running",
    "running",
    "cycling",
    "running",
    "cycling",
    "events",
    "events",
    "running",
  ]);
});

test("inferGoalCategory falls back to other", () => {
  expect(inferGoalCategory("Read more")).toBe("other");
});

test("isGoalCategory accepts only the known categories", () => {
  expect(isGoalCategory("cycling")).toBe(true);
  expect(isGoalCategory("swimming")).toBe(false);
  expect(isGoalCategory(3)).toBe(false);
});
