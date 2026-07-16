"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', phone: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'super_admin' ? '/admin' : '/dashboard');
    }
  }, [user, loading, router]);

  const handleLoginOpen = (open: boolean) => {
    setLoginOpen(open);
    if (!open) {
      setLoginError('');
      setLoginForm({ username: '', password: '' });
    }
  };

  const handleRegisterOpen = (open: boolean) => {
    setRegisterOpen(open);
    if (!open) {
      setRegisterError('');
      setRegisterForm({ username: '', phone: '', password: '' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoginError('');

    const { error } = await signIn(loginForm.username, loginForm.password);

    if (error) {
      setLoginError(error.message);
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setRegisterError('');

    const { error } = await signUp(registerForm.username, registerForm.phone, registerForm.password);

    if (error) {
      setRegisterError(error.message);
      setSubmitting(false);
    } else {
      handleRegisterOpen(false);
      setSubmitting(false);
      setLoginForm({ username: registerForm.username, password: registerForm.password });
      setLoginOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Menu (tanpa header) */}
      <main className="flex-1 px-4 sm:px-8">
        <div className="min-h-[calc(100vh-0px)] flex flex-col items-center justify-center gap-6">
          {/* Logo pesawat kertas + nama */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-white/5 blur-sm" />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-8 w-8 text-emerald-300"
                  aria-hidden="true"
                >
                  <path d="M10 28 L54 10 L40 54 L30 34 Z" fill="currentColor" opacity="0.16" />
                  <path d="M10 28 L54 10 L40 54 L30 34 Z" />
                  <path d="M22 42 L30 34" />
                  <path d="M54 10 L34 30" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Melemporr</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Platform Landing Page Telegram</div>
            </div>
          </div>

          <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-4">
            <button
              type="button"
              onClick={() => handleRegisterOpen(true)}
              className="w-full rounded-2xl bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-300/30 transition-colors px-4 py-4 sm:py-5 text-white shadow-lg shadow-emerald-900/20"
            >
              <span className="flex items-center gap-3 w-full">
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-white" aria-hidden="true">
                    <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                </span>
                <span className="flex-1 text-left leading-tight">
                  <span className="block text-sm sm:text-base font-semibold tracking-tight">Daftar Akun</span>
                  <span className="block text-xs text-emerald-50/90 mt-1">Buat akun baru</span>
                </span>
                <span className="shrink-0 text-white/90">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleLoginOpen(true)}
              className="w-full rounded-2xl border border-slate-600/70 bg-slate-900/60 hover:bg-slate-800/80 transition-colors px-4 py-4 sm:py-5 text-white shadow-lg shadow-black/30"
            >
              <span className="flex items-center gap-3 w-full">
                <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-slate-700/70 border border-slate-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5 text-slate-200" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </span>
                <span className="flex-1 text-left leading-tight">
                  <span className="block text-lg sm:text-xl font-semibold tracking-tight">Login</span>
                  <span className="block text-xs sm:text-sm text-slate-300 mt-1">Masuk ke akun</span>
                </span>
                <span className="shrink-0 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </span>
            </button>
          </div>

          <div className="text-center text-[11px] sm:text-xs text-slate-400 px-2">
            Pilih menu di atas untuk melanjutkan.
          </div>
        </div>
      </main>


      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={handleLoginOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Login</DialogTitle>
            <DialogDescription className="text-slate-400">Masuk ke akun Anda</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 mt-2">
            {loginError && (
              <div className="bg-red-900/30 border border-red-700 rounded-md px-3 py-2">
                <p className="text-red-400 text-sm">{loginError}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="login-username" className="text-slate-300">
                Username
              </Label>
              <Input
                id="login-username"
                className="bg-slate-800 border-slate-700 text-white"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="login-password"
                type="password"
                className="bg-slate-800 border-slate-700 text-white"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>

            <div className="pt-2 text-center text-[13px] text-slate-300">
              <span className="text-slate-400">Belum punya akun?</span>{' '}
              <button
                type="button"
                onClick={() => {
                  handleLoginOpen(false);
                  handleRegisterOpen(true);
                }}
                className="font-semibold text-emerald-300 hover:text-emerald-200"
              >
                Daftar
              </button>
            </div>
          </form>

        </DialogContent>
      </Dialog>


      {/* Register Dialog */}
      <Dialog open={registerOpen} onOpenChange={handleRegisterOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Daftar Akun User</DialogTitle>
            <DialogDescription className="text-slate-400">Buat akun baru untuk mulai menggunakan platform</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4 mt-2">
            {registerError && (
              <div className="bg-red-900/30 border border-red-700 rounded-md px-3 py-2">
                <p className="text-red-400 text-sm">{registerError}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="reg-username" className="text-slate-300">
                Username
              </Label>
              <Input
                id="reg-username"
                className="bg-slate-800 border-slate-700 text-white"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                required
                minLength={3}
                maxLength={20}
                placeholder="Contoh: johndoe"
                autoComplete="username"
              />
              <p className="text-xs text-slate-500">3-20 karakter, huruf/angka/underscore</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-phone" className="text-slate-300">
                No HP
              </Label>
              <Input
                id="reg-phone"
                type="tel"
                className="bg-slate-800 border-slate-700 text-white"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value.replace(/\D/g, '') })}
                required
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
              />
              <p className="text-xs text-slate-500">Hanya angka, 10-15 digit</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="reg-password"
                type="password"
                className="bg-slate-800 border-slate-700 text-white"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-500">Minimal 6 karakter</p>
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar
            </Button>

            <div className="pt-2 text-center text-[13px] text-slate-300">
              <span className="text-slate-400">Sudah punya akun?</span>{' '}
              <button
                type="button"
                onClick={() => {
                  handleRegisterOpen(false);
                  handleLoginOpen(true);
                }}
                className="font-semibold text-emerald-300 hover:text-emerald-200"
              >
                Login
              </button>
            </div>
          </form>
          
        </DialogContent>
      </Dialog>

      <a
        href="https://t.me/melemporr"
        target="_blank"
        rel="noreferrer"
        className="fixed left-4 bottom-4 z-40 flex h-12 items-center gap-2 px-2 text-white transition-transform active:scale-[0.98]"
        aria-label="Chat Telegram"
        title="Chat Telegram"
      >
        <img src="/tele.png" alt="Telegram" className="h-10 w-10" />
        <span className="text-sm font-medium">Butuh Pertanyaan?</span>
      </a>

    </div>

  );
}


