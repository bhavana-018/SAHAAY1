import { useState, useMemo, useEffect } from "react";
import * as Icons from "lucide-react";
import { Image as ImageIcon, Video, Type, Clock, Sparkles, X, Info } from "lucide-react";
import { SERVICES, CURRENT_CUSTOMER } from "../../data/seed";
import { fairMatchResults, explainMatch, explainMatchAI, classifyIssue, classifyIssueAI, formatINR } from "../../lib/logic";
import WizardShell from "../../components/shared/WizardShell";
import VoiceMic from "../../components/shared/VoiceMic";
import { WorkerCard } from "../../components/shared/EntityCard";
import LocalityMap from "../../components/shared/LocalityMap";
import BreakdownLedger from "../../components/shared/BreakdownLedger";
import PaymentFlow from "../../components/shared/PaymentFlow";

const STEPS = ["Choose a service", "Describe the issue", "Location & radius", "Pick a time", "AI suggestion", "Choose your worker"];
const LOCALITIES_NEARBY = ["Governorpet", "Benz Circle", "Patamata", "Auto Nagar", "Ashok Nagar"];
const TIME_SLOTS = ["Today, 2:00 – 4:00 PM", "Today, 5:00 – 7:00 PM", "Tomorrow, 9:00 – 11:00 AM", "Tomorrow, 2:00 – 4:00 PM"];

