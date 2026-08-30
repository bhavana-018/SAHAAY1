import { useState } from "react";
import { Smartphone, CreditCard, Landmark, Wallet, X, CheckCircle2, Loader2 } from "lucide-react";
import { formatINR } from "../../lib/logic";
import { useWallet } from "../../lib/wallet";

const METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

export default function PaymentFlow({ amount, onClose, onSuccess, note = "Service payment" }) {
  const { balance, payFromWallet } = useWallet();
  const [method, setMethod] = useState(null);
  const [stage, setStage] = useState("select"); // select | processing | success
  const [error, setError] = useState(null);

  const walletShort = method === "wallet" && balance < amount;

  const pay = () => {
    if (!method || walletShort) return;
    setError(null);
    setStage("processing");
    setTimeout(() => {
      if (method === "wallet") {
        const ok = payFromWallet(amount, note);
        if (!ok) {
          setError("Wallet balance is not enough for this payment. Add money first, or pick UPI, card, or net banking.");
          setStage("select");
          return;
        }
      }
      setStage("success");
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-xl2 p-5 shadow-pop">
        {stage !== "success" && (
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg font-semibold text-ink">Payment</p>
            <button onClick={onClose}><X size={18} className="text-ink-soft/50" /></button>
          </div>
        )}

        {stage === "select" && (
          <>
            <p className="font-mono-data text-2xl font-semibold text-teal-700 mb-1">{formatINR(amount)}</p>
            <p className="text-xs text-ink-soft/55 mb-4">Wallet balance: {formatINR(balance)}</p>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMethod(m.id);
                    setError(null);
                  }}
                  className={`rounded-xl border p-3 flex flex-col items-center gap-1.5 text-xs font-medium ${
                    method === m.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-sand-200 text-ink-soft/70"
                  }`}
                >
                  <m.icon size={18} /> {m.label}
                </button>
              ))}
            </div>
            {method === "wallet" && (
              <p className={`text-xs mb-3 ${walletShort ? "text-alert-500" : "text-ink-soft/60"}`}>
                {walletShort
                  ? `Need ${formatINR(amount - balance)} more in your wallet, or pay with UPI / card / net banking.`
                  : `${formatINR(amount)} will be deducted from your wallet.`}
              </p>
            )}
            {error && <p className="text-xs text-alert-500 mb-3">{error}</p>}
            <button
              disabled={!method || walletShort}
              onClick={pay}
              className="w-full rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-sand-50 font-semibold text-sm py-3 transition-colors"
            >
              {method === "wallet" ? `Pay from wallet ${formatINR(amount)}` : `Pay ${formatINR(amount)}`}
            </button>
          </>
        )}

        {stage === "processing" && (
          <div className="py-10 text-center">
            <Loader2 size={30} className="animate-spin text-teal-600 mx-auto mb-3" />
            <p className="text-sm text-ink-soft/60">
              {method === "wallet" ? "Deducting from your wallet…" : "Processing your payment…"}
            </p>
          </div>
        )}

        {stage === "success" && (
          <div className="py-6 text-center">
            <CheckCircle2 size={40} className="text-coop-500 mx-auto mb-3" />
            <p className="font-display text-lg font-semibold text-ink">Payment successful</p>
            <p className="text-sm text-ink-soft/60 mt-1">
              {method === "wallet"
                ? `${formatINR(amount)} paid from wallet. New balance: ${formatINR(balance)}.`
                : `${formatINR(amount)} paid — earnings, welfare fund, and impact ledger have been updated.`}
            </p>
            <button onClick={onSuccess} className="mt-5 rounded-full bg-teal-600 text-sand-50 text-sm font-semibold px-6 py-2.5">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
