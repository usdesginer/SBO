"use client";

import { useState } from "react";
import { Plus, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickOpenAccount() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleOpenAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "checking",
          name: "Pentagon Everyday Checking"
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to open account:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-[#059669] font-semibold py-2.5 px-6 rounded-[12px] bg-emerald-50 border border-emerald-200">
        <CheckCircle className="w-4 h-4" />
        Account Opened!
      </div>
    );
  }

  return (
    <button
      onClick={handleOpenAccount}
      disabled={loading}
      className="flex items-center justify-center gap-2 py-3 px-6 bg-[#0B1220] hover:bg-[#17243A] disabled:opacity-50 text-white rounded-[12px] font-semibold text-sm transition-all shadow-sm"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Opening Account...
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          Open Everyday Checking
        </>
      )}
    </button>
  );
}
