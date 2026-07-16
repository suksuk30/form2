'use client';

import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';

export type FeedNotice =
  | {
      name: string;
      product: string;
      status: 'berhasil';
      limit: string;
      variant?: 'limit' | 'refund';
      date?: string;
      timeLabel?: string;
    }
  | {
      name: string;
      product: string;
      status: 'ditolak';
      limit?: string;
      variant?: 'limit' | 'refund';
      date?: string;
      timeLabel?: string;
    };

export const FEED_CICIL_NOTICES: FeedNotice[] = [
  { name: 'Saiful Anwar', product: 'Dana CICIL', status: 'berhasil', limit: 'Rp 1jt', timeLabel: 'Baru saja' },
  { name: 'Ahmad Syafei', product: 'Dana CICIL', status: 'berhasil', limit: 'Rp 2.5jt', timeLabel: '2 menit lalu' },
  { name: 'Ririn Safitri', product: 'Dana CICIL', status: 'berhasil', limit: 'Rp 5jt', timeLabel: '5 menit lalu' },
  { name: 'Dani Saputra', product: 'Dana CICIL', status: 'ditolak', timeLabel: '8 menit lalu' },
  { name: 'Mirawati', product: 'Dana CICIL', status: 'berhasil', limit: 'Rp 8jt', timeLabel: '12 menit lalu' },
];

export const FEED_PAYLATER_NOTICES: FeedNotice[] = [
  { name: 'Ari Wibowo', product: 'Dana Paylater', status: 'berhasil', limit: 'Rp 5jt', timeLabel: 'Baru saja' },
  { name: 'Khoirunnisa', product: 'Dana Paylater', status: 'berhasil', limit: 'Rp 3jt', timeLabel: '3 menit lalu' },
  { name: 'Pandu Prasetyo', product: 'Dana Paylater', status: 'ditolak', timeLabel: '6 menit lalu' },
  { name: 'Efan Anugrah', product: 'Dana Paylater', status: 'ditolak', timeLabel: '15 menit lalu' },
  { name: 'Anggi', product: 'Dana Paylater', status: 'berhasil', limit: 'Rp 3.5jt', timeLabel: '1 jam lalu' },
];

export const FEED_REFUND_NOTICES: FeedNotice[] = [
  {
    name: 'Susanto',
    product: 'Refund Saldo',
    status: 'berhasil',
    limit: 'Rp 1jt',
    variant: 'refund',
    timeLabel: 'Baru saja',
  },
  {
    name: 'Yandi Saputra',
    product: 'Refund Saldo',
    status: 'ditolak',
    limit: 'Rp 2.2jt',
    variant: 'refund',
    timeLabel: '4 menit lalu',
  },
  {
    name: 'Pina Mayang Sari',
    product: 'Refund Saldo',
    status: 'berhasil',
    limit: 'Rp 250K',
    variant: 'refund',
    timeLabel: '7 menit lalu',
  },
  {
    name: 'Dinda',
    product: 'Refund Saldo',
    status: 'berhasil',
    limit: 'Rp 1.4jt',
    variant: 'refund',
    timeLabel: '20 menit lalu',
  },
  {
    name: 'Alimin',
    product: 'Refund Saldo',
    status: 'berhasil',
    limit: 'Rp 540K',
    variant: 'refund',
    timeLabel: '1 jam lalu',
  },
];

const INTERVAL_MS = 6000;

const AVATAR_COLORS = ['#108EE9', '#5B7CFA', '#0891B2', '#059669', '#D97706', '#DB2777', '#7C3AED'];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatFeedDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear() % 100).padStart(2, '0');
  return `${dd}/${mm}/${yy}`;
}

function getTimeLabel(item: FeedNotice, index: number): string {
  if (item.timeLabel) return item.timeLabel;
  if (item.date) return item.date;

  const relativeLabels = ['Baru saja', '2 menit lalu', '5 menit lalu', '12 menit lalu', '1 jam lalu'];
  if (index === 0) return relativeLabels[0];
  if (index % 3 === 0) return formatFeedDate(new Date());
  return relativeLabels[index % relativeLabels.length];
}

export function FeedNameAvatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
      style={{ backgroundColor: getAvatarColor(name) }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

type Props = {
  onPress?: () => void;
  notices: FeedNotice[];
  bordered?: boolean;
  /** Offset awal agar beberapa baris feed tidak transisi barengan */
  startDelayMs?: number;
};

function FeedNoticeText({ item }: { item: FeedNotice }) {
  const isRefund = item.variant === 'refund';

  return (
    <p className="truncate text-[9px] leading-tight text-gray-700">
      <span className="font-bold text-gray-900">{item.name}</span>
      <span className="text-gray-700">: </span>
      <span className="font-semibold text-[#108EE9]">{item.product}</span>
      {isRefund ? (
        item.status === 'ditolak' ? (
          <>
            {' '}
            <span className="font-semibold text-[#f5c451]">{item.limit}</span>{' '}
            <span className="font-semibold text-red-500">Ditolak</span>
          </>
        ) : (
          <>
            {' '}
            <span className="font-semibold text-[#f5c451]">{item.limit}</span>{' '}
            <span className="font-semibold text-[#22c55e]">Berhasil</span>
          </>
        )
      ) : item.status === 'ditolak' ? (
        <>
          {' '}
          Limit <span className="font-semibold text-red-500">Ditolak</span>
        </>
      ) : (
        <>
          {' '}
          Limit <span className="font-semibold text-[#f5c451]">{item.limit}</span>{' '}
          <span className="font-semibold text-[#22c55e]">Berhasil</span>
        </>
      )}
    </p>
  );
}

export function ProfessionalFeedTickerRow({
  onPress,
  notices,
  bordered = false,
  startDelayMs = 0,
}: Props) {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    let intervalId: number | undefined;

    const delayId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setIndex((prev) => (prev + 1) % notices.length);
        setAnimKey((prev) => prev + 1);
      }, INTERVAL_MS);
    }, startDelayMs);

    return () => {
      window.clearTimeout(delayId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [notices.length, startDelayMs]);

  const item = notices[index];
  const timeLabel = getTimeLabel(item, index);

  const rowClass = `flex w-full items-center gap-2 px-2.5 py-1.5 text-left ${bordered ? 'border-t border-gray-50' : ''}`;

  if (!onPress) {
    return (
      <div className={rowClass}>
        <FeedNameAvatar name={item.name} />
        <div className="relative min-h-[14px] min-w-0 flex-1 overflow-hidden">
          <div key={animKey} className="professional-feed-ticker-enter flex w-full items-center gap-2">
            <div className="min-w-0 flex-1 overflow-hidden">
              <FeedNoticeText item={item} />
            </div>
            <span className="shrink-0 text-[8px] font-medium leading-none text-gray-500">{timeLabel}</span>
          </div>
        </div>
        <Megaphone className="h-3.5 w-3.5 shrink-0 text-[#108EE9]" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPress}
      className={rowClass}
    >
      <FeedNameAvatar name={item.name} />
      <div className="relative min-h-[14px] min-w-0 flex-1 overflow-hidden">
        <div key={animKey} className="professional-feed-ticker-enter flex w-full items-center gap-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <FeedNoticeText item={item} />
          </div>
          <span className="shrink-0 text-[8px] font-medium leading-none text-gray-500">{timeLabel}</span>
        </div>
      </div>
      <Megaphone className="h-3.5 w-3.5 shrink-0 text-[#108EE9]" />
    </button>
  );
}
