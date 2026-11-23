import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  Download, ArrowRightLeft, CreditCard, Building, 
  ShoppingCart, Coffee, Briefcase, Zap, Car, Heart, Play,
  Check, Clock, X, RotateCcw, Plus, Landmark
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DisplayMoney, DisplayMoneySum, DisplayCurrencyCode } from "@/components/currency/display-money";

function getCategoryIcon(category: string) {
  switch (category) {
    case "shopping": return <ShoppingCart className="w-5 h-5" />;
    case "food": return <Coffee className="w-5 h-5" />;
    case "income": return <Briefcase className="w-5 h-5" />;
    case "transfer": return <ArrowRightLeft className="w-5 h-5" />;
    case "utilities": return <Zap className="w-5 h-5" />;
    case "transport": return <Car className="w-5 h-5" />;
    case "health": return <Heart className="w-5 h-5" />;
    case "entertainment": return <Play className="w-5 h-5" />;
    default: return <CreditCard className="w-5 h-5" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { style: string; icon: any }> = {
    completed: { 
      style: "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[0_1px_4px_rgba(16,185,129,0.05)]", 
      icon: Check 
    },
    pending: { 
      style: "bg-amber-50 text-amber-700 border-amber-100 shadow-[0_1px_4px_rgba(245,158,11,0.05)]", 
      icon: Clock 
    },
    failed: { 
      style: "bg-red-50 text-red-700 border-red-100 shadow-[0_1px_4px_rgba(239,68,68,0.05)]", 
      icon: X 
    },
    reversed: { 
      style: "bg-slate-50 text-slate-500 border-slate-100 shadow-[0_1px_4px_rgba(100,116,139,0.05)]", 
      icon: RotateCcw 
    },
  };
  
  const { style, icon: Icon } = config[status] ?? config.pending;
  
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest transition-all", style)}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const supabase = await createClient();
  let user = null;
  let accounts: any[] = [];
  let transactions: any[] = [];
  let fetchError = false;

  try {
    const { data: authData } = await supabase.auth.getUser();
    user = authData.user;
  } catch (err) {
    console.error("AccountsPage auth fetch failed:", err);
    fetchError = true;
  }

  if (!user && !fetchError) redirect("/login");

  if (user) {
    try {
      const [{ data: accountsRaw }, { data: txRaw }] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", user.id).order("created_at"),
        supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      ]);
      accounts = (accountsRaw || []) as any[];
      transactions = (txRaw || []) as any[];
    } catch (err) {
      console.error("AccountsPage data fetch failed:", err);
      fetchError = true;
    }
  }

  const accountCurrencyMap: Record<string, string> = {};
  accounts.forEach((a) => {
    accountCurrencyMap[a.id] = a.currency || "EUR";
  });
  const netWorthItems = accounts
    .filter((a) => a.account_type !== "credit")
    .map((a) => ({ amount: Number(a.balance || 0), currency: a.currency }));

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {fetchError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
          Temporary connection interruption while syncing ledger data. Data will refresh automatically once connectivity resumes.
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">
            Institutional Portfolio – <DisplayCurrencyCode />
          </h1>
          <p className="text-[#718096] text-xs font-semibold uppercase tracking-widest mt-1">Manage Everyday Liquidity &amp; Multi-Currency Vaults</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/transfers" className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-[#0B1220] text-white rounded-[12px] text-[11px] font-bold uppercase tracking-widest hover:bg-[#17243A] transition-all shadow-sm">
            <ArrowRightLeft className="w-4 h-4" /> Transfer
          </Link>
          <button className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-white border border-[#E8EDF4] text-[#101827] rounded-[12px] text-[11px] font-bold uppercase tracking-widest hover:bg-[#F8FAFC] transition-all">
            <Download className="w-4 h-4 text-[#718096]" /> Export
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {[
          { label: "Total Net Worth", value: <DisplayMoneySum items={netWorthItems} />, sub: "Converted multi-currency total" },
          { label: "Active Entities", value: accounts?.length ?? 0, sub: "Vault accounts" },
          { label: "Ledger Activity", value: transactions?.length ?? 0, sub: "Last 50 entries" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)]">
            <p className="text-[#718096] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#101827] font-mono tabular-nums tracking-tight break-words">{stat.value}</p>
            <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(!accounts || accounts.length === 0) ? (
          <div className="col-span-full py-16 sm:py-20 px-6 text-center bg-white border border-[#E8EDF4] rounded-[20px] shadow-[var(--shadow-card)] group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#F8FAFC] rounded-full -ml-32 -mt-32 transition-colors duration-700 group-hover:bg-[#E8EDF4]/40" />
            
            <div className="w-20 h-20 bg-white rounded-[20px] flex items-center justify-center mx-auto mb-6 border border-[#E8EDF4] shadow-sm transition-transform group-hover:scale-105 duration-500">
              <Landmark className="w-9 h-9 text-[#0B1220]" />
            </div>
            
            <h3 className="text-[11px] font-bold text-[#101827] tracking-[0.25em] mb-3 uppercase">Portfolio Empty</h3>
            <p className="text-[15px] text-[#718096] mb-8 max-w-sm mx-auto leading-relaxed">
              You haven&apos;t established any vault accounts yet. Initialize your first digital institution to start managing your capital.
            </p>
            
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0B1220] text-white rounded-[12px] text-[11px] font-bold uppercase tracking-widest hover:bg-[#17243A] transition-all shadow-sm active:scale-95">
              <Plus className="w-4 h-4" /> Open Private Vault Account
            </Link>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden flex flex-col group hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition-all duration-300">
              <div className={cn(
                "p-6 sm:p-8 text-white relative overflow-hidden",
                account.account_type === 'savings' ? "bg-[#17243A]" : 
                account.account_type === 'investment' ? "bg-[#111C30]" : "bg-[#0B1220]"
              )}>
                <div className="relative z-10 flex justify-between items-start mb-7 gap-3">
                  <div className="min-w-0">
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.25em]">{account.account_type}</p>
                    <h3 className="text-lg sm:text-xl font-bold mt-1 tracking-tight truncate">{account.account_name}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-[12px] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 flex-shrink-0">
                    {account.account_type === 'checking' ? <CreditCard className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight break-words">
                    <DisplayMoney amount={Number(account.balance || 0)} fromCurrency={account.currency} showNativeHint />
                  </div>
                  <p className="text-white/55 text-[11px] font-medium mt-2 uppercase tracking-wider">
                    Available: <DisplayMoney amount={Number(account.available_balance || 0)} fromCurrency={account.currency} />
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -mr-32 -mt-32" />
              </div>
              
              <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E8EDF4] flex flex-wrap items-center justify-between gap-3">
                <div className="font-mono text-[11px] font-semibold text-[#718096] tracking-wider uppercase break-all">
                  {account.account_number}
                </div>
                <div className="flex gap-4">
                  <button className="text-[11px] font-bold text-[#101827] hover:text-[#E85D65] transition-colors uppercase tracking-wider">Details</button>
                  <button className="text-[11px] font-bold text-[#101827] hover:text-[#E85D65] transition-colors uppercase tracking-wider">Statement</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E8EDF4] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#101827] uppercase tracking-[0.18em]">Transaction History</h2>
          <Link href="/dashboard/transactions" className="text-[11px] font-bold text-[#E85D65] hover:text-[#101827] transition-colors uppercase tracking-wider">View Full History</Link>
        </div>
        <div className="divide-y divide-[#E8EDF4] px-3 sm:px-6">
          {(!transactions || transactions.length === 0) ? (
            <div className="py-16 text-center group">
              <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[16px] flex items-center justify-center mx-auto mb-5">
                <ArrowRightLeft className="w-7 h-7 text-[#94A3B8]" />
              </div>
              <p className="text-[11px] font-bold text-[#101827] uppercase tracking-[0.25em] mb-2">No Institutional Events</p>
              <p className="text-[13px] text-[#718096] max-w-[260px] mx-auto leading-relaxed">
                Your portfolio ledger is currently empty. Start moving capital to track your history.
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-3 py-4 hover:bg-[#F8FAFC] rounded-[12px] transition-colors group">
                <div className={cn(
                  "w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0 border",
                  tx.transaction_type === "credit" ? "bg-emerald-50 text-[#059669] border-emerald-200/70" : "bg-[#F8FAFC] text-[#718096] border-[#E8EDF4]"
                )}>
                  {getCategoryIcon(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#101827] truncate mb-0.5 tracking-tight">{tx.description}</p>
                  <p className="text-xs text-[#718096] truncate">
                    {new Date(tx.created_at).toLocaleDateString("en-IE", { 
                      day: "2-digit", 
                      month: "short", 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                    {" · "}
                    <span className="font-mono text-[11px] text-[#94A3B8]">REF: {tx.reference.slice(0, 8)}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className={cn("text-sm sm:text-base font-bold font-mono tabular-nums tracking-tight", tx.transaction_type === "credit" ? "text-[#059669]" : "text-[#DC555D]")}>
                    <DisplayMoney
                      amount={Number(tx.amount || 0)}
                      fromCurrency={accountCurrencyMap[tx.account_id] || "EUR"}
                      sign={tx.transaction_type === "credit" ? "+" : "-"}
                    />
                  </p>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
