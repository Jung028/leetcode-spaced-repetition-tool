// notes/NotesSidebar.tsx
import { useEffect, useRef } from "react";
import type { MonthGroup } from "./notes-grouping";

export default function NotesSidebar({
  id,
  open,
  months,
  selectedDayKey,
  onSelectDay,
}: {
  id?: string;
  open: boolean;
  months: MonthGroup[];
  selectedDayKey: string;
  onSelectDay: (dateKey: string) => void;
}) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const target = navRef.current?.querySelector<HTMLButtonElement>(".notes-day-item-active, .notes-day-item");
    target?.focus();
  }, [open]);

  return (
    <nav id={id} ref={navRef} className="notes-sidebar" aria-label="Days">
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
