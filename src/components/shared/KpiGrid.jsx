import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KpiGrid({ items, cols = 4 }) {
  const colClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 5: "sm:grid-cols-2 lg:grid-cols-5" }[cols];
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-3 md:gap-4`}>
      {items.map((it, i) => (
        <div
          key={it.label}
          className="animate-rise rounded-xl2 border border-teal-100 bg-white p-4 md:p-5 shadow-card"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start justify-between">
            <p className="text-xs md:text-sm font-medium text-ink-soft/70">{it.label}</p>
            {it.icon ? <it.icon size={18} className="text-teal-500 shrink-0" /> : null}
          </div>
          <p className="mt-2 font-display text-2xl md:text-3xl font-semibold text-teal-700 font-mono-data">
            {it.value}
          </p>
          {it.trend != null && (
            <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${it.trend >= 0 ? "text-coop-600" : "text-alert-500"}`}>
              {it.trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{Math.abs(it.trend)}% {it.trendLabel || "vs last period"}</span>
            </div>
          )}
          {it.sub && <p className="mt-1 text-xs text-ink-soft/60">{it.sub}</p>}
        </div>
      ))}
    </div>
  );
}
