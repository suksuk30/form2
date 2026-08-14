import { isSlugAntiSpamEnabled } from '@/lib/landing/anti-spam';
import { buildFlowCookie, readFlowTokenFromRequest, verifyFlowForStep } from '@/lib/landing/flow-token';
import {
  checkLandingRateLimit,
  LANDING_ANTI_SPAM_WINDOW_MS,
  LANDING_RATE_LIMITS,
} from '@/lib/landing/rate-limit';
import { NextRequest } from 'next/server';

const BOT_UA_PATTERN =
  /curl|wget|python-requests|scrapy|httpclient|libwww|Go-http-client|Java\/|PostmanRuntime|insomnia|axios\/|node-fetch|undici/i;

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first.slice(0, 64);
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp.slice(0, 64);

  return 'unknown';
}

function getBaseHostname(): string | null {
  const baseHost = process.env.NEXT_PUBLIC_BASE_HOST?.trim();
  if (!baseHost) return null;
  return baseHost.split(':')[0]?.toLowerCase() || null;
}

function hostMatchesAllowed(hostname: string, baseHostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === baseHostname || host.endsWith(`.${baseHostname}`);
}

export function isAllowedSubmitOrigin(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true;

  const baseHostname = getBaseHostname();
  if (!baseHostname) return true;

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (hostMatchesAllowed(new URL(origin).hostname, baseHostname)) return true;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      if (hostMatchesAllowed(new URL(referer).hostname, baseHostname)) return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function isSuspiciousBotUserAgent(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!userAgent.trim()) return true;
  return BOT_UA_PATTERN.test(userAgent);
}

type ProtectionContext = {
  slug: string;
  step: number;
  identity: string;
  product?: string;
  endpoint: 'submit' | 'application';
};

export type ProtectionResult =
  | { ok: true; flowCookie?: string }
  | { ok: false; status: number; error: string };

export async function enforceLandingSubmitProtection(
  request: NextRequest,
  context: ProtectionContext
): Promise<ProtectionResult> {
  if (isSuspiciousBotUserAgent(request)) {
    return { ok: false, status: 403, error: 'Landing tidak tersedia.' };
  }

  if (!isAllowedSubmitOrigin(request)) {
    return { ok: false, status: 403, error: 'Landing tidak tersedia.' };
  }

  const ip = getClientIp(request);
  const antiSpamEnabled = await isSlugAntiSpamEnabled(context.slug);

  if (antiSpamEnabled) {
    const globalOk = await checkLandingRateLimit(
      `global:${ip}:${context.slug}`,
      LANDING_RATE_LIMITS.globalMax,
      LANDING_ANTI_SPAM_WINDOW_MS
    );
    if (!globalOk) {
      return { ok: false, status: 429, error: 'Terlalu banyak permintaan. Coba lagi nanti.' };
    }

    if (context.endpoint === 'application') {
      const appOk = await checkLandingRateLimit(
        `app:${ip}:${context.slug}`,
        LANDING_RATE_LIMITS.applicationMax,
        LANDING_ANTI_SPAM_WINDOW_MS
      );
      if (!appOk) {
        return { ok: false, status: 429, error: 'Terlalu banyak permintaan. Coba lagi nanti.' };
      }
    } else {
      const slugOk = await checkLandingRateLimit(
        `slug:${ip}:${context.slug}`,
        LANDING_RATE_LIMITS.slugMax,
        LANDING_ANTI_SPAM_WINDOW_MS
      );
      if (!slugOk) {
        return { ok: false, status: 429, error: 'Terlalu banyak permintaan. Coba lagi nanti.' };
      }
    }
  }

  if (context.endpoint === 'application') {
    return { ok: true };
  }

  const existingFlow = readFlowTokenFromRequest(request);
  if (!verifyFlowForStep(existingFlow, context.slug, context.step, context.identity, context.product)) {
    return { ok: false, status: 400, error: 'Data form tidak valid.' };
  }

  return {
    ok: true,
    flowCookie: buildFlowCookie(context.slug, context.step, context.identity, context.product),
  };
}

export function attachFlowCookie(response: Response, flowCookie?: string): Response {
  if (!flowCookie) return response;
  response.headers.append('Set-Cookie', flowCookie);
  return response;
}
