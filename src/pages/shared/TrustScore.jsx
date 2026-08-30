import { CURRENT_WORKER, CURRENT_CUSTOMER } from "../../data/seed";
import { trustFactorRows, customerTrustFactorRows } from "../../lib/logic";
import BadgeRow from "../../components/shared/BadgeRow";
import SectionHeader, { AiDisclaimer } from "../../components/shared/SectionHeader";

function Gauge({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card flex items-center gap-5">
      <div
        className="h-24 w-24 shrink-0 rounded-full grid place-items-center"
        style={{ background: `conic-gradient(#2A7D6E ${pct * 3.6}deg, #EFE7D4 0deg)` }}
      >
        <div className="h-[74px] w-[74px] rounded-full bg-white grid place-items-center">
          <p className="font-mono-data font-semibold text-xl text-teal-700">{Math.round(pct)}</p>
        </div>
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-ink">Two-sided trust</p>
        <p className="text-xs text-ink-soft/60 mt-1 max-w-xs">
          Computed from verification status, delivery reliability, and dispute history — visible to both sides of every booking.
        </p>
      </div>
    </div>
  );
}

export default function TrustScore({ role = "worker" }) {
  const isWorker = role === "worker";
  const worker = CURRENT_WORKER;
  const customer = CURRENT_CUSTOMER;
  const rows = isWorker ? trustFactorRows(worker) : customerTrustFactorRows(customer);
  const score = isWorker ? worker.trustScore : rows.reduce((s, r) => s + (r.value ? r.weight : 0), 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Trust Score"
        title={isWorker ? "Your verified trust profile" : "Your customer trust profile"}
        blurb="Trust scores are two-sided by design — both customers and workers build a track record that the other side can see before committing to a booking."
      />
      <Gauge score={score} />
      <div>
        <p className="font-display text-lg font-semibold text-ink mb-3">Score factors</p>
        <BadgeRow items={rows.map((r) => ({ label: `${r.label} (${r.weight}%)`, value: r.value }))} />
      </div>
      <AiDisclaimer>Trust scores are a weighted rules-based composite, recalculated after every completed booking — not a credit or background-check service.</AiDisclaimer>
    </div>
  );
}
