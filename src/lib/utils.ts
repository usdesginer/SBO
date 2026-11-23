import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_CURRENCY, formatCurrencyAmount } from "@/lib/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric amount using multi-currency formatting with EUR as the primary currency.
 */
export function formatCurrency(
  amount: number,
  currency: string | null = DEFAULT_CURRENCY,
  options?: Intl.NumberFormatOptions
) {
  return formatCurrencyAmount(amount, currency, options);
}
