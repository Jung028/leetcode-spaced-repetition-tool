import React from "react";
import type { PlanItem, PlanDay, CategoryStyle } from "../model";
import { categoryLabel } from "../model";
import { shortDate } from "../week";

function focusFor<TItem extends PlanItem>(
  day: PlanDay<TItem>,
  categories: Record<string, CategoryStyle>,
): string {
  if (day.items.length === 0) return "Rest";
  return day.items.map((item) => categoryLabel(categories, item.category)).join(" / ");
}

function bodyCellClass<TItem extends PlanItem>(day: PlanDay<TItem>, isToday: boolean): string | undefined {
  const classes = [day.items.length === 0 && "plan-table-rest", isToday && "plan-table-today"].filter(
    Boolean,
  );
  return classes.length > 0 ? classes.join(" ") : undefined;
}

export function WeekBoardTable<TItem extends PlanItem>({
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
      <div className="plan-table-wrap">
        <table className="plan-table">
          <thead>
            <tr>
              {week.map(({ date, day, isToday }) => (
                <th key={date} className={isToday ? "plan-table-today" : undefined}>
                  <span className="plan-table-weekday">{day.day}</span>
                  <span className="plan-table-date">{shortDate(date)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="plan-table-focus-row">
              {week.map(({ date, day, isToday }) => (
                <td key={date} className={bodyCellClass(day, isToday)}>
                  {focusFor(day, categories)}
                </td>
              ))}
            </tr>
            <tr>
              {week.map(({ date, day, isToday }) => (
                <td key={date} className={bodyCellClass(day, isToday)}>
                  {day.items.length === 0 ? (
                    <span className="plan-day-rest">Rest</span>
                  ) : (
                    day.items.map((item, i) => (
                      <div key={i} className="plan-table-item">
                        {item.time && <div className="plan-item-time">{item.time}</div>}
                        <div className="plan-item-title">{item.title}</div>
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
                    ))
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
