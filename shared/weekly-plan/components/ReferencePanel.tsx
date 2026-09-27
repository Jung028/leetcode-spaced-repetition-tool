import React from "react";
import type { ReferencePanel as ReferencePanelData } from "../model";

export function ReferencePanel({ panel }: { panel: ReferencePanelData }) {
  return (
    <section className="plan-panel">
      <header className="plan-panel-head">
        <h3>{panel.title}</h3>
        {panel.badge && <span className="tag">{panel.badge}</span>}
      </header>
      <dl className="plan-panel-rows">
        {panel.rows.map((row, i) => (
          <React.Fragment key={i}>
            <dt>{row.label}</dt>
            <dd>{row.detail}</dd>
          </React.Fragment>
        ))}
      </dl>
    </section>
  );
}
