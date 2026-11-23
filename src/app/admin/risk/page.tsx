"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import { AlertTriangle, RefreshCw, ShieldCheck, Snowflake, X, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export default function RiskCompliancePage() {
  const [loading, setLoading] = useState(true);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [frozenAccounts, setFrozenAccounts] = useState<any[]>([]);
  const [flaggedTx, setFlaggedTx] = useState<any[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchRiskState = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();

    const [kycRes, accRes, txRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .in("kyc_status", ["pending", "rejected"])
        .order("created_at", { ascending: false }),
      supabase
        .from("accounts")
        .select("*, profiles!accounts_user_id_fkey(full_name, email)")
        .neq("status", "active")
        .order("created_at", { ascending: false }),
      supabase
        .from("transactions")
        .select("*, profiles!transactions_user_id_fkey(full_name, email)")
        .in("status", ["failed", "pending"])
        .not("category", "eq", "system_audit")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    setKycQueue(kycRes.data || []);
    setFrozenAccounts(accRes.data || []);
    setFlaggedTx(txRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRiskState(false);
  }, [fetchRiskState]);

  useRealtimeTables(["profiles", "accounts", "transactions", "cards"], () => {
    fetchRiskState(true);
  });

  const updateKyc = async (userId: string, kycStatus: "approved" | "rejected") => {
    setActingId(userId);
    await fetch("/api/admin/update-member", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, kycStatus }),
    });
    setActingId(null);
    fetchRiskState(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-[#D97706]" />
            Risk &amp; Compliance Monitor
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Real-Time KYC Verification Queue, Account Restrictions &amp; Exception Feed
          </p>
        </div>
        <button
          onClick={() => fetchRiskState(false)}
          aria-label="Refresh compliance feed"
          className="p-2.5 rounded-[12px] bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827]"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center gap-3 text-[#718096]">
          <Loader2 className="w-5 h-5 animate-spin text-[#0B1220]" />
          <span className="text-xs font-bold uppercase tracking-widest">Scanning Compliance Signals...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
            <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#101827] uppercase tracking-wider">KYC Attention Queue</h2>
              <span className="text-xs font-mono font-bold text-[#D97706] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">{kycQueue.length}</span>
            </div>
            <div className="divide-y divide-[#E8EDF4]">
              {kycQueue.length === 0 ? (
                <p className="p-8 text-center text-sm text-[#718096]">All customer KYC profiles are currently approved.</p>
              ) : (
                kycQueue.map((p) => (
                  <div key={p.id} className="p-5 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                    <div className="min-w-0">
                      <Link href={`/admin/members/${p.id}`} className="text-sm font-bold text-[#101827] hover:text-[#E85D65] truncate block">
                        {p.full_name || p.email}
                      </Link>
                      <p className="text-xs text-[#718096] truncate">{p.email} · KYC: {p.kyc_status}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        disabled={actingId === p.id}
                        onClick={() => updateKyc(p.id, "approved")}
                        className="px-3 py-1.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-[#059669] hover:bg-emerald-100 text-[10px] font-bold uppercase flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" /> Approve
                      </button>
                      {p.kyc_status !== "rejected" && (
                        <button
                          disabled={actingId === p.id}
                          onClick={() => updateKyc(p.id, "rejected")}
                          className="px-3 py-1.5 rounded-[10px] bg-red-50 border border-red-200 text-[#DC2626] hover:bg-red-100 text-[10px] font-bold uppercase flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
            <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#101827] uppercase tracking-wider">Restricted Accounts &amp; Pending Items</h2>
              <span className="text-xs font-mono font-bold text-[#2563EB] bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">{frozenAccounts.length + flaggedTx.length}</span>
            </div>
            <div className="divide-y divide-[#E8EDF4]">
              {frozenAccounts.length === 0 && flaggedTx.length === 0 ? (
                <p className="p-8 text-center text-sm text-[#718096]">Zero frozen accounts or transaction exceptions.</p>
              ) : (
                <>
                  {frozenAccounts.map((acc) => (
                    <div key={acc.id} className="p-5 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Snowflake className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#101827] truncate">{acc.account_name}</p>
                          <p className="text-xs text-[#718096] truncate">{acc.profiles?.email} · {acc.status.toUpperCase()}</p>
                        </div>
                      </div>
                      <Link href="/admin/accounts" className="text-xs font-bold text-[#E85D65] hover:underline flex-shrink-0">
                        Manage
                      </Link>
                    </div>
                  ))}
                  {flaggedTx.map((tx) => (
                    <div key={tx.id} className="p-5 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#101827] truncate">{tx.description}</p>
                        <p className="text-xs text-[#718096] truncate">
                          {tx.profiles?.email || "Member"} · {tx.status.toUpperCase()}
                        </p>
                      </div>
                      <span className="text-xs font-mono tabular-nums font-bold text-[#D97706] flex-shrink-0">
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
