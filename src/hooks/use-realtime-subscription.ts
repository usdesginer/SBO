"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { DB_CHANGE_EVENT } from "@/components/realtime-provider";

type SubscriptionConfig = {
  table: string;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
};

let subscriptionSeq = 0;

export function useRealtimeSubscription<T extends Record<string, any>>(
  config: SubscriptionConfig,
  onCallback: (payload: RealtimePostgresChangesPayload<T>) => void,
  dependencies: any[] = []
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const callbackRef = useRef(onCallback);
  callbackRef.current = onCallback;

  useEffect(() => {
    const supabase = createClient();

    const channelName = `realtime:${config.schema || "public"}:${config.table}${
      config.filter ? `:${config.filter}` : ""
    }:${++subscriptionSeq}`;

    const newChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: config.event || "*",
          schema: config.schema || "public",
          table: config.table,
          filter: config.filter,
        },
        (payload) => {
          callbackRef.current(payload as RealtimePostgresChangesPayload<T>);
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return channel;
}

/**
 * Listens to live PostgreSQL change events dispatched by RealtimeProvider
 * for the given table list without opening redundant WebSocket channels.
 */
export function useRealtimeTables(tables: string | string[], onUpdate: () => void) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;
  const tableKey = Array.isArray(tables) ? tables.join(",") : tables;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetTables = new Set(tableKey.split(",").filter(Boolean));

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ table?: string }>).detail;
      if (!detail?.table || targetTables.has(detail.table) || targetTables.has("*")) {
        callbackRef.current();
      }
    };

    window.addEventListener(DB_CHANGE_EVENT, handler);
    return () => {
      window.removeEventListener(DB_CHANGE_EVENT, handler);
    };
  }, [tableKey]);
}
