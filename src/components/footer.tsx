"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Smartphone,
  Globe,
  Lock,
  Award,
  CheckCircle2,
  Shield,
  Zap,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { cn } from "@/lib/utils";

export function Footer() {
  const { assets, config } = useSiteSettings();

  return (
    <footer className="bg-[#0B1220] text-[#94A3B8] pt-16 lg:pt-20 pb-12 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        {/* TOP: Dispatch & Mobile Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-16 items-center">
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-bold text-[#E85D65] uppercase tracking-[0.22em] mb-2">
                Institutional Dispatch
              </p>
              <h3 className="text-white font-bold text-2xl tracking-tight mb-2">
                Weekly Market &amp; Treasury Briefing
              </h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-md">
                Receive curated European FX intelligence and private banking updates directly to your inbox.
              </p>
            </div>
            <form
              className="flex flex-col sm:flex-row max-w-md gap-2.5"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="member@vault.ch"
                className="flex-1 bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#E85D65]/40 transition-all"
              />
              <button className="bg-white text-[#0B1220] px-5 py-3 rounded-[12px] font-bold text-xs uppercase tracking-wider hover:bg-[#E85D65] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                Subscribe <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
            <button
              type="button"
              className="flex items-center gap-4 px-6 py-4 bg-white/[0.04] border border-white/10 rounded-[16px] hover:bg-white/[0.08] transition-all text-left"
            >
              <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">
                  Download on the
                </p>
                <p className="text-base font-bold text-white leading-tight">App Store</p>
              </div>
            </button>
            <button
              type="button"
              className="flex items-center gap-4 px-6 py-4 bg-white/[0.04] border border-white/10 rounded-[16px] hover:bg-white/[0.08] transition-all text-left"
            >
              <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-white">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">
                  Get it on
                </p>
                <p className="text-base font-bold text-white leading-tight">Google Play</p>
              </div>
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-white/10 w-full mb-14" />

        {/* MIDDLE: Sitemap */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div
                className={cn(
                  "w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-lg overflow-hidden",
                  !assets.logo ? "bg-white text-[#0B1220]" : ""
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
              <span className="font-bold text-lg tracking-tight text-white">
                Pentagon Finances
              </span>
            </Link>
            <p className="text-xs leading-relaxed mb-6 max-w-xs text-white/55">
              Established in Switzerland. Private digital wealth platform engineered for multi-currency liquidity and institutional precision.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">
              Personal
            </h4>
            <ul className="space-y-3 text-xs font-medium text-white/60">
              <li><Link href="/personal" className="hover:text-white transition-colors">Checking Vaults</Link></li>
              <li><Link href="/personal" className="hover:text-white transition-colors">Savings Tiers</Link></li>
              <li><Link href="/personal" className="hover:text-white transition-colors">Metal Cards</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Client Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">
              Institutional
            </h4>
            <ul className="space-y-3 text-xs font-medium text-white/60">
              <li><Link href="/business" className="hover:text-white transition-colors">Wealth Management</Link></li>
              <li><Link href="/investments" className="hover:text-white transition-colors">Asset Allocation</Link></li>
              <li><Link href="/business" className="hover:text-white transition-colors">Treasury Tools</Link></li>
              <li><Link href="/loans" className="hover:text-white transition-colors">Lending Facilities</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">
              Governance
            </h4>
            <ul className="space-y-3 text-xs font-medium text-white/60">
              <li><Link href="/support" className="hover:text-white transition-colors">Privacy Charter</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Regulatory Portal</Link></li>
              <li><Link href="/dashboard/security" className="hover:text-white transition-colors">Security Center</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Compliance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.18em] mb-5">
              Concierge
            </h4>
            <ul className="space-y-3 text-xs font-medium text-white/60">
              <li><Link href="/support" className="hover:text-white transition-colors">24/7 Concierge</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Institutional FAQ</Link></li>
              <li><Link href="/open-account" className="hover:text-white transition-colors">Onboarding Desk</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Direct Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM: Trust & Regulatory */}
        <div className="pt-10 border-t border-white/10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3.5 p-4 rounded-[12px] bg-white/[0.03] border border-white/10">
              <Shield className="w-5 h-5 text-[#059669] flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">Swiss Established</p>
                <p className="text-[11px] text-white/45">Zurich Wealth Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-[12px] bg-white/[0.03] border border-white/10">
              <Lock className="w-5 h-5 text-[#E85D65] flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">PCI DSS Level 1</p>
                <p className="text-[11px] text-white/45">256-Bit Payment Security</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-[12px] bg-white/[0.03] border border-white/10">
              <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">WealthTech Standard</p>
                <p className="text-[11px] text-white/45">Institutional Custody</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 p-4 rounded-[12px] bg-white/[0.03] border border-white/10">
              <Globe className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white uppercase tracking-wider">SEPA &amp; SWIFT Hub</p>
                <p className="text-[11px] text-white/45">Cross-Border Clearing</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>Multi-currency vault custody across EUR, CHF, USD, and GBP.</span>
            </div>
            <p className="font-mono text-[11px] text-white/40">
              Pentagon Finances SA · Zürich · {config.licenseNumber || "CHE-123.456.789"} · © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
