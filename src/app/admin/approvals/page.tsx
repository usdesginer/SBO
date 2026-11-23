"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import { 
  ShieldCheck, 
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  User,
  ShieldAlert,
  BadgeCheck
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type PendingTx = Transaction & {
  profiles: Pick<Profile, "full_name" | "email"> | null;
};

function parseAdjustmentMeta(description: string | null | undefined, fallbackMaker: string | null) {
  const text = description ?? "";
  const tierMatch = text.match(/\[TIER:\s*([^\]]+)\]/i);
  const makerMatch = text.match(/\[MAKER:\s*([^\]]+)\]/i);
  const tier = (tierMatch?.[1]?.trim().toLowerCase() || "standard") as "standard" | "supervisor" | "dual" | "executive";
  const maker = makerMatch?.[1]?.trim() || fallbackMaker || "System";
  return { tier, maker };
}

function PipelineInspector({ txStatus }: { txStatus: string }) {
  const stages = [
    { label: "Initiated", status: "completed" },
    { label: "Maker Verified", status: "completed" },
    { label: "Checker Pending", status: txStatus === "pending" ? "current" : "waiting" },
    { label: "Ledger Posting", status: "waiting" },
    { label: "Account Sync", status: "waiting" },
  ];

  return (
    <div className="flex items-center gap-2 mt-2 py-1.5 px-3 bg-[#F8FAFC] rounded-[10px] border border-[#E8EDF4] w-fit">
      {stages.map((stage, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={cn(
            "w-2 h-2 rounded-full",
            stage.status === "completed" ? "bg-[#059669]" : 
            stage.status === "current" ? "bg-[#E85D65] animate-pulse" : 
            "bg-[#CBD5E1]"
          )} />
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-tight whitespace-nowrap",
            stage.status === "completed" ? "text-[#101827]" :
            stage.status === "current" ? "text-[#E85D65]" :
            "text-[#94A3B8]"
          )}>
            {stage.label}
          </span>
          {i < stages.length - 1 && <div className="w-2.5 h-[1px] bg-[#E8EDF4]" />}
        </div>
      ))}
    </div>
  );
}

export default function ApprovalQueuePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [requests, setRequests] = useState<PendingTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        profiles:profiles!transactions_user_id_fkey(full_name, email)
      `)
      .eq("status", "pending")
      .in("category", ["adjustment_request", "transfer"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
    }

    setRequests((data as unknown as PendingTx[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchRequests(false);
  }, [fetchRequests]);

  useRealtimeTables(["transactions", "profiles"], () => {
    fetchRequests(true);
  });

  const handleAction = async (txId: string, action: "approve" | "reject") => {
    setProcessing(txId);
    try {
      const res = await fetch("/api/admin/approve-adjustment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, action }),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Action failed");
      fetchRequests();
    } catch {
      alert("Network error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-[#E85D65]" />
            Governance &amp; Authorizations
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold flex items-center gap-2">
            Institutional Control · Maker-Checker Protocol (Dual Control)
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
        <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#101827] uppercase tracking-wider">Execution Pipeline</h2>
          <span className="text-[11px] font-bold text-[#718096] bg-white px-3 py-1 rounded-full border border-[#E8EDF4]">
            {requests.length} Awaiting Authorization
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-[#718096]">
            <Loader2 className="w-9 h-9 animate-spin text-[#0B1220]" />
            <p className="text-sm font-medium tracking-tight">Accessing Secure Vault...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#718096]">
            <BadgeCheck className="w-12 h-12 text-[#CBD5E1]" />
            <p className="text-sm font-semibold text-[#101827]">All authorizations current. Queue empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E8EDF4]">
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Protocol &amp; Pipeline</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Maker (Initiator)</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Customer (Beneficiary)</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4]">
                {requests.map((req) => {
                  const meta = parseAdjustmentMeta(req.description, req.counterparty_name);
                  return (
                  <tr key={req.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit tracking-wide border",
                          req.category === "transfer" ? "bg-sky-50 text-[#2563EB] border-sky-200" :
                          meta.tier === "executive" ? "bg-[#0B1220] text-white border-[#0B1220]" :
                          meta.tier === "dual" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                          meta.tier === "supervisor" ? "bg-amber-50 text-[#D97706] border-amber-200" :
                          "bg-[#F8FAFC] text-[#718096] border-[#E8EDF4]"
                        )}>
                          {req.category === "transfer" ? "Customer Outbound Transfer" : `${meta.tier} Review`}
                        </span>
                        <PipelineInspector txStatus="pending" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center">
                          <User className="w-4 h-4 text-[#718096]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#101827]">{meta.maker}</p>
                          <p className="text-[11px] text-[#718096]">{new Date(req.created_at).toLocaleDateString("en-IE")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-xs font-bold text-[#101827]">{req.profiles?.full_name}</p>
                        <p className="text-[11px] text-[#718096] truncate max-w-[180px]">
                          {req.description ? req.description.split('] ')[1] ?? req.description : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5">
                        {req.transaction_type === "credit" ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#DC555D]" />
                        )}
                        <p className={cn(
                          "text-sm font-bold font-mono tabular-nums",
                          req.transaction_type === "credit" ? "text-[#059669]" : "text-[#DC555D]"
                        )}>
                          {isMounted ? formatCurrency(req.amount) : req.amount}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(req.id, "reject")}
                          disabled={!!processing}
                          className="px-4 py-2 rounded-[12px] border border-red-200 bg-red-50 text-[#DC2626] hover:bg-red-100 text-[11px] font-bold uppercase tracking-wider transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "approve")}
                          disabled={!!processing}
                          className="px-4 py-2 rounded-[12px] bg-[#059669] hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                        >
                          {processing === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          Authorize
                        </button>
                      </div>
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
