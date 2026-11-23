"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export type TransactionModalStatus = "pending" | "completed" | "failed" | "processing";

export interface TransactionReceiptData {
  traceId: string;
  amount: number;
  currency: string;
  recipientName: string;
  recipientIdentifier?: string;
  sourceAccountName?: string;
  categoryLabel: string;
  status: TransactionModalStatus;
  createdAt?: string;
  note?: string;
}

interface TransactionStatusModalProps {
  transaction: TransactionReceiptData | null;
  onClose: () => void;
}

const STATUS_META: Record<
  TransactionModalStatus,
  {
    badgeLabel: string;
    heading: string;
    sublabel: string;
    pillClass: string;
    panelClass: string;
    panelIconClass: string;
    panelTitle: string;
    panelText: string;
  }
> = {
  pending: {
    badgeLabel: "Pending",
    heading: "Awaiting review",
    sublabel: "Transaction amount",
    pillClass: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    panelClass: "bg-amber-50/80 border-amber-200/80 text-amber-950",
    panelIconClass: "text-amber-600",
    panelTitle: "Compliance Review",
    panelText:
      "This transaction is awaiting the required review. The transaction status will be updated automatically once the review is completed.",
  },
  processing: {
    badgeLabel: "Processing",
    heading: "Processing settlement",
    sublabel: "Transaction amount",
    pillClass: "bg-sky-500/15 text-sky-300 border-sky-400/30",
    panelClass: "bg-sky-50/80 border-sky-200/80 text-sky-950",
    panelIconClass: "text-sky-600",
    panelTitle: "Clearing In Progress",
    panelText:
      "Your transaction is currently progressing through institutional clearing channels.",
  },
  completed: {
    badgeLabel: "Completed",
    heading: "Transaction successful",
    sublabel: "Transaction amount",
    pillClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    panelClass: "bg-emerald-50/80 border-emerald-200/80 text-emerald-950",
    panelIconClass: "text-emerald-600",
    panelTitle: "Settlement Verified",
    panelText:
      "This transaction has been authorized and settled directly to the Pentagon Finances core ledger.",
  },
  failed: {
    badgeLabel: "Failed",
    heading: "Transaction declined",
    sublabel: "Attempted amount",
    pillClass: "bg-accent-500/20 text-accent-300 border-accent-400/30",
    panelClass: "bg-red-50/80 border-red-200/80 text-red-950",
    panelIconClass: "text-accent-600",
    panelTitle: "Authorization Declined",
    panelText:
      "This transaction could not be completed. No funds remain held and any reserved balance has been released.",
  },
};