export default function BookingWizard({ initialServiceId, onComplete, onExit }) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(initialServiceId || null);
  const [descText, setDescText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [locality, setLocality] = useState(LOCALITIES_NEARBY[0]);
  const [radius, setRadius] = useState(5);
  const [slot, setSlot] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showWageGuard, setShowWageGuard] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const keywordSuggestedService = useMemo(() => classifyIssue(descText || ""), [descText]);
  const [aiSuggestedService, setAiSuggestedService] = useState(null);

  // Instant for common phrasing (keyword match above); only fall through to a real
  // model call when the description doesn't match any known keyword.
  useEffect(() => {
    if (keywordSuggestedService || !descText.trim()) {
      setAiSuggestedService(null);
      return;
    }
    let cancelled = false;
    classifyIssueAI(descText).then((result) => {
      if (!cancelled) setAiSuggestedService(result);
    });
    return () => {
      cancelled = true;
    };
  }, [descText, keywordSuggestedService]);

  const suggestedService = keywordSuggestedService || aiSuggestedService;
  const finalServiceId = serviceId;
  const service = SERVICES.find((s) => s.id === finalServiceId);

  const results = useMemo(() => {
    if (!finalServiceId) return [];
    return fairMatchResults({ serviceId: finalServiceId, district: CURRENT_CUSTOMER.district }, 6);
  }, [finalServiceId]);

  const canNext = [
    !!serviceId,
    descText.trim().length > 0,
    !!locality,
    !!slot,
    true,
    false, // last step: completion happens via booking, not "next"
  ][step];

  const next = () => {
    if (step === 4 && suggestedService && suggestedService.id !== serviceId) {
      // user can accept suggestion on this step via its own UI; just advance
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => (step === 0 ? onExit?.() : setStep((s) => s - 1));

  return (
    <div>
      <button onClick={onExit} className="text-xs text-ink-soft/50 hover:text-ink-soft mb-4 inline-flex items-center gap-1">
        <X size={13} /> Cancel booking
      </button>

      <WizardShell steps={STEPS} current={step} onBack={back} onNext={next} nextDisabled={!canNext && step < 5} nextLabel={step === 4 ? "See matches" : "Continue"}>
        {step === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICES.map((s) => {
              const Icon = Icons[s.icon] || Icons.Wrench;
              return (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`text-left rounded-xl border p-3.5 transition-all ${
                    serviceId === s.id ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400" : "border-sand-200 hover:border-teal-200"
                  }`}
                >
                  <Icon size={18} className="text-teal-600" />
                  <p className="text-xs font-medium text-ink mt-2 leading-snug">{s.name}</p>
                  <p className="text-[11px] font-mono-data text-ink-soft/50 mt-0.5">from {formatINR(s.basePrice)}</p>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-soft/60">
              <Type size={14} /> Type, or use voice
            </div>
            <div className="flex gap-2">
              <textarea
                value={descText}
                onChange={(e) => setDescText(e.target.value)}
                rows={4}
                placeholder="e.g. There's a water leak from the kitchen pipe under the sink…"
                className="flex-1 rounded-xl border border-sand-200 bg-sand-50 p-3.5 text-sm outline-none focus:border-teal-400 resize-none"
              />
              <VoiceMic onTranscript={(t) => setDescText((d) => (d ? d + " " + t : t))} />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-soft/60 mb-2 flex items-center gap-1.5"><ImageIcon size={13} /> <Video size={13} /> Add a photo or video (optional)</p>
              <div className="flex gap-2 flex-wrap">
                {attachments.map((a, i) => (
                  <div key={i} className="h-14 w-14 rounded-lg bg-sand-100 border border-sand-200 flex items-center justify-center text-ink-soft/40">
                    {a === "image" ? <ImageIcon size={18} /> : <Video size={18} />}
                  </div>
                ))}
                <button
                  onClick={() => setAttachments((a) => [...a, Math.random() > 0.5 ? "image" : "video"])}
                  className="h-14 w-14 rounded-lg border-2 border-dashed border-sand-200 text-ink-soft/40 hover:border-teal-300 hover:text-teal-500 flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <LocalityMap locality={locality} radiusKm={radius} />
            <div>
              <p className="text-xs font-medium text-ink-soft/60 mb-2">Locality</p>
              <div className="flex flex-wrap gap-2">
                {LOCALITIES_NEARBY.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocality(l)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                      locality === l ? "bg-teal-600 border-teal-600 text-sand-50" : "border-sand-200 text-ink-soft/70 hover:border-teal-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-ink-soft/60 mb-1.5">
                <span>Search radius</span>
                <span className="font-mono-data font-semibold text-teal-700">{radius} km</span>
              </div>
              <input type="range" min={1} max={15} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-teal-600" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIME_SLOTS.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`text-left rounded-xl border p-3.5 transition-all flex items-center gap-2.5 ${
                  slot === s ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400" : "border-sand-200 hover:border-teal-200"
                }`}
              >
                <Clock size={16} className="text-teal-600 shrink-0" />
                <span className="text-sm text-ink">{s}</span>
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl2 border border-marigold-300 bg-marigold-100/40 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={16} className="text-marigold-600" />
                <p className="text-sm font-semibold text-ink">AI Service Assistant suggestion</p>
              </div>
              {suggestedService ? (
                <p className="text-sm text-ink-soft/75">
                  Based on your description, this sounds like a <strong className="text-ink">{suggestedService.name}</strong> job.
                  {suggestedService.id !== serviceId && (
                    <button onClick={() => setServiceId(suggestedService.id)} className="ml-2 text-teal-600 font-semibold underline underline-offset-2">
                      Switch category
                    </button>
                  )}
                </p>
              ) : (
                <p className="text-sm text-ink-soft/75">
                  We'll keep your booking under <strong className="text-ink">{service?.name}</strong> — your description didn't
                  clearly match a different category, which is fine.
                </p>
              )}
              <p className="text-[11px] text-ink-soft/45 mt-2">
                AI-suggested category, from keyword matching plus Hugging Face's free-tier hosted AI for anything the keywords miss — not a diagnosis. A verified worker confirms the actual issue on arrival.
              </p>
            </div>
            <div className="rounded-xl border border-sand-200 p-3.5 text-sm text-ink-soft/70">
              <p><strong className="text-ink">Category:</strong> {service?.name}</p>
              <p><strong className="text-ink">Location:</strong> {locality} (within {radius} km)</p>
              <p><strong className="text-ink">Time:</strong> {slot}</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-soft/60">
              Ranked by FairMatch — skill fit, distance, live availability, certification, customer rating, current
              workload, and fair opportunity across the cooperative.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {results.map((r) => (
                <WorkerCard
                  key={r.worker.id}
                  worker={r.worker}
                  score={r.total}
                  onSelect={() => setSelectedWorker(r)}
                  footer={
                    <div className="mt-2 pt-2 border-t border-sand-200 flex items-center justify-between">
                      <MatchExplanation scored={r} />
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}
      </WizardShell>

      {selectedWorker && (
        <ConfirmModal
          service={service}
          result={selectedWorker}
          slot={slot}
          locality={locality}
          onClose={() => setSelectedWorker(null)}
          onViewBreakdown={() => setShowWageGuard(selectedWorker)}
          onConfirm={() => setShowPayment(true)}
        />
      )}

      {showWageGuard && (
        <FairWageGuardModal service={service} onClose={() => setShowWageGuard(null)} />
      )}

      {showPayment && (
        <PaymentFlow
          amount={service.basePrice}
          note={`${service.name} booking`}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            onComplete({ serviceId, worker: selectedWorker.worker, slot, locality, amount: service.basePrice });
          }}
        />
      )}
    </div>
  );
}

// Worker scoring & ranking is never model-driven — only this one-sentence "why" is.
// Shows the instant deterministic template immediately (no blank/loading state), then
// swaps in the real local-model sentence a few hundred ms later once it resolves.
function MatchExplanation({ scored }) {
  const [text, setText] = useState(() => explainMatch(scored));

  useEffect(() => {
    let cancelled = false;
    explainMatchAI(scored)
      .then((aiText) => {
        if (!cancelled && aiText) setText(aiText);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scored.worker.id]);

  return <p className="text-[11px] text-ink-soft/50">{text}</p>;
}

function ConfirmModal({ service, result, slot, locality, onClose, onViewBreakdown, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl2 p-5 shadow-pop animate-rise">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-lg font-semibold text-ink">Confirm booking</p>
          <button onClick={onClose}><X size={18} className="text-ink-soft/50" /></button>
        </div>
        <div className="space-y-1.5 text-sm text-ink-soft/75 mb-4">
          <p><strong className="text-ink">{service.name}</strong> with <strong className="text-ink">{result.worker.name}</strong></p>
          <p>{locality} · {slot}</p>
          <p className="font-mono-data text-teal-700 font-semibold text-base mt-1">{formatINR(service.basePrice)} estimated</p>
        </div>
        <button onClick={onViewBreakdown} className="text-xs text-teal-600 font-semibold underline underline-offset-2 mb-4 inline-flex items-center gap-1">
          <Info size={12} /> See the Fair Wage Guard price breakdown
        </button>
        <button onClick={onConfirm} className="w-full rounded-full bg-teal-600 hover:bg-teal-700 text-sand-50 font-semibold text-sm py-3 transition-colors">
          Confirm & book
        </button>
      </div>
    </div>
  );
}

function FairWageGuardModal({ service, onClose }) {
  const amount = service.basePrice;
  const breakdown = {
    worker: Math.round(amount * 0.72),
    cooperative: Math.round(amount * 0.15),
    welfare: Math.round(amount * 0.08),
    ops: Math.round(amount * 0.05),
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl2 p-5 shadow-pop animate-rise">
        <div className="flex items-center justify-between mb-1">
          <p className="font-display text-lg font-semibold text-ink">Fair Wage Guard</p>
          <button onClick={onClose}><X size={18} className="text-ink-soft/50" /></button>
        </div>
        <p className="text-xs text-ink-soft/55 mb-4">
          A floor price the cooperative sets for {service.name.toLowerCase()}, so no worker is ever pushed below a
          living rate to win the job. This split is cooperative-configurable — the figures below are this
          cooperative's current policy.
        </p>
        <BreakdownLedger breakdown={breakdown} total={amount} />
      </div>
    </div>
  );
}
