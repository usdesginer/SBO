"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeftRight, 
  Send, 
  Globe, 
  Repeat, 
  Loader2, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { convertCurrency, normalizeCurrency } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import {
  TransactionReceiptData,
  TransactionStatusModal,
} from "@/components/dashboard/transaction-status-modal";

const MAX_TRANSFER_EUR = 100_000;

const TRANSFER_TYPES = [
  { id: "internal", label: "Between My Accounts", icon: Repeat, desc: "Free & Instant · Max €100,000" },
  { id: "domestic", label: "Domestic Wire", icon: Send, desc: "Pending Review · Max €100,000" },
  { id: "international", label: "International Wire", icon: Globe, desc: "Pending Review · Max €100,000" },
];

type Account = {
  id: string;
  account_name: string;
  account_number: string;
  balance: number;
  available_balance: number;
  currency: string;
  account_type: string;
};

interface TransfersClientProps {
  accounts: Account[];
  userId: string;
}

export function TransfersClient({ accounts, userId }: TransfersClientProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [transferType, setTransferType] = useState("internal");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    from: "",
    to: "",
    amount: "",
    note: "",
    recipientName: "",
    iban: "",
    swift: "",
    currency: "EUR",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const fromAccount = accounts.find((a) => a.id === form.from);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(form.amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive transfer amount.");
      return;
    }

    const activeCurrency = transferType === "internal" ? normalizeCurrency(fromAccount?.currency) : normalizeCurrency(form.currency);
    const eurEquivalent = convertCurrency(parsedAmount, activeCurrency, "EUR");
    if (eurEquivalent > MAX_TRANSFER_EUR) {
      setError(`Maximum transfer limit is ${formatCurrency(MAX_TRANSFER_EUR, "EUR")} per transaction.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transfers/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transferType,
          fromAccountId: form.from,
          toAccountId: form.to,
          amount: form.amount,
          recipientName: form.recipientName,
          iban: form.iban,
          note: form.note,
          swift: form.swift,
          currency: form.currency
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed.");

      const destinationAccount = accounts.find((a) => a.id === form.to);
      setReceipt({
        traceId: data.traceId,
        amount: parsedAmount,
        currency: activeCurrency,
        recipientName:
          transferType === "internal"
            ? destinationAccount?.account_name || "Own Vault Account"
            : form.recipientName,
        recipientIdentifier: transferType === "internal" ? destinationAccount?.account_number : form.iban,
        sourceAccountName: fromAccount?.account_name,
        categoryLabel:
          transferType === "internal"
            ? "Internal Transfer"
            : transferType === "domestic"
            ? "Domestic Wire"
            : "International Wire",
        status: data.status === "pending" ? "pending" : "completed",
        createdAt: new Date().toLocaleString("en-IE"),
        note: form.note || undefined,
      });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReceipt(null);
    setError(null);
    setForm({ from: "", to: "", amount: "", note: "", recipientName: "", iban: "", swift: "", currency: "EUR" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#101827] tracking-tight">Funds Transfer</h1>
          <p className="text-[11px] font-semibold text-[#718096] uppercase tracking-widest mt-1">Move capital across the global ledger</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TRANSFER_TYPES.map((type) => {
          const Icon = type.icon;
          const active = transferType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setTransferType(type.id)}
              className={cn(
                "p-6 rounded-[20px] border text-left transition-all duration-300 group relative overflow-hidden",
                active
                  ? "border-[#0B1220] bg-white shadow-[var(--shadow-card)] ring-1 ring-[#0B1220]"
                  : "border-[#E8EDF4] bg-white hover:border-[#0B1220]/40"
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 rounded-[12px] flex items-center justify-center mb-4 transition-all duration-300",
                  active
                    ? "bg-[#0B1220] text-white"
                    : "bg-[#F8FAFC] border border-[#E8EDF4] text-[#718096] group-hover:text-[#101827]"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className={cn("font-bold text-xs uppercase tracking-wider", active ? "text-[#101827]" : "text-[#718096]")}>
                {type.label}
              </p>
              <p className="text-[11px] text-[#94A3B8] font-medium mt-1">
                {type.desc}
              </p>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-[12px] text-[#DC2626] text-xs font-bold"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6 sm:p-7 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">
              Source Account
            </label>
            <select
              value={form.from}
              onChange={(e) => update("from", e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all appearance-none"
            >
              <option value="">Select funding entity</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name} ({isMounted ? formatCurrency(acc.available_balance, acc.currency) : acc.available_balance})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">
              {transferType === "internal" ? "Destination Account" : "Target Currency"}
            </label>
            {transferType === "internal" ? (
              <select
                value={form.to}
                onChange={(e) => update("to", e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all appearance-none"
              >
                <option value="">Select recipient entity</option>
                {accounts
                  .filter((acc) => acc.id !== form.from)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name}
                    </option>
                  ))}
              </select>
            ) : (
              <select
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all appearance-none"
              >
                <option value="EUR">🇪🇺 EUR — Euro</option>
                <option value="CHF">🇨🇭 CHF — Swiss Franc</option>
                <option value="USD">🇺🇸 USD — US Dollar</option>
                <option value="GBP">🇬🇧 GBP — British Pound</option>
              </select>
            )}
          </div>
        </div>

        {(transferType === "domestic" || transferType === "international") && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-6 overflow-hidden"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">
                Beneficiary Name
              </label>
              <input
                type="text"
                value={form.recipientName}
                onChange={(e) => update("recipientName", e.target.value)}
                placeholder="Institutional or Personal Name"
                required
                className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 placeholder:text-[#94A3B8] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">
                IBAN / Account Identifier
              </label>
              <input
                type="text"
                value={form.iban}
                onChange={(e) => update("iban", e.target.value)}
                placeholder="CH93 0000 0000 0000 0000 0"
                required
                className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-mono font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 placeholder:text-[#94A3B8] transition-all"
              />
            </div>
            {transferType === "international" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">
                  SWIFT / BIC Code
                </label>
                <input
                  type="text"
                  value={form.swift}
                  onChange={(e) => update("swift", e.target.value)}
                  placeholder="PENTCHZH..."
                  required
                  className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-mono font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 placeholder:text-[#94A3B8] transition-all"
                />
              </div>
            )}
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">
            Transaction Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold text-base">
              {transferType === "internal" ? (fromAccount?.currency ?? "EUR") : form.currency}
            </span>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="0.00"
              required
              min="0.01"
              step="0.01"
              className="w-full pl-16 pr-5 py-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-2xl font-mono tabular-nums font-bold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 placeholder:text-[#CBD5E1] transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 ml-0.5">
            {fromAccount ? (
              <p className="text-[10px] font-bold text-[#059669] uppercase tracking-wider">
                Available to move: {isMounted ? formatCurrency(fromAccount.available_balance, fromAccount.currency) : fromAccount.available_balance}
              </p>
            ) : <span />}
            <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">
              Max transfer limit: €100,000.00
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">
            Narration / Reference (Optional)
          </label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            placeholder="Institutional Reference"
            className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 placeholder:text-[#94A3B8] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || accounts.length === 0}
          className="w-full py-4 bg-[#0B1220] hover:bg-[#17243A] disabled:opacity-50 text-white rounded-[12px] font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Authorizing...
            </>
          ) : (
            <>
              Initialize Transfer <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <TransactionStatusModal transaction={receipt} onClose={resetForm} />
    </div>
  );
}
