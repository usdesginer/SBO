"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";

interface CashflowData {
  month: string;
  income: number;
  expense: number;
}

interface CashflowChartProps {
  data: CashflowData[];
}

export function CashflowChart({ data }: CashflowChartProps) {
  const { currency } = useCurrency();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[20px] border border-[#E8EDF4] p-6 sm:p-7 shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base sm:text-[18px] font-bold text-[#101827] tracking-tight font-heading">Cashflow Analysis</h2>
          <p className="text-xs text-[#718096] font-medium mt-0.5">Institutional Inflow vs Outflow ({currency})</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0B1220]" />
            <span className="text-[11px] font-semibold text-[#718096]">Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
            <span className="text-[11px] font-semibold text-[#718096]">Outflow</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ background: "#0f172a", border: "none", borderRadius: "16px", padding: "12px" }}
              itemStyle={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}
              labelStyle={{ color: "#64748b", fontSize: "9px", marginBottom: "4px", fontWeight: 900 }}
              formatter={(value: number) => [formatCurrency(value, currency, { maximumFractionDigits: 0 }), ""]}
            />
            <Bar 
              dataKey="income" 
              fill="#0f172a" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
              isAnimationActive={true}
              animationDuration={1500}
            />
            <Bar 
              dataKey="expense" 
              fill="#e2e8f0" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
