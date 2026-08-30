import { createContext, useContext, useState, useCallback, useRef } from "react";

const WalletCtx = createContext(null);

function makeTx(type, amount, note) {
  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    amount,
    note,
    at: new Date().toISOString(),
  };
}

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(2500);
  const [transactions, setTransactions] = useState([
    makeTx("add", 2500, "Opening balance"),
  ]);
  const balanceRef = useRef(2500);

  const addMoney = useCallback((amount, note = "Wallet top-up") => {
    const n = Math.round(Number(amount));
    if (!Number.isFinite(n) || n <= 0) return false;
    balanceRef.current += n;
    setBalance(balanceRef.current);
    setTransactions((txs) => [makeTx("add", n, note), ...txs]);
    return true;
  }, []);

  const payFromWallet = useCallback((amount, note = "Service payment") => {
    const n = Math.round(Number(amount));
    if (!Number.isFinite(n) || n <= 0) return false;
    if (balanceRef.current < n) return false;
    balanceRef.current -= n;
    setBalance(balanceRef.current);
    setTransactions((txs) => [makeTx("pay", n, note), ...txs]);
    return true;
  }, []);

  return (
    <WalletCtx.Provider value={{ balance, transactions, addMoney, payFromWallet }}>
      {children}
    </WalletCtx.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
