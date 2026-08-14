'use client';

import { useCallback, useEffect, useRef } from 'react';

type Options = {
  historyKey?: string;
};

/**
 * Intercept tombol back browser/HP: dari layar mana pun (selain home) kembali ke home.
 * Satu pushState saat meninggalkan home; popstate memanggil goHome.
 */
export function useLandingPhoneBack<T>(
  screen: T,
  goHome: () => void,
  isHomeScreen: (screen: T) => boolean,
  options: Options = {}
) {
  const historyKey = options.historyKey ?? 'landingScreen';
  const screenRef = useRef(screen);
  const goHomeRef = useRef(goHome);
  const isHomeRef = useRef(isHomeScreen);
  const awayPushedRef = useRef(false);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    goHomeRef.current = goHome;
  }, [goHome]);

  useEffect(() => {
    isHomeRef.current = isHomeScreen;
  }, [isHomeScreen]);

  useEffect(() => {
    if (window.history.state?.[historyKey] == null) {
      window.history.replaceState({ ...window.history.state, [historyKey]: 'home' }, '');
    }

    const onPopState = () => {
      if (!isHomeRef.current(screenRef.current)) {
        goHomeRef.current();
        window.history.replaceState({ ...window.history.state, [historyKey]: 'home' }, '');
        awayPushedRef.current = false;
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [historyKey]);

  useEffect(() => {
    if (isHomeScreen(screen)) {
      awayPushedRef.current = false;
      return;
    }

    if (!awayPushedRef.current) {
      window.history.pushState({ ...window.history.state, [historyKey]: 'away' }, '');
      awayPushedRef.current = true;
    }
  }, [screen, isHomeScreen, historyKey]);

  const navigateHome = useCallback(() => {
    goHomeRef.current();
    window.history.replaceState({ ...window.history.state, [historyKey]: 'home' }, '');
    awayPushedRef.current = false;
  }, [historyKey]);

  return { navigateHome };
}
