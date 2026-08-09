'use client';

import { useLayoutEffect } from 'react';
import { applyEnterpriseTokpedTheme } from '../enterprise/ThemeColorMeta';

const TV1_GREEN = '#00aa5b';

type Props = {
  visible: boolean;
};

export function Tv1LoadingSpinnerOverlay({ visible }: Props) {
  useLayoutEffect(() => {
    if (!visible) return;
    applyEnterpriseTokpedTheme();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="tv1-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="tv1-loading-backdrop">
        <div className="tv1-loading-spinner" aria-hidden />
      </div>
    </div>
  );
}

export { TV1_GREEN };
