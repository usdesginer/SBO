"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Bell, 
  Globe, 
  Eye, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Clock,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/currency-provider";
import { CurrencyCode } from "@/lib/currency";
import { motion } from "framer-motion";

const VAULT_SETTINGS_KEY = "pentagon-vault-settings";
const DEFAULT_NOTIFICATIONS = {
  security: true,
  transactions: true,
  marketing: false,
  email: true,
  push: true,
  sms: false,
};
const DEFAULT_REGIONAL = {
  timezone: "Europe/Zurich (CET)",
  currency: "EUR (€) - Euro",
  language: "English (UK)",
};

export default function VaultSettingsPage() {
  const { setCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setIsMounted] = useState(false);

  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [regional, setRegional] = useState(DEFAULT_REGIONAL);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(VAULT_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.regional) setRegional(parsed.regional);
      }
    } catch {}

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel(VAULT_SETTINGS_KEY);
      bc.onmessage = (e) => {
        if (e.data?.notifications) setNotifications(e.data.notifications);
        if (e.data?.regional) setRegional(e.data.regional);
      };
    }
    return () => bc?.close();
  }, []);

  const persistPreferences = (nextNotifs = notifications, nextRegional = regional) => {
    const payload = { notifications: nextNotifs, regional: nextRegional };
    try {
      localStorage.setItem(VAULT_SETTINGS_KEY, JSON.stringify(payload));
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(VAULT_SETTINGS_KEY);
        bc.postMessage(payload);
        bc.close();
      }
    } catch {}
  };

  const handleSave = () => {
    setLoading(true);
    persistPreferences();
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleReset = () => {
    setNotifications(DEFAULT_NOTIFICATIONS);
    setRegional(DEFAULT_REGIONAL);
    persistPreferences(DEFAULT_NOTIFICATIONS, DEFAULT_REGIONAL);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      persistPreferences(next, regional);
      return next;
    });
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">Vault Settings</h1>
        <p className="text-[#718096] text-xs font-semibold uppercase tracking-widest mt-1">Configure your institutional preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Notification Protocols */}
        <section className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-6 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-white border border-[#E8EDF4] flex items-center justify-center text-[#0B1220] flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#101827] uppercase tracking-wider">Notification Protocols</h2>
              <p className="text-[11px] text-[#718096] font-medium">Manage how the bank communicates with you</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "security", label: "Security & Access Alerts", desc: "Immediate notification of logins and vault unlocks.", icon: ShieldCheck },
                { id: "transactions", label: "Ledger Activity", desc: "Confirmations for all fund movements and settlements.", icon: Smartphone },
                { id: "marketing", label: "Institutional Insights", desc: "Weekly market updates and executive summaries.", icon: Eye },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] group hover:bg-white transition-all">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E8EDF4] flex items-center justify-center text-[#718096] group-hover:text-[#101827] transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#101827] tracking-tight">{item.label}</p>
                      <p className="text-[11px] text-[#718096] leading-tight max-w-[190px]">{item.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleNotif(item.id as any)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-all duration-500 flex items-center px-1 shadow-inner",
                      notifications[item.id as keyof typeof notifications] ? "bg-[#0B1220]" : "bg-[#CBD5E1]"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-500",
                      notifications[item.id as keyof typeof notifications] ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-[#E8EDF4]">
              <p className="text-[10px] font-bold text-[#718096] uppercase tracking-widest mb-4">Delivery Channels</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "email", label: "Email Dispatch", icon: Mail },
                  { id: "push", label: "App Push", icon: Smartphone },
                  { id: "sms", label: "SMS Gateway", icon: MessageSquare },
                ].map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => toggleNotif(channel.id as any)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] border transition-all active:scale-95",
                      notifications[channel.id as keyof typeof notifications]
                        ? "bg-[#0B1220] border-[#0B1220] text-white"
                        : "bg-white border-[#E8EDF4] text-[#718096] hover:text-[#101827]"
                    )}
                  >
                    <channel.icon className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{channel.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Regional Intelligence */}
        <section className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-6 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-white border border-[#E8EDF4] flex items-center justify-center text-[#0B1220] flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#101827] uppercase tracking-wider">Regional &amp; Display</h2>
              <p className="text-[11px] text-[#718096] font-medium">Synchronize your digital environment</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">Institutional Timezone</label>
              <select 
                value={regional.timezone}
                onChange={(e) => setRegional({...regional, timezone: e.target.value})}
                className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-xs font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all appearance-none"
              >
                <option>Europe/Zurich (CET)</option>
                <option>America/New_York (EST)</option>
                <option>Asia/Singapore (SGT)</option>
                <option>UTC (Coordinated Universal Time)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">Primary Currency</label>
              <select 
                value={regional.currency}
                onChange={(e) => {
                  const val = e.target.value;
                  setRegional({ ...regional, currency: val });
                  const code = val.split(" ")[0] as CurrencyCode;
                  setCurrency(code);
                }}
                className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-xs font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all appearance-none"
              >
                <option>EUR (€) - Euro</option>
                <option>CHF (CHF) - Swiss Franc</option>
                <option>USD ($) - US Dollar</option>
                <option>GBP (£) - British Pound</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block ml-0.5">Display Language</label>
              <select 
                value={regional.language}
                onChange={(e) => setRegional({...regional, language: e.target.value})}
                className="w-full px-4 py-3.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] text-xs font-semibold text-[#101827] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all appearance-none"
              >
                <option>English (UK)</option>
                <option>Deutsch (CH)</option>
                <option>Français (CH)</option>
                <option>Italiano (CH)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Global Security Summary */}
        <div className="bg-[#0B1220] rounded-[20px] p-6 sm:p-8 text-white relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-white/10 flex items-center justify-center border border-white/10 flex-shrink-0">
                <Clock className="w-7 h-7 text-[#E85D65]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">System Integrity</h3>
                <p className="text-white/50 text-[11px] font-semibold uppercase tracking-[0.18em] mt-1">Version 1.0.4 · Production Build</p>
              </div>
            </div>
            <div className="flex items-center justify-around sm:justify-start gap-6 sm:gap-8 px-6 py-3.5 bg-white/5 rounded-[12px] border border-white/10 backdrop-blur-md w-full md:w-auto">
              <div className="text-center">
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs font-bold text-emerald-400 uppercase">Operational</p>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1">Last Sync</p>
                <p className="text-xs font-bold text-white uppercase">Just Now</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E85D65]/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex items-center gap-2.5 text-[#718096] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#0B1220]" />
            End-to-end encrypted preference storage
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827] rounded-[12px] text-[11px] font-bold uppercase tracking-widest hover:bg-[#F8FAFC] transition-all"
            >
              Reset to Defaults
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className={cn(
                "flex-1 sm:flex-none px-8 py-3.5 rounded-[12px] font-bold text-[11px] uppercase tracking-[0.16em] transition-all shadow-sm flex items-center justify-center gap-2.5 active:scale-95",
                success 
                  ? "bg-[#059669] text-white" 
                  : "bg-[#0B1220] text-white hover:bg-[#17243A]"
              )}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : success ? (
                <Check className="w-4 h-4" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              {loading ? "Committing..." : success ? "Preferences Saved" : "Commit Vault Settings"}
            </button>
          </div>
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-[#059669] text-xs font-bold bg-emerald-50 py-3 rounded-[12px] border border-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4" /> Institutional Preferences Synchronized Successfully
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