export function TransactionStatusModal({
  transaction,
  onClose,
}: TransactionStatusModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [transaction?.traceId]);

  useEffect(() => {
    if (!transaction) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [transaction, onClose]);

  const handleCopyRef = async () => {
    if (!transaction?.traceId || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(transaction.traceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadReceipt = () => {
    if (!transaction) return;
    const lines = [
      "PENTAGON FINANCES SA — TRANSACTION RECEIPT",
      "==========================================",
      `Status:        ${STATUS_META[transaction.status].badgeLabel.toUpperCase()} (${STATUS_META[transaction.status].heading})`,
      `Amount:        ${formatCurrency(transaction.amount, transaction.currency)}`,
      `Type:          ${transaction.categoryLabel}`,
      `Recipient:     ${transaction.recipientName}`,
      transaction.recipientIdentifier ? `Identifier:    ${transaction.recipientIdentifier}` : null,
      transaction.sourceAccountName ? `Source Vault:  ${transaction.sourceAccountName}` : null,
      `Reference ID:  ${transaction.traceId}`,
      `Timestamp:     ${transaction.createdAt || new Date().toISOString()}`,
      transaction.note ? `Narration:     ${transaction.note}` : null,
      "==========================================",
      "Pentagon Finances SA · Zurich, Switzerland",
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pentagon-receipt-${transaction.traceId.slice(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {transaction && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tx-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-brand-950/75 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full sm:w-[500px] max-w-[520px] max-h-[85vh] bg-white rounded-t-[20px] sm:rounded-[20px] border border-[#E8EDF4] shadow-[0_32px_90px_rgba(11,18,32,0.45)] flex flex-col overflow-hidden"
          >
            {/* Institutional Navy Header */}
            <div className="shrink-0 bg-[#0B1220] text-white px-6 py-5 border-b border-white/10 relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0B1220] via-[#E85D65] to-[#0B1220] opacity-85" />
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    id="tx-modal-title"
                    className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60"
                  >
                    Transaction Details
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      STATUS_META[transaction.status].pillClass
                    )}
                  >
                    {transaction.status === "pending" && <Clock className="w-3 h-3" />}
                    {transaction.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                    {transaction.status === "failed" && <XCircle className="w-3 h-3" />}
                    {STATUS_META[transaction.status].badgeLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close transaction details"
                  className="p-1.5 rounded-[10px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-3xl sm:text-[34px] font-bold font-mono tabular-nums tracking-tight text-white leading-tight">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
                <p className="text-[11px] font-medium text-white/55 mt-1">
                  {STATUS_META[transaction.status].sublabel} · {transaction.categoryLabel}
                </p>
              </div>
            </div>

            {/* Single Clean Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
              {/* Structured Summary Card */}
              <div className="bg-[#F8FAFC] border border-[#E8EDF4] rounded-[16px] divide-y divide-[#E8EDF4]">
                <div className="px-4 py-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                      Recipient
                    </p>
                    <p className="text-sm font-bold text-brand-950 mt-0.5 break-words">
                      {transaction.recipientName}
                    </p>
                    {transaction.recipientIdentifier && (
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5 break-all">
                        {transaction.recipientIdentifier}
                      </p>
                    )}
                  </div>
                  {transaction.sourceAccountName && (
                    <div className="text-right min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                        From Vault
                      </p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate max-w-[160px]">
                        {transaction.sourceAccountName}
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3.5 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                    Transaction Status
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      transaction.status === "completed"
                        ? "text-emerald-700"
                        : transaction.status === "failed"
                        ? "text-accent-600"
                        : "text-amber-700"
                    )}
                  >
                    {STATUS_META[transaction.status].heading}
                  </span>
                </div>

                <div className="px-4 py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                      Reference ID
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-brand-950 hover:bg-slate-100 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          Copy ID
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-mono font-semibold text-brand-950 break-all select-all">
                    {transaction.traceId}
                  </p>
                </div>
              </div>

              {/* Workflow Progress Indicator */}
              <div className="border border-slate-200/75 rounded-2xl p-4 space-y-3.5 bg-white">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                  Processing Workflow
                </p>

                <div className="space-y-3">
                  {/* Stage 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-950">Transaction initiated</p>
                      <p className="text-[11px] text-slate-500">Request received.</p>
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        transaction.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : transaction.status === "failed"
                          ? "bg-red-100 text-accent-600"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {transaction.status === "completed" ? (
                        <Check className="w-3 h-3" />
                      ) : transaction.status === "failed" ? (
                        <X className="w-3 h-3" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-950">Compliance review</p>
                      <p className="text-[11px] text-slate-500">
                        {transaction.status === "completed"
                          ? "Cleared."
                          : transaction.status === "failed"
                          ? "Declined during review."
                          : "In progress"}
                      </p>
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        transaction.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {transaction.status === "completed" ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-xs font-bold",
                          transaction.status === "completed" ? "text-brand-950" : "text-slate-500"
                        )}
                      >
                        Authorization and settlement
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {transaction.status === "completed"
                          ? "Funds committed to ledger."
                          : "Awaiting review completion."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Review / Status Notice Panel */}
              <div
                className={cn(
                  "rounded-[16px] border p-4 flex items-start gap-3",
                  STATUS_META[transaction.status].panelClass
                )}
              >
                {transaction.status === "pending" ? (
                  <ShieldAlert
                    className={cn("w-4 h-4 mt-0.5 flex-shrink-0", STATUS_META[transaction.status].panelIconClass)}
                  />
                ) : (
                  <ShieldCheck
                    className={cn("w-4 h-4 mt-0.5 flex-shrink-0", STATUS_META[transaction.status].panelIconClass)}
                  />
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                    {STATUS_META[transaction.status].panelTitle}
                  </p>
                  <p className="text-xs leading-relaxed opacity-85">
                    {STATUS_META[transaction.status].panelText}
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 px-6 py-4 bg-[#F8FAFC] border-t border-[#E8EDF4] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="px-4 py-3 rounded-[12px] border border-[#E8EDF4] bg-white hover:bg-[#F8FAFC] text-[#101827] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#718096]" />
                Download Receipt
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-[12px] bg-[#0B1220] hover:bg-[#17243A] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
