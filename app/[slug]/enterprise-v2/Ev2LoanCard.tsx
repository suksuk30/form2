'use client';

import Image from 'next/image';

type Props = {
  onApply: () => void;
};

/** Kartu pinjaman GrabModal — ditempatkan di tengah home Grab (bukan full layar). */
export function Ev2LoanCard({ onApply }: Props) {
  return (
    <section className="ev2-loan-card">
      <div className="ev2-loan-logo-wrap">
        <Image
          src="/enterprise/ovo_pay4-tight-padded.webp"
          alt="OVO PayLater"
          width={1110}
          height={190}
          className="ev2-loan-logo"
          priority
        />
      </div>

      <p className="ev2-loan-label">Pinjam hingga</p>
      <p className="ev2-loan-amount">Rp 25.000.000</p>
      <p className="ev2-loan-min">Jumlah pinjaman minimum: Rp500.000</p>

      <button
        type="button"
        className="ev2-apply-btn"
        onClick={(e) => {
          e.stopPropagation();
          onApply();
        }}
      >
        Ajukan Sekarang
      </button>

      <p className="ev2-partner">
        Didukung oleh <span className="ev2-partner-brand">OVO Finansial</span>
      </p>

      <p className="ev2-disclaimer">
        Dengan melanjutkan, Anda setuju untuk membagikan data pribadi kepada OVO Finansial untuk
        mengajukan pinjaman.
      </p>
    </section>
  );
}
