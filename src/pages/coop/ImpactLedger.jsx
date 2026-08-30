import { CURRENT_COOP } from "../../data/seed";
import { impactLedgerForCoop, formatINR } from "../../lib/logic";
import BreakdownLedger from "../../components/shared/BreakdownLedger";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";

export default function ImpactLedger() {
  const { totals, impacts, bookingCount } = impactLedgerForCoop(CURRENT_COOP.id);
  const total = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Impact Ledger"
        title="Where every rupee went"
        blurb={`Aggregated from ${bookingCount} completed bookings this period — every payment split into worker pay, cooperative reinvestment, welfare, and platform costs.`}
      />

      <BreakdownLedger breakdown={totals} total={total} />

      <div className="grid sm:grid-cols-2 gap-3">
        {impacts.map((row) => (
          <div key={row.label} className="rounded-xl2 border border-teal-100 bg-white p-4 shadow-card">
            <p className="text-sm font-medium text-ink">{row.label}</p>
            <p className="font-mono-data text-xl font-semibold text-teal-700 mt-1">{formatINR(row.amount)}</p>
            <p className="text-xs text-ink-soft/55 mt-1.5">{row.note}</p>
          </div>
        ))}
      </div>
      <NoteTag>Figures reflect completed bookings only, aggregated live from the booking ledger.</NoteTag>
    </div>
  );
}
