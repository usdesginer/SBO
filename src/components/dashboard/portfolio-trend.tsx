"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { useCurrency } from "@/components/currency-provider";
import { formatCurrency } from "@/lib/utils";

interface TrendData {
  value: number;
}

interface PortfolioTrendProps {
  data: TrendData[];
}

export function PortfolioTrend({ data }: PortfolioTrendProps) {
  const { currency } = useCurrency();
  const chartData = data.length > 0 ? data : [{ value: 0 }, { value: 0 }];

  return (
    <div className="h-24 w-full opacity-50 group-hover:opacity-100 transition-opacity duration-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E85D65" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#E85D65" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#0B1220] border border-white/15 px-3 py-1.5 rounded-[10px] shadow-2xl">
                    <p className="text-[11px] font-mono tabular-nums font-bold text-white">
                      {formatCurrency(Number(payload[0].value ?? 0), currency)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#E85D65"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#trendGradient)"
            animationDuration={2000}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}