'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, LogOut, Trash2, Send, Layers, UserPlus, Pencil } from 'lucide-react';
import { LandingTemplate, User, UserLandingPage } from '@/lib/supabase';
import { getAdminUserDisplayStatus } from '@/lib/admin-user-status';
import { getLandingExpiryDate } from '@/lib/landing-utils';
import AdminUserListMobile from './AdminUserListMobile';

type LandingFormState = Record<string, { enabled: boolean; duration_days: number }>;

function initLandingForm(user: User | null, templates: LandingTemplate[]): LandingFormState {
  const form: LandingFormState = {};
  for (const t of templates) {
    const existing = user?.landing_pages?.find((lp) => lp.template_id === t.id);
    form[t.id] = {
      enabled: existing?.is_enabled ?? false,
      duration_days: existing?.duration_days ?? 30,
    };
  }
  return form;
}

type UserFormState = {
  username: string;
  phone: string;
  password: string;
};

const EMPTY_USER_FORM: UserFormState = { username: '', phone: '', password: '' };

function userToForm(user: User): UserFormState {
  return {
    username: user.username,
    phone: user.phone,
    password: '',
  };
}

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<LandingTemplate[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activateModal, setActivateModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [landingsModal, setLandingsModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [deactivateModal, setDeactivateModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [landingForm, setLandingForm] = useState<LandingFormState>({});
  const [activateLoading, setActivateLoading] = useState(false);
  const [landingsLoading, setLandingsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [createForm, setCreateForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [editForm, setEditForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [antiSpamLoadingId, setAntiSpamLoadingId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const landingSlugs = (u.landing_pages ?? []).map((lp) => lp.subdomain_slug).join(' ');
    const landingNames = (u.landing_pages ?? []).map((lp) => lp.template_name).join(' ');
    return (
      u.username.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term) ||
      u.status.toLowerCase().includes(term) ||
      getAdminUserDisplayStatus(u).toLowerCase().includes(term) ||
      landingSlugs.toLowerCase().includes(term) ||
      landingNames.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'super_admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/landings', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch {
      toast.error('Gagal memuat template landing');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const usersData = typeof data.users === 'string' ? JSON.parse(data.users) : data.users;
        setUsers(
          (usersData || []).map((u: User) => ({
            ...u,
            anti_spam_enabled: u.anti_spam_enabled ?? false,
            landing_pages: u.landing_pages ?? [],
          }))
        );
      }
    } catch {
      toast.error('Gagal memuat data user');
    }
    setUsersLoading(false);
  }, []);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchUsers();
      fetchTemplates();
    }
  }, [user, fetchUsers, fetchTemplates]);

  useEffect(() => {
    if (landingsModal.open && landingsModal.user && templates.length > 0) {
      setLandingForm(initLandingForm(landingsModal.user, templates));
    }
  }, [landingsModal.open, landingsModal.user, templates]);

  const openActivateModal = (userToActivate: User) => {
    setActivateModal({ open: true, user: userToActivate });
  };

  const openLandingsModal = (userToManage: User) => {
    setLandingsModal({ open: true, user: userToManage });
    setLandingForm(initLandingForm(userToManage, templates));
  };

  const openDeactivateModal = (userToDeactivate: User) => {
    setDeactivateModal({ open: true, user: userToDeactivate });
  };

  const handleAntiSpamToggle = async (target: User, enabled: boolean) => {
    setAntiSpamLoadingId(target.id);
    setUsers((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, anti_spam_enabled: enabled } : u))
    );

    try {
      const response = await fetch('/api/admin/users/anti-spam', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: target.id,
          enabled,
          landingSlugs: (target.landing_pages ?? []).map((lp) => lp.subdomain_slug),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === target.id ? { ...u, anti_spam_enabled: !enabled } : u
          )
        );
        toast.error(data.error || 'Gagal menyimpan anti-spam');
      } else {
        toast.success(enabled ? 'Anti-spam diaktifkan' : 'Anti-spam dinonaktifkan');
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === target.id ? { ...u, anti_spam_enabled: !enabled } : u
        )
      );
      toast.error('Terjadi kesalahan');
    }

    setAntiSpamLoadingId(null);
  };

  const handleActivateUser = async () => {
    if (!activateModal.user) return;

    setActivateLoading(true);

    try {
      const response = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activateModal.user.id,
          activate: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        toast.error(data?.error || 'Gagal mengaktifkan user');
      } else {
        toast.success('Akun user berhasil diaktifkan');
        await fetchUsers();
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setActivateLoading(false);
      setActivateModal({ open: false, user: null });
    }
  };

  const handleDeactivateUser = async (userToDeactivate: User) => {
    setActivateLoading(true);

    try {
      const response = await fetch('/api/admin/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userToDeactivate.id,
          activate: false,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        toast.error(data?.error || 'Gagal menonaktifkan user');
      } else {
        toast.success('User berhasil dinonaktifkan');
        await fetchUsers();
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setActivateLoading(false);
    }
  };

  const handleSaveLandings = async () => {
    if (!landingsModal.user) return;

    const landings = templates
      .filter((t) => {
        const form = landingForm[t.id] ?? { enabled: false, duration_days: 30 };
        const existing = landingsModal.user?.landing_pages?.find((lp) => lp.template_id === t.id);
        return form.enabled || Boolean(existing);
      })
      .map((t) => ({
        template_id: t.id,
        duration_days: landingForm[t.id]?.duration_days ?? 30,
        enabled: landingForm[t.id]?.enabled ?? false,
      }));

    const hasEnabled = landings.some((l) => l.enabled);
    if (hasEnabled) {
      const invalid = landings.find((l) => l.enabled && (l.duration_days < 1 || l.duration_days > 365));
      if (invalid) {
        toast.error('Durasi landing harus 1-365 hari');
        return;
      }
    }

    setLandingsLoading(true);

    try {
      const response = await fetch('/api/admin/landings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: landingsModal.user.id,
          landings,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        toast.error(data?.error || 'Gagal menyimpan landing page');
      } else {
        toast.success('Landing page berhasil disimpan');
        await fetchUsers();
        setLandingsModal({ open: false, user: null });
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setLandingsLoading(false);
    }
  };

  const openEditModal = (userToEdit: User) => {
    setEditForm(userToForm(userToEdit));
    setEditModal({ open: true, user: userToEdit });
  };

  const handleCreateUser = async () => {
    setCreateLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await response.json();

      if (!response.ok || data?.error) {
        toast.error(data?.error || 'Gagal mendaftarkan user');
      } else {
        toast.success('Pelanggan berhasil didaftarkan');
        setCreateModalOpen(false);
        setCreateForm(EMPTY_USER_FORM);
        await fetchUsers();
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editModal.user) return;

    setEditLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editModal.user.id,
          ...editForm,
        }),
      });
      const data = await response.json();

      if (!response.ok || data?.error) {
        toast.error(data?.error || 'Gagal memperbarui user');
      } else {
        toast.success('Data user berhasil diperbarui');
        setEditModal({ open: false, user: null });
        setEditForm(EMPTY_USER_FORM);
        await fetchUsers();
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;

    try {
      const response = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deleteDialog.user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Gagal menghapus user');
      } else {
        toast.success('User berhasil dihapus');
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== deleteDialog.user?.id));
      }
    } catch {
      toast.error('Terjadi kesalahan');
    }

    setDeleteDialog({ open: false, user: null });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-emerald-600 hover:bg-emerald-700',
      inactive: 'bg-slate-600 hover:bg-slate-700',
      expired: 'bg-red-600 hover:bg-red-700',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Nonaktif',
      expired: 'Exp',
    };
    return (
      <Badge className={variants[status] || 'bg-slate-600'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const renderLandingBadges = (landingPages: UserLandingPage[]) => {
    const visible = landingPages.filter((lp) => lp.is_enabled || lp.is_expired);
    if (visible.length === 0) return <span className="text-slate-500">-</span>;

    return (
      <div className="flex flex-col gap-1">
        {visible.map((lp) => (
          <div key={lp.id} className="text-xs text-slate-300">
            <span className="text-slate-400">{lp.template_name}:</span>{' '}
            <span className="font-mono">{lp.subdomain_slug}</span>
            {lp.is_expired && (
              <Badge className="ml-1 bg-red-600 hover:bg-red-700 text-[10px] px-1.5 py-0">
                Exp
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-bold text-white">Melemporr Admin</h1>
          </div>
          <Button variant="ghost" className="text-slate-400" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Manajemen User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-300">
                  Daftarkan pelanggan baru, edit data user, dan kelola landing page.
                </p>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                  onClick={() => {
                    setCreateForm(EMPTY_USER_FORM);
                    setCreateModalOpen(true);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Daftar Pelanggan
                </Button>
              </div>
              <Input
                type="search"
                placeholder="Cari user..."
                className="max-w-md bg-slate-800 border-slate-700 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="sm:hidden">
              <AdminUserListMobile
                filteredUsers={filteredUsers}
                usersLoading={usersLoading}
                activateLoading={activateLoading}
                antiSpamLoadingId={antiSpamLoadingId}
                openActivateModal={openActivateModal}
                openLandingsModal={openLandingsModal}
                openEditModal={openEditModal}
                onAntiSpamToggle={handleAntiSpamToggle}
                setDeactivateModal={setDeactivateModal}
                setDeleteDialog={setDeleteDialog}
                getStatusBadge={getStatusBadge}
                renderLandingBadges={renderLandingBadges}
              />
            </div>

            <div className="hidden sm:block">
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Tidak ada user yang sesuai dengan pencarian.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Username</TableHead>
                      <TableHead className="text-slate-400">No HP</TableHead>
                      <TableHead className="text-slate-400">Status Akun</TableHead>
                      <TableHead className="text-slate-400">Landing Page</TableHead>
                      <TableHead className="text-slate-400">Bot</TableHead>
                      <TableHead className="text-slate-400">Anti Spam</TableHead>
                      <TableHead className="text-slate-400 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="border-slate-700">
                        <TableCell className="text-white font-medium">{u.username}</TableCell>
                        <TableCell className="text-slate-300">{u.phone}</TableCell>
                        <TableCell>{getStatusBadge(getAdminUserDisplayStatus(u))}</TableCell>
                        <TableCell>{renderLandingBadges(u.landing_pages ?? [])}</TableCell>
                        <TableCell>
                          {u.telegram_connected ? (
                            <Badge className="bg-emerald-600">Terhubung</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                              Tidak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={u.anti_spam_enabled ?? false}
                              disabled={antiSpamLoadingId === u.id}
                              onCheckedChange={(checked) => handleAntiSpamToggle(u, checked === true)}
                            />
                            <span className="text-xs text-slate-400">
                              {(u.anti_spam_enabled ?? false) ? 'Aktif' : 'Off'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Switch
                              checked={u.status === 'active'}
                              onCheckedChange={() =>
                                u.status === 'active' ? openDeactivateModal(u) : openActivateModal(u)
                              }
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              className="text-slate-300 border-slate-600 hover:bg-slate-700"
                              onClick={() => openEditModal(u)}
                              title="Edit user"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="text-slate-300 border-slate-600 hover:bg-slate-700"
                              disabled={u.status !== 'active'}
                              onClick={() => openLandingsModal(u)}
                              title="Kelola landing page"
                            >
                              <Layers className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => setDeleteDialog({ open: true, user: u })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Daftar Pelanggan Baru</DialogTitle>
            <DialogDescription className="text-slate-400">
              Buat akun pelanggan baru. Status awal nonaktif — aktifkan setelah pendaftaran.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300">Username</Label>
              <Input
                className="bg-slate-800 border-slate-700 text-white mt-1"
                value={createForm.username}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="contoh: pelanggan01"
              />
            </div>
            <div>
              <Label className="text-slate-300">No HP</Label>
              <Input
                type="tel"
                inputMode="numeric"
                className="bg-slate-800 border-slate-700 text-white mt-1"
                value={createForm.phone}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="08123456789"
              />
            </div>
            <div>
              <Label className="text-slate-300">Password</Label>
              <Input
                type="password"
                className="bg-slate-800 border-slate-700 text-white mt-1"
                value={createForm.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateUser}
              disabled={createLoading}
            >
              {createLoading ? 'Menyimpan...' : 'Daftar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editModal.open}
        onOpenChange={(open) => {
          if (!open) {
            setEditModal({ open: false, user: null });
            setEditForm(EMPTY_USER_FORM);
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Ubah username, no HP, atau password user &quot;{editModal.user?.username}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300">Username</Label>
              <Input
                className="bg-slate-800 border-slate-700 text-white mt-1"
                value={editForm.username}
                onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-slate-300">No HP</Label>
              <Input
                type="tel"
                inputMode="numeric"
                className="bg-slate-800 border-slate-700 text-white mt-1"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))
                }
              />
            </div>
            <div>
              <Label className="text-slate-300">Password Baru</Label>
              <Input
                type="password"
                className="bg-slate-800 border-slate-700 text-white mt-1"
                value={editForm.password}
                onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Kosongkan jika tidak diubah"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal({ open: false, user: null })}>
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleUpdateUser}
              disabled={editLoading}
            >
              {editLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activateModal.open} onOpenChange={(open) => setActivateModal({ open, user: null })}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Aktifkan Akun User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Aktifkan akun &quot;{activateModal.user?.username}&quot; agar bisa setup Telegram di dashboard.
              Landing page diatur terpisah setelah akun aktif.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateModal({ open: false, user: null })}>
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleActivateUser}
              disabled={activateLoading}
            >
              {activateLoading ? 'Menyimpan...' : 'Aktifkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={landingsModal.open} onOpenChange={(open) => setLandingsModal({ open, user: open ? landingsModal.user : null })}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Kelola Landing Page</DialogTitle>
            <DialogDescription className="text-slate-400">
              User: {landingsModal.user?.username} — aktifkan tier dan atur durasi per landing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4 max-h-[60vh] overflow-y-auto">
            {templates.map((template) => {
              const form = landingForm[template.id] ?? { enabled: false, duration_days: 30 };
              const existing = landingsModal.user?.landing_pages?.find((lp) => lp.template_id === template.id);

              return (
                <div
                  key={template.id}
                  className={`rounded-lg border p-4 space-y-3 ${
                    template.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`tpl-${template.id}`}
                      checked={form.enabled}
                      disabled={!template.is_active}
                      onCheckedChange={(checked) =>
                        setLandingForm((prev) => ({
                          ...prev,
                          [template.id]: { ...form, enabled: checked === true },
                        }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor={`tpl-${template.id}`} className="text-white font-medium">
                        {template.name}
                      </Label>
                      {template.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{template.description}</p>
                      )}
                      {!template.is_active && (
                        <p className="text-xs text-amber-400 mt-1">Belum tersedia</p>
                      )}
                      {existing?.is_enabled && existing.subdomain_slug && (
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          Slug: {existing.subdomain_slug} · Exp: {getLandingExpiryDate(existing)}
                        </p>
                      )}
                    </div>
                  </div>
                  {form.enabled && template.is_active && (
                    <div>
                      <Label className="text-slate-300 text-xs">Durasi (hari)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                        value={form.duration_days}
                        onChange={(e) =>
                          setLandingForm((prev) => ({
                            ...prev,
                            [template.id]: {
                              ...form,
                              duration_days: parseInt(e.target.value, 10) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLandingsModal({ open: false, user: null })}>
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSaveLandings}
              disabled={landingsLoading}
            >
              {landingsLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deactivateModal.open} onOpenChange={(open) => setDeactivateModal({ open, user: null })}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Nonaktifkan User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Nonaktifkan &quot;{deactivateModal.user?.username}&quot;? Semua landing page akan dimatikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateModal({ open: false, user: null })}>
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deactivateModal.user) {
                  handleDeactivateUser(deactivateModal.user);
                }
                setDeactivateModal({ open: false, user: null });
              }}
              disabled={activateLoading}
            >
              {activateLoading ? 'Menonaktifkan...' : 'Nonaktifkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Hapus User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Yakin ingin menghapus user &quot;{deleteDialog.user?.username}&quot;? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })}>
              Batal
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
