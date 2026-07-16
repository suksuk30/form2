'use client';

import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  Droplets,
  Lightbulb,
  Phone,
  QrCode,
  Settings,
  ShoppingCart,
} from 'lucide-react';

type Props = {
  onContinue: () => void;
};

const SERVICES = [
  { icon: QrCode, label: 'QRIS', color: 'bg-blue-50 text-blue-600' },
  { icon: Phone, label: 'Pulsa & Data', color: 'bg-red-50 text-red-500' },
  { icon: Droplets, label: 'Air', color: 'bg-sky-50 text-sky-500' },
  { icon: Lightbulb, label: 'Listrik', color: 'bg-amber-50 text-amber-500' },
  { icon: ShoppingCart, label: 'E-Commerce', color: 'bg-green-50 text-green-600' },
];

export function ProfessionalCicilScreen({ onContinue }: Props) {
  return (
    <div className="professional-dana-root flex min-h-screen flex-col bg-[#eceef2]">
      {/* Header biru */}
      <div className="professional-cicil-header relative z-0 px-4 pb-[4.5rem] text-white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="professional-cicil-icon-btn flex h-9 w-9 items-center justify-center rounded-full"
            aria-label="Kembali"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <h1 className="text-[15px] font-bold tracking-wide">DANA CICIL</h1>
          <div className="flex items-center gap-2">
            <span className="professional-cicil-icon-btn flex h-8 w-8 items-center justify-center rounded-full">
              <Clock className="h-4 w-4 opacity-95" />
            </span>
            <span className="professional-cicil-icon-btn flex h-8 w-8 items-center justify-center rounded-full">
              <Settings className="h-4 w-4 opacity-95" />
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1 text-[11px] text-white/90">
            Limit Tersedia
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/60 bg-white/10 text-[9px]">
              i
            </span>
          </div>
          <p className="mt-0.5 text-[28px] font-bold leading-none tracking-tight">s/d 10juta</p>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="professional-cicil-pill-3d rounded-full px-8 py-2.5 text-[12px] font-bold text-white"
          >
            CICIL Untukmu
          </button>
        </div>
      </div>

      <div className="professional-cicil-scroll relative z-10 -mt-14 flex-1 overflow-y-auto px-4">
        <div className="professional-cicil-card-3d rounded-2xl p-4">
          <p className="text-[13px] font-bold text-gray-900">
            Pakai di berbagai layanan favoritmu
          </p>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
            {SERVICES.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className={`professional-cicil-service-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold leading-tight text-gray-800">{label}</p>
                  <p className="text-[9px] text-gray-400">Bisa cicil 4x</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2.5">
              <div className="professional-cicil-service-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[11px] font-bold text-[#108EE9]">
                +37
              </div>
              <p className="text-[11px] font-bold text-[#108EE9]">Lihat semua</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="professional-cicil-btn-3d mt-4 flex w-full items-center justify-center rounded-xl py-3 text-[14px] font-bold text-white active:scale-[0.99]"
          >
            Lanjutkan
          </button>

          <div className="-mx-4 -mb-4 mt-4 flex items-center gap-2 rounded-b-2xl bg-[#fff5e8] px-4 py-2.5">
            <Crown className="h-4 w-4 shrink-0 text-amber-500" fill="currentColor" />
            <p className="flex-1 text-[11px] font-medium text-gray-700">Kumpulkan poin tiap pakai CICIL</p>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
          </div>
        </div>

        <p className="mt-5 text-[13px] font-bold text-gray-900">Merchant Pilihan</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="professional-cicil-merchant-3d overflow-hidden rounded-lg bg-white">
            <Image
              src="/promocicil1.jpg"
              alt="Promo CICIL 1"
              width={320}
              height={158}
              className="h-auto w-full object-contain"
              sizes="(max-width: 448px) 45vw, 200px"
              loading="lazy"
              quality={70}
            />
            <div className="px-2 py-1.5">
              <p className="text-[9px] font-bold leading-tight text-orange-500">Diskon s/d 10Rb</p>
              <p className="mt-0.5 text-[8px] leading-tight text-gray-500">Minimarket dan restoran</p>
              <p className="mt-0.5 text-[7px] leading-tight text-gray-400">Persedian terbatas</p>
            </div>
          </div>
          <div className="professional-cicil-merchant-3d overflow-hidden rounded-lg bg-white">
            <Image
              src="/promocicil2.jpg"
              alt="Promo CICIL 2"
              width={300}
              height={148}
              className="h-auto w-full object-contain"
              sizes="(max-width: 448px) 45vw, 200px"
              loading="lazy"
              quality={70}
            />
            <div className="px-2 py-1.5">
              <p className="text-[9px] font-bold leading-tight text-orange-500">Apps Favoritmu</p>
              <p className="mt-0.5 text-[8px] leading-tight text-gray-500">Streaming & belanja</p>
              <p className="mt-0.5 text-[7px] leading-tight text-gray-400">Bayarnya bisa nyicil 4x</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
