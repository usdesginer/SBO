import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { DisplayMoney, DisplayCurrencyCode } from "@/components/currency/display-money";

const ASSET_TYPE_LABELS: Record<string, string> = {
  stock: "Stock", etf: "ETF", mutual_fund: "Mutual Fund", bond: "Bond", crypto: "Crypto"
};

export default async function InvestmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: investments } = await supabase.from("investments").select("*").eq("user_id", user.id);

  const totalValue = investments?.reduce((s, i) => s + i.current_value, 0) ?? 0;
  const totalGainLoss = investments?.reduce((s, i) => s + i.gain_loss, 0) ?? 0;
  const gainPct = totalValue > 0 ? ((totalGainLoss / (totalValue - totalGainLoss)) * 100).toFixed(2) : "0.00";
  const isPositive = totalGainLoss >= 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#101827] tracking-tight">Investment Portfolio – <DisplayCurrencyCode /></h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="premium-glass rounded-[20px] p-6 sm:p-7 text-white col-span-1 md:col-span-2">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1.5">Total Portfolio Value</p>
          <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums mb-2 break-words">
            <DisplayMoney amount={totalValue} fromCurrency="EUR" />
          </p>
          <div className={`flex items-center gap-2 text-sm font-medium ${isPositive ? "text-emerald-400" : "text-[#E85D65]"}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-mono tabular-nums">
              <DisplayMoney amount={totalGainLoss} fromCurrency="EUR" sign={isPositive ? "+" : ""} /> ({gainPct}%) all time
            </span>
          </div>
        </div>
        <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6">
          <div className="flex items-center gap-2 text-[#718096] mb-3">
            <PieChart className="w-4 h-4" />
            <span className="text-sm font-semibold">Allocation</span>
          </div>
          {investments && <PortfolioChart investments={investments} />}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-6 border-b border-[#E8EDF4]">
          <h2 className="text-base font-bold text-[#101827]">Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E8EDF4]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">Asset</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">Shares</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">Price</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">Value</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {(investments ?? []).map((inv) => {
                const isGain = (inv.gain_loss ?? 0) >= 0;
                return (
                  <tr key={inv.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center font-bold text-[#101827] text-xs font-mono">
                          {inv.asset_symbol.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#101827]">{inv.asset_name}</p>
                          <p className="text-xs text-[#718096]">{inv.asset_symbol} · {ASSET_TYPE_LABELS[inv.asset_type]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono tabular-nums text-[#718096]">{inv.shares.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono tabular-nums text-[#718096]">
                      <DisplayMoney amount={inv.current_price} fromCurrency="EUR" />
                    </td>
                    <td className="px-6 py-4 text-right font-mono tabular-nums font-semibold text-[#101827]">
                      <DisplayMoney amount={inv.current_value} fromCurrency="EUR" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono tabular-nums font-semibold flex items-center gap-1 justify-end ${isGain ? "text-[#059669]" : "text-[#DC555D]"}`}>
                        {isGain ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <DisplayMoney amount={inv.gain_loss ?? 0} fromCurrency="EUR" sign={isGain ? "+" : ""} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
