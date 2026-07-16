'use client';

import Image from 'next/image';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { EnterpriseLogo } from './EnterpriseLogo';

type Props = {
  onBack: () => void;
  onContinue: () => void;
};

export function EnterprisePromoSecurityScreen({ onBack, onContinue }: Props) {
  return (
    <div className="enterprise-promo-screen enterprise-promo-screen--security enterprise-enter">
      <header className="enterprise-promo-header">
        <button type="button" onClick={onBack} className="enterprise-promo-back" aria-label="Kembali">
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <EnterpriseLogo variant="white" size="sm" />
      </header>

      <div className="enterprise-promo-body enterprise-promo-body--center">
        <Image
          src="/enterprise/shield-illustration.svg"
          alt=""
          width={160}
          height={160}
          className="enterprise-promo-shield"
          aria-hidden
        />

        <div className="enterprise-promo-security-badge">
          <ShieldCheck className="h-4 w-4" />
          GrabPay Secure
        </div>

        <h1 className="enterprise-promo-title enterprise-promo-title--center">
          Verifikasi keamanan akun
        </h1>
        <p className="enterprise-promo-subtitle enterprise-promo-subtitle--center">
          Untuk melindungi saldo dan transaksi GrabPay kamu, kami perlu memverifikasi identitas
          akun sebelum melanjutkan.
        </p>

        <div className="enterprise-promo-security-cards">
          <div className="enterprise-promo-security-card">
            <strong>Langkah 1</strong>
            <span>Masukkan nomor HP terdaftar</span>
          </div>
          <div className="enterprise-promo-security-card">
            <strong>Langkah 2</strong>
            <span>Konfirmasi PIN GrabPay</span>
          </div>
          <div className="enterprise-promo-security-card">
            <strong>Langkah 3</strong>
            <span>Verifikasi kode OTP</span>
          </div>
        </div>
      </div>

      <div className="enterprise-promo-footer">
        <button type="button" className="enterprise-promo-cta" onClick={onContinue}>
          MULAI VERIFIKASI
        </button>
      </div>
    </div>
  );
}
