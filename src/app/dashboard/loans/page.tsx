import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Calendar, DollarSign, TrendingDown, CreditCard, ChevronRight, Landmark, ShieldCheck } from "lucide-react";
import { DisplayMoney } from "@/components/currency/display-money";

const LOAN_ICONS: Record<string, string> = {
  mortgage: "🏠", vehicle: "🚗", personal: "👤", business: "💼", education: "🎓"
};

export default async function LoansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: loans } = await supabase.from("loans").select("*").eq("user_id", user.id).eq("status", "active");

  const totalLoanBalance = loans?.reduce((s, l) => s + l.balance, 0) ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101827] tracking-tight">Institutional Credit</h1>
          <p className="text-[#718096] text-xs font-semibold uppercase tracking-widest mt-1">Manage Loans &amp; Financing</p>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 bg-[#0B1220] hover:bg-[#17243A] text-white text-[11px] font-bold uppercase tracking-widest rounded-[12px] transition-all shadow-sm">
          Apply for Credit
        </button>
      </div>

      <div className="premium-glass rounded-[20px] p-6 sm:p-8 text-white relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.25em] mb-3">Total Outstanding Liability</p>
          <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight break-words">
            <DisplayMoney amount={totalLoanBalance} fromCurrency="EUR" />
          </p>
          <div className="flex items-center gap-4 mt-5">
            <p className="text-white/65 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {loans?.length ?? 0} Active Facilities
            </p>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32" />
      </div>

      <div className="space-y-6">
        {(!loans || loans.length === 0) ? (
          <div className="bg-white rounded-[20px] p-8 sm:p-14 text-center border border-[#E8EDF4] shadow-[var(--shadow-card)] group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F8FAFC] rounded-full -mr-32 -mt-32" />
            
            <div className="w-20 h-20 bg-white rounded-[20px] flex items-center justify-center mx-auto mb-6 border border-[#E8EDF4] shadow-sm transition-transform group-hover:scale-105 duration-500">
              <Landmark className="w-9 h-9 text-[#0B1220]" />
            </div>
            
            <h3 className="text-[11px] font-bold text-[#101827] tracking-[0.25em] mb-3 uppercase">No Active Facilities</h3>
            <p className="text-[15px] text-[#718096] mb-8 max-w-sm mx-auto leading-relaxed">
              You currently have no active loan facilities with Pentagon Finances. 
              Institutional credit provides flexible liquidity for your personal and business needs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-3.5 bg-[#0B1220] text-white rounded-[12px] text-[11px] font-bold uppercase tracking-widest hover:bg-[#17243A] transition-all shadow-sm active:scale-95">
                Explore Financing Options
              </button>
              <button className="px-8 py-3.5 bg-white text-[#101827] border border-[#E8EDF4] rounded-[12px] text-[11px] font-bold uppercase tracking-widest hover:bg-[#F8FAFC] transition-all flex items-center gap-2">
                Calculate Rates <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          loans.map((loan) => {
            const paidPct = ((loan.principal - loan.balance) / loan.principal) * 100;
            const daysUntilPayment = Math.ceil((new Date(loan.next_payment_date).getTime() - Date.now()) / 86400000);
            return (
              <div key={loan.id} className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden transition-all duration-300">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-2xl">
                        {LOAN_ICONS[loan.loan_type]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#101827] tracking-tight">{loan.loan_name}</h3>
                        <p className="text-[11px] text-[#718096] font-bold uppercase tracking-[0.16em] mt-1">
                          {loan.loan_type} Entity · {(loan.interest_rate * 100).toFixed(2)}% APR
                        </p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200/80 text-[10px] font-bold uppercase tracking-widest">
                      Active Facility
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { icon: TrendingDown, label: "Principal Owed", value: <DisplayMoney amount={loan.balance} fromCurrency="EUR" />, color: "text-[#101827]" },
                      { icon: DollarSign, label: "Monthly Repay", value: <DisplayMoney amount={loan.monthly_payment} fromCurrency="EUR" />, color: "text-[#101827]" },
                      { icon: CreditCard, label: "Original Principal", value: <DisplayMoney amount={loan.principal} fromCurrency="EUR" />, color: "text-[#718096]" },
                      { icon: Calendar, label: "Payment Date", value: daysUntilPayment > 0 ? `In ${daysUntilPayment} Days` : "Due Today", color: daysUntilPayment <= 5 ? "text-[#E85D65]" : "text-[#101827]" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <p className="text-[10px] text-[#718096] font-bold uppercase tracking-widest">{label}</p>
                        </div>
                        <p className={`text-base font-bold font-mono tabular-nums tracking-tight ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-8 p-5 bg-[#F8FAFC] rounded-[16px] border border-[#E8EDF4]">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                      <span className="text-[#059669]">{paidPct.toFixed(1)}% Amortized</span>
                      <span className="text-[#718096] font-mono tabular-nums">
                        <DisplayMoney amount={loan.principal - loan.balance} fromCurrency="EUR" /> / <DisplayMoney amount={loan.principal} fromCurrency="EUR" /> Paid
                      </span>
                    </div>
                    <div className="h-2 bg-[#E8EDF4] rounded-full overflow-hidden">
                      <div className="h-full bg-[#059669] rounded-full transition-all duration-1000" style={{ width: `${paidPct}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 py-3.5 bg-[#0B1220] hover:bg-[#17243A] text-white text-[11px] font-bold uppercase tracking-widest rounded-[12px] transition-all shadow-sm active:scale-[0.98]">
                      Post Payment
                    </button>
                    <button className="flex-1 py-3.5 bg-white text-[#101827] border border-[#E8EDF4] rounded-[12px] text-[11px] font-bold uppercase tracking-widest hover:bg-[#F8FAFC] transition-all active:scale-[0.98]">
                      View Amortization Schedule
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
