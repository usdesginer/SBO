"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Globe,
  TrendingUp,
  Landmark,
  ChevronRight,
  ShieldCheck,
  Star,
  Users,
  Activity,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Clock as ClockIcon,
  Crown,
  Gem,
  Hexagon,
  Mountain,
  Lock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import placeholders from "@/app/lib/placeholder-images.json";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

function StatCounter({
  value,
  suffix = "",
  decimals = 0,
  prefix = "",
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  prefix?: string;
}) {
  const [count, setCount] = useState(value);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    setCount(0);
    const duration = 1200;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    const increment = value / totalFrames;
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      if (currentFrame >= totalFrames) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount((prev) => prev + increment);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {prefix}
      {count.toLocaleString("en-IE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

const HERO_CURRENCIES = [
  { code: "EUR", symbol: "€", rate: 1, label: "Euro" },
  { code: "CHF", symbol: "CHF ", rate: 0.94, label: "Swiss Franc" },
  { code: "USD", symbol: "$", rate: 1.08, label: "US Dollar" },
  { code: "GBP", symbol: "£", rate: 0.85, label: "British Pound" },
] as const;

function HeroVaultPreview() {
  const [selectedCode, setSelectedCode] = useState<(typeof HERO_CURRENCIES)[number]["code"]>("EUR");
  const active = HERO_CURRENCIES.find((c) => c.code === selectedCode) ?? HERO_CURRENCIES[0];
  const baseEur = 245688.89;
  const converted = (baseEur * active.rate).toLocaleString("en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
      className="bg-[#17243A]/95 border border-white/15 rounded-[20px] p-6 sm:p-7 shadow-[0_32px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            Institutional Portfolio · {active.code}
          </p>
          <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Multi-Currency Vault
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#0B1220] border border-white/10 rounded-[10px] p-1">
          {HERO_CURRENCIES.map((cur) => (
            <button
              key={cur.code}
              type="button"
              onClick={() => setSelectedCode(cur.code)}
              className={cn(
                "px-2.5 py-1 rounded-[8px] text-[10px] font-mono font-bold transition-colors",
                selectedCode === cur.code
                  ? "bg-[#E85D65] text-white"
                  : "text-white/55 hover:text-white"
              )}
            >
              {cur.code}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 pb-6 border-b border-white/10">
        <p className="text-3xl sm:text-[38px] font-bold font-mono tabular-nums text-white tracking-tight leading-none">
          {active.symbol}
          {converted}
        </p>
        <p className="text-[11px] font-mono text-white/55 mt-3 tracking-wider">
          IBAN: CH56 8080 8213 5069 8 · Primary Treasury
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
          Recent Ledger Events
        </p>
        <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#0B1220]/70 border border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Zurich Institutional Deposit
              </p>
              <p className="text-[11px] font-mono text-white/45">Settled · SEPA Instant</p>
            </div>
          </div>
          <span className="text-sm font-bold font-mono tabular-nums text-emerald-400 ml-3">
            +{active.symbol}
            {(15000 * active.rate).toLocaleString("en-IE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#0B1220]/70 border border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-[#E85D65]/15 text-[#E85D65] flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Cross-Border Clearing Mandate
              </p>
              <p className="text-[11px] font-mono text-amber-400">Dual-Control Review</p>
            </div>
          </div>
          <span className="text-sm font-bold font-mono tabular-nums text-white ml-3">
            -{active.symbol}
            {(4250 * active.rate).toLocaleString("en-IE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ShowcaseGlassCard({
  tier,
  label,
  icon: Icon,
  perks,
}: {
  tier: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  perks: string[];
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const themes: Record<
    string,
    { bg: string; accent: string; border: string; text: string; sub: string }
  > = {
    platinum: {
      bg: "bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0]",
      accent: "text-[#17243A]",
      border: "border-[#CBD5E1]",
      text: "text-[#101827]",
      sub: "text-[#718096]",
    },
    infinite: {
      bg: "bg-gradient-to-br from-[#17243A] to-[#0B1220]",
      accent: "text-[#E85D65]",
      border: "border-white/15",
      text: "text-white",
      sub: "text-white/55",
    },
    black: {
      bg: "bg-gradient-to-br from-[#0B1220] to-[#020617]",
      accent: "text-emerald-400",
      border: "border-white/15",
      text: "text-white",
      sub: "text-white/55",
    },
  };

  const t = themes[tier.toLowerCase()] || themes.infinite;

  return (
    <div className="bg-white rounded-[20px] border border-[#E8EDF4] p-6 shadow-[var(--shadow-card)] flex flex-col justify-between gap-6">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "relative w-full aspect-[1.58/1] rounded-[16px] p-6 border overflow-hidden cursor-pointer flex flex-col justify-between",
          t.bg,
          t.border
        )}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn("w-4 h-4", t.accent)} />
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", t.sub)}>
                {tier} Entity
              </p>
            </div>
            <h3 className={cn("font-bold text-xl tracking-tight", t.text)}>Pentagon</h3>
          </div>
          <div className="w-10 h-7 rounded-[6px] bg-white/15 border border-white/20" />
        </div>
        <div>
          <p className={cn("text-sm font-mono tracking-[0.22em] mb-1", t.text)}>
            •••• •••• •••• 8080
          </p>
          <p className={cn("text-[10px] font-semibold uppercase tracking-wider", t.sub)}>
            Swiss Private Custody
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-bold text-[#101827] tracking-tight mb-2">{label}</h4>
          <div className="flex flex-wrap gap-2">
            {perks.map((perk) => (
              <span
                key={perk}
                className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E8EDF4] text-[11px] font-semibold text-[#718096]"
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/open-account"
          className="w-full py-3 bg-[#0B1220] hover:bg-[#17243A] text-white rounded-[12px] font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          Initialize {tier} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

const stats = [
  { label: "Assets Managed", value: 120, prefix: "€", suffix: "B+", decimals: 0, icon: Landmark },
  { label: "Jurisdictions", value: 150, suffix: "+", decimals: 0, icon: Globe },
  { label: "Core Availability", value: 99.99, suffix: "%", decimals: 2, icon: Activity },
  { label: "Average Onboarding", value: 8, suffix: " min", decimals: 0, icon: ClockIcon },
  { label: "Private Clients", value: 250, suffix: "K+", decimals: 0, icon: Users },
];

const testimonials = [
  {
    quote:
      "Pentagon Finances has completely redefined my expectations of a digital institution. Multi-currency liquidity and international clearing are seamless.",
    author: "Marc-André Girard",
    role: "Technology Founder",
    avatar: "MG",
  },
  {
    quote:
      "Combining Swiss private-banking discipline with an intuitive multi-currency portal makes this the only platform I trust with our family office reserves.",
    author: "Elena Rossi",
    role: "Private Investor",
    avatar: "ER",
  },
  {
    quote:
      "Institutional treasury controls with real-time maker-checker visibility. Essential infrastructure for our European operations.",
    author: "Dr. Klaus Weber",
    role: "CEO, Weber Logistics",
    avatar: "KW",
  },
];

export default function LandingPage() {
  const { assets, getAsset } = useSiteSettings();

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#101827]">
      <Navigation />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 bg-[#0B1220] text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={getAsset("hero", placeholders.hero.url)}
              width={placeholders.hero.width}
              height={placeholders.hero.height}
              alt={placeholders.hero.alt}
              className="object-cover w-full h-full opacity-20"
              priority
              unoptimized={Boolean(assets.hero)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/90 via-[#0B1220]/80 to-[#0B1220]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-white/[0.06] border border-white/15 text-white/85 text-[11px] font-semibold tracking-wider uppercase">
                  <Zap className="w-3.5 h-3.5 text-[#E85D65]" />
                  Established in Switzerland · Zurich Private Platform
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-bold tracking-[-0.03em] leading-[1.06] text-white">
                  Private Banking,{" "}
                  <span className="text-[#E85D65]">Engineered</span> for Global Capital.
                </h1>

                <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">
                  Manage EUR-primary and multi-currency liquidity across EUR, CHF, USD, and GBP with Swiss-grade custody, instant internal settlements, and dual-control authorization.
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                  <Link
                    href="/open-account"
                    className="inline-flex justify-center items-center gap-2 bg-[#E85D65] hover:bg-[#DC555D] text-white px-7 py-3.5 rounded-[12px] font-semibold text-sm transition-all shadow-lg shadow-[#E85D65]/20 active:scale-95"
                  >
                    Establish Private Vault <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 px-7 py-3.5 rounded-[12px] font-semibold text-sm transition-all active:scale-95"
                  >
                    <Lock className="w-4 h-4 text-white/70" />
                    Secure Client Login
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs text-white/55">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    256-Bit Vault Encryption
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Real-Time Ledger Sync
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Multi-Currency Clearing
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <HeroVaultPreview />
              </div>
            </div>
          </div>
        </section>

        {/* TRUST METRICS STRIP */}
        <section className="py-12 bg-white border-b border-[#E8EDF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-5 rounded-[16px] bg-[#F8FAFC] border border-[#E8EDF4] flex flex-col justify-between"
                >
                  <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E8EDF4] flex items-center justify-center text-[#0B1220] mb-4">
                    <stat.icon className="w-4 h-4 text-[#E85D65]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">
                    <StatCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                    />
                  </div>
                  <p className="text-xs font-semibold text-[#718096] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SWISS HERITAGE */}
        <section className="py-20 lg:py-28 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <p className="text-xs font-bold text-[#E85D65] uppercase tracking-[0.2em]">
                  Swiss Heritage
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#101827] tracking-tight leading-[1.12]">
                  The Institutional Standard of Stability.
                </h2>
                <p className="text-base sm:text-lg text-[#718096] leading-relaxed">
                  Headquartered in Zurich, Pentagon Finances combines disciplined Swiss custody with a modern EUR-primary wealth architecture engineered for borderless liquidity, transparency, and capital preservation.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2 max-w-md">
                  <div className="bg-white rounded-[16px] border border-[#E8EDF4] p-5">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-[#101827]">
                      1892
                    </span>
                    <span className="block text-xs font-semibold text-[#718096] mt-1">
                      Founding Legacy
                    </span>
                  </div>
                  <div className="bg-white rounded-[16px] border border-[#E8EDF4] p-5">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-[#101827]">
                      100%
                    </span>
                    <span className="block text-xs font-semibold text-[#718096] mt-1">
                      Swiss Custody Reserve
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden border border-[#E8EDF4] shadow-[var(--shadow-card)]">
                <Image
                  src={getAsset("swissHeritage", placeholders.swissHeritage.url)}
                  fill
                  alt="Zurich Heritage"
                  className="object-cover"
                  unoptimized={Boolean(assets.swissHeritage)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 sm:right-auto p-4 sm:p-5 bg-[#0B1220]/85 backdrop-blur-md rounded-[14px] border border-white/15 max-w-xs">
                  <Mountain className="w-5 h-5 text-[#E85D65] mb-2" />
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    Private vaults governed under rigorous Swiss custody and compliance frameworks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY PERIMETER */}
        <section className="py-20 lg:py-28 bg-white border-y border-[#E8EDF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-bold text-[#E85D65] uppercase tracking-[0.2em] mb-3">
                Security Architecture
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight mb-4">
                Precision Custody Without Compromise
              </h2>
              <p className="text-base text-[#718096] leading-relaxed">
                Multi-layered access controls, automated risk screening, and real-time audit telemetry protect every movement across the ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Lock,
                  title: "Instant Vault Lock",
                  desc: "Engage or release security freezes on cards and liquidity accounts directly from your client console.",
                },
                {
                  icon: Activity,
                  title: "Real-Time Trace IDs",
                  desc: "Every domestic wire, SWIFT transfer, and internal settlement issues a verifiable protocol trace ID.",
                },
                {
                  icon: ShieldCheck,
                  title: "Maker-Checker Governance",
                  desc: "Outbound transfers and institutional adjustments follow strict compliance review and dual-control release.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-[#F8FAFC] rounded-[20px] border border-[#E8EDF4] p-7 hover:bg-white hover:shadow-[var(--shadow-card)] transition-all"
                >
                  <div className="w-12 h-12 rounded-[12px] bg-[#0B1220] text-white flex items-center justify-center mb-5">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#101827] mb-2">{card.title}</h3>
                  <p className="text-sm text-[#718096] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WEALTH & TREASURY */}
        <section className="py-20 lg:py-28 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden border border-[#E8EDF4] shadow-[var(--shadow-card)] lg:order-2">
                <Image
                  src={getAsset("businessBanking", placeholders.businessBanking.url)}
                  fill
                  alt="Wealth Management"
                  className="object-cover"
                  unoptimized={Boolean(assets.businessBanking)}
                />
                <div className="absolute inset-0 bg-[#0B1220]/15" />
              </div>

              <div className="lg:order-1 space-y-6">
                <p className="text-xs font-bold text-[#E85D65] uppercase tracking-[0.2em]">
                  Capital Deployment
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#101827] tracking-tight leading-[1.12]">
                  Multi-Currency Treasury &amp; Wealth Allocation.
                </h2>
                <p className="text-base sm:text-lg text-[#718096] leading-relaxed">
                  Monitor equity positions, convert display valuations seamlessly between EUR, CHF, USD, and GBP, and execute high-trust settlements globally.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "Institutional Liquidity Access",
                    "Real-Time FX Conversion",
                    "Bespoke Credit Facilities",
                    "Full CSV & PDF Statements",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 p-3.5 rounded-[12px] bg-white border border-[#E8EDF4]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                      <span className="text-xs font-semibold text-[#101827]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CARD TIERS */}
        <section className="py-20 lg:py-28 bg-white border-y border-[#E8EDF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-bold text-[#E85D65] uppercase tracking-[0.2em] mb-3">
                Membership Tiers
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight mb-4">
                Physical Entities &amp; Card Controls
              </h2>
              <p className="text-base text-[#718096] leading-relaxed">
                Precision-milled physical cards backed by instant spending controls, online channel toggles, and global travel privileges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ShowcaseGlassCard
                tier="Platinum"
                label="Elite Access"
                icon={Hexagon}
                perks={["Lounge Key", "Travel Credit", "2.5% Yield"]}
              />
              <ShowcaseGlassCard
                tier="Infinite"
                label="Global Standard"
                icon={Crown}
                perks={["Concierge", "FX Engine", "4.0% Yield"]}
              />
              <ShowcaseGlassCard
                tier="Black"
                label="Bespoke Private"
                icon={Gem}
                perks={["Private Desk", "Vault Custody", "5.5% Yield"]}
              />
            </div>
          </div>
        </section>

        {/* DIGITAL INTERFACE SHOWCASE */}
        <section className="py-20 lg:py-28 bg-[#0B1220] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-bold text-[#E85D65] uppercase tracking-[0.2em] mb-3">
                Unified Platform
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Desktop Command &amp; Mobile Precision
              </h2>
              <p className="text-base text-white/65 leading-relaxed">
                Real-time portfolio analytics, one-click statement exports, and instant administrative controls across every screen.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 rounded-[20px] border border-white/15 overflow-hidden bg-[#17243A] shadow-2xl">
                <div className="aspect-[16/10] relative">
                  <Image
                    src={getAsset("dashboardPreview", placeholders.dashboardPreview.url)}
                    fill
                    alt="Pentagon Finances Desktop"
                    className="object-cover"
                    unoptimized={Boolean(assets.dashboardPreview)}
                  />
                </div>
              </div>
              <div className="lg:col-span-4 flex justify-center">
                <div className="w-[240px] sm:w-[270px] aspect-[9/18] rounded-[28px] bg-[#0B1220] border-[6px] border-[#17243A] shadow-2xl overflow-hidden relative ring-1 ring-white/15">
                  <Image
                    src={getAsset("mobileApp", placeholders.mobileApp.url)}
                    fill
                    alt="Pentagon Finances Mobile"
                    className="object-cover"
                    unoptimized={Boolean(assets.mobileApp)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 lg:py-24 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-bold text-[#E85D65] uppercase tracking-[0.2em] mb-3">
                Client Perspectives
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight">
                Trusted by Private Principals &amp; Enterprises
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.author}
                  className="bg-white rounded-[20px] border border-[#E8EDF4] p-7 shadow-[var(--shadow-card)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 mb-5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className="w-4 h-4 text-[#E85D65] fill-[#E85D65]" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-[#101827] leading-relaxed mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 pt-4 border-t border-[#E8EDF4]">
                    <div className="w-10 h-10 rounded-[10px] bg-[#0B1220] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#101827]">{t.author}</p>
                      <p className="text-xs text-[#718096]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INVITATION CTA */}
        <section className="py-20 bg-white border-t border-[#E8EDF4]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="bg-[#0B1220] rounded-[20px] p-8 sm:p-14 text-center text-white border border-white/10 shadow-2xl">
              <div className="w-14 h-14 rounded-[14px] bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-7 h-7 text-[#E85D65]" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Experience Institutional Finance Without Compromise.
              </h2>
              <p className="text-base text-white/65 mb-8 max-w-xl mx-auto leading-relaxed">
                Open a private multi-currency mandate or connect with our Zurich relationship desk.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/open-account"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-[#E85D65] hover:bg-[#DC555D] text-white px-8 py-3.5 rounded-[12px] font-semibold text-sm transition-all"
                >
                  Apply for Membership <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/support"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 px-8 py-3.5 rounded-[12px] font-semibold text-sm transition-all"
                >
                  Consult an Advisor
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
