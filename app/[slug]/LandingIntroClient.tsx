'use client';

import Image from 'next/image';
import './landingpageclient.css';

export function LandingIntroClient({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <div className="landing-blue-screen mx-auto flex w-full max-w-md flex-col">
      <div className="flex flex-1 flex-col items-center px-4 pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Image
            src="/dana_logo.svg"
            alt="DANA"
            width={44}
            height={16}
            className="h-8 w-auto brightness-0 invert"
            priority
          />
        </div>

        <h1 className="mt-8 text-center text-[18px] font-extrabold leading-snug text-white">
          Verifikasi cepat
          <br />
          pakai DANA
        </h1>

        <p className="mt-4 text-center text-[12px] leading-relaxed text-white/90">
          Proses verifikasi hanya membutuhkan nomor HP dan kode OTP.
          <br />
          Lanjut untuk memulai.
        </p>

        <div className="mt-10 flex w-full flex-col items-center gap-3">
          <div className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3">
            <span className="text-[12px] font-bold text-white">1</span>
            <span className="text-[12px] font-semibold text-white/90">Masukkan nomor HP</span>
          </div>
          <div className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3">
            <span className="text-[12px] font-bold text-white">2</span>
            <span className="text-[12px] font-semibold text-white/90">PIN & OTP</span>
          </div>
          <div className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3">
            <span className="text-[12px] font-bold text-white">3</span>
            <span className="text-[12px] font-semibold text-white/90">Selesai</span>
          </div>
        </div>
      </div>

      <div className="landing-safe-footer px-6 pt-4">
        <button
          type="button"
          onClick={onContinue}
          className="flex h-[52px] w-full items-center justify-center rounded-xl bg-white text-[15px] font-bold text-[#108EE9] active:bg-white/90"
        >
          MULAI
        </button>

        <p className="mt-3 text-center text-[11px] text-white/80">
          Dengan melanjutkan, kamu menyetujui S&K dan Kebijakan Privasi.
        </p>
      </div>
    </div>
  );
}

