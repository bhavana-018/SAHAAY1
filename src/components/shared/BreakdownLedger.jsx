import { formatINR } from "../../lib/logic";

const COLORS = {
  worker: "bg-coop-500",
  cooperative: "bg-teal-500",
  welfare: "bg-marigold-400",
  ops: "bg-ink-soft/40",
};

const LABELS = {
  worker: "Worker earnings",
  cooperative: "Cooperative share",
  welfare: "Welfare fund",
  ops: "Platform operations",
};

export default function BreakdownLedger({ breakdown, total }) {
  const sum = total ?? Object.values(breakdown).reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-xl2 border border-teal-100 bg-white p-4 md:p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-ink-soft/70">Where the payment goes</p>
        <p className="font-mono-data font-semibold text-teal-700">{formatINR(sum)}</p>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-sand-200">
        {Object.entries(breakdown).map(([key, val]) => (
          <div key={key} className={COLORS[key]} style={{ width: `${(val / sum) * 100}%` }} title={LABELS[key]} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {Object.entries(breakdown).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${COLORS[key]}`} />
            <span className="text-ink-soft/70">{LABELS[key]}</span>
            <span className="ml-auto font-mono-data font-medium text-ink">{formatINR(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
