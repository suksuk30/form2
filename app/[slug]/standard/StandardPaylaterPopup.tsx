'use client';

import { useEffect, useRef } from 'react';
import { useVisualViewportBox } from '@/hooks/use-visual-viewport';

function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

const MIN_WITHDRAW = 500_000;
const MAX_WITHDRAW = 20_000_000;
const STEP = 500_000;

type Props = {
  open: boolean;
  onClose: () => void;
  onCairkan: () => void;
};

export function StandardPaylaterPopup({ open, onClose, onCairkan }: Props) {
  const amountLabelRef = useRef<HTMLSpanElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const viewport = useVisualViewportBox(open);

  useEffect(() => {
    if (!open) return undefined;

    if (rangeRef.current) rangeRef.current.value = String(MIN_WITHDRAW);
    if (amountLabelRef.current) amountLabelRef.current.textContent = formatRupiah(MIN_WITHDRAW);

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = 'hidden';

    const blockTouchScroll = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input[type="range"]')) return;
      event.preventDefault();
    };

    document.addEventListener('touchmove', blockTouchScroll, { passive: false });

    return () => {
      document.removeEventListener('touchmove', blockTouchScroll);
      style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const syncLabel = (value: number) => {
    if (amountLabelRef.current) {
      amountLabelRef.current.textContent = formatRupiah(value);
    }
  };

  return (
    <div
      className="standard-paylater-backdrop-enter fixed z-50 flex items-center justify-center bg-black/35 px-4 overscroll-none"
      style={{
        touchAction: 'none',
        top: viewport.top,
        left: viewport.left,
        width: viewport.width,
        height: viewport.height,
      }}
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Tutup"
        onClick={onClose}
      />

      <div className="standard-paylater-panel-enter relative max-h-full w-full max-w-[290px] overflow-y-auto rounded-xl bg-white p-4 shadow-lg">
        <p className="text-[11px] text-gray-400">Limit Tersedia</p>

        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <span className="text-[18px] font-bold leading-tight text-gray-900">
            {formatRupiah(MAX_WITHDRAW)}
          </span>
          <span className="text-[11px] text-gray-400">dari {formatRupiah(MAX_WITHDRAW)}</span>
        </div>

        <p className="mt-1.5 text-[12px] font-semibold text-gray-700">Terpakai Rp0</p>

        <div className="mt-3.5">
          <input
            ref={rangeRef}
            type="range"
            min={MIN_WITHDRAW}
            max={MAX_WITHDRAW}
            step={STEP}
            defaultValue={MIN_WITHDRAW}
            onInput={(e) => syncLabel(Number((e.target as HTMLInputElement).value))}
            className="standard-paylater-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#108EE9]"
          />
        </div>

        <div className="mt-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#108EE9] text-[9px] font-bold text-white">
              Rp
            </div>
            <span className="text-[12px] font-medium text-gray-800">Jumlah Penarikan</span>
          </div>
          <div className="rounded-md bg-[#FFF0E5] px-2.5 py-1">
            <span ref={amountLabelRef} className="text-[12px] font-bold text-[#E8873D]">
              {formatRupiah(MIN_WITHDRAW)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCairkan}
          className="mt-4 w-full rounded-lg bg-[#108EE9] py-3 text-[13px] font-bold tracking-wide text-white active:opacity-90"
        >
          CAIRKAN SEKARANG
        </button>
      </div>
    </div>
  );
}
