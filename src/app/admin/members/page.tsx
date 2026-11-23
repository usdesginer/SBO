"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import Link from "next/link";
import {
  Search,
  UserPlus,
  ChevronRight,
  Filter,
  Users,
  Check,
  X,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "customer" | "admin" | "supervisor" | "executive";
  kyc_status: "pending" | "approved" | "rejected";
  created_at: string;
  account_count?: number;
};

const KYC_FILTERS = ["all", "pending", "approved", "rejected"] as const;

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
    <span
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider transition-all", style)}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function AdminMembersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState<(typeof KYC_FILTERS)[number]>("all");

  const fetchProfiles = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (kycFilter !== "all") {
      query = query.eq("kyc_status", kycFilter);
    }

    const { data } = await query;

    // Fetch account counts
    if (data && data.length > 0) {
      const { data: accounts } = await supabase
        .from("accounts")
        .select("user_id");

      const countMap: Record<string, number> = {};
      // Casting to any[] to avoid 'never' inference error during build
      (accounts as any[] | null)?.forEach((a) => {
        countMap[a.user_id] = (countMap[a.user_id] ?? 0) + 1;
      });

      setProfiles(
        (data as Profile[]).map((p) => ({ ...p, account_count: countMap[p.id] ?? 0 }))
      );
    } else {
      setProfiles([]);
    }
    setLoading(false);
  }, [kycFilter]);

  useEffect(() => {
    fetchProfiles(false);
  }, [fetchProfiles]);

  useRealtimeTables(["profiles", "accounts"], () => {
    fetchProfiles(true);
  });

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: profiles.length,
    pending: profiles.filter((p) => p.kyc_status === "pending").length,
    approved: profiles.filter((p) => p.kyc_status === "approved").length,
    rejected: profiles.filter((p) => p.kyc_status === "rejected").length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">Member Registry</h1>
          <p className="text-[#718096] text-xs mt-1 font-medium">
            {profiles.length} registered customer{profiles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/members/new"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B1220] hover:bg-[#17243A] text-white rounded-[12px] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4 text-[#E85D65]" />
          Register Member
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#E8EDF4] rounded-[20px] p-4 shadow-[var(--shadow-card)] flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex items-center gap-2.5 flex-1 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-3.5 py-2">
          <Search className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="bg-transparent text-sm text-[#101827] placeholder-[#94A3B8] outline-none flex-1 min-w-0"
          />
        </div>

        {/* KYC filter tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] p-1 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-[#718096] ml-2" />
          {KYC_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setKycFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all capitalize",
                kycFilter === f
                  ? "bg-[#0B1220] text-white"
                  : "text-[#718096] hover:text-[#101827]"
              )}
            >
              {f}{" "}
              <span className="opacity-65 font-mono">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-[#718096]">
              <div className="w-8 h-8 border-2 border-[#E8EDF4] border-t-[#0B1220] rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading members...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10 text-[#94A3B8]" />
            <p className="text-[#718096] text-sm">
              {search ? "No members match your search" : "No members yet"}
            </p>
            {!search && (
              <Link
                href="/admin/members/new"
                className="text-[#E85D65] text-sm font-semibold hover:underline transition-colors"
              >
                Register your first member →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E8EDF4]">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-wider">
                    Member
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-wider hidden md:table-cell">
                    Contact
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-wider">
                    KYC
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-wider hidden lg:table-cell">
                    Accounts
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[#718096] uppercase tracking-wider hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4]">
                {filtered.map((p) => {
                  const initials = p.full_name
                    ? p.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : p.email?.[0]?.toUpperCase() ?? "?";
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[10px] bg-[#0B1220] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#101827]">
                              {p.full_name ?? "—"}
                            </p>
                            <p className="text-xs text-[#718096] md:hidden">
                              {p.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-sm font-medium text-[#101827]">{p.email}</p>
                        <p className="text-xs text-[#718096] font-mono">{p.phone ?? "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <KycBadge status={p.kyc_status} />
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm font-mono font-bold text-[#101827]">
                          {p.account_count ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs font-medium text-[#718096]">
                          {new Date(p.created_at).toLocaleDateString("en-IE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/members/${p.id}?tab=operations&mode=adjust`}
                            className="text-[11px] font-bold uppercase tracking-wider text-[#E85D65] hover:text-[#DC555D] transition-colors"
                          >
                            Operate
                          </Link>
                          <Link
                            href={`/admin/members/${p.id}`}
                            className="flex items-center gap-1 text-xs font-semibold text-[#718096] hover:text-[#101827] transition-colors"
                          >
                            View
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
