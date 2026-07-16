'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ENTERPRISE_PROMO_CARDS } from './lib/home-data';

export function EnterpriseHomePromoCarousel() {  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 172, behavior: 'smooth' });
  };

  return (
    <section className="enterprise-hc-promo-section">
      <h2 className="enterprise-hc-promo-title">Penawaran terbaru di bulan ini</h2>

      <div className="enterprise-hc-carousel-wrap">
        <button
          type="button"
          className="enterprise-hc-carousel-arrow enterprise-hc-carousel-arrow--left"
          onClick={() => scrollBy(-1)}
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div ref={scrollRef} className="enterprise-hc-carousel">
          {ENTERPRISE_PROMO_CARDS.map((card) => (
            <div key={card.id} className="enterprise-hc-carousel-card">
              <div className="enterprise-hc-carousel-card-image">
                <Image
                  src={card.image}
                  alt=""
                  width={252}
                  height={180}
                  className={`enterprise-hc-carousel-img h-full w-full ${card.imageClass ?? ''}`}
                />
              </div>
              <p className="enterprise-hc-carousel-card-caption">{card.caption}</p>
            </div>
          ))}        </div>

        <button
          type="button"
          className="enterprise-hc-carousel-arrow enterprise-hc-carousel-arrow--right"
          onClick={() => scrollBy(1)}
          aria-label="Selanjutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
