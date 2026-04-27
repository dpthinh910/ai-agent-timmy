'use client';

import { useAtom } from 'jotai';
import { activeTabAtom } from '@/store/atoms';
import { Home, Users, PlayCircle, Receipt, Wrench } from 'lucide-react';

const tabs = [
  { id: 'home' as const, label: 'Home', icon: Home, href: '/' },
  { id: 'members' as const, label: 'Members', icon: Users, href: '/members' },
  { id: 'session' as const, label: 'Session', icon: PlayCircle, href: '/session' },
  { id: 'ledger' as const, label: 'Ledger', icon: Receipt, href: '/ledger' },
  { id: 'gear' as const, label: 'Gear', icon: Wrench, href: '/gear' },
] as const;

export function BottomNav() {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ id, label, icon: Icon, href }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all duration-200 ${
                isActive
                  ? 'text-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`relative rounded-xl p-1 transition-all duration-300 ${
                isActive ? 'bg-emerald-500/10 scale-110' : 'group-hover:bg-muted'
              }`}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-emerald-500" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all ${
                isActive ? 'font-semibold' : ''
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
