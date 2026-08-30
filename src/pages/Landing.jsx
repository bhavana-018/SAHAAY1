import { useEffect, useState } from "react";
import { User, Sparkles, Users2, HardHat, ArrowRight, ShieldCheck, ScaleIcon, HandCoins, Radar } from "lucide-react";
import { WORKERS, COOPERATIVES, BOOKINGS, SERVICES } from "../data/seed";

const FLOW = [
  { label: "Customer", icon: User, desc: "Describes the problem, in text or voice." },
  { label: "SAHAAY AI", icon: Sparkles, desc: "Classifies the issue, applies FairMatch." },
  { label: "Cooperative", icon: Users2, desc: "Confirms the assignment, protects fair pricing." },
  { label: "Worker", icon: HardHat, desc: "Arrives verified, paid fairly, on record." },
];

const VALUE_PROPS = [
  { icon: ScaleIcon, title: "Fair by design", desc: "FairMatch spreads work evenly across a cooperative — not just to the loudest profile or the lowest bidder." },
  { icon: ShieldCheck, title: "Verified, not anonymous", desc: "Every worker carries an identity, skill and background check you can see before you book." },
  { icon: HandCoins, title: "Wages you can trace", desc: "Every rupee is split on record — worker, cooperative, welfare fund, platform — visible to everyone in the chain." },
  { icon: Radar, title: "Cooperatives that see ahead", desc: "AI Demand Radar tells a cooperative where it's short-staffed before the shortage becomes a missed booking." },
];

function useCountUp(target, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function Landing({ onEnter }) {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setActiveStep((s) => (s + 1) % FLOW.length), 1600);
    return () => clearInterval(iv);
  }, []);

  const workers = useCountUp(WORKERS.length);
  const coops = useCountUp(COOPERATIVES.length);
  const bookings = useCountUp(BOOKINGS.filter((b) => b.status === "completed").length);
  const services = useCountUp(SERVICES.length);

  return (
    <div className="min-h-screen bg-sand-50">
      {/* nav */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-sand-50 font-display font-bold">S</div>
          <p className="font-display text-lg font-semibold text-teal-700">SAHAAY</p>
        </div>
        <button
          onClick={onEnter}
          className="text-sm font-semibold text-teal-700 border border-teal-200 hover:bg-teal-50 rounded-full px-4 py-2 transition-colors"
        >
          Enter app <ArrowRight size={14} className="inline ml-1" />
        </button>
      </header>

      {/* hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-8 md:pt-14 pb-16">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="animate-rise">
            <span className="inline-block text-xs font-semibold tracking-wide uppercase text-marigold-600 bg-marigold-100 rounded-full px-3 py-1 mb-5">
              A cooperative-owned services platform
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.4rem] font-semibold text-ink leading-[1.08]">
              Local work, matched fairly —
              <br />
              not auctioned to the bottom.
            </h1>
            <p className="mt-5 text-base md:text-lg text-ink-soft/75 max-w-lg leading-relaxed">
              SAHAAY routes home-service bookings through worker cooperatives, using a transparent matching
              algorithm instead of a race-to-the-bottom bidding war — so the person who shows up at your door
              is verified, and paid what the job is worth.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-sand-50 bg-teal-600 hover:bg-teal-700 rounded-full px-6 py-3 transition-colors"
              >
                Explore SAHAAY <ArrowRight size={16} />
              </button>
              <p className="text-xs text-ink-soft/50">No sign-up needed — this is a fully interactive environment.</p>
            </div>
          </div>

          {/* live flow visual */}
          <div className="animate-rise rounded-xl2 border border-teal-100 bg-white p-6 md:p-8 shadow-card" style={{ animationDelay: "150ms" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/50 mb-6">How a booking moves</p>
            <div className="grid grid-cols-4 gap-2">
              {FLOW.map((f, i) => (
                <div key={f.label} className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      i === activeStep
                        ? "border-marigold-400 bg-marigold-100 text-marigold-600 scale-110"
                        : i < activeStep
                        ? "border-coop-500 bg-coop-500/10 text-coop-600"
                        : "border-sand-200 bg-sand-50 text-ink-soft/40"
                    }`}
                  >
                    <f.icon size={20} />
                  </div>
                  <p className={`text-[11px] font-semibold ${i === activeStep ? "text-ink" : "text-ink-soft/50"}`}>{f.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-sand-200 overflow-hidden">
              <div
                className="h-full bg-marigold-400 transition-all duration-500 rounded-full"
                style={{ width: `${((activeStep + 1) / FLOW.length) * 100}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-ink-soft/70 min-h-[40px] transition-opacity">{FLOW[activeStep].desc}</p>
          </div>
        </div>

        {/* stat counters */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Verified workers", value: workers },
            { label: "Cooperatives", value: coops },
            { label: "Jobs completed", value: bookings },
            { label: "Service categories", value: services },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-mono-data text-3xl md:text-4xl font-semibold text-teal-700">{s.value}+</p>
              <p className="text-xs text-ink-soft/55 mt-1">{s.label}</p>
              <p className="text-[10px] text-marigold-600 font-semibold mt-0.5 uppercase tracking-wide">Sample Data</p>
            </div>
          ))}
        </div>
      </section>

      {/* value props */}
      <section className="bg-white border-y border-sand-200">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink text-center mb-2">
            Built around the cooperative, not around the app
          </h2>
          <p className="text-center text-ink-soft/60 max-w-xl mx-auto mb-10 text-sm md:text-base">
            Every feature below exists to keep bargaining power with the worker's cooperative — the platform
            coordinates; it doesn't own the relationship.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUE_PROPS.map((v, i) => (
              <div key={v.title} className="animate-rise rounded-xl2 border border-teal-100 p-5 hover:shadow-pop transition-shadow" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-4">
                  <v.icon size={19} />
                </div>
                <p className="font-semibold text-ink text-sm mb-1.5">{v.title}</p>
                <p className="text-xs text-ink-soft/65 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-8">
        <p className="text-xs text-ink-soft/40">SAHAAY · all data on this site is synthetic</p>
      </footer>
    </div>
  );
}
