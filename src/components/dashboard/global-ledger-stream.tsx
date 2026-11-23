"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Landmark,
  Receipt,
  RefreshCw,
  Search,
  Wallet,
  Zap,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { formatCurrencyAmount, normalizeCurrency } from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";
import {
  TransactionModalStatus,
  TransactionReceiptData,
  TransactionStatusModal,
} from "@/components/dashboard/transaction-status-modal";

export interface LedgerTransaction {
  id: string;
  account_id: string;
  user_id: string;
  transaction_type: "credit" | "debit";
  category: string;
  description: string | null;
  amount: number;
  balance_after?: number | null;
  reference: string;
  status: string;
  counterparty_name?: string | null;
  created_at: string;
}

interface GlobalLedgerStreamProps {
  transactions: LedgerTransaction[];
  accountCurrencies?: Record<string, string>;
  accountNames?: Record<string, string>;
  limit?: number;
  showFullHistoryLink?: boolean;
  title?: string;
}

type DirectionFilter = "all" | "incoming" | "outgoing";
type DateFilter = "all" | "today" | "7d" | "30d";

function parseTransactionPresentation(tx: LedgerTransaction) {
  const desc = tx.description || "";
  const lower = desc.toLowerCase();

  let categoryLabel = "Account movement";
  let kind: "credit" | "outgoing" | "card" | "fx" | "loan" | "bill" =
    tx.transaction_type === "credit" ? "credit" : "outgoing";

  if (lower.includes("international wire")) {
    categoryLabel = "International wire transfer";
    kind = tx.transaction_type === "credit" ? "credit" : "outgoing";
  } else if (lower.includes("domestic wire")) {
    categoryLabel = "Domestic wire transfer";
    kind = tx.transaction_type === "credit" ? "credit" : "outgoing";
  } else if (lower.includes("fx ") || lower.includes("exchange")) {
    categoryLabel = "Currency exchange";
    kind = "fx";
  } else if (lower.includes("internal transfer")) {
    categoryLabel = "Internal vault transfer";
    kind = tx.transaction_type === "credit" ? "credit" : "outgoing";
  } else if (lower.includes("loan") || tx.category === "loan") {
    categoryLabel = "Loan transaction";
    kind = "loan";
  } else if (
    tx.category === "shopping" ||
    tx.category === "food" ||
    tx.category === "entertainment" ||
    tx.category === "transport"
  ) {
    categoryLabel = "Card payment";
    kind = "card";
  } else if (tx.category === "utilities") {
    categoryLabel = "Utility & bill settlement";
    kind = "bill";
  } else if (tx.category === "adjustment_request" || lower.includes("[tier:") || lower.includes("[executed:")) {
    categoryLabel =
      tx.transaction_type === "credit" ? "Institutional credit" : "Institutional debit";
    kind = tx.transaction_type === "credit" ? "credit" : "outgoing";
  } else if (tx.transaction_type === "credit") {
    categoryLabel = "Incoming deposit";
    kind = "credit";
  } else if (tx.category === "transfer") {
    categoryLabel = "Outbound transfer";
    kind = "outgoing";
  }

  let authorizationNote = "";
  if (lower.includes("executive")) authorizationNote = "Executive authorization";
  else if (lower.includes("supervisor")) authorizationNote = "Supervisor authorization";
  else if (lower.includes("dual")) authorizationNote = "Dual-control review";
  else if (lower.includes("standard")) authorizationNote = "Standard clearance";

  // Clean description without messy bracket tags for counterparty fallback
  const cleanedDesc = desc.replace(/\[[^\]]+\]\s*/g, "").trim();
  const recipientOrSender =
    tx.counterparty_name?.trim() ||
    cleanedDesc ||
    (tx.transaction_type === "credit" ? "External Origin" : "External Beneficiary");

  return {
    categoryLabel,
    kind,
    authorizationNote,
    recipientOrSender,
    cleanedDesc,
  };
}

function getDateGroupLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfTarget) / 86_400_000);

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  return date.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLedgerIcon(kind: ReturnType<typeof parseTransactionPresentation>["kind"]) {
  switch (kind) {
    case "credit":
      return {
        Icon: ArrowDownLeft,
        wrapperClass: "bg-emerald-50 text-[#059669] border-emerald-200/70",
      };
    case "card":
      return {
        Icon: CreditCard,
        wrapperClass: "bg-[#F8FAFC] text-[#17243A] border-[#E8EDF4]",
      };
    case "fx":
      return {
        Icon: RefreshCw,
        wrapperClass: "bg-[#F8FAFC] text-[#2563EB] border-[#E8EDF4]",
      };
    case "loan":
      return {
        Icon: Landmark,
        wrapperClass: "bg-amber-50 text-[#D97706] border-amber-200/70",
      };
    case "bill":
      return {
        Icon: Zap,
        wrapperClass: "bg-sky-50 text-[#2563EB] border-sky-200/70",
      };
    case "outgoing":
    default:
      return {
        Icon: ArrowUpRight,
        wrapperClass: "bg-red-50/80 text-[#DC555D] border-red-200/70",
      };
  }
}

function LedgerStatusBadge({ status }: { status: string }) {
  const normalized = (status || "pending").toLowerCase();
  const styles: Record<string, string> = {
    completed: "bg-emerald-50 text-[#059669] border-emerald-200/80",
    pending: "bg-amber-50 text-[#D97706] border-amber-200/80",
    processing: "bg-sky-50 text-[#2563EB] border-sky-200/80",
    failed: "bg-red-50 text-[#DC2626] border-red-200/80",
    reversed: "bg-[#F8FAFC] text-[#718096] border-[#E8EDF4]",
  };
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide",
        styles[normalized] || styles.pending
      )}
    >
      {label}
    </span>
  );
}

