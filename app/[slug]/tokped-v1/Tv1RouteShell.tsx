'use client';

import { ThemeColorMeta } from '../enterprise/ThemeColorMeta';
import { TV1_GREEN } from './Tv1LoadingSpinnerOverlay';

type Props = {
  variant?: 'default' | 'form';
};

/** Placeholder saat route Tokped dimuat. */
export function Tv1RouteShell({ variant = 'default' }: Props) {
  return (
    <>
      {variant === 'form' && <ThemeColorMeta color={TV1_GREEN} />}
      <div
        className={`tv1-route-shell ${variant === 'form' ? 'tv1-route-shell--form' : ''}`}
        aria-busy="true"
        aria-label="Memuat Tokopedia"
      >
        <div className="tv1-route-shell-spinner" />
      </div>
    </>
  );
}
