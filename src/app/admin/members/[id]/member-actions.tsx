"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Loader2, Check, ShieldAlert } from "lucide-react";

interface MemberActionsProps {
  memberId: string;
  currentKyc: "pending" | "approved" | "rejected";
  currentRole: "customer" | "admin" | "supervisor" | "executive";
}

export function MemberActions({
  memberId,
  currentKyc,
  currentRole,
}: MemberActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update = async (payload: Record<string, string>, label: string) => {
    setLoading(label);
    setSuccess(null);
    const res = await fetch("/api/admin/update-member", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: memberId, ...payload }),
    });
    setLoading(null);
    if (res.ok) {
      setSuccess(label);
      setTimeout(() => {
        setSuccess(null);
        router.refresh();
      }, 1200);
    }
  };

  const kycActions: {
    label: string;
    status: "pending" | "approved" | "rejected";
    icon: React.ElementType;
    style: string;
    disabled: boolean;
  }[] = [
    {
      label: "Approve KYC",
      status: "approved",
      icon: CheckCircle2,
      style: "text-[#059669] bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      disabled: currentKyc === "approved",
    },
    {
      label: "Set Pending",
      status: "pending",
      icon: Clock,
      style: "text-[#D97706] bg-amber-50 hover:bg-amber-100 border-amber-200",
      disabled: currentKyc === "pending",
    },
    {
      label: "Reject KYC",
      status: "rejected",
      icon: XCircle,
      style: "text-[#DC2626] bg-red-50 hover:bg-red-100 border-red-200",
      disabled: currentKyc === "rejected",
    },
  ];

  return (
    <div className="bg-white border border-[#E8EDF4] rounded-[20px] p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-xs font-bold text-[#101827] uppercase tracking-wider mb-4 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#E85D65]" /> Institutional Access
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider mb-2">Compliance Status</p>
          {kycActions.map((action) => {
            const Icon = action.icon;
            const isLoading = loading === action.label;
            const isDone = success === action.label;
            return (
              <button
                key={action.label}
                onClick={() => update({ kycStatus: action.status }, action.label)}
                disabled={action.disabled || !!loading}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-[12px] border text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${action.style}`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isDone ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                {action.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider mb-2">Institutional Role</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { r: "customer", label: "Standard Client", icon: Clock },
              { r: "admin", label: "Banking Admin", icon: ShieldCheck },
              { r: "supervisor", label: "Financial Supervisor", icon: ShieldAlert },
              { r: "executive", label: "Managing Executive", icon: ShieldCheck },
            ].map((role) => (
              <button
                key={role.r}
                onClick={() => update({ role: role.r }, `set-${role.r}`)}
                disabled={currentRole === role.r || !!loading}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-[12px] border text-xs font-bold uppercase tracking-wider transition-all ${
                  currentRole === role.r 
                    ? "bg-[#0B1220] border-[#0B1220] text-white" 
                    : "border-[#E8EDF4] bg-[#F8FAFC] text-[#718096] hover:bg-white hover:text-[#101827]"
                }`}
              >
                {loading === `set-${role.r}` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : success === `set-${role.r}` ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <role.icon className="w-3.5 h-3.5" />
                )}
                {role.label}
                {currentRole === role.r && <span className="ml-auto text-[9px] text-[#E85D65]">ACTIVE</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}