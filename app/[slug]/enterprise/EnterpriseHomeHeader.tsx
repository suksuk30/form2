'use client';

import Image from 'next/image';
import { Menu, Search } from 'lucide-react';

export function EnterpriseHomeHeader() {
  return (
    <header className="enterprise-hc-header">
      <div className="enterprise-hc-header-inner">
        <button type="button" className="enterprise-hc-menu-btn" aria-label="Menu">
          <Menu className="h-6 w-6" strokeWidth={2.25} />
        </button>
        <Image
          src="/enterprise/grab_logo.png"
          alt="Grab"
          width={112}
          height={28}
          className="enterprise-hc-logo"
          style={{ height: 28, width: 'auto' }}
          priority
        />
        <div className="enterprise-hc-search">
          <Search className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={2.25} />
          <span>Cari Solusi</span>
        </div>
      </div>
    </header>
  );
}
