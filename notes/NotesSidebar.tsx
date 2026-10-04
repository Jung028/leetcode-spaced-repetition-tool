// notes/NotesSidebar.tsx
import type { MonthGroup } from "./notes-grouping";

export default function NotesSidebar({
  months,
  selectedDayKey,
  onSelectDay,
}: {
  months: MonthGroup[];
  selectedDayKey: string;
  onSelectDay: (dateKey: string) => void;
}) {
  return (
    <nav className="notes-sidebar" aria-label="Days">
      <h2 className="notes-sidebar-heading">Days</h2>
      {months.map((month) => (
        <section key={month.monthKey} className="notes-month">
          <h3 className="notes-month-heading">
            <span>{month.label}</span>
            <span className="notes-day-count">{month.noteCount}</span>
          </h3>
          <ul className="notes-day-list">
            {month.days.map((group) => (
              <li key={group.dateKey}>
                <button
                  type="button"
                  aria-current={group.dateKey === selectedDayKey ? "true" : undefined}
                  className={
                    group.dateKey === selectedDayKey ? "notes-day-item notes-day-item-active" : "notes-day-item"
                  }
                  onClick={() => onSelectDay(group.dateKey)}
                >
                  <span className="notes-day-label">{group.label}</span>
                  <span className="notes-day-count">{group.notes.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {months.length === 0 && <p className="notes-day-empty">No notes yet</p>}
    </nav>
  );
}
