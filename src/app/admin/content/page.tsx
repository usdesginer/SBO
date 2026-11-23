"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import { 
  ImageIcon, 
  Upload, 
  Loader2, 
  Check, 
  AlertCircle, 
  RefreshCw,
  Layout,
  Smartphone,
  ShieldCheck,
  Landmark,
  Image as LucideImage,
  Globe,
  Eye,
  RotateCcw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import placeholders from "@/app/lib/placeholder-images.json";

const ASSET_CONFIG = [
  { id: "logo", label: "Institutional Logo", icon: Landmark, desc: "The primary brand hallmark used in navbars, sidebars, and auth screens." },
  { id: "hero", label: "Hero Banner", icon: Layout, desc: "The cinematic background image for the landing page entrance." },
  { id: "mobileApp", label: "Mobile Showcase", icon: Smartphone, desc: "Image used in the digital interface multi-device showcase." },
  { id: "vault", label: "Vault Facility", icon: ShieldCheck, desc: "Technical visualization of the private vault storage on the loans page." },
  { id: "swissHeritage", label: "Swiss Heritage", icon: Globe, desc: "Heritage imagery showcasing Swiss stability and landscape on the landing page." },
  { id: "businessBanking", label: "Business Banking", icon: LucideImage, desc: "Contextual imagery for wealth & institutional sections." },
  { id: "dashboardPreview", label: "Desktop Dashboard", icon: Layout, desc: "Showcase image of the web-based institutional monitor." },
];

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const SETTINGS_BROADCAST_CHANNEL = "pentagon-site-settings";

function broadcastBrandAssets(assets: Record<string, string>) {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    const bc = new BroadcastChannel(SETTINGS_BROADCAST_CHANNEL);
    bc.postMessage({ type: "brand_assets", assets });
    bc.close();
  }
}

export default function ContentManagementPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "brand_assets")
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      setSettings(data.value as Record<string, string>);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings(false);
  }, [fetchSettings]);

  useRealtimeTables(["site_settings"], () => {
    fetchSettings(true);
  });

  const handleUpload = async (id: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP, SVG, GIF, or AVIF).");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Image size must be 10 MB or less.");
      return;
    }

    setUploading(id);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetKey", id);

    try {
      const res = await fetch("/api/admin/content/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const updatedAssets = (data.assets as Record<string, string>) || { ...settings, [id]: data.url };
      setSettings(updatedAssets);
      broadcastBrandAssets(updatedAssets);
      setSuccess(`Asset "${id}" uploaded and synced with the landing page.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleReset = async (id: string) => {
    setUploading(id);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/content/upload?assetKey=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      const updatedAssets = (data.assets as Record<string, string>) || {};
      setSettings(updatedAssets);
      broadcastBrandAssets(updatedAssets);
      setSuccess(`Asset "${id}" restored to default and synced.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setUploading(null);
    }
  };

  const getAssetUrl = (id: string) => {
    if (settings[id]) return settings[id];
    if (id === "logo") return null; 
    return (placeholders as Record<string, { url?: string }>)[id]?.url ?? null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight flex items-center gap-3">
            <ImageIcon className="w-7 h-7 text-[#E85D65]" />
            Brand Asset Management
          </h1>
          <p className="text-[#718096] text-xs mt-1 uppercase tracking-widest font-semibold">
            Institutional Content Control · Live Landing Page Sync
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-[12px] bg-white border border-[#E8EDF4] text-[#101827] hover:bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Landing Page
          </Link>
          <button 
            onClick={() => fetchSettings(false)}
            disabled={loading}
            aria-label="Refresh brand assets"
            className="p-2.5 rounded-[12px] bg-white border border-[#E8EDF4] text-[#718096] hover:text-[#101827] transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className={cn(
          "p-4 rounded-[12px] border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
          error ? "bg-red-50 border-red-200 text-[#DC2626]" : "bg-emerald-50 border-emerald-200 text-[#059669]"
        )}>
          {error ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <Check className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{error || success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ASSET_CONFIG.map((asset) => {
          const url = getAssetUrl(asset.id);
          const isUploading = uploading === asset.id;
          const isCustom = !!settings[asset.id];

          return (
            <div key={asset.id} className="bg-white border border-[#E8EDF4] rounded-[20px] overflow-hidden group hover:shadow-[var(--shadow-card)] transition-all flex flex-col">
              <div className="aspect-video relative bg-[#0B1220] flex items-center justify-center overflow-hidden">
                {url ? (
                  <Image 
                    src={url} 
                    fill 
                    alt={asset.label} 
                    className="object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500" 
                    unoptimized={isCustom}
                  />
                ) : (
                  <div className="text-center p-8">
                    <asset.icon className="w-10 h-10 text-white/30 mx-auto mb-3" />
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Default Logo Mark</p>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-[#0B1220]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E85D65]" />
                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Synchronizing Vault...</p>
                  </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2">
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-[8px] bg-[#0B1220]/80 border border-white/15 text-white/75 hover:text-white transition-all backdrop-blur-md">
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider backdrop-blur-md",
                    isCustom ? "bg-[#E85D65] text-white border-[#E85D65]" : "bg-[#0B1220]/80 text-white/80 border-white/15"
                  )}>
                    {isCustom ? "Synced" : "Default"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-[10px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center text-[#0B1220]">
                    <asset.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[#101827] tracking-tight text-sm">{asset.label}</h3>
                </div>
                <p className="text-xs text-[#718096] leading-relaxed mb-5 flex-1">{asset.desc}</p>
                
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer flex-1">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      disabled={!!uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(asset.id, file);
                        e.currentTarget.value = "";
                      }}
                    />
                    <div className="w-full py-2.5 bg-[#0B1220] hover:bg-[#17243A] rounded-[12px] flex items-center justify-center gap-2 text-[11px] font-bold text-white uppercase tracking-wider transition-all active:scale-[0.98]">
                      <Upload className="w-3.5 h-3.5" /> {isCustom ? "Replace Image" : "Upload Image"}
                    </div>
                  </label>
                  {isCustom && (
                    <button
                      type="button"
                      disabled={!!uploading}
                      onClick={() => handleReset(asset.id)}
                      title="Restore default image"
                      className="p-2.5 bg-white border border-[#E8EDF4] rounded-[12px] text-[#718096] hover:text-[#DC2626] hover:border-red-200 transition-all disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-white border border-[#E8EDF4] rounded-[20px] flex items-start gap-4 shadow-[var(--shadow-card)]">
        <div className="w-10 h-10 rounded-[12px] bg-[#F8FAFC] border border-[#E8EDF4] flex items-center justify-center flex-shrink-0 text-[#E85D65]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#101827] uppercase tracking-wider">Storage &amp; Realtime Sync Notice</p>
          <p className="text-xs text-[#718096] leading-relaxed">
            All brand assets are stored in the institutional <span className="font-mono font-semibold text-[#101827]">site-assets</span> bucket and synced to <span className="font-mono font-semibold text-[#101827]">site_settings</span>. Uploading or resetting an image automatically broadcasts the change across the platform via Supabase Realtime.
          </p>
        </div>
      </div>
    </div>
  );
}
