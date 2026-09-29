import type { PlanDay, PlanItem, CategoryStyle } from "../model";
import { shortDate } from "../week";
import { PlanItemView } from "./PlanItemView";

export function DayCard<TItem extends PlanItem>({
  date,
  day,
  isToday,
  categories,
}: {
  date: string;
  day: PlanDay<TItem>;
  isToday: boolean;
  categories: Record<string, CategoryStyle>;
}) {
  return (
    <article className={isToday ? "plan-day plan-day-today" : "plan-day"}>
      <header className="plan-day-head">
        <span className="plan-day-weekday">{day.day}</span>
        <span className="plan-day-date">{shortDate(date)}</span>
        {isToday && <span className="tag">today</span>}
      </header>
      {day.items.length === 0 ? (
        <p className="plan-day-rest">Rest</p>
      ) : (
        day.items.map((item, i) => <PlanItemView key={i} item={item} categories={categories} />)
      )}
    </article>
  );
}
