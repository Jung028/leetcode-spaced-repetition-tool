import { useState } from "react";
import type { PlanItem, PlanDay, CategoryStyle } from "../model";
import { focusFor } from "../model";
import { shortDate } from "../week";
import { PlanDayDetail } from "./PlanDayDetail";

function headerCellClass(isToday: boolean, isSelected: boolean): string | undefined {
  const classes = [isToday && "plan-table-today", isSelected && "plan-table-selected"].filter(Boolean);
  return classes.length > 0 ? classes.join(" ") : undefined;
}

function bodyCellClass<TItem extends PlanItem>(
  day: PlanDay<TItem>,
  isToday: boolean,
  isSelected: boolean,
): string | undefined {
  const classes = [
    day.items.length === 0 && "plan-table-rest",
    isToday && "plan-table-today",
    isSelected && "plan-table-selected",
  ].filter(Boolean);
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
  const [selected, setSelected] = useState(() => week.find((w) => w.isToday)?.date ?? week[0]!.date);
  const selectedEntry = week.find((w) => w.date === selected) ?? week.find((w) => w.isToday) ?? week[0]!;

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
                <th key={date} className={headerCellClass(isToday, date === selected)}>
                  <button
                    type="button"
                    className="plan-table-daybtn"
                    aria-pressed={date === selected}
                    onClick={() => setSelected(date)}
                  >
                    <span className="plan-table-weekday">{day.day}</span>
                    <span className="plan-table-date">{shortDate(date)}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="plan-table-focus-row">
              {week.map(({ date, day, isToday }) => (
                <td key={date} className={bodyCellClass(day, isToday, date === selected)}>
                  <button
                    type="button"
                    className="plan-table-daybtn"
                    aria-pressed={date === selected}
                    onClick={() => setSelected(date)}
                  >
                    {focusFor(day, categories)}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <PlanDayDetail
        date={selectedEntry.date}
        day={selectedEntry.day}
        isToday={selectedEntry.isToday}
        categories={categories}
      />
    </section>
  );
}
