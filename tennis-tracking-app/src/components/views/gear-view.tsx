'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { equipmentRefreshAtom } from '@/store/atoms';
import { getAllEquipment, addEquipment, updateEquipment, logPlayHours, restrungEquipment } from '@/db/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Wrench,
  Plus,
  Clock,
  RefreshCcw,
  AlertCircle,
  Gauge,
  Timer,
} from 'lucide-react';
import type { Equipment } from '@/db/schema';

const RESTRING_THRESHOLD = 20; // hours

export function GearView() {
  const [refresh, setRefresh] = useAtom(equipmentRefreshAtom);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRacket, setNewRacket] = useState({ name: '', stringType: '', tension: '' });
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    setEquipment(getAllEquipment());
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData, refresh]);

  if (!mounted) return null;

  const handleAdd = () => {
    if (!newRacket.name.trim()) return;
    addEquipment({
      racketName: newRacket.name.trim(),
      stringType: newRacket.stringType.trim() || undefined,
      tension: newRacket.tension ? parseInt(newRacket.tension) : undefined,
    });
    setNewRacket({ name: '', stringType: '', tension: '' });
    setDialogOpen(false);
    setRefresh(r => r + 1);
  };

  const handleLogHours = (id: number) => {
    logPlayHours(id, 1);
    setRefresh(r => r + 1);
  };

  const handleRestring = (id: number) => {
    restrungEquipment(id);
    setRefresh(r => r + 1);
  };

  const getConditionColor = (hours: number): string => {
    const pct = (hours / RESTRING_THRESHOLD) * 100;
    if (pct >= 90) return 'text-rose-500';
    if (pct >= 70) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getConditionBg = (hours: number): string => {
    const pct = (hours / RESTRING_THRESHOLD) * 100;
    if (pct >= 90) return 'bg-rose-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-emerald-500" />
            Gear
          </h1>
          <p className="text-sm text-muted-foreground">{equipment.length} rackets tracked</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0" />
            }
          >
            <Plus className="h-4 w-4" />
            Add
          </DialogTrigger>
          <DialogContent className="sm:max-w-[340px]">
            <DialogHeader>
              <DialogTitle>Add Racket</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Racket name (e.g. Wilson Pro Staff)"
                value={newRacket.name}
                onChange={e => setNewRacket(r => ({ ...r, name: e.target.value }))}
                autoFocus
              />
              <Input
                placeholder="String type (e.g. Co-poly Hybrid)"
                value={newRacket.stringType}
                onChange={e => setNewRacket(r => ({ ...r, stringType: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Tension (lbs)"
                value={newRacket.tension}
                onChange={e => setNewRacket(r => ({ ...r, tension: e.target.value }))}
              />
              <Button
                onClick={handleAdd}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0"
              >
                Add Racket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Equipment List */}
      {equipment.length === 0 ? (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-8 text-center">
            <Wrench className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No equipment tracked yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Add your first racket to start tracking string life.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {equipment.map(item => {
            const hours = item.hoursPlayed ?? 0;
            const pct = Math.min((hours / RESTRING_THRESHOLD) * 100, 100);
            const needsRestring = hours >= RESTRING_THRESHOLD;

            return (
              <Card key={item.id} className={`border-border/30 bg-card/50 backdrop-blur ${needsRestring ? 'ring-1 ring-rose-500/30' : ''}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm flex items-center gap-1.5">
                        {item.racketName}
                        {needsRestring && (
                          <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.stringType && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {item.stringType}
                          </Badge>
                        )}
                        {item.tension && (
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Gauge className="h-3 w-3" /> {item.tension} lbs
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getConditionColor(hours)}`}>
                        {hours}h
                      </p>
                      <p className="text-[10px] text-muted-foreground">/ {RESTRING_THRESHOLD}h</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getConditionBg(hours)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Info Row */}
                  {item.lastRestrung && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      Last restrung: {new Date(item.lastRestrung).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleLogHours(item.id)}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      +1 Hour
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 gap-1.5 text-xs ${
                        needsRestring
                          ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500'
                          : ''
                      }`}
                      onClick={() => handleRestring(item.id)}
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Restrung
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
