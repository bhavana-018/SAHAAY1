import { Star, MapPin, Languages, Award } from "lucide-react";
import { CURRENT_WORKER, coopById } from "../../data/seed";
import { serviceById } from "../../data/seed";
import BadgeRow from "../../components/shared/BadgeRow";
import Timeline from "../../components/shared/Timeline";

export default function WorkerProfile() {
  const w = CURRENT_WORKER;
  const coop = coopById(w.coopId);

  const passportSteps = [
    { label: "Joined SAHAAY cooperative network", desc: coop.name, status: "done", date: `${coop.founded + 1}` },
    { label: "Identity verification", desc: "Aadhaar-linked identity confirmed", status: w.identityVerified ? "done" : "pending" },
    { label: "Skill certification", desc: w.certifications[0] || "Pending assessment", status: w.skillVerified ? "done" : "current" },
    { label: "Background check", desc: "Police verification & references", status: w.backgroundVerified ? "done" : "current" },
    { label: "Training milestone", desc: `${w.trainingCredits} training credits earned`, status: w.trainingCompleted ? "done" : "pending" },
    { label: `${w.completedJobs}th job completed`, desc: "Milestone badge unlocked", status: "current" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl2 border border-teal-100 bg-white p-5 md:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          <div className="h-20 w-20 rounded-full bg-teal-600 text-sand-50 flex items-center justify-center font-display font-semibold text-2xl shrink-0">
            {w.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl md:text-2xl font-semibold text-ink">{w.name}</h1>
              <span className="inline-flex items-center gap-1 text-sm text-marigold-600 font-medium">
                <Star size={14} className="fill-marigold-500 text-marigold-500" /> {w.rating} ({w.ratingCount})
              </span>
            </div>
            <p className="text-sm text-ink-soft/60 mt-1 flex items-center gap-1"><MapPin size={13} /> {w.locality}, {w.district} · {coop.name}</p>
            <p className="text-sm text-ink-soft/60 mt-1 flex items-center gap-1"><Languages size={13} /> {w.languages.join(", ")}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {w.skills.map((sid) => (
                <span key={sid} className="text-xs font-medium bg-teal-50 text-teal-700 rounded-full px-2.5 py-1">
                  {serviceById(sid)?.name}
                </span>
              ))}
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            <p className="text-xs text-ink-soft/50">Experience</p>
            <p className="font-display text-lg font-semibold text-ink">{w.experienceYears} yrs</p>
            <p className="text-xs text-ink-soft/50 mt-1">{w.completedJobs} jobs completed</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50 mb-2">Verification</p>
          <BadgeRow
            items={[
              { label: "Identity", value: w.identityVerified },
              { label: "Skill", value: w.skillVerified },
              { label: "Background", value: w.backgroundVerified },
              { label: "Training", value: w.trainingCompleted },
            ]}
          />
        </div>

        <div className="mt-5 pt-5 border-t border-sand-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50 mb-2 flex items-center gap-1.5">
            <Award size={13} /> Certifications
          </p>
          <ul className="text-sm text-ink-soft/75 space-y-1">
            {w.certifications.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-coop-500" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl2 border border-teal-100 bg-white p-5 md:p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Digital Skill Passport</h2>
        <Timeline steps={passportSteps} />
      </div>
    </div>
  );
}
