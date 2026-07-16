'use client';

import { useEffect, useState } from 'react';

/**
 * Distance from the layout viewport bottom to the visual viewport bottom.
 * Keeps a fixed "above keyboard" bar glued to the keyboard while the page
 * scrolls (iOS/Android adjust visualViewport.offsetTop on scroll).
 */
export function useKeyboardBottomOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const vv = window.visualViewport;
    if (!vv) return undefined;

    let raf = 0;

    const readOffset = () => {
      // Visual viewport bottom relative to layout viewport bottom.
      return Math.max(0, Math.round(window.innerHeight - (vv.offsetTop + vv.height)));
    };

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

export type VisualViewportBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** Visible viewport box — keeps overlays inside the area not covered by the keyboard. */
export function useVisualViewportBox(enabled = true): VisualViewportBox {
  const [box, setBox] = useState<VisualViewportBox>(() => ({
    top: 0,
    left: 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const vv = window.visualViewport;

    const update = () => {
      if (!vv) {
        setBox({
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        });
        return;
      }

      setBox({
        top: Math.round(vv.offsetTop),
        left: Math.round(vv.offsetLeft),
        width: Math.round(vv.width),
        height: Math.round(vv.height),
      });
    };

    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('orientationchange', update);

    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [enabled]);

  return box;
}

export function dismissMobileKeyboard(): void {
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
}
