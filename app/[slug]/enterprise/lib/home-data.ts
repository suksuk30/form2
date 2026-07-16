export type EnterprisePromoCard = {
  id: string;
  image: string;
  caption: string;
  action?: 'security' | 'transport' | 'food';
  imageClass?: string;
};

export const ENTERPRISE_PROMO_CARDS: EnterprisePromoCard[] = [
  {
    id: 'campus',
    image: '/enterprise/grab-campus-card.webp',
    caption: 'Campus Hack: Solusi untuk Mahasiswa',
    action: 'security',
    imageClass: 'enterprise-hc-carousel-img--campus',
  },
  {
    id: 'health',
    image: '/enterprise/grab-sehat.webp',
    caption: 'Layanan Kesehatan 24/7',
    action: 'security',
  },
  {
    id: 'berkurban',
    image: '/enterprise/grab-kurban.webp',
    caption: 'Berkurban Lebih Mudah',
    action: 'food',
  },
  {
    id: 'mart',
    image: '/enterprise/grab-mart.webp',
    caption: 'GrabMart Diskon s/d 40%',
    action: 'transport',
  },
  {
    id: 'food',
    image: '/enterprise/grab-food.webp',
    caption: 'GrabFood Promo Spesial',
    action: 'food',
  },
];

export const ENTERPRISE_BOTTOM_NAV = [
  { id: 'utama', label: 'Utama', icon: 'home' as const, active: true },
  { id: 'telusuri', label: 'Telusuri', icon: 'explore' as const },
  { id: 'pendapat', label: 'Pendapat', icon: 'chart' as const },
  { id: 'dompet', label: 'Dompet', icon: 'wallet' as const },
  { id: 'lainnya', label: 'Lainnya', icon: 'menu' as const },
];

export const ENTERPRISE_SOCIAL_LINKS = [
  { id: 'facebook', label: 'Facebook', letter: 'f' },
  { id: 'instagram', label: 'Instagram', letter: 'in' },
  { id: 'x', label: 'X', letter: 'X' },
  { id: 'tiktok', label: 'TikTok', letter: '♪' },
  { id: 'youtube', label: 'YouTube', letter: '▶' },
  { id: 'linkedin', label: 'LinkedIn', letter: 'in' },
];
