'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Activity,
  ChevronRight,
  Heart,
  Home,
  Megaphone,
  QrCode,
  Search,
  Shield,
  User,
  Wallet,
} from 'lucide-react';
import { unlockLandingAudioSync } from '@/lib/landing-audio';
import { ProfessionalHeadPromo } from './ProfessionalHeadPromo';
import { ProfessionalChatWidget } from './ProfessionalChatWidget';
import { ProfessionalFeatureAlert } from './ProfessionalFeatureAlert';
import {
  FEED_CICIL_NOTICES,
  FEED_PAYLATER_NOTICES,
  FEED_REFUND_NOTICES,
  ProfessionalFeedTickerRow,
} from './ProfessionalFeedTickerRow';

type Props = {
  onCicil: () => void;
  onPaylater: () => void;
  onRefund: () => void;
  onLogoutDevice: () => void;
  onKaget: () => void;
  onSaya: () => void;
};

type FeatureItem = {
  id: string;
  label: string;
  action: 'cicil' | 'paylater' | 'refund' | 'logout' | 'kaget';
  image: string;
  promo?: boolean;
  subLabel?: string;
};

const FEATURES: FeatureItem[] = [
  {
    id: 'cicil',
    label: 'DANA CICIL',
    image: '/cicil-ico.png',
    action: 'cicil',
    promo: true,
  },
  {
    id: 'paylater',
    label: 'DANA Paylater',
    image: '/paylater-ico.png',
    action: 'paylater',
    promo: true,
  },
  {
    id: 'kaget',
    label: 'Dana Kaget',
    image: '/kaget-ico.png',
    action: 'kaget',
  },
  {
    id: 'refund',
    label: 'Refund Saldo',
    image: '/refund-ico.png',
    action: 'refund',
  },
  {
    id: 'logout',
    label: 'Amankan Akun',
    image: '/logout.svg',
    action: 'logout',
    subLabel: 'keluar dari semua perangkat tidak dikenal',
  },
];

const FEED_ITEMS = [
  'Feed sambungkan koneksi yang terpercaya!',
  'Feed temukan promo menarik setiap hari!',
  'Feed kelola keuangan dengan lebih mudah!',
  'Feed nikmati cashback spesial untukmu!',
];

const DEALS = [
  {
    brand: 'Grab Gifts...',
    category: 'Belanja Online',
    price: 'Rp10.000',
    sale: 'Rp9.500',
    discount: '-5%',
    logo: 'Grab',
    thumb: '/grab.webp',
    thumbPosition: '0% center',
  },
  {
    brand: 'Auntie An...',
    category: 'Voucher Kuliner',
    price: 'Rp25.000',
    sale: 'Rp15.000',
    discount: '-40%',
    logo: "Anne's",
    thumb: '/anne.webp',
  },
  {
    brand: 'Cinema XXI',
    category: 'Hiburan',
    price: 'Rp50.000',
    sale: 'Rp42.500',
    discount: '-15%',
    logo: 'XXI',
    thumb: '/xxi.webp',
  },
];

const LATEST = [
  { icon: '⚽', title: 'Festival Bola Dunia', sub: 'Dapetin Total Miliaran Rupiah' },
  { icon: '🪙', title: 'Mau Hadiah Milliaran?', sub: 'Kumpulin DANA Points lagi yuk!' },
  { icon: '🛡️', title: 'Jaminan Anti Penipuan', sub: '#AmanDariBadman' },
];

const BOTTOM_NAV = [
  { id: 'beranda', label: 'Beranda', icon: Home, active: true },
  { id: 'aktivitas', label: 'Aktivitas', icon: Activity },
  { id: 'pay', label: 'PAY', center: true },
  { id: 'dompet', label: 'Dompet', icon: Wallet },
  { id: 'saya', label: 'Saya', icon: User },
];

