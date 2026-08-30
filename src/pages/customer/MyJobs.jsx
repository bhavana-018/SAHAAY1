import { useState } from "react";
import { CURRENT_CUSTOMER, bookingsForCustomer, serviceById, workerById } from "../../data/seed";
import { BookingCard } from "../../components/shared/EntityCard";

const FILTERS = ["all", "scheduled", "in_progress", "completed", "cancelled"];

export default function MyJobs() {
  const [filter, setFilter] = useState("all");
  const all = bookingsForCustomer(CURRENT_CUSTOMER.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const shown = filter === "all" ? all : all.filter((b) => b.status === filter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My Jobs</h1>
        <p className="text-sm text-ink-soft/60 mt-1">{all.length} bookings on record</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize border transition-colors ${
              filter === f ? "bg-teal-600 border-teal-600 text-sand-50" : "border-sand-200 text-ink-soft/65 hover:border-teal-200"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="text-sm text-ink-soft/50 py-10 text-center">No bookings in this status yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((b) => (
            <BookingCard key={b.id} booking={b} service={serviceById(b.serviceId)} worker={workerById(b.workerId)} />
          ))}
        </div>
      )}
    </div>
  );
}
