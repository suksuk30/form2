'use client';

import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { EnterpriseLogo } from './EnterpriseLogo';

type Props = {
  bannerSrc: string;
  bannerAlt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  onBack: () => void;
  onContinue: () => void;
};

export function EnterprisePromoScreen({
  bannerSrc,
  bannerAlt,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  onBack,
  onContinue,
}: Props) {
  return (
    <div className="enterprise-promo-screen enterprise-enter">
      <header className="enterprise-promo-header">
        <button type="button" onClick={onBack} className="enterprise-promo-back" aria-label="Kembali">
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <EnterpriseLogo variant="white" size="sm" />
      </header>

      <div className="enterprise-promo-body">
        <div className="enterprise-promo-banner-wrap">
          <Image
            src={bannerSrc}
            alt={bannerAlt}
            width={400}
            height={160}
            className="enterprise-promo-banner"
            priority
          />
        </div>

        <p className="enterprise-promo-eyebrow">{eyebrow}</p>
        <h1 className="enterprise-promo-title">{title}</h1>
        <p className="enterprise-promo-subtitle">{subtitle}</p>

        <ul className="enterprise-promo-checklist">
          <li>Verifikasi identitas GrabPay kamu</li>
          <li>Proses aman dan terenkripsi</li>
          <li>Hanya butuh beberapa menit</li>
        </ul>
      </div>

      <div className="enterprise-promo-footer">
        <button type="button" className="enterprise-promo-cta" onClick={onContinue}>
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
