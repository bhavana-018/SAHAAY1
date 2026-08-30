import { Users, Wallet, TrendingUp, ShieldCheck, Star } from "lucide-react";
import { CURRENT_COOP, WORKERS, bookingsForCoop } from "../../data/seed";
import { formatINR } from "../../lib/logic";
import KpiGrid from "../../components/shared/KpiGrid";
import { WorkerCard } from "../../components/shared/EntityCard";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";

export default function CoopDashboard() {
  const coop = CURRENT_COOP;
  const members = WORKERS.filter((w) => w.coopId === coop.id);
  const bookings = bookingsForCoop(coop.id);
  const completed = bookings.filter((b) => b.status === "completed");
  const revenueThisPeriod = completed.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Cooperative Admin" title={coop.name} blurb={`${coop.district}, ${coop.state} · Founded ${coop.founded}`} />

      <KpiGrid
        items={[
          { label: "Members", value: members.length, icon: Users },
          { label: "Utilization", value: `${coop.utilization}%`, icon: TrendingUp, trend: coop.utilization > 75 ? 4 : -3 },
          { label: "Welfare fund", value: formatINR(coop.welfareFundBalance), icon: Wallet },
          { label: "Trust rating", value: `${coop.trustRating}★`, icon: Star },
        ]}
      />

      <div>
        <p className="font-display text-lg font-semibold text-ink mb-3">Top-performing members this period</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members
            .slice()
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6)
            .map((w) => (
              <WorkerCard key={w.id} worker={w} />
            ))}
        </div>
      </div>

      <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
        <p className="font-display text-lg font-semibold text-ink mb-1">Period revenue</p>
        <p className="font-mono-data text-2xl font-semibold text-teal-700">{formatINR(revenueThisPeriod)}</p>
        <p className="text-xs text-ink-soft/55 mt-1">From {completed.length} completed bookings across all members.</p>
        <NoteTag />
      </div>
    </div>
  );
}
