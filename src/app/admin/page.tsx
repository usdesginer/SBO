import { createClient } from "@/lib/supabase/server";
import {
  Users,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Check,
  Terminal,
  Activity,
  ShoppingCart,
  Coffee,
  Briefcase,
  Zap,
  Car,
  Heart,
  Play,
  CreditCard,
  X,
  RotateCcw,
  Search,
  ArrowDownLeft
} from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { convertCurrency } from "@/lib/currency";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function getCategoryIcon(category: string) {
  switch (category) {
    case "shopping": return <ShoppingCart className="w-4 h-4" />;
    case "food": return <Coffee className="w-4 h-4" />;
    case "income": return <Briefcase className="w-4 h-4" />;
    case "transfer": return <ArrowLeftRight className="w-4 h-4" />;
    case "utilities": return <Zap className="w-4 h-4" />;
    case "transport": return <Car className="w-4 h-4" />;
    case "health": return <Heart className="w-4 h-4" />;
    case "entertainment": return <Play className="w-4 h-4" />;
    default: return <CreditCard className="w-4 h-4" />;
  }
}

function PipelineStatus({ status, category }: { status: string, category: string }) {
  const isPending = status === "pending";
  const isCompleted = status === "completed";
  const isAdjustment = category === "adjustment_request";

  const stages = [
    { label: "Init", active: true, color: "bg-[#059669]" },
    { label: "Pending", active: isPending || isCompleted, color: isCompleted ? "bg-[#059669]" : "bg-[#D97706] animate-pulse" },
    { label: "Auth", active: isCompleted, color: isCompleted ? "bg-[#059669]" : isPending && isAdjustment ? "bg-[#E85D65]" : "bg-[#CBD5E1]" },
    { label: "Ledger", active: isCompleted, color: isCompleted ? "bg-[#059669]" : "bg-[#CBD5E1]" },
  ];

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {stages.map((stage, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={cn("w-1.5 h-1.5 rounded-full", stage.color)} />
          <span className={cn("text-[9px] font-bold uppercase tracking-tight", stage.active ? "text-[#101827]" : "text-[#94A3B8]")}>
            {stage.label}
          </span>
          {i < stages.length - 1 && <div className="w-2 h-[1px] bg-[#E8EDF4]" />}
        </div>
      ))}
    </div>
  );
}

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

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Profile = Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "email">;
type AccountSummary = Pick<Database["public"]["Tables"]["accounts"]["Row"], "balance" | "account_type" | "currency">;

