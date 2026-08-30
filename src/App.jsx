import { useState, useEffect } from "react";
import { LanguageProvider } from "./lib/i18n";
import { WalletProvider } from "./lib/wallet";
import { warmLocalAI } from "./lib/ai";
import Landing from "./pages/Landing";
import AppShell from "./components/shared/AppShell";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookService from "./pages/customer/BookService";
import BookingWizard from "./pages/customer/BookingWizard";
import MyJobs from "./pages/customer/MyJobs";
import InstitutionalBooking from "./pages/customer/InstitutionalBooking";
import CustomerWallet from "./pages/customer/CustomerWallet";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import WorkerProfile from "./pages/worker/WorkerProfile";
import Availability from "./pages/worker/Availability";
import Earnings from "./pages/worker/Earnings";
import WelfareWallet from "./pages/worker/WelfareWallet";
import Verification from "./pages/worker/Verification";
import FairRating from "./pages/worker/FairRating";
import Training from "./pages/worker/Training";
import CoopDashboard from "./pages/coop/CoopDashboard";
import DemandRadar from "./pages/coop/DemandRadar";
import OpportunityBalance from "./pages/coop/OpportunityBalance";
import ImpactLedger from "./pages/coop/ImpactLedger";
import FederationDashboard from "./pages/federation/FederationDashboard";
import FederationInsights from "./pages/federation/FederationInsights";
import TrustScore from "./pages/shared/TrustScore";
import Emergency from "./pages/shared/Emergency";
import Disputes from "./pages/shared/Disputes";
import Assistant from "./pages/shared/Assistant";
import Notifications from "./pages/shared/Notifications";
import { CURRENT_WORKER, CURRENT_CUSTOMER, CURRENT_COOP, coopById } from "./data/seed";
import { CheckCircle2, X } from "lucide-react";

const DEFAULT_ACTIVE = { customer: "home", worker: "dashboard", coop: "dashboard", federation: "dashboard" };

function AppInner() {
  const [entered, setEntered] = useState(false);
  const [role, setRole] = useState("customer");
  const [active, setActive] = useState("home");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    warmLocalAI();
  }, []);

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />;
  }

  const identity = {
    customer: { name: CURRENT_CUSTOMER.name, sub: `${CURRENT_CUSTOMER.district} · Customer` },
    worker: { name: CURRENT_WORKER.name, sub: coopById(CURRENT_WORKER.coopId)?.name },
    coop: { name: CURRENT_COOP.name, sub: `${CURRENT_COOP.district}, ${CURRENT_COOP.state} · Cooperative Admin` },
    federation: { name: "SAHAAY Federation Office", sub: "National network administration" },
  }[role];

  const startBooking = (serviceId) => {
    setBookingServiceId(serviceId || null);
    setBookingOpen(true);
  };

  const renderCustomer = () => {
    if (bookingOpen) {
      return (
        <BookingWizard
          initialServiceId={bookingServiceId}
          onExit={() => setBookingOpen(false)}
          onComplete={(details) => {
            setBookingOpen(false);
            setActive("jobs");
            setConfirmation(details);
          }}
        />
      );
    }
    if (active === "book") return <BookService onBook={startBooking} />;
    if (active === "jobs") return <MyJobs />;
    if (active === "wallet") return <CustomerWallet />;
    if (active === "institutional") return <InstitutionalBooking />;
    if (active === "emergency") return <Emergency role="customer" />;
    if (active === "trust") return <TrustScore role="customer" />;
    if (active === "assistant") return <Assistant role="customer" />;
    if (active === "disputes") return <Disputes role="customer" />;
    if (active === "notifications") return <Notifications role="customer" />;
    return <CustomerDashboard onNavigate={setActive} />;
  };

  const renderWorker = () => {
    if (active === "profile") return <WorkerProfile />;
    if (active === "availability") return <Availability />;
    if (active === "earnings") return <Earnings />;
    if (active === "welfare") return <WelfareWallet />;
    if (active === "trust") return <TrustScore role="worker" />;
    if (active === "verification") return <Verification />;
    if (active === "ratings") return <FairRating />;
    if (active === "training") return <Training />;
    if (active === "emergency") return <Emergency role="worker" />;
    if (active === "assistant") return <Assistant role="worker" />;
    if (active === "disputes") return <Disputes role="worker" />;
    if (active === "notifications") return <Notifications role="worker" />;
    return <WorkerDashboard />;
  };

  const renderCoop = () => {
    if (active === "demand") return <DemandRadar />;
    if (active === "opportunity") return <OpportunityBalance />;
    if (active === "ledger") return <ImpactLedger />;
    if (active === "notifications") return <Notifications role="coop" />;
    return <CoopDashboard />;
  };

  const renderFederation = () => {
    if (active === "insights") return <FederationInsights />;
    if (active === "notifications") return <Notifications role="federation" />;
    return <FederationDashboard />;
  };

  const renderers = { customer: renderCustomer, worker: renderWorker, coop: renderCoop, federation: renderFederation };

  return (
    <AppShell
      role={role}
      setRole={(r) => {
        setRole(r);
        setActive(DEFAULT_ACTIVE[r]);
        setBookingOpen(false);
      }}
      active={bookingOpen ? "book" : active}
      setActive={(k) => {
        setActive(k);
        setBookingOpen(false);
      }}
      identity={identity}
    >
      {renderers[role]()}
      {confirmation && <ConfirmationToast details={confirmation} onClose={() => setConfirmation(null)} />}
    </AppShell>
  );
}

function ConfirmationToast({ details, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 max-w-sm rounded-xl2 border border-coop-500/30 bg-white shadow-pop p-4 animate-rise">
      <div className="flex items-start gap-2.5">
        <CheckCircle2 size={18} className="text-coop-500 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Booking confirmed</p>
          <p className="text-xs text-ink-soft/60 mt-0.5">{details.worker.name} is on the way — check My Jobs for updates.</p>
        </div>
        <button onClick={onClose}><X size={15} className="text-ink-soft/40" /></button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <WalletProvider>
        <AppInner />
      </WalletProvider>
    </LanguageProvider>
  );
}
