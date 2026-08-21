'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const BANNERS = [
  { src: '/ban1.webp', alt: 'Penawaran spesial DANA 1' },
  { src: '/ban2.webp', alt: 'Penawaran spesial DANA 2' },
  { src: '/ban3.webp', alt: 'Penawaran spesial DANA 3' },
] as const;

const SLIDE_INTERVAL_MS = 3500;

export function ProfessionalV2BannerSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % BANNERS.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <div className="relative h-[132px] w-full overflow-hidden">
        <div
          className="flex h-full w-full"
          style={{
            transform: `translate3d(-${index * 100}%, 0, 0)`,
            transition: 'transform 0.4s ease-out',
          }}
        >
          {BANNERS.map((banner) => (
            <Image
              key={banner.src}
              src={banner.src}
              alt={banner.alt}
              width={360}
              height={132}
              className="h-full w-full shrink-0 object-cover"
              sizes="(max-width: 448px) 100vw, 360px"
              unoptimized
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 py-2">
        {BANNERS.map((banner, dotIndex) => (
          <button
            key={banner.src}
            type="button"
            aria-label={`Banner ${dotIndex + 1}`}
            onClick={() => setIndex(dotIndex)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === dotIndex ? 'w-4 bg-[#108EE9]' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
