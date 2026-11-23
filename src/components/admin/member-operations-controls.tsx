"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Snowflake,
  Zap,
  ShieldAlert,
  AlertCircle,
  UserCheck,
  Loader2,
  Check,
} from "lucide-react";

interface AccountSummary {
  id: string;
  account_name: string;
  account_number: string;
  status: string;
}

export function MemberAccountControls({
  accounts,
}: {
  accounts: AccountSummary[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(accounts[0]?.id || "");
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleStatus = async (status: "active" | "frozen" | "closed") => {
    if (!selectedId) return;
    setLoadingStatus(status);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/update-account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: selectedId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setFeedback(`Account updated to "${status}".`);
      router.refresh();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Failed to update account.");
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {accounts.length > 0 && (
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-xs font-semibold text-[#101827] outline-none focus:ring-2 focus:ring-[#0B1220]/10"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.account_name} ({acc.account_number}) — {acc.status.toUpperCase()}
            </option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          disabled={!selectedId || loadingStatus !== null}
          onClick={() => handleStatus("frozen")}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] hover:bg-sky-50 hover:border-sky-200 transition-all group disabled:opacity-40"
        >
          {loadingStatus === "frozen" ? (
            <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
          ) : (
            <Snowflake className="w-6 h-6 text-[#2563EB] group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] font-bold text-[#101827] uppercase tracking-wider">Freeze</span>
        </button>
        <button
          type="button"
          disabled={!selectedId || loadingStatus !== null}
          onClick={() => handleStatus("active")}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] hover:bg-emerald-50 hover:border-emerald-200 transition-all group disabled:opacity-40"
        >
          {loadingStatus === "active" ? (
            <Loader2 className="w-6 h-6 text-[#059669] animate-spin" />
          ) : (
            <Zap className="w-6 h-6 text-[#059669] group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] font-bold text-[#101827] uppercase tracking-wider">Unfreeze</span>
        </button>
        <button
          type="button"
          disabled={!selectedId || loadingStatus !== null}
          onClick={() => handleStatus("closed")}
          className="flex flex-col items-center justify-center gap-2 p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] hover:bg-red-50 hover:border-red-200 transition-all group disabled:opacity-40"
        >
          {loadingStatus === "closed" ? (
            <Loader2 className="w-6 h-6 text-[#DC2626] animate-spin" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-[#DC2626] group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] font-bold text-[#101827] uppercase tracking-wider">Suspend</span>
        </button>
      </div>

      {feedback && (
        <p className="text-xs font-semibold text-[#059669] flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" /> {feedback}
        </p>
      )}
    </div>
  );
}

export function MemberComplianceButtons({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const setKyc = async (kycStatus: "pending" | "rejected") => {
    setLoadingAction(kycStatus);
    setFeedback(null);
    const res = await fetch("/api/admin/update-member", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: memberId, kycStatus }),
    });
    setLoadingAction(null);
    if (res.ok) {
      setFeedback(`KYC updated to "${kycStatus}".`);
      router.refresh();
    }
  };

  return (
    <div className="p-6 space-y-3">
      <button
        type="button"
        disabled={loadingAction !== null}
        onClick={() => setKyc("rejected")}
        className="w-full py-3 bg-red-50 border border-red-200 rounded-[12px] text-xs font-bold text-[#DC2626] uppercase hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loadingAction === "rejected" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <AlertCircle className="w-3.5 h-3.5" />
        )}
        Flag Customer (Risk Alert)
      </button>
      <button
        type="button"
        disabled={loadingAction !== null}
        onClick={() => setKyc("pending")}
        className="w-full py-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] text-xs font-bold text-[#101827] uppercase hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loadingAction === "pending" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <UserCheck className="w-3.5 h-3.5" />
        )}
        Enhanced KYC Review
      </button>
      <Link
        href="/admin/risk"
        className="block text-center text-[11px] font-bold text-[#E85D65] hover:underline uppercase tracking-wider pt-1"
      >
        Open Risk Queue →
      </Link>
      {feedback && (
        <p className="text-xs font-semibold text-[#059669] text-center">{feedback}</p>
      )}
    </div>
  );
}
