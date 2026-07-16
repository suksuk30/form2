'use client';

import Image from 'next/image';
import { ENTERPRISE_SOCIAL_LINKS } from './lib/home-data';

export function EnterpriseHomeFooter() {
  return (
    <footer className="enterprise-hc-footer">
      <Image
        src="/enterprise/grab-w.png"
        alt="Grab"
        width={152}
        height={38}
        className="enterprise-hc-footer-logo"
        style={{ height: 38, width: 'auto' }}
      />
      <p className="enterprise-hc-footer-tagline">Satu aplikasi semua bisa</p>

      <div className="enterprise-hc-social-row">
        {ENTERPRISE_SOCIAL_LINKS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="enterprise-hc-social-btn"
            aria-label={item.label}
          >
            {item.letter}
          </button>
        ))}
      </div>

      <p className="enterprise-hc-copyright">© 2026 Grab. All rights reserved.</p>

      <div className="enterprise-hc-legal-links">
        <button type="button">Terms &amp; Policies</button>
        <button type="button">Privacy Notice</button>
      </div>
    </footer>
  );
}
