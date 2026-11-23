"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

const SETTINGS_BROADCAST_CHANNEL = "pentagon-site-settings";

interface SiteSettingsState {
  assets: Record<string, string>;
  config: Record<string, any>;
  loading: boolean;
}

let channelSeq = 0;
let sharedState: SiteSettingsState = {
  assets: {},
  config: {},
  loading: true,
};
const listeners = new Set<(state: SiteSettingsState) => void>();
let activeCleanup: (() => void) | null = null;

function notifyListeners() {
  for (const listener of listeners) {
    listener(sharedState);
  }
}

async function fetchSiteSettings() {
  const supabase = createClient();

  const [assetsRes, configRes] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "brand_assets").maybeSingle(),
    supabase.from("site_settings").select("value").eq("key", "platform_config").maybeSingle(),
  ]);

  sharedState = {
    assets:
      assetsRes.data?.value && typeof assetsRes.data.value === "object"
        ? (assetsRes.data.value as Record<string, string>)
        : sharedState.assets,
    config:
      configRes.data?.value && typeof configRes.data.value === "object"
        ? (configRes.data.value as Record<string, any>)
        : sharedState.config,
    loading: false,
  };
  notifyListeners();
}

function startSharedSync() {
  if (activeCleanup) return;

  fetchSiteSettings();

  const supabase = createClient();
  const channelName = `site-settings-sync-${++channelSeq}`;
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "site_settings" },
      (payload) => {
        const row = payload.new as { key?: string; value?: unknown } | undefined;
        if (row?.key === "brand_assets" && row.value && typeof row.value === "object") {
          sharedState = { ...sharedState, assets: row.value as Record<string, string>, loading: false };
          notifyListeners();
        } else if (row?.key === "platform_config" && row.value && typeof row.value === "object") {
          sharedState = { ...sharedState, config: row.value as Record<string, any>, loading: false };
          notifyListeners();
        } else {
          fetchSiteSettings();
        }
      }
    )
    .subscribe();

  let bc: BroadcastChannel | null = null;
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    bc = new BroadcastChannel(SETTINGS_BROADCAST_CHANNEL);
    bc.onmessage = (event) => {
      if (event.data?.type === "brand_assets" && event.data.assets) {
        sharedState = { ...sharedState, assets: event.data.assets, loading: false };
        notifyListeners();
      } else if (event.data?.type === "platform_config" && event.data.config) {
        sharedState = { ...sharedState, config: event.data.config, loading: false };
        notifyListeners();
      } else {
        fetchSiteSettings();
      }
    };
  }

  activeCleanup = () => {
    supabase.removeChannel(channel);
    bc?.close();
    activeCleanup = null;
  };
}

/**
 * Institutional Hook: Site Settings Resolver
 * Fetches dynamic brand assets and platform configurations from the site_settings registry
 * and subscribes to live updates via a shared Supabase Realtime channel and BroadcastChannel.
 */
export function useSiteSettings() {
  const [state, setState] = useState<SiteSettingsState>(sharedState);

  useEffect(() => {
    listeners.add(setState);
    setState(sharedState);
    startSharedSync();

    return () => {
      listeners.delete(setState);
      if (listeners.size === 0 && activeCleanup) {
        activeCleanup();
      }
    };
  }, []);

  const getAsset = useCallback(
    (key: string, fallback: string) => state.assets[key] || fallback,
    [state.assets]
  );

  return {
    assets: state.assets,
    config: state.config,
    loading: state.loading,
    getAsset,
    refresh: fetchSiteSettings,
  };
}
