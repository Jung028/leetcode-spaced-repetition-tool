import type { PlanItem, PlanDay, CategoryStyle } from "../model";
import { shortDate } from "../week";
import { PlanItemView } from "./PlanItemView";

export function PlanDayDetail<TItem extends PlanItem>({
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
  // A single-session day tints the panel's border with that session's
  // category colour; a multi-session or rest day falls back to the neutral accent.
  const tone = day.items.length === 1 ? categories[day.items[0]!.category]!.colorToken : "--accent";
  return (
    <div key={date} className="plan-day-detail" style={{ "--tone": `var(${tone})` } as React.CSSProperties}>
      <header className="plan-day-detail-head">
        <span className="plan-table-weekday">{day.day}</span>
        <span className="plan-table-date">{shortDate(date)}</span>
        {isToday && <span className="tag">today</span>}
      </header>
      {day.items.length === 0 ? (
        <p className="plan-day-rest">Rest</p>
      ) : (
        day.items.map((item, i) => <PlanItemView key={i} item={item} categories={categories} />)
      )}
    </div>
  );
}
