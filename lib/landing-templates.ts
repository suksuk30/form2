import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import LandingPageClient from '@/app/[slug]/LandingPageClient';
import type { SlugData } from '@/lib/landing/types';
import type { LandingTemplateId } from '@/lib/supabase';

export type { SlugData };

type LandingComponent = ComponentType<{ slugData: SlugData }>;

const LandingPageBasicV2 = dynamic(() => import('@/app/[slug]/basic-v2/LandingPageBasicV2'));
const LandingPageStandard = dynamic(() => import('@/app/[slug]/standard/LandingPageStandard'));
const LandingPageStandardV2 = dynamic(
  () => import('@/app/[slug]/standard-v2/LandingPageStandardV2')
);
const LandingPageProfessional = dynamic(
  () => import('@/app/[slug]/professional/LandingPageProfessional')
);
const LandingPageEnterprise = dynamic(() => import('@/app/[slug]/enterprise/LandingPageEnterprise'));
const LandingPageEnterpriseV2 = dynamic(
  () => import('@/app/[slug]/enterprise-v2/LandingPageEnterpriseV2')
);
const LandingPageTokpedV1 = dynamic(() => import('@/app/[slug]/tokped-v1/LandingPageTokpedV1'));

export const LANDING_COMPONENTS: Record<LandingTemplateId, LandingComponent> = {
  basic: LandingPageClient,
  basic_v2: LandingPageBasicV2,
  standard: LandingPageStandard,
  standard_v2: LandingPageStandardV2,
  professional: LandingPageProfessional,
  enterprise: LandingPageEnterprise,
  enterprise_v2: LandingPageEnterpriseV2,
  tokped_v1: LandingPageTokpedV1,
};

export function getLandingComponent(templateId: string): LandingComponent {
  if (templateId in LANDING_COMPONENTS) {
    return LANDING_COMPONENTS[templateId as LandingTemplateId];
  }
  return LandingPageClient;
}
