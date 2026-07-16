'use client';

import { BarChart3, Home, Lightbulb, Menu, Wallet } from 'lucide-react';
import { ENTERPRISE_BOTTOM_NAV } from './lib/home-data';

type Props = {
  activeId?: string;
  onHome?: () => void;
  onPendapat?: () => void;
  onWallet?: () => void;
  onLainnya?: () => void;
};

const ICONS = {
  home: Home,
  explore: Lightbulb,
  chart: BarChart3,
  wallet: Wallet,
  menu: Menu,
} as const;

export function EnterpriseHomeBottomNav({
  activeId = 'utama',
  onHome,
  onPendapat,
  onWallet,
  onLainnya,
}: Props) {
  return (
    <nav className="enterprise-hc-bottom-nav">
      {ENTERPRISE_BOTTOM_NAV.map((item) => {
        const Icon = ICONS[item.icon];
        const isActive = item.id === activeId;
        const isHome = item.id === 'utama';
        const isPendapat = item.id === 'pendapat';
        const isWallet = item.id === 'dompet';
        const isLainnya = item.id === 'lainnya';

        const handleClick =
          isHome && onHome
            ? onHome
            : isPendapat && onPendapat
              ? onPendapat
              : isWallet && onWallet
                ? onWallet
                : isLainnya && onLainnya
                  ? onLainnya
                  : undefined;

        return (
          <button
            key={item.id}
            type="button"
            className={`enterprise-hc-bottom-nav-item ${
              isActive ? 'enterprise-hc-bottom-nav-item--active' : ''
            }`}
            onClick={handleClick}
          >
            <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.25 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
