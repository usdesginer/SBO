"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  DEFAULT_RATES_FROM_EUR,
  DISPLAY_CURRENCY_BROADCAST,
  DISPLAY_CURRENCY_COOKIE,
  DISPLAY_CURRENCY_STORAGE_KEY,
  convertCurrency,
  formatCurrencyAmount,
  getCurrencyMeta,
  normalizeCurrency,
} from "@/lib/currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  symbol: string;
  rates: Record<CurrencyCode, number>;
  setCurrency: (next: CurrencyCode) => void;
  convert: (amount: number, fromCurrency?: string | null) => number;
  format: (
    amount: number,
    fromCurrency?: string | null,
    options?: Intl.NumberFormatOptions
  ) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  symbol: "€",
  rates: DEFAULT_RATES_FROM_EUR,
  setCurrency: () => {},
  convert: (amount, fromCurrency) =>
    convertCurrency(amount, fromCurrency, DEFAULT_CURRENCY, DEFAULT_RATES_FROM_EUR),
  format: (amount, fromCurrency, options) =>
    formatCurrencyAmount(
      convertCurrency(amount, fromCurrency, DEFAULT_CURRENCY, DEFAULT_RATES_FROM_EUR),
      DEFAULT_CURRENCY,
      options
    ),
});

export function CurrencyProvider({
  initialCurrency = DEFAULT_CURRENCY,
  children,
}: {
  initialCurrency?: CurrencyCode;
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() =>
    normalizeCurrency(initialCurrency)
  );
  const rates = DEFAULT_RATES_FROM_EUR;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DISPLAY_CURRENCY_STORAGE_KEY);
      if (saved) {
        const normalized = normalizeCurrency(saved);
        setCurrencyState(normalized);
        document.cookie = `${DISPLAY_CURRENCY_COOKIE}=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Ignore storage access restrictions
    }

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(DISPLAY_CURRENCY_BROADCAST);
      bc.onmessage = (e) => {
        if (e.data?.currency) {
          setCurrencyState(normalizeCurrency(e.data.currency));
        }
      };
    }

    return () => {
      bc?.close();
    };
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    const normalized = normalizeCurrency(next);
    setCurrencyState(normalized);
    try {
      localStorage.setItem(DISPLAY_CURRENCY_STORAGE_KEY, normalized);
      document.cookie = `${DISPLAY_CURRENCY_COOKIE}=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel(DISPLAY_CURRENCY_BROADCAST);
        bc.postMessage({ currency: normalized });
        bc.close();
      }
    } catch {
      // Ignore storage failures
    }
  }, []);

  const convert = useCallback(
    (amount: number, fromCurrency?: string | null) =>
      convertCurrency(amount, fromCurrency, currency, rates),
    [currency, rates]
  );

  const format = useCallback(
    (amount: number, fromCurrency?: string | null, options?: Intl.NumberFormatOptions) =>
      formatCurrencyAmount(
        convertCurrency(amount, fromCurrency, currency, rates),
        currency,
        options
      ),
    [currency, rates]
  );

  const meta = getCurrencyMeta(currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: meta.symbol,
        rates,
        setCurrency,
        convert,
        format,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
