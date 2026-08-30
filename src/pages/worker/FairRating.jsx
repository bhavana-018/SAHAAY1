import { CURRENT_WORKER, customerById } from "../../data/seed";
import { ratingAnomalies } from "../../lib/logic";
import SectionHeader, { AiDisclaimer } from "../../components/shared/SectionHeader";
import { Star, AlertTriangle } from "lucide-react";

export default function FairRating() {
  const w = CURRENT_WORKER;
  const { flagged, avg, jobs = [] } = ratingAnomalies(w.id);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Fair Rating Intelligence"
        title="Multi-dimension ratings"
        blurb="Ratings are broken into punctuality, quality, and professionalism, and checked for statistical outliers that may need cooperative review."
      />

      {avg != null && (
        <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
          <p className="text-sm font-medium text-ink-soft/70">Average across dimensions</p>
          <p className="font-mono-data text-2xl font-semibold text-teal-700 mt-1 inline-flex items-center gap-1.5">
            <Star size={20} className="text-marigold-500 fill-marigold-500" /> {avg}
          </p>
        </div>
      )}

      <div>
        <p className="font-display text-lg font-semibold text-ink mb-3">Rated jobs</p>
        <div className="rounded-xl2 border border-teal-100 bg-white shadow-card divide-y divide-sand-200">
          {jobs.map((b) => {
            const isFlagged = flagged.includes(b);
            return (
              <div key={b.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{customerById(b.customerId)?.name}</p>
                  <p className="text-xs text-ink-soft/55">
                    Punctuality {b.ratingDims.punctuality} · Quality {b.ratingDims.quality} · Professionalism {b.ratingDims.professionalism}
                  </p>
                </div>
                {isFlagged && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-alert-50 text-alert-600 border border-alert-500/30">
                    <AlertTriangle size={12} /> Requires Cooperative Review
                  </span>
                )}
              </div>
            );
          })}
          {!jobs.length && <p className="px-4 py-4 text-sm text-ink-soft/55">No rated jobs yet.</p>}
        </div>
      </div>

      <AiDisclaimer>Anomaly flags are based on statistical deviation from a worker's own average rating — they surface for cooperative review, not automatic penalty.</AiDisclaimer>
    </div>
  );
}
