import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | string, decimals = 0): string {
  const num = Number(n);
  if (isNaN(num)) return '-';
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(decimals);
}

export function formatCurrency(n: number | string, currency = 'USD', decimals = 0): string {
  const num = Number(n);
  if (isNaN(num)) return '-';
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  if (Math.abs(num) >= 1e9) return `${symbol}${(num / 1e9).toFixed(1)}B`;
  if (Math.abs(num) >= 1e6) return `${symbol}${(num / 1e6).toFixed(1)}M`;
  if (Math.abs(num) >= 1e3) return `${symbol}${(num / 1e3).toFixed(1)}K`;
  return `${symbol}${num.toFixed(decimals)}`;
}

export function formatPercent(n: number | string, decimals = 1): string {
  const num = Number(n);
  if (isNaN(num)) return '-';
  return `${num.toFixed(decimals)}%`;
}

export function formatDate(d: string | Date): string {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDatetime(d: string | Date): string {
  if (!d) return '-';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function trendClass(value: number, positiveIsGood = true): string {
  if (value > 0) return positiveIsGood ? 'trend-up' : 'trend-down';
  if (value < 0) return positiveIsGood ? 'trend-down' : 'trend-up';
  return 'trend-flat';
}

export function trendIcon(value: number): string {
  if (value > 0) return '↑';
  if (value < 0) return '↓';
  return '→';
}

export function statusBadgeClass(status: string): string {
  const s = status?.toLowerCase();
  if (['active','cleared','settled','matched','success','approved','resolved'].includes(s)) return 'badge-success';
  if (['pending','processing','investigating','in_progress'].includes(s)) return 'badge-info';
  if (['warning','exception','dormant'].includes(s)) return 'badge-warning';
  if (['failed','blocked','declined','break','critical','open','unmatched'].includes(s)) return 'badge-danger';
  return 'badge-neutral';
}

export function getDefaultDateRange(days = 30): { dateFrom: string; dateTo: string } {
  const dateTo = new Date().toISOString().split('T')[0];
  const dateFrom = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  return { dateFrom, dateTo };
}
