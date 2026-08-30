import { Briefcase, Wallet, Star, Clock } from "lucide-react";
import { CURRENT_WORKER, bookingsForWorker, serviceById, customerById } from "../../data/seed";
import { formatINR } from "../../lib/logic";
import KpiGrid from "../../components/shared/KpiGrid";
import Timeline from "../../components/shared/Timeline";
import { BookingCard } from "../../components/shared/EntityCard";

export default function WorkerDashboard() {
  const w = CURRENT_WORKER;
  const bookings = bookingsForWorker(w.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const today = bookings.filter((b) => b.status === "scheduled" || b.status === "in_progress").slice(0, 4);
  const completedToday = bookings.filter((b) => b.status === "completed").slice(0, 3);
  const todaysEarnings = completedToday.reduce((s, b) => s + b.breakdown.worker, 0);

  const activeJob = today[0];
  const timelineSteps = [
    {
      label: "Job accepted",
      desc: activeJob ? `${serviceById(activeJob.serviceId)?.name} for ${customerById(activeJob.customerId)?.name}` : "No job accepted yet",
      status: activeJob ? "done" : "pending",
      date: activeJob?.date,
    },
    { label: "En route", desc: "Worker travelling to job site", status: activeJob?.status === "scheduled" ? "current" : activeJob ? "done" : "pending" },
    { label: "Job in progress", desc: "Work underway, timer running", status: activeJob?.status === "in_progress" ? "current" : "pending" },
    { label: "Payment & rating", desc: "Customer confirms and pays", status: "pending" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Namaste, {w.name.split(" ")[0]}</h1>
        <p className="text-sm text-ink-soft/60 mt-1">{w.district} · {w.coopId.startsWith("coop") ? "Cooperative member" : ""}</p>
      </div>

      <KpiGrid
        items={[
          { label: "Jobs this week", value: `${w.workloadThisWeek}/${w.maxWeeklyCapacity}`, icon: Briefcase },
          { label: "Earnings today", value: formatINR(todaysEarnings), icon: Wallet, sub: "from completed jobs" },
          { label: "Rating", value: `${w.rating}★`, icon: Star, sub: `${w.ratingCount} reviews` },
          { label: "Avg. response", value: `${w.avgResponseMins}m`, icon: Clock },
        ]}
      />

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
          <p className="font-display text-lg font-semibold text-ink mb-4">Today's job status</p>
          <Timeline steps={timelineSteps} />
        </div>

        <div>
          <p className="font-display text-lg font-semibold text-ink mb-3">Upcoming jobs</p>
          {today.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-sand-200 p-8 text-center text-sm text-ink-soft/50">
              No jobs scheduled right now — FairMatch will route new requests here as they come in.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {today.map((b) => (
                <BookingCard key={b.id} booking={b} service={serviceById(b.serviceId)} customer={customerById(b.customerId)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
