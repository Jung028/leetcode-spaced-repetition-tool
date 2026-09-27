import { test, expect } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { definePlan } from "./define";
import { CountByCategory } from "./metrics";
import type { PlanItem } from "./model";
import { WeeklyPlanView } from "./WeeklyPlanView";

const categories = {
  lecture: { label: "Lecture", colorToken: "--accent" },
  revision: { label: "Revision", colorToken: "--green" },
  off: { label: "Off", colorToken: "--dim" },
};

const item = (title: string, category: string): PlanItem => ({
  title,
  category,
  steps: [{ label: "Focus", detail: title }],
});

const STUDY_PLAN = definePlan<PlanItem>({
  id: "study",
  title: "Study timetable",
  categories,
  metrics: CountByCategory<PlanItem>(),
  days: [
    { day: "Mon", items: [item("Databases lecture", "lecture")] },
    { day: "Tue", items: [item("Networks lecture", "lecture")] },
    { day: "Wed", items: [item("Revise week 3", "revision")] },
    { day: "Thu", items: [item("Security lecture", "lecture")] },
    { day: "Fri", items: [item("Revise week 4", "revision")] },
    { day: "Sat", items: [item("Day off", "off")] },
    { day: "Sun", items: [item("Day off", "off")] },
  ],
});

test("a second plan type renders through WeeklyPlanView with zero changes to shared/weekly-plan", () => {
  const html = renderToStaticMarkup(
    React.createElement(WeeklyPlanView, { plan: STUDY_PLAN, today: "2026-09-28" }),
  );
  expect(html).toContain("Lecture");
  expect(html).toContain("Revision");
  expect(html).toContain("Off");
  expect(html).toContain("Databases lecture");
});
