"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { 
  Landmark, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Building2, 
  User, 
  Briefcase,
  ChevronRight,
  Zap,
  Target
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import placeholders from "@/app/lib/placeholder-images.json";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function LoansMarketingPage() {
  const { assets, getAsset } = useSiteSettings();

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#101827]">
      <Navigation />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0B1220] text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={getAsset("vault", placeholders.vault.url)}
              fill
              alt="Lending Solutions"
              className="object-cover opacity-20"
              unoptimized={Boolean(assets.vault)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/90 to-[#0B1220]" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/[0.06] border border-white/15 text-white/85 text-[11px] font-semibold uppercase tracking-[0.2em] mb-6"
            >
              <Target className="w-3.5 h-3.5 text-[#E85D65]" /> Strategic Capital
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.06] mb-6"
            >
              Liquidity <span className="text-[#E85D65]">Unbound.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto"
            >
              Unlock capital against your portfolio with bespoke Swiss lending mandates—from real estate financing to instant Lombard credit lines.
            </motion.p>
          </div>
        </section>

        {/* LENDING PILLARS */}
        <section className="py-20 bg-white border-b border-[#E8EDF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Building2, title: "Real Estate", desc: "Tailored financing for residential and commercial European property acquisitions." },
                { icon: Landmark, title: "Lombard Loans", desc: "Immediate liquidity backed by held assets without liquidating positions." },
                { icon: Briefcase, title: "Business Credit", desc: "Flexible credit facilities built for institutional expansion and working capital." },
                { icon: User, title: "Private Credit", desc: "Discreet personal credit mandates structured for private principals." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-7 rounded-[20px] bg-[#F8FAFC] border border-[#E8EDF4] hover:bg-white hover:shadow-[var(--shadow-card)] transition-all"
                >
                  <div className="w-12 h-12 rounded-[12px] bg-[#0B1220] text-white flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#101827] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#718096] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LENDING PROCESS */}
        <section className="py-20 bg-[#0B1220] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[#E85D65] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                  Financing Protocol
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
                  Speed Meets Institutional Precision
                </h2>
                <div className="space-y-7">
                  {[
                    { step: "01", title: "Inquiry", desc: "Digital or advisory consultation to scope your credit structure." },
                    { step: "02", title: "Valuation", desc: "Rapid institutional review of collateral and liquidity profile." },
                    { step: "03", title: "Execution", desc: "Capital settled directly into your primary EUR or CHF vault." },
                  ].map((p) => (
                    <div key={p.step} className="flex gap-5">
                      <span className="text-2xl font-bold font-mono text-[#E85D65]">{p.step}</span>
                      <div>
                        <h4 className="text-base font-bold mb-1">{p.title}</h4>
                        <p className="text-sm text-white/65 leading-relaxed max-w-sm">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#17243A] border border-white/15 p-7 sm:p-9 rounded-[20px] shadow-2xl relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold tracking-tight">Illustrative Facility</h3>
                  <ShieldCheck className="w-6 h-6 text-[#E85D65]" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-white/70">
                      <span>Facility Amount</span>
                      <span className="font-mono text-white">€500,000.00</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E85D65] w-[60%]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-white/70">
                      <span>Term Duration</span>
                      <span className="font-mono text-white">120 Months</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#059669] w-[45%]" />
                    </div>
                  </div>
                  <div className="pt-5 border-t border-white/10">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
                      Indicative Annual Rate
                    </p>
                    <p className="text-4xl font-bold font-mono tabular-nums text-white">
                      1.75% <span className="text-sm text-white/50">APR</span>
                    </p>
                  </div>
                </div>
                <Link
                  href="/open-account"
                  className="mt-7 w-full py-3.5 bg-white text-[#0B1220] hover:bg-[#E85D65] hover:text-white rounded-[12px] font-bold text-xs uppercase tracking-wider transition-all block text-center"
                >
                  Initiate Application
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="py-20 bg-white border-t border-[#E8EDF4]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight">
              Structure Your Capital Facility
            </h2>
            <p className="text-base text-[#718096] leading-relaxed">
              Speak with our Zurich lending desk or apply directly through onboarding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/open-account"
                className="inline-flex items-center justify-center gap-2 bg-[#0B1220] hover:bg-[#17243A] text-white px-7 py-3.5 rounded-[12px] font-semibold text-sm transition-all w-full sm:w-auto"
              >
                Apply for Facility <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center justify-center bg-[#F8FAFC] hover:bg-white text-[#101827] border border-[#E8EDF4] px-7 py-3.5 rounded-[12px] font-semibold text-sm transition-all w-full sm:w-auto"
              >
                Consult a Lending Officer
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}