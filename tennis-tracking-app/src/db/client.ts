/**
 * SQLite Database Client
 * 
 * For development (browser), we use a simple in-memory store.
 * For production (Capacitor/iOS), we use @capacitor-community/sqlite.
 * 
 * This module provides a thin abstraction over raw SQL operations.
 */

import { members, sessions, ledger, equipment } from './schema';
import type { Member, NewMember, Session, NewSession, LedgerEntry, NewLedgerEntry, Equipment, NewEquipment } from './schema';

// Simple in-memory database for web development
// In production, this would be replaced with @capacitor-community/sqlite
interface Database {
  members: Member[];
  sessions: Session[];
  ledger: LedgerEntry[];
  equipment: Equipment[];
  nextId: { members: number; sessions: number; ledger: number; equipment: number };
}

let db: Database = {
  members: [],
  sessions: [],
  ledger: [],
  equipment: [],
  nextId: { members: 1, sessions: 1, ledger: 1, equipment: 1 },
};

// Load from localStorage if available
function loadFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('cadence_tennis_db');
    if (stored) {
      db = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load database from storage:', e);
  }
}

function saveToStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('cadence_tennis_db', JSON.stringify(db));
  } catch (e) {
    console.warn('Failed to save database to storage:', e);
  }
}

// Initialize on module load
loadFromStorage();

// ============ MEMBERS ============

export function getAllMembers(): Member[] {
  loadFromStorage();
  return [...db.members];
}

export function getActiveMembers(): Member[] {
  loadFromStorage();
  return db.members.filter(m => m.isActive);
}

export function getMemberById(id: number): Member | undefined {
  loadFromStorage();
  return db.members.find(m => m.id === id);
}

export function addMember(data: { name: string }): Member {
  loadFromStorage();
  const member: Member = {
    id: db.nextId.members++,
    name: data.name,
    isActive: true,
  };
  db.members.push(member);
  saveToStorage();
  return member;
}

export function updateMember(id: number, data: Partial<Pick<Member, 'name' | 'isActive'>>): Member | undefined {
  loadFromStorage();
  const idx = db.members.findIndex(m => m.id === id);
  if (idx === -1) return undefined;
  db.members[idx] = { ...db.members[idx], ...data };
  saveToStorage();
  return db.members[idx];
}

// ============ SESSIONS ============

export function getAllSessions(): Session[] {
  loadFromStorage();
  return [...db.sessions].sort((a, b) => b.date.localeCompare(a.date));
}

export function getActiveSession(): Session | undefined {
  loadFromStorage();
  return db.sessions.find(s => s.isActive);
}

export function createSession(data: { date: string; courtFee: number }): Session {
  loadFromStorage();
  const session: Session = {
    id: db.nextId.sessions++,
    date: data.date,
    courtFee: data.courtFee,
    isActive: true,
  };
  db.sessions.push(session);
  saveToStorage();
  return session;
}

export function endSession(id: number): Session | undefined {
  loadFromStorage();
  const idx = db.sessions.findIndex(s => s.id === id);
  if (idx === -1) return undefined;
  db.sessions[idx] = { ...db.sessions[idx], isActive: false };
  saveToStorage();
  return db.sessions[idx];
}

// ============ LEDGER ============

export function getAllLedgerEntries(): LedgerEntry[] {
  loadFromStorage();
  return [...db.ledger].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLedgerBySession(sessionId: number): LedgerEntry[] {
  loadFromStorage();
  return db.ledger.filter(l => l.sessionId === sessionId);
}

export function getLedgerByMember(memberId: number): LedgerEntry[] {
  loadFromStorage();
  return db.ledger.filter(l => l.memberId === memberId);
}

export function addLedgerEntry(data: {
  sessionId: number | null;
  memberId: number | null;
  amount: number;
  type: string;
  note?: string;
}): LedgerEntry {
  loadFromStorage();
  const entry: LedgerEntry = {
    id: db.nextId.ledger++,
    sessionId: data.sessionId,
    memberId: data.memberId,
    amount: data.amount,
    type: data.type,
    note: data.note ?? null,
    createdAt: new Date().toISOString(),
  };
  db.ledger.push(entry);
  saveToStorage();
  return entry;
}

// ============ EQUIPMENT ============

export function getAllEquipment(): Equipment[] {
  loadFromStorage();
  return [...db.equipment];
}

export function addEquipment(data: {
  racketName: string;
  stringType?: string;
  tension?: number;
}): Equipment {
  loadFromStorage();
  const item: Equipment = {
    id: db.nextId.equipment++,
    racketName: data.racketName,
    stringType: data.stringType ?? null,
    tension: data.tension ?? null,
    hoursPlayed: 0,
    lastRestrung: new Date().toISOString().split('T')[0],
  };
  db.equipment.push(item);
  saveToStorage();
  return item;
}

export function updateEquipment(id: number, data: Partial<Pick<Equipment, 'racketName' | 'stringType' | 'tension' | 'hoursPlayed' | 'lastRestrung'>>): Equipment | undefined {
  loadFromStorage();
  const idx = db.equipment.findIndex(e => e.id === id);
  if (idx === -1) return undefined;
  db.equipment[idx] = { ...db.equipment[idx], ...data };
  saveToStorage();
  return db.equipment[idx];
}

export function logPlayHours(id: number, hours: number): Equipment | undefined {
  loadFromStorage();
  const idx = db.equipment.findIndex(e => e.id === id);
  if (idx === -1) return undefined;
  db.equipment[idx] = {
    ...db.equipment[idx],
    hoursPlayed: (db.equipment[idx].hoursPlayed ?? 0) + hours,
  };
  saveToStorage();
  return db.equipment[idx];
}

export function restrungEquipment(id: number): Equipment | undefined {
  loadFromStorage();
  const idx = db.equipment.findIndex(e => e.id === id);
  if (idx === -1) return undefined;
  db.equipment[idx] = {
    ...db.equipment[idx],
    hoursPlayed: 0,
    lastRestrung: new Date().toISOString().split('T')[0],
  };
  saveToStorage();
  return db.equipment[idx];
}
