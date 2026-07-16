'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Trash2, Layers } from 'lucide-react';
import { User, UserLandingPage } from '@/lib/supabase';

export default function AdminUserListMobile({
  filteredUsers,
  usersLoading,
  activateLoading,
  openActivateModal,
  openLandingsModal,
  setDeactivateModal,
  setDeleteDialog,
  getStatusBadge,
  renderLandingBadges,
}: {
  filteredUsers: User[];
  usersLoading: boolean;
  activateLoading: boolean;
  openActivateModal: (u: User) => void;
  openLandingsModal: (u: User) => void;
  setDeactivateModal: (v: { open: boolean; user: User | null }) => void;
  setDeleteDialog: (v: { open: boolean; user: User | null }) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  renderLandingBadges: (landingPages: UserLandingPage[]) => React.ReactNode;
}) {
  if (usersLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return <p className="text-slate-400 text-center py-8">Tidak ada user yang sesuai dengan pencarian.</p>;
  }

  return (
    <div className="grid gap-4 sm:hidden">
      {filteredUsers.map((u) => (
        <Card key={u.id} className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-white font-medium truncate">{u.username}</div>
                <div className="text-slate-300 text-sm break-words">{u.phone}</div>
              </div>
              <div className="flex-shrink-0">{getStatusBadge(u.status)}</div>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs text-slate-500">Landing Page</div>
                <div className="mt-1">{renderLandingBadges(u.landing_pages ?? [])}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Bot</div>
                <div className="mt-1">
                  {u.telegram_connected ? (
                    <Badge className="bg-emerald-600">Terhubung</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 border-slate-600">
                      Tidak
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={u.status === 'active'}
                  onCheckedChange={() =>
                    u.status === 'active'
                      ? setDeactivateModal({ open: true, user: u })
                      : openActivateModal(u)
                  }
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="text-slate-300 border-slate-600 hover:bg-slate-700"
                  disabled={u.status !== 'active'}
                  onClick={() => openLandingsModal(u)}
                >
                  <Layers className="w-4 h-4" />
                </Button>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="text-red-400 hover:text-red-300"
                onClick={() => setDeleteDialog({ open: true, user: u })}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {activateLoading ? (
              <div className="mt-3 text-xs text-slate-500">Memproses...</div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
