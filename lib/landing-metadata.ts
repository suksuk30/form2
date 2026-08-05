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
    ogImage: 'https://www.verrify.my.id/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  standard: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: 'https://www.verrify.my.id/dana-ico.png',
    ogImageAlt: 'DANA',
    ogImageWidth: 1200,
    ogImageHeight: 630,
  },
  professional: {
    title: 'DANA - Apapun Transaksinya, DANA solusinya',
    description: 'DANA - Apapun transaksinya, DANA solusinya.',
    themeColor: '#108EE9',
    icon: '/dana_icon.svg',
    ogImage: 'https://www.verrify.my.id/dana-ico.png',
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
};

export function getLandingMetadata(
  templateId: LandingTemplateId,
  requestHost?: string | null
): Metadata {
  const config = LANDING_META[templateId] ?? LANDING_META.basic;
  const { origin, metadataBase } = resolveOrigin(requestHost);
  const ogImageUrl = absoluteUrl(config.ogImage, origin);
  const canonicalUrl = `${origin}/`;
  const isGrabLanding = templateId === 'enterprise' || templateId === 'enterprise_v2';

  return {
    metadataBase,
    title: config.title,
    description: config.description,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: config.icon,
      shortcut: config.icon,
      apple: config.icon,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: config.title,
      description: config.description,
      siteName: isGrabLanding ? 'Grab' : 'DANA',
      images: [
        {
          url: ogImageUrl,
          width: config.ogImageWidth,
          height: config.ogImageHeight,
          alt: config.ogImageAlt,
          type: isGrabLanding ? 'image/jpeg' : undefined,
        },
      ],
    },
    twitter: {
      card: isGrabLanding ? 'summary' : 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [ogImageUrl],
    },
    themeColor: config.themeColor,
    viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  };
}
