import { useState } from "react";
import { CURRENT_CUSTOMER, SERVICES } from "../../data/seed";
import { emergencyEligibleWorkers } from "../../lib/logic";
import { WorkerCard } from "../../components/shared/EntityCard";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";
import { Siren, PhoneCall } from "lucide-react";

const EMERGENCY_SERVICES = SERVICES.filter((s) => ["electrical", "plumbing", "ac"].includes(s.id));

export default function Emergency({ role = "customer" }) {
  const [serviceId, setServiceId] = useState(EMERGENCY_SERVICES[0].id);
  const [dispatched, setDispatched] = useState(null);

  if (role === "worker") {
    return (
      <div className="space-y-8">
        <SectionHeader eyebrow="Emergency Service" title="Emergency call-outs near you" blurb="High-priority jobs are routed here first to eligible, currently-available members." />
        <div className="rounded-xl2 border border-alert-500/30 bg-alert-50 p-4 text-sm text-alert-600">
          No active emergency call-outs matched to you right now. You'll be notified immediately if one comes in.
        </div>
        <NoteTag>Emergency dispatch is simulated — no real-time GPS is used.</NoteTag>
      </div>
    );
  }

  const candidates = emergencyEligibleWorkers(CURRENT_CUSTOMER.district, serviceId);

  return (
    <div className="space-y-8">
      <div className="rounded-xl2 bg-alert-500 text-white p-5 shadow-pop flex items-center gap-3">
        <Siren size={26} />
        <div>
          <p className="font-display text-lg font-semibold">Emergency Service</p>
          <p className="text-sm text-white/85">Priority dispatch for urgent, safety-critical issues.</p>
        </div>
      </div>

      {!dispatched ? (
        <>
          <div className="flex flex-wrap gap-2">
            {EMERGENCY_SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                  serviceId === s.id ? "bg-alert-500 text-white border-alert-500" : "border-sand-200 text-ink-soft/70 hover:bg-sand-100"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {candidates.map((w) => (
              <WorkerCard
                key={w.id}
                worker={w}
                footer={
                  <button
                    onClick={() => setDispatched(w)}
                    className="mt-2 w-full rounded-full bg-alert-500 hover:bg-alert-600 text-white text-sm font-semibold py-2 transition-colors"
                  >
                    Dispatch now — ETA {w.avgResponseMins} min
                  </button>
                }
              />
            ))}
            {!candidates.length && <p className="text-sm text-ink-soft/55">No eligible workers available for this service right now.</p>}
          </div>
        </>
      ) : (
        <div className="rounded-xl2 border border-alert-500/30 bg-white p-5 shadow-card">
          <p className="font-display text-lg font-semibold text-ink">Help is on the way</p>
          <p className="text-sm text-ink-soft/65 mt-1">{dispatched.name} has been dispatched — estimated arrival in {dispatched.avgResponseMins} minutes.</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-teal-700 font-medium">
            <PhoneCall size={16} /> Call {dispatched.name.split(" ")[0]}
          </div>
        </div>
      )}
      <NoteTag>Dispatch and ETA are simulated states.</NoteTag>
    </div>
  );
}
