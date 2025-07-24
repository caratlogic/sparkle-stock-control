import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(currency?: string): string {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'USD':
    default:
      return '$';
  }
}

export function formatCurrency(amount: number, currency?: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString()}`;
}
