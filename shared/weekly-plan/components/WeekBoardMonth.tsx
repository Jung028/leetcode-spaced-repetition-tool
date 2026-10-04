import { useEffect, useState } from "react";
import type { PlanItem, WeeklyPlan } from "../model";
import { focusFor } from "../model";
import { WEEKDAYS, datesOfWeek, monthLabel, monthWeeks, shortDate } from "../week";
import { PlanDayDetail } from "./PlanDayDetail";
import { MonthTabs } from "./MonthTabs";

function defaultSelection(today: string, monthKey: string): string {
  return today.slice(0, 7) === monthKey ? today : `${monthKey}-01`;
}

function cellClass(isRest: boolean, isToday: boolean, isSelected: boolean, inMonth: boolean): string | undefined {
  const classes = [
    isRest && "plan-table-rest",
    isToday && "plan-table-today",
    isSelected && "plan-table-selected",
    !inMonth && "plan-month-outside",
  ].filter(Boolean);
  return classes.length > 0 ? classes.join(" ") : undefined;
}

export function WeekBoardMonth<TItem extends PlanItem>({
  plan,
  anchor,
  today,
  onAnchorChange,
}: {
  plan: WeeklyPlan<TItem>;
  anchor: string;
  today: string;
  onAnchorChange: (date: string) => void;
}) {
  const monthKey = anchor.slice(0, 7);
  const [selected, setSelected] = useState(() => defaultSelection(today, monthKey));

  // Navigating to a different month (via MonthTabs, which changes `anchor`)
  // leaves `selected` pointing at a day in the month we just left, so reset
  // it to today-if-visible-else-the-1st of the newly shown month. This only
  // fires on month navigation (monthKey change) — clicking an out-of-month
  // cell within the CURRENTLY rendered grid is a deliberate selection and
  // must be honored as-is, not overridden back to the 1st.
  useEffect(() => {
    setSelected(defaultSelection(today, monthKey));
  }, [monthKey]);

  const shown = selected;

  return (
    <section className="board plan-board" aria-label={monthLabel(anchor)}>
      <div className="section-head">
        <h2>{monthLabel(anchor)}</h2>
      </div>
      <div className="plan-table-wrap">
        <table className="plan-table plan-month-table">
          <thead>
            <tr>
              <th scope="col">Week</th>
              {WEEKDAYS.map((weekday) => (
                <th key={weekday} scope="col">{weekday}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthWeeks(anchor).map((monday) => (
              <tr key={monday}>
                <th scope="row" className="plan-month-week">
                  {shortDate(monday)} – {shortDate(datesOfWeek(monday)[6]!)}
                </th>
                {datesOfWeek(monday).map((date) => {
                  // definePlan() guarantees all 7 weekdays are present.
                  const day = plan.dayFor(date)!;
                  return (
                    <td
                      key={date}
                      className={cellClass(day.items.length === 0, date === today, date === shown, date.slice(0, 7) === monthKey)}
                    >
                      <button
                        type="button"
                        className="plan-table-daybtn"
                        aria-pressed={date === shown}
                        onClick={() => setSelected(date)}
                      >
                        <span className="plan-table-date">{Number(date.slice(8))}</span>
                        <span>{focusFor(day, plan.categories)}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MonthTabs anchor={anchor} onChange={onAnchorChange} />
      <PlanDayDetail date={shown} day={plan.dayFor(shown)!} isToday={shown === today} categories={plan.categories} />
    </section>
  );
}
