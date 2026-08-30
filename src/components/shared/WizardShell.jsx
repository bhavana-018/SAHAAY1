import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function WizardShell({ steps, current, onBack, onNext, nextLabel = "Continue", nextDisabled, children }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-1.5 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                i < current ? "bg-coop-500 text-sand-50" : i === current ? "bg-teal-600 text-sand-50" : "bg-sand-200 text-ink-soft/50"
              }`}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < current ? "bg-coop-500" : "bg-sand-200"}`} />}
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-marigold-600 mb-1">
        Step {current + 1} of {steps.length}
      </p>
      <h2 className="font-display text-xl md:text-2xl font-semibold text-ink mb-5">{steps[current]}</h2>

      <div className="animate-rise">{children}</div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={current === 0}
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft/70 disabled:opacity-0 hover:text-ink"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex items-center gap-1 text-sm font-semibold text-sand-50 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 rounded-full px-5 py-2.5 transition-colors"
        >
          {nextLabel} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
