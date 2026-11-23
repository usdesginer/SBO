export type CurrencyCode = "EUR" | "CHF" | "USD" | "GBP";

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";
export const DISPLAY_CURRENCY_COOKIE = "pentagon_display_currency";
export const DISPLAY_CURRENCY_STORAGE_KEY = "pentagon-display-currency";
export const DISPLAY_CURRENCY_BROADCAST = "pentagon-display-currency";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromEur: number;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "EUR", symbol: "€", name: "Euro", rateFromEur: 1 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", rateFromEur: 0.94 },
  { code: "USD", symbol: "$", name: "US Dollar", rateFromEur: 1.08 },
  { code: "GBP", symbol: "£", name: "British Pound", rateFromEur: 0.85 },
];

export const DEFAULT_RATES_FROM_EUR: Record<CurrencyCode, number> = {
  EUR: 1,
  CHF: 0.94,
  USD: 1.08,
  GBP: 0.85,
};

const SUPPORTED_SET = new Set<string>(CURRENCIES.map((c) => c.code));

export function normalizeCurrency(code?: string | null): CurrencyCode {
  const upper = (code || "").trim().toUpperCase();
  return SUPPORTED_SET.has(upper) ? (upper as CurrencyCode) : DEFAULT_CURRENCY;
}

export function getCurrencyMeta(code?: string | null): CurrencyMeta {
  const normalized = normalizeCurrency(code);
  return CURRENCIES.find((c) => c.code === normalized) ?? CURRENCIES[0];
}

/**
 * Converts an amount from its native account currency to the active display currency
 * using EUR as the base pivot rate.
 */
export function convertCurrency(
  amount: number,
  fromCurrency?: string | null,
  toCurrency: CurrencyCode = DEFAULT_CURRENCY,
  rates: Record<CurrencyCode, number> = DEFAULT_RATES_FROM_EUR
): number {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);
  if (from === to) return safeAmount;

  const fromRate = rates[from] || DEFAULT_RATES_FROM_EUR[from] || 1;
  const toRate = rates[to] || DEFAULT_RATES_FROM_EUR[to] || 1;
  const inEur = safeAmount / fromRate;
  return Number((inEur * toRate).toFixed(2));
}

export function formatCurrencyAmount(
  amount: number,
  currency: string | null = DEFAULT_CURRENCY,
  options?: Intl.NumberFormatOptions
): string {
  const normalized = normalizeCurrency(currency);
  const locale = normalized === "USD" ? "en-US" : "en-IE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalized,
    ...options,
  }).format(amount);
}
