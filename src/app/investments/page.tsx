"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Globe, 
  ShieldCheck, 
  ArrowUpRight, 
  ChevronRight,
  Gem,
  Hexagon,
  Mountain,
  PieChart,
  Target
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import placeholders from "@/app/lib/placeholder-images.json";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function InvestmentsMarketingPage() {
  const { assets, getAsset } = useSiteSettings();

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#101827]">
      <Navigation />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0B1220] text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={getAsset("swissHeritage", placeholders.swissHeritage.url)}
              fill
              alt="Global Markets"
              className="object-cover opacity-20"
              unoptimized={Boolean(assets.swissHeritage)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/90 to-[#0B1220]" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/[0.06] border border-white/15 text-white/85 text-[11px] font-semibold uppercase tracking-[0.2em] mb-6"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#E85D65]" /> Institutional Wealth
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.06] mb-6"
            >
              Wealth Allocation. <span className="text-[#E85D65]">Disciplined.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto"
            >
              Access global equities, sovereign fixed-income instruments, and alternative custody through one unified institutional portfolio engine.
            </motion.p>
          </div>
        </section>

        {/* MARKET SNAPSHOT */}
        <section className="py-16 bg-white border-b border-[#E8EDF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Global Equities", value: "+14.2%", icon: Globe },
                { label: "Fixed Income", value: "+4.8%", icon: Activity },
                { label: "Alternative Assets", value: "+22.5%", icon: Gem },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-6 rounded-[20px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-between hover:bg-white hover:shadow-[var(--shadow-card)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[12px] bg-[#0B1220] text-white flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p className="text-2xl font-bold font-mono tabular-nums text-[#101827]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[#059669]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE ENGINE */}
        <section className="py-20 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-[16/10] rounded-[20px] overflow-hidden border border-[#E8EDF4] shadow-[var(--shadow-card)]">
                <Image
                  src={getAsset("dashboardPreview", placeholders.dashboardPreview.url)}
                  fill
                  alt="Wealth Dashboard"
                  className="object-cover"
                  unoptimized={Boolean(assets.dashboardPreview)}
                />
                <div className="absolute inset-0 bg-[#0B1220]/15" />
              </div>
              <div className="space-y-6">
                <p className="text-[#E85D65] text-xs font-bold uppercase tracking-[0.2em]">
                  Asset Intelligence
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight">
                  Bespoke Portfolio Allocation
                </h2>
                <div className="space-y-5">
                  {[
                    { icon: PieChart, title: "Portfolio Synthesis", desc: "Structured diversification across global sectors matched to your risk profile." },
                    { icon: BarChart3, title: "Real-Time Exposure", desc: "Institutional visibility into market concentration and multi-currency valuation." },
                    { icon: ShieldCheck, title: "Capital Protection", desc: "Risk-mitigation protocols anchored in Swiss financial custody standards." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-11 h-11 rounded-[12px] bg-white border border-[#E8EDF4] flex items-center justify-center flex-shrink-0 text-[#0B1220]">
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
            </div>
          </div>
        </section>

        {/* GLOBAL ACCESS */}
        <section className="py-20 bg-[#0B1220] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
            <p className="text-[#E85D65] text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Execution Reach
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Direct Access to Major Exchanges
            </h2>
            <p className="text-base text-white/65 leading-relaxed max-w-2xl mx-auto mb-12">
              Connect seamlessly to SIX, NYSE, NASDAQ, and major European hubs from a single multi-currency account.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Zurich · SIX", "New York · NYSE", "London · LSE", "Tokyo · TSE"].map((city) => (
                <div
                  key={city}
                  className="py-5 px-4 rounded-[12px] bg-white/[0.04] border border-white/10 font-mono text-xs font-semibold text-white/80"
                >
                  {city}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white border-t border-[#E8EDF4]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6">
            <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[14px] flex items-center justify-center mx-auto text-[#0B1220]">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight">
              Preserve Long-Term Alpha
            </h2>
            <p className="text-base text-[#718096] leading-relaxed">
              Experience institutional asset execution with Swiss custody transparency.
            </p>
            <div>
              <Link
                href="/open-account"
                className="inline-flex items-center justify-center gap-2 bg-[#0B1220] hover:bg-[#17243A] text-white px-8 py-3.5 rounded-[12px] font-semibold text-sm transition-all"
              >
                Initiate Consultation <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}