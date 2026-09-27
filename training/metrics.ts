// training/metrics.ts
import type { MetricsCalculator } from "../shared/weekly-plan/metrics";
import { CompositeMetrics, TodaySummary } from "../shared/weekly-plan/metrics";
import type { PlanItem } from "../shared/weekly-plan/model";

export interface TrainingItem extends PlanItem {
  hours: number;
  runKm: number;
}

function hoursThisWeek(): MetricsCalculator<TrainingItem> {
  return {
    stats(plan) {
      const total = plan.days.reduce(
        (sum, day) => sum + day.items.reduce((s, item) => s + item.hours, 0),
        0,
      );
      return [{ value: total.toFixed(1), label: "Hours this week" }];
    },
  };
}

function runKmThisWeek(): MetricsCalculator<TrainingItem> {
  return {
    stats(plan) {
      const total = plan.days.reduce(
        (sum, day) => sum + day.items.reduce((s, item) => s + item.runKm, 0),
        0,
      );
      return [{ value: String(total), label: "Run km" }];
    },
  };
}

function strengthSessions(): MetricsCalculator<TrainingItem> {
  return {
    stats(plan) {
      const count = plan.days.reduce(
        (sum, day) => sum + day.items.filter((item) => item.category === "strength").length,
        0,
      );
      return [{ value: String(count), label: "Strength" }];
    },
  };
}

export const TrainingMetrics: MetricsCalculator<TrainingItem> = CompositeMetrics(
  hoursThisWeek(),
  runKmThisWeek(),
  strengthSessions(),
  TodaySummary(),
);
