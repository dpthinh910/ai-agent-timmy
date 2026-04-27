import { atom } from 'jotai';
import type { Member, Session, LedgerEntry, Equipment } from '@/db/schema';

// ============ SESSION STATE ============

// Current active session attendance tracking
export interface SessionState {
  sessionId: number | null;
  date: string;
  courtFee: number;
  attendees: number[]; // member IDs
  isActive: boolean;
}

export const sessionAtom = atom<SessionState>({
  sessionId: null,
  date: new Date().toISOString().split('T')[0],
  courtFee: 0,
  attendees: [],
  isActive: false,
});

// ============ REFRESH TRIGGERS ============

// Increment to trigger re-fetch of data
export const membersRefreshAtom = atom(0);
export const ledgerRefreshAtom = atom(0);
export const sessionsRefreshAtom = atom(0);
export const equipmentRefreshAtom = atom(0);
export const settingsRefreshAtom = atom(0);

// ============ UI STATE ============

export const activeTabAtom = atom<'home' | 'members' | 'session' | 'ledger' | 'gear' | 'settings'>('home');

// ============ FILTER STATE ============

export interface LedgerFilter {
  type: string | null;
  memberId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
}

export const ledgerFilterAtom = atom<LedgerFilter>({
  type: null,
  memberId: null,
  dateFrom: null,
  dateTo: null,
});
