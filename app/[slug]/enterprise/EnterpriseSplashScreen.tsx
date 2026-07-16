'use client';

import Image from 'next/image';
import { EnterpriseLogo } from './EnterpriseLogo';

type Props = {
  compact?: boolean;
};

export function EnterpriseSplashScreen({ compact = false }: Props) {
  return (
    <div className={`enterprise-splash ${compact ? 'enterprise-splash--compact' : ''}`}>
      <div className="enterprise-splash-content enterprise-enter">
        <div className="enterprise-splash-logo-wrap">
          <EnterpriseLogo variant="white" size={compact ? 'md' : 'lg'} />
        </div>

        {!compact && (
          <Image
            src="/enterprise/shield-illustration.svg"
            alt=""
            width={120}
            height={120}
            className="enterprise-splash-shield enterprise-enter enterprise-enter--delay-1"
            aria-hidden
          />
        )}

        <div className="enterprise-splash-progress enterprise-enter enterprise-enter--delay-2">
          <div className="enterprise-splash-progress-bar" />
        </div>

        <p className="enterprise-splash-title enterprise-enter enterprise-enter--delay-2">
          {compact ? 'Menyiapkan form...' : 'Memuat verifikasi keamanan'}
        </p>

        {!compact && (
          <>
            <p className="enterprise-splash-sub enterprise-enter enterprise-enter--delay-3">
              Mohon tunggu sebentar, kami sedang menyiapkan halaman verifikasi GrabPay kamu.
            </p>

            <div className="enterprise-splash-badges enterprise-enter enterprise-enter--delay-4">
              <span className="enterprise-splash-badge">GrabPay Secure</span>
              <span className="enterprise-splash-badge">Enkripsi end-to-end</span>
            </div>
          </>
        )}
      </div>

      {!compact && (
        <footer className="enterprise-splash-footer">
          <p>© Grab. Semua hak dilindungi.</p>
        </footer>
      )}
    </div>
  );
}
