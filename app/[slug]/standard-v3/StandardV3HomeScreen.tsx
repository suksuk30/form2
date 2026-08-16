'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Headphones, RotateCcw, Sparkles, X } from 'lucide-react';
import { StandardDanaFooter } from '../standard/StandardDanaFooter';

type Props = {
  onActivateCicil: () => void;
  onActivateInstan: () => void;
  onCairkanPaylater: () => void;
  onLaporkanKendala: () => void;
  onRefundSaldo: () => void;
};

export function StandardV3HomeScreen({
  onActivateCicil,
  onActivateInstan,
  onCairkanPaylater,
  onLaporkanKendala,
  onRefundSaldo,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className="standard-dana-root standard-hero-bg standard-home-shell flex flex-col">
      <header className="relative z-20 flex items-center justify-between px-5 pb-1 pt-5">
        <Image
          src="/dana_logo.svg"
          alt="DANA"
          width={96}
          height={30}
          className="h-8 w-auto brightness-0 invert"
          priority
        />

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full bg-white/15 ring-1 ring-white/25"
          aria-label="Buka menu"
          aria-expanded={menuOpen}
          aria-controls="standard-v3-side-menu"
        >
          <span className="block h-0.5 w-4 rounded-full bg-white" />
          <span className="block h-0.5 w-4 rounded-full bg-white" />
          <span className="block h-0.5 w-4 rounded-full bg-white" />
        </button>
      </header>

      <div
        className={`standard-side-menu-root ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="standard-side-menu-backdrop"
          aria-label="Tutup menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          id="standard-v3-side-menu"
          className="standard-side-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <Image
                src="/dana_icon.svg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
              <div>
                <p className="text-[13px] font-bold text-gray-900">Menu</p>
                <p className="text-[10px] text-gray-500">Bantuan & dukungan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="px-2 py-3">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Layanan
            </p>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLaporkanKendala();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left active:bg-gray-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#108EE9]/12 text-[#108EE9]">
                <Headphones className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-gray-900">
                  Laporkan Kendala
                </span>
                <span className="mt-0.5 block text-[11px] text-gray-500">
                  Hubungi tim bantuan DANA
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRefundSaldo();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left active:bg-gray-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#108EE9]/12 text-[#108EE9]">
                <RotateCcw className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-gray-900">
                  Refund Saldo
                </span>
                <span className="mt-0.5 block text-[11px] text-gray-500">
                  Ajukan pengembalian saldo
                </span>
              </span>
            </button>
          </nav>

          <div className="mt-auto border-t border-gray-100 px-4 py-4">
            <p className="text-[10px] leading-relaxed text-gray-400">
              © 2025 DANA — PT. Espay Debit Indonesia Koe
            </p>
          </div>
        </aside>
      </div>

      <div className="relative z-10 px-5 pt-3 pb-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 ring-1 ring-white/30">
          <Sparkles className="h-3 w-3 text-[#f5c451]" />
          <span className="text-[10px] font-semibold tracking-wide text-white">
            Penawaran spesial hari ini
          </span>
        </div>
        <p className="mt-3 text-[22px] font-bold leading-[1.25] text-white">
          Kelola keuanganmu
          <br />
          dengan lebih mudah
        </p>
        <p className="mt-1.5 max-w-[280px] text-[11px] leading-relaxed text-white/80">
          Aktifkan CICIL, Instan, atau Paylater dalam hitungan detik.
        </p>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-stretch gap-2.5 overflow-y-auto px-3 pb-3 pt-2">
        <article className="standard-home-card w-full rounded-[20px] p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="standard-badge-gold rounded-full px-2.5 py-0.5 text-[8px] font-bold tracking-wide">
              PREMIUM
            </span>
            <span className="text-[9px] font-semibold text-[#108EE9]/80">Limit s/d 10jt</span>
          </div>

          <button
            type="button"
            onClick={onActivateCicil}
            className="standard-btn-primary mb-2.5 w-full rounded-full py-2.5 text-[13px] font-bold text-white active:scale-[0.98]"
          >
            Aktifkan Dana CICIL
          </button>

          <h2 className="text-center text-[12px] font-bold leading-snug text-gray-800">
            Bayar kebutuhan makin mudah pakai DANA CICIL
          </h2>

          <div className="standard-inner-panel mt-2.5 overflow-hidden rounded-2xl p-2.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/dana-logo.svg"
                    alt=""
                    width={52}
                    height={18}
                    className="h-3.5 w-auto brightness-0 invert"
                  />
                  <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    CICIL
                  </span>
                </div>
                <p className="mt-1.5 text-[9px] leading-snug text-white/95">
                  Beli kebutuhan dan cicil pembayarannya!
                </p>
                <div className="mt-2 inline-block rounded-full bg-white px-2.5 py-1 text-[7px] font-bold text-[#065B9E]">
                  CEK MERCHANT DI SINI
                </div>
              </div>
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-xl border border-white/35 bg-white/12 p-1">
                <Image
                  src="/cicil.png"
                  alt="DANA CICIL"
                  width={72}
                  height={72}
                  className="max-h-full max-w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </article>

        <article className="standard-home-card w-full rounded-[20px] p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="standard-badge-gold rounded-full px-2.5 py-0.5 text-[8px] font-bold tracking-wide">
              POPULER
            </span>
            <span className="text-[9px] font-semibold text-[#108EE9]/80">Limit s/d 25jt</span>
          </div>

          <button
            type="button"
            onClick={onActivateInstan}
            className="standard-btn-primary mb-2.5 w-full rounded-full py-2.5 text-[13px] font-bold text-white active:scale-[0.98]"
          >
            Aktifkan Dana Instan
          </button>

          <h2 className="text-center text-[12px] font-bold leading-snug text-gray-800">
            Dana instan cepat cair langsung ke DANA
          </h2>

          <div className="standard-inner-panel mt-2.5 overflow-hidden rounded-2xl p-2.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/dana-logo.svg"
                    alt=""
                    width={52}
                    height={18}
                    className="h-3.5 w-auto brightness-0 invert"
                  />
                  <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    Instan
                  </span>
                </div>
                <p className="mt-1.5 text-[9px] leading-snug text-white/95">
                  Proses mudah, bunga ringan, tenor fleksibel
                </p>
                <div className="mt-2 inline-block rounded-full bg-white px-2.5 py-1 text-[7px] font-bold text-[#065B9E]">
                  AJUKAN SEKARANG
                </div>
              </div>
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-xl border border-white/35 bg-white/12 p-1">
                <Image
                  src="/paylater-ico.png"
                  alt="DANA Instan"
                  width={72}
                  height={72}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </article>

        <article className="standard-home-card w-full rounded-[20px] p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="standard-badge-gold rounded-full px-2.5 py-0.5 text-[8px] font-bold tracking-wide">
              PREMIUM
            </span>
            <span className="text-[9px] font-semibold text-[#108EE9]/80">Cair instan</span>
          </div>

          <button
            type="button"
            onClick={onCairkanPaylater}
            className="standard-btn-primary mb-2.5 w-full rounded-full py-2.5 text-[13px] font-bold text-white active:scale-[0.98]"
          >
            Aktifkan Dana Paylater
          </button>

          <h2 className="text-center text-[12px] font-bold leading-snug text-gray-800">
            Keuanganmu lebih aman dengan Dana Paylater
          </h2>

          <div className="standard-inner-panel mt-2.5 overflow-hidden rounded-2xl p-2.5">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Image
                    src="/dana-logo.svg"
                    alt=""
                    width={52}
                    height={18}
                    className="h-3.5 w-auto brightness-0 invert"
                  />
                  <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    Paylater
                  </span>
                </div>
                <p className="mt-1.5 text-[9px] leading-snug text-white/95">
                  Bunga ringan, cair langsung ke DANA
                </p>
                <div className="mt-2 inline-block rounded-full bg-white px-2.5 py-1 text-[7px] font-bold text-[#065B9E]">
                  CEK LIMIT KAMU
                </div>
              </div>
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center">
                <Image
                  src="/paylater.webp"
                  alt="DANA Paylater"
                  width={84}
                  height={84}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </article>
      </div>

      <StandardDanaFooter className="standard-home-footer" />
    </div>
  );
}
