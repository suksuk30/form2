'use client';

import { formatCallCenterPhone } from './tv1-phone';

type Props = {
  title?: string;
};

export function Tv1FormHeader({ title }: Props) {
  if (title) {
    return (
      <header className="tv1-form-header">
        <h1 className="tv1-form-header-title">{title}</h1>
      </header>
    );
  }

  return (
    <header className="tv1-form-header">
      <div className="tv1-form-header-brand">
        <span className="tv1-form-logo-tokped">tokopedia</span>
        <span className="tv1-form-header-divider" aria-hidden />
        <span className="tv1-form-logo-tiktok">
          <svg className="tv1-form-tiktok-note" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0115.54 3h-3.09v12.35a2.59 2.59 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.69V9.01a7.35 7.35 0 004.3 1.38V7.3a4.41 4.41 0 01-1-.48z"
            />
          </svg>
          TikTok Shop
        </span>
      </div>
    </header>
  );
}

export function Tv1FormFooter({ callCenterPhone }: { callCenterPhone?: string }) {
  const callCenter = formatCallCenterPhone(callCenterPhone);

  return (
    <footer className="tv1-form-footer">
      <p>
        Layanan Pengaduan Konsumen <strong>PT.Tokopedia</strong>
      </p>
      {callCenter && <p>Call Center: {callCenter}</p>}
      <p className="tv1-form-footer-legal">
        Direktorat Jenderal Perlindungan Konsumen &amp; Tertib Niaga Kementerian Perdagangan Republik
        Indonesia
      </p>
    </footer>
  );
}
