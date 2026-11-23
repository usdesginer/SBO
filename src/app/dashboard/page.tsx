"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import {
  CreditCard, Landmark,
  Wallet, ArrowUpRight, ArrowRight, DollarSign,
  Activity, ChevronRight, Check, TrendingUp, Copy
} from "lucide-react";
import Link from "next/link";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { PortfolioTrend } from "@/components/dashboard/portfolio-trend";
import { QuickOpenAccount } from "@/components/dashboard/quick-open-account";
import { QuickActionTile } from "@/components/dashboard/quick-action-tile";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { PortfolioSnapshot } from "@/components/dashboard/portfolio-snapshot";
import { GlobalLedgerStream } from "@/components/dashboard/global-ledger-stream";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { DisplayCurrencySelector } from "@/components/currency/display-money";
import { formatCurrencyAmount, normalizeCurrency } from "@/lib/currency";
import { motion, Variants } from "framer-motion";

function getAccountIcon(type: string) {
  switch (type) {
    case "checking": return <CreditCard className="w-5 h-5" />;
    case "savings": return <Landmark className="w-5 h-5" />;
    case "investment": return <TrendingUp className="w-5 h-5" />;
    case "credit": return <Wallet className="w-5 h-5" />;
    default: return <DollarSign className="w-5 h-5" />;
  }
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function DashboardPage() {
  const router = useRouter();
  const { currency, symbol, convert } = useCurrency();
  const [data, setData] = useState<{
    accounts: any[] | null;
    transactions: any[] | null;
    investments: any[] | null;
    user: any | null;
  }>({ accounts: null, transactions: null, investments: null, user: null });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const [
      { data: accounts }, 
      { data: transactions },
      { data: investments }
    ] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", user.id).eq("status", "active").order("created_at"),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("investments").select("*").eq("user_id", user.id),
    ]);

    setData({ accounts, transactions, investments, user });
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  useRealtimeTables(["accounts", "transactions", "investments", "profiles"], () => {
    fetchData(true);
  });

  if (loading) return null;

  const accountCurrencyMap: Record<string, string> = {};
  const accountNameMap: Record<string, string> = {};
  data.accounts?.forEach((acc) => {
    accountCurrencyMap[acc.id] = acc.currency || "EUR";
    accountNameMap[acc.id] = acc.account_name;
  });

  const totalBalance =
    data.accounts?.reduce(
      (sum, acc) =>
        acc.account_type !== "credit" ? sum + convert(Number(acc.balance || 0), acc.currency) : sum,
      0
    ) ?? 0;
  const availableBalance =
    data.accounts?.reduce(
      (sum, acc) =>
        acc.account_type !== "credit"
          ? sum + convert(Number(acc.available_balance || 0), acc.currency)
          : sum,
      0
    ) ?? 0;
  const reserved = Number((totalBalance - availableBalance).toFixed(2));
  const pendingAuthAmount =
    data.transactions
      ?.filter((tx) => tx.status === "pending" && tx.transaction_type === "debit")
      .reduce((sum, tx) => sum + convert(Number(tx.amount || 0), accountCurrencyMap[tx.account_id] || "EUR"), 0) ?? 0;

  const primaryAccount = data.accounts?.[0];
  const primaryIban = primaryAccount?.account_number || "NO ACCOUNT DETECTED";

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyIncome = data.transactions
    ?.filter(tx => new Date(tx.created_at) >= currentMonthStart && tx.transaction_type === "credit" && tx.status === "completed")
    .reduce((sum, tx) => sum + convert(Number(tx.amount || 0), accountCurrencyMap[tx.account_id] || "EUR"), 0) ?? 0;
    
  const monthlySpending = data.transactions
    ?.filter(tx => new Date(tx.created_at) >= currentMonthStart && tx.transaction_type === "debit" && tx.status === "completed")
    .reduce((sum, tx) => sum + convert(Number(tx.amount || 0), accountCurrencyMap[tx.account_id] || "EUR"), 0) ?? 0;

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleDateString("en-IE", { month: "short" }),
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      income: 0,
      expense: 0,
    };
  });

  data.transactions?.forEach(tx => {
    const txDate = new Date(tx.created_at);
    const m = txDate.getMonth();
    const y = txDate.getFullYear();
    if (tx.status !== 'completed') return;

    const monthData = last6Months.find(d => d.monthIndex === m && d.year === y);
    if (monthData) {
      const converted = convert(Number(tx.amount || 0), accountCurrencyMap[tx.account_id] || "EUR");
      if (tx.transaction_type === 'credit') monthData.income += converted;
      else monthData.expense += converted;
    }
  });

  const trendData = data.transactions
    ?.slice(0, 10)
    .reverse()
    .map(tx => ({ value: convert(Number(tx.balance_after || 0), accountCurrencyMap[tx.account_id] || "EUR") })) ?? [];

  const totalInvestments = data.investments?.reduce((sum, inv) => sum + convert(Number(inv.current_value || 0), "EUR"), 0) ?? 0;
  const rewards = Math.floor(monthlySpending * 0.1);

  const copyIban = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(primaryIban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 max-w-7xl mx-auto pb-20"
    >
      <motion.section variants={item} className="premium-glass rounded-[20px] p-6 sm:p-7 lg:p-10 relative group border border-white/10">
        <div className="relative z-10">
          <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-12">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-[12px] font-medium text-white/50 uppercase tracking-[0.2em] mb-3 sm:mb-4">Institutional Portfolio – {currency}</p>
              
              <div className="mb-8 sm:mb-9">
                <div className="text-[32px] sm:text-[38px] lg:text-[40px] font-bold text-white tracking-[-0.03em] mb-2 font-mono leading-none flex items-baseline gap-2 flex-wrap">
                  <span className="text-lg sm:text-xl opacity-50">{symbol}</span>
                  <AnimatedNumber value={totalBalance} size="xl" />
                </div>
                <div className="flex items-center gap-3 group/iban cursor-pointer mt-4" onClick={copyIban}>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Institutional ID / IBAN</span>
                    <span className="text-sm sm:text-base font-bold text-white font-mono tracking-wider uppercase transition-colors group-hover/iban:text-[#E85D65] break-all">
                      {primaryIban}
                    </span>
                  </div>
                  <button aria-label="Copy IBAN" className="mt-4 p-2.5 rounded-[12px] bg-white/5 border border-white/10 text-white/50 group-hover/iban:text-white group-hover/iban:bg-white/10 transition-all active:scale-90 flex-shrink-0">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-emerald-400 rounded-full text-[11px] sm:text-[12px] font-medium border border-white/5">
                  <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
                  Live Market Feed Active
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md text-white/65 rounded-full text-[11px] sm:text-[12px] font-medium border border-white/5">
                  <Activity className="w-4 h-4 flex-shrink-0" />
                  Synced with Core Ledger
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/3 w-full">
              <PortfolioTrend data={trendData} />
              <div className="flex flex-wrap gap-3 mt-6 sm:mt-8">
                <Link href="/dashboard/transfers" className="flex-1 min-w-[120px] px-6 py-3.5 bg-[#E85D65] text-white rounded-[12px] font-bold text-[11px] hover:bg-[#DC555D] transition-all shadow-lg shadow-[#E85D65]/20 active:scale-95 uppercase tracking-[0.14em] text-center">
                  Transfer
                </Link>
                <button
                  type="button"
                  onClick={() => document.getElementById("currency-selector-panel")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex-1 min-w-[120px] px-6 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/15 rounded-[12px] font-bold text-[11px] hover:bg-white/20 transition-all active:scale-95 uppercase tracking-[0.14em]"
                >
                  Exchange ({currency})
                </button>
              </div>
            </div>
          </header>

          <div className="h-[1px] bg-white/10 w-full my-8 sm:my-12" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12">
            <div className="space-y-2">
              <p className="text-[12px] font-medium text-white/30 uppercase tracking-[0.25em]">Available Liquidity</p>
              <div className="text-[24px] font-bold text-white font-mono tracking-tighter flex items-baseline gap-1.5">
                <span className="text-sm opacity-40">{symbol}</span>
                <AnimatedNumber value={availableBalance} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-medium text-white/30 uppercase tracking-[0.25em]">Pending Auth</p>
              <div className="text-[24px] font-bold text-white/50 font-mono italic tracking-tighter flex items-baseline gap-1.5">
                <span className="text-sm opacity-40">{symbol}</span>
                <AnimatedNumber value={pendingAuthAmount} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-medium text-white/30 uppercase tracking-[0.25em]">Reserved Assets</p>
              <div className="text-[24px] font-bold text-white/40 font-mono tracking-tighter flex items-baseline gap-1.5">
                <span className="text-sm opacity-40">{symbol}</span>
                <AnimatedNumber value={reserved} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400/10 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />
      </motion.section>

      <div id="currency-selector-panel">
        <DisplayCurrencySelector variant="panel" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8 lg:space-y-12 min-w-0">
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[18px] font-semibold text-[#101827] tracking-tight">Vault Entities</h2>
              <Link href="/dashboard/accounts" className="text-[11px] sm:text-[12px] font-medium text-[#718096] hover:text-[#101827] transition-colors flex items-center gap-1.5 group uppercase tracking-widest">
                Manage Portfolio <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {(!data.accounts || data.accounts.length === 0) ? (
              <div className="bg-white rounded-[20px] p-8 sm:p-12 border border-[#E8EDF4] shadow-[var(--shadow-card)] text-center flex flex-col items-center group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F8FAFC] rounded-full -mr-32 -mt-32 transition-colors duration-700 group-hover:bg-[#E8EDF4]/40" />
                
                <div className="w-20 h-20 bg-white rounded-[20px] flex items-center justify-center mb-6 border border-[#E8EDF4] shadow-sm relative z-10 transition-transform group-hover:scale-105 duration-500">
                  <Landmark className="w-9 h-9 text-[#0B1220]" />
                </div>
                
                <div className="relative z-10">
                  <p className="text-[11px] font-bold text-[#0B1220] tracking-[0.25em] mb-3 uppercase">Initialize Portfolio</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#101827] mb-3 tracking-tight">Access Institutional Capital</h3>
                  <p className="text-sm sm:text-[15px] text-[#718096] mb-8 max-w-sm mx-auto leading-relaxed">
                    Establish your institutional footprint by opening your first private vault account. 
                    Manage liquidity, track assets, and deploy capital instantly.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <QuickOpenAccount />
                    <button className="text-[11px] font-semibold text-[#718096] uppercase tracking-widest hover:text-[#101827] transition-colors flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669]" /> System Security Verified
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.accounts.slice(0, 4).map((account) => {
                  const nativeCode = normalizeCurrency(account.currency);
                  const convertedBal = convert(Number(account.balance || 0), nativeCode);
                  return (
                  <Link key={account.id} href="/dashboard/accounts"
                    className="group bg-white rounded-[20px] p-6 border border-[#E8EDF4] shadow-[var(--shadow-card)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] hover:-translate-y-1 transition-all duration-300 min-w-0">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#101827] group-hover:scale-105 transition-transform duration-300">
                        {getAccountIcon(account.account_type)}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E8EDF4] text-[10px] font-bold uppercase tracking-widest text-[#718096]">
                        {nativeCode}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-[#718096] uppercase tracking-[0.16em] mb-1.5 truncate">{account.account_name}</p>
                    <div className="text-[24px] font-bold text-[#101827] font-mono tracking-tight flex items-baseline gap-1.5">
                      <span className="text-sm text-[#718096]">{symbol}</span>
                      <AnimatedNumber value={convertedBal} />
                    </div>
                    {nativeCode !== currency && (
                      <p className="text-[11px] font-mono text-[#94A3B8] mt-1">
                        Held: {formatCurrencyAmount(Number(account.balance || 0), nativeCode)}
                      </p>
                    )}
                    <div className="mt-6 pt-4 border-t border-[#E8EDF4] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#94A3B8] font-mono tracking-tight uppercase truncate">{account.account_number}</span>
                      <div className="w-8 h-8 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#101827] group-hover:bg-[#0B1220] group-hover:text-white group-hover:border-[#0B1220] transition-colors duration-300 flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            )}
          </motion.section>

          <motion.div variants={item}>
            <CashflowChart data={last6Months} />
          </motion.div>

          <motion.div variants={item}>
            <PortfolioSnapshot 
              totalBalance={totalBalance}
              income={monthlyIncome}
              spending={monthlySpending}
              investments={totalInvestments}
              rewards={rewards}
            />
          </motion.div>
        </div>

        <div className="space-y-8 lg:space-y-12">
          <motion.div variants={item}>
            <SpendingChart transactions={data.transactions ?? []} accountCurrencies={accountCurrencyMap} />
          </motion.div>

          <motion.div variants={item} className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6 sm:p-7">
            <h2 className="text-[18px] font-semibold text-[#101827] tracking-tight mb-6">Vault Access</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <QuickActionTile label="Cards" iconType="cards" href="/dashboard/cards" isFrequent />
              <QuickActionTile label="Loans" iconType="loans" href="/dashboard/loans" />
              <QuickActionTile label="Payments" iconType="payments" href="/dashboard/bills" isFrequent />
              <QuickActionTile label="Security" iconType="security" href="/dashboard/security" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full-Width Institutional Global Ledger Stream */}
      <motion.div variants={item}>
        <GlobalLedgerStream
          transactions={data.transactions ?? []}
          accountCurrencies={accountCurrencyMap}
          accountNames={accountNameMap}
          limit={8}
          showFullHistoryLink
        />
      </motion.div>
    </motion.div>
  );
}
