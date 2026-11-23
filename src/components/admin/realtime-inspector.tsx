"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Wifi,
  Activity,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DB_CHANGE_EVENT } from "@/components/realtime-provider";

let diagChannelSeq = 0;

/**
 * Floating diagnostic widget showing live Supabase Realtime stream status
 * across all public institutional tables.
 */
export function RealtimeInspector() {
  const [status, setStatus] = useState<string>("JOINING");
  const [lastEvent, setLastEvent] = useState<{
    type: string;
    table: string;
    time: string;
    ref: string;
  } | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`diagnostic-stream-${++diagChannelSeq}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        () => {
          // Live events are mirrored through DB_CHANGE_EVENT below
        }
      )
      .subscribe((subStatus) => {
        setStatus(subStatus.toUpperCase());
      });

    const handleDbChange = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          table?: string;
          eventType?: string;
          payload?: { new?: Record<string, unknown> };
        }>
      ).detail;

      if (!detail) return;
      const row = detail.payload?.new;
      const refLabel =
        (row?.reference as string) ||
        (row?.account_number as string) ||
        (row?.key as string) ||
        (row?.email as string) ||
        (row?.id as string) ||
        "SYNC";

      setLastEvent({
        type: detail.eventType || "CHANGE",
        table: detail.table || "public",
        time: new Date().toLocaleTimeString("en-CH"),
        ref: String(refLabel),
      });
      setEventCount((c) => c + 1);
    };

    window.addEventListener(DB_CHANGE_EVENT, handleDbChange);

    return () => {
      window.removeEventListener(DB_CHANGE_EVENT, handleDbChange);
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] transition-all duration-300",
        isMinimized ? "w-12 h-12" : "w-72 max-w-[calc(100vw-2rem)]"
      )}
    >
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          aria-label="Open Realtime Inspector"
          className={cn(
            "w-12 h-12 rounded-full border border-white/15 shadow-2xl flex items-center justify-center transition-all",
            status === "SUBSCRIBED" ? "bg-[#059669]" : "bg-[#E85D65]"
          )}
        >
          <Wifi className="w-5 h-5 text-white animate-pulse" />
        </button>
      ) : (
        <div className="bg-[#0B1220] border border-white/15 rounded-[16px] shadow-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/10 bg-[#17243A]/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#E85D65]" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Realtime Telemetry</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize Realtime Inspector"
                className="p-1 hover:bg-white/10 rounded-[6px] transition-colors text-white/55"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                aria-label="Dismiss Realtime Inspector"
                className="p-1 hover:bg-white/10 rounded-[6px] transition-colors text-white/55"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Status</span>
                <span
                  className={cn(
                    "text-[10px] font-bold font-mono px-2 py-0.5 rounded",
                    status === "SUBSCRIBED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  )}
                >
                  {status === "SUBSCRIBED" ? "CONNECTED" : status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Scope</span>
                <span className="text-[10px] font-bold text-white font-mono">public.* (all tables)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Subscribed</span>
                <span className="text-[10px] font-bold text-white font-mono">
                  {status === "SUBSCRIBED" ? "TRUE" : "FALSE"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Events Recv</span>
                <span className="text-[10px] font-bold text-accent-500 font-mono">{eventCount}</span>
              </div>
              {lastEvent ? (
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase">Last Event</span>
                    <span className="text-[9px] font-bold text-emerald-400">
                      {lastEvent.table} · {lastEvent.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase">Timestamp</span>
                    <span className="text-[9px] text-slate-400">{lastEvent.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase">Ref</span>
                    <span className="text-[9px] text-slate-400 truncate w-28 text-right">{lastEvent.ref}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[9px] text-slate-600 text-center py-2 bg-slate-950/50 rounded-lg italic font-medium">
                  Listening for live updates...
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[8px] text-slate-600 uppercase">Realtime Core</span>
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "w-1 h-1 rounded-full",
                  status === "SUBSCRIBED" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )}
              />
              <span className="text-[8px] text-slate-500 font-mono">LIVE_STREAM</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
