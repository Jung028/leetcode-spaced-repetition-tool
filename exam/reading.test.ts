import { test, expect } from "bun:test";
import { roundRange, readingFor, roundFullyGraded, initialSeenCards } from "./reading";
import type { ExamReadingSeed } from "../exam-content/types";

const R = (beforeQuestion: number): ExamReadingSeed => ({ beforeQuestion, title: `t${beforeQuestion}`, body: "b" });
const readings = [R(0), R(4)]; // rounds: q0-3 and q4-... ; 9 questions total

test("roundRange spans from a card to the next card (or the end)", () => {
  expect(roundRange(readings, 0, 9)).toEqual([0, 4]);
  expect(roundRange(readings, 1, 9)).toEqual([4, 9]);
});

test("readingFor finds the card whose round holds a question; -1 before any card", () => {
  expect(readingFor(readings, 2)).toBe(0);
  expect(readingFor(readings, 4)).toBe(1);
  expect(readingFor(readings, 8)).toBe(1);
  expect(readingFor([R(3)], 1)).toBe(-1);
});

test("roundFullyGraded is true only when every question in the round is graded", () => {
  const g = [1, 0, 1, null, null, null, null, null, null];
  expect(roundFullyGraded(readings, 0, g)).toBe(false);
  expect(roundFullyGraded(readings, 0, [1, 0, 1, 1, null, null, null, null, null])).toBe(true);
});

test("initialSeenCards marks cards for rounds already started or passed", () => {
  const none = Array(9).fill(null) as (number | null)[];
  expect([...initialSeenCards(readings, none, 0)]).toEqual([]);
  const midRound = [1, null, null, null, null, null, null, null, null];
  expect([...initialSeenCards(readings, midRound, 1)]).toEqual([0]);
  // resuming exactly at a card's first question: that card has not been shown yet
  expect([...initialSeenCards(readings, none, 4)].sort()).toEqual([0]);
  // resuming past a card's first question: both cards are behind the student
  expect([...initialSeenCards(readings, none, 5)].sort()).toEqual([0, 1]);
});
