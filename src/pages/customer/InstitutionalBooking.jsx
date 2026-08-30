import { useState } from "react";
import { INSTITUTIONS, SERVICES } from "../../data/seed";
import { formatINR } from "../../lib/logic";
import WizardShell from "../../components/shared/WizardShell";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";
import PaymentFlow from "../../components/shared/PaymentFlow";
import { Building2, CheckCircle2, Minus, Plus } from "lucide-react";

const STEPS = ["Institution", "Services needed", "Recurrence", "Review & pay"];
const FREQUENCIES = ["One-time", "Weekly", "Monthly", "Quarterly"];

export default function InstitutionalBooking() {
  const [step, setStep] = useState(0);
  const [instId, setInstId] = useState(INSTITUTIONS[0].id);
  const [serviceNeeds, setServiceNeeds] = useState({});
  const [frequency, setFrequency] = useState(FREQUENCIES[0]);
  const [showPayment, setShowPayment] = useState(false);
  const [done, setDone] = useState(false);

  const inst = INSTITUTIONS.find((i) => i.id === instId);
  const selectedServices = SERVICES.filter((s) => serviceNeeds[s.id]);
  const workerTotal = selectedServices.reduce((n, svc) => n + (serviceNeeds[svc.id] || 0), 0);
  const estTotal = selectedServices.reduce(
    (sum, svc) => sum + svc.basePrice * inst.units * (serviceNeeds[svc.id] || 1),
    0
  );

  const toggleService = (id) =>
    setServiceNeeds((s) => {
      if (s[id]) {
        const next = { ...s };
        delete next[id];
        return next;
      }
      return { ...s, [id]: 1 };
    });

  const setWorkers = (id, delta) =>
    setServiceNeeds((s) => {
      if (!s[id]) return s;
      return { ...s, [id]: Math.min(20, Math.max(1, s[id] + delta)) };
    });

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <CheckCircle2 size={40} className="text-coop-500 mx-auto mb-3" />
        <p className="font-display text-xl font-semibold text-ink">Institutional booking confirmed</p>
        <p className="text-sm text-ink-soft/60 mt-2">
          {inst.name} · {frequency.toLowerCase()} service across {inst.units} unit(s) · {workerTotal} worker{workerTotal === 1 ? "" : "s"} requested.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Institutional Booking" title="Bulk & recurring service" blurb="For schools, hospitals, apartment complexes, and offices — book across multiple units on a recurring schedule." />

      <WizardShell
        steps={STEPS}
        current={step}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => (step === STEPS.length - 1 ? setShowPayment(true) : setStep((s) => s + 1))}
        nextDisabled={step === 1 && !selectedServices.length}
        nextLabel={step === STEPS.length - 1 ? "Proceed to payment" : "Continue"}
      >
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {INSTITUTIONS.map((i) => (
              <button key={i.id} onClick={() => setInstId(i.id)} className={`text-left rounded-xl2 border p-4 ${instId === i.id ? "border-teal-500 bg-teal-50" : "border-sand-200 bg-white"}`}>
                <Building2 size={18} className="text-teal-600 mb-2" />
                <p className="text-sm font-semibold text-ink">{i.name}</p>
                <p className="text-xs text-ink-soft/55 mt-0.5">{i.type} · {i.district} · {i.units} units</p>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft/60">Select each service, then set how many workers you need for it.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map((s) => {
                const selected = Boolean(serviceNeeds[s.id]);
                const count = serviceNeeds[s.id] || 1;
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl border p-3 text-sm text-left ${selected ? "border-teal-500 bg-teal-50" : "border-sand-200 bg-white"}`}
                  >
                    <button type="button" onClick={() => toggleService(s.id)} className="w-full text-left font-medium text-ink">
                      {s.name}
                    </button>
                    <p className="text-[11px] text-ink-soft/50 mt-0.5">from {formatINR(s.basePrice)} per worker</p>
                    {selected && (
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-ink-soft/65">Workers needed</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setWorkers(s.id, -1)}
                            className="h-7 w-7 rounded-full border border-teal-200 grid place-items-center text-teal-700 hover:bg-white"
                            aria-label={`Fewer workers for ${s.name}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-mono-data text-sm font-semibold text-teal-700 w-6 text-center">{count}</span>
                          <button
                            type="button"
                            onClick={() => setWorkers(s.id, 1)}
                            className="h-7 w-7 rounded-full border border-teal-200 grid place-items-center text-teal-700 hover:bg-white"
                            aria-label={`More workers for ${s.name}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <button key={f} onClick={() => setFrequency(f)} className={`rounded-full px-4 py-2 text-sm font-medium border ${frequency === f ? "bg-teal-600 text-sand-50 border-teal-600" : "border-sand-200 text-ink-soft/70"}`}>
                {f}
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="rounded-xl2 border border-teal-100 bg-white p-4 space-y-2 text-sm text-ink-soft/75">
            <p><strong className="text-ink">{inst.name}</strong> · {inst.units} units</p>
            <ul className="space-y-1">
              {selectedServices.map((s) => (
                <li key={s.id}>
                  {s.name} — {serviceNeeds[s.id]} worker{serviceNeeds[s.id] === 1 ? "" : "s"}
                </li>
              ))}
            </ul>
            <p>Frequency: {frequency}</p>
            <p className="font-mono-data text-teal-700 font-semibold text-base mt-1">{formatINR(estTotal)} estimated per cycle</p>
          </div>
        )}
      </WizardShell>
      <NoteTag />

      {showPayment && (
        <PaymentFlow
          amount={estTotal}
          note={`Institutional booking · ${inst.name}`}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            setDone(true);
          }}
        />
      )}
    </div>
  );
}
