
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the currency symbol for a given currency code.
 * Defaults to '$' for USD or unknown codes.
 */
export function getCurrencySymbol(currencyCode: string = 'USD') {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    SEK: 'kr',
    NZD: 'NZ$',
    MXN: '$',
    SGD: 'S$',
    HKD: 'HK$',
    NOK: 'kr',
    KRW: '₩',
    TRY: '₺',
    RUB: '₽',
    BRL: 'R$',
    ZAR: 'R',
    AED: 'د.إ',
    SAR: 'ر.س',
  };
  return symbols[currencyCode] || '$';
}
