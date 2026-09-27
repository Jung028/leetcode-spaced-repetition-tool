import { useState } from "react";
import type { PlanItem, WeeklyPlan } from "./model";
import { localToday } from "../scheduling";
import { shortDate } from "./week";
import { StatRow } from "./components/StatRow";
import { ContextBanner } from "./components/ContextBanner";
import { WeekBoardTable } from "./components/WeekBoardTable";
import { WeekBoardCards } from "./components/WeekBoardCards";
import { ReferencePanel } from "./components/ReferencePanel";
import "./weekly-plan.css";

type WeekView = "table" | "cards";

function loadView(): WeekView {
  try {
    const stored = localStorage.getItem("weekly-plan-view");
    if (stored === "table" || stored === "cards") return stored;
  } catch {
    // localStorage inaccessible (e.g. blocked storage) — fall back to default
  }
  return "table";
}

function saveView(view: WeekView) {
  try {
    localStorage.setItem("weekly-plan-view", view);
  } catch {
    // localStorage inaccessible — view choice just won't persist across visits
  }
}

function ViewToggle({ view, onChange }: { view: WeekView; onChange: (v: WeekView) => void }) {
  return (
    <nav className="plan-view-toggle" aria-label="Week layout">
      <button
        className={view === "table" ? "plan-view-btn plan-view-btn-active" : "plan-view-btn"}
        onClick={() => onChange("table")}
      >
        Table
      </button>
      <button
        className={view === "cards" ? "plan-view-btn plan-view-btn-active" : "plan-view-btn"}
        onClick={() => onChange("cards")}
      >
        Cards
      </button>
    </nav>
  );
}

export function WeeklyPlanView<TItem extends PlanItem>({
  plan,
  today = localToday(),
}: {
  plan: WeeklyPlan<TItem>;
  today?: string;
}) {
  const [view, setView] = useState<WeekView>(loadView);
  const changeView = (v: WeekView) => {
    setView(v);
    saveView(v);
  };

  const week = plan.weekOf(today);
  const stats = plan.stats(today);
  const heading = `This week · ${shortDate(week[0]!.date)} – ${shortDate(week[6]!.date)}`;

  return (
    <div className="weekly-plan">
      <StatRow stats={stats} />
      {plan.context && <ContextBanner context={plan.context} />}
      <ViewToggle view={view} onChange={changeView} />
      {view === "table" ? (
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
