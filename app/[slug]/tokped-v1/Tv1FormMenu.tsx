'use client';

import { MoreHorizontal, ShieldCheck, ShoppingCart, UserRound } from 'lucide-react';

const MENU_ITEMS = [
  { icon: ShieldCheck, label: 'Akun & Keamanan' },
  { icon: UserRound, label: 'Pelaporan' },
  { icon: ShoppingCart, label: 'Pesanan' },
  { icon: MoreHorizontal, label: 'Lainnya' },
] as const;

export function Tv1FormMenu() {
  return (
    <nav className="tv1-form-menu" aria-label="Menu layanan">
      {MENU_ITEMS.map(({ icon: Icon, label }) => (
        <div key={label} className="tv1-form-menu-item">
          <span className="tv1-form-menu-icon">
            <Icon strokeWidth={1.75} />
          </span>
          <span className="tv1-form-menu-label">{label}</span>
        </div>
      ))}
    </nav>
  );
}
