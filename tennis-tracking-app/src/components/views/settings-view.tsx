'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { settingsRefreshAtom, activeTabAtom } from '@/store/atoms';
import { getSettings, saveSettings, DEFAULT_SETTINGS, type ClubSettings } from '@/lib/settings';
import { getActiveMembers } from '@/db/client';
import {
  formatVND,
  getExpectedSessionsInMonth,
  getTotalMonthlyCost,
  getPerSessionCost,
  getSuggestedDuesPerPerson,
} from '@/lib/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Settings,
  ArrowLeft,
  DollarSign,
  Circle,
  Users,
  Clock,
  HandCoins,
  Lightbulb,
  Check,
  RotateCcw,
} from 'lucide-react';
import type { Member } from '@/db/schema';

/** Material UI-style input field with floating label and helper text */
function SettingsField({
  label,
  value,
  onChange,
  helper,
  suffix,
  type = 'number',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
  suffix?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-11 text-base pr-12"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            {suffix}
          </span>
        )}
      </div>
      {helper && (
        <p className="text-[10px] text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

export function SettingsView() {
  const [, setActiveTab] = useAtom(activeTabAtom);
  const [, setSettingsRefresh] = useAtom(settingsRefreshAtom);
  const [settings, setSettings] = useState<ClubSettings>(DEFAULT_SETTINGS);
  const [members, setMembers] = useState<Member[]>([]);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [courtRental, setCourtRental] = useState('');
  const [ballBudget, setBallBudget] = useState('');
  const [tipPerKid, setTipPerKid] = useState('');
  const [ballKidCount, setBallKidCount] = useState('');
  const [sessionHours, setSessionHours] = useState('');
  const [monthlyDues, setMonthlyDues] = useState('');

  const loadData = useCallback(() => {
    const s = getSettings();
    setSettings(s);
    setCourtRental(s.courtRentalMonthly.toString());
    setBallBudget(s.ballBudgetMonthly.toString());
    setTipPerKid(s.tipPerBallKid.toString());
    setBallKidCount(s.defaultBallKidCount.toString());
    setSessionHours(s.sessionDurationHours.toString());
    setMonthlyDues(s.monthlyDuesPerPerson > 0 ? s.monthlyDuesPerPerson.toString() : '');
    setMembers(getActiveMembers());
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  if (!mounted) return null;

  const now = new Date();
  const expectedSessions = getExpectedSessionsInMonth(now.getFullYear(), now.getMonth());

  // Build a "preview" settings object from current form values
  const previewSettings: ClubSettings = {
    courtRentalMonthly: parseInt(courtRental) || 0,
    ballBudgetMonthly: parseInt(ballBudget) || 0,
    tipPerBallKid: parseInt(tipPerKid) || 0,
    defaultBallKidCount: parseInt(ballKidCount) || 0,
    sessionDurationHours: parseInt(sessionHours) || 2,
    monthlyDuesPerPerson: parseInt(monthlyDues) || 0,
  };

  const totalMonthly = getTotalMonthlyCost(now.getFullYear(), now.getMonth(), previewSettings);
  const perSession = getPerSessionCost(now.getFullYear(), now.getMonth(), previewSettings);
  const suggestedDues = getSuggestedDuesPerPerson(now.getFullYear(), now.getMonth(), members.length, previewSettings);
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleSave = () => {
    saveSettings(previewSettings);
    setSettings(previewSettings);
    setSettingsRefresh(r => r + 1);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setCourtRental(DEFAULT_SETTINGS.courtRentalMonthly.toString());
    setBallBudget(DEFAULT_SETTINGS.ballBudgetMonthly.toString());
    setTipPerKid(DEFAULT_SETTINGS.tipPerBallKid.toString());
    setBallKidCount(DEFAULT_SETTINGS.defaultBallKidCount.toString());
    setSessionHours(DEFAULT_SETTINGS.sessionDurationHours.toString());
    setMonthlyDues('');
  };

  const handleUseSuggestion = () => {
    setMonthlyDues(suggestedDues.toString());
  };

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('home')}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 text-violet-500" />
            Club Settings
          </h1>
          <p className="text-xs text-muted-foreground">Configure costs and defaults</p>
        </div>
      </div>

      {/* Court Rental */}
      <Card className="border-border/40 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            Court Rental
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingsField
            label="Monthly Court Rental"
            value={courtRental}
            onChange={setCourtRental}
            suffix="VND"
            helper={`Ref: May 2025 = ${formatVND(14_040_000)}`}
          />
          <SettingsField
            label="Session Duration"
            value={sessionHours}
            onChange={setSessionHours}
            suffix="hours"
            helper="2 hours per session (2 courts)"
          />
        </CardContent>
      </Card>

      {/* Tennis Balls */}
      <Card className="border-border/40 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Circle className="h-4 w-4 text-lime-500" />
            Tennis Balls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingsField
            label="Monthly Ball Budget (18 packs)"
            value={ballBudget}
            onChange={setBallBudget}
            suffix="VND"
            helper={`Currently ${formatVND(parseInt(ballBudget) || 0)} for 18 packs/month`}
          />
        </CardContent>
      </Card>

      {/* Ball Kid Tips */}
      <Card className="border-border/40 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HandCoins className="h-4 w-4 text-emerald-500" />
            Ball Kid Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingsField
            label="Tip Per Ball Kid"
            value={tipPerKid}
            onChange={setTipPerKid}
            suffix="VND"
            helper={`${formatVND(parseInt(tipPerKid) || 0)} per ball kid per session`}
          />
          <SettingsField
            label="Default Ball Kid Count"
            value={ballKidCount}
            onChange={setBallKidCount}
            suffix="kids"
            helper="2 courts = 2 ball kids (may change on Fridays)"
          />
        </CardContent>
      </Card>

      {/* Monthly Dues with Suggestion */}
      <Card className="border-violet-500/20 bg-violet-500/5 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            Monthly Dues Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Suggestion chip */}
          <div className="rounded-lg border border-violet-500/20 bg-background/50 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-violet-400">
              <Lightbulb className="h-3.5 w-3.5" />
              Suggested Amount
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-violet-400">{formatVND(suggestedDues)}</p>
                <p className="text-[10px] text-muted-foreground">per person / month</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-400"
                onClick={handleUseSuggestion}
              >
                Use this
              </Button>
            </div>
            <div className="space-y-1 text-[10px] text-muted-foreground border-t border-border/30 pt-2 mt-2">
              <div className="flex justify-between">
                <span>Court</span>
                <span>{formatVND(parseInt(courtRental) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Balls</span>
                <span>{formatVND(parseInt(ballBudget) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tips ({expectedSessions} sessions × {ballKidCount} kids × {formatVND(parseInt(tipPerKid) || 0)})</span>
                <span>{formatVND((parseInt(tipPerKid) || 0) * (parseInt(ballKidCount) || 0) * expectedSessions)}</span>
              </div>
              <div className="h-px bg-border/30 my-0.5" />
              <div className="flex justify-between font-medium text-foreground">
                <span>Total ÷ {members.length} members</span>
                <span>{formatVND(totalMonthly)}</span>
              </div>
            </div>
          </div>

          <SettingsField
            label="Monthly Dues Per Person"
            value={monthlyDues}
            onChange={setMonthlyDues}
            suffix="VND"
            helper={`Leader collects this amount on the 25th of each month`}
          />
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="border-border/40 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-500" />
            {monthName} Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expected sessions</span>
            <span className="font-medium">{expectedSessions} (Mon·Wed·Fri)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total monthly cost</span>
            <span className="font-semibold text-amber-500">{formatVND(totalMonthly)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Per session</span>
            <span className="font-medium">{formatVND(perSession)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active members</span>
            <span className="font-medium">{members.length}</span>
          </div>
          {members.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Per person / month</span>
              <span className="font-semibold text-violet-400">{formatVND(suggestedDues)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save / Reset */}
      <div className="flex gap-3 pb-4">
        <Button
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Defaults
        </Button>
        <Button
          className={`flex-1 gap-1.5 text-white border-0 transition-all ${
            saved
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600'
          }`}
          onClick={handleSave}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
