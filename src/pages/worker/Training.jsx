import { CURRENT_WORKER } from "../../data/seed";
import { coursesForWorker } from "../../lib/logic";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";
import { GraduationCap, Clock, Award } from "lucide-react";

export default function Training() {
  const w = CURRENT_WORKER;
  const courses = coursesForWorker(w);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Training & Upskilling"
        title="Recommended for you"
        blurb="Courses are linked to demand signals from the AI Demand Radar — recommending skills the cooperative needs more of, not just generic training."
      />

      <div className="rounded-xl2 border border-teal-100 bg-white p-4 shadow-card flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-marigold-100 grid place-items-center text-marigold-600 shrink-0">
          <Award size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{w.trainingCredits} training credits available</p>
          <p className="text-xs text-ink-soft/55">Earned from completed jobs and certifications.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {courses.map((c) => (
          <div key={c.id} className="rounded-xl2 border border-teal-100 bg-white p-4 shadow-card">
            <div className="flex items-start gap-2.5">
              <div className="rounded-full bg-teal-50 p-1.5 shrink-0"><GraduationCap size={16} className="text-teal-600" /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink leading-snug">{c.title}</p>
                <p className="text-xs text-ink-soft/60 mt-1 inline-flex items-center gap-1"><Clock size={11} /> {c.durationHrs} hrs · {c.credits} credit{c.credits > 1 ? "s" : ""}</p>
              </div>
            </div>
            <button className="mt-3 w-full rounded-full border border-teal-200 text-teal-700 text-xs font-semibold py-2 hover:bg-teal-50">
              Enroll
            </button>
          </div>
        ))}
      </div>
      <NoteTag>Enrollment is illustrative — no course content is actually delivered.</NoteTag>
    </div>
  );
}
