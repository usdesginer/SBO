"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Zap, 
  Globe, 
  ArrowRight,
  Clock,
  Gem,
  Lock,
  Landmark
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import placeholders from "@/app/lib/placeholder-images.json";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { cn } from "@/lib/utils";

export default function PersonalBankingPage() {
  const { assets, getAsset } = useSiteSettings();

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#101827]">
      <Navigation />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0B1220] text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={getAsset("hero", placeholders.hero.url)}
              fill
              alt="Personal Banking"
              className="object-cover opacity-20"
              unoptimized={Boolean(assets.hero)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/90 to-[#0B1220]" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/[0.06] border border-white/15 text-white/85 text-[11px] font-semibold uppercase tracking-[0.2em] mb-6"
            >
              <Gem className="w-3.5 h-3.5 text-[#E85D65]" /> Private Individual Tiers
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.06] mb-6"
            >
              Your Capital. <span className="text-[#E85D65]">Your Legacy.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto"
            >
              Experience a standard of private banking built for global movement. From daily EUR liquidity to generational wealth preservation, your vault is engineered for stability.
            </motion.p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 bg-white border-b border-[#E8EDF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: CreditCard,
                  title: "Private Vaults",
                  desc: "Dedicated accounts for everyday multi-currency liquidity protected by Swiss custody standards.",
                },
                {
                  icon: Smartphone,
                  title: "Digital Command",
                  desc: "Manage accounts, security locks, and statements effortlessly from desktop or mobile.",
                },
                {
                  icon: Globe,
                  title: "Global Reach",
                  desc: "Move capital across borders via SEPA and SWIFT with transparent FX pricing.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#F8FAFC] rounded-[20px] border border-[#E8EDF4] p-7 hover:bg-white hover:shadow-[var(--shadow-card)] transition-all"
                >
                  <div className="w-12 h-12 bg-[#0B1220] text-white rounded-[12px] flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#101827] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#718096] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACCOUNT TIERS */}
        <section className="py-20 bg-[#F5F7FA]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-[#E85D65] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                Tier Selection
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight">
                Personal Membership Tiers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  tier: "Platinum",
                  label: "Individual Excellence",
                  perks: ["Metal Physical Card", "Priority Concierge", "2.5% Savings Yield", "Global ATM Access"],
                  dark: false,
                },
                {
                  tier: "Infinite",
                  label: "Global Private",
                  perks: ["Dedicated Relationship Manager", "Executive Lounge Access", "4.0% Savings Yield", "FX Treasury Access"],
                  dark: true,
                },
              ].map((item) => (
                <div
                  key={item.tier}
                  className={cn(
                    "p-8 rounded-[20px] border flex flex-col justify-between shadow-[var(--shadow-card)]",
                    item.dark
                      ? "bg-[#0B1220] border-white/15 text-white"
                      : "bg-white border-[#E8EDF4] text-[#101827]"
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-[0.2em] mb-2",
                        item.dark ? "text-[#E85D65]" : "text-[#718096]"
                      )}
                    >
                      {item.tier} Tier
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight mb-6">{item.label}</h3>
                    <ul className="space-y-3.5 mb-8">
                      {item.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-3 text-sm font-medium">
                          <ShieldCheck className="w-4 h-4 text-[#E85D65] flex-shrink-0" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/open-account"
                    className={cn(
                      "w-full py-3.5 rounded-[12px] font-semibold text-xs uppercase tracking-wider transition-all text-center",
                      item.dark
                        ? "bg-[#E85D65] hover:bg-[#DC555D] text-white"
                        : "bg-[#0B1220] hover:bg-[#17243A] text-white"
                    )}
                  >
                    Apply for {item.tier}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white border-t border-[#E8EDF4]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
            <div className="bg-[#0B1220] rounded-[20px] p-8 sm:p-14 text-white border border-white/10 shadow-xl">
              <div className="w-14 h-14 bg-white/10 border border-white/15 rounded-[14px] flex items-center justify-center mx-auto mb-6">
                <Lock className="w-6 h-6 text-[#E85D65]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Start Your Private Mandate
              </h2>
              <p className="text-base text-white/65 mb-8 max-w-xl mx-auto">
                Join clients who expect Swiss precision from their digital financial institution.
              </p>
              <Link
                href="/open-account"
                className="inline-flex items-center justify-center gap-2 bg-[#E85D65] hover:bg-[#DC555D] text-white px-8 py-3.5 rounded-[12px] font-semibold text-sm transition-all"
              >
                Establish Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}