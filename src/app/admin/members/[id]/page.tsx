import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  History,
  FileText,
  Zap,
  ArrowLeftRight,
  ShieldAlert,
  Snowflake,
  AlertCircle,
  Clock,
  UserCheck,
  Check,
  X
} from "lucide-react";
import { MemberActions } from "./member-actions";
import { AdjustBalance } from "./adjust-balance";
import {
  MemberAccountControls,
  MemberComplianceButtons,
} from "@/components/admin/member-operations-controls";
import { cn, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function KycBadge({ status }: { status: string }) {
  const config: Record<string, { style: string; icon: any }> = {
    approved: { 
      style: "bg-emerald-50 text-[#059669] border border-emerald-200/80", 
      icon: Check 
    },
    pending: { 
      style: "bg-amber-50 text-[#D97706] border border-amber-200/80", 
      icon: Clock 
    },
    rejected: { 
      style: "bg-red-50 text-[#DC2626] border border-red-200/80", 
      icon: X 
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

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#E8EDF4] last:border-0">
      <div className="w-8 h-8 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-[#718096]" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-[#101827]">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; mode?: string; type?: string }>;
}) {
  const { id } = await params;
  const { tab = "overview", mode } = await searchParams;
  const supabase = await createClient();

  let user = null;
  let adminProfile: { role: string } | null = null;
  let profile: any = null;
  let typedAccounts: any[] = [];
  let transactions: any[] = [];
  let typedCards: any[] = [];
  let typedAuditLogs: any[] = [];
  let connectionError = false;

  try {
    const { data: authData } = await supabase.auth.getUser();
    user = authData.user;
  } catch (err) {
    console.error("MemberDetailPage auth failed:", err);
    connectionError = true;
  }

  if (!user && !connectionError) redirect("/login");

  if (user) {
    try {
      const { data: adminProfileRaw } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      adminProfile = adminProfileRaw as { role: string } | null;
    } catch (err) {
      console.error("MemberDetailPage role check failed:", err);
      connectionError = true;
    }
  }

  if (!connectionError && (!adminProfile || !["admin", "supervisor", "executive"].includes(adminProfile.role))) {
    redirect("/dashboard");
  }

  if (!connectionError) {
    try {
      const [
        { data: profileData },
        { data: accounts },
        { data: txData },
        { data: cards },
        { data: auditLogs },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("accounts").select("*").eq("user_id", id).order("created_at"),
        supabase.from("transactions").select("*").eq("user_id", id).not("category", "eq", "system_audit").order("created_at", { ascending: false }).limit(25),
        supabase.from("cards").select("*").eq("user_id", id).order("created_at"),
        supabase.from("transactions").select("*").eq("user_id", id).eq("category", "system_audit").order("created_at", { ascending: false }).limit(25),
      ]);
      profile = profileData;
      typedAccounts = (accounts || []) as any[];
      transactions = (txData || []) as any[];
      typedCards = (cards || []) as any[];
      typedAuditLogs = (auditLogs || []) as any[];
    } catch (err) {
      console.error("MemberDetailPage data load failed:", err);
      connectionError = true;
    }
  }

  if (connectionError) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white border border-amber-200 rounded-[20px] shadow-[var(--shadow-card)] text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-[#D97706] mx-auto" />
        <h1 className="text-lg font-bold text-[#101827] tracking-tight">Temporary Database Connection Timeout</h1>
        <p className="text-sm text-[#718096]">
          Could not reach Supabase due to an upstream network timeout. Please refresh or retry in a moment.
        </p>
        <Link href="/admin/members" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#0B1220] text-xs font-bold text-white uppercase tracking-wider hover:bg-[#17243A]">
          <ArrowLeft className="w-4 h-4" /> Back to Member Registry
        </Link>
      </div>
    );
  }

  if (!profile) notFound();

  const totalBalance = typedAccounts.reduce((s, a) => a.account_type !== "credit" ? s + a.balance : s, 0) ?? 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "accounts", label: "Accounts", icon: Building2 },
    { id: "transactions", label: "Ledger", icon: History },
    { id: "cards", label: "Cards", icon: CreditCard },
    { id: "compliance", label: "Compliance", icon: ShieldCheck },
    { id: "operations", label: "Operations", icon: Zap },
    { id: "audit", label: "Audit Log", icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <Link href="/admin/members" className="inline-flex items-center gap-2 text-[#718096] hover:text-[#101827] transition-all text-xs font-bold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" /> Member Registry
      </Link>

      <div className="bg-[#0B1220] text-white border border-white/10 rounded-[20px] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xl">
        <div className="w-14 h-14 rounded-[14px] bg-[#E85D65] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
          {(profile as any).full_name?.[0] || (profile as any).email?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">{(profile as any).full_name ?? "—"}</h1>
            <KycBadge status={(profile as any).kyc_status} />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-white/15 text-white/80 bg-white/10">
              {(profile as any).role}
            </span>
          </div>
          <p className="text-sm text-white/60 font-medium">{(profile as any).email}</p>
        </div>
        <div className="sm:text-right">
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">{formatCurrency(totalBalance)}</div>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Aggregate Net Worth</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white border border-[#E8EDF4] p-1 rounded-[12px] overflow-x-auto no-scrollbar shadow-sm">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`?tab=${t.id}`}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0",
              tab === t.id ? "bg-[#0B1220] text-white" : "text-[#718096] hover:text-[#101827] hover:bg-[#F8FAFC]"
            )}
          >
            <t.icon className={cn("w-3.5 h-3.5", tab === t.id ? "text-[#E85D65]" : "")} />
            {t.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tab === "overview" && (
          <>
            <div className="space-y-6">
              <div className="bg-white border border-[#E8EDF4] rounded-[20px] p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-xs font-bold text-[#718096] uppercase tracking-widest mb-4">Institutional Profile</h2>
                <InfoRow icon={User} label="Full Name" value={(profile as any).full_name} />
                <InfoRow icon={Mail} label="Email Address" value={(profile as any).email} />
                <InfoRow icon={Phone} label="Verified Phone" value={(profile as any).phone} />
                <InfoRow icon={Calendar} label="Onboarding Date" value={new Date((profile as any).created_at).toLocaleDateString("en-IE")} />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
                <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#101827]">Consolidated Accounts</h2>
                  <span className="text-[11px] font-bold text-[#718096] uppercase">{typedAccounts.length || 0} Entities</span>
                </div>
                <div className="divide-y divide-[#E8EDF4]">
                  {typedAccounts.map(a => (
                    <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                      <div>
                        <p className="text-sm font-bold text-[#101827]">{a.account_name}</p>
                        <p className="text-xs font-mono text-[#718096]">{a.account_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#101827] font-mono tabular-nums">{formatCurrency(a.balance, a.currency)}</p>
                        <span className="text-[10px] font-bold uppercase text-[#059669]">{a.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "operations" && (
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {mode === "adjust" ? (
                  <AdjustBalance 
                    memberId={(profile as any).id} 
                    memberName={(profile as any).full_name || (profile as any).email || 'Member'}
                    accounts={typedAccounts} 
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
                      <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC]">
                        <h2 className="text-sm font-bold text-[#101827] flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-[#E85D65]" /> Banking Operations: Money Movement
                        </h2>
                      </div>
                      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href={`?tab=operations&mode=adjust&type=credit`} className="group p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] hover:border-[#059669]/50 hover:bg-white transition-all flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[10px] bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] group-hover:scale-105 transition-transform">
                            <ArrowDownLeft className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-[#101827] uppercase tracking-tight">Credit Account</p>
                            <p className="text-xs text-[#718096]">Post manual credit adjustment</p>
                          </div>
                        </Link>
                        <Link href={`?tab=operations&mode=adjust&type=debit`} className="group p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] hover:border-[#DC2626]/50 hover:bg-white transition-all flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[10px] bg-red-50 border border-red-200 flex items-center justify-center text-[#DC2626] group-hover:scale-105 transition-transform">
                            <ArrowUpRight className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-[#101827] uppercase tracking-tight">Debit Account</p>
                            <p className="text-xs text-[#718096]">Post manual debit adjustment</p>
                          </div>
                        </Link>
                        <Link href={`?tab=operations&mode=adjust&type=credit`} className="group p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] hover:border-[#0B1220] hover:bg-white transition-all flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E8EDF4] flex items-center justify-center text-[#0B1220] group-hover:scale-105 transition-transform">
                            <ArrowLeftRight className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-[#101827] uppercase tracking-tight">Manual Adjustment</p>
                            <p className="text-xs text-[#718096]">Create credit or debit request</p>
                          </div>
                        </Link>
                        <Link href="/admin/operations/reverse" className="group p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] hover:border-[#D97706]/50 hover:bg-white transition-all flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[10px] bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] group-hover:scale-105 transition-transform">
                            <History className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-[#101827] uppercase tracking-tight">Reverse Transaction</p>
                            <p className="text-xs text-[#718096]">Initiate reversal protocol</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
                      <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC]">
                        <h2 className="text-sm font-bold text-[#101827] flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-[#2563EB]" /> Banking Operations: Account Controls
                        </h2>
                      </div>
                      <MemberAccountControls accounts={typedAccounts} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
                  <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC]">
                    <h2 className="text-xs font-bold text-[#101827] uppercase tracking-wider">Compliance</h2>
                  </div>
                  <MemberComplianceButtons memberId={(profile as any).id} />
                </div>

                <div className="bg-white border border-[#E8EDF4] rounded-[20px] p-6 shadow-[var(--shadow-card)]">
                  <h2 className="text-xs font-bold text-[#101827] uppercase tracking-wider mb-4">Institutional Protocol</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-[#E85D65] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#718096] leading-relaxed">
                        All financial events are logged under <span className="font-semibold text-[#101827]">Dual Control</span>. A secondary checker must authorize ledger movements.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#718096] leading-relaxed">
                        Member Onboarded:<br />
                        <span className="text-[#101827] font-mono">
                          {new Date((profile as any).created_at).toLocaleString("en-IE")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "transactions" && (
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC]">
                <h2 className="text-sm font-bold text-[#101827]">System Ledger</h2>
              </div>
              <div className="divide-y divide-[#E8EDF4]">
                {(transactions as any[])?.map(tx => (
                  <div key={tx.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#F8FAFC] transition-colors">
                    <div className={cn(
                      "w-10 h-10 rounded-[10px] border flex items-center justify-center flex-shrink-0",
                      tx.transaction_type === "credit" ? "bg-emerald-50 text-[#059669] border-emerald-200" : "bg-red-50 text-[#DC555D] border-red-200"
                    )}>
                      {tx.transaction_type === "credit" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#101827] truncate">{tx.description}</p>
                      <p className="text-xs text-[#718096]">{new Date(tx.created_at).toLocaleString("en-IE")}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold font-mono tabular-nums", tx.transaction_type === "credit" ? "text-[#059669]" : "text-[#DC555D]")}>
                        {tx.transaction_type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </p>
                      <span className="text-[10px] font-bold uppercase text-[#718096]">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "accounts" && (
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#101827]">Member Vault Accounts</h2>
                <span className="text-xs font-mono text-[#718096]">{typedAccounts.length} Active/Historical</span>
              </div>
              <div className="divide-y divide-[#E8EDF4]">
                {typedAccounts.length === 0 ? (
                  <p className="p-8 text-center text-sm text-[#718096]">No accounts linked to this member.</p>
                ) : (
                  typedAccounts.map((a) => (
                    <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F8FAFC]">
                      <div>
                        <p className="text-sm font-bold text-[#101827]">{a.account_name}</p>
                        <p className="text-xs font-mono text-[#718096]">{a.account_number} · {a.account_type.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono tabular-nums text-[#101827]">{formatCurrency(a.balance, a.currency)}</p>
                        <span className="text-[10px] uppercase font-bold text-[#E85D65]">{a.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "cards" && (
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#101827]">Issued Cards</h2>
                <span className="text-xs font-mono text-[#718096]">{typedCards.length} Cards</span>
              </div>
              <div className="divide-y divide-[#E8EDF4]">
                {typedCards.length === 0 ? (
                  <p className="p-8 text-center text-sm text-[#718096]">No payment cards issued to this member.</p>
                ) : (
                  typedCards.map((c) => (
                    <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F8FAFC]">
                      <div>
                        <p className="text-sm font-bold text-[#101827]">{c.card_name}</p>
                        <p className="text-xs font-mono text-[#718096]">{c.card_number_masked} · Exp {c.expiry_month}/{c.expiry_year}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono tabular-nums font-bold text-[#101827]">{formatCurrency(c.daily_limit || 0)}/day</p>
                        <span className="text-[10px] uppercase font-bold text-[#059669]">{c.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "audit" && (
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
              <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC]">
                <h2 className="text-sm font-bold text-[#101827]">Member Security &amp; Audit Log</h2>
              </div>
              <div className="divide-y divide-[#E8EDF4]">
                {typedAuditLogs.length === 0 ? (
                  <p className="p-8 text-center text-sm text-[#718096]">No security audit events recorded for this member.</p>
                ) : (
                  typedAuditLogs.map((log) => (
                    <div key={log.id} className="px-6 py-4 space-y-1 hover:bg-[#F8FAFC]">
                      <div className="flex items-center justify-between text-xs font-mono text-[#718096]">
                        <span className="font-semibold text-[#101827]">{log.reference}</span>
                        <span>{new Date(log.created_at).toLocaleString("en-IE")}</span>
                      </div>
                      <p className="text-xs font-mono text-[#718096]">{log.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "compliance" && (
          <div className="lg:col-span-3">
            <MemberActions
              memberId={(profile as any).id}
              currentKyc={(profile as any).kyc_status as "pending" | "approved" | "rejected"}
              currentRole={(profile as any).role as "customer" | "admin" | "supervisor" | "executive"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
