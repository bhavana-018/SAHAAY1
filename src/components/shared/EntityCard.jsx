import { Star, MapPin, ShieldCheck, Clock, Users } from "lucide-react";
import { formatINR } from "../../lib/logic";

function Initials({ name }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className="h-11 w-11 shrink-0 rounded-full bg-teal-600 text-sand-50 flex items-center justify-center font-display font-semibold text-sm">
      {initials}
    </div>
  );
}

export function WorkerCard({ worker, score, onSelect, footer }) {
  return (
    <div className="animate-rise rounded-xl2 border border-teal-100 bg-white p-4 shadow-card hover:shadow-pop transition-shadow">
      <div className="flex items-start gap-3">
        <Initials name={worker.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-ink truncate">{worker.name}</p>
            {score != null && (
              <span className="shrink-0 rounded-full bg-marigold-100 text-marigold-600 text-xs font-semibold px-2 py-0.5 font-mono-data">
                {score} match
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-ink-soft/60 mt-0.5">
            <MapPin size={12} /> {worker.district}
            <span className="mx-1">•</span>
            <Star size={12} className="text-marigold-500 fill-marigold-500" /> {worker.rating} ({worker.ratingCount})
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-soft/60 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1"><ShieldCheck size={12} className="text-coop-500" /> Trust {worker.trustScore}</span>
            <span className="inline-flex items-center gap-1"><Clock size={12} /> ~{worker.avgResponseMins}m</span>
            <span className={`inline-flex items-center gap-1 font-medium ${worker.availabilityToday ? "text-coop-600" : "text-ink-soft/45"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${worker.availabilityToday ? "bg-coop-500" : "bg-ink-soft/30"}`} />
              {worker.availabilityToday ? "Available today" : "Not available today"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="font-mono-data font-semibold text-teal-700 text-sm">{formatINR(worker.hourlyRate)}/visit est.</p>
        {onSelect && (
          <button onClick={() => onSelect(worker)} className="text-xs font-semibold text-sand-50 bg-teal-600 hover:bg-teal-700 rounded-full px-3.5 py-1.5 transition-colors">
            Select
          </button>
        )}
      </div>
      {footer}
    </div>
  );
}

export function BookingCard({ booking, service, worker, customer }) {
  const statusStyle = {
    completed: "bg-coop-500/10 text-coop-600",
    in_progress: "bg-marigold-100 text-marigold-600",
    scheduled: "bg-teal-100 text-teal-600",
    cancelled: "bg-alert-500/10 text-alert-500",
  }[booking.status];
  return (
    <div className="animate-rise rounded-xl2 border border-teal-100 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-medium text-ink">{service?.name}</p>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusStyle}`}>
          {booking.status.replace("_", " ")}
        </span>
      </div>
      <p className="text-xs text-ink-soft/60 mt-1">
        {worker ? `with ${worker.name}` : customer ? `for ${customer.name}` : ""} · {booking.date}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <p className="font-mono-data text-sm font-semibold text-teal-700">{formatINR(booking.amount)}</p>
        {booking.rating && (
          <span className="inline-flex items-center gap-1 text-xs text-ink-soft/60">
            <Star size={12} className="text-marigold-500 fill-marigold-500" /> {booking.rating}
          </span>
        )}
      </div>
    </div>
  );
}

export function CooperativeCard({ coop, onSelect }) {
  return (
    <div className="animate-rise rounded-xl2 border border-teal-100 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-ink">{coop.name}</p>
          <p className="text-xs text-ink-soft/60 mt-0.5">{coop.district}, {coop.state}</p>
        </div>
        <span className="rounded-full bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-0.5">
          {coop.utilization}% util.
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-soft/60 mt-3">
        <span className="inline-flex items-center gap-1"><Users size={12} /> {coop.memberCount} members</span>
        <span className="inline-flex items-center gap-1"><Star size={12} className="text-marigold-500 fill-marigold-500" /> {coop.trustRating}</span>
      </div>
      {onSelect && (
        <button onClick={() => onSelect(coop)} className="mt-3 w-full text-xs font-semibold text-teal-700 border border-teal-200 hover:bg-teal-50 rounded-full py-1.5 transition-colors">
          View network
        </button>
      )}
    </div>
  );
}
