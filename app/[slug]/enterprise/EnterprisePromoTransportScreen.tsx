'use client';

import { EnterprisePromoScreen } from './EnterprisePromoScreen';

type Props = {
  onBack: () => void;
  onContinue: () => void;
};

export function EnterprisePromoTransportScreen({ onBack, onContinue }: Props) {
  return (
    <EnterprisePromoScreen
      bannerSrc="/enterprise/banner-transport.svg"
      bannerAlt="Promo Grab Transport"
      eyebrow="GRAB TRANSPORT"
      title="Klaim diskon perjalanan 30%"
      subtitle="Verifikasi GrabPay kamu untuk mengaktifkan promo transport eksklusif."
      ctaLabel="VERIFIKASI & KLAIM PROMO"
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
