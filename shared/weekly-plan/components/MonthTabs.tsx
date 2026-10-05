import { monthsOfYear } from "../week";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthTabs({ anchor, onChange }: { anchor: string; onChange: (date: string) => void }) {
  const active = anchor.slice(0, 7);
  return (
    <nav className="plan-month-tabs" aria-label="Month">
      {monthsOfYear(anchor).map((firstOfMonth, i) => (
        <button
          key={firstOfMonth}
          type="button"
          aria-current={firstOfMonth.slice(0, 7) === active ? "true" : undefined}
          className={firstOfMonth.slice(0, 7) === active ? "plan-month-tab plan-month-tab-active" : "plan-month-tab"}
          onClick={() => onChange(firstOfMonth)}
        >
          {SHORT_MONTHS[i]}
        </button>
      ))}
    </nav>
  );
}
