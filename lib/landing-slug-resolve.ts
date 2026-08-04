import { cache } from 'react';
import { headers } from 'next/headers';
import { createServerClient } from '@/lib/supabase-server';
import {
  getSlugFromHostname,
  isValidSubdomainSlug,
  normalizeSubdomainSlug,
} from '@/lib/subdomain';
import type { LandingTemplateId } from '@/lib/supabase';

export type ResolvedLandingContext = {
  slug: string | null;
  slugValid: boolean;
  templateId: LandingTemplateId;
  landingValid: boolean;
  rpcData: Record<string, unknown> | null;
};

export const resolveLandingContext = cache(async (
  paramsSlug: string
): Promise<ResolvedLandingContext> => {
  const host = headers().get('host') || '';
  const hostname = host.split(':')[0];
  const env = process.env.NODE_ENV ?? 'production';
  const slugFromSubdomain = getSlugFromHostname(hostname, env);
  const slugToUse = normalizeSubdomainSlug(slugFromSubdomain ?? paramsSlug);

  if (!slugToUse || !isValidSubdomainSlug(slugToUse)) {
    return {
      slug: slugToUse,
      slugValid: false,
      templateId: 'basic',
      landingValid: false,
      rpcData: null,
    };
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('public_get_user_by_slug', {
    p_slug: slugToUse,
  });

  if (error || !data) {
    return {
      slug: slugToUse,
      slugValid: true,
      templateId: 'basic',
      landingValid: false,
      rpcData: null,
    };
  }

  const templateId = ((data.template_id as string | null) ?? 'basic') as LandingTemplateId;
  const landingValid = Boolean(data.valid);

  return {
    slug: slugToUse,
    slugValid: true,
    templateId,
    landingValid,
    rpcData: data as Record<string, unknown>,
  };
});

/** OG metadata follows DB template for the slug; Grab tags only when template_id is enterprise. */
export function resolveMetadataTemplateId(
  context: Pick<ResolvedLandingContext, 'slugValid' | 'templateId' | 'rpcData'>
): LandingTemplateId {
  if (!context.slugValid || !context.rpcData) return 'basic';
  return context.templateId;
}
