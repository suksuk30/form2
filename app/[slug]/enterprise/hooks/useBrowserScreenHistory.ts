'use client';

import { useCallback, useEffect, useRef } from 'react';

type Options<T extends string> = {
  historyKey: string;
  initialScreen: T;
};

/**
 * Sinkronkan navigasi SPA dengan tombol back/forward browser & HP.
 * - Forward: pushState saat pindah layar
 * - Back UI: panggil historyBack()
 * - Tombol back HP: popstate → onPopStateNavigate
 */
export function useBrowserScreenHistory<T extends string>(
  screen: T,
  onPopStateNavigate: (screen: T) => void,
  { historyKey, initialScreen }: Options<T>
) {
  const screenRef = useRef(screen);
  const onPopStateNavigateRef = useRef(onPopStateNavigate);
  const handlingPopStateRef = useRef(false);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    onPopStateNavigateRef.current = onPopStateNavigate;
  }, [onPopStateNavigate]);

  useEffect(() => {
    if (window.history.state?.[historyKey] == null) {
      window.history.replaceState({ [historyKey]: initialScreen }, '');
    }

    const onPopState = (event: PopStateEvent) => {
      handlingPopStateRef.current = true;
      const next = (event.state?.[historyKey] as T | undefined) ?? initialScreen;
      onPopStateNavigateRef.current(next);
      window.setTimeout(() => {
        handlingPopStateRef.current = false;
      }, 0);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [historyKey, initialScreen]);

  const pushHistory = useCallback(
    (next: T) => {
      if (handlingPopStateRef.current) return;
      if (screenRef.current === next) return;
      window.history.pushState({ [historyKey]: next }, '');
    },
    [historyKey]
  );

  const historyBack = useCallback(() => {
    if (window.history.state?.[historyKey] === initialScreen) return;
    window.history.back();
  }, [historyKey, initialScreen]);

  return { pushHistory, historyBack };
}
