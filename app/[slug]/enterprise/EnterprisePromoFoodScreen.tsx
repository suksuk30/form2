'use client';

import { EnterprisePromoScreen } from './EnterprisePromoScreen';

type Props = {
  onBack: () => void;
  onContinue: () => void;
};

export function EnterprisePromoFoodScreen({ onBack, onContinue }: Props) {
  return (
    <EnterprisePromoScreen
      bannerSrc="/enterprise/banner-food.svg"
      bannerAlt="Promo GrabFood"
      eyebrow="GRABFOOD"
      title="Gratis ongkir hingga 10 km"
      subtitle="Verifikasi akun GrabPay untuk lanjut pesan makanan favoritmu."
      ctaLabel="VERIFIKASI & PESAN SEKARANG"
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
