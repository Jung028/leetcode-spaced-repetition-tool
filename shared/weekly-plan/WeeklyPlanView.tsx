import { useState } from "react";
import type { PlanItem, WeeklyPlan } from "./model";
import { localToday } from "../scheduling";
import { shortDate } from "./week";
import { StatRow } from "./components/StatRow";
import { ContextBanner } from "./components/ContextBanner";
import { WeekBoardTable } from "./components/WeekBoardTable";
import { WeekBoardCards } from "./components/WeekBoardCards";
import { WeekBoardMonth } from "./components/WeekBoardMonth";
import { ReferencePanel } from "./components/ReferencePanel";
import "./weekly-plan.css";

type WeekView = "table" | "cards";
type PlanRange = "week" | "month";

function loadChoice<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (allowed.includes(stored as T)) return stored as T;
  } catch {
    // localStorage inaccessible (e.g. blocked storage) — fall back to default
  }
  return fallback;
}

function saveChoice(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage inaccessible — choice just won't persist across visits
  }
}

function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; text: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <nav className="plan-view-toggle" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          className={value === option.value ? "plan-view-btn plan-view-btn-active" : "plan-view-btn"}
          onClick={() => onChange(option.value)}
        >
          {option.text}
        </button>
      ))}
    </nav>
  );
}

export function WeeklyPlanView<TItem extends PlanItem>({
  plan,
  today = localToday(),
  cardsOnly = false,
}: {
  plan: WeeklyPlan<TItem>;
  today?: string;
  /** Skip the context banner and range/layout toggles, always render the week as cards. */
  cardsOnly?: boolean;
}) {
  const [view, setView] = useState<WeekView>(() => loadChoice("weekly-plan-view", ["table", "cards"], "table"));
  const changeView = (v: WeekView) => {
    setView(v);
    saveChoice("weekly-plan-view", v);
  };

  const [range, setRange] = useState<PlanRange>(() => loadChoice("weekly-plan-range", ["week", "month"], "week"));
  const changeRange = (r: PlanRange) => {
    setRange(r);
    saveChoice("weekly-plan-range", r);
  };

  const [anchor, setAnchor] = useState(today);

  const week = plan.weekOf(today);
  const stats = plan.stats(today);
  const heading = `This week · ${shortDate(week[0]!.date)} – ${shortDate(week[6]!.date)}`;

  return (
    <div className="weekly-plan">
      <StatRow stats={stats} />
      {!cardsOnly && plan.context && <ContextBanner context={plan.context} />}
      {!cardsOnly && (
        <div className="plan-toggles">
          <SegmentedToggle
            label="Range"
            options={[
              { value: "week", text: "Week" },
              { value: "month", text: "Month" },
            ]}
            value={range}
            onChange={changeRange}
          />
          {range === "week" && (
            <SegmentedToggle
              label="Week layout"
              options={[
                { value: "table", text: "Table" },
                { value: "cards", text: "Cards" },
              ]}
              value={view}
              onChange={changeView}
            />
          )}
        </div>
      )}
      {cardsOnly ? (
        <WeekBoardCards week={week} categories={plan.categories} heading={heading} />
      ) : range === "month" ? (
        <WeekBoardMonth plan={plan} anchor={anchor} today={today} onAnchorChange={setAnchor} />
      ) : view === "table" ? (
        <WeekBoardTable week={week} categories={plan.categories} heading={heading} />
      ) : (
        <WeekBoardCards week={week} categories={plan.categories} heading={heading} />
      )}
      {plan.panels.length > 0 && (
        <div className="plan-panels">
          {plan.panels.map((panel, i) => (
            <ReferencePanel key={i} panel={panel} />
          ))}
        </div>
      )}
    </div>
  );
}
