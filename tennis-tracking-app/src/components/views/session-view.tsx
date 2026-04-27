'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import {
  sessionAtom,
  membersRefreshAtom,
  ledgerRefreshAtom,
  sessionsRefreshAtom,
} from '@/store/atoms';
import {
  getActiveMembers,
  getActiveSession,
  createSession,
  endSession,
  addLedgerEntry,
  getLedgerBySession,
} from '@/db/client';
import { formatVND, AMOUNTS, getPerSessionCost, getPerPersonCost } from '@/lib/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MomoQRModal } from '@/components/momo-qr-modal';
import {
  PlayCircle,
  StopCircle,
  CircleDot,
  UserCheck,
  AlertTriangle,
  UserPlus2,
  HandCoins,
  Check,
  X,
  DollarSign,
  Users,
} from 'lucide-react';
import type { Member, LedgerEntry } from '@/db/schema';

export function SessionView() {
  const [session, setSession] = useAtom(sessionAtom);
  const [membersRefresh] = useAtom(membersRefreshAtom);
  const [, setLedgerRefresh] = useAtom(ledgerRefreshAtom);
  const [, setSessionsRefresh] = useAtom(sessionsRefreshAtom);
  const [members, setMembers] = useState<Member[]>([]);
  const [sessionEntries, setSessionEntries] = useState<LedgerEntry[]>([]);
  const [courtFee, setCourtFee] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [ballKidName, setBallKidName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [fineDialog, setFineDialog] = useState(false);
  const [guestDialog, setGuestDialog] = useState(false);
  const [endDialog, setEndDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    setMembers(getActiveMembers());
    const activeSession = getActiveSession();
    if (activeSession) {
      setSession({
        sessionId: activeSession.id,
        date: activeSession.date,
        courtFee: activeSession.courtFee ?? 0,
        attendees: session.attendees,
        isActive: true,
      });
      setSessionEntries(getLedgerBySession(activeSession.id));
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData, membersRefresh]);

  if (!mounted) return null;

  const now = new Date();
  const perSessionCost = getPerSessionCost(now.getFullYear(), now.getMonth());
  const perPersonCost = getPerPersonCost(now.getFullYear(), now.getMonth(), session.attendees.length);

  const handleStartSession = () => {
    const fee = parseInt(courtFee) || 0;
    const newSession = createSession({
      date: new Date().toISOString().split('T')[0],
      courtFee: fee,
    });
    setSession({
      sessionId: newSession.id,
      date: newSession.date,
      courtFee: fee,
      attendees: [],
      isActive: true,
    });
    setCourtFee('');
    setSessionsRefresh(r => r + 1);
  };

  /** User clicks "End" → open the end-session dialog (tip prompt) */
  const handleRequestEnd = () => {
    setTipAmount('');
    setBallKidName('');
    setEndDialog(true);
  };

  /** Finalize the session: record court fee, optional tip, then close */
  const handleConfirmEnd = (includeTip: boolean) => {
    if (!session.sessionId) return;

    // Record court fee as expense
    if (session.courtFee > 0 && session.attendees.length > 0) {
      addLedgerEntry({
        sessionId: session.sessionId,
        memberId: null,
        amount: session.courtFee,
        type: 'COURT_FEE',
        note: `Court fee split among ${session.attendees.length} attendees`,
      });
    }

    // Record tip if provided
    if (includeTip && tipAmount) {
      const amount = parseInt(tipAmount);
      if (!isNaN(amount) && amount > 0) {
        const kidLabel = ballKidName.trim() || 'Ball kid';
        addLedgerEntry({
          sessionId: session.sessionId,
          memberId: null,
          amount,
          type: 'TIP',
          note: `Tip for ${kidLabel}`,
        });
      }
    }

    endSession(session.sessionId);
    setSession({
      sessionId: null,
      date: new Date().toISOString().split('T')[0],
      courtFee: 0,
      attendees: [],
      isActive: false,
    });
    setSessionEntries([]);
    setTipAmount('');
    setBallKidName('');
    setEndDialog(false);
    setLedgerRefresh(r => r + 1);
    setSessionsRefresh(r => r + 1);
  };

  const toggleAttendee = (memberId: number) => {
    setSession(prev => ({
      ...prev,
      attendees: prev.attendees.includes(memberId)
        ? prev.attendees.filter(id => id !== memberId)
        : [...prev.attendees, memberId],
    }));
  };

  const handleLostBall = (memberId: number, memberName: string) => {
    if (!session.sessionId) return;
    addLedgerEntry({
      sessionId: session.sessionId,
      memberId,
      amount: AMOUNTS.LOST_BALL,
      type: 'FINE',
      note: `Lost ball — ${memberName}`,
    });
    setSessionEntries(getLedgerBySession(session.sessionId));
    setLedgerRefresh(r => r + 1);
    setFineDialog(false);
    setSelectedMember(null);
  };

  const handleAddGuest = () => {
    if (!session.sessionId) return;
    const name = guestName.trim() || 'Guest';
    addLedgerEntry({
      sessionId: session.sessionId,
      memberId: null,
      amount: AMOUNTS.GUEST_FEE,
      type: 'GUEST_FEE',
      note: `Guest fee — ${name}`,
    });
    setSessionEntries(getLedgerBySession(session.sessionId));
    setLedgerRefresh(r => r + 1);
    setGuestName('');
    setGuestDialog(false);
  };

  if (!session.isActive) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-emerald-500" />
            New Session
          </h1>
          <p className="text-sm text-muted-foreground">Start a new tennis session</p>
        </div>

        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Court Fee (VND)</label>
              <Input
                type="number"
                placeholder="e.g. 400000"
                value={courtFee}
                onChange={e => setCourtFee(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Will be recorded as an expense when the session ends
              </p>
            </div>

            {/* Per-session cost info */}
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-violet-400">
                <DollarSign className="h-3.5 w-3.5" />
                Monthly Cost Breakdown
              </div>
              <p className="text-[11px] text-muted-foreground">
                Fixed cost per session: <span className="text-foreground font-semibold">{formatVND(perSessionCost)}</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Court rental + balls split across {now.toLocaleDateString('en-US', { month: 'long' })} sessions
              </p>
            </div>

            <Button
              onClick={handleStartSession}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-[0.98] border-0"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Start Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <CircleDot className="h-5 w-5 text-emerald-500 animate-pulse" />
            Live Session
          </h1>
          <p className="text-sm text-muted-foreground">{session.date}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRequestEnd}
          className="gap-1.5 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
        >
          <StopCircle className="h-4 w-4" />
          End
        </Button>
      </div>

      {/* Per-session cost banner */}
      <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 text-violet-400" />
            Session cost: <span className="text-foreground font-semibold">{formatVND(perSessionCost)}</span>
          </div>
          {session.attendees.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3 text-violet-400" />
              Per person: <span className="text-foreground font-semibold">{formatVND(perPersonCost)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Attendance */}
      <Card className="border-border/40 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            Attendance ({session.attendees.length}/{members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {members.map(member => {
              const isPresent = session.attendees.includes(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleAttendee(member.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                    isPresent
                      ? 'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {isPresent && <Check className="h-3 w-3" />}
                  {member.name}
                </button>
              );
            })}
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground">No members. Add members first.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lost Ball */}
        <Dialog open={fineDialog} onOpenChange={setFineDialog}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
              />
            }
          >
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs">Lost Ball ({formatVND(AMOUNTS.LOST_BALL)})</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[340px]">
            <DialogHeader>
              <DialogTitle>Who lost the ball?</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 pt-2">
              {members.filter(m => session.attendees.includes(m.id)).map(member => (
                <Button
                  key={member.id}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => handleLostBall(member.id, member.name)}
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{member.name[0]}</span>
                  </div>
                  {member.name}
                </Button>
              ))}
              {members.filter(m => session.attendees.includes(m.id)).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Mark attendees first
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Guest Fee */}
        <Dialog open={guestDialog} onOpenChange={setGuestDialog}>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                className="h-16 flex-col gap-1 border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
              />
            }
          >
            <UserPlus2 className="h-5 w-5" />
            <span className="text-xs">Guest Fee ({formatVND(AMOUNTS.GUEST_FEE)})</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[340px]">
            <DialogHeader>
              <DialogTitle>Add Guest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Guest Name</label>
                <Input
                  placeholder="e.g. Minh, Hoa..."
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Fee</span>
                <span className="font-semibold text-foreground">{formatVND(AMOUNTS.GUEST_FEE)}</span>
              </div>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0"
                onClick={handleAddGuest}
              >
                <UserPlus2 className="h-4 w-4 mr-2" />
                Add Guest & Charge Fee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Momo QR */}
      <div className="flex justify-center">
        <MomoQRModal amount={AMOUNTS.LOST_BALL} />
      </div>

      {/* Session Entries */}
      {sessionEntries.length > 0 && (
        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Session Log</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1.5">
              {sessionEntries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-md bg-background/50 p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {entry.type.replace('_', ' ')}
                    </Badge>
                    {entry.note && (
                      <span className="text-xs text-muted-foreground">{entry.note}</span>
                    )}
                  </div>
                  <span className="font-semibold text-xs">{formatVND(entry.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== End Session Dialog (Tip Prompt) ====== */}
      <Dialog open={endDialog} onOpenChange={setEndDialog}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-emerald-500" />
              End Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Would you like to tip the ball kid before ending the session?
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ball Kid Name</label>
              <Input
                placeholder="e.g. Tú, Hùng..."
                value={ballKidName}
                onChange={e => setBallKidName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tip Amount (VND)</label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={tipAmount}
                onChange={e => setTipAmount(e.target.value)}
              />
            </div>

            {/* Session summary before ending */}
            <div className="rounded-lg border border-border/30 bg-background/50 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Attendees</span>
                <span className="text-foreground font-medium">{session.attendees.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Session cost</span>
                <span className="text-foreground font-medium">{formatVND(perSessionCost)}</span>
              </div>
              {session.attendees.length > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Per person</span>
                  <span className="text-violet-400 font-semibold">{formatVND(perPersonCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Fines collected</span>
                <span className="text-emerald-500 font-medium">
                  {formatVND(sessionEntries.filter(e => e.type === 'FINE').reduce((s, e) => s + e.amount, 0))}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => handleConfirmEnd(false)}
              >
                <X className="h-4 w-4" />
                Skip & End
              </Button>
              <Button
                className="flex-1 gap-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0"
                onClick={() => handleConfirmEnd(true)}
                disabled={!tipAmount || parseInt(tipAmount) <= 0}
              >
                <HandCoins className="h-4 w-4" />
                Tip & End
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
