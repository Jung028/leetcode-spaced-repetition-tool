import type { Stat } from "../model";

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="stats plan-stats">
      {stats.map((s, i) => (
        <div key={`${s.label}-${i}`} className="stat stat-total">
          <span className="stat-num">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
