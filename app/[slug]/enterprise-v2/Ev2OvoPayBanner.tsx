'use client';

import Image from 'next/image';

export function Ev2OvoPayBanner() {
  return (
    <section className="enterprise-hc-app-card ev2-pay-banner-card">
      <div className="enterprise-hc-app-card-image ev2-pay-banner-static">
        <Image
          src="/enterprise/ovo_pay2.jpg"
          alt="Pengajuan OVO Paylater"
          width={1200}
          height={601}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </section>
  );
}
