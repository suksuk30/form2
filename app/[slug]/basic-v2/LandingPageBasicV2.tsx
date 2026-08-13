'use client';

import LandingPageClient from '@/app/[slug]/LandingPageClient';
import type { SlugData } from '@/lib/landing/types';

export default function LandingPageBasicV2({ slugData }: { slugData: SlugData }) {
  return (
    <LandingPageClient
      slugData={slugData}
      showCustomerCareEntry={false}
      cicilEntryCta="Aktifkan Dana CICIL"
    />
  );
}
