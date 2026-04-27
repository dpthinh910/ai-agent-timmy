Project: Cadence Tennis Tracker
Goal: A high-performance, local-first iOS app for managing tennis club attendance, finances, and gear maintenance.
1. Technical Stack
•	Framework: Next.js (App Router) using output: 'export'.
•	Mobile Wrapper: CapacitorJS (iOS platform).
•	State Management: Jotai (Atomic state for fine-grained reactivity).
•	Database: SQLite via @capacitor-community/sqlite (dev: localStorage; prod: Supabase Postgres via Drizzle ORM).
•	ORM: Drizzle ORM (Type-safe migrations and queries).
•	Styling: Tailwind CSS + shadcn/ui.
•	Icons: Lucide React (or SF Symbols via Capacitor).
2. Data Schema (Drizzle/SQLite)
// members.ts
export const members = sqliteTable('members', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

// sessions.ts
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey(),
  date: text('date').notNull(),
  courtFee: integer('court_fee').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

// ledger.ts
export const ledger = sqliteTable('ledger', {
  id: integer('id').primaryKey(),
  sessionId: integer('session_id').references(() => sessions.id),
  memberId: integer('member_id').references(() => members.id),
  amount: integer('amount').notNull(),
  type: text('type').notNull(), // 'TIP', 'FINE', 'GUEST_FEE', 'EXPENSE', 'COURT_FEE'
  note: text('note'),           // Stores: ball kid name, guest name, who lost ball
  createdAt: text('created_at').notNull(),
});

// equipment.ts
export const equipment = sqliteTable('equipment', {
  id: integer('id').primaryKey(),
  racketName: text('racket_name'),
  stringType: text('string_type'), // e.g., Co-poly Hybrid
  tension: integer('tension'),
  hoursPlayed: integer('hours_played').default(0),
  lastRestrung: text('last_restrung'),
});

3. File-Based Routing Structure (/app)
•	/(home)/page.tsx: Dashboard. Monthly P&L summary, session progress (Mon/Wed/Fri), monthly fixed costs breakdown, and net fund balance.
•	/members/page.tsx: Roster Management. Add/Edit/Archive members.
•	/session/page.tsx: Active Session.
	•	Attendance checklist.
	•	Quick-action buttons for "Lost Ball" (20k, records who lost it) and "Guest Fee" (100k, records guest name).
	•	Per-session and per-person cost breakdown banner.
	•	End-of-session dialog with ball kid name + tip amount prompt.
•	/ledger/page.tsx: Financial History. Filterable list of all transactions.
•	/gear/page.tsx: Maintenance. Track hours on strings and tension notes.

4. Monthly Fixed Costs
•	Court Rental: 14,040,000₫/month (ref: May 2025).
•	Tennis Balls: 3,000,000₫/month.
•	Total: 17,040,000₫/month.
•	Per-session cost = Total / number of Mon+Wed+Fri days in the month.
•	Per-person cost = Per-session cost / number of attendees.

5. Specialized Logic & UI Components
•	Momo Integration: A dedicated modal that generates a static QR code using the user's phone number and the fixed 20,000 VND amount for "Lost Ball" fines.
•	Session Schedule: Sessions are scheduled every Monday, Wednesday, and Friday. Dashboard tracks completed vs expected sessions per month.
•	Jotai Atoms:
	•	sessionAtom: Holds current attendance state before persisting to SQLite.
	•	ledgerUpdateAtom: Triggers re-calculation of the monthly dashboard when a fine is added.
•	Capacitor Haptics: Trigger Haptics.impact({ style: ImpactStyle.Heavy }) specifically on the "Donate 20k to Momo" button to emphasize the penalty.

6. Implementation Phases
	1.	Phase 1: Init Next.js + Tailwind + Capacitor. Setup SQLite driver with Drizzle. ✅
	2.	Phase 2: Build the Members and Session views (Attendance logic). ✅
	3.	Phase 3: Build the Ledger logic (Financial math for 100k guest fees and tips). ✅
	4.	Phase 4: Gear tracking module (String life calculator). ✅
	5.	Phase 5: Final iOS Polish: Splash screens, Icons, and Momo QR component. ✅ (Momo QR done, icons pending)
	6.	Phase 6: Mon/Wed/Fri session schedule, monthly cost calculations, enhanced tracking (ball kid names, guest names, who lost ball). ✅
	7.	Phase 7: Supabase cloud migration + Vercel deployment for web sharing. 🔜