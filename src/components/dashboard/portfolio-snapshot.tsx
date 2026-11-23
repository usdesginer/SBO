"use client";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { TrendingUp, TrendingDown, Target, Wallet, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

interface PortfolioSnapshotProps {
  totalBalance: number;
  income: number;
  spending: number;
  investments: number;
  rewards: number;
}

export function PortfolioSnapshot({ totalBalance, income, spending, investments, rewards }: PortfolioSnapshotProps) {
  const { currency } = useCurrency();

  const metrics = [
    { label: `Institutional Portfolio – ${currency}`, value: totalBalance, icon: Wallet, color: "text-[#101827]" },
    { label: `Monthly Income – ${currency}`, value: income, icon: TrendingUp, color: "text-[#059669]" },
    { label: `Monthly Spending – ${currency}`, value: spending, icon: TrendingDown, color: "text-[#DC555D]" },
    { label: "Investments", value: investments, icon: Target, color: "text-[#17243A]" },
    { label: "Rewards", value: rewards, icon: Award, color: "text-[#D97706]", isPoints: true },
  ];

  return (
    <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 divide-y sm:divide-y-0 divide-[#E8EDF4]">
        {metrics.map((m, idx) => (
          <div 
            key={m.label} 
            className={cn(
              "p-6 hover:bg-[#F8FAFC] transition-colors group flex flex-col justify-center min-w-0 border-[#E8EDF4]",
              idx % 2 !== 0 ? "sm:border-l" : "",
              idx >= 2 ? "sm:border-t md:border-t" : "",
              idx >= 3 ? "md:border-t" : "md:border-t-0",
              idx % 3 !== 0 ? "md:border-l" : "md:border-l-0",
              "2xl:border-t-0 2xl:border-l 2xl:first:border-l-0",
              idx === metrics.length - 1 ? "sm:col-span-2 md:col-span-1" : ""
            )}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <m.icon className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#718096] transition-colors flex-shrink-0" />
              <p className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider whitespace-nowrap">{m.label}</p>
            </div>

            <div className="flex flex-col">
              {!m.isPoints && (
                <span className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider mb-1">
                  {currency}
                </span>
              )}
              <div className={cn("leading-tight", m.color)}>
                {m.isPoints ? (
                  <div className="flex items-baseline gap-1 font-mono tabular-nums tracking-tight">
                    <span className="text-2xl sm:text-[26px] font-bold leading-none">{m.value.toLocaleString()}</span>
                    <span className="text-sm font-medium opacity-50 leading-none">pts</span>
                  </div>
                ) : (
                  <AnimatedNumber value={m.value} size="xl" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
