Project: Cadence Tennis Tracker
Goal: A high-performance, local-first iOS app for managing tennis club attendance, finances, and gear maintenance.
1. Technical Stack
•	Framework: Next.js (App Router) using output: 'export'.
•	Mobile Wrapper: CapacitorJS (iOS platform).
•	State Management: Jotai (Atomic state for fine-grained reactivity).
•	Database: SQLite via @capacitor-community/sqlite.
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
});

// ledger.ts
export const ledger = sqliteTable('ledger', {
  id: integer('id').primaryKey(),
  sessionId: integer('session_id').references(() => sessions.id),
  memberId: integer('member_id').references(() => members.id),
  amount: integer('amount').notNull(),
  type: text('type').notNull(), // 'TIP', 'FINE', 'GUEST_FEE', 'EXPENSE'
  note: text('note'),
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
•	/(home)/page.tsx: Dashboard. Monthly P&L summary, net fund balance, and "Next Session" shortcut.
•	/members/page.tsx: Roster Management. Add/Edit/Archive members.
•	/session/page.tsx: Active Session.
•	Attendance checklist.
•	Quick-action buttons for "Lost Ball" (20k) and "Guest Fee" (100k).
•	"Tip Ball Kid" input field.
•	/ledger/page.tsx: Financial History. Filterable list of all transactions.
•	/gear/page.tsx: Maintenance. Track hours on strings and tension notes.
4. Specialized Logic & UI Components
•	Momo Integration: A dedicated modal that generates a static QR code using the user's phone number and the fixed 20,000 VND amount for "Lost Ball" fines.
•	Jotai Atoms:
•	sessionAtom: Holds current attendance state before persisting to SQLite.
•	ledgerUpdateAtom: Triggers re-calculation of the monthly dashboard when a fine is added.
•	Capacitor Haptics: Trigger Haptics.impact({ style: ImpactStyle.Heavy }) specifically on the "Donate 20k to Momo" button to emphasize the penalty.
5. Implementation Phases
	1.	Phase 1: Init Next.js + Tailwind + Capacitor. Setup SQLite driver with Drizzle.
	2.	Phase 2: Build the Members and Session views (Attendance logic).
	3.	Phase 3: Build the Ledger logic (Financial math for 100k guest fees and tips).
	4.	Phase 4: Gear tracking module (String life calculator).
	5.	Phase 5: Final iOS Polish: Splash screens, Icons, and Momo QR component.