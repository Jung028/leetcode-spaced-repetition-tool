import type { PlanContext } from "../model";

export function ContextBanner({ context }: { context: PlanContext }) {
  return (
    <div className="plan-context">
      <div className="plan-context-head">
        <strong>{context.heading}</strong>
        {context.dates && <span className="plan-context-dates">{context.dates}</span>}
      </div>
      {context.lines.map((line, i) => (
        <p key={i} className="plan-context-line">{line}</p>
      ))}
    </div>
  );
}
