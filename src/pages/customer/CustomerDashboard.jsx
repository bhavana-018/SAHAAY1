import * as Icons from "lucide-react";
import { ArrowRight, CalendarPlus, Wallet, Siren, Building2 } from "lucide-react";
import { CURRENT_CUSTOMER, bookingsForCustomer, serviceById, workerById } from "../../data/seed";
import { formatINR } from "../../lib/logic";
import { useWallet } from "../../lib/wallet";
import KpiGrid from "../../components/shared/KpiGrid";
import { BookingCard } from "../../components/shared/EntityCard";

export default function CustomerDashboard({ onNavigate }) {
  const { balance } = useWallet();
  const myBookings = bookingsForCustomer(CURRENT_CUSTOMER.id);
  const upcoming = myBookings.filter((b) => b.status === "in_progress" || b.status === "scheduled");
  const recent = [...myBookings].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);

  const shortcuts = [
    { key: "book", label: "Book a service", hint: "Pick a category and start a job", icon: CalendarPlus },
    { key: "wallet", label: "Wallet", hint: `${formatINR(balance)} available`, icon: Wallet },
    { key: "institutional", label: "Institutional booking", hint: "Schools, hospitals, offices", icon: Building2 },
    { key: "emergency", label: "Emergency", hint: "Urgent help, same-day dispatch", icon: Siren },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Namaste, {CURRENT_CUSTOMER.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-ink-soft/60 mt-1">Your home at a glance — jobs, wallet, and shortcuts.</p>
        </div>
        <button
          onClick={() => onNavigate("book")}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-sand-50 text-sm font-semibold px-4 py-2.5 self-start"
        >
          Book a service <ArrowRight size={14} />
        </button>
      </div>

      <KpiGrid
        cols={3}
        items={[
          { label: "Bookings this year", value: CURRENT_CUSTOMER.bookingsCount, icon: Icons.CalendarCheck },
          { label: "Active jobs", value: upcoming.length, icon: Icons.Hourglass },
          { label: "Wallet balance", value: formatINR(balance), icon: Icons.Wallet },
        ]}
      />

      <div>
        <h2 className="font-display text-lg font-semibold text-ink mb-3">Quick actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shortcuts.map((s) => (
            <button
              key={s.key}
              onClick={() => onNavigate(s.key)}
              className="text-left rounded-xl2 border border-teal-100 bg-white p-4 shadow-card hover:shadow-pop hover:border-teal-300 transition-all"
            >
              <s.icon size={18} className="text-teal-600" />
              <p className="text-sm font-semibold text-ink mt-2">{s.label}</p>
              <p className="text-xs text-ink-soft/55 mt-0.5">{s.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold text-ink">Upcoming & in progress</h2>
            <button onClick={() => onNavigate("jobs")} className="text-xs font-semibold text-teal-700 hover:underline">
              View all jobs
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.slice(0, 3).map((b) => (
              <BookingCard key={b.id} booking={b} service={serviceById(b.serviceId)} worker={workerById(b.workerId)} />
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Recent activity</h2>
          <div className="rounded-xl2 border border-teal-100 bg-white divide-y divide-sand-100 shadow-card">
            {recent.map((b) => {
              const service = serviceById(b.serviceId);
              const worker = workerById(b.workerId);
              return (
                <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{service?.name}</p>
                    <p className="text-xs text-ink-soft/55 truncate">
                      {worker?.name} · {b.date} · {b.status.replace("_", " ")}
                    </p>
                  </div>
                  <p className="font-mono-data text-sm font-semibold text-teal-700 shrink-0">{formatINR(b.amount || service?.basePrice || 0)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
