"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import { Lock, Search, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuditRow = {
  id: string;
  description: string;
  reference: string;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select("id, description, reference, created_at, profiles!transactions_user_id_fkey(full_name, email)")
      .eq("category", "system_audit")
      .order("created_at", { ascending: false })
      .limit(100);

    setLogs((data as unknown as AuditRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs(false);
  }, [fetchLogs]);

  useRealtimeTables(["transactions", "site_settings", "accounts", "profiles"], () => {
    fetchLogs(true);
  });

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.description.toLowerCase().includes(q) ||
      l.reference.toLowerCase().includes(q) ||
      l.profiles?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <Lock className="w-7 h-7 text-[#E85D65]" />
            Immutable Audit Stream
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Real-Time Security Overrides, Platform Modifications &amp; Ledger Traces
          </p>
        </div>
        <button
          onClick={() => fetchLogs(false)}
          aria-label="Refresh audit logs"
          className="p-2.5 rounded-[12px] bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827]"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex items-center gap-2.5 bg-white border border-[#E8EDF4] rounded-[10px] px-4 py-2.5 shadow-sm">
        <Search className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit stream by tag, email, or trace reference..."
          className="bg-transparent text-sm text-[#101827] placeholder-[#94A3B8] outline-none flex-1 min-w-0"
        />
      </div>

      <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-3 text-[#718096]">
            <Loader2 className="w-5 h-5 animate-spin text-[#0B1220]" />
            <span className="text-xs font-bold uppercase tracking-widest">Streaming Audit Trail...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#718096] text-sm">No audit entries match your search.</div>
        ) : (
          <div className="divide-y divide-[#E8EDF4]">
            {filtered.map((log) => (
              <div key={log.id} className="p-5 hover:bg-[#F8FAFC] transition-colors space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#0B1220] bg-[#F8FAFC] border border-[#E8EDF4] px-2.5 py-0.5 rounded-[8px]">
                    {log.reference}
                  </span>
                  <span className="text-[11px] font-mono text-[#718096]">
                    {new Date(log.created_at).toLocaleString("en-IE")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-mono text-[#101827] break-words">{log.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
