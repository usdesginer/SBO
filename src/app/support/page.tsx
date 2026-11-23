"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation 
} from "@/components/navigation";
import { 
  Footer 
} from "@/components/footer";
import { 
  Mail, 
  Phone, 
  MapPin, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Zap, 
  LifeBuoy,
  Lock,
  ArrowRight,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

const faqs = [
  {
    category: "Digital Onboarding",
    questions: [
      {
        q: "How do I become a Pentagon Finances member?",
        a: "Membership is currently by invitation. You can initiate a consultation by reaching out to our concierge desk. Once pre-approved, a relationship manager will guide you through the secure onboarding process."
      },
      {
        q: "What documentation is required for Swiss residency?",
        a: "We require valid identification (Passport or Identity Card) and official proof of residency. For non-resident accounts, additional wealth origin documentation may be requested under international AML and KYC standards."
      }
    ]
  },
  {
    category: "Security & Vaults",
    questions: [
      {
        q: "How secure is the digital interface?",
        a: "Pentagon Finances utilizes 256-bit military-grade encryption, multi-factor biometric authentication, and strict hardware-level security modules to protect your digital vault access."
      },
      {
        q: "What is a 'Vault Lock'?",
        a: "A Vault Lock is an institutional-level security feature that allows you to instantly suspend all outgoing fund movements and card activity across all your accounts via a single command in the app."
      }
    ]
  },
  {
    category: "International Wires",
    questions: [
      {
        q: "What are the limits for international transfers?",
        a: "Standard limits are established based on your membership tier. However, these can be adjusted in real-time through your relationship manager for high-value institutional capital movements."
      },
      {
        q: "How long do SEPA and SWIFT transfers take?",
        a: "SEPA transfers are typically processed within the same business day. SWIFT international wires generally arrive within 1-3 business days, depending on the recipient's jurisdiction."
      }
    ]
  }
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#E8EDF4] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group gap-4"
      >
        <span className="text-sm sm:text-base font-bold text-[#101827] tracking-tight group-hover:text-[#E85D65] transition-colors">
          {q}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center transition-all duration-300 flex-shrink-0",
            isOpen ? "bg-[#0B1220] border-[#0B1220] text-white rotate-180" : "text-[#718096]"
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-[#718096] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SupportPage() {
  const { config } = useSiteSettings();
  const [search, setSearch] = useState("");

  const supportPhone = config.supportPhone || "+41 800 000 001";
  const supportEmail = config.supportEmail || "support@pentagonfinances.ch";

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA] text-[#101827]">
      <Navigation />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 bg-[#0B1220] text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/[0.06] border border-white/15 text-white/85 text-[11px] font-semibold uppercase tracking-[0.2em] mb-6">
                <LifeBuoy className="w-3.5 h-3.5 text-[#E85D65]" /> Concierge &amp; Support
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.06] mb-5">
                The Institutional Concierge Desk
              </h1>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8 max-w-2xl">
                Direct Swiss client service for onboarding, security locks, cross-border wire inquiries, and advisory requests.
              </p>

              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search institutional resources..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/15 rounded-[10px] text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#E85D65]/40 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="py-16 bg-white border-b border-[#E8EDF4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: CreditCard,
                  title: "Lost or Stolen Card",
                  desc: "Immediately engage a Vault Lock on any card directly from your dashboard.",
                  action: "Open Card Controls",
                  link: "/login",
                },
                {
                  icon: ShieldCheck,
                  title: "Security Center",
                  desc: "Review KYC verification status, two-factor authentication, and access settings.",
                  action: "Security Settings",
                  link: "/login",
                },
                {
                  icon: MessageSquare,
                  title: "Consult an Advisor",
                  desc: "Schedule a private consultation with a Zurich relationship manager.",
                  action: "Email Concierge",
                  link: `mailto:${supportEmail}`,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#F8FAFC] rounded-[20px] p-7 border border-[#E8EDF4] hover:bg-white hover:shadow-[var(--shadow-card)] transition-all"
                >
                  <div className="w-12 h-12 rounded-[12px] bg-[#0B1220] text-white flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#101827] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#718096] leading-relaxed mb-5">{item.desc}</p>
                  <a
                    href={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#101827] hover:text-[#E85D65] uppercase tracking-wider transition-colors"
                  >
                    {item.action} <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DIRECT CONTACT CHANNELS */}
        <section className="py-20 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <p className="text-[#E85D65] text-xs font-bold uppercase tracking-[0.2em]">
                  Direct Engagement
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight">
                  Zurich Client Channels
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-white rounded-[16px] border border-[#E8EDF4] shadow-[var(--shadow-card)]">
                    <div className="w-11 h-11 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#0B1220] flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Global Hotline</p>
                      <p className="text-base font-bold font-mono text-[#101827] break-all">{supportPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-white rounded-[16px] border border-[#E8EDF4] shadow-[var(--shadow-card)]">
                    <div className="w-11 h-11 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#0B1220] flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Electronic Dispatch</p>
                      <p className="text-base font-bold text-[#101827] break-all">{supportEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-white rounded-[16px] border border-[#E8EDF4] shadow-[var(--shadow-card)]">
                    <div className="w-11 h-11 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#0B1220] flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Zurich Head Office</p>
                      <p className="text-base font-bold text-[#101827]">Bahnhofstrasse 1, 8001 Zürich</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0B1220] rounded-[20px] p-8 sm:p-10 text-white border border-white/10 shadow-xl">
                <div className="w-12 h-12 bg-white/10 rounded-[12px] flex items-center justify-center mb-6 border border-white/15">
                  <Clock className="w-6 h-6 text-[#E85D65]" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Availability &amp; Hours</h3>
                <p className="text-white/65 text-sm leading-relaxed mb-7">
                  Digital platform operations run 24/7. Dedicated advisory desks operate in Zurich Standard Time (CET/CEST).
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2.5 border-b border-white/10">
                    <span className="text-white/60">Monday — Friday</span>
                    <span className="font-mono font-bold text-white">08:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/10">
                    <span className="text-white/60">Saturday</span>
                    <span className="font-mono font-bold text-white">09:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-white/60">Sunday</span>
                    <span className="font-bold text-[#E85D65] text-xs uppercase tracking-wider">Concierge Desk Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-white border-t border-[#E8EDF4]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-12">
              <p className="text-[#E85D65] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                Institutional Knowledge
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#101827] tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-10">
              {faqs.map((group) => {
                const filteredQs = search
                  ? group.questions.filter(
                      (item) =>
                        item.q.toLowerCase().includes(search.toLowerCase()) ||
                        item.a.toLowerCase().includes(search.toLowerCase())
                    )
                  : group.questions;
                if (filteredQs.length === 0) return null;
                return (
                  <div key={group.category} className="bg-[#F8FAFC] rounded-[20px] border border-[#E8EDF4] p-6 sm:p-8">
                    <h4 className="text-xs font-bold text-[#101827] uppercase tracking-[0.2em] mb-4 border-l-2 border-[#E85D65] pl-3">
                      {group.category}
                    </h4>
                    <div className="divide-y divide-[#E8EDF4]">
                      {filteredQs.map((item, i) => (
                        <FaqItem key={i} q={item.q} a={item.a} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
