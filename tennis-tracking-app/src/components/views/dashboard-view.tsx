'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { activeTabAtom, ledgerRefreshAtom, sessionsRefreshAtom } from '@/store/atoms';
import { getAllLedgerEntries, getAllSessions } from '@/db/client';
import { formatVND, calculateIncome, calculateExpenses, calculateBalance, getCurrentMonthEntries } from '@/lib/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PlayCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import type { LedgerEntry, Session } from '@/db/schema';

export function DashboardView() {
  const [, setActiveTab] = useAtom(activeTabAtom);
  const [ledgerRefresh] = useAtom(ledgerRefreshAtom);
  const [sessionsRefresh] = useAtom(sessionsRefreshAtom);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    setEntries(getAllLedgerEntries());
    setSessions(getAllSessions());
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData, ledgerRefresh, sessionsRefresh]);

  if (!mounted) return null;

  const monthEntries = getCurrentMonthEntries(entries);
  const income = calculateIncome(monthEntries);
  const expenses = calculateExpenses(monthEntries);
  const balance = calculateBalance(monthEntries);
  const totalBalance = calculateBalance(entries);
  const recentEntries = entries.slice(0, 5);
  const lastSession = sessions[0];

  const typeColors: Record<string, string> = {
    FINE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    GUEST_FEE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    TIP: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    EXPENSE: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    COURT_FEE: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Cadence
          </span>{' '}
          Tennis
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick Action */}
      <Button
        onClick={() => setActiveTab('session')}
        className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98] border-0"
      >
        <PlayCircle className="h-5 w-5 mr-2" />
        {lastSession?.isActive ? 'Continue Session' : 'Start New Session'}
      </Button>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <div className="rounded-lg bg-emerald-500/10 p-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Income</span>
            </div>
            <p className="text-lg font-bold">{formatVND(income)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">This month</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-rose-500 mb-2">
              <div className="rounded-lg bg-rose-500/10 p-1.5">
                <TrendingDown className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Expenses</span>
            </div>
            <p className="text-lg font-bold">{formatVND(expenses)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">This month</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-cyan-500 mb-2">
              <div className="rounded-lg bg-cyan-500/10 p-1.5">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Monthly P&L</span>
            </div>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {balance >= 0 ? '+' : ''}{formatVND(balance)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <div className="rounded-lg bg-amber-500/10 p-1.5">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total Balance</span>
            </div>
            <p className={`text-lg font-bold ${totalBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalBalance >= 0 ? '+' : ''}{formatVND(totalBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/40 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {recentEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No transactions yet. Start a session to begin tracking!
            </p>
          ) : (
            <div className="space-y-2">
              {recentEntries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-1 ${
                      ['FINE', 'GUEST_FEE'].includes(entry.type) ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    }`}>
                      {['FINE', 'GUEST_FEE'].includes(entry.type) ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                      )}
                    </div>
                    <div>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[entry.type] || ''}`}>
                        {entry.type.replace('_', ' ')}
                      </Badge>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    ['FINE', 'GUEST_FEE'].includes(entry.type) ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {['FINE', 'GUEST_FEE'].includes(entry.type) ? '+' : '-'}{formatVND(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
