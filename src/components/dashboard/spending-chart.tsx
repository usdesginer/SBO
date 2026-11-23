"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Database } from "@/lib/supabase/types";
import { motion } from "framer-motion";
import { Activity, BarChart3, HelpCircle, ChevronRight } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";
import { formatCurrency } from "@/lib/utils";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f59e0b",
  shopping: "#8b5cf6",
  utilities: "#06b6d4",
  transport: "#3b82f6",
  health: "#10b981",
  entertainment: "#ec4899",
  income: "#22c55e",
  transfer: "#64748b",
  general: "#94a3b8",
};

interface SpendingChartProps {
  transactions: Transaction[];
  accountCurrencies?: Record<string, string>;
}

export function SpendingChart({ transactions, accountCurrencies = {} }: SpendingChartProps) {
  const { currency, convert } = useCurrency();
  const debits = transactions.filter((t) => t.transaction_type === "debit");
  const grouped = debits.reduce<Record<string, number>>((acc, tx) => {
    const sourceCurrency = accountCurrencies[tx.account_id] || "EUR";
    acc[tx.category] = (acc[tx.category] ?? 0) + convert(tx.amount, sourceCurrency);
    return acc;
  }, {});

  const data = Object.entries(grouped).map(([name, value]) => ({ name, value: Math.round(value) }));

  if (data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-[20px] border border-[#E8EDF4] p-6 sm:p-7 shadow-[var(--shadow-card)] text-center relative overflow-hidden group"
      >
        <div className="relative z-10 flex flex-col items-center py-8">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-[16px] flex items-center justify-center mb-6 border border-[#E8EDF4] transition-transform group-hover:scale-105 duration-300">
            <BarChart3 className="w-7 h-7 text-[#94A3B8]" />
          </div>
          
          <h2 className="text-base sm:text-[18px] font-bold text-[#101827] mb-2 font-heading">Asset Intelligence</h2>
          <p className="text-[13px] text-[#718096] max-w-[230px] mx-auto leading-relaxed mb-6">
            Your spending insights and asset allocation will appear here after your first transaction.
          </p>
          
          <button className="flex items-center gap-1.5 px-5 py-2.5 bg-[#F8FAFC] hover:bg-slate-100 rounded-[12px] text-xs font-semibold text-[#101827] border border-[#E8EDF4] transition-all">
            Learn More <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {/* Visual Background Decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <div className="w-64 h-64 border-[20px] border-brand-900 rounded-full" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6 sm:p-7"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base sm:text-[18px] font-bold text-[#101827] font-heading">Asset Allocation</h2>
        <HelpCircle className="w-4 h-4 text-[#94A3B8] cursor-help hover:text-[#718096] transition-colors" />
      </div>
      
      <div className="h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={55} 
              outerRadius={80} 
              paddingAngle={6} 
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] ?? "#64748b"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value, currency, { maximumFractionDigits: 0 }), ""]}
              contentStyle={{ background: "#0f172a", border: "none", borderRadius: "16px", color: "#fff", fontSize: "11px", padding: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Visual Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</span>
          <span className="text-xs font-black text-brand-950 uppercase tracking-tight">Diverse</span>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 justify-center">
        {data.slice(0, 4).map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] }} />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{entry.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
