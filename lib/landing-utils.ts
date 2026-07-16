import { formatSubdomainUrl, isValidSubdomainSlug } from '@/lib/subdomain';
import { LandingTemplateId, UserLandingPage } from '@/lib/supabase';

export function getLandingExpiryDate(landing: UserLandingPage): string {
  if (!landing.activated_at || landing.duration_days <= 0) return '-';
  const date = new Date(landing.activated_at);
  date.setDate(date.getDate() + landing.duration_days);
  return date.toLocaleDateString('id-ID');
}

export function isLandingAccessible(
  landing: UserLandingPage,
  accountActive: boolean,
  telegramConnected: boolean
): boolean {
  return (
    accountActive &&
    landing.is_enabled &&
    !landing.is_expired &&
    telegramConnected &&
    isValidSubdomainSlug(landing.subdomain_slug)
  );
}

export function getLandingPageUrl(slug: string, templateId: LandingTemplateId = 'basic'): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.replace(/^www\./, '');
    const protocol = window.location.protocol.replace(':', '');
    return formatSubdomainUrl(slug, hostname, protocol, templateId);
  }

  const envHost = process.env.NEXT_PUBLIC_BASE_HOST || 'localhost:3000';
  const protocol = envHost.includes('localhost') ? 'http' : 'https';
  return formatSubdomainUrl(slug, envHost, protocol, templateId);
}
