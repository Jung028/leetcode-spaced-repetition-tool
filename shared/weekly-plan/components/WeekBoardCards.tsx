import type { PlanItem, PlanDay, CategoryStyle } from "../model";
import { DayCard } from "./DayCard";

export function WeekBoardCards<TItem extends PlanItem>({
  week,
  categories,
  heading,
}: {
  week: { date: string; day: PlanDay<TItem>; isToday: boolean }[];
  categories: Record<string, CategoryStyle>;
  heading: string;
}) {
  return (
    <section className="board plan-board" aria-label="This week">
      <div className="section-head">
        <h2>{heading}</h2>
      </div>
      <div className="plan-week-grid">
        {week.map(({ date, day, isToday }) => (
          <DayCard key={date} date={date} day={day} isToday={isToday} categories={categories} />
        ))}
      </div>
    </section>
  );
}
