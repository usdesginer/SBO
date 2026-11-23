"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Database } from "@/lib/supabase/types";
import { useCurrency } from "@/components/currency-provider";
import { formatCurrency } from "@/lib/utils";

type Investment = Database["public"]["Tables"]["investments"]["Row"];

const COLORS = ["#0B1220", "#17243A", "#E85D65", "#059669", "#718096"];

interface PortfolioChartProps {
  investments: Investment[];
}

export function PortfolioChart({ investments }: PortfolioChartProps) {
  const { currency, convert } = useCurrency();
  const data = investments.map((inv) => ({
    name: inv.asset_symbol,
    value: Math.round(convert(inv.current_value, "EUR")),
  }));

  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [formatCurrency(v, currency, { maximumFractionDigits: 0 }), ""]}
            contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
