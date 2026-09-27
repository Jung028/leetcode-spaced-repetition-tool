import React from "react";
import type { PlanDay, PlanItem, CategoryStyle } from "../model";
import { categoryLabel } from "../model";
import { shortDate } from "../week";

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
        day.items.map((item, i) => {
          // definePlan() guarantees every item's category key exists in categories.
          const style = categories[item.category]!;
          return (
            <div key={i} className="plan-item">
              <div className="plan-item-head">
                <span
                  className="plan-pill"
                  style={{ "--tone": `var(${style.colorToken})` } as React.CSSProperties}
                >
                  {categoryLabel(categories, item.category)}
                </span>
                {item.time && <span className="plan-item-time">{item.time}</span>}
              </div>
              <h3 className="plan-item-title">{item.title}</h3>
              <dl className="plan-item-steps">
                {item.steps.map((step, j) => (
                  <React.Fragment key={j}>
                    <dt>{step.label}</dt>
                    <dd>{step.detail}</dd>
                  </React.Fragment>
                ))}
              </dl>
              {item.note && <p className="plan-item-note">{item.note}</p>}
            </div>
          );
        })
      )}
    </article>
  );
}
