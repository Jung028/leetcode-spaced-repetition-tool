import type { PlanItem, WeeklyPlan, Stat } from "./model";
import { categoryLabel } from "./model";

export interface MetricsCalculator<TItem extends PlanItem> {
  stats(plan: WeeklyPlan<TItem>, today: string): Stat[];
}

export function CountByCategory<TItem extends PlanItem>(): MetricsCalculator<TItem> {
  return {
    stats(plan) {
      const counts = new Map<string, number>();
      for (const day of plan.days) {
        if (day.items.length === 0) {
          counts.set("Rest", (counts.get("Rest") ?? 0) + 1);
          continue;
        }
        for (const item of day.items) {
          const label = categoryLabel(plan.categories, item.category);
          counts.set(label, (counts.get(label) ?? 0) + 1);
        }
      }
      return [...counts].map(([label, value]) => ({ value: String(value), label }));
    },
  };
}

export function TodaySummary<TItem extends PlanItem>(): MetricsCalculator<TItem> {
  return {
    stats(plan, today) {
      const day = plan.dayFor(today);
      const first = day?.items[0];
      const value = first ? categoryLabel(plan.categories, first.category) : "Rest";
      return [{ value, label: "Today" }];
    },
  };
}

export function CompositeMetrics<TItem extends PlanItem>(
  ...calculators: MetricsCalculator<TItem>[]
): MetricsCalculator<TItem> {
  return {
    stats(plan, today) {
      return calculators.flatMap((c) => c.stats(plan, today));
    },
  };
}
