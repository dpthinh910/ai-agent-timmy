import type { LedgerEntry, Session } from '@/db/schema';

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

// ============ SESSION SCHEDULE (Mon / Wed / Fri) ============

/** Days of the week when sessions are scheduled (1=Mon, 3=Wed, 5=Fri) */
const SESSION_DAYS = [1, 3, 5] as const;

/**
 * Count how many Mon/Wed/Fri days exist in a given month.
 */
export function getExpectedSessionsInMonth(year: number, month: number): number {
  // month is 0-indexed (Jan = 0)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    // getDay(): 0=Sun, 1=Mon, ..., 5=Fri
    if (SESSION_DAYS.includes(dow as 1 | 3 | 5)) count++;
  }
  return count;
}

/**
 * Count completed (non-active) sessions that fall in a given month.
 */
export function getCompletedSessionsInMonth(
  allSessions: Session[],
  year: number,
  month: number,
): number {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return allSessions.filter(s => !s.isActive && s.date.startsWith(monthStr)).length;
}

/**
 * Check whether today is a session day (Mon / Wed / Fri).
 */
export function isSessionDay(date: Date = new Date()): boolean {
  return SESSION_DAYS.includes(date.getDay() as 1 | 3 | 5);
}

/**
 * Get the name of the next session day relative to today.
 * Returns e.g. "Monday", "Wednesday", "Friday", or "Today" if today is a session day.
 */
export function getNextSessionDayLabel(date: Date = new Date()): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dow = date.getDay();
  if (SESSION_DAYS.includes(dow as 1 | 3 | 5)) return 'Today';
  // Walk forward until we find the next session day
  for (let offset = 1; offset <= 7; offset++) {
    const next = (dow + offset) % 7;
    if (SESSION_DAYS.includes(next as 1 | 3 | 5)) return dayNames[next];
  }
  return dayNames[1]; // fallback — Monday
}

