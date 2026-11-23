"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import { 
  Settings, 
  ShieldAlert, 
  Loader2, 
  Check, 
  AlertCircle, 
  RefreshCw,
  Lock,
  Globe,
  Mail,
  Phone,
  HardDrive,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformConfig {
  maintenanceMode: boolean;
  membershipMode: "open" | "invitation";
  supportEmail: string;
  supportPhone: string;
  licenseNumber: string;
}

const DEFAULT_CONFIG: PlatformConfig = {
  maintenanceMode: false,
  membershipMode: "invitation",
  supportEmail: "banking@pentagonfinances.ch",
  supportPhone: "+41 800 000 001",
  licenseNumber: "CHE-123.456.789",
};

const SETTINGS_BROADCAST_CHANNEL = "pentagon-site-settings";

function broadcastPlatformConfig(config: PlatformConfig) {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    const bc = new BroadcastChannel(SETTINGS_BROADCAST_CHANNEL);
    bc.postMessage({ type: "platform_config", config });
    bc.close();
  }
}

export default function SystemSettingsPage() {
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "platform_config")
      .single();

    if (data?.value) {
      setConfig(data.value as PlatformConfig);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings(false);
  }, [fetchSettings]);

  useRealtimeTables(["site_settings"], () => {
    if (!saving) {
      fetchSettings(true);
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      broadcastPlatformConfig(config);
      setSuccess("Institutional configurations updated successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof PlatformConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#718096]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0B1220] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Accessing System Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <Settings className="w-7 h-7 text-[#E85D65]" />
            System Configuration
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Institutional Control · Platform Lifecycle &amp; Governance
          </p>
        </div>
        <button 
          onClick={() => fetchSettings(false)}
          className="p-2.5 rounded-[12px] bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {(error || success) && (
        <div className={cn(
          "p-4 rounded-[12px] border flex items-start gap-3 animate-in fade-in slide-in-from-top-2",
          error ? "bg-red-50 border-red-200 text-[#DC2626]" : "bg-emerald-50 border-emerald-200 text-[#059669]"
        )}>
          {error ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <Check className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{error || success}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Platform Status */}
        <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
          <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-[#D97706]" />
            <h2 className="text-sm font-bold text-[#101827] uppercase tracking-wider">Platform Lifecycle</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px]">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#101827]">Maintenance Mode</p>
                <p className="text-xs text-[#718096] leading-tight max-w-sm">
                  Temporarily suspend all client-side operations for scheduled institutional maintenance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => update("maintenanceMode", !config.maintenanceMode)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 flex-shrink-0",
                  config.maintenanceMode ? "bg-[#E85D65]" : "bg-[#CBD5E1]"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300",
                  config.maintenanceMode ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px]">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#101827]">Membership Onboarding</p>
                <p className="text-xs text-[#718096] leading-tight max-w-sm">
                  Control the acquisition funnel for new institutional members.
                </p>
              </div>
              <select
                value={config.membershipMode}
                onChange={(e) => update("membershipMode", e.target.value)}
                className="bg-white border border-[#E8EDF4] rounded-[10px] px-4 py-2 text-xs font-bold text-[#101827] uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#0B1220]/10 w-full sm:w-auto"
              >
                <option value="invitation">Invitation Only</option>
                <option value="open">Open Registry</option>
              </select>
            </div>
          </div>
        </div>

        {/* Institutional Contact */}
        <div className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden shadow-[var(--shadow-card)]">
          <div className="px-6 py-4 border-b border-[#E8EDF4] bg-[#F8FAFC] flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#101827] uppercase tracking-wider">Regulatory Metadata</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3" /> Support Dispatch
              </label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => update("supportEmail", e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-4 py-3 text-sm text-[#101827] placeholder:text-[#94A3B8] outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all font-medium"
                placeholder="banking@pentagonfinances.ch"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3 h-3" /> Direct Contact
              </label>
              <input
                type="text"
                value={config.supportPhone}
                onChange={(e) => update("supportPhone", e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-4 py-3 text-sm text-[#101827] placeholder:text-[#94A3B8] outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all font-medium"
                placeholder="+41 800 000 001"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest flex items-center gap-2">
                <HardDrive className="w-3 h-3" /> Entity Registration ID
              </label>
              <input
                type="text"
                value={config.licenseNumber}
                onChange={(e) => update("licenseNumber", e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E8EDF4] rounded-[10px] px-4 py-3 text-sm font-mono text-[#101827] font-bold placeholder:text-[#94A3B8] outline-none focus:ring-2 focus:ring-[#0B1220]/10 transition-all uppercase"
                placeholder="CHE-XXX.XXX.XXX"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-white border border-[#E8EDF4]">
            <Lock className="w-3.5 h-3.5 text-[#718096]" />
            <span className="text-[10px] font-bold text-[#718096] uppercase tracking-widest">Audited Session</span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-[#0B1220] hover:bg-[#17243A] disabled:opacity-50 text-white rounded-[12px] text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Commit Configuration
          </button>
        </div>
      </form>

      <div className="p-5 bg-white border border-[#E8EDF4] rounded-[20px] flex items-start gap-4 shadow-[var(--shadow-card)]">
        <div className="w-10 h-10 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center flex-shrink-0 text-[#0B1220]">
          <UserPlus className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#101827] uppercase tracking-wider">Master Control Notice</p>
          <p className="text-xs text-[#718096] leading-relaxed">
            Modifying system configurations impacts the entire institutional infrastructure. Changes broadcast across the realtime stream and are logged under your officer identity.
          </p>
        </div>
      </div>
    </div>
  );
}
