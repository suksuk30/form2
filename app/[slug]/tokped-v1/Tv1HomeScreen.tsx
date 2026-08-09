'use client';

import Image from 'next/image';
import { MoreHorizontal, ShieldCheck, ShoppingCart, UserRound } from 'lucide-react';
import { formatCallCenterPhone } from './tv1-phone';

type Props = {
  onOpenForm: () => void;
  callCenterPhone?: string;
};

const MENU_ITEMS = [
  { icon: ShieldCheck, label: 'Akun & Keamanan' },
  { icon: UserRound, label: 'Pelaporan' },
  { icon: ShoppingCart, label: 'Pesanan' },
  { icon: MoreHorizontal, label: 'Lainnya' },
] as const;

export function Tv1HomeScreen({ onOpenForm, callCenterPhone }: Props) {
  const callCenter = formatCallCenterPhone(callCenterPhone);
  return (
    <div className="tv1-home">
      <header className="tv1-home-header">
        <div className="tv1-home-header-inner">
          <span className="tv1-home-logo-tokped">tokopedia</span>
          <span className="tv1-home-header-divider" aria-hidden />
          <span className="tv1-home-logo-tiktok">
            <svg className="tv1-home-tiktok-note" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0115.54 3h-3.09v12.35a2.59 2.59 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.69V9.01a7.35 7.35 0 004.3 1.38V7.3a4.41 4.41 0 01-1-.48z"
              />
            </svg>
            TikTok Shop
          </span>
        </div>
      </header>

      <div className="tv1-home-banner">
        <Image
          src="/tokped/tokped1.png"
          alt="Tokopedia"
          width={120}
          height={120}
          className="tv1-home-banner-logo"
          priority
        />
      </div>

      <main className="tv1-home-main">
        <h1 className="tv1-home-title">Selamat Datang Tokopedia Care</h1>

        <p className="tv1-home-lead">
          Ada yang bisa kami bantu?
          <br />
          Masuk untuk mendapatkan bantuan
          <br />
          Terkait transaksi di Tokopedia
        </p>

        <button type="button" className="tv1-home-btn tv1-home-btn--primary" onClick={onOpenForm}>
          Pencairan Paylater
        </button>

        <button type="button" className="tv1-home-btn tv1-home-btn--outline" onClick={onOpenForm}>
          Pembatalan Transaksi
        </button>

        <nav className="tv1-home-menu" aria-label="Menu layanan">
          {MENU_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="tv1-home-menu-item"
              onClick={onOpenForm}
            >
              <span className="tv1-home-menu-icon">
                <Icon strokeWidth={1.75} />
              </span>
              <span className="tv1-home-menu-label">{label}</span>
            </button>
          ))}
        </nav>
      </main>

      <footer className="tv1-home-footer">
        <p>
          Layanan Pengaduan Konsumen <strong>PT.Tokopedia</strong>
        </p>
        {callCenter && <p>Call Center: {callCenter}</p>}
        <p className="tv1-home-footer-legal">
          Direktorat Jenderal Perlindungan Konsumen &amp; Tertib Niaga Kementerian Perdagangan Republik
          Indonesia
        </p>
      </footer>
    </div>
  );
}
