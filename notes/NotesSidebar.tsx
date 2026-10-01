// notes/NotesSidebar.tsx
import type { DayGroup } from "./notes-grouping";

export default function NotesSidebar({
  groups,
  selectedDayKey,
  onSelectDay,
}: {
  groups: DayGroup[];
  selectedDayKey: string;
  onSelectDay: (dateKey: string) => void;
}) {
  return (
    <nav className="notes-sidebar" aria-label="Days">
      <h2 className="notes-sidebar-heading">Days</h2>
      <ul className="notes-day-list">
        {groups.map((group) => (
          <li key={group.dateKey}>
            <button
              type="button"
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
        {groups.length === 0 && <li className="notes-day-empty">No notes yet</li>}
      </ul>
    </nav>
  );
}
