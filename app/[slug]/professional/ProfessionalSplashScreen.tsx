'use client';

import Image from 'next/image';

export function ProfessionalSplashScreen() {
  return (
    <div className="professional-dana-root professional-splash-screen flex min-h-screen flex-col bg-[#108EE9]">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <Image
          src="/dana_text.png"
          alt="DANA"
          width={200}
          height={80}
          className="h-auto w-[180px] max-w-[70vw] object-contain"
          priority
        />
      </div>

      <div className="professional-splash-footer px-6 text-center">
        <p className="text-[11px] text-white/70">2.131.1</p>
        <p className="mt-3 text-[11px] leading-relaxed text-white/90">
          DANA Indonesia terdaftar dan diawasi oleh{' '}
          <span className="font-bold text-white">Bank Indonesia</span> dan{' '}
          <span className="font-bold text-white">Komdigi</span>
        </p>
      </div>
    </div>
  );
}
