'use client';

import { useEffect, useState } from 'react';
import { Check, Clock, MapPin } from 'lucide-react';
import { FeedNameAvatar } from '../professional/ProfessionalFeedTickerRow';

type ToastNotice = {
  name: string;
  action: string;
  amount?: string;
  subtitle: string;
  location: string;
  time: string;
  date: string;
  variant: 'cicil' | 'paylater' | 'refund';
};

const TOAST_NOTICES: ToastNotice[] = [
  {
    name: 'Umi Maulana',
    action: 'Aktifkan Dana Cicil',
    amount: 'Rp7 Jt',
    subtitle: 'Pengajuan Cicil Limit Rp7 Juta',
    location: 'Manado (WITA)',
    time: '20.27.01',
    date: '21 Agu 2026',
    variant: 'cicil',
  },
  {
    name: 'Ratna Sari',
    action: 'Refund Saldo Dana',
    amount: '+Rp440K',
    subtitle: 'Refund Rp440.000 — Proses 1x24 jam',
    location: 'Malang (WIB)',
    time: '19.27.19',
    date: '21 Agu 2026',
    variant: 'refund',
  },
  {
    name: 'Ahmad Syafei',
    action: 'Aktifkan Dana PayLater',
    amount: 'Rp5 Jt',
    subtitle: 'Limit PayLater disetujui',
    location: 'Surabaya (WIB)',
    time: '18.45.33',
    date: '21 Agu 2026',
    variant: 'paylater',
  },
  {
    name: 'Saiful Anwar',
    action: 'Aktifkan Dana Cicil',
    amount: 'Rp2,5 Jt',
    subtitle: 'Pengajuan Cicil Limit Rp2,5 Juta',
    location: 'Jakarta (WIB)',
    time: '17.12.08',
    date: '21 Agu 2026',
    variant: 'cicil',
  },
  {
    name: 'Mirawati',
    action: 'Refund Saldo Dana',
    amount: '+Rp1,4 Jt',
    subtitle: 'Refund Rp1.400.000 — Proses 1x24 jam',
    location: 'Bandung (WIB)',
    time: '16.55.42',
    date: '21 Agu 2026',
    variant: 'refund',
  },
];

const DISPLAY_MS = 4500;
const GAP_MS = 1000;
const EXIT_MS = 280;

export function ProfessionalV2FeedToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let displayTimer: number | undefined;
    let exitTimer: number | undefined;
    let gapTimer: number | undefined;
    let cancelled = false;

    const scheduleNext = () => {
      if (cancelled) return;

      setVisible(true);
      setExiting(false);

      displayTimer = window.setTimeout(() => {
        if (cancelled) return;
        setExiting(true);

        exitTimer = window.setTimeout(() => {
          if (cancelled) return;
          setVisible(false);
          setExiting(false);

          gapTimer = window.setTimeout(() => {
            if (cancelled) return;
            setIndex((prev) => (prev + 1) % TOAST_NOTICES.length);
            scheduleNext();
          }, GAP_MS);
        }, EXIT_MS);
      }, DISPLAY_MS);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (displayTimer !== undefined) window.clearTimeout(displayTimer);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
      if (gapTimer !== undefined) window.clearTimeout(gapTimer);
    };
  }, []);

  const item = TOAST_NOTICES[index];
  const amountClass =
    item.variant === 'refund' ? 'text-[#22c55e]' : 'text-[#ef4444]';

  if (!visible) return null;

  return (
    <div className="pro-v2-feed-toast pointer-events-none fixed left-1/2 top-[calc(var(--pro-safe-top)+2.35rem)] z-50 w-full max-w-md -translate-x-1/2 px-3">
      <div
        className={`pro-v2-feed-toast__card ml-auto w-full max-w-[292px] overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_8px_28px_rgba(16,142,233,0.18)] backdrop-blur-sm ${
          exiting ? 'pro-v2-feed-toast__card--exit' : ''
        }`}
      >
        <div className="flex gap-2.5 px-3 py-2.5">
          <div className="relative shrink-0">
            <FeedNameAvatar name={item.name} />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#22c55e] ring-2 ring-white">
              <Check className="h-2 w-2 text-white" strokeWidth={3} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-bold text-gray-900">{item.name}</span>
              <span className="text-[9px] text-gray-500">@</span>
              <span className="truncate text-[9px] font-semibold text-[#108EE9]">{item.action}</span>
              {item.amount && (
                <span className={`text-[10px] font-bold ${amountClass}`}>{item.amount}</span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[8.5px] text-gray-500">{item.subtitle}</p>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="rounded border border-[#22c55e] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[#22c55e]">
                Berhasil
              </span>
              <span className="inline-flex items-center gap-0.5 text-[7.5px] text-gray-400">
                <Clock className="h-2.5 w-2.5" />
                {item.time}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[7.5px] text-gray-400">
                <MapPin className="h-2.5 w-2.5" />
                {item.location}
              </span>
              <span className="text-[7.5px] text-gray-400">{item.date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
