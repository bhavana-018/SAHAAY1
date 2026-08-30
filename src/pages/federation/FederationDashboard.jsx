import { useMemo, useState } from "react";
import { COOPERATIVES, WORKERS, BOOKINGS } from "../../data/seed";
import { formatINR } from "../../lib/logic";
import KpiGrid from "../../components/shared/KpiGrid";
import { TrendChart } from "../../components/shared/ChartPair";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";
import { Network, Users, Wallet, TrendingUp } from "lucide-react";

export default function FederationDashboard() {
  const states = useMemo(() => ["All States", ...new Set(COOPERATIVES.map((c) => c.state))], []);
  const [state, setState] = useState("All States");

  const cooperatives = state === "All States" ? COOPERATIVES : COOPERATIVES.filter((c) => c.state === state);
  const coopIds = new Set(cooperatives.map((c) => c.id));
  const workers = WORKERS.filter((w) => coopIds.has(w.coopId));
  const bookings = BOOKINGS.filter((b) => coopIds.has(b.coopId) && b.status === "completed");
  const revenue = bookings.reduce((s, b) => s + b.amount, 0);
  const avgUtil = Math.round(cooperatives.reduce((s, c) => s + c.utilization, 0) / (cooperatives.length || 1));

  const trend = Array.from({ length: 6 }).map((_, i) => ({
    month: `M${i + 1}`,
    Bookings: Math.round(bookings.length * (0.6 + i * 0.08)),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader eyebrow="Federation Admin" title="Network overview" blurb="National view across every affiliated cooperative." />
        <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-full border border-sand-200 bg-sand-50 text-sm px-3 py-2 outline-none">
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <KpiGrid
        items={[
          { label: "Cooperatives", value: cooperatives.length, icon: Network },
          { label: "Workers", value: workers.length, icon: Users },
          { label: "Network revenue", value: formatINR(revenue), icon: Wallet },
          { label: "Avg. utilization", value: `${avgUtil}%`, icon: TrendingUp, trend: avgUtil > 70 ? 5 : -4 },
        ]}
      />

      <div className="rounded-xl2 border border-teal-100 bg-white p-4 md:p-5 shadow-card">
        <p className="text-sm font-medium text-ink-soft/70 mb-2">Booking trend across selected network</p>
        <TrendChart data={trend} xKey="month" lines={[{ key: "Bookings", name: "Bookings", color: "#1B5C52" }]} />
        <NoteTag>Trend line is a light randomizer seeded from current booking counts.</NoteTag>
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-ink mb-3">Cooperatives</p>
        <div className="rounded-xl2 border border-teal-100 bg-white shadow-card divide-y divide-sand-200">
          {cooperatives.map((c) => (
            <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="text-xs text-ink-soft/55">{c.district}, {c.state} · {c.memberCount} members</p>
              </div>
              <p className="text-xs font-mono-data text-ink-soft/70">{c.utilization}% utilized</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
