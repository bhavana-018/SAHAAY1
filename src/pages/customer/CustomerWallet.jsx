import { useState } from "react";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, Smartphone } from "lucide-react";
import { formatINR } from "../../lib/logic";
import { useWallet } from "../../lib/wallet";
import SectionHeader, { NoteTag } from "../../components/shared/SectionHeader";

const PRESETS = [500, 1000, 2000, 5000];

export default function CustomerWallet() {
  const { balance, transactions, addMoney } = useWallet();
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [notice, setNotice] = useState(null);

  const topUp = () => {
    const n = custom.trim() ? Number(custom) : amount;
    if (!Number.isFinite(n) || n < 50) {
      setNotice("Enter at least ₹50 to add money.");
      return;
    }
    addMoney(n, "Added via UPI");
    setCustom("");
    setNotice(`${formatINR(n)} added to your wallet.`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader
        eyebrow="Wallet"
        title="Pay faster with stored balance"
        blurb="Add money ahead of time, then pay for bookings from your wallet — or keep using UPI, card, or net banking at checkout."
      />

      <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 text-teal-600 mb-2">
          <Wallet size={18} />
          <p className="text-sm font-semibold text-ink">Available balance</p>
        </div>
        <p className="font-display font-mono-data text-3xl font-semibold text-teal-700">{formatINR(balance)}</p>
        <p className="text-xs text-ink-soft/55 mt-1">Ready to use on any SAHAAY booking.</p>
      </div>

      <div className="rounded-xl2 border border-teal-100 bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Plus size={16} className="text-teal-600" />
          <p className="text-sm font-semibold text-ink">Add money</p>
        </div>
        <p className="text-xs text-ink-soft/55">Choose an amount, then confirm. Top-ups are credited instantly.</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setAmount(p);
                setCustom("");
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium border ${
                !custom && amount === p ? "bg-teal-600 border-teal-600 text-sand-50" : "border-sand-200 text-ink-soft/70"
              }`}
            >
              {formatINR(p)}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            min={50}
            placeholder="Or enter a custom amount"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="flex-1 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2.5 text-sm outline-none focus:border-teal-400"
          />
          <button
            onClick={topUp}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-sand-50 text-sm font-semibold px-5 py-2.5"
          >
            <Smartphone size={14} /> Add via UPI
          </button>
        </div>
        {notice && <p className="text-xs text-coop-600 font-medium">{notice}</p>}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink mb-3">Recent activity</h2>
        <div className="rounded-xl2 border border-teal-100 bg-white divide-y divide-sand-100 shadow-card">
          {transactions.slice(0, 12).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`h-8 w-8 rounded-full grid place-items-center shrink-0 ${tx.type === "add" ? "bg-coop-500/10 text-coop-600" : "bg-marigold-100 text-marigold-600"}`}>
                  {tx.type === "add" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{tx.note}</p>
                  <p className="text-[11px] text-ink-soft/50">{new Date(tx.at).toLocaleString("en-IN")}</p>
                </div>
              </div>
              <p className={`font-mono-data text-sm font-semibold shrink-0 ${tx.type === "add" ? "text-coop-600" : "text-ink"}`}>
                {tx.type === "add" ? "+" : "−"}
                {formatINR(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <NoteTag>Wallet balance is illustrative and lives only in this session — it is not a real payment account.</NoteTag>
    </div>
  );
}
