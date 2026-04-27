import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  courtFee: integer('court_fee').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const ledger = sqliteTable('ledger', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').references(() => sessions.id),
  memberId: integer('member_id').references(() => members.id),
  amount: integer('amount').notNull(),
  type: text('type').notNull(), // 'TIP', 'FINE', 'GUEST_FEE', 'EXPENSE', 'COURT_FEE'
  note: text('note'),
  createdAt: text('created_at').notNull(),
});

export const equipment = sqliteTable('equipment', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  racketName: text('racket_name'),
  stringType: text('string_type'),
  tension: integer('tension'),
  hoursPlayed: integer('hours_played').default(0),
  lastRestrung: text('last_restrung'),
});

// Type exports
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type LedgerEntry = typeof ledger.$inferSelect;
export type NewLedgerEntry = typeof ledger.$inferInsert;
export type Equipment = typeof equipment.$inferSelect;
export type NewEquipment = typeof equipment.$inferInsert;
