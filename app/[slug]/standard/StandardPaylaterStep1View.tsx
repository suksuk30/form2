'use client';

import Image from 'next/image';
import { Check, Loader2 } from 'lucide-react';
import { formatPhoneInput } from '@/lib/landing/format';

const CONSENT_ITEMS = [
  'Akses saldo DANA Anda',
  'Akses ID Anda',
  'Anda akan diarahkan ke halaman akun DANA dan akan masuk secara otomatis.',
  'Bayar menggunakan saldo DANA Anda secara otomatis.',
];

type Props = {
  phone: string;
  onPhoneChange: (value: string) => void;
  onContinue: () => void;
  phoneIsValid: boolean;
  submitting: boolean;
  errorMessage: string;
};

export function StandardPaylaterStep1View({
  phone,
  onPhoneChange,
  onContinue,
  phoneIsValid,
  submitting,
  errorMessage,
}: Props) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#eef0f3]">
      <div className="landing-blue-header px-5 pb-8">
        <Image
          src="/dana_logo.svg"
          alt="DANA"
          width={90}
          height={28}
          className="mx-auto h-7 w-auto brightness-0 invert"
          priority
        />
      </div>

      <div className="relative -mt-5 flex-1 px-4 pb-8">
        <div className="rounded-2xl bg-white px-4 pb-6 pt-5 shadow-md">
          {/* Connection icons */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-full">
              <Image
                src="/dana_icon.svg"
                alt="DANA"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              ))}
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
              <Image
                src="/tiktok.png"
                alt="PayLater"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <h1 className="mt-4 text-center text-[22px] font-bold text-gray-900">PayLater</h1>
          <p className="mt-2 text-center text-[12px] leading-relaxed text-gray-500">
            Hubungkan DANA Anda ke PayLater untuk pembayaran yang lebih mudah & nyaman
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (phoneIsValid && !submitting) onContinue();
            }}
          >
            <p className="mt-6 text-[13px] font-semibold text-gray-800">Masukkan nomor HP sebagai ID DANA</p>
            <div className="mt-2 flex h-[44px] items-center overflow-hidden rounded-lg border border-gray-200">
              <div className="flex h-full items-center gap-2 border-r border-gray-200 px-3">
                <Image src="/indo.png" alt="" width={22} height={14} className="h-3.5 w-5 object-cover" />
                <span className="text-[14px] font-medium text-gray-700">+62</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                enterKeyHint="go"
                placeholder="8123456789"
                className="min-w-0 flex-1 px-3 text-[15px] text-gray-800 placeholder:text-gray-300 outline-none"
                value={formatPhoneInput(phone)}
                onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && phoneIsValid && !submitting) {
                    e.preventDefault();
                    onContinue();
                  }
                }}
              />
            </div>

            <p className="mt-5 text-[11px] leading-relaxed text-gray-600">
              Dengan menghubungkan akun DANA Anda ke PayLater, Anda setuju untuk:
            </p>
            <ul className="mt-3 space-y-2.5">
              {CONSENT_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-[11px] leading-snug text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <span>Diamankan oleh</span>
              <Image
                src="/daaa.svg"
                alt="DANA PROTECTION"
                width={160}
                height={32}
                className="h-7 w-auto"
              />
            </div>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-gray-400">
              Semua informasi dilindungi oleh DANA. Dengan melanjutkan proses, Anda menyetujui{' '}
              <span className="font-semibold text-[#108EE9]">Syarat & Ketentuan</span>.
            </p>

            {errorMessage && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-[11px] text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={!phoneIsValid || submitting}
              className={`mt-4 flex h-[48px] w-full items-center justify-center rounded-lg text-[14px] font-bold tracking-wide transition ${
                phoneIsValid
                  ? 'bg-[#108EE9] text-white active:bg-[#0e7fd0]'
                  : 'bg-gray-300 text-white cursor-not-allowed'
              }`}
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'MELANJUTKAN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
