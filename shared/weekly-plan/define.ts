import type { Weekday, CategoryStyle, PlanContext, PlanDay, PlanItem, ReferencePanel } from "./model";
import { WeeklyPlan } from "./model";
import type { MetricsCalculator } from "./metrics";

const WEEK_ORDER: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface WeeklyPlanInput<TItem extends PlanItem> {
  id: string;
  title: string;
  days: PlanDay<TItem>[];
  categories: Record<string, CategoryStyle>;
  metrics: MetricsCalculator<TItem>;
  context?: PlanContext;
  panels?: ReferencePanel[];
}

export function definePlan<TItem extends PlanItem>(
  input: WeeklyPlanInput<TItem>,
): WeeklyPlan<TItem> {
  const gotDays = input.days.map((d) => d.day);
  const inOrder =
    gotDays.length === WEEK_ORDER.length && WEEK_ORDER.every((w, i) => gotDays[i] === w);
  if (!inOrder) {
    throw new Error(
      `plan "${input.id}": days must be exactly Mon, Tue, Wed, Thu, Fri, Sat, Sun in that order (got ${gotDays.join(", ") || "none"})`,
    );
  }

  for (const [key, style] of Object.entries(input.categories)) {
    if (!style.colorToken.startsWith("--")) {
      throw new Error(
        `plan "${input.id}": category "${key}" colorToken must start with "--" (got "${style.colorToken}")`,
      );
    }
  }

  for (const day of input.days) {
    for (const item of day.items) {
      if (!(item.category in input.categories)) {
        throw new Error(
          `plan "${input.id}": item "${item.title}" on ${day.day} has unknown category "${item.category}"`,
        );
      }
    }
  }

  return new WeeklyPlan(
    input.id,
    input.title,
    input.days,
    input.categories,
    input.metrics,
    input.context,
    input.panels ?? [],
  );
}
