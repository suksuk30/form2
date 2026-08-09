'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Tv1FormFooter, Tv1FormHeader } from './Tv1FormHeader';
import { Tv1FormMenu } from './Tv1FormMenu';
import { normalizeTv1PhoneInput } from './tv1-phone';

type Props = {
  phone: string;
  pin: string;
  submitting: boolean;
  errorMessage: string;
  callCenterPhone?: string;
  onPhoneChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onSubmit: () => void;
};

export function Tv1LoginScreen({
  phone,
  pin,
  submitting,
  errorMessage,
  callCenterPhone,
  onPhoneChange,
  onPinChange,
  onSubmit,
}: Props) {
  const [phoneFocused, setPhoneFocused] = useState(false);
  const phoneDigits = normalizeTv1PhoneInput(phone);
  const pinDigits = pin.replace(/\D/g, '');
  const showPhonePrefix = !phoneFocused && phoneDigits.length === 0;
  const canSubmit = pinDigits.length === 6 && phoneDigits.length >= 10 && !submitting;

  return (
    <div className="tv1-form-screen">
      <Tv1FormHeader />

      <main className="tv1-form-body">
        <label className="tv1-form-label" htmlFor="tv1-phone">
          Nomor Handphone <span className="tv1-form-required">*</span>
        </label>
        <div className="tv1-phone-wrap">
          {showPhonePrefix && (
            <span className="tv1-phone-prefix" aria-hidden>
              +62
            </span>
          )}
          <input
            id="tv1-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className="tv1-form-input tv1-form-input--phone"
            value={phoneDigits}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            onChange={(e) => onPhoneChange(normalizeTv1PhoneInput(e.target.value))}
          />
        </div>

        <label className="tv1-form-label tv1-form-label--spaced" htmlFor="tv1-pin">
          PIN 6 Angka <span className="tv1-form-required">*</span>
        </label>
        <input
          id="tv1-pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          className="tv1-form-input tv1-form-input--pin"
          placeholder="******"
          value={pin}
          onChange={(e) => onPinChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />

        {errorMessage && <p className="tv1-form-error">{errorMessage}</p>}

        <button
          type="button"
          className="tv1-form-submit"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Masuk'}
        </button>

        <Tv1FormMenu />
      </main>

      <Tv1FormFooter callCenterPhone={callCenterPhone} />
    </div>
  );
}
