import { useState } from "react";
import {
  LayoutGrid, CalendarPlus, ListChecks, UserRound, CalendarClock, Wallet,
  ShieldCheck, PiggyBank, Bell, MessageSquare, GraduationCap, Menu, X,
  Sparkles, LogOut, Siren, AlertOctagon, Star, BadgeCheck, Building2,
  Radar, Scale, Landmark, Network, Lightbulb,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLang } from "../../lib/i18n";

const NAV = {
  customer: [
    { key: "home", label: "Home", icon: LayoutGrid },
    { key: "book", label: "Book a Service", icon: CalendarPlus },
    { key: "jobs", label: "My Jobs", icon: ListChecks },
    { key: "wallet", label: "Wallet", icon: Wallet },
    { key: "institutional", label: "Institutional Booking", icon: Building2 },
    { key: "emergency", label: "Emergency Service", icon: Siren },
    { key: "trust", label: "Trust Score", icon: Star },
    { key: "assistant", label: "AI Assistant", icon: MessageSquare },
    { key: "disputes", label: "Complaints & Disputes", icon: AlertOctagon },
    { key: "notifications", label: "Notifications", icon: Bell },
  ],
  worker: [
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "profile", label: "Profile & Skill Passport", icon: UserRound },
    { key: "availability", label: "Availability", icon: CalendarClock },
    { key: "earnings", label: "Earnings", icon: Wallet },
    { key: "welfare", label: "Welfare Wallet", icon: PiggyBank },
    { key: "trust", label: "Trust Score", icon: Star },
    { key: "verification", label: "Verification Center", icon: BadgeCheck },
    { key: "ratings", label: "Fair Rating Intelligence", icon: Star },
    { key: "training", label: "Training & Upskilling", icon: GraduationCap },
    { key: "emergency", label: "Emergency Service", icon: Siren },
    { key: "assistant", label: "AI Assistant", icon: MessageSquare },
    { key: "disputes", label: "Complaints & Disputes", icon: AlertOctagon },
    { key: "notifications", label: "Notifications", icon: Bell },
  ],
  coop: [
    { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { key: "demand", label: "AI Demand Radar", icon: Radar },
    { key: "opportunity", label: "Opportunity Balance", icon: Scale },
    { key: "ledger", label: "Impact Ledger", icon: Landmark },
    { key: "notifications", label: "Notifications", icon: Bell },
  ],
  federation: [
    { key: "dashboard", label: "Federation Dashboard", icon: Network },
    { key: "insights", label: "Federation Insights", icon: Lightbulb },
    { key: "notifications", label: "Notifications", icon: Bell },
  ],
};

const ROLE_LABEL = { customer: "Customer", worker: "Worker", coop: "Cooperative Admin", federation: "Federation Admin" };

export default function AppShell({ role, setRole, active, setActive, children, identity }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLang();
  const items = NAV[role] || [];

  return (
    <div className="min-h-screen bg-sand-50 flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-sand-200 bg-white">
        <SidebarInner role={role} setRole={setRole} active={active} setActive={setActive} items={items} identity={identity} />
      </aside>

      {/* Sidebar - mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-pop flex flex-col">
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
            </div>
            <SidebarInner role={role} setRole={setRole} active={active} setActive={(k) => { setActive(k); setMobileOpen(false); }} items={items} identity={identity} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-sand-200 bg-white/80 backdrop-blur px-4 md:px-6 py-3 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
            <p className="font-display text-lg font-semibold text-teal-700 hidden sm:block">
              {items.find((i) => i.key === active)?.label || "SAHAAY"}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher />
            <RoleSwitcher role={role} setRole={setRole} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({ role, setRole, active, setActive, items, identity }) {
  return (
    <>
      <div className="px-5 py-5 border-b border-sand-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-sand-50 font-display font-bold">S</div>
          <p className="font-display text-lg font-semibold text-teal-700">SAHAAY</p>
        </div>
        <p className="text-[11px] text-ink-soft/50 mt-1">Dignified work, fairly matched.</p>
      </div>

      {identity && (
        <div className="mx-4 mt-4 rounded-xl bg-sand-100 p-3 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-teal-600 text-sand-50 flex items-center justify-center text-xs font-semibold shrink-0">
            {identity.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink truncate">{identity.name}</p>
            <p className="text-[10px] text-ink-soft/55 truncate">{identity.sub}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => setActive(it.key)}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active === it.key ? "bg-teal-600 text-sand-50" : "text-ink-soft/75 hover:bg-sand-100"
            }`}
          >
            <it.icon size={17} />
            {it.label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <p className="px-3 text-[10px] uppercase tracking-wide text-ink-soft/40 mb-1">Sample Data</p>
        <p className="px-3 text-[10px] text-ink-soft/40 leading-relaxed">
          All figures on this app are generated sample data for evaluation purposes.
        </p>
      </div>
    </>
  );
}

function RoleSwitcher({ role, setRole }) {
  return (
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="text-xs md:text-sm font-medium rounded-full border border-teal-200 bg-teal-50 text-teal-700 px-3 py-1.5 outline-none cursor-pointer"
    >
      <option value="customer">Customer view</option>
      <option value="worker">Worker view</option>
      <option value="coop">Cooperative Admin view</option>
      <option value="federation">Federation Admin view</option>
    </select>
  );
}
