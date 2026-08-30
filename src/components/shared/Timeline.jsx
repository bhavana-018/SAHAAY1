import { CheckCircle2, Circle, Loader2 } from "lucide-react";

// status: "done" | "current" | "pending"
export default function Timeline({ steps, orientation = "vertical" }) {
  if (orientation === "horizontal") {
    return (
      <div className="flex items-center overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1.5 w-28 text-center">
              <StepIcon status={s.status} />
              <p className={`text-xs font-medium ${s.status === "pending" ? "text-ink-soft/40" : "text-ink"}`}>{s.label}</p>
              {s.date && <p className="text-[10px] text-ink-soft/50">{s.date}</p>}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-10 shrink-0 ${s.status === "done" ? "bg-coop-500" : "bg-sand-200"}`} />
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
      {steps.map((s, i) => (
        <div key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <StepIcon status={s.status} />
            {i < steps.length - 1 && <div className={`w-0.5 flex-1 min-h-[24px] ${s.status === "done" ? "bg-coop-500" : "bg-sand-200"}`} />}
          </div>
          <div className="pb-5">
            <p className={`text-sm font-medium ${s.status === "pending" ? "text-ink-soft/50" : "text-ink"}`}>{s.label}</p>
            {s.desc && <p className="text-xs text-ink-soft/60 mt-0.5">{s.desc}</p>}
            {s.date && <p className="text-[11px] text-ink-soft/45 mt-0.5 font-mono-data">{s.date}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepIcon({ status }) {
  if (status === "done") return <CheckCircle2 size={20} className="text-coop-500 shrink-0" />;
  if (status === "current") return <Loader2 size={20} className="text-marigold-500 shrink-0 animate-spin" style={{ animationDuration: "2.5s" }} />;
  return <Circle size={20} className="text-sand-200 shrink-0" />;
}
