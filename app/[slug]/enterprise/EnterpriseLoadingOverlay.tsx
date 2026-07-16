'use client';

import { EnterpriseLogo } from './EnterpriseLogo';

export function EnterpriseLoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="enterprise-loading-overlay">
      <div className="enterprise-loading-backdrop">
        <div className="enterprise-loading-spinner-wrap">
          <div className="enterprise-loading-ring" />
          <div className="enterprise-loading-ring enterprise-loading-ring--spin" />
          <div className="enterprise-loading-logo">
            <EnterpriseLogo variant="green" size="sm" />
          </div>
        </div>
        <p className="enterprise-loading-text">Memproses...</p>
      </div>
    </div>
  );
}
