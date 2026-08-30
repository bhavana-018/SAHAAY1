import { useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { Clock, Users, ArrowRight, Search, ListChecks, Sparkles } from "lucide-react";
import { SERVICES, workersForService } from "../../data/seed";
import { formatINR } from "../../lib/logic";
import SectionHeader from "../../components/shared/SectionHeader";

const STEPS = [
  { title: "Pick a category", body: "Choose the kind of work you need — electrical, plumbing, cleaning, and more." },
  { title: "Describe the issue", body: "Type or speak what is going wrong, and add a photo if it helps." },
  { title: "Match a worker", body: "FairMatch ranks verified cooperative members nearby — not a lowest-bid auction." },
  { title: "Pay your way", body: "Checkout with UPI, card, net banking, or your SAHAAY wallet." },
];

export default function BookService({ onBook }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SERVICES;
    return SERVICES.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Book a Service"
        title="Choose what you need done"
        blurb="Browse categories, then start a booking. FairMatch will find a verified cooperative worker near you."
      />

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search services — plumbing, AC, shifting…"
          className="w-full rounded-full border border-sand-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-teal-400"
        />
      </div>

      <div className="rounded-xl2 border border-teal-100 bg-teal-50/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 mb-3 inline-flex items-center gap-1.5">
          <ListChecks size={13} /> How a booking works
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-xl bg-white border border-teal-100 p-3">
              <p className="text-[11px] font-mono-data font-semibold text-teal-600">0{i + 1}</p>
              <p className="text-sm font-semibold text-ink mt-1">{s.title}</p>
              <p className="text-xs text-ink-soft/60 mt-1 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-ink">All service categories</h2>
          <p className="text-xs text-marigold-600 font-semibold uppercase tracking-wide">Sample Data</p>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-ink-soft/50 py-8 text-center">No services match “{query}”.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s, i) => {
              const Icon = Icons[s.icon] || Icons.Wrench;
              const workers = workersForService(s.id);
              const avgResponse = workers.length
                ? Math.round(workers.reduce((sum, w) => sum + w.avgResponseMins, 0) / workers.length)
                : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => onBook(s.id)}
                  className="animate-rise text-left rounded-xl2 border border-teal-100 bg-white p-4 shadow-card hover:shadow-pop hover:border-teal-300 transition-all group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <Icon size={20} />
                    </div>
                    <ArrowRight size={16} className="text-ink-soft/30 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="font-medium text-ink mt-3 text-sm">{s.name}</p>
                  <p className="font-mono-data text-teal-700 font-semibold text-sm mt-0.5">from {formatINR(s.basePrice)}</p>
                  <div className="flex items-center gap-3 text-xs text-ink-soft/55 mt-2">
                    <span className="inline-flex items-center gap-1"><Clock size={11} /> ~{avgResponse}m</span>
                    <span className="inline-flex items-center gap-1"><Users size={11} /> {workers.length} nearby</span>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                    <Sparkles size={12} /> Start booking
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
