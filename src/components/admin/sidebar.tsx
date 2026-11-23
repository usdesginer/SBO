"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Building2,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ExternalLink,
  AlertTriangle,
  Lock,
  Zap,
  TrendingUp,
  History,
  RotateCcw,
  Landmark,
  Terminal,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import Image from "next/image";

const navGroups = [
  {
    label: "CORE BANKING",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Authorizations", href: "/admin/approvals", icon: ShieldCheck },
      { label: "Member Registry", href: "/admin/members", icon: Users },
      { label: "Ledger Monitor", href: "/admin/transactions", icon: History },
      { label: "Vault Accounts", href: "/admin/accounts", icon: Building2 },
    ]
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Manual Adjustment", href: "/admin/members?action=adjust", icon: TrendingUp },
      { label: "Internal Transfer", href: "/admin/members?action=transfer", icon: ArrowLeftRight },
      { label: "Interest Engine", href: "/admin/operations/interest", icon: Zap },
      { label: "Fee Management", href: "/admin/operations/fees", icon: Landmark },
      { label: "Reversal Protocol", href: "/admin/operations/reverse", icon: RotateCcw },
    ]
  },
  {
    label: "GOVERNANCE",
    items: [
      { label: "Content Management", href: "/admin/content", icon: ImageIcon },
      { label: "Risk & Compliance", href: "/admin/risk", icon: AlertTriangle },
      { label: "Query Inspector", href: "/admin/debug/database", icon: Terminal },
      { label: "Audit Logs", href: "/admin/audit", icon: Lock },
      { label: "System Settings", href: "/admin/settings", icon: Settings },
    ]
  }
];

interface AdminSidebarProps {
  adminName: string | null;
}

export function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const { assets } = useSiteSettings();

  const fetchPendingApprovals = useCallback(async () => {
    const supabase = createClient();
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .in("category", ["adjustment_request", "transfer"]);
    setPendingApprovals(count ?? 0);
  }, []);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  useRealtimeTables(["transactions"], fetchPendingApprovals);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B1220] text-white">
      <div className={cn("p-6 border-b border-white/10 flex items-center", collapsed ? "justify-center px-3" : "gap-3.5")}>
        <div className={cn(
          "w-10 h-10 rounded-[12px] flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden",
          !assets.logo && "bg-[#E85D65]"
        )}>
          {assets.logo ? (
            <Image src={assets.logo} width={40} height={40} alt="Pentagon Finances Logo" className="object-contain" unoptimized />
          ) : (
            "P"
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-none tracking-tight truncate">Pentagon Finances</p>
            <div className="text-[#E85D65] text-[10px] mt-1 font-bold uppercase tracking-[0.18em] flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Executive Console
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-7 overflow-y-auto scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{group.label}</p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-[12px] transition-all duration-200 group relative",
                      collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5",
                      active 
                        ? "bg-white/10 text-white" 
                        : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <Icon className={cn("flex-shrink-0 transition-transform group-hover:scale-105", collapsed ? "w-5 h-5" : "w-4 h-4", active ? "text-[#E85D65]" : "text-white/50 group-hover:text-white")} />
                    {!collapsed && <span className={cn("text-[13px] font-semibold flex-1 truncate", active ? "text-white" : "")}>{item.label}</span>}
                    {!collapsed && item.href === "/admin/approvals" && pendingApprovals > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E85D65] text-white font-mono">
                        {pendingApprovals}
                      </span>
                    )}
                    {active && !collapsed && <div className="absolute left-0 w-1 h-5 bg-[#E85D65] rounded-r-full" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/dashboard" className={cn("w-full flex items-center rounded-[12px] text-white/60 hover:bg-white/[0.06] hover:text-white transition-all", collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5")}>
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-[13px] font-semibold">Client Interface</span>}
        </Link>
        <button onClick={handleLogout} className={cn("w-full flex items-center rounded-[12px] text-white/60 hover:bg-red-500/15 hover:text-[#E85D65] transition-all", collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5")}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-[13px] font-semibold">Sign Out</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-[12px] bg-[#17243A] border border-white/10">
            <div className="w-8 h-8 rounded-[10px] bg-[#E85D65] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {adminName?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{adminName || "Administrator"}</p>
              <p className="text-[10px] text-white/55 font-semibold uppercase mt-1 tracking-wider">Master Control</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button aria-label={mobileOpen ? "Close navigation" : "Open navigation"} className="lg:hidden fixed top-3 left-4 z-50 w-9 h-9 bg-[#0B1220] border border-white/15 rounded-[10px] flex items-center justify-center text-white" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-[#0B1220]/70 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />}
      <div className={cn("lg:hidden fixed left-0 top-0 h-full bg-[#0B1220] z-40 w-[240px] max-w-[85vw] transition-transform duration-300", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <SidebarContent />
      </div>
      <div className={cn("hidden lg:flex flex-col bg-[#0B1220] transition-all duration-300 relative border-r border-white/10 flex-shrink-0", collapsed ? "w-[76px]" : "w-[240px]")}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3.5 top-20 w-7 h-7 bg-white border border-[#E8EDF4] rounded-full flex items-center justify-center text-[#101827] hover:bg-[#F8FAFC] transition-all z-10 shadow-sm">
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
    </>
  );
}
