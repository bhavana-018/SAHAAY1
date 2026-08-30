import { CURRENT_WORKER } from "../../data/seed";
import { verificationStages } from "../../lib/logic";
import Timeline from "../../components/shared/Timeline";
import BadgeRow from "../../components/shared/BadgeRow";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";
import { Upload } from "lucide-react";

export default function Verification() {
  const w = CURRENT_WORKER;
  const stages = verificationStages(w);
  const allDone = stages.every((s) => s.status === "done");

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Verification Center"
        title="Your verification status"
        blurb="Every worker moves through the same four-stage verification pipeline before appearing in FairMatch results."
      />

      <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-ink-soft/70">Pipeline status</p>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${allDone ? "bg-coop-500/10 text-coop-600" : "bg-marigold-100 text-marigold-700"}`}>
            {allDone ? "Fully verified" : "In progress"}
          </span>
        </div>
        <Timeline orientation="horizontal" steps={stages.map((s) => ({ label: s.label, status: s.status }))} />
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-ink mb-3">Verified attributes</p>
        <BadgeRow
          items={[
            { label: "Identity Verified", value: w.identityVerified },
            { label: "Skill Certified", value: w.skillVerified },
            { label: "Background Check", value: w.backgroundVerified },
            { label: "Training Completed", value: w.trainingCompleted },
          ]}
        />
      </div>

      {!allDone && (
        <button className="inline-flex items-center gap-2 rounded-full bg-teal-600 hover:bg-teal-700 text-sand-50 text-sm font-semibold px-4 py-2.5 transition-colors">
          <Upload size={15} /> Upload next document
        </button>
      )}
      <NoteTag>Document upload is illustrative only — no files are stored.</NoteTag>
    </div>
  );
}
