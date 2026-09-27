import { test, expect } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { definePlan } from "./define";
import { CountByCategory } from "./metrics";
import type { PlanItem } from "./model";
import { WeeklyPlanView } from "./WeeklyPlanView";
import { WeekBoardCards } from "./components/WeekBoardCards";

const categories = {
  lecture: { label: "Lecture", colorToken: "--accent" },
};

const item = (title: string): PlanItem => ({
  title,
  category: "lecture",
  steps: [{ label: "Focus", detail: title }],
});

const PLAN_WITH_REST_DAY = definePlan<PlanItem>({
  id: "rest-day-plan",
  title: "Plan with a rest day",
  categories,
  metrics: CountByCategory<PlanItem>(),
  days: [
    { day: "Mon", items: [item("Databases lecture")] },
    { day: "Tue", items: [item("Networks lecture")] },
    { day: "Wed", items: [] },
    { day: "Thu", items: [item("Security lecture")] },
    { day: "Fri", items: [item("Compilers lecture")] },
    { day: "Sat", items: [] },
    { day: "Sun", items: [] },
  ],
});

const TODAY_ON_REST_DAY = "2026-09-30"; // Wednesday: an empty day in PLAN_WITH_REST_DAY

test("an empty day renders as Rest, with no undefined, in the table view", () => {
  const html = renderToStaticMarkup(
    React.createElement(WeeklyPlanView, { plan: PLAN_WITH_REST_DAY, today: TODAY_ON_REST_DAY }),
  );
  expect(html).toContain("Rest");
  expect(html).not.toContain("undefined");
});

test("today falling on an empty day still marks the table's today column", () => {
  const html = renderToStaticMarkup(
    React.createElement(WeeklyPlanView, { plan: PLAN_WITH_REST_DAY, today: TODAY_ON_REST_DAY }),
  );
  expect(html).toContain("plan-table-today");
  expect(html).toContain("plan-table-rest");
});

test("today falling on an empty day shows the today tag and Rest label on that day's card", () => {
  const week = PLAN_WITH_REST_DAY.weekOf(TODAY_ON_REST_DAY);
  const html = renderToStaticMarkup(
    React.createElement(WeekBoardCards, {
      week,
      categories: PLAN_WITH_REST_DAY.categories,
      heading: "This week",
    }),
  );
  expect(html).toContain("plan-day-today");
  expect(html).toContain(">today<");
  expect(html).toContain("Rest");
  expect(html).not.toContain("undefined");
});