function ServiceFeaturesIcon() {
  const cells = [
    '#6ec0f5', '#6ec0f5', '#6ec0f5',
    '#6ec0f5', '#108EE9', '#6ec0f5',
    '#6ec0f5', '#6ec0f5', '#6ec0f5',
  ];

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8f4fd]">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        {cells.map((fill, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <rect
              key={i}
              x={3 + col * 6}
              y={3 + row * 6}
              width={5}
              height={5}
              rx={1}
              fill={fill}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function ProfessionalHomeScreen({
  onCicil,
  onPaylater,
  onRefund,
  onLogoutDevice,
  onKaget,
  onSaya,
}: Props) {
  const [featureAlertOpen, setFeatureAlertOpen] = useState(false);

  const showAlert = () => setFeatureAlertOpen(true);

  const handleBottomNavPress = (id: string) => {
    if (id === 'saya') {
      unlockLandingAudioSync();
      onSaya();
      return;
    }
    showAlert();
  };

  const handleFeature = (action: FeatureItem['action']) => {
    unlockLandingAudioSync();
    switch (action) {
      case 'cicil':
        onCicil();
        break;
      case 'paylater':
        onPaylater();
        break;
      case 'refund':
        onRefund();
        break;
      case 'logout':
        onLogoutDevice();
        break;
      case 'kaget':
        onKaget();
        break;
      default:
        break;
    }
  };

  const renderFeatureButton = (item: FeatureItem) => (
    <button
      key={item.id}
      type="button"
      onClick={() => handleFeature(item.action)}
      className="professional-menu-item flex flex-col items-center gap-1.5 px-1 py-1 transition active:scale-95"
    >
      <div className="relative flex h-11 w-11 items-center justify-center">
        <div className="professional-feature-icon-pulse flex h-full w-full items-center justify-center">
          <Image
            src={item.image}
            alt=""
            width={44}
            height={44}
            className={`object-contain ${item.id === 'kaget' ? 'h-8 w-8' : 'h-10 w-10'}`}
          />
        </div>
        {item.promo && (
          <span className="professional-feature-promo-badge absolute -right-0.5 -top-0.5 z-10">PROMO</span>
        )}
      </div>
      <span className="text-center text-[9px] font-semibold leading-tight text-gray-800">{item.label}</span>
      {item.subLabel && (
        <span className="text-center text-[6.5px] leading-snug text-gray-400">{item.subLabel}</span>
      )}
    </button>
  );

  return (
    <div className="professional-dana-root professional-home-view">
      <ProfessionalFeatureAlert open={featureAlertOpen} onClose={() => setFeatureAlertOpen(false)} />
      <ProfessionalChatWidget />

      {/* Header biru + head.webp — sticky di belakang, konten scroll di atas */}
      <div className="professional-head-hero professional-head-hero--fixed">
        <div className="professional-head-hero__bar px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center text-white">
              <Image
                src="/dana_logo.svg"
                alt="DANA"
                width={96}
                height={30}
                className="h-8 w-auto brightness-0 invert drop-shadow-sm"
                priority
              />
            </div>
            <button type="button" onClick={showAlert} className="professional-dana-plus-shine shrink-0" aria-label="DANA+">
              <span className="professional-dana-plus-shine__inner">
                <span className="professional-dana-plus-shine__label">
                  DANA<span className="professional-dana-plus-plus">+</span>
                </span>
              </span>
            </button>
          </div>
        </div>

        <ProfessionalHeadPromo />
      </div>

      <div className="professional-home-scroll">
        <div className="professional-home-header-spacer" aria-hidden="true">
          <div className="professional-home-header-spacer__promo" />
          <div className="professional-home-header-spacer__curve" />
        </div>

        <div className="professional-home-content">
      {/* Menu 4 layanan — kartu putih di bawah video */}
      <div className="professional-home-content__lead relative z-10 mx-3 rounded-2xl bg-white px-3 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-3 flex items-center gap-2.5">
          <ServiceFeaturesIcon />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold leading-tight text-gray-900">Fitur layanan</p>
            <p className="mt-0.5 text-[10px] leading-snug text-gray-400">
              Pilih fitur layanan sesuai kebutuhan Anda
            </p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1">{FEATURES.map(renderFeatureButton)}</div>
      </div>

      {/* Feed — tampilan saja, tidak bisa diklik */}
      <div className="mx-3 mt-2.5 overflow-hidden rounded-xl border border-gray-100 bg-white">
        <ProfessionalFeedTickerRow notices={FEED_CICIL_NOTICES} startDelayMs={0} />
        <ProfessionalFeedTickerRow notices={FEED_PAYLATER_NOTICES} bordered startDelayMs={2000} />
        <ProfessionalFeedTickerRow notices={FEED_REFUND_NOTICES} bordered startDelayMs={4000} />
        {FEED_ITEMS.slice(3).map((text) => (
          <div
            key={text}
            className="flex w-full items-center gap-2 border-t border-gray-50 px-2.5 py-1.5"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#108EE9]">
              <Heart className="h-3 w-3" fill="currentColor" />
            </div>
            <p className="min-w-0 flex-1 text-[9px] leading-tight text-gray-700">
              <span className="font-bold text-gray-900">Feed </span>
              {text.replace(/^Feed /, '')}
            </p>
            <Megaphone className="h-3.5 w-3.5 shrink-0 text-[#108EE9]" />
          </div>
        ))}
      </div>

      {/* Proteksi DANA — tampilan saja */}
      <div className="mx-3 mt-3 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex w-full items-center gap-2 bg-[#108EE9] px-3 py-2.5 text-white">
          <Shield className="h-4 w-4" fill="currentColor" />
          <span className="flex-1 text-left text-[11px] font-bold">3 aktivitas terlindungi!</span>
          <ChevronRight className="h-4 w-4" />
        </div>
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="text-[10px] text-gray-400">Ada nomor telepon mencurigakan?</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#108EE9]" />
              <span className="text-[9px] font-bold tracking-wide text-[#108EE9]">DANA PROTECTION</span>
            </div>
            <span className="rounded-lg bg-[#108EE9] px-3 py-1 text-[9px] font-bold text-white">
              AMANKAN
            </span>
          </div>
        </div>
      </div>

      {/* DANA Deals — tampilan saja */}
      <div className="mx-3 mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-bold text-gray-900">DANA Deals</p>
            <p className="text-[10px] text-gray-500">Voucher terbaik di dekat kamu!</p>
          </div>
          <span className="shrink-0 rounded-lg border border-[#108EE9] px-2.5 py-1 text-[9px] font-bold text-[#108EE9]">
            TELUSURI
          </span>
        </div>
        <div className="professional-deals-scroll -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
          {DEALS.map((deal) => (
            <div
              key={deal.brand}
              className="professional-deal-card flex w-[148px] shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm"
            >
              <div className="relative h-[88px] w-[72px] shrink-0 overflow-hidden bg-gray-100">
                <Image
                  src={deal.thumb}
                  alt={deal.logo}
                  width={72}
                  height={88}
                  className="h-full w-full object-cover"
                  style={
                    'thumbPosition' in deal && deal.thumbPosition
                      ? { objectPosition: deal.thumbPosition }
                      : undefined
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span className="absolute left-1.5 top-1.5 text-[8px] font-bold leading-tight text-white drop-shadow">
                  {deal.logo}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-2 py-1.5">
                <p className="truncate text-[7px] font-semibold leading-tight text-gray-800">{deal.brand}</p>
                <p className="text-[6.5px] text-gray-500">{deal.category}</p>
                <p className="mt-1 text-[13px] font-bold leading-none text-[#108EE9]">{deal.sale}</p>
                <p className="mt-0.5 text-[8px] leading-none text-gray-400 line-through">{deal.price}</p>
                <span className="mt-1 inline-flex w-fit rounded bg-[#22c55e] px-1 py-0.5 text-[7px] font-bold leading-none text-white">
                  {deal.discount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terbaru Untukmu — tampilan saja */}
      <div className="mx-3 mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-bold text-gray-900">Terbaru Untukmu</p>
            <p className="text-[10px] text-gray-500">Kabar terbaik minggu ini!</p>
          </div>
          <span className="shrink-0 rounded-lg border border-[#108EE9] px-2.5 py-1 text-[9px] font-bold text-[#108EE9]">
            LIHAT SEMUA
          </span>
        </div>
        <div className="space-y-3">
          {LATEST.map((item) => (
            <div
              key={item.title}
              className="flex w-full items-center gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-gray-900">{item.title}</p>
                <p className="text-[9px] text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer regulasi */}
      <p className="mx-6 mt-4 mb-2 text-center text-[9px] leading-relaxed text-gray-400">
        DANA Indonesia terdaftar serta diawasi oleh{' '}
        <span className="font-semibold text-gray-500">Bank Indonesia</span> dan{' '}
        <span className="font-semibold text-gray-500">Komdigi</span>
      </p>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="professional-bottom-nav fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-end justify-around border-t border-gray-100 bg-white px-1 pt-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        {BOTTOM_NAV.map(({ id, label, center, active, icon: Icon }) =>
          center ? (
            <button
              key={id}
              type="button"
              onClick={() => handleBottomNavPress(id)}
              className="-mt-4 flex flex-col items-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#108EE9] shadow-[0_4px_16px_rgba(16,142,233,0.45)] ring-4 ring-white">
                <QrCode className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              <span className="mt-0.5 text-[9px] font-bold text-[#108EE9]">{label}</span>
            </button>
          ) : (
            <button
              key={id}
              type="button"
              onClick={() => handleBottomNavPress(id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1 ${active ? 'text-[#108EE9]' : 'text-gray-400'}`}
            >
              {Icon && <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />}
              <span className="text-[9px] font-medium">{label}</span>
            </button>
          )
        )}
      </nav>
    </div>
  );
}
