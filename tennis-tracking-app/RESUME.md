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

### 4. Webview Deployment & Cloud Sync (New Request)
**Requirement:** The app needs to be shareable via a web link so others can view it.
**Technical Considerations to Implement:**
Currently, the app stores data **locally** on the device (localStorage on web, SQLite on iOS). If you deploy it to the web (e.g., via Vercel) right now, anyone opening the link will see an empty, local version of the app.
To share *your specific club's data* with others, we need to transition to a cloud model or sync model:
- **Option A (Cloud-First):** Replace the local database with a cloud database (like Supabase, Firebase, or Turso). The app talks to the cloud, so everyone sees the same data. We would also need to add basic Authentication (so members get a "View Only" role, and you keep an "Admin" role).
- **Option B (Local-First + Cloud Auth-Sync):** Keep the fast local SQLite for your iOS app, but run a background sync to a cloud database that the web version reads from.
- **Web App PWA Setup:** Add a `manifest.json` and service worker so the web version feels like a real app when others save it to their home screens.

_Note to AI:_ When resuming, start by confirming with the user whether they want "View Only" access for members or just to share the software itself. Then proceed with setting up Vercel + Cloud Database.

## How to Resume
Simply copy the text below and paste it to the AI tomorrow:
> "Hello! Let's resume work from `RESUME.md` inside `ai-agent-timmy/tennis-tracking-app`. I need you to implement point 1 (Mon/Wed/Fri monthly total calculations) and point 2 (moving the tip prompt to the End Session flow). After that, let's discuss strategy for point 4 (Webview sharing)."
