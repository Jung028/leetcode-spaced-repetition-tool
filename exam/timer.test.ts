import { test, expect } from "bun:test";
import { questionTimeBudget, formatCountdown } from "./timer";

test("base budget per question type", () => {
  expect(questionTimeBudget({ type: "truefalse" })).toBe(20);
  expect(questionTimeBudget({ type: "mcq" })).toBe(30);
  expect(questionTimeBudget({ type: "multi" })).toBe(45);
  expect(questionTimeBudget({ type: "short" })).toBe(150);
  expect(questionTimeBudget({ type: "scenario" })).toBe(180);
});

test("adds 10s for each option beyond the fourth", () => {
  expect(questionTimeBudget({ type: "mcq", options: ["a", "b", "c", "d"] })).toBe(30);
  expect(questionTimeBudget({ type: "mcq", options: ["a", "b", "c", "d", "e"] })).toBe(40);
  expect(questionTimeBudget({ type: "multi", options: ["a", "b", "c", "d", "e", "f"] })).toBe(65);
});

test("adds 15s once when the question has an image or diagram", () => {
  expect(questionTimeBudget({ type: "mcq", promptImage: "data:image/png;base64,x" })).toBe(45);
  expect(questionTimeBudget({ type: "mcq", promptDiagram: "flowchart TD\nA-->B" })).toBe(45);
  expect(
    questionTimeBudget({ type: "mcq", promptImage: "x", promptDiagram: "y" }),
  ).toBe(45);
});

test("adjustments stack", () => {
  expect(
    questionTimeBudget({ type: "multi", options: ["a", "b", "c", "d", "e", "f"], promptImage: "x" }),
  ).toBe(45 + 20 + 15);
});

test("formatCountdown renders m:ss and flips to +m:ss over budget", () => {
  expect(formatCountdown(90)).toBe("1:30");
  expect(formatCountdown(5)).toBe("0:05");
  expect(formatCountdown(0)).toBe("0:00");
  expect(formatCountdown(-7)).toBe("+0:07");
  expect(formatCountdown(-75)).toBe("+1:15");
});
