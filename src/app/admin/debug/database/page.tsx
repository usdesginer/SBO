import { createClient } from "@/lib/supabase/server";
import { Terminal, Database as DbIcon, ShieldAlert, History, Users, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Phase 5 & 9: Live Query Inspector & Audit Visualization
 * Provides raw database state visibility for diagnostic verification.
 */
export default async function DatabaseDebugPage() {
  const supabase = await createClient();

  // Primary data fetch - Capturing full response for diagnostics
  const [
    transactionsRes,
    accountsRes,
    profilesRes,
    auditLogsRes
  ] = await Promise.all([
    // Raw ledger entries
    supabase.from("transactions")
      .select("*", { count: "exact" })
      .not("category", "eq", "system_audit")
      .order("created_at", { ascending: false })
      .limit(20),
    
    // Raw account balances
    supabase.from("accounts").select("*", { count: "exact" }).limit(20),
    
    // Raw member profiles
    supabase.from("profiles").select("*", { count: "exact" }).limit(20),
    
    // Phase 9: Persistent Server Audit Logs
    supabase.from("transactions")
      .select("*", { count: "exact" })
      .eq("category", "system_audit")
      .order("created_at", { ascending: false })
      .limit(30)
  ]);

  // DIAGNOSTIC LOGGING
  console.log("--- LIVE QUERY INSPECTOR DIAGNOSTICS ---");
  console.log("Transactions:", { 
    error: transactionsRes.error, 
    count: transactionsRes.count, 
    rows: transactionsRes.data?.length 
  });
  console.log("Accounts:", { 
    error: accountsRes.error, 
    count: accountsRes.count, 
    rows: accountsRes.data?.length 
  });
  console.log("Profiles:", { 
    error: profilesRes.error, 
    count: profilesRes.count, 
    rows: profilesRes.data?.length 
  });
  console.log("Audit Logs:", { 
    error: auditLogsRes.error, 
    count: auditLogsRes.count, 
    rows: auditLogsRes.data?.length 
  });

  const sections = [
    { 
      title: "System Audit Logs (Phase 9)", 
      icon: Activity, 
      data: auditLogsRes.data, 
      error: auditLogsRes.error,
      count: auditLogsRes.count,
      color: "text-purple-400" 
    },
    { 
      title: "Recent Transactions (Raw Ledger)", 
      icon: History, 
      data: transactionsRes.data, 
      error: transactionsRes.error,
      count: transactionsRes.count,
      color: "text-accent-500" 
    },
    { 
      title: "Account Entities", 
      icon: DbIcon, 
      data: accountsRes.data, 
      error: accountsRes.error,
      count: accountsRes.count,
      color: "text-blue-400" 
    },
    { 
      title: "Member Profiles", 
      icon: Users, 
      data: profilesRes.data, 
      error: profilesRes.error,
      count: profilesRes.count,
      color: "text-emerald-400" 
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <Terminal className="w-7 h-7 text-[#E85D65]" />
            Live Query Inspector
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Institutional Diagnostic Tool · Raw Table State · Admin Only
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
            <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center gap-3">
              <section.icon className="w-5 h-5 text-[#E85D65]" />
              <h2 className="text-sm font-bold text-[#101827] uppercase tracking-wider">{section.title}</h2>
              <div className="ml-auto flex items-center gap-4">
                <span className="text-[11px] font-mono font-semibold text-[#718096]">
                  COUNT: {section.count ?? 0}
                </span>
                <span className="text-[11px] font-mono font-semibold text-[#718096]">
                  FETCHED: {section.data?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {section.error ? (
                <div className="bg-red-50 border border-red-200 rounded-[12px] p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#DC2626] uppercase">Query Error Detected</p>
                    <p className="text-xs font-mono text-[#DC2626] mt-1">{section.error.message}</p>
                    <p className="text-xs text-[#718096] mt-2">Check RLS policies or database permissions.</p>
                  </div>
                </div>
              ) : (
                <pre className="text-[11px] font-mono text-emerald-300 bg-[#0B1220] p-4 rounded-[12px] overflow-auto max-h-[400px] border border-white/10">
                  {JSON.stringify(section.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
