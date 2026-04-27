'use client';

import { Provider } from 'jotai';
import { useAtom } from 'jotai';
import { activeTabAtom } from '@/store/atoms';
import { BottomNav } from '@/components/bottom-nav';
import { DashboardView } from '@/components/views/dashboard-view';
import { MembersView } from '@/components/views/members-view';
import { SessionView } from '@/components/views/session-view';
import { LedgerView } from '@/components/views/ledger-view';
import { GearView } from '@/components/views/gear-view';

function AppContent() {
  const [activeTab] = useAtom(activeTabAtom);

  return (
    <>
      <main className="flex-1 pb-20 pt-[env(safe-area-inset-top)]">
        {activeTab === 'home' && <DashboardView />}
        {activeTab === 'members' && <MembersView />}
        {activeTab === 'session' && <SessionView />}
        {activeTab === 'ledger' && <LedgerView />}
        {activeTab === 'gear' && <GearView />}
      </main>
      <BottomNav />
    </>
  );
}

export default function HomePage() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}
