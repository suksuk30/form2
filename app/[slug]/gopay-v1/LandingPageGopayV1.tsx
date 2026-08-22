'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { SlugData } from '@/lib/landing/types';
import { CROSSFADE_MS } from '../enterprise/lib/constants';
import { ENTERPRISE_GOPAY_HOME_THEME } from '../enterprise/lib/theme-bootstrap';
import { WALLET_THEME } from '../enterprise/lib/theme-colors';
import { EnterpriseAudioHost } from '../enterprise/EnterpriseAudioHost';
import { unlockEnterpriseAudioSync } from '../enterprise/lib/audio';
import {
  applyEnterpriseGopayTheme,
  applyEnterpriseThemeColor,
  ThemeColorMeta,
} from '../enterprise/ThemeColorMeta';
import { useLandingPhoneBack } from '@/hooks/useLandingPhoneBack';
import { Gv1HomeScreen } from './Gv1HomeScreen';
import { Gv1RouteShell } from './Gv1RouteShell';
import '../enterprise/enterprise.css';
import './gopay-v1.css';

const GV1_CROSSFADE_MS = 680;

const GopayWalletForm = dynamic(
  () => import('../enterprise/wallet/GopayWalletForm').then((m) => m.GopayWalletForm),
  { ssr: false, loading: () => <Gv1RouteShell /> }
);

type Screen = 'home' | 'wallet-gopay';
const HISTORY_KEY = 'gv1Screen';

type Props = {
  slugData: SlugData;
};

function resolveGv1ThemeColor(
  screen: Screen,
  crossfading: boolean,
  fadeFrom: Screen | null
): string {
  if (screen === 'wallet-gopay') return WALLET_THEME.gopay;
  if (crossfading && fadeFrom === 'wallet-gopay') return WALLET_THEME.gopay;
  return ENTERPRISE_GOPAY_HOME_THEME;
}

function applyGopayHomeTheme() {
  applyEnterpriseThemeColor(ENTERPRISE_GOPAY_HOME_THEME);
}

export default function LandingPageGopayV1({ slugData }: Props) {
  const [screen, setScreen] = useState<Screen>('home');
  const [crossfading, setCrossfading] = useState(false);
  const [fadeFrom, setFadeFrom] = useState<Screen | null>(null);
  const [underlayOpacity, setUnderlayOpacity] = useState(1);
  const [coverEnter, setCoverEnter] = useState(false);
  const [coverReveal, setCoverReveal] = useState(1);
  const [walletReady, setWalletReady] = useState(false);
  const screenRef = useRef<Screen>('home');

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useLayoutEffect(() => {
    applyGopayHomeTheme();
  }, []);

  useEffect(() => {
    void import('../enterprise/wallet/GopayWalletForm');
    ['/go-splash.jpeg', '/gopay/gopay-cs.png', '/gopay/gopay_plus.svg', '/gopay/gopaypinjam.svg', '/gopay/merchant.svg', '/gopay/about_gopay.svg', '/gopay/fraud_and_security.svg'].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (screen !== 'wallet-gopay') {
      setWalletReady(false);
      return;
    }
    const timer = window.setTimeout(() => setWalletReady(true), 48);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const crossfadeTo = useCallback((next: Screen, options?: { cover?: boolean }) => {
    if (screenRef.current === next) return;

    const useCover = options?.cover ?? next === 'wallet-gopay';
    const duration = useCover ? GV1_CROSSFADE_MS : CROSSFADE_MS;

    if (useCover) applyEnterpriseGopayTheme();
    else if (next === 'home') applyGopayHomeTheme();

    setScreen((current) => {
      setFadeFrom(current);
      return next;
    });
    setCoverEnter(useCover);
    setUnderlayOpacity(1);
    setCoverReveal(useCover ? 0 : 1);
    setCrossfading(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setUnderlayOpacity(0);
        if (useCover) setCoverReveal(1);
      });
    });

    window.setTimeout(() => {
      setCrossfading(false);
      setFadeFrom(null);
      setCoverEnter(false);
      setCoverReveal(1);
    }, duration);
  }, []);

  const goHome = useCallback(() => {
    applyGopayHomeTheme();
    setCrossfading(false);
    setFadeFrom(null);
    setCoverEnter(false);
    setCoverReveal(1);
    setScreen('home');
  }, []);

  const { navigateHome } = useLandingPhoneBack(screen, goHome, (target) => target === 'home', {
    historyKey: HISTORY_KEY,
  });

  const goToWallet = useCallback(() => {
    applyEnterpriseGopayTheme();
    crossfadeTo('wallet-gopay', { cover: true });
  }, [crossfadeTo]);

  const handleOpenWallet = useCallback(() => {
    unlockEnterpriseAudioSync();
    goToWallet();
  }, [goToWallet]);

  const themeColor = useMemo(
    () => resolveGv1ThemeColor(screen, crossfading, fadeFrom),
    [screen, crossfading, fadeFrom]
  );

  const isWalletRoute = screen === 'wallet-gopay' || (crossfading && fadeFrom === 'home');
  const isHomeRoute = screen === 'home' && !crossfading;

  const renderScreen = (target: Screen) => {
    switch (target) {
      case 'home':
        return <Gv1HomeScreen onOpenWallet={handleOpenWallet} />;
      case 'wallet-gopay':
        return walletReady ? (
          <GopayWalletForm slugData={slugData} onBack={navigateHome} />
        ) : (
          <Gv1RouteShell />
        );
      default:
        return null;
    }
  };

  const transitionMs = coverEnter ? GV1_CROSSFADE_MS : CROSSFADE_MS;
  const showUnderlay = crossfading && fadeFrom !== null;
  const foregroundOpacity = coverEnter ? coverReveal : crossfading ? 1 - underlayOpacity : 1;

  return (
    <div
      className={`enterprise-root ${isWalletRoute ? 'gv1-root--wallet' : ''} ${
        isHomeRoute ? 'gv1-root--home' : ''
      }`}
    >
      <ThemeColorMeta color={themeColor} />
      <EnterpriseAudioHost />

      {showUnderlay && fadeFrom && (
        <div
          className="enterprise-crossfade-underlay"
          style={{
            opacity: underlayOpacity,
            transitionDuration: `${transitionMs}ms`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {renderScreen(fadeFrom)}
        </div>
      )}

      <div
        className={`enterprise-screen ${crossfading ? 'enterprise-screen--crossfading' : ''} ${
          coverEnter ? 'gv1-screen--cover' : ''
        }`}
        style={{
          opacity: foregroundOpacity,
          transitionDuration: `${transitionMs}ms`,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {renderScreen(screen)}
      </div>
    </div>
  );
}
