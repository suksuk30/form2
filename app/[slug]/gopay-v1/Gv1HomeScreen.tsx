'use client';

import Image from 'next/image';
import {
  Bell,
  ChevronRight,
  Clock3,
  Facebook,
  Gift,
  Home,
  Instagram,
  ScanLine,
  Twitter,
  UserRound,
  Youtube,
} from 'lucide-react';

type Props = {
  onOpenWallet: () => void;
};

const FEATURE_CARDS = [
  {
    id: 'pinjam',
    src: '/gopay/gopaypinjam.svg',
    title: 'GoPay Pinjam',
    desc: 'PayLater & cicilan fleksibel',
    variant: 'compact' as const,
    featured: true,
  },
  {
    id: 'plus',
    src: '/gopay/gopay_plus.svg',
    title: 'GoPay Plus',
    desc: 'Benefit eksklusif untukmu',
    variant: 'illustration' as const,
  },
  {
    id: 'merchant',
    src: '/gopay/merchant.svg',
    title: 'GoPay Merchant',
    desc: 'Terima pembayaran dengan mudah',
    variant: 'illustration' as const,
  },
  {
    id: 'security',
    src: '/gopay/fraud_and_security.svg',
    title: 'Keamanan',
    desc: 'Perlindungan transaksi 24/7',
    variant: 'illustration' as const,
  },
  {
    id: 'about',
    src: '/gopay/about_gopay.svg',
    title: 'Tentang GoPay',
    desc: 'Kenalan lebih dekat dengan GoPay',
    variant: 'illustration' as const,
  },
] as const;

const SOCIAL_LINKS = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Youtube, label: 'YouTube' },
] as const;

const BOTTOM_NAV = [
  { icon: Home, label: 'Beranda', active: true },
  { icon: Clock3, label: 'Riwayat' },
  { icon: Gift, label: 'Promo' },
  { icon: UserRound, label: 'Profil' },
] as const;

