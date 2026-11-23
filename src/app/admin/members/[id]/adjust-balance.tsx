"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Loader2, 
  Check, 
  AlertCircle,
  History,
  Paperclip,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  User,
  CheckSquare,
  Square,
  PenTool
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Account {
  id: string;
  account_name: string;
  currency: string;
  balance: number;
}

interface AdjustBalanceProps {
  memberId: string;
  memberName: string;
  accounts: Account[];
}

const CREDIT_REASONS = [
  "Manual Deposit",
  "Cash Deposit",
  "Wire Adjustment",
  "Refund",
  "Interest",
  "Bonus",
  "Loan Disbursement",
  "Administrative"
];

const DEBIT_REASONS = [
  "Service Fee",
  "Administrative Charge",
  "Fraud Recovery",
  "Returned Deposit",
  "Chargeback",
  "Loan Repayment",
  "Manual Withdrawal",
  "Other"
];

export function AdjustBalance({ memberId, memberName, accounts }: AdjustBalanceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as "credit" | "debit" | null;

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    accountId: accounts[0]?.id || "",
    amount: "",
    type: typeParam || "credit",
    reason: (typeParam === "debit" ? DEBIT_REASONS[0] : CREDIT_REASONS[0]),
    description: "",
    valueDate: "",
    initiator: "",
    notifyEmail: true,
    notifyPush: true,
  });

  useEffect(() => {
    setIsMounted(true);
    setForm(f => ({ ...f, valueDate: new Date().toISOString().split('T')[0] }));
  }, []);

  useEffect(() => {
    if (typeParam && typeParam !== form.type) {
      setForm(f => ({ 
        ...f, 
        type: typeParam,
        reason: typeParam === "debit" ? DEBIT_REASONS[0] : CREDIT_REASONS[0]
      }));
    }
  }, [typeParam, form.type]);

  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === form.accountId), 
  [accounts, form.accountId]);

  const preview = useMemo(() => {
    if (!selectedAccount) return null;
    const amount = parseFloat(form.amount) || 0;
    const balanceBefore = selectedAccount.balance;
    const balanceAfter = form.type === "credit" 
      ? balanceBefore + amount 
      : balanceBefore - amount;
    
    return {
      before: balanceBefore,
      after: balanceAfter,
      currency: selectedAccount.currency
    };
  }, [selectedAccount, form.amount, form.type]);

  const formatValue = (val: number, currency = "EUR") => {
    if (!isMounted) return `${currency} ${val}`;
    return formatCurrency(val, currency);
  };

  const handleStartConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid transaction amount.");
      return;
    }

    if (!form.description || form.description.length < 5) {
      setError("A detailed narration is required for institutional audit logs.");
      return;
    }

    setConfirming(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/adjust-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: memberId,
          ...form,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request submission failed.");

      setSuccess(true);
      setConfirming(false);
      setForm((prev) => ({ ...prev, amount: "", description: "", initiator: "" }));
      setTimeout(() => {
        setSuccess(false);
        router.push(`?tab=operations`);
        router.refresh();
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Adjustment failed");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  const isCredit = form.type === "credit";
  const activeReasons = isCredit ? CREDIT_REASONS : DEBIT_REASONS;

  if (accounts.length === 0) return null;

  if (confirming) {
    return (
      <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)] animate-in fade-in zoom-in duration-300">
        <div className="bg-[#0B1220] px-6 py-5 border-b border-white/10 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#E85D65]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Review {isCredit ? 'Credit' : 'Debit'} Adjustment</h2>
          </div>
          <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
            MAKER REVIEW
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1">Beneficiary</p>
                <p className="text-sm font-bold text-[#101827]">{memberName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1">Target Account</p>
                <p className="text-sm font-medium text-[#101827]">{selectedAccount?.account_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1">Initiated By</p>
                <p className="text-sm font-bold text-[#E85D65]">{form.initiator || 'System Default'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1">Transaction Amount</p>
                <p className={cn(
                  "text-xl font-mono tabular-nums font-bold",
                  isCredit ? "text-[#059669]" : "text-[#DC2626]"
                )}>
                  {selectedAccount?.currency || "EUR"} {isMounted ? parseFloat(form.amount).toLocaleString("en-IE") : form.amount}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1">Reason Code</p>
                <p className="text-sm font-medium text-[#101827]">{form.reason}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1">Value Date</p>
                <p className="text-sm font-mono font-medium text-[#101827]">{form.valueDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] p-4">
            <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">Narration</p>
            <p className="text-xs text-[#101827] leading-relaxed italic">&quot;{form.description}&quot;</p>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-[#E8EDF4]">
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold text-[#718096] uppercase mb-1">Balance Before</p>
                <p className="text-sm font-mono tabular-nums text-[#718096]">{formatValue(preview?.before ?? 0, preview?.currency)}</p>
              </div>
              <div className={cn("p-4 text-center", isCredit ? "bg-emerald-50" : "bg-red-50")}>
                <p className="text-[10px] font-bold text-[#718096] uppercase mb-1">Balance After</p>
                <p className={cn("text-sm font-mono tabular-nums font-bold", isCredit ? "text-[#059669]" : "text-[#DC2626]")}>
                  {formatValue(preview?.after ?? 0, preview?.currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[12px]">
            <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#D97706] leading-relaxed font-medium">
              NOTICE: This request is subject to <span className="font-bold text-[#101827]">MAKER-CHECKER</span> dual-control. A supervisor or checker must authorize this event before funds are posted to the core ledger.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-3.5 bg-white border border-[#E8EDF4] hover:bg-[#F8FAFC] text-[#101827] text-xs font-bold uppercase rounded-[12px] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={cn(
                "flex-[2] py-3.5 text-white text-xs font-bold uppercase rounded-[12px] transition-all shadow-sm flex items-center justify-center gap-2",
                isCredit ? "bg-[#059669] hover:bg-emerald-700" : "bg-[#DC2626] hover:bg-red-700"
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)] transition-all duration-300">
      <div className={cn(
        "px-6 py-4 border-b border-[#E8EDF4] flex items-center justify-between transition-colors duration-300",
        isCredit ? "bg-emerald-50/60" : "bg-red-50/60"
      )}>
        <div>
          <h2 className="text-sm font-bold text-[#101827] flex items-center gap-2">
            <History className={cn("w-4 h-4", isCredit ? "text-[#059669]" : "text-[#DC2626]")} /> 
            Manual {isCredit ? "Credit" : "Debit"} Adjustment
          </h2>
          <p className="text-[10px] text-[#718096] mt-0.5 uppercase tracking-widest font-semibold">
            Institutional Control · Maker-Checker Protocol
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <span className="text-[10px] font-bold text-[#101827] bg-white px-2.5 py-0.5 rounded-full border border-[#E8EDF4]">
            AUDITED
          </span>
        </div>
      </div>

      <form onSubmit={handleStartConfirmation} className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
                Beneficiary
              </label>
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px]">
                <div className="w-8 h-8 rounded-[8px] bg-[#0B1220] flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold text-[#101827]">{memberName}</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
                Initiator Name
              </label>
              <div className="relative">
                <PenTool className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                <input
                  type="text"
                  value={form.initiator}
                  onChange={(e) => setForm({ ...form, initiator: e.target.value })}
                  placeholder="Initiated by preferred name"
                  className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] pl-11 pr-4 py-3 text-sm text-[#101827] focus:ring-2 focus:ring-[#0B1220]/10 outline-none placeholder:text-[#94A3B8] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
                Destination Account
              </label>
              <select
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-4 py-3 text-sm text-[#101827] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all font-medium appearance-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} ({acc.currency || "EUR"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#718096] text-xs">
                    {selectedAccount?.currency || "EUR"}
                  </div>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] pl-12 pr-4 py-3 text-sm text-[#101827] focus:ring-2 focus:ring-[#0B1220]/10 outline-none placeholder:text-[#94A3B8] font-mono tabular-nums"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
                  Value Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={form.valueDate}
                    onChange={(e) => setForm({ ...form, valueDate: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] pl-11 pr-4 py-3 text-sm text-[#101827] focus:ring-2 focus:ring-[#0B1220]/10 outline-none appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
                Reason Code
              </label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-4 py-3 text-sm text-[#101827] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all font-medium appearance-none"
              >
                {activeReasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
                Reference
              </label>
              <div className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-4 py-3 text-xs text-[#718096] font-mono flex items-center justify-between">
                AUTO-GENERATE
                <span className="text-[10px] font-bold text-[#D97706] px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50">PENDING</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
                Narration
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter detailed audit justification..."
                className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-4 py-3 text-sm text-[#101827] focus:ring-2 focus:ring-[#0B1220]/10 outline-none placeholder:text-[#94A3B8] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
              Supporting Documentation
            </label>
            <button
              type="button"
              className="w-full py-3.5 bg-[#F8FAFC] border-2 border-dashed border-[#E8EDF4] rounded-[12px] flex flex-col items-center justify-center gap-1 hover:border-[#0B1220]/30 transition-colors group"
            >
              <Paperclip className="w-4 h-4 text-[#94A3B8] group-hover:text-[#101827]" />
              <span className="text-[10px] font-bold text-[#718096] uppercase">Upload PDF Document</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-1.5">
              Notification Channels
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 flex items-center gap-2.5 p-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={form.notifyEmail} 
                  onChange={() => setForm(f => ({ ...f, notifyEmail: !f.notifyEmail }))} 
                />
                {form.notifyEmail ? <CheckSquare className="w-4 h-4 text-[#E85D65]" /> : <Square className="w-4 h-4 text-[#94A3B8]" />}
                <span className="text-[11px] font-bold text-[#101827] uppercase">Email Confirmation</span>
              </label>
              <label className="flex-1 flex items-center gap-2.5 p-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={form.notifyPush} 
                  onChange={() => setForm(f => ({ ...f, notifyPush: !f.notifyPush }))} 
                />
                {form.notifyPush ? <CheckSquare className="w-4 h-4 text-[#E85D65]" /> : <Square className="w-4 h-4 text-[#94A3B8]" />}
                <span className="text-[11px] font-bold text-[#101827] uppercase">App Notification</span>
              </label>
            </div>
          </div>
        </div>

        {preview && (
          <div className="bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-[#E8EDF4]">
              <div className="p-4 flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#718096] uppercase mb-1">Balance Before</span>
                <p className="text-sm font-mono tabular-nums text-[#718096]">
                  {formatValue(preview.before, preview.currency)}
                </p>
              </div>
              <div className={cn(
                "p-4 flex flex-col items-center transition-colors",
                isCredit ? "bg-emerald-50" : "bg-red-50"
              )}>
                <span className="text-[10px] font-bold text-[#718096] uppercase mb-1">Balance After</span>
                <div className="flex items-center gap-1.5">
                  <p className={cn(
                    "text-sm font-bold font-mono tabular-nums",
                    isCredit ? "text-[#059669]" : "text-[#DC2626]"
                  )}>
                    {formatValue(preview.after, preview.currency)}
                  </p>
                  {isCredit ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#059669]" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-[#DC2626]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-[12px] bg-red-50 border border-red-200 text-[#DC2626] text-xs font-medium leading-relaxed">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('?tab=operations')}
            className="flex-1 py-3.5 bg-white border border-[#E8EDF4] rounded-[12px] text-xs font-bold text-[#718096] uppercase hover:text-[#101827] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className={cn(
              "flex-[2] py-3.5 rounded-[12px] text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-sm text-white",
              success
                ? "bg-[#059669]"
                : isCredit 
                  ? "bg-[#059669] hover:bg-emerald-700"
                  : "bg-[#DC2626] hover:bg-red-700"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              <>
                <Check className="w-5 h-5" /> Request Submitted
              </>
            ) : (
              <>
                Submit for Approval <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E8EDF4] flex items-center gap-3">
        <Clock className="w-4 h-4 text-[#718096] flex-shrink-0" />
        <p className="text-xs text-[#718096] leading-relaxed">
          Note: This operation initiates a pending ledger entry. A secondary officer (Checker) must authorize the event before funds post to the core ledger.
        </p>
      </div>
    </div>
  );
}
