"use client";

import { CURRENCIES, CurrencyCode, formatCurrencyAmount, normalizeCurrency } from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";
import { cn } from "@/lib/utils";

export function DisplayMoney({
  amount,
  fromCurrency = "EUR",
  options,
  sign = "",
  showNativeHint = false,
  className,
}: {
  amount: number;
  fromCurrency?: string | null;
  options?: Intl.NumberFormatOptions;
  sign?: string;
  showNativeHint?: boolean;
  className?: string;
}) {
  const { currency, format } = useCurrency();
  const nativeCode = normalizeCurrency(fromCurrency);
  const convertedText = `${sign}${format(amount, nativeCode, options)}`;

  if (!showNativeHint || nativeCode === currency) {
    return <span className={className}>{convertedText}</span>;
  }

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span>{convertedText}</span>
      <span className="text-[10px] font-mono opacity-60 font-normal tracking-normal">
        Held: {formatCurrencyAmount(amount, nativeCode, options)}
      </span>
    </span>
  );
}

export function DisplayMoneySum({
  items,
  options,
  className,
}: {
  items: { amount: number; currency?: string | null }[];
  options?: Intl.NumberFormatOptions;
  className?: string;
}) {
  const { currency, convert } = useCurrency();
  const total = items.reduce(
    (sum, item) => sum + convert(Number(item.amount || 0), item.currency),
    0
  );
  return <span className={className}>{formatCurrencyAmount(total, currency, options)}</span>;
}

export function DisplayCurrencyCode({ className }: { className?: string }) {
  const { currency } = useCurrency();
  return <span className={className}>{currency}</span>;
}

export function DisplayCurrencySymbol({ className }: { className?: string }) {
  const { symbol } = useCurrency();
  return <span className={className}>{symbol}</span>;
}

export function DisplayCurrencySelector({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "panel";
  className?: string;
}) {
  const { currency, setCurrency, rates } = useCurrency();

  if (variant === "panel") {
    return (
      <div
        className={cn(
          "bg-white rounded-[20px] border border-[#E8EDF4] shadow-[var(--shadow-card)] p-6",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <p className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
              Display Currency
            </p>
            <p className="text-xs font-medium text-[#101827] mt-0.5">
              Primary display currency: <span className="font-bold text-[#E85D65]">{currency}</span> · Live FX Conversion
            </p>
          </div>
          <span className="text-[11px] font-mono tabular-nums font-medium text-[#718096] bg-[#F8FAFC] border border-[#E8EDF4] px-3 py-1 rounded-full self-start sm:self-auto">
            1 EUR = {rates.CHF.toFixed(2)} CHF · {rates.USD.toFixed(2)} USD · {rates.GBP.toFixed(2)} GBP
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CURRENCIES.map((c) => {
            const active = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code as CurrencyCode)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[12px] border text-left transition-all",
                  active
                    ? "bg-[#0B1220] border-[#0B1220] text-white shadow-sm"
                    : "bg-[#F8FAFC] border-[#E8EDF4] text-[#101827] hover:bg-white hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "w-9 h-9 rounded-[10px] flex items-center justify-center font-mono font-bold text-sm flex-shrink-0",
                    active ? "bg-white/15 text-white" : "bg-white border border-[#E8EDF4] text-[#101827]"
                  )}
                >
                  {c.symbol}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-wide">{c.code}</p>
                  <p className={cn("text-[11px] truncate", active ? "text-white/65" : "text-[#718096]")}>
                    {c.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Select display currency"
      className={cn(
        "flex items-center gap-0.5 bg-[#F8FAFC] border border-[#E8EDF4] rounded-[12px] p-1",
        className
      )}
    >
      {CURRENCIES.map((c) => {
        const active = currency === c.code;
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => setCurrency(c.code as CurrencyCode)}
            title={`${c.code} — ${c.name}`}
            className={cn(
              "px-2.5 py-1 rounded-[10px] text-[11px] font-semibold transition-all flex items-center gap-1",
              active
                ? "bg-[#0B1220] text-white shadow-xs"
                : "text-[#718096] hover:text-[#101827]"
            )}
          >
            <span>{c.symbol}</span>
            <span className="hidden xl:inline">{c.code}</span>
          </button>
        );
      })}
    </div>
  );
}
