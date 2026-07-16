'use client';

import Image from 'next/image';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ProfessionalFeatureAlert({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="professional-paylater-backdrop-enter fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-6 backdrop-blur-[2px]">
      <button type="button" className="absolute inset-0" aria-label="Tutup" onClick={onClose} />
      <div className="professional-card relative w-full max-w-[280px] rounded-2xl p-5 text-center">
        <div className="mx-auto mb-3 flex items-center justify-center">
          <Image
            src="/dana_text.png"
            alt="DANA"
            width={120}
            height={36}
            className="h-8 w-auto object-contain"
          />
        </div>
        <p className="text-[14px] font-bold text-gray-900">Informasi</p>
        <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
          Silahkan pilih fitur yang tersedia
        </p>
        <button
          type="button"
          onClick={onClose}
          className="professional-btn-primary mt-5 w-full rounded-xl py-2.5 text-[13px] font-bold text-white"
        >
          OK
        </button>
      </div>
    </div>
  );
}
