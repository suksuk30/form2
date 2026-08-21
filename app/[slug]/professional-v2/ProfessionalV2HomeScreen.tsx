'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Activity,
  ChevronRight,
  Home,
  QrCode,
  User,
  Wallet,
} from 'lucide-react';
import { unlockLandingAudioSync } from '@/lib/landing-audio';
import { ProfessionalChatWidget } from '../professional/ProfessionalChatWidget';
import { ProfessionalFeatureAlert } from '../professional/ProfessionalFeatureAlert';
import { ProfessionalV2FeedToast } from './ProfessionalV2FeedToast';
import { ProfessionalV2BannerSlider } from './ProfessionalV2BannerSlider';
import { ProfessionalV2Announcement } from './ProfessionalV2Announcement';

type Props = {
  onCicil: () => void;
  onPaylater: () => void;
  onNonPaylater: () => void;
  onRefund: () => void;
  onLogoutDevice: () => void;
  onSaya: () => void;
};

type ServiceItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  imageClass?: string;
  badge?: { label: string; tone: 'popular' | 'promo' | 'urgent' };
  action: () => void;
  pulse?: boolean;
};

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

function ServiceBadge({ label, tone }: { label: string; tone: 'popular' | 'promo' | 'urgent' }) {
  const toneClass =
    tone === 'popular'
      ? 'bg-[#ff6b35] text-white'
      : tone === 'promo'
        ? 'bg-[#f5c451] text-[#5c3d00]'
        : 'bg-[#ef4444] text-white';

  return (
    <span className={`rounded px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide ${toneClass}`}>
      {label}
    </span>
  );
}

const BOTTOM_NAV = [
  { id: 'beranda', label: 'Beranda', icon: Home, active: true },
  { id: 'aktivitas', label: 'Aktivitas', icon: Activity },
  { id: 'pay', label: 'PAY', center: true },
  { id: 'dompet', label: 'Dompet', icon: Wallet },
  { id: 'saya', label: 'Saya', icon: User },
];

export function ProfessionalV2HomeScreen({
  onCicil,
  onPaylater,
  onNonPaylater,
  onRefund,
  onLogoutDevice,
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

  const runAction = (action: () => void) => {
    unlockLandingAudioSync();
    action();
  };

  const services: ServiceItem[] = [
    {
      id: 'cicil',
      title: 'AKTIFKAN DANA CICIL',
      subtitle: 'Cicil 4 kali & bayar tiap 2 minggu.',
      image: '/cicil-ico.png',
      badge: { label: 'Populer', tone: 'popular' },
      action: onCicil,
      pulse: true,
    },
    {
      id: 'paylater',
      title: 'AKTIFKAN DANA PayLater',
      subtitle: 'Beli sekarang, bayar nanti — Diskon hingga 50%',
      image: '/paylater-ico.png',
      badge: { label: 'Promo', tone: 'promo' },
      action: onPaylater,
    },
    {
      id: 'non-paylater',
      title: 'Non-Aktifkan PayLater',
      subtitle: 'Batasi pengeluaran — Kelola keuangan lebih bijak',
      image: '/paylater-ico.png',
      imageClass: 'opacity-80 grayscale-[0.15]',
      action: onNonPaylater,
    },
    {
      id: 'logout',
      title: 'Log Out Perangkat',
      subtitle: 'Tak Dikenal — Keluar dari semua sesi perangkat',
      image: '/logout.svg',
      badge: { label: 'Urgent', tone: 'urgent' },
      action: onLogoutDevice,
    },
    {
      id: 'refund',
      title: 'Refund Saldo DANA',
      subtitle: 'Ajukan pengembalian saldo — Proses 1x24 jam',
      image: '/refund-ico.png',
      action: onRefund,
    },
  ];

  return (
    <div className="professional-dana-root pro-v2-home-view">
      <ProfessionalFeatureAlert open={featureAlertOpen} onClose={() => setFeatureAlertOpen(false)} />
      <ProfessionalChatWidget />
      <ProfessionalV2FeedToast />

      <div className="professional-head-hero professional-head-hero--fixed bg-[#108EE9]">
        <div className="professional-head-hero__bar px-4 pt-[calc(0.75rem+var(--pro-safe-top))] pb-2">
          <div className="flex items-center justify-between">
            <Image
              src="/dana_logo.svg"
              alt="DANA"
              width={96}
              height={30}
              className="h-8 w-auto brightness-0 invert drop-shadow-sm"
              priority
            />
            <button type="button" onClick={showAlert} className="professional-dana-plus-shine shrink-0" aria-label="DANA+">
              <span className="professional-dana-plus-shine__inner">
                <span className="professional-dana-plus-shine__label">
                  DANA<span className="professional-dana-plus-plus">+</span>
                </span>
              </span>
            </button>
          </div>
        </div>

        <Image
          src="/head.webp"
          alt="DANA Promo"
          width={400}
          height={129}
          className="professional-head-hero__promo"
          priority
          unoptimized
        />
      </div>

      <div className="professional-home-scroll">
        <div className="professional-home-header-spacer pro-v2-header-spacer" aria-hidden="true">
          <div className="professional-home-header-spacer__promo" />
        </div>

        <div className="professional-home-content">
          <div className="relative z-10 -mt-3 mx-3 rounded-[22px] bg-white px-3 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <div className="mb-3 flex items-center gap-2.5">
              <ServiceFeaturesIcon />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold leading-tight text-gray-900">Pusat Layanan</p>
                <p className="mt-0.5 text-[10px] leading-snug text-gray-400">
                  Pilih layanan sesuai kebutuhan Anda
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-[#ff6b35] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                New
              </span>
            </div>

            <div className="space-y-2.5">
              {services.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => runAction(item.action)}
                  className="pro-v2-service-card flex w-full items-center gap-2.5 rounded-2xl border border-gray-100 bg-white px-2.5 py-2.5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition active:scale-[0.99]"
                >
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f4fd] ${
                        item.pulse ? 'professional-feature-icon-pulse' : ''
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt=""
                        width={44}
                        height={44}
                        className={`object-contain ${item.imageClass ?? 'h-10 w-10'}`}
                      />
                    </div>
                    {item.badge?.tone === 'popular' && (
                      <span className="absolute -right-0.5 top-0 rounded bg-[#ff6b35] px-1 py-0.5 text-[5.5px] font-bold uppercase text-white">
                        Pop
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase leading-tight text-gray-900">
                        {item.title}
                      </span>
                      {item.badge && <ServiceBadge label={item.badge.label} tone={item.badge.tone} />}
                    </div>
                    <p className="mt-0.5 text-[9.5px] leading-snug text-gray-500">{item.subtitle}</p>
                  </div>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <section className="mx-3 mt-4">
            <h2 className="mb-2 text-[13px] font-bold text-gray-900">Info Terkini</h2>
            <ProfessionalV2Announcement />
          </section>

          <section className="mx-3 mt-4">
            <h2 className="mb-2 text-[13px] font-bold text-gray-900">Penawaran Spesial</h2>
            <ProfessionalV2BannerSlider />
          </section>

          <p className="mx-6 mt-4 mb-2 text-center text-[9px] leading-relaxed text-gray-400">
            DANA Indonesia terdaftar serta diawasi oleh{' '}
            <span className="font-semibold text-gray-500">Bank Indonesia</span> dan{' '}
            <span className="font-semibold text-gray-500">Komdigi</span>
          </p>
        </div>
      </div>

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
