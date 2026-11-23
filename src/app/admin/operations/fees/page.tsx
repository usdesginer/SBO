"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import { Landmark, Loader2, Check, AlertCircle, RefreshCw } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type AccountRow = {
  id: string;
  account_name: string;
  account_number: string;
  balance: number;
  currency: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default function FeeManagementPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("25.00");
  const [description, setDescription] = useState("Swiss Private Custody & Maintenance Fee");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchAccounts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("accounts")
      .select("id, account_name, account_number, balance, currency, profiles!accounts_user_id_fkey(full_name, email)")
      .eq("status", "active")
      .order("account_name");

    const rows = (data as unknown as AccountRow[]) || [];
    setAccounts(rows);
    if (!accountId && rows[0]) {
      setAccountId(rows[0].id);
    }
    setLoading(false);
  }, [accountId]);

  useEffect(() => {
    fetchAccounts(false);
  }, [fetchAccounts]);

  useRealtimeTables(["accounts", "transactions"], () => {
    fetchAccounts(true);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/post-operation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "fee",
          accountId,
          amount: parseFloat(amount),
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fee assessment failed");
      setMessage({
        type: "ok",
        text: `Fee assessed cleanly. Updated balance: ${formatCurrency(data.newBalance)}.`,
      });
      fetchAccounts(true);
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Failed to post fee" });
    } finally {
      setSubmitting(false);
    }
  };

  const selected = accounts.find((a) => a.id === accountId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <Landmark className="w-7 h-7 text-[#E85D65]" />
            Institutional Fee Management
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Real-Time Custody, Wire &amp; Service Fee Assessment
          </p>
        </div>
        <button
          onClick={() => fetchAccounts(false)}
          aria-label="Refresh accounts"
          className="p-2.5 rounded-[12px] bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827]"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {message && (
        <div
          className={cn(
            "p-4 rounded-[12px] border flex items-center gap-3 text-sm font-medium",
            message.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-[#059669]"
              : "bg-red-50 border-red-200 text-[#DC2626]"
          )}
        >
          {message.type === "ok" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[#E8EDF4] rounded-[20px] p-6 sm:p-8 space-y-6 shadow-[var(--shadow-card)]">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Target Vault Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-semibold text-[#101827] outline-none focus:ring-2 focus:ring-[#0B1220]/10"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.profiles?.full_name || acc.profiles?.email} — {acc.account_name} ({formatCurrency(acc.balance, acc.currency)})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Fee Amount ({selected?.currency || "EUR"})</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm text-[#101827] font-mono outline-none focus:ring-2 focus:ring-[#0B1220]/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Projected Balance</label>
            <div className="px-4 py-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm font-mono tabular-nums font-bold text-[#101827]">
              {selected
                ? formatCurrency(Number(selected.balance) - (parseFloat(amount) || 0), selected.currency)
                : "—"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Narration</label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-sm text-[#101827] outline-none focus:ring-2 focus:ring-[#0B1220]/10"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || loading || !accountId}
          className="w-full py-3.5 rounded-[12px] bg-[#0B1220] hover:bg-[#17243A] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Landmark className="w-4 h-4 text-[#E85D65]" />}
          {submitting ? "Posting Fee..." : "Assess & Post Fee"}
        </button>
      </form>
    </div>
  );
}
