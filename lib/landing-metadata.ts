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
const PROTOCOL = BASE_HOST.includes('localhost') ? 'http' : 'https';

function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${PROTOCOL}://${BASE_HOST}${path.startsWith('/') ? path : `/${path}`}`;
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
};

export function getLandingMetadata(templateId: LandingTemplateId): Metadata {
  const config = LANDING_META[templateId] ?? LANDING_META.basic;
  const ogImageUrl = absoluteUrl(config.ogImage);
  const metadataBase = new URL(`${PROTOCOL}://${BASE_HOST}`);

  return {
    metadataBase,
    title: config.title,
    description: config.description,
    icons: {
      icon: config.icon,
      shortcut: config.icon,
      apple: config.icon,
    },
    openGraph: {
      type: 'website',
      title: config.title,
      description: config.description,
      siteName: templateId === 'enterprise' ? 'Grab' : 'DANA',
      images: [
        {
          url: ogImageUrl,
          width: config.ogImageWidth,
          height: config.ogImageHeight,
          alt: config.ogImageAlt,
          type: templateId === 'enterprise' ? 'image/jpeg' : undefined,
        },
      ],
    },
    twitter: {
      card: templateId === 'enterprise' ? 'summary' : 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [ogImageUrl],
    },
    themeColor: config.themeColor,
    viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  };
}