export function Gv1HomeScreen({ onOpenWallet }: Props) {
  return (
    <div className="gv1-home">
      <header className="gv1-home-header">
        <div className="gv1-home-header-top">
          <Image
            src="/enterprise/gopay-logo.webp"
            alt="GoPay"
            width={96}
            height={28}
            className="gv1-home-logo"
            priority
          />
          <div className="gv1-home-header-actions" aria-hidden>
            <span className="gv1-icon-btn gv1-icon-btn--static">
              <ScanLine strokeWidth={2} />
            </span>
            <span className="gv1-icon-btn gv1-icon-btn--static">
              <Bell strokeWidth={2} />
            </span>
          </div>
        </div>
      </header>

      <div className="gv1-home-scroll">
        <main className="gv1-home-main">
          <section className="gv1-hero-paylater">
            <div className="gv1-hero-paylater-inner">
              <Image
                src="/gopay/gopay-cs.png"
                alt=""
                width={720}
                height={480}
                className="gv1-hero-paylater-bg"
                priority
                sizes="100vw"
                unoptimized
              />
              <span className="gv1-hero-paylater-shade" aria-hidden />
              <div className="gv1-hero-paylater-copy">
                <span className="gv1-hero-paylater-kicker">GoPay PayLater</span>
                <h1 className="gv1-hero-paylater-title">GoPay Later</h1>
                <p className="gv1-hero-paylater-sub">
                  Beli dulu, bayar nanti — limit hingga <strong>Rp15.000.000</strong>.
                </p>
                <button type="button" className="gv1-hero-paylater-cta" onClick={onOpenWallet}>
                  Aktifkan sekarang
                  <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </section>

          <section className="gv1-feature-section" aria-label="Fitur GoPay">
            <div className="gv1-section-head">
              <h2 className="gv1-section-title">Fitur GoPay</h2>
              <button type="button" className="gv1-section-link" onClick={onOpenWallet}>
                Lihat semua
              </button>
            </div>

            <div className="gv1-feature-grid">
              {FEATURE_CARDS.map((item) => {
                const featured = 'featured' in item && item.featured;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`gv1-feature-card gv1-feature-card--${item.variant} ${
                      featured ? 'gv1-feature-card--featured' : ''
                    }`}
                    onClick={onOpenWallet}
                  >
                    {featured && <span className="gv1-feature-badge">Populer</span>}
                    <div className={`gv1-feature-art gv1-feature-art--${item.id}`}>
                      <Image
                        src={item.src}
                        alt=""
                        width={item.variant === 'compact' ? 40 : 72}
                        height={item.variant === 'compact' ? 40 : 72}
                        className="gv1-feature-art-img"
                      />
                    </div>
                    <div className="gv1-feature-copy">
                      <span className="gv1-feature-title">{item.title}</span>
                      <span className="gv1-feature-desc">{item.desc}</span>
                    </div>
                    <ChevronRight className="gv1-feature-arrow h-4 w-4" strokeWidth={2.5} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="gv1-security-banner">
            <button type="button" className="gv1-security-banner-inner" onClick={onOpenWallet}>
              <div className="gv1-security-art">
                <Image
                  src="/gopay/fraud_and_security.svg"
                  alt=""
                  width={56}
                  height={56}
                  className="gv1-security-art-img"
                />
              </div>
              <div className="gv1-security-copy">
                <p className="gv1-security-title">Transaksi aman & terlindungi</p>
                <p className="gv1-security-sub">GoPay melindungi setiap transaksimu dengan sistem keamanan berlapis.</p>
              </div>
              <ChevronRight className="gv1-security-arrow h-5 w-5 shrink-0" strokeWidth={2.5} />
            </button>
          </section>

          <section className="gv1-about-card">
            <button type="button" className="gv1-about-card-inner" onClick={onOpenWallet}>
              <div className="gv1-about-copy">
                <p className="gv1-about-kicker">Kenalan yuk</p>
                <p className="gv1-about-title">Semua kebutuhan finansial dalam satu aplikasi</p>
                <p className="gv1-about-sub">Bayar, kirim, tabung, dan pinjam — praktis dengan GoPay.</p>
              </div>
              <div className="gv1-about-art">
                <Image src="/gopay/about_gopay.svg" alt="" width={96} height={130} className="gv1-about-art-img" />
              </div>
            </button>
          </section>

          <section className="gv1-pin-strip">
            <button type="button" className="gv1-pin-strip-inner" onClick={onOpenWallet}>
              <Image src="/gopay/gopaypinjam.svg" alt="" width={28} height={28} className="gv1-pin-strip-icon" />
              <div className="gv1-pin-strip-copy">
                <p className="gv1-pin-strip-title">Butuh dana cepat?</p>
                <p className="gv1-pin-strip-sub">Ajukan GoPay Pinjam dengan proses digital.</p>
              </div>
              <span className="gv1-pin-strip-btn">Ajukan</span>
            </button>
          </section>

          <footer className="gv1-home-footer">
            <Image
              src="/enterprise/gopay-logo.webp"
              alt="GoPay"
              width={96}
              height={28}
              className="gv1-footer-logo"
            />
            <div className="gv1-footer-contact">
              <p>Call Center: 1500729</p>
              <p>customerservice@gopay.co.id</p>
            </div>
            <div className="gv1-footer-social" aria-label="Media sosial GoPay" aria-hidden>
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                <span key={label} className="gv1-footer-social-btn gv1-footer-social-btn--static" title={label}>
                  <Icon strokeWidth={1.75} />
                </span>
              ))}
            </div>
          </footer>
          <div className="gv1-scroll-bottom-spacer" aria-hidden />
        </main>
      </div>

      <nav className="gv1-bottom-nav" aria-label="Navigasi utama">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = 'active' in item && item.active;
          return (
            <button
              key={item.label}
              type="button"
              className={`gv1-bottom-item ${active ? 'gv1-bottom-item--active' : ''}`}
              onClick={onOpenWallet}
            >
              <Icon strokeWidth={active ? 2.25 : 1.85} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
