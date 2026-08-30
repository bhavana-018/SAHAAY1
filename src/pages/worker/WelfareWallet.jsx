import { PiggyBank, LifeBuoy, GraduationCap, ShieldPlus, Info } from "lucide-react";
import { CURRENT_WORKER } from "../../data/seed";
import { formatINR } from "../../lib/logic";

export default function WelfareWallet() {
  const w = CURRENT_WORKER;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Welfare Wallet</h1>
        <p className="text-sm text-ink-soft/60 mt-1">
          8% of every job you complete goes into this wallet automatically — your cooperative's safety net, not a
          deduction.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-teal-600 mb-2"><PiggyBank size={18} /><p className="text-sm font-semibold text-ink">Your contribution</p></div>
          <p className="font-display font-mono-data text-3xl font-semibold text-teal-700">{formatINR(w.welfareContribution)}</p>
          <p className="text-xs text-ink-soft/55 mt-1">Contributed to date, tracked automatically per job</p>
        </div>

        <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-marigold-600 mb-2"><LifeBuoy size={18} /><p className="text-sm font-semibold text-ink">Emergency fund</p></div>
          <p className="font-display font-mono-data text-3xl font-semibold text-teal-700">
            {w.emergencyFundEligible ? "Eligible" : "Not yet eligible"}
          </p>
          <p className="text-xs text-ink-soft/55 mt-1">
            {w.emergencyFundEligible
              ? "You can apply for emergency support through your cooperative office."
              : "Eligibility opens after 6 months of active membership."}
          </p>
        </div>

        <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-coop-600 mb-2"><GraduationCap size={18} /><p className="text-sm font-semibold text-ink">Training credits</p></div>
          <p className="font-display font-mono-data text-3xl font-semibold text-teal-700">{w.trainingCredits}</p>
          <p className="text-xs text-ink-soft/55 mt-1">Redeemable against upskilling courses in Training</p>
        </div>

        <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-teal-600 mb-2"><ShieldPlus size={18} /><p className="text-sm font-semibold text-ink">Insurance status</p></div>
          <p className={`font-display text-2xl font-semibold ${w.insuranceStatus === "Active" ? "text-coop-600" : "text-marigold-600"}`}>
            {w.insuranceStatus}
          </p>
          <p className="text-xs text-ink-soft/55 mt-1">
            {w.insuranceStatus === "Active" ? "Accident & health cover through the cooperative's group policy." : "Enrolment in progress with the cooperative's insurance partner."}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-sand-200 bg-sand-100 p-4 flex items-start gap-2.5">
        <Info size={15} className="text-ink-soft/50 shrink-0 mt-0.5" />
        <p className="text-xs text-ink-soft/60 leading-relaxed">
          This module is integration-ready: contribution amounts are computed live from your completed jobs, while
          fund disbursement, insurance underwriting, and claims are handled by the cooperative's financial and
          insurance partners outside this environment.
        </p>
      </div>
    </div>
  );
}
