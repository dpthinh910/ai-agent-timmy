import type { LedgerEntry } from '@/db/schema';

/**
 * Format VND amount with thousand separators
 */
export function formatVND(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('vi-VN');
  return `${amount < 0 ? '-' : ''}${formatted}₫`;
}

/**
 * Calculate income (fines, guest fees) for a given period
 */
export function calculateIncome(entries: LedgerEntry[]): number {
  return entries
    .filter(e => ['FINE', 'GUEST_FEE'].includes(e.type))
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calculate expenses (tips, court fees, other expenses) for a given period
 */
export function calculateExpenses(entries: LedgerEntry[]): number {
  return entries
    .filter(e => ['TIP', 'EXPENSE', 'COURT_FEE'].includes(e.type))
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calculate net balance (income - expenses)
 */
export function calculateBalance(entries: LedgerEntry[]): number {
  return calculateIncome(entries) - calculateExpenses(entries);
}

/**
 * Get entries for a specific month
 */
export function getEntriesForMonth(entries: LedgerEntry[], year: number, month: number): LedgerEntry[] {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return entries.filter(e => e.createdAt.startsWith(monthStr));
}

/**
 * Get current month entries
 */
export function getCurrentMonthEntries(entries: LedgerEntry[]): LedgerEntry[] {
  const now = new Date();
  return getEntriesForMonth(entries, now.getFullYear(), now.getMonth());
}

/**
 * Common transaction amounts
 */
export const AMOUNTS = {
  LOST_BALL: 20_000,   // 20,000 VND
  GUEST_FEE: 100_000,  // 100,000 VND
} as const;
