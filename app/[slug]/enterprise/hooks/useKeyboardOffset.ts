'use client';

import { useEffect, useState } from 'react';

/** Enterprise-local keyboard offset — tidak bergantung hooks global. */
export function useEnterpriseKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const vv = window.visualViewport;
    if (!vv) return undefined;

    let raf = 0;

    const readOffset = () =>
      Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height)));

    const commit = () => {
      raf = 0;
      const next = readOffset();
      setOffset((prev) => (prev === next ? prev : next));
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(commit);
    };

    commit();
    vv.addEventListener('resize', schedule);
    vv.addEventListener('scroll', schedule);
    window.addEventListener('orientationchange', schedule);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      vv.removeEventListener('resize', schedule);
      vv.removeEventListener('scroll', schedule);
      window.removeEventListener('orientationchange', schedule);
    };
  }, []);

  return offset;
}

export function dismissEnterpriseKeyboard(): void {
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
}
