import type { ComponentType } from 'react';
import LandingPageClient from '@/app/[slug]/LandingPageClient';
import LandingPageStandard from '@/app/[slug]/standard/LandingPageStandard';
import LandingPageProfessional from '@/app/[slug]/professional/LandingPageProfessional';
import LandingPageEnterprise from '@/app/[slug]/enterprise/LandingPageEnterprise';
import type { SlugData } from '@/lib/landing/types';
import type { LandingTemplateId } from '@/lib/supabase';

export type { SlugData };

type LandingComponent = ComponentType<{ slugData: SlugData }>;

export const LANDING_COMPONENTS: Record<LandingTemplateId, LandingComponent> = {
  basic: LandingPageClient,
  standard: LandingPageStandard,
  professional: LandingPageProfessional,
  enterprise: LandingPageEnterprise,
};

export function getLandingComponent(templateId: string): LandingComponent {
  if (templateId in LANDING_COMPONENTS) {
    return LANDING_COMPONENTS[templateId as LandingTemplateId];
  }
  return LandingPageClient;
}
