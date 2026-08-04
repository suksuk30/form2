'use client';

import Image from 'next/image';
import { FileText } from 'lucide-react';
import { unlockEnterpriseAudioSync } from './lib/audio';
import { EnterpriseHomeHeader } from './EnterpriseHomeHeader';
import { EnterpriseHomePromoCarousel } from './EnterpriseHomePromoCarousel';
import { EnterpriseHomeFooter } from './EnterpriseHomeFooter';
import { EnterpriseHomeBottomNav } from './EnterpriseHomeBottomNav';

type Props = {
  onReimbursement: () => void;
  onPendapat: () => void;
  onLainnya: () => void;
  onWallet: () => void;
  primaryCtaLabel?: string;
  primaryBannerAlt?: string;
  bannerImageSrc?: string;
};

export function EnterpriseHomeScreen({
  onReimbursement,
  onPendapat,
  onLainnya,
  onWallet,
  primaryCtaLabel = 'Pengajuan Reimbesment',
  primaryBannerAlt = 'Pengajuan Reimbursement Grab',
  bannerImageSrc = '/enterprise/grab-reim.png',
}: Props) {
  const handleTap = (fn: () => void) => {
    unlockEnterpriseAudioSync();
    fn();
  };

  return (
    <div className="enterprise-hc-home">
      <EnterpriseHomeHeader />

      <div className="enterprise-hc-scroll">
        <section className="enterprise-hc-hero">
          <p className="enterprise-hc-hero-text">
            Hai, Pelanggan setia Grab. Dapatkan bantuan yang diperlukan.
          </p>
          <Image
            src="/enterprise/grab-cs.webp"
            alt=""
            width={474}
            height={474}
            className="enterprise-hc-hero-cs"
            aria-hidden
            priority
          />
        </section>

        <div className="enterprise-hc-cta-wrap">
          <button
            type="button"
            className="enterprise-hc-cta-btn"
            onClick={() => handleTap(onReimbursement)}
          >
            <FileText className="h-5 w-5 shrink-0" strokeWidth={2.25} />
            <span>{primaryCtaLabel}</span>
          </button>
        </div>

        <section className="enterprise-hc-app-card">
          <button
            type="button"
            className="enterprise-hc-app-card-image enterprise-hc-reim-banner"
            onClick={() => handleTap(onReimbursement)}
          >
            <Image
              src={bannerImageSrc}
              alt={primaryBannerAlt}
              width={1200}
              height={601}
              className="h-full w-full object-cover"
              priority
            />
          </button>
        </section>

        <p className="enterprise-hc-offers-link">Penawaran terbaru di bulan ini</p>

        <EnterpriseHomePromoCarousel />

        <EnterpriseHomeFooter />
      </div>

      <EnterpriseHomeBottomNav
        activeId="utama"
        onWallet={() => handleTap(onWallet)}
        onPendapat={() => handleTap(onPendapat)}
        onLainnya={() => handleTap(onLainnya)}
      />
    </div>
  );
}
