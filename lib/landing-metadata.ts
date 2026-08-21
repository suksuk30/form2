import type { Metadata } from 'next';
import type { LandingTemplateId } from '@/lib/supabase';

type LandingMetaConfig = {
  title: string;
  description: string;
  themeColor: string;
  icon: string;
  ogImage: string;
  ogImageAlt: string;
  ogImageWidth: number;
  ogImageHeight: number;
};

const BASE_HOST = process.env.NEXT_PUBLIC_BASE_HOST ?? 'localhost:3000';

function resolveOrigin(requestHost?: string | null): { origin: string; metadataBase: URL } {
  const host = (requestHost?.trim() || BASE_HOST).replace(/^www\./, '');
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const metadataBase = new URL(`${protocol}://${host}`);
  return { origin: metadataBase.origin, metadataBase };
}

function absoluteUrl(path: string, origin: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

const LANDING_META: Record<LandingTemplateId, LandingMetaConfig> = {
  basic: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: '/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  basic_v2: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: '/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  standard: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: '/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  standard_v2: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: '/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  standard_v3: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: '/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  professional: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: '/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  professional_v2: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: '/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  enterprise: {
    title: 'Grab. Satu aplikasi semua bisa',
    description: 'Formulir pengajuan reimbursement.',
    themeColor: '#00B14F',
    icon: '/enterprise/favicon.ico',
    ogImage: '/enterprise/grab-logo.jpg',
    ogImageAlt: 'Grab',
    ogImageWidth: 736,
    ogImageHeight: 736,
  },
  enterprise_v2: {
    title: 'Grab. Satu aplikasi semua bisa',
    description: 'Pengajuan OVO Paylater',
    themeColor: '#00B14F',
    icon: '/enterprise/favicon.ico',
    ogImage: '/enterprise/grab-logo.jpg',
    ogImageAlt: 'Grab',
    ogImageWidth: 736,
    ogImageHeight: 736,
  },
  tokped_v1: {
    title: 'Tokopedia Care',
    description: 'Selamat Datang Tokopedia Care — bantuan terkait transaksi di Tokopedia.',
    themeColor: '#ffffff',
    icon: '/tokped/tokped1.png',
    ogImage: '/tokped/tokped-og.jpg',
    ogImageAlt: 'Tokopedia Paylater — Tokopedia Care',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
};

export function getLandingMetadata(
  templateId: LandingTemplateId,
  requestHost?: string | null
): Metadata {
  const config = LANDING_META[templateId] ?? LANDING_META.basic;
  const { origin, metadataBase } = resolveOrigin(requestHost);
  const ogImageUrl = absoluteUrl(config.ogImage, origin);
  const canonicalUrl = `${origin}/`;
  const isGrabLanding =
    templateId === 'enterprise' ||
    templateId === 'enterprise_v2' ||
    templateId === 'tokped_v1';
  const isTokpedLanding = templateId === 'tokped_v1';

  return {
    metadataBase,
    title: config.title,
    description: config.description,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: isTokpedLanding
      ? {
          icon: [{ url: config.icon, type: 'image/png' }],
          shortcut: config.icon,
          apple: config.icon,
        }
      : {
          icon: config.icon,
          shortcut: config.icon,
          apple: config.icon,
        },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: config.title,
      description: config.description,
      siteName: isTokpedLanding ? 'Tokopedia' : isGrabLanding ? 'Grab' : 'DANA',
      images: [
        {
          url: ogImageUrl,
          width: config.ogImageWidth,
          height: config.ogImageHeight,
          alt: config.ogImageAlt,
          type: isTokpedLanding || isGrabLanding ? 'image/jpeg' : undefined,
        },
      ],
    },
    twitter: {
      card: isTokpedLanding ? 'summary_large_image' : isGrabLanding ? 'summary' : 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [ogImageUrl],
    },
    themeColor: config.themeColor,
    viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  };
}
