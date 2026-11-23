"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

const navLinks = [
  { name: "Personal", href: "/personal" },
  { name: "Business", href: "/business" },
  { name: "Loans", href: "/loans" },
  { name: "Investments", href: "/investments" },
  { name: "Support", href: "/support" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { assets, config } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-10",
        isScrolled ? "py-3" : "py-4 sm:py-5"
      )}
    >
      {config.maintenanceMode && (
        <div className="max-w-7xl mx-auto mb-2 px-4 py-2 rounded-[10px] bg-amber-500 text-[#0B1220] text-[11px] font-bold uppercase tracking-[0.16em] text-center shadow-sm">
          Scheduled Institutional Maintenance Active · Client Operations Temporarily Suspended
        </div>
      )}

      <div
        className={cn(
          "max-w-7xl mx-auto rounded-[16px] px-4 sm:px-6 flex items-center justify-between transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-xl border border-[#E8EDF4] shadow-[0_12px_36px_rgba(11,18,32,0.08)] py-3"
            : "bg-[#0B1220]/70 backdrop-blur-md border border-white/10 py-3"
        )}
      >
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div
            className={cn(
              "w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center font-bold text-lg transition-all overflow-hidden",
              isScrolled
                ? "bg-[#0B1220] text-white"
                : "bg-white text-[#0B1220] shadow-sm"
            )}
          >
            {assets.logo ? (
              <Image
                src={assets.logo}
                width={36}
                height={36}
                alt="Pentagon Finances Logo"
                className="object-contain"
                unoptimized
              />
            ) : (
              "P"
            )}
          </div>
          <div className="min-w-0">
            <span
              className={cn(
                "font-bold text-base tracking-tight block leading-none truncate transition-colors",
                isScrolled ? "text-[#101827]" : "text-white"
              )}
            >
              Pentagon Finances
            </span>
            <span
              className={cn(
                "text-[9px] font-semibold uppercase tracking-[0.18em] block mt-0.5",
                isScrolled ? "text-[#718096]" : "text-white/50"
              )}
            >
              Zurich Private Finance
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-[12px] font-semibold tracking-wide transition-colors",
                isScrolled
                  ? "text-[#718096] hover:text-[#101827]"
                  : "text-white/75 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              "px-4 py-2 rounded-[12px] text-[12px] font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap",
              isScrolled
                ? "text-[#101827] hover:bg-[#F8FAFC] border border-[#E8EDF4]"
                : "text-white/90 hover:text-white hover:bg-white/10 border border-white/10"
            )}
          >
            <Lock className="w-3.5 h-3.5 text-[#E85D65]" />
            Client Login
          </Link>
          <Link
            href="/open-account"
            className={cn(
              "px-5 py-2.5 rounded-[12px] text-[12px] font-semibold transition-all inline-flex items-center gap-1.5 active:scale-95 whitespace-nowrap shadow-sm",
              isScrolled
                ? "bg-[#0B1220] text-white hover:bg-[#17243A]"
                : "bg-[#E85D65] text-white hover:bg-[#DC555D]"
            )}
          >
            Open Account
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className={cn(
            "lg:hidden p-2 rounded-[10px] transition-colors flex-shrink-0 border",
            isScrolled
              ? "bg-[#F8FAFC] border-[#E8EDF4] text-[#101827]"
              : "bg-white/10 border-white/15 text-white"
          )}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="lg:hidden max-w-7xl mx-auto mt-2 bg-white border border-[#E8EDF4] shadow-2xl rounded-[20px] p-5 flex flex-col gap-1 max-h-[calc(100vh-6rem)] overflow-y-auto"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-[#101827] px-3 py-3 rounded-[10px] hover:bg-[#F8FAFC] hover:text-[#E85D65] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-[1px] bg-[#E8EDF4] my-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Link
                href="/login"
                className="text-center py-3 text-[#101827] font-semibold text-xs uppercase tracking-wider border border-[#E8EDF4] rounded-[12px] hover:bg-[#F8FAFC]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Client Login
              </Link>
              <Link
                href="/open-account"
                className="text-center py-3 bg-[#0B1220] text-white font-semibold text-xs uppercase tracking-wider rounded-[12px] hover:bg-[#17243A]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Open Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
