"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Building2,
  TrendingUp, Landmark, Settings, LogOut, Menu, X, Wallet,
  ShieldCheck, ChevronLeft, History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/use-site-settings";
import Image from "next/image";

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "BANKING",
    items: [
      { label: "Vault Accounts", href: "/dashboard/accounts", icon: Building2 },
      { label: "Transactions", href: "/dashboard/transactions", icon: History },
      { label: "Transfers", href: "/dashboard/transfers", icon: ArrowLeftRight },
      { label: "Payments", href: "/dashboard/bills", icon: Wallet },
      { label: "Cards", href: "/dashboard/cards", icon: CreditCard },
    ]
  },
  {
    label: "WEALTH",
    items: [
      { label: "Investments", href: "/dashboard/investments", icon: TrendingUp },
      { label: "Loans", href: "/dashboard/loans", icon: Landmark },
    ]
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Security", href: "/dashboard/security", icon: ShieldCheck },
      { label: "Vault Settings", href: "/dashboard/settings", icon: Settings },
    ]
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { assets } = useSiteSettings();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B1220]">
      {/* Logo Section */}
      <div className={cn("px-5 py-6 border-b border-white/[0.07] flex items-center", collapsed ? "justify-center px-3" : "gap-3")}>
        <motion.div 
          layout
          className={cn(
            "w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-[#0B1220] font-black text-lg shadow-sm overflow-hidden",
            !assets.logo && "bg-white"
          )}
        >
          {assets.logo ? (
            <Image src={assets.logo} width={36} height={36} alt="Pentagon Finances Logo" className="object-contain" unoptimized />
          ) : (
            "P"
          )}
        </motion.div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0"
          >
            <p className="text-white font-bold text-[14px] tracking-tight leading-none font-heading">Pentagon Finances</p>
            <p className="text-slate-400 text-[10px] mt-1 font-medium uppercase tracking-widest">Zurich · Switzerland</p>
          </motion.div>
        )}
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {!collapsed && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em] mb-2"
              >
                {group.label}
              </motion.p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center rounded-[12px] transition-all duration-200 group relative",
                      collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5",
                      active
                        ? "bg-[#17243A] text-white border border-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className={cn("flex-shrink-0 transition-colors", collapsed ? "w-5 h-5" : "w-4 h-4", active ? "text-[#E85D65]" : "text-slate-500 group-hover:text-slate-300")} />
                    {!collapsed && <span className={cn("text-[13px] font-semibold tracking-tight", active ? "text-white" : "text-slate-300 group-hover:text-white")}>{item.label}</span>}
                    {active && !collapsed && (
                      <motion.div 
                        layoutId="active-nav-indicator"
                        className="absolute left-0 w-1 h-5 bg-[#E85D65] rounded-r-full" 
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="p-3 border-t border-white/[0.07]">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center rounded-[12px] text-slate-400 hover:bg-[#E85D65]/10 hover:text-[#E85D65] transition-all duration-200",
            collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"
          )}
        >
          <LogOut className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
          {!collapsed && <span className="text-[13px] font-semibold tracking-tight">Secure Exit</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        className="lg:hidden fixed top-4 sm:top-5 left-4 z-50 w-10 h-10 bg-[#0B1220] rounded-[12px] flex items-center justify-center text-white shadow-lg border border-white/10"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-[#0B1220]/75 backdrop-blur-sm z-40" 
            onClick={() => setMobileOpen(false)} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed left-0 top-0 h-full bg-[#0B1220] z-40 w-60 max-w-[80vw] shadow-2xl border-r border-white/10"
      >
        <SidebarContent />
      </motion.div>

      <motion.div 
        animate={{ width: collapsed ? 76 : 240 }}
        transition={{ type: "spring", damping: 30, stiffness: 220 }}
        className="hidden lg:flex flex-col bg-[#0B1220] relative flex-shrink-0 border-r border-white/[0.06]"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          className="absolute -right-3.5 top-20 w-7 h-7 bg-[#0B1220] border border-white/15 rounded-[10px] flex items-center justify-center text-white hover:bg-[#17243A] transition-all z-10 shadow-md"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </motion.div>
        </button>
      </motion.div>
    </>
  );
}
