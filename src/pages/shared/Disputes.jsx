import { useState, useEffect } from "react";
import { CURRENT_CUSTOMER, CURRENT_WORKER, bookingsForCustomer, bookingsForWorker, serviceById } from "../../data/seed";
import { disputesForCustomer, disputesForWorker, classifyDispute } from "../../lib/logic";
import WizardShell from "../../components/shared/WizardShell";
import SectionHeader, { AiDisclaimer, NoteTag } from "../../components/shared/SectionHeader";
import { Plus, X } from "lucide-react";

const STATUS_STYLE = {
  open: "bg-marigold-100 text-marigold-700",
  under_review: "bg-teal-100 text-teal-700",
  escalated: "bg-alert-400/15 text-alert-600",
  resolved: "bg-coop-500/10 text-coop-600",
};

export default function Disputes({ role = "customer" }) {
  const isCustomer = role === "customer";
  const person = isCustomer ? CURRENT_CUSTOMER : CURRENT_WORKER;
  const bookings = isCustomer ? bookingsForCustomer(person.id) : bookingsForWorker(person.id);
  const disputes = isCustomer ? disputesForCustomer(person.id) : disputesForWorker(person.id);
  const [filing, setFiling] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader eyebrow="Complaints & Disputes" title="Track and file disputes" blurb="Every complaint is AI-categorized on filing, then routed to the cooperative for review with a full status trail." />
        <button onClick={() => setFiling(true)} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-sand-50 text-sm font-semibold px-4 py-2.5">
          <Plus size={15} /> File a dispute
        </button>
      </div>

      <div className="rounded-xl2 border border-teal-100 bg-white shadow-card divide-y divide-sand-200">
        {disputes.map((d) => (
          <div key={d.id} className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">{d.category}</p>
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLE[d.status]}`}>{d.status.replace("_", " ")}</span>
            </div>
            <p className="text-xs text-ink-soft/60 mt-1">{d.reason}</p>
            <p className="text-[11px] text-ink-soft/40 mt-1.5">Filed {d.filedDaysAgo}d ago · AI-categorized at {d.aiCategoryConfidence}% confidence</p>
          </div>
        ))}
        {!disputes.length && <p className="px-4 py-4 text-sm text-ink-soft/55">No disputes on file.</p>}
      </div>

      <AiDisclaimer>Category suggestions come from Hugging Face's free-tier hosted AI (falls back to keyword matching if unavailable) and are reviewed by the cooperative before any action is taken.</AiDisclaimer>

      {filing && <DisputeWizard bookings={bookings} onClose={() => setFiling(false)} />}
    </div>
  );
}

function DisputeWizard({ bookings, onClose }) {
  const [step, setStep] = useState(0);
  const [bookingId, setBookingId] = useState(bookings[0]?.id || null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const steps = ["Select booking", "Describe the issue", "Review & submit"];
  const [classification, setClassification] = useState(null);
  const [classifying, setClassifying] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setClassification(null);
      return;
    }
    let cancelled = false;
    setClassifying(true);
    classifyDispute(text).then((result) => {
      if (!cancelled) {
        setClassification(result);
        setClassifying(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-xl2 p-5 shadow-pop">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-lg font-semibold text-ink">File a dispute</p>
          <button onClick={onClose}><X size={18} className="text-ink-soft/50" /></button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <p className="font-display text-lg font-semibold text-ink">Dispute filed</p>
            <p className="text-sm text-ink-soft/60 mt-2">
              Categorized as <strong className="text-ink">{classification?.category}</strong> ({classification?.confidence}% confidence). Your cooperative will review this within 48 hours.
            </p>
            <button onClick={onClose} className="mt-5 rounded-full bg-teal-600 text-sand-50 text-sm font-semibold px-5 py-2.5">Done</button>
          </div>
        ) : (
          <WizardShell steps={steps} current={step} onBack={() => (step === 0 ? onClose() : setStep((s) => s - 1))} onNext={() => setStep((s) => Math.min(s + 1, steps.length - 1))} nextDisabled={step === 1 && !text.trim()} nextLabel={step === 2 ? "Submit" : "Continue"}>
            {step === 0 && (
              <div className="space-y-2">
                {bookings.slice(0, 6).map((b) => (
                  <button key={b.id} onClick={() => setBookingId(b.id)} className={`w-full text-left rounded-xl border p-3 text-sm ${bookingId === b.id ? "border-teal-500 bg-teal-50" : "border-sand-200"}`}>
                    {serviceById(b.serviceId)?.name} · {b.date}
                  </button>
                ))}
              </div>
            )}
            {step === 1 && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Describe what happened…"
                className="w-full rounded-xl border border-sand-200 p-3 text-sm outline-none focus:border-teal-400"
              />
            )}
            {step === 2 && (
              <div className="space-y-3 text-sm">
                <p className="text-ink-soft/70">{text}</p>
                {classifying && !classification && (
                  <p className="text-xs text-ink-soft/50 font-medium">Categorizing…</p>
                )}
                {classification && (
                  <p className="text-xs text-teal-600 font-medium">AI suggests category: {classification.category} ({classification.confidence}% confidence)</p>
                )}
                <button onClick={() => setSubmitted(true)} className="w-full rounded-full bg-teal-600 hover:bg-teal-700 text-sand-50 font-semibold text-sm py-2.5">
                  Submit dispute
                </button>
              </div>
            )}
          </WizardShell>
        )}
      </div>
    </div>
  );
}