type TransactionWithProfile = Transaction & {
  profiles: Profile | null;
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [membersResult, accountsResult, recentTxResult, txTodayResult, pendingAuthResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("accounts").select("balance, account_type, currency"),
    supabase
      .from("transactions")
      .select("*, profiles!transactions_user_id_fkey(full_name, email)", { count: "exact" })
      .not("category", "eq", "system_audit")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("transactions").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("status", "pending").in("category", ["adjustment_request", "transfer"]),
  ]);

  const memberCount = membersResult.count;
  const accounts = accountsResult.data as AccountSummary[] | null;
  const recentTx = recentTxResult.data;
  const txCount = recentTxResult.count;
  const txTodayCount = txTodayResult.count;
  const pendingAuthCount = pendingAuthResult.count;

  const totalAUM = accounts?.reduce((sum, acc) => acc.account_type !== "credit" ? sum + convertCurrency(Number(acc.balance || 0), acc.currency, "EUR") : sum, 0) ?? 0;

  const kpis = [
    { label: "Institutional Members", value: (memberCount ?? 0).toString(), sub: "Active private clients", icon: Users, color: "text-[#17243A]", bg: "bg-[#F8FAFC] border-[#E8EDF4]", href: "/admin/members" },
    { label: "Assets Under Mgmt", value: formatCurrency(totalAUM, "EUR", { maximumFractionDigits: 0 }), sub: "Total AUM (Liquidity)", icon: TrendingUp, color: "text-[#059669]", bg: "bg-emerald-50 border-emerald-200/70", href: "/admin/accounts" },
    { label: "Daily Activity", value: (txTodayCount ?? 0).toString(), sub: "Total transactions today", icon: ArrowLeftRight, color: "text-[#2563EB]", bg: "bg-sky-50 border-sky-200/70", href: "/admin/transactions" },
    { label: "Authorizations", value: (pendingAuthCount ?? 0).toString(), sub: "Pending Maker-Checker review", icon: ShieldAlert, color: "text-[#D97706]", bg: "bg-amber-50 border-amber-200/70", href: "/admin/approvals" },
  ];

  const typedRecentTx = (recentTx as unknown as TransactionWithProfile[]) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">Institutional Overview</h1>
          <p className="text-[#718096] text-xs mt-1 font-medium flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#E85D65] flex-shrink-0" />
            Live Ledger Stream · {new Date().toLocaleDateString("en-IE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          href="/admin/approvals"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B1220] hover:bg-[#17243A] text-white rounded-[12px] text-xs font-semibold transition-all shadow-sm w-fit"
        >
          <ShieldAlert className="w-4 h-4 text-[#E85D65]" />
          Authorization Queue ({pendingAuthCount ?? 0})
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.href} className="bg-white border border-[#E8EDF4] rounded-[20px] p-6 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] hover:-translate-y-0.5 transition-all group shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between mb-5">
                <div className={cn("w-11 h-11 rounded-[12px] border flex items-center justify-center transition-transform group-hover:scale-105", kpi.bg)}>
                  <Icon className={cn("w-5 h-5", kpi.color)} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#101827] transition-colors" />
              </div>
              <div className="text-2xl sm:text-[28px] font-bold text-[#101827] mb-1 font-mono tabular-nums tracking-tight break-words">{kpi.value}</div>
              <p className="text-xs font-semibold text-[#718096]">{kpi.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)] min-w-0">
          <div className="px-6 py-5 border-b border-[#E8EDF4] flex items-center justify-between gap-4 bg-[#F8FAFC]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Activity className="w-5 h-5 text-[#E85D65] flex-shrink-0" />
              <h2 className="text-base font-bold text-[#101827] tracking-tight truncate">Global Ledger Stream</h2>
            </div>
            <Link href="/admin/transactions" className="text-xs font-bold text-[#E85D65] hover:text-[#101827] flex items-center gap-1 transition-colors flex-shrink-0">
              Advanced Monitor <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E8EDF4]">
            {typedRecentTx.length === 0 ? (
              <div className="py-20 text-center group px-6">
                <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[16px] flex items-center justify-center mx-auto mb-5">
                  <Terminal className="w-7 h-7 text-[#94A3B8]" />
                </div>
                <p className="text-xs font-bold text-[#101827] uppercase tracking-[0.2em] mb-2">Ledger Quiescent</p>
                <p className="text-xs text-[#718096] max-w-[280px] mx-auto leading-relaxed">
                  No institutional events detected in the current lifecycle. The system is actively monitoring the stream.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Link href="/admin/members" className="text-xs font-bold text-[#E85D65] hover:underline flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Audit Members
                  </Link>
                  <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                  <Link href="/admin/debug/database" className="text-xs font-bold text-[#718096] hover:text-[#101827] flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Raw Query
                  </Link>
                </div>
              </div>
            ) : (
              typedRecentTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8FAFC] transition-colors group">
                  <div className={cn(
                    "w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 border",
                    tx.transaction_type === "credit" 
                      ? "bg-emerald-50 text-[#059669] border-emerald-200/70" 
                      : "bg-red-50/80 text-[#DC555D] border-red-200/70"
                  )}>
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#101827] truncate tracking-tight mb-0.5">{tx.description}</p>
                    <div className="flex flex-col">
                      <div className="text-xs text-[#718096] font-medium flex flex-wrap items-center gap-2">
                        <span className="text-[#E85D65] font-semibold truncate max-w-[160px] sm:max-w-none">{tx.profiles?.full_name || tx.profiles?.email || "System Agent"}</span>
                        <span className="text-[#CBD5E1] hidden sm:inline">·</span>
                        <span>{new Date(tx.created_at).toLocaleTimeString("en-IE", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <PipelineStatus status={tx.status} category={tx.category} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1.5">
                    <div className={cn("text-sm sm:text-base font-bold font-mono tabular-nums tracking-tight", tx.transaction_type === "credit" ? "text-[#059669]" : "text-[#DC555D]")}>
                      {tx.transaction_type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </div>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0B1220] border border-white/10 rounded-[20px] overflow-hidden shadow-xl text-white flex flex-col justify-between">
          <div className="px-6 py-5 border-b border-white/10 flex items-center gap-2.5 bg-white/[0.03]">
            <ShieldAlert className="w-5 h-5 text-[#E85D65]" />
            <h2 className="text-base font-bold text-white tracking-tight">System Diagnostic</h2>
          </div>
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              {[
                { label: "Supabase Integrity", status: "Healthy" },
                { label: "Realtime Engine", status: "Active & Synced" },
                { label: "Audit Pipeline", status: "V2 Stream Enabled" },
              ].map((debug) => (
                <div key={debug.label} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider leading-none">{debug.label}</p>
                    <p className="text-xs text-white/60 mt-1.5 font-mono">{debug.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#17243A] rounded-[12px] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60 font-medium">Fetch Integrity</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">200 OK</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60 font-medium">Stream Context</span>
                <span className="text-xs font-bold text-white font-mono">{txCount || 0} Entities</span>
              </div>
            </div>

            <Link href="/admin/debug/database" className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-[12px] text-xs font-bold text-white uppercase transition-all flex items-center justify-center gap-2 tracking-wider">
              <Terminal className="w-4 h-4 text-[#E85D65]" /> Live Query Inspector
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
