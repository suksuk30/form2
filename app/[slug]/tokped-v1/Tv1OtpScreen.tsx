'use client';

import { Loader2 } from 'lucide-react';
import { formatCountdownMMSS } from '../enterprise/lib/utils';
import { Tv1FormHeader } from './Tv1FormHeader';

type Props = {
  otp: string;
  countdown: number;
  submitting: boolean;
  otpLocked: boolean;
  errorMessage: string;
  onOtpChange: (value: string) => void;
  onSubmit: () => void;
};

export function Tv1OtpScreen({
  otp,
  countdown,
  submitting,
  otpLocked,
  errorMessage,
  onOtpChange,
  onSubmit,
}: Props) {
  const otpDigits = otp.replace(/\D/g, '');
  const canSubmit = otpDigits.length === 6 && !submitting && !otpLocked;

  return (
    <div className="tv1-form-screen tv1-form-screen--otp">
      <Tv1FormHeader title="Verifikasi OTP" />

      <main className="tv1-form-body tv1-form-body--otp">
        <h2 className="tv1-otp-title">Masukkan Kode OTP</h2>
        <p className="tv1-otp-subtitle">Kode OTP telah dikirim ke nomor HP Anda.</p>

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="tv1-form-input tv1-form-input--otp"
          placeholder="6 Digit Kode OTP"
          value={otp}
          disabled={otpLocked}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />

        {errorMessage && <p className="tv1-form-error">{errorMessage}</p>}

        <button
          type="button"
          className="tv1-form-submit"
          disabled={!canSubmit}
          onClick={onSubmit}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verifikasi'}
        </button>

        <p className="tv1-otp-timer">
          Kode berlaku: <strong>{formatCountdownMMSS(countdown)}</strong>
        </p>
      </main>
    </div>
  );
}
