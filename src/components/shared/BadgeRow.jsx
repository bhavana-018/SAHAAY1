import { CheckCircle2, CircleDashed } from "lucide-react";

export default function BadgeRow({ items, size = "md" }) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it.label}
          className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${pad} ${
            it.value
              ? "border-coop-500/30 bg-coop-500/10 text-coop-600"
              : "border-ink-soft/15 bg-sand-100 text-ink-soft/60"
          }`}
        >
          {it.value ? <CheckCircle2 size={size === "sm" ? 13 : 15} /> : <CircleDashed size={size === "sm" ? 13 : 15} />}
          {it.label}
        </span>
      ))}
    </div>
  );
}