export function GlobalLedgerStream({
  transactions,
  accountCurrencies = {},
  accountNames = {},
  limit,
  showFullHistoryLink = false,
  title = "Global Ledger Stream",
}: GlobalLedgerStreamProps) {
  const { currency, convert } = useCurrency();
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [dateRange, setDateRange] = useState<DateFilter>("all");
  const [selectedTx, setSelectedTx] = useState<TransactionReceiptData | null>(null);

  const filtered = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return transactions.filter((tx) => {
      if (tx.category === "system_audit") return false;

      if (direction === "incoming" && tx.transaction_type !== "credit") return false;
      if (direction === "outgoing" && tx.transaction_type !== "debit") return false;

      if (dateRange !== "all") {
        const txMs = new Date(tx.created_at).getTime();
        if (dateRange === "today" && txMs < startOfToday.getTime()) return false;
        if (dateRange === "7d" && now - txMs > 7 * 86_400_000) return false;
        if (dateRange === "30d" && now - txMs > 30 * 86_400_000) return false;
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matches =
          (tx.description || "").toLowerCase().includes(q) ||
          (tx.counterparty_name || "").toLowerCase().includes(q) ||
          tx.reference.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [transactions, direction, dateRange, search]);

  const visibleRows = useMemo(
    () => (limit ? filtered.slice(0, limit) : filtered),
    [filtered, limit]
  );

  const groupedByDate = useMemo(() => {
    const groups: { label: string; items: LedgerTransaction[] }[] = [];
    for (const tx of visibleRows) {
      const label = getDateGroupLabel(tx.created_at);
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.label !== label) {
        groups.push({ label, items: [tx] });
      } else {
        lastGroup.items.push(tx);
      }
    }
    return groups;
  }, [visibleRows]);

  const openTransactionDetail = (tx: LedgerTransaction) => {
    const meta = parseTransactionPresentation(tx);
    const nativeCurrency = normalizeCurrency(accountCurrencies[tx.account_id] || "EUR");
    const convertedAmount = convert(Number(tx.amount || 0), nativeCurrency);
    const normalizedStatus = (tx.status || "pending").toLowerCase();
    const modalStatus: TransactionModalStatus =
      normalizedStatus === "completed" ||
      normalizedStatus === "failed" ||
      normalizedStatus === "processing"
        ? (normalizedStatus as TransactionModalStatus)
        : "pending";

    setSelectedTx({
      traceId: tx.reference,
      amount: convertedAmount,
      currency,
      recipientName: meta.recipientOrSender,
      sourceAccountName: accountNames[tx.account_id],
      categoryLabel: meta.categoryLabel,
      status: modalStatus,
      createdAt: new Date(tx.created_at).toLocaleString("en-IE"),
      note: meta.cleanedDesc || undefined,
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "Date",
      "Reference ID",
      "Category",
      "Counterparty",
      "Direction",
      `Amount (${currency})`,
      "Native Amount",
      "Native Currency",
      "Status",
    ];
    const rows = filtered.map((tx) => {
      const meta = parseTransactionPresentation(tx);
      const nativeCurrency = normalizeCurrency(accountCurrencies[tx.account_id] || "EUR");
      const converted = convert(Number(tx.amount || 0), nativeCurrency);
      const signed = `${tx.transaction_type === "credit" ? "+" : "-"}${converted.toFixed(2)}`;
      return [
        new Date(tx.created_at).toISOString(),
        tx.reference,
        meta.categoryLabel,
        meta.recipientOrSender.replace(/"/g, '""'),
        tx.transaction_type === "credit" ? "Incoming" : "Outgoing",
        signed,
        Number(tx.amount || 0).toFixed(2),
        nativeCurrency,
        tx.status,
      ]
        .map((v) => `"${v}"`)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pentagon-statement-${currency.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const win = window.open("", "_blank", "width=960,height=720");
    if (!win) return;

    const htmlRows = filtered
      .map((tx) => {
        const meta = parseTransactionPresentation(tx);
        const nativeCurrency = normalizeCurrency(accountCurrencies[tx.account_id] || "EUR");
        const converted = convert(Number(tx.amount || 0), nativeCurrency);
        const amtText = `${tx.transaction_type === "credit" ? "+" : "-"}${formatCurrencyAmount(
          converted,
          currency
        )}`;
        return `<tr>
          <td>${new Date(tx.created_at).toLocaleString("en-IE")}</td>
          <td><strong>${meta.categoryLabel}</strong><br/><small>${meta.recipientOrSender}</small></td>
          <td style="font-family:monospace;font-size:11px;">${tx.reference}</td>
          <td style="text-transform:capitalize;">${tx.status}</td>
          <td style="text-align:right;font-family:monospace;font-weight:700;">${amtText}</td>
        </tr>`;
      })
      .join("");

    win.document.write(`<!doctype html>
      <html>
        <head>
          <title>Pentagon Finances — Statement (${currency})</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #020c1b; padding: 36px; }
            h1 { font-size: 20px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.06em; }
            p.sub { color: #64748b; font-size: 12px; margin: 0 0 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; border-bottom: 2px solid #020c1b; padding: 10px 8px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; color: #475569; }
            td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; vertical-align: top; }
          </style>
        </head>
        <body>
          <h1>Pentagon Finances SA — Account Statement</h1>
          <p class="sub">Established in Switzerland · Display Currency: ${currency} · Generated ${new Date().toLocaleString("en-IE")}</p>
          <table>
            <thead>
              <tr><th>Date &amp; Time</th><th>Description</th><th>Reference ID</th><th>Status</th><th style="text-align:right;">Amount</th></tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>`);
    win.document.close();
  };

  return (
    <>
      <section className="w-full bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-[#E8EDF4] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-[#101827] tracking-tight">
                  {title}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F8FAFC] border border-[#E8EDF4] text-[#718096] text-[11px] font-semibold">
                  {filtered.length} {filtered.length === 1 ? "transaction" : "transactions"}
                </span>
              </div>
              <p className="text-xs text-[#718096] mt-0.5">
                Multi-currency statement view in {currency} · Click any entry for full audit trail
              </p>
            </div>
            {showFullHistoryLink && (
              <Link
                href="/dashboard/transactions"
                className="lg:hidden inline-flex items-center gap-1 text-[11px] font-bold text-[#101827] hover:text-[#E85D65] uppercase tracking-wider whitespace-nowrap"
              >
                Full History <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filtered.length === 0}
              className="px-3.5 py-2 rounded-[12px] border border-[#E8EDF4] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 text-[#101827] text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#718096]" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={filtered.length === 0}
              className="px-3.5 py-2 rounded-[12px] border border-[#E8EDF4] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 text-[#101827] text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#718096]" />
              Export PDF
            </button>
            {showFullHistoryLink && (
              <Link
                href="/dashboard/transactions"
                className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#0B1220] hover:bg-[#17243A] text-white text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
              >
                View Full History <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Interactive Filter Toolbar */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-[#E8EDF4] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient, category, or reference ID..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E8EDF4] rounded-[10px] text-xs font-medium text-[#101827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B1220]/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 bg-white border border-[#E8EDF4] rounded-[12px] p-1">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "incoming", label: "Incoming" },
                  { id: "outgoing", label: "Outgoing" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDirection(opt.id)}
                  className={cn(
                    "px-3 py-1 rounded-[10px] text-[11px] font-bold transition-colors",
                    direction === opt.id
                      ? "bg-[#0B1220] text-white"
                      : "text-[#718096] hover:text-[#101827]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-[#E8EDF4] rounded-[10px] px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
              <select
                aria-label="Filter by date range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateFilter)}
                className="bg-transparent text-[11px] font-bold text-[#101827] outline-none cursor-pointer"
              >
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Rows */}
        {visibleRows.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-6 h-6 text-[#94A3B8]" />
            </div>
            <p className="text-sm font-bold text-[#101827]">No matching transactions</p>
            <p className="text-xs text-[#718096] mt-1 max-w-sm mx-auto">
              Adjust your search or filters to view recorded ledger entries.
            </p>
          </div>
        ) : (
          <div>
            {groupedByDate.map((group) => (
              <div key={group.label}>
                <div className="px-6 py-2 bg-[#F8FAFC] border-y border-[#E8EDF4] first:border-t-0 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                    {group.label}
                  </span>
                  <span className="text-[11px] text-[#94A3B8] font-medium">
                    {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
                  </span>
                </div>

                <div className="divide-y divide-[#E8EDF4]">
                  {group.items.map((tx) => {
                    const meta = parseTransactionPresentation(tx);
                    const { Icon, wrapperClass } = getLedgerIcon(meta.kind);
                    const nativeCurrency = normalizeCurrency(accountCurrencies[tx.account_id] || "EUR");
                    const convertedAmount = convert(Number(tx.amount || 0), nativeCurrency);
                    const isCredit = tx.transaction_type === "credit";
                    const formattedDateTime = new Date(tx.created_at).toLocaleDateString("en-IE", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <button
                        key={tx.id}
                        type="button"
                        onClick={() => openTransactionDetail(tx)}
                        className="w-full text-left px-6 py-4 min-h-[84px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 hover:bg-[#F8FAFC] transition-colors group"
                      >
                        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                          <div
                            className={cn(
                              "w-11 h-11 rounded-[12px] border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                              wrapperClass
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-sm font-bold text-[#101827] tracking-tight">
                                {meta.categoryLabel}
                              </span>
                              <span className="text-xs text-[#94A3B8]">·</span>
                              <span className="text-sm font-medium text-[#718096] break-words">
                                {meta.recipientOrSender}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#718096]">
                              <span>{formattedDateTime}</span>
                              {meta.authorizationNote && (
                                <>
                                  <span className="text-[#94A3B8]">·</span>
                                  <span>{meta.authorizationNote}</span>
                                </>
                              )}
                              <span className="text-[#94A3B8]">·</span>
                              <span className="font-mono text-[11px] text-[#94A3B8]">
                                Ref #{tx.reference.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 flex-shrink-0 pl-[58px] sm:pl-0">
                          <div className="text-right">
                            <p
                              className={cn(
                                "text-base font-bold font-mono tabular-nums tracking-tight",
                                isCredit ? "text-[#059669]" : "text-[#DC555D]"
                              )}
                            >
                              {isCredit ? "+" : "-"}
                              {formatCurrency(convertedAmount, currency)}
                            </p>
                            {nativeCurrency !== currency && (
                              <p className="text-[10px] font-mono text-[#94A3B8]">
                                ({formatCurrencyAmount(Number(tx.amount || 0), nativeCurrency)})
                              </p>
                            )}
                          </div>
                          <LedgerStatusBadge status={tx.status} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <TransactionStatusModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </>
  );
}
