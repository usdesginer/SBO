"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import {
  Building2,
  Search,
  RefreshCw,
  Snowflake,
  Zap,
  ShieldAlert,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type AccountRow = {
  id: string;
  user_id: string;
  account_name: string;
  account_number: string;
  account_type: "checking" | "savings" | "investment" | "credit";
  balance: number;
  available_balance: number;
  currency: string;
  interest_rate: number | null;
  status: "active" | "frozen" | "closed";
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "frozen" | "closed">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("accounts")
      .select("*, profiles!accounts_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    setAccounts((data as unknown as AccountRow[]) || []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchAccounts(false);
  }, [fetchAccounts]);

  useRealtimeTables(["accounts", "profiles"], () => {
    fetchAccounts(true);
  });

  const handleStatusChange = async (accountId: string, status: "active" | "frozen" | "closed") => {
    setUpdatingId(accountId);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/update-account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setFeedback(`Account status updated to "${status}".`);
      fetchAccounts(true);
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Failed to update account.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = accounts.filter((acc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      acc.account_name.toLowerCase().includes(q) ||
      acc.account_number.toLowerCase().includes(q) ||
      acc.profiles?.full_name?.toLowerCase().includes(q) ||
      acc.profiles?.email?.toLowerCase().includes(q)
    );
  });

  const totalAum = filtered.reduce(
    (sum, acc) => (acc.account_type !== "credit" ? sum + Number(acc.balance) : sum),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-[#E85D65]" />
            Vault Accounts Registry
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Real-Time Liquidity &amp; Custody Control · {filtered.length} Accounts · AUM{" "}
            <span className="font-mono text-[#101827]">{formatCurrency(totalAum)}</span>
          </p>
        </div>
        <button
          onClick={() => fetchAccounts(false)}
          aria-label="Refresh accounts"
          className="self-start sm:self-auto p-2.5 rounded-[12px] bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827] transition-all"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#059669]">
          {feedback}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2.5 bg-white border border-[#E8EDF4] rounded-[10px] px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by IBAN, account name, or member..."
            className="bg-transparent text-sm text-[#101827] placeholder-[#94A3B8] outline-none flex-1 min-w-0"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#E8EDF4] rounded-[12px] p-1">
          {(["all", "active", "frozen", "closed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all",
                statusFilter === status
                  ? "bg-[#0B1220] text-white"
                  : "text-[#718096] hover:text-[#101827]"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#718096] gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#0B1220]" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading Vaults...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#718096] text-sm">
            No vault accounts match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8EDF4] bg-[#F8FAFC] text-left">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Account</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Member</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Type</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest text-right">Balance</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4]">
                {filtered.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-[#101827]">{acc.account_name}</p>
                      <p className="text-[11px] font-mono text-[#718096]">{acc.account_number}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#101827]">{acc.profiles?.full_name || "Unassigned"}</p>
                      <p className="text-xs text-[#718096]">{acc.profiles?.email || acc.user_id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold uppercase text-[#101827]">{acc.account_type}</span>
                      {acc.interest_rate ? (
                        <p className="text-[11px] text-[#059669] font-mono">{acc.interest_rate}% APY</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-right font-mono tabular-nums">
                      <p className="text-sm font-bold text-[#101827]">{formatCurrency(acc.balance, acc.currency)}</p>
                      <p className="text-[11px] text-[#718096]">Avail: {formatCurrency(acc.available_balance, acc.currency)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                          acc.status === "active"
                            ? "bg-emerald-50 text-[#059669] border-emerald-200"
                            : acc.status === "frozen"
                            ? "bg-sky-50 text-[#2563EB] border-sky-200"
                            : "bg-red-50 text-[#DC2626] border-red-200"
                        )}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {acc.status !== "frozen" ? (
                          <button
                            disabled={updatingId === acc.id}
                            onClick={() => handleStatusChange(acc.id, "frozen")}
                            className="px-3 py-1.5 rounded-[10px] bg-sky-50 border border-sky-200 text-[#2563EB] hover:bg-sky-100 text-[10px] font-bold uppercase flex items-center gap-1 disabled:opacity-50"
                          >
                            <Snowflake className="w-3 h-3" /> Freeze
                          </button>
                        ) : (
                          <button
                            disabled={updatingId === acc.id}
                            onClick={() => handleStatusChange(acc.id, "active")}
                            className="px-3 py-1.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-[#059669] hover:bg-emerald-100 text-[10px] font-bold uppercase flex items-center gap-1 disabled:opacity-50"
                          >
                            <Zap className="w-3 h-3" /> Activate
                          </button>
                        )}
                        {acc.status !== "closed" && (
                          <button
                            disabled={updatingId === acc.id}
                            onClick={() => handleStatusChange(acc.id, "closed")}
                            className="px-3 py-1.5 rounded-[10px] bg-red-50 border border-red-200 text-[#DC2626] hover:bg-red-100 text-[10px] font-bold uppercase flex items-center gap-1 disabled:opacity-50"
                          >
                            <ShieldAlert className="w-3 h-3" /> Close
                          </button>
                        )}
                        <Link
                          href={`/admin/members/${acc.user_id}?tab=operations&mode=adjust`}
                          className="p-1.5 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] text-[#718096] hover:text-[#101827] transition-colors"
                          title="Manage Member"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
