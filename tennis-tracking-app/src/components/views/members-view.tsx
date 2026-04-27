'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { membersRefreshAtom } from '@/store/atoms';
import { getAllMembers, addMember, updateMember } from '@/db/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Users, UserCheck, UserX, Pencil, Check, X } from 'lucide-react';
import type { Member } from '@/db/schema';

export function MembersView() {
  const [refresh, setRefresh] = useAtom(membersRefreshAtom);
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadMembers = useCallback(() => {
    setMembers(getAllMembers());
  }, []);

  useEffect(() => {
    setMounted(true);
    loadMembers();
  }, [loadMembers, refresh]);

  if (!mounted) return null;

  const activeMembers = members.filter(m => m.isActive);
  const archivedMembers = members.filter(m => !m.isActive);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMember({ name: newName.trim() });
    setNewName('');
    setDialogOpen(false);
    setRefresh(r => r + 1);
  };

  const handleToggleActive = (id: number, current: boolean) => {
    updateMember(id, { isActive: !current });
    setRefresh(r => r + 1);
  };

  const handleEdit = (id: number) => {
    if (!editName.trim()) return;
    updateMember(id, { name: editName.trim() });
    setEditingId(null);
    setEditName('');
    setRefresh(r => r + 1);
  };

  const startEdit = (member: Member) => {
    setEditingId(member.id);
    setEditName(member.name);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Members
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeMembers.length} active · {archivedMembers.length} archived
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0" />
            }
          >
            <UserPlus className="h-4 w-4" />
            Add
          </DialogTrigger>
          <DialogContent className="sm:max-w-[340px]">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Member name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <Button onClick={handleAdd} className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Members */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Active Members
        </h2>
        {activeMembers.length === 0 ? (
          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No members yet. Add your first team member!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {activeMembers.map(member => (
              <Card key={member.id} className="border-border/30 bg-card/50 backdrop-blur">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {editingId === member.id ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            className="h-7 w-32 text-sm"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleEdit(member.id)}
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(member.id)}>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-medium text-sm">{member.name}</span>
                      )}
                    </div>
                    {editingId !== member.id && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => startEdit(member)}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleToggleActive(member.id, true)}
                        >
                          <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Archived Members */}
      {archivedMembers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Archived
          </h2>
          <div className="space-y-1.5">
            {archivedMembers.map(member => (
              <Card key={member.id} className="border-border/30 bg-card/30 opacity-60">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-bold text-muted-foreground">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-sm text-muted-foreground">{member.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Archived</Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleToggleActive(member.id, false)}
                    >
                      <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
