"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const DB_CHANGE_EVENT = "pentagon:db-change";

let realtimeChannelSeq = 0;

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channelName = `schema-db-changes-${++realtimeChannelSeq}`;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        (payload) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent(DB_CHANGE_EVENT, {
                detail: {
                  table: payload.table,
                  eventType: payload.eventType,
                  payload,
                },
              })
            );
          }

          if (refreshTimer) clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            router.refresh();
          }, 120);
        }
      )
      .subscribe();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return <>{children}</>;
}
