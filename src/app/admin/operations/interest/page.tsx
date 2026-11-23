"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import { Zap, RefreshCw, Loader2, Check, AlertCircle, Play } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type AccountRow = {
  id: string;
  user_id: string;
  account_name: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
  interest_rate: number | null;
  status: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default function InterestEnginePage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchAccounts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("accounts")
      .select("*, profiles!accounts_user_id_fkey(full_name, email)")
      .eq("status", "active")
      .order("balance", { ascending: false });
    setAccounts((data as unknown as AccountRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts(false);
  }, [fetchAccounts]);

  useRealtimeTables(["accounts", "transactions"], () => {
    fetchAccounts(true);
  });

  const eligible = accounts.filter((a) => Number(a.interest_rate || 0) > 0 && Number(a.balance) > 0);
  const projectedCycleTotal = eligible.reduce(
    (sum, a) => sum + ((Number(a.balance) * Number(a.interest_rate || 0)) / 100) / 12,
    0
  );

  const runBatchInterest = async () => {
    setRunning("batch");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/post-operation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "interest" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch yield run failed");
      setMessage({
        type: "ok",
        text: `Posted monthly yield to ${data.creditedCount} account(s) totaling ${formatCurrency(data.totalCredited || 0)}.`,
      });
      fetchAccounts(true);
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Operation failed" });
    } finally {
      setRunning(null);
    }
  };

  const creditSingleAccount = async (acc: AccountRow) => {
    const monthlyYield = Number(
      (((Number(acc.balance) * Number(acc.interest_rate || 1.25)) / 100) / 12).toFixed(2)
    );
    if (monthlyYield <= 0) return;

    setRunning(acc.id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/post-operation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "interest",
          accountId: acc.id,
          amount: monthlyYield,
          description: `Manual Interest Yield (${acc.interest_rate || 1.25}% APY) — ${acc.account_name}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Credit failed");
      setMessage({
        type: "ok",
        text: `Credited ${formatCurrency(monthlyYield, acc.currency)} interest to ${acc.account_name}.`,
      });
      fetchAccounts(true);
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Operation failed" });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <Zap className="w-7 h-7 text-[#E85D65]" />
            Interest Engine
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Real-Time Swiss Yield Calculation &amp; Monthly Disbursement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runBatchInterest}
            disabled={running !== null || eligible.length === 0}
            className="px-4 py-2.5 rounded-[12px] bg-[#0B1220] hover:bg-[#17243A] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
          >
            {running === "batch" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-[#E85D65]" />}
            Run Monthly Yield ({formatCurrency(projectedCycleTotal)})
          </button>
          <button
            onClick={() => fetchAccounts(false)}
            aria-label="Refresh interest accounts"
            className="p-2.5 rounded-[12px] bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827]"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
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

      <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-3 text-[#718096]">
            <Loader2 className="w-5 h-5 animate-spin text-[#0B1220]" />
            <span className="text-xs font-bold uppercase tracking-widest">Calculating Live Yields...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8EDF4] bg-[#F8FAFC] text-left">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Account &amp; Member</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">APY</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest text-right">Principal</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest text-right">Est. Monthly Yield</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4]">
                {accounts.map((acc) => {
                  const rate = Number(acc.interest_rate || 0);
                  const yieldEst = ((Number(acc.balance) * (rate || 1.25)) / 100) / 12;
                  return (
                    <tr key={acc.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-[#101827]">{acc.account_name}</p>
                        <p className="text-xs text-[#718096]">
                          {acc.profiles?.full_name || acc.profiles?.email} · <span className="font-mono">{acc.account_number}</span>
                        </p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-[#059669]">
                        {rate > 0 ? `${rate}%` : "0.00% (1.25% manual)"}
                      </td>
                      <td className="px-5 py-4 text-right font-mono tabular-nums text-sm font-bold text-[#101827]">
                        {formatCurrency(acc.balance, acc.currency)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono tabular-nums text-sm font-bold text-[#059669]">
                        +{formatCurrency(yieldEst, acc.currency)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          disabled={running !== null || Number(acc.balance) <= 0}
                          onClick={() => creditSingleAccount(acc)}
                          className="px-3.5 py-1.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-[#059669] hover:bg-emerald-100 text-[10px] font-bold uppercase disabled:opacity-40"
                        >
                          {running === acc.id ? "Posting..." : "Post Yield"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
