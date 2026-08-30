import { Lightbulb, TrendingUp, ArrowRight } from "lucide-react";

export default function InsightCard({ insight, reason, action, tone = "teal" }) {
  const ring = { teal: "border-teal-100", marigold: "border-marigold-300", alert: "border-alert-400/40" }[tone];
  return (
    <div className={`rounded-xl2 border ${ring} bg-white p-4 md:p-5 shadow-card`}>
      <div className="flex items-start gap-2.5">
        <div className="rounded-full bg-marigold-100 p-1.5 shrink-0 mt-0.5">
          <Lightbulb size={16} className="text-marigold-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink leading-snug">{insight}</p>
          <p className="text-xs text-ink-soft/65 mt-1.5 leading-relaxed">{reason}</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-teal-600">
            <ArrowRight size={13} />
            <span>{action}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
