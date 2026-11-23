"use client";

import Link from "next/link";
import { Lock, Mail, Phone, Globe } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function OpenAccountPage() {
  const { assets, config } = useSiteSettings();
  const supportEmail = config.supportEmail || "support@pentagonfinances.ch";
  const supportPhone = config.supportPhone || "+41 800 000 001";
  const isOpenRegistry = config.membershipMode === "open";

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#17243A]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#E85D65]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-9">
          <div className={cn(
            "w-11 h-11 rounded-[12px] flex items-center justify-center text-[#0B1220] font-bold text-xl shadow-lg overflow-hidden",
            !assets.logo && "bg-white"
          )}>
            {assets.logo ? (
              <Image src={assets.logo} width={44} height={44} alt="Pentagon Finances Logo" className="object-contain" unoptimized />
            ) : (
              "P"
            )}
          </div>
          <div className="text-left">
            <p className="text-xl font-bold text-white tracking-tight">Pentagon Finances</p>
            <p className="text-xs text-white/55">Private Finance · Switzerland</p>
          </div>
        </div>

        <div className="bg-[#17243A]/90 backdrop-blur-xl border border-white/15 rounded-[20px] p-6 sm:p-9 shadow-2xl">
          <div className="w-14 h-14 rounded-[14px] bg-[#E85D65]/15 border border-[#E85D65]/30 flex items-center justify-center mx-auto mb-6">
            {isOpenRegistry ? (
              <Globe className="w-7 h-7 text-[#E85D65]" />
            ) : (
              <Lock className="w-7 h-7 text-[#E85D65]" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-3">
            {isOpenRegistry ? "Open Institutional Registry" : "Membership by Invitation"}
          </h1>
          <p className="text-white/65 text-sm leading-relaxed mb-7">
            {isOpenRegistry
              ? "Pentagon Finances onboarding is currently open for Swiss and international wealth mandates. Reach out to our Zurich onboarding desk to provision your vault."
              : "Pentagon Finances accounts are opened exclusively through our relationship managers. To become a member, please reach out to us directly and our team will guide you through onboarding."}
          </p>

          <div className="space-y-3 mb-7">
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-3 px-4 py-3.5 bg-[#0B1220]/70 border border-white/15 rounded-[12px] hover:bg-[#0B1220] transition-colors group"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#E85D65]/15 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-[#E85D65]" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[11px] text-white/50">Email us</p>
                <p className="text-sm font-semibold text-white group-hover:text-[#E85D65] transition-colors truncate">
                  {supportEmail}
                </p>
              </div>
            </a>

            <a
              href={`tel:${supportPhone.replace(/\s+/g, "")}`}
              className="flex items-center gap-3 px-4 py-3.5 bg-[#0B1220]/70 border border-white/15 rounded-[12px] hover:bg-[#0B1220] transition-colors group"
            >
              <div className="w-9 h-9 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[11px] text-white/50">Call us</p>
                <p className="text-sm font-semibold text-white group-hover:text-white/80 transition-colors truncate">
                  {supportPhone}
                </p>
              </div>
            </a>
          </div>

          <Link
            href="/login"
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Already a member?{" "}
            <span className="text-[#E85D65] font-semibold">Sign in →</span>
          </Link>
        </div>

        <p className="text-white/40 font-mono text-[11px] mt-6">
          Pentagon Finances SA · Zürich · {config.licenseNumber || "CHE-123.456.789"}
        </p>
      </div>
    </div>
  );
}
