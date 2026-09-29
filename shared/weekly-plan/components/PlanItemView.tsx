import React from "react";
import type { PlanItem, CategoryStyle } from "../model";
import { categoryLabel } from "../model";

export function PlanItemView<TItem extends PlanItem>({
  item,
  categories,
}: {
  item: TItem;
  categories: Record<string, CategoryStyle>;
}) {
  // definePlan() guarantees every item's category key exists in categories.
  const style = categories[item.category]!;
  return (
    <div className="plan-item">
      <div className="plan-item-head">
        <span className="plan-pill" style={{ "--tone": `var(${style.colorToken})` } as React.CSSProperties}>
          {categoryLabel(categories, item.category)}
        </span>
        {item.time && <span className="plan-item-time">{item.time}</span>}
      </div>
      <h3 className="plan-item-title">{item.title}</h3>
      <dl className="plan-item-steps">
        {item.steps.map((step, i) => (
          <React.Fragment key={i}>
            <dt>{step.label}</dt>
            <dd>{step.detail}</dd>
          </React.Fragment>
        ))}
      </dl>
      {item.note && <p className="plan-item-note">{item.note}</p>}
    </div>
  );
}
