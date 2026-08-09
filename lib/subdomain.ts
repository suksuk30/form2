import type { LandingTemplateId } from '@/lib/supabase';

export const PUBLIC_SUBDOMAIN_PREFIX = 'danadigitall-';
export const ENTERPRISE_SUBDOMAIN_PREFIX =
  process.env.NEXT_PUBLIC_ENTERPRISE_SUBDOMAIN_PREFIX ?? 'grabs-id-';
export const TOKPED_SUBDOMAIN_PREFIX =
  process.env.NEXT_PUBLIC_TOKPED_SUBDOMAIN_PREFIX ?? 'tokped-payltr-';

/** @deprecated Legacy Tokped prefix — still accepted for existing links. */
const LEGACY_TOKPED_SUBDOMAIN_PREFIX = 'tokped-id-';

const LANDING_SUBDOMAIN_PREFIXES: Record<LandingTemplateId, string> = {
  basic: PUBLIC_SUBDOMAIN_PREFIX,
  standard: PUBLIC_SUBDOMAIN_PREFIX,
  professional: PUBLIC_SUBDOMAIN_PREFIX,
  enterprise: ENTERPRISE_SUBDOMAIN_PREFIX,
  enterprise_v2: ENTERPRISE_SUBDOMAIN_PREFIX,
  tokped_v1: TOKPED_SUBDOMAIN_PREFIX,
};

export const SUBDOMAIN_SLUG_REGEX = /^[a-z0-9]{3}$/;
export const IGNORED_SUBDOMAIN_PREFIXES = new Set(['www', 'api', '_next', 'static']);

export function getSubdomainPrefixForTemplate(templateId: LandingTemplateId): string {
  return LANDING_SUBDOMAIN_PREFIXES[templateId] ?? PUBLIC_SUBDOMAIN_PREFIX;
}

function stripSubdomainPrefix(slug: string): string {
  if (slug.startsWith(ENTERPRISE_SUBDOMAIN_PREFIX)) {
    return slug.slice(ENTERPRISE_SUBDOMAIN_PREFIX.length);
  }
  if (slug.startsWith(TOKPED_SUBDOMAIN_PREFIX)) {
    return slug.slice(TOKPED_SUBDOMAIN_PREFIX.length);
  }
  if (slug.startsWith(LEGACY_TOKPED_SUBDOMAIN_PREFIX)) {
    return slug.slice(LEGACY_TOKPED_SUBDOMAIN_PREFIX.length);
  }
  if (slug.startsWith(PUBLIC_SUBDOMAIN_PREFIX)) {
    return slug.slice(PUBLIC_SUBDOMAIN_PREFIX.length);
  }
  return slug;
}

export function isPrefixedSubdomainHost(subdomain: string): boolean {
  return (
    subdomain.startsWith(PUBLIC_SUBDOMAIN_PREFIX) ||
    subdomain.startsWith(ENTERPRISE_SUBDOMAIN_PREFIX) ||
    subdomain.startsWith(TOKPED_SUBDOMAIN_PREFIX) ||
    subdomain.startsWith(LEGACY_TOKPED_SUBDOMAIN_PREFIX)
  );
}

export function normalizeSubdomainSlug(rawSlug: string): string | null {
  if (!rawSlug) return null;
  const slug = rawSlug.toLowerCase();
  const remainder = stripSubdomainPrefix(slug);
  return remainder || null;
}

export function isValidSubdomainSlug(slug: string | null | undefined): boolean {
  return Boolean(slug && SUBDOMAIN_SLUG_REGEX.test(slug.toLowerCase()));
}

function extractSlugFromSubdomainHost(subdomain: string): string | null {
  const slug = normalizeSubdomainSlug(subdomain);
  if (!slug || IGNORED_SUBDOMAIN_PREFIXES.has(slug) || !isValidSubdomainSlug(slug)) return null;
  return slug;
}

export function getSlugFromHostname(hostname: string, env: string): string | null {
  const normalized = hostname.toLowerCase();
  const parts = normalized.split('.');

  if (env === 'development') {
    if (normalized === 'localhost' || normalized === '127.0.0.1') {
      return null;
    }

    if (parts.length >= 2 && (normalized.endsWith('.localhost') || normalized.endsWith('.127.0.0.1'))) {
      return extractSlugFromSubdomainHost(parts[0]);
    }

    return null;
  }

  if (parts.length >= 3 && isPrefixedSubdomainHost(parts[0])) {
    return extractSlugFromSubdomainHost(parts[0]);
  }

  return null;
}

export function formatSubdomainUrl(
  slug: string,
  host: string,
  protocol = 'https',
  templateId: LandingTemplateId = 'basic'
): string {
  const normalizedHost = host.replace(/^www\./, '');
  const [hostname, port] = normalizedHost.split(':');
  const prefix = getSubdomainPrefixForTemplate(templateId);
  const slugHost = `${prefix}${slug}`;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}://${slugHost}${port ? `:${port}` : ''}`;
  }

  return `${protocol}://${slugHost}.${hostname}`;
}
