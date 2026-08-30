import { useMemo, useState } from "react";
import { Download, Wallet, TrendingUp, CalendarDays } from "lucide-react";
import { CURRENT_WORKER, bookingsForWorker, serviceById, customerById } from "../../data/seed";
import { formatINR } from "../../lib/logic";
import KpiGrid from "../../components/shared/KpiGrid";
import BreakdownLedger from "../../components/shared/BreakdownLedger";
import { TrendChart } from "../../components/shared/ChartPair";

const PERIODS = [
  { key: "today", label: "Today", days: 1 },
  { key: "week", label: "This week", days: 7 },
  { key: "month", label: "This month", days: 30 },
];

export default function Earnings() {
  const [period, setPeriod] = useState("week");
  const w = CURRENT_WORKER;
  const all = bookingsForWorker(w.id).filter((b) => b.status === "completed");

  const days = PERIODS.find((p) => p.key === period).days;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const inPeriod = all.filter((b) => new Date(b.date) >= cutoff);

  const totalEarnings = inPeriod.reduce((s, b) => s + b.breakdown.worker, 0);
  const aggBreakdown = inPeriod.reduce(
    (acc, b) => {
      acc.worker += b.breakdown.worker;
      acc.cooperative += b.breakdown.cooperative;
      acc.welfare += b.breakdown.welfare;
      acc.ops += b.breakdown.ops;
      return acc;
    },
    { worker: 0, cooperative: 0, welfare: 0, ops: 0 }
  );

  const trend = useMemo(() => {
    const buckets = {};
    all.forEach((b) => {
      const key = b.date;
      buckets[key] = (buckets[key] || 0) + b.breakdown.worker;
    });
    return Object.entries(buckets)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-14)
      .map(([date, amt]) => ({ date: date.slice(5), earnings: amt }));
  }, [all]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Earnings</h1>
          <p className="text-sm text-ink-soft/60 mt-1">Every rupee split on record, same as the customer sees it.</p>
        </div>
        <div className="flex gap-1.5 rounded-full bg-sand-100 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`text-xs font-semibold rounded-full px-3.5 py-1.5 transition-colors ${
                period === p.key ? "bg-teal-600 text-sand-50" : "text-ink-soft/60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <KpiGrid
        cols={3}
        items={[
          { label: `Total earned (${PERIODS.find((p) => p.key === period).label.toLowerCase()})`, value: formatINR(totalEarnings), icon: Wallet },
          { label: "Jobs completed", value: inPeriod.length, icon: CalendarDays },
          { label: "Avg. per job", value: formatINR(inPeriod.length ? totalEarnings / inPeriod.length : 0), icon: TrendingUp },
        ]}
      />

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
        <div className="rounded-xl2 border border-teal-100 bg-white p-4 shadow-card">
          <p className="text-sm font-semibold text-ink mb-1">Earnings trend (last 14 active days)</p>
          <TrendChart data={trend} xKey="date" lines={[{ key: "earnings", name: "Earnings (₹)", color: "#1B5C52" }]} />
        </div>
        <BreakdownLedger breakdown={aggBreakdown} total={totalEarnings} />
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-ink mb-3">Transaction history</p>
        <div className="rounded-xl2 border border-teal-100 bg-white shadow-card divide-y divide-sand-200 overflow-hidden">
          {inPeriod.length === 0 && <p className="p-5 text-sm text-ink-soft/50">No completed jobs in this period.</p>}
          {inPeriod.slice(0, 10).map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{serviceById(b.serviceId)?.name}</p>
                <p className="text-xs text-ink-soft/50">{customerById(b.customerId)?.name} · {b.date}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="font-mono-data text-sm font-semibold text-coop-600">+{formatINR(b.breakdown.worker)}</p>
                <button className="text-teal-600 hover:text-teal-700" title="Download invoice">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
