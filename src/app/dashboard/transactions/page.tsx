"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/hooks/use-realtime-subscription";
import {
  GlobalLedgerStream,
  LedgerTransaction,
} from "@/components/dashboard/global-ledger-stream";

export default function FullTransactionHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [accountCurrencies, setAccountCurrencies] = useState<Record<string, string>>({});
  const [accountNames, setAccountNames] = useState<Record<string, string>>({});

  const fetchHistory = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const [{ data: accs }, { data: txs }] = await Promise.all([
        supabase.from("accounts").select("id, account_name, currency").eq("user_id", user.id),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

      const curMap: Record<string, string> = {};
      const nameMap: Record<string, string> = {};
      (accs as { id: string; account_name: string; currency: string }[] | null)?.forEach((a) => {
        curMap[a.id] = a.currency || "EUR";
        nameMap[a.id] = a.account_name;
      });

      setAccountCurrencies(curMap);
      setAccountNames(nameMap);
      setTransactions((txs as unknown as LedgerTransaction[]) || []);
      setLoading(false);
    },
    [router]
  );

  useEffect(() => {
    fetchHistory(false);
  }, [fetchHistory]);

  useRealtimeTables(["transactions", "accounts"], () => {
    fetchHistory(true);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718096] hover:text-[#101827] uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101827] tracking-tight">
            Full Transaction History
          </h1>
          <p className="text-xs font-medium text-[#718096]">
            Real-time institutional statement with search, direction &amp; date filtering, and CSV/PDF export.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-20 flex flex-col items-center justify-center gap-3 text-[#718096]">
          <Loader2 className="w-7 h-7 animate-spin text-[#0B1220]" />
          <p className="text-xs font-bold uppercase tracking-widest">Loading Full Statement...</p>
        </div>
      ) : (
        <GlobalLedgerStream
          title="Complete Statement Ledger"
          transactions={transactions}
          accountCurrencies={accountCurrencies}
          accountNames={accountNames}
        />
      )}
    </div>
  );
}
