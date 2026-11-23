"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import {
  Loader2,
  RotateCcw,
  Edit3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"] & {
  profiles?: { full_name?: string | null; email?: string | null } | null;
};

const PAGE_SIZE = 25;

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { style: string; icon: any }> = {
    completed: { 
      style: "bg-emerald-50 text-[#059669] border border-emerald-200/80", 
      icon: Check 
    },
    pending: { 
      style: "bg-amber-50 text-[#D97706] border border-amber-200/80", 
      icon: Clock 
    },
    failed: { 
      style: "bg-red-50 text-[#DC2626] border border-red-200/80", 
      icon: X 
    },
    reversed: { 
      style: "bg-[#F8FAFC] text-[#718096] border border-[#E8EDF4]", 
      icon: RotateCcw 
    },
  };
  
  const { style, icon: Icon } = config[status] ?? config.pending;
  
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider transition-all", style)}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ description: "", status: "", amount: "" });
  const [saving, setSaving] = useState(false);

  const fetchTransactions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from("transactions")
      .select("*, profiles!transactions_user_id_fkey(full_name, email)", { count: "exact" })
      .not("category", "eq", "system_audit")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (typeFilter !== "all") query = query.eq("transaction_type", typeFilter);

    const { data, count, error } = await query;
    
    if (error) console.error("Query Error:", error);

    setTotalCount(count ?? 0);
    setTransactions((data as Transaction[]) ?? []);
    setLoading(false);
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    fetchTransactions(false);
  }, [fetchTransactions]);

  useRealtimeTables(["transactions", "profiles"], () => {
    fetchTransactions(true);
  });

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditForm({
      description: tx.description ?? "",
      status: tx.status,
      amount: tx.amount.toString()
    });
  };

  const handleSave = async () => {
    if (!editingTx) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-transaction", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: editingTx.id,
          status: editForm.status,
          description: editForm.description,
          amount: parseFloat(editForm.amount)
        }),
      });
      if (res.ok) {
        setEditingTx(null);
        fetchTransactions();
      } else {
        const data = await res.json();
        alert(data.error || "Update failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">Ledger Monitor</h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold flex items-center gap-2">
            {totalCount.toLocaleString()} Institutional Ledger Events
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
        <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="bg-white border border-[#E8EDF4] rounded-[10px] px-3 py-2 text-xs font-semibold text-[#101827] outline-none focus:ring-2 focus:ring-[#0B1220]/10"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="reversed">Reversed</option>
            </select>
            <select 
              value={typeFilter} 
              onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
              className="bg-white border border-[#E8EDF4] rounded-[10px] px-3 py-2 text-xs font-semibold text-[#101827] outline-none focus:ring-2 focus:ring-[#0B1220]/10"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit (+)</option>
              <option value="debit">Debit (-)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-2 bg-white border border-[#E8EDF4] rounded-[10px] text-[#718096] hover:text-[#101827] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider px-1">Page {page + 1}</span>
            <button 
              disabled={(page + 1) * PAGE_SIZE >= totalCount}
              onClick={() => setPage(p => p + 1)}
              className="p-2 bg-white border border-[#E8EDF4] rounded-[10px] text-[#718096] hover:text-[#101827] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-28">
            <Loader2 className="w-9 h-9 animate-spin text-[#0B1220]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E8EDF4]">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Value Date</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Trace ID</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Direction</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Beneficiary</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Narration</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Amount</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-5 py-4 text-xs text-[#718096] font-mono">
                      {new Date(tx.created_at).toLocaleDateString("en-IE")}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-[#101827] font-bold uppercase">{tx.reference.slice(0, 12)}...</td>
                    <td className="px-5 py-4">
                      <div className={cn(
                        "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border w-fit",
                        tx.transaction_type === "credit" ? "text-[#059669] border-emerald-200 bg-emerald-50" : "text-[#DC555D] border-red-200 bg-red-50"
                      )}>
                        {tx.transaction_type === "credit" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {tx.transaction_type}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-[#101827]">{tx.profiles?.full_name ?? "—"}</p>
                      <p className="text-[11px] text-[#718096]">{tx.profiles?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#718096] truncate max-w-[200px]">{tx.description}</td>
                    <td className={cn(
                      "px-5 py-4 text-right text-xs font-bold font-mono tabular-nums",
                      tx.transaction_type === "credit" ? "text-[#059669]" : "text-[#DC555D]"
                    )}>
                      {tx.transaction_type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(tx)}
                        aria-label="Edit transaction"
                        className="p-2 rounded-[10px] bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827] hover:border-[#0B1220] transition-all lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingTx && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#0B1220]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E8EDF4] w-full max-w-lg rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 bg-[#0B1220] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#E85D65]" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Institutional Ledger Edit</h2>
              </div>
              <button onClick={() => setEditingTx(null)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Trace ID</label>
                <div className="px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-xs font-mono text-[#101827] font-bold uppercase">
                  {editingTx.reference}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Ledger Status</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-3 py-2.5 text-xs font-semibold text-[#101827] outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="reversed">Reversed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Amount (EUR)</label>
                  <input 
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-3 py-2.5 text-xs text-[#101827] font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Narration / Justification</label>
                <textarea 
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-3 py-2.5 text-xs text-[#101827] outline-none resize-none"
                />
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[12px]">
                <p className="text-[11px] text-[#D97706] font-medium leading-relaxed">
                  CAUTION: Direct ledger manipulation bypasses Maker-Checker protocol. All edits are logged under your identity for regulatory audit.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E8EDF4] flex items-center justify-end gap-3">
              <button 
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 rounded-[12px] text-xs font-bold text-[#718096] uppercase hover:text-[#101827] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-[#0B1220] hover:bg-[#17243A] text-white text-xs font-bold uppercase rounded-[12px] shadow-sm flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
