import { CURRENT_COOP } from "../../data/seed";
import { opportunityBalanceForCoop } from "../../lib/logic";
import { CompareBarChart } from "../../components/shared/ChartPair";
import KpiGrid from "../../components/shared/KpiGrid";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";
import { Scale, Users } from "lucide-react";

export default function OpportunityBalance() {
  const { rows, eligible, avgShare } = opportunityBalanceForCoop(CURRENT_COOP.id);
  const chartData = rows.slice(0, 12).map((r) => ({ name: r.worker.name.split(" ")[0], Share: r.sharePct }));

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Opportunity Balance"
        title="Fair spread of work across members"
        blurb="Tracks how evenly job opportunities are distributed across the cooperative, so work doesn't concentrate on a few 'star' members."
      />

      <KpiGrid
        items={[
          { label: "Average capacity used", value: `${avgShare}%`, icon: Scale },
          { label: "Members with spare capacity", value: eligible.length, icon: Users, sub: "eligible for more job routing" },
        ]}
        cols={2}
      />

      <div className="rounded-xl2 border border-teal-100 bg-white p-4 md:p-5 shadow-card">
        <p className="text-sm font-medium text-ink-soft/70 mb-2">Weekly capacity used per member</p>
        <CompareBarChart data={chartData} xKey="name" bars={[{ key: "Share", name: "% of weekly capacity used", color: "#2A7D6E" }]} />
        <NoteTag />
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-ink mb-3">Members eligible for more work this week</p>
        <div className="rounded-xl2 border border-teal-100 bg-white shadow-card divide-y divide-sand-200">
          {eligible.slice(0, 8).map((w) => (
            <div key={w.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{w.name}</p>
                <p className="text-xs text-ink-soft/55">{w.district}</p>
              </div>
              <p className="text-xs font-mono-data text-ink-soft/70">{w.workloadThisWeek}/{w.maxWeeklyCapacity} jobs</p>
            </div>
          ))}
          {!eligible.length && <p className="px-4 py-4 text-sm text-ink-soft/55">All members are near full capacity this week.</p>}
        </div>
      </div>
    </div>
  );
}
