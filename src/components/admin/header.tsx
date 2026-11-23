"use client";

import { Bell, Search, ShieldCheck, ArrowUpRight, AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CommandPalette } from "@/components/ui/command-palette";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";

interface AdminHeaderProps {
  adminName: string | null;
}

interface AlertSummary {
  pendingApprovals: number;
  pendingKyc: number;
  recentTx: { id: string; description: string; status: string; created_at: string }[];
}

export function AdminHeader({ adminName }: AdminHeaderProps) {
  const firstName = adminName?.split(" ")[0] ?? "Admin";
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<AlertSummary>({
    pendingApprovals: 0,
    pendingKyc: 0,
    recentTx: [],
  });

  const fetchAlerts = useCallback(async () => {
    const supabase = createClient();
    const [approvalsRes, kycRes, txRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .in("category", ["adjustment_request", "transfer"]),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer")
        .eq("kyc_status", "pending"),
      supabase
        .from("transactions")
        .select("id, description, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    setAlerts({
      pendingApprovals: approvalsRes.count ?? 0,
      pendingKyc: kycRes.count ?? 0,
      recentTx: (txRes.data as AlertSummary["recentTx"]) || [],
    });
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useRealtimeTables(["transactions", "profiles", "accounts", "site_settings"], fetchAlerts);

  const totalAlerts = alerts.pendingApprovals + alerts.pendingKyc;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E8EDF4] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30">
      <div className="pl-12 lg:pl-0 flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[#0B1220] text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E85D65] flex-shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider truncate">
            Executive Console
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
          <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider">Realtime Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 relative">
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="hidden md:flex items-center justify-between gap-3 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-3.5 py-2 w-56 lg:w-64 hover:bg-white transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5 text-[#718096] group-hover:text-[#101827] transition-colors" />
            <span className="text-xs font-medium text-[#718096] group-hover:text-[#101827]">Search members...</span>
          </div>
          <div className="flex items-center gap-0.5 bg-white border border-[#E8EDF4] rounded-[6px] px-1.5 py-0.5">
            <span className="text-[9px] font-bold text-[#718096]">⌘</span>
            <span className="text-[9px] font-bold text-[#718096]">K</span>
          </div>
        </button>

        <button
          aria-label="Search members"
          onClick={() => setIsPaletteOpen(true)}
          className="md:hidden w-9 h-9 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#718096] hover:text-[#101827] transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            aria-label="Toggle real-time alerts"
            onClick={() => setShowAlerts((prev) => !prev)}
            className="relative w-9 h-9 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#718096] hover:text-[#101827] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#E85D65] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {totalAlerts}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#E8EDF4] rounded-[20px] shadow-[0_24px_64px_rgba(11,18,32,0.16)] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#E8EDF4] flex items-center justify-between bg-[#F8FAFC]">
                <span className="text-[10px] font-bold text-[#101827] uppercase tracking-widest">Live Alert Queue</span>
                <span className="text-[10px] font-mono font-bold text-[#059669]">REALTIME</span>
              </div>
              <div className="p-3 space-y-2 border-b border-[#E8EDF4]">
                <Link
                  href="/admin/approvals"
                  onClick={() => setShowAlerts(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] hover:border-[#D97706]/40 text-xs transition-colors"
                >
                  <span className="text-[#101827] font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                    Pending Approvals
                  </span>
                  <span className="font-mono font-bold text-[#D97706]">{alerts.pendingApprovals}</span>
                </Link>
                <Link
                  href="/admin/risk"
                  onClick={() => setShowAlerts(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] hover:border-[#2563EB]/40 text-xs transition-colors"
                >
                  <span className="text-[#101827] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#2563EB]" />
                    Pending KYC Reviews
                  </span>
                  <span className="font-mono font-bold text-[#2563EB]">{alerts.pendingKyc}</span>
                </Link>
              </div>
              <div className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
                <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider px-1">Latest Ledger Stream</p>
                {alerts.recentTx.map((tx) => (
                  <Link
                    key={tx.id}
                    href="/admin/transactions"
                    onClick={() => setShowAlerts(false)}
                    className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-[10px] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <p className="text-xs text-[#101827] font-medium truncate">{tx.description}</p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4]">
          <div className="w-7 h-7 rounded-full bg-[#0B1220] flex items-center justify-center text-white font-bold text-xs">
            {firstName[0]?.toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-[#101827] leading-none">{firstName}</p>
            <p className="text-[10px] font-semibold text-[#E85D65] mt-0.5">Executive</p>
          </div>
        </div>
      </div>
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </header>
  );
}
