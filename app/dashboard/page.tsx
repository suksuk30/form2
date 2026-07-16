'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  LogOut,
  LinkIcon,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { UserLandingPage } from '@/lib/supabase';
import {
  getLandingExpiryDate,
  getLandingPageUrl,
  isLandingAccessible,
} from '@/lib/landing-utils';

export default function UserDashboard() {
  const { user, loading, signOut, refreshUser } = useAuth();
  const router = useRouter();
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const initializedFromUserRef = useRef(false);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<{ botToken: string; chatId: string } | null>(null);
  const savedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (user && user.role === 'super_admin') {
      router.push('/admin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const nextBotToken = user.telegram_bot_token || '';
    const nextChatId = user.telegram_chat_id || '';
    const lastSaved = lastSavedRef.current;
    const withinGraceWindow = Date.now() - savedAtRef.current < 3000;

    if (!initializedFromUserRef.current) {
      setBotToken(nextBotToken);
      setChatId(nextChatId);
      initializedFromUserRef.current = true;
      setConnectionStatus(user.telegram_connected ? 'connected' : 'unknown');
      return;
    }

    if (isSavingRef.current) {
      setConnectionStatus(user.telegram_connected ? 'connected' : 'unknown');
      return;
    }

    setBotToken((prev) => {
      if (lastSaved && withinGraceWindow && nextBotToken !== lastSaved.botToken) return prev;
      if (lastSaved && !nextBotToken && prev === lastSaved.botToken) return prev;
      return prev !== nextBotToken ? nextBotToken : prev;
    });

    setChatId((prev) => {
      if (lastSaved && withinGraceWindow && nextChatId !== lastSaved.chatId) return prev;
      if (lastSaved && !nextChatId && prev === lastSaved.chatId) return prev;
      return prev !== nextChatId ? nextChatId : prev;
    });

    setConnectionStatus(user.telegram_connected ? 'connected' : 'unknown');
  }, [user]);

  const isActive = user?.status === 'active';
  const landingPages = user?.landing_pages ?? [];
  const activeLandings = landingPages.filter((lp) => lp.is_enabled && !lp.is_expired);
  const liveLandings = activeLandings.filter((lp) =>
    isLandingAccessible(lp, isActive, connectionStatus === 'connected')
  );

  const handleSaveTelegram = async () => {
    if (!user) return;
    if (!isActive) {
      toast.error('Akun Anda belum aktif. Hubungi admin untuk mengaktifkan akun terlebih dahulu.');
      return;
    }

    const snapshot = { botToken, chatId };
    setSaving(true);
    isSavingRef.current = true;
    lastSavedRef.current = snapshot;
    savedAtRef.current = Date.now();

    try {
      const response = await fetch('/api/user/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Gagal menyimpan data');
      } else {
        setBotToken(snapshot.botToken);
        setChatId(snapshot.chatId);

        const echoedBotToken =
          typeof data?.saved_bot_token === 'string' ? data.saved_bot_token : snapshot.botToken;
        const echoedChatId =
          typeof data?.saved_chat_id === 'string' ? data.saved_chat_id : snapshot.chatId;

        setBotToken(echoedBotToken);
        setChatId(echoedChatId);
        lastSavedRef.current = { botToken: echoedBotToken, chatId: echoedChatId };
        savedAtRef.current = Date.now();

        if (data?.user) {
          const serverBotToken = data.user.telegram_bot_token;
          const serverChatId = data.user.telegram_chat_id;

          const serverMatchesSaved =
            serverBotToken === lastSavedRef.current.botToken &&
            serverChatId === lastSavedRef.current.chatId;

          if (serverMatchesSaved) {
            setBotToken(serverBotToken || '');
            setChatId(serverChatId || '');
          }

          setConnectionStatus(data.user.telegram_connected ? 'connected' : 'unknown');
        }

        toast.success('Data Telegram disimpan');
        await refreshUser();
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      isSavingRef.current = false;
      setSaving(false);
    }
  };

  const handleCheckConnection = async () => {
    if (!user) return;
    if (!isActive) {
      toast.error('Akun Anda belum aktif. Hubungi admin untuk mengaktifkan akun terlebih dahulu.');
      return;
    }
    if (!botToken) {
      toast.error('Masukkan Bot Token terlebih dahulu');
      return;
    }

    setChecking(true);
    setConnectionStatus('unknown');

    try {
      const response = await fetch('/api/user/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus('connected');
        toast.success('Bot terhubung dengan sukses!');
        await refreshUser();
      } else {
        setConnectionStatus('disconnected');
        toast.error(data.error || 'Gagal menghubungkan bot');
      }
    } catch {
      setConnectionStatus('disconnected');
      toast.error('Gagal menghubungi API Telegram');
    }

    setChecking(false);
  };

  const handleResetSlug = async (landing: UserLandingPage) => {
    if (!user) return;
    if (!confirm(`Reset link untuk ${landing.template_name}? Link lama tidak akan bisa diakses lagi.`)) {
      return;
    }

    setResettingId(landing.id);

    try {
      const response = await fetch('/api/user/landing/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageId: landing.id }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        toast.error(data?.error || 'Gagal reset link');
      } else {
        toast.success(`Slug baru: ${data.subdomain_slug}`);
        await refreshUser();
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setResettingId(null);
    }
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
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-bold text-white">Melemporr</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">{user.username}</span>
            <Button variant="ghost" className="text-slate-400" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Status Akun
              {isActive ? (
                <Badge className="bg-emerald-600">Aktif</Badge>
              ) : (
                <Badge className="bg-slate-600">Nonaktif</Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        {!isActive && (
          <Card className="bg-amber-900/30 border-amber-700">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <p className="text-amber-200">
                Akun Anda belum aktif. Silakan hubungi Admin untuk mengaktifkan akun.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Pengaturan Telegram Bot</CardTitle>
            <CardDescription className="text-slate-400">
              Konfigurasikan bot Telegram untuk menerima data form dari semua landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Bot Token</Label>
              <Input
                type="password"
                placeholder={isActive ? 'Masukkan Bot Token dari @BotFather' : 'Aktifkan akun terlebih dahulu'}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 font-mono"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                disabled={!isActive}
              />
              <p className="text-xs text-slate-500">Dapatkan token dari @BotFather di Telegram</p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Chat ID</Label>
              <Input
                placeholder={isActive ? 'Masukkan Chat ID Anda' : 'Aktifkan akun terlebih dahulu'}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 font-mono"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                disabled={!isActive}
              />
              <p className="text-xs text-slate-500">Kirim pesan ke @userinfobot untuk mendapatkan Chat ID</p>
            </div>

            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300"
                onClick={handleCheckConnection}
                disabled={!isActive || checking || !botToken}
              >
                {checking ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Cek Koneksi
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSaveTelegram}
                disabled={!isActive || saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan
              </Button>

              {connectionStatus !== 'unknown' && (
                <div className="flex items-center gap-2">
                  {connectionStatus === 'connected' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-emerald-400">Terhubung</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-400">Terputus</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {activeLandings.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Landing Page Aktif</CardTitle>
              <CardDescription className="text-slate-400">
                {liveLandings.length > 0
                  ? 'Bagikan link ini kepada pengunjung'
                  : 'Hubungkan Telegram terlebih dahulu agar landing page bisa diakses publik'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeLandings.map((landing) => {
                const url = getLandingPageUrl(landing.subdomain_slug, landing.template_id);
                const isLive = isLandingAccessible(landing, isActive, connectionStatus === 'connected');

                return (
                  <div key={landing.id} className="rounded-lg border border-slate-700 bg-slate-700/40 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-white font-medium">{landing.template_name}</p>
                        <p className="text-xs text-slate-400">
                          Exp: {getLandingExpiryDate(landing)} · {landing.duration_days} hari
                        </p>
                      </div>
                      {isLive ? (
                        <Badge className="bg-emerald-600">Live</Badge>
                      ) : (
                        <Badge className="bg-slate-600">Belum live</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-700 rounded-lg p-3">
                      <LinkIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-white font-mono text-sm break-all">{url}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          toast.success('Link disalin');
                        }}
                      >
                        Copy
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                      onClick={() => handleResetSlug(landing)}
                      disabled={resettingId === landing.id}
                    >
                      {resettingId === landing.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4 mr-2" />
                      )}
                      Reset Link
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>

      <a
        href="https://t.me/melemporr"
        target="_blank"
        rel="noreferrer"
        className="fixed left-4 bottom-4 z-40 flex h-12 items-center gap-2 px-2 text-white transition-transform active:scale-[0.98]"
        aria-label="Chat Telegram"
        title="Chat Telegram"
      >
        <img src="/tele.png" alt="Telegram" className="h-10 w-10" />
      </a>
    </div>
  );
}
