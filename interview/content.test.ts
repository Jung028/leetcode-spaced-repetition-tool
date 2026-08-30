import { test, expect } from "bun:test";
import { allSystemDesignQuestions } from "./content";

test("at least 3 companies are seeded", () => {
  const companies = new Set(allSystemDesignQuestions().map((q) => q.company));
  expect(companies.size).toBeGreaterThanOrEqual(3);
});

test("every question has a non-empty prompt, modelAnswer, and rubric", () => {
  for (const q of allSystemDesignQuestions()) {
    expect(q.prompt.length).toBeGreaterThan(0);
    expect(q.modelAnswer.length).toBeGreaterThan(0);
    expect(q.rubric.length).toBeGreaterThan(0);
  }
});

test("every question id is unique", () => {
  const ids = allSystemDesignQuestions().map((q) => q.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test("question ids follow the `${company}:${index}` convention, per company", () => {
  const nextIndex = new Map<string, number>();
  for (const q of allSystemDesignQuestions()) {
    const index = nextIndex.get(q.company) ?? 0;
    expect(q.id).toBe(`${q.company}:${index}`);
    nextIndex.set(q.company, index + 1);
  }
});
