# Cadence Tennis Tracker — Project Resume Handoff

Welcome back! This document outlines the current state of the Cadence Tennis app and the remaining tasks requested before your AI quota reset.

## Current State
- The Next.js 15 (export mode) + Capacitor iOS project is successfully initialized.
- **Core Views Built & Functional**: Dashboard, Members (CRUD), Session (Attendance & Live tracking), Ledger (Transactions), and Gear (Racket Tracking).
- The `ai-agent-timmy/tennis-tracking-app` has been tracked and committed to git so no progress is lost.

---

## Next Immediate Steps

When you resume, provide these pending requirements to the AI agent to pick up exactly where we left off:

### 1. Update Session/Dashboard for Monthly & Weekly Schedule
**Requirement:** Sessions happen every **Monday, Wednesday, and Friday**. The dashboard needs to be updated to calculate monthly totals based on this predefined schedule.
**Missing Implementation:**
- Need to calculate the total expected sessions in the current month based on the Mon/Wed/Fri schedule.
- Dashboard should reflect progress against this total (e.g. "Completed 5 out of 13 expected sessions this month") rather than just showing raw totals.
- Adjust `src/components/views/dashboard-view.tsx` and P&L math accordingly.

### 2. Move "Tip Ball Kid" to the End of the Session
**Requirement:** Tips should be recorded at the *end* of the session rather than dynamically during it.
**Implementation Steps required:**
- Edit `src/components/views/session-view.tsx`.
- Remove the tip input card from the live session view.
- Update the `handleEndSession()` flow. When the user clicks "End", instead of immediately closing the session, open a `<Dialog>` prompting "Do you want to tip the ball kid?".
- If a tip amount is entered, add the `TIP` ledger entry *alongside* the `COURT_FEE` expense before finally calling `endSession()`.

### 3. iOS Polish (Phase 7 remaining tasks)
- Set up iOS App Icons and Splash screen.
- Verify `npx cap sync ios` works smoothly and open it in Xcode.
- Tie the `Haptics.impact({ style: ImpactStyle.Heavy })` from Capacitor to the Momo QR payment button.

### 4. Web Deployment & Cloud Migration (Supabase)
**Requirement:** The app needs to be shareable via a web link so others can view the club data in real-time.
**Implementation Strategy Chosen:** Migrate from Local SQLite to **Supabase (Option A)**.
- Swap out the local storage/SQLite database layer for a remote Supabase Postgres database using Drizzle ORM.
- Deploy the web version to Vercel for free hosting.
- Implement basic Authentication: You get an "Admin" login to modify data, while the public can view the dashboard and attendance in a read-only state.

*Important Note for AI Agent:* The user has connected the official Supabase MCP Server. Feel free to use it to document and manage the database schema via the dashboard, but **we are keeping Drizzle ORM** as the core database client in the application code.

## How to Resume
Simply copy the text below and paste it to the AI tomorrow:
> "Hello! Let's resume work from `RESUME.md` inside `ai-agent-timmy/tennis-tracking-app`. I need you to implement point 1 (Mon/Wed/Fri monthly total calculations) and point 2 (moving the tip prompt to the End Session flow). After that, let's start point 4: migrating our database to Supabase and deploying to Vercel so we can share the app."
