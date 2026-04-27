'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { ledgerRefreshAtom, ledgerFilterAtom, membersRefreshAtom } from '@/store/atoms';
import { getAllLedgerEntries, getAllMembers } from '@/db/client';
import { formatVND, calculateIncome, calculateExpenses, calculateBalance } from '@/lib/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  X,
} from 'lucide-react';
import type { LedgerEntry, Member } from '@/db/schema';

const TYPES = ['FINE', 'GUEST_FEE', 'TIP', 'EXPENSE', 'COURT_FEE'];

const typeColors: Record<string, string> = {
  FINE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  GUEST_FEE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  TIP: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  EXPENSE: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  COURT_FEE: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export function LedgerView() {
  const [refresh] = useAtom(ledgerRefreshAtom);
  const [membersRefresh] = useAtom(membersRefreshAtom);
  const [filter, setFilter] = useAtom(ledgerFilterAtom);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    setEntries(getAllLedgerEntries());
    setMembers(getAllMembers());
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData, refresh, membersRefresh]);

  if (!mounted) return null;

  // Apply filters
  let filtered = entries;
  if (filter.type) {
    filtered = filtered.filter(e => e.type === filter.type);
  }
  if (filter.memberId) {
    filtered = filtered.filter(e => e.memberId === filter.memberId);
  }

  const income = calculateIncome(filtered);
  const expenses = calculateExpenses(filtered);
  const balance = calculateBalance(filtered);

  const getMemberName = (memberId: number | null): string => {
    if (!memberId) return '';
    return members.find(m => m.id === memberId)?.name ?? 'Unknown';
  };

  const hasActiveFilters = filter.type || filter.memberId;

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-500" />
            Ledger
          </h1>
          <p className="text-sm text-muted-foreground">{filtered.length} transactions</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative rounded-lg p-2 transition-colors ${
            showFilters || hasActiveFilters ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Filter className="h-5 w-5" />
          {hasActiveFilters && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardContent className="p-3 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilter(f => ({ ...f, type: f.type === type ? null : type }))}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      filter.type === type
                        ? typeColors[type]
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Member</label>
              <div className="flex flex-wrap gap-1.5">
                {members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setFilter(f => ({ ...f, memberId: f.memberId === member.id ? null : member.id }))}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      filter.memberId === member.id
                        ? 'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => setFilter({ type: null, memberId: null, dateFrom: null, dateTo: null })}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Income</p>
            <p className="text-sm font-bold text-emerald-500">{formatVND(income)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Expenses</p>
            <p className="text-sm font-bold text-rose-500">{formatVND(expenses)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Net</p>
            <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {balance >= 0 ? '+' : ''}{formatVND(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entries */}
      <div className="space-y-1.5">
        {filtered.length === 0 ? (
          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No transactions found.
            </CardContent>
          </Card>
        ) : (
          filtered.map(entry => (
            <Card key={entry.id} className="border-border/30 bg-card/50 backdrop-blur">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-1.5 ${
                      ['FINE', 'GUEST_FEE'].includes(entry.type) ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    }`}>
                      {['FINE', 'GUEST_FEE'].includes(entry.type) ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[entry.type] || ''}`}>
                          {entry.type.replace('_', ' ')}
                        </Badge>
                        {entry.memberId && (
                          <span className="text-xs text-muted-foreground">
                            {getMemberName(entry.memberId)}
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    ['FINE', 'GUEST_FEE'].includes(entry.type) ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {['FINE', 'GUEST_FEE'].includes(entry.type) ? '+' : '-'}{formatVND(entry.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
