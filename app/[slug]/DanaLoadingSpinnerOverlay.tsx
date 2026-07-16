'use client';

import Image from 'next/image';

export function DanaLoadingSpinnerOverlay({
  visible,
}: {
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="animate-fade-in-out duration-1000">
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
        <div className="flex flex-col items-center">
          <div className="relative h-[40px] w-[40px]">
            {/* ring spinner CSS */}
            <div className="absolute inset-0 rounded-full border-[3px] border-white/20" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white animate-spin" style={{ borderTopColor: 'white' }} />

            <div className="absolute inset-0 m-auto h-[34px] w-[34px]">
              <Image
                src="/load_bg.png"
                alt="Loading"
                width={34}
                height={34}
                className="h-[34px] w-[34px] object-contain"
                priority
              />
            </div>
          </div>

          <p className="mt-4 text-[12px] font-semibold text-white/90">Memproses...</p>
        </div>
      </div>
    </div>
  );
}

