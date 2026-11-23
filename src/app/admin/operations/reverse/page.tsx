"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import { RotateCcw, RefreshCw, Loader2, Check, AlertCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type TxRow = {
  id: string;
  user_id: string;
  transaction_type: "credit" | "debit";
  amount: number;
  description: string;
  status: string;
  reference: string;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default function ReversalProtocolPage() {
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchCompleted = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select("*, profiles!transactions_user_id_fkey(full_name, email)")
      .eq("status", "completed")
      .not("category", "eq", "system_audit")
      .order("created_at", { ascending: false })
      .limit(50);

    setTransactions((data as unknown as TxRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompleted(false);
  }, [fetchCompleted]);

  useRealtimeTables(["transactions", "accounts"], () => {
    fetchCompleted(true);
  });

  const handleReverse = async (tx: TxRow) => {
    setProcessingId(tx.id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/reverse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: tx.id,
          reason: "Authorized via Admin Reversal Protocol",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reversal failed");
      setMessage({
        type: "ok",
        text: `Reversed ${tx.reference}. Updated account balance: ${formatCurrency(data.newBalance)}.`,
      });
      fetchCompleted(true);
    } catch (err: unknown) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Reversal failed" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <RotateCcw className="w-7 h-7 text-[#E85D65]" />
            Reversal Protocol
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Real-Time Settlement Reversal &amp; Offsetting Ledger Engine
          </p>
        </div>
        <button
          onClick={() => fetchCompleted(false)}
          aria-label="Refresh reversible transactions"
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

      <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-3 text-[#718096]">
            <Loader2 className="w-5 h-5 animate-spin text-[#0B1220]" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading Completed Ledger...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-[#718096] text-sm">No completed transactions available for reversal.</div>
        ) : (
          <div className="divide-y divide-[#E8EDF4]">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#101827] truncate">{tx.description}</p>
                  <p className="text-xs text-[#718096] mt-1">
                    {tx.profiles?.full_name || tx.profiles?.email || "Member"} · Ref:{" "}
                    <span className="font-mono text-[#101827]">{tx.reference}</span> · {new Date(tx.created_at).toLocaleString("en-IE")}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                  <span
                    className={cn(
                      "text-sm font-mono tabular-nums font-bold",
                      tx.transaction_type === "credit" ? "text-[#059669]" : "text-[#DC555D]"
                    )}
                  >
                    {tx.transaction_type === "credit" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                  <button
                    disabled={processingId === tx.id}
                    onClick={() => handleReverse(tx)}
                    className="px-3.5 py-2 rounded-[10px] bg-red-50 border border-red-200 text-[#DC2626] hover:bg-red-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {processingId === tx.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    Reverse
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
