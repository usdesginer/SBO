"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Receipt, 
  Wallet, 
  ArrowRight, 
  Clock, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  CreditCard,
  Search,
  History,
  Zap,
  Coffee,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileText
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  TransactionReceiptData,
  TransactionStatusModal,
} from "@/components/dashboard/transaction-status-modal";

type Account = {
  id: string;
  account_name: string;
  account_number: string;
  balance: number;
  available_balance: number;
  currency: string;
  account_type: string;
};

interface BillsClientProps {
  accounts: Account[];
  history: any[];
}

export function BillsClient({ accounts, history }: BillsClientProps) {
  const router = useRouter();
  const { currency, format } = useCurrency();
  const [activeTab, setActiveTab] = useState<"dashboard" | "settle" | "history">("dashboard");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [form, setForm] = useState({
    fromAccountId: accounts[0]?.id || "",
    beneficiary: "",
    reference: "",
    amount: "",
    category: "utilities"
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Settlement failed.");

      setReceipt({
        traceId: data.traceId,
        amount: parseFloat(form.amount || "0"),
        currency: selectedAccount?.currency || currency,
        recipientName: form.beneficiary,
        recipientIdentifier: form.reference,
        sourceAccountName: selectedAccount?.account_name,
        categoryLabel: "Institutional Bill Settlement",
        status: "completed",
        createdAt: new Date().toLocaleString("en-IE"),
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReceipt(null);
    setError(null);
    setForm({ ...form, beneficiary: "", reference: "", amount: "" });
    setActiveTab("dashboard");
  };

  const selectedAccount = accounts.find(a => a.id === form.fromAccountId);
  const settledTotal = history.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">Institutional Payments</h1>
          <p className="text-[#718096] text-xs font-semibold uppercase tracking-widest mt-1">Manage Settlements &amp; Recurring Deliveries</p>
        </div>
        <div className="flex bg-white border border-[#E8EDF4] p-1 rounded-[12px] w-full sm:w-auto">
          {(["dashboard", "settle", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-[10px] text-[11px] font-bold uppercase tracking-wider transition-all",
                activeTab === tab ? "bg-[#0B1220] text-white" : "text-[#718096] hover:text-[#101827]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              <div className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[#718096] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Awaiting Settlement</p>
                  <p className="text-2xl font-bold text-[#101827] font-mono tabular-nums tracking-tight">{format(0, "EUR")}</p>
                  <p className="text-[11px] text-[#059669] mt-1.5 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All current
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F8FAFC] rounded-full -mr-12 -mt-12" />
              </div>
              <div className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)]">
                <p className="text-[#718096] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Scheduled Payments</p>
                <p className="text-2xl font-bold text-[#101827] font-mono tabular-nums tracking-tight">0</p>
                <p className="text-[11px] text-[#94A3B8] mt-1.5 font-medium">Active Standing Orders</p>
              </div>
              <div className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)]">
                <p className="text-[#718096] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Settled ({currency})</p>
                <p className="text-2xl font-bold text-[#101827] font-mono tabular-nums tracking-tight">{format(settledTotal, "EUR")}</p>
                <p className="text-[11px] text-[#94A3B8] mt-1.5 font-medium">Global Disbursement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#E8EDF4] flex items-center justify-between">
                  <h2 className="text-xs font-bold text-[#101827] uppercase tracking-[0.18em]">Direct Settlement</h2>
                  <Zap className="w-4 h-4 text-[#E85D65]" />
                </div>
                <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[16px] flex items-center justify-center mb-6 text-[#0B1220]">
                    <Receipt className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#101827] mb-3 tracking-tight">Settle Invoice</h3>
                  <p className="text-sm text-[#718096] mb-7 max-w-xs leading-relaxed">
                    Instantly clear pending institutional obligations or utility invoices via our secure gateway.
                  </p>
                  <button 
                    onClick={() => setActiveTab("settle")}
                    className="w-full py-3.5 bg-[#0B1220] text-white rounded-[12px] text-[11px] font-bold uppercase tracking-[0.18em] shadow-sm hover:bg-[#17243A] transition-all active:scale-95"
                  >
                    Initiate Settlement
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden">
                <div className="p-6 border-b border-[#E8EDF4] flex items-center justify-between">
                  <h2 className="text-xs font-bold text-[#101827] uppercase tracking-[0.18em]">Recent Disbursements</h2>
                  <button onClick={() => setActiveTab("history")} className="text-[11px] font-bold text-[#718096] uppercase tracking-wider hover:text-[#101827] transition-colors">View All</button>
                </div>
                <div className="divide-y divide-[#E8EDF4]">
                  {history.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">No recent activity</p>
                    </div>
                  ) : (
                    history.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#718096] flex-shrink-0">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#101827] truncate tracking-tight">{tx.description?.split(' - ')[0] || "Payment"}</p>
                            <p className="text-[11px] text-[#718096]">{new Date(tx.created_at).toLocaleDateString("en-IE")}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold font-mono tabular-nums text-[#DC555D]">-{format(tx.amount, "EUR")}</p>
                          <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider">Settled</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-[12px] bg-[#0B1220] flex items-center justify-center text-white">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#101827] tracking-tight">Institutional Settlement</h2>
                  <p className="text-[10px] font-bold text-[#718096] uppercase tracking-[0.2em]">Secure Ledger Disbursement</p>
                </div>
              </div>

              <form onSubmit={handleSettle} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">Source Vault Entity</label>
                  <select
                    value={form.fromAccountId}
                    onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all appearance-none"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} ({isMounted ? formatCurrency(acc.available_balance, acc.currency) : acc.available_balance})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">Beneficiary Entity</label>
                    <input
                      type="text"
                      value={form.beneficiary}
                      onChange={(e) => setForm({ ...form, beneficiary: e.target.value })}
                      placeholder="e.g. Zurich Energy AG"
                      required
                      className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 placeholder:text-[#94A3B8] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">Reference Identifier</label>
                    <input
                      type="text"
                      value={form.reference}
                      onChange={(e) => setForm({ ...form, reference: e.target.value })}
                      placeholder="INV-XXXXXX"
                      required
                      className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-mono font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 placeholder:text-[#94A3B8] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">Settlement Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold text-base">{selectedAccount?.currency || currency}</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full pl-16 pr-5 py-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-2xl font-mono tabular-nums font-bold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 placeholder:text-[#CBD5E1] transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-[12px] flex items-start gap-3 text-[#DC2626] text-xs font-bold">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#0B1220] hover:bg-[#17243A] disabled:opacity-50 text-white rounded-[12px] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {loading ? "Authorizing Settlement..." : "Confirm Institutional Payment"}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden"
          >
            <div className="p-6 border-b border-[#E8EDF4]">
              <h2 className="text-xs font-bold text-[#101827] uppercase tracking-[0.18em]">Global Settlement Ledger</h2>
            </div>
            <div className="divide-y divide-[#E8EDF4]">
              {history.length === 0 ? (
                <div className="py-20 text-center">
                  <History className="w-12 h-12 text-[#CBD5E1] mx-auto mb-5" />
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">No disbursements found</p>
                </div>
              ) : (
                history.map((tx) => (
                  <div key={tx.id} className="px-6 py-5 flex items-center gap-4 hover:bg-[#F8FAFC] transition-colors group">
                    <div className="w-11 h-11 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#718096] flex-shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#101827] truncate mb-0.5 tracking-tight">{tx.description || "Institutional Settlement"}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[#718096]">{new Date(tx.created_at).toLocaleString("en-IE")}</span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#CBD5E1]" />
                        <span className="text-[11px] font-mono text-[#94A3B8]">REF: {tx.reference.slice(0, 12)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold font-mono tabular-nums text-[#DC555D] tracking-tight">-{format(tx.amount, "EUR")}</p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200/80 text-[10px] font-bold uppercase tracking-wider mt-1.5">
                        <CheckCircle2 className="w-3 h-3" /> Committed
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TransactionStatusModal transaction={receipt} onClose={resetForm} />
    </div>
  );
}
