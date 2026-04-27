'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { activeTabAtom, ledgerRefreshAtom, sessionsRefreshAtom, settingsRefreshAtom } from '@/store/atoms';
import { getAllLedgerEntries, getAllSessions } from '@/db/client';
import {
  formatVND,
  calculateIncome,
  calculateExpenses,
  calculateBalance,
  getCurrentMonthEntries,
  getExpectedSessionsInMonth,
  getCompletedSessionsInMonth,
  isSessionDay,
  getNextSessionDayLabel,
  getTotalMonthlyCost,
  getPerSessionCost,
} from '@/lib/finance';
import { getSettings } from '@/lib/settings';
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
  CalendarDays,
  DollarSign,
} from 'lucide-react';
import type { LedgerEntry, Session } from '@/db/schema';

export function DashboardView() {
  const [, setActiveTab] = useAtom(activeTabAtom);
  const [ledgerRefresh] = useAtom(ledgerRefreshAtom);
  const [sessionsRefresh] = useAtom(sessionsRefreshAtom);
  const [settingsRefresh] = useAtom(settingsRefreshAtom);
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
  }, [loadData, ledgerRefresh, sessionsRefresh, settingsRefresh]);

  if (!mounted) return null;

  const now = new Date();
  const monthEntries = getCurrentMonthEntries(entries);
  const income = calculateIncome(monthEntries);
  const expenses = calculateExpenses(monthEntries);
  const balance = calculateBalance(monthEntries);
  const totalBalance = calculateBalance(entries);
  const recentEntries = entries.slice(0, 5);
  const lastSession = sessions[0];

  // Monthly session schedule
  const expectedSessions = getExpectedSessionsInMonth(now.getFullYear(), now.getMonth());
  const completedSessions = getCompletedSessionsInMonth(sessions, now.getFullYear(), now.getMonth());
  const sessionProgress = expectedSessions > 0 ? (completedSessions / expectedSessions) * 100 : 0;
  const sessionDayToday = isSessionDay(now);
  const nextDayLabel = getNextSessionDayLabel(now);
  const avgCostPerSession = completedSessions > 0 ? Math.round(expenses / completedSessions) : 0;
  const perSessionCost = getPerSessionCost(now.getFullYear(), now.getMonth());

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {sessionDayToday && (
            <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Session Day 🎾
            </Badge>
          )}
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

      {/* Monthly Session Progress */}
      <Card className="border-border/40 bg-card/50 backdrop-blur overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-500/10 p-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Session Progress</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{monthName}</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-bold">
                <span className="text-violet-400">{completedSessions}</span>
                <span className="text-muted-foreground text-base font-normal"> / {expectedSessions}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Mon · Wed · Fri schedule
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {/* Circular progress ring */}
              <div className="relative h-12 w-12">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                  />
                  <circle
                    cx="18" cy="18" r="15"
                    fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="3"
                    strokeDasharray={`${sessionProgress} ${100 - sessionProgress}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="progressGrad">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-violet-400">
                  {Math.round(sessionProgress)}%
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {nextDayLabel === 'Today' ? '🎾 Play today!' : `Next: ${nextDayLabel}`}
              </span>
            </div>
          </div>
          {/* Progress bar fallback */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
              style={{ width: `${sessionProgress}%` }}
            />
          </div>
          {avgCostPerSession > 0 && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Avg. cost per session: <span className="text-foreground font-medium">{formatVND(avgCostPerSession)}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Cost Breakdown */}
      <Card className="border-border/40 bg-card/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-amber-500/10 p-1.5">
              <DollarSign className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Monthly Fixed Costs</span>
            <span className="text-[10px] text-muted-foreground ml-auto">{monthName}</span>
          </div>
          {(() => {
            const s = getSettings();
            const totalMonthly = getTotalMonthlyCost(now.getFullYear(), now.getMonth(), s);
            const totalTips = s.tipPerBallKid * s.defaultBallKidCount * expectedSessions;
            return (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Court rental</span>
                  <span className="font-medium">{formatVND(s.courtRentalMonthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tennis balls</span>
                  <span className="font-medium">{formatVND(s.ballBudgetMonthly)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ball kid tips ({expectedSessions}×{s.defaultBallKidCount}×{formatVND(s.tipPerBallKid)})</span>
                  <span className="font-medium">{formatVND(totalTips)}</span>
                </div>
                <div className="h-px bg-border/50 my-1" />
                <div className="flex justify-between font-semibold">
                  <span>Total monthly</span>
                  <span className="text-amber-500">{formatVND(totalMonthly)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>÷ {expectedSessions} sessions</span>
                  <span className="text-foreground font-medium">{formatVND(perSessionCost)} / session</span>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

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
