import type { MetricsCalculator } from "./metrics";
import { weekdayOf, mondayOf, datesOfWeek } from "./week";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface PlanStep {
  label: string;
  detail: string;
}

export interface PlanItem {
  title: string;
  category: string;
  time?: string;
  steps: PlanStep[];
  note?: string;
}

export interface PlanDay<TItem extends PlanItem = PlanItem> {
  day: Weekday;
  items: TItem[];
}

export interface CategoryStyle {
  label: string;
  colorToken: string;
}

export interface ReferencePanel {
  title: string;
  badge?: string;
  rows: PlanStep[];
}

export interface PlanContext {
  heading: string;
  dates?: string;
  lines: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export class WeeklyPlan<TItem extends PlanItem = PlanItem> {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly days: PlanDay<TItem>[],
    readonly categories: Record<string, CategoryStyle>,
    readonly metrics: MetricsCalculator<TItem>,
    readonly context?: PlanContext,
    readonly panels: ReferencePanel[] = [],
  ) {}

  dayFor(date: string): PlanDay<TItem> | undefined {
    const weekday = weekdayOf(date);
    return this.days.find((d) => d.day === weekday);
  }

  weekOf(date: string): { date: string; day: PlanDay<TItem>; isToday: boolean }[] {
    const monday = mondayOf(date);
    return datesOfWeek(monday).map((d) => ({
      date: d,
      // definePlan() guarantees all 7 weekdays are present, so this always hits.
      day: this.dayFor(d)!,
      isToday: d === date,
    }));
  }

  stats(today: string): Stat[] {
    return this.metrics.stats(this, today);
  }
}
