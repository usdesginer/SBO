"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { 
  Building2, 
  BarChart3, 
  ArrowLeftRight, 
  Globe, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  TrendingUp,
  Activity
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import placeholders from "@/app/lib/placeholder-images.json";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function BusinessBankingPage() {
  const { assets, getAsset } = useSiteSettings();

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#101827]">
      <Navigation />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0B1220] text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={getAsset("businessBanking", placeholders.businessBanking.url)}
              fill
              alt="Business Banking"
              className="object-cover opacity-20"
              unoptimized={Boolean(assets.businessBanking)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/90 to-[#0B1220]" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/[0.06] border border-white/15 text-white/85 text-[11px] font-semibold uppercase tracking-[0.2em] mb-6"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#E85D65]" /> Institutional Liquidity
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.06] mb-6"
            >
              Corporate Capital <span className="text-[#E85D65]">In Motion.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto"
            >
              Digital treasury architecture for global enterprises—manage multi-currency payroll, settlements, and liquidity reserves through one secure platform.
            </motion.p>
          </div>
        </section>

        {/* METRICS */}
        <section className="py-12 bg-white border-b border-[#E8EDF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Daily Clearing", value: "€500M+" },
                { label: "Settlement Speed", value: "INSTANT" },
                { label: "Currencies", value: "EUR · CHF · USD · GBP" },
                { label: "Network Uptime", value: "99.99%" },
              ].map((stat) => (
                <div key={stat.label} className="p-5 rounded-[16px] bg-[#F8FAFC] border border-[#E8EDF4]">
                  <p className="text-xl sm:text-2xl font-bold text-[#101827] font-mono tabular-nums tracking-tight mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CORE SERVICES */}
        <section className="py-20 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-[#E85D65] text-xs font-bold uppercase tracking-[0.2em]">
                  Institutional Power
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight">
                  Corporate Treasury Reimagined
                </h2>
                <div className="space-y-5">
                  {[
                    { icon: ArrowLeftRight, title: "Multi-Currency Engine", desc: "Manage treasury balances across EUR, CHF, USD, and GBP with real-time conversion." },
                    { icon: Activity, title: "Velocity Transfers", desc: "High-trust SWIFT and SEPA clearing with full maker-checker governance." },
                    { icon: BarChart3, title: "Granular Reporting", desc: "Complete visibility into corporate cashflow and real-time PDF/CSV audit exports." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-11 h-11 rounded-[12px] bg-[#0B1220] text-white flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#101827] mb-1">{item.title}</h4>
                        <p className="text-sm text-[#718096] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden border border-[#E8EDF4] shadow-[var(--shadow-card)]">
                <Image
                  src={getAsset("dashboardPreview", placeholders.dashboardPreview.url)}
                  fill
                  alt="Business Dashboard"
                  className="object-cover"
                  unoptimized={Boolean(assets.dashboardPreview)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#0B1220] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Scale Your Enterprise Treasury
            </h2>
            <p className="text-base text-white/65 max-w-xl mx-auto leading-relaxed">
              Initialize a multi-currency institutional vault with Swiss compliance and dedicated concierge support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/open-account"
                className="inline-flex items-center justify-center gap-2 bg-[#E85D65] hover:bg-[#DC555D] text-white px-7 py-3.5 rounded-[12px] font-semibold text-sm transition-all w-full sm:w-auto"
              >
                Business Onboarding <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/15 text-white px-7 py-3.5 rounded-[12px] font-semibold text-sm transition-all w-full sm:w-auto"
              >
                Consult an Advisor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}