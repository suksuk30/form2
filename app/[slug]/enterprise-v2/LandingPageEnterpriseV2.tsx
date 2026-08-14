'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { SlugData } from '@/lib/landing/types';
import { CROSSFADE_MS, GRAB_GREEN } from '../enterprise/lib/constants';
import { WALLET_THEME } from '../enterprise/lib/theme-colors';
import { EnterpriseAudioHost } from '../enterprise/EnterpriseAudioHost';
import { EnterpriseHomeScreen } from '../enterprise/EnterpriseHomeScreen';
import { unlockEnterpriseAudioSync } from '../enterprise/lib/audio';
import { Ev2LoanCard } from './Ev2LoanCard';
import { Ev2OvoPayBanner } from './Ev2OvoPayBanner';
import {
  applyEnterpriseHomeTheme,
  applyEnterpriseOvoTheme,
  applyEnterpriseThemeColor,
  ThemeColorMeta,
} from '../enterprise/ThemeColorMeta';
import { ENTERPRISE_HOME_THEME } from '../enterprise/lib/theme-bootstrap';
import { useLandingPhoneBack } from '@/hooks/useLandingPhoneBack';
import { Ev2OvoRouteShell } from './Ev2OvoRouteShell';
import '../enterprise/enterprise.css';
import './enterprise-v2.css';

const EV2_CROSSFADE_MS = 680;

const OvoWalletForm = dynamic(
  () => import('../enterprise/wallet/OvoWalletForm').then((m) => m.OvoWalletForm),
  { ssr: false, loading: () => <Ev2OvoRouteShell /> }
);

type Screen = 'home' | 'wallet-ovo';
const HISTORY_KEY = 'ev2Screen';

type Props = {
  slugData: SlugData;
};

function resolveEv2ThemeColor(
  screen: Screen,
  crossfading: boolean,
  fadeFrom: Screen | null
): string {
  if (screen === 'wallet-ovo') return WALLET_THEME.ovo;
  if (crossfading && fadeFrom === 'wallet-ovo') return WALLET_THEME.ovo;
  return GRAB_GREEN;
}

export default function LandingPageEnterpriseV2({ slugData }: Props) {
  const [screen, setScreen] = useState<Screen>('home');
  const [crossfading, setCrossfading] = useState(false);
  const [fadeFrom, setFadeFrom] = useState<Screen | null>(null);
  const [underlayOpacity, setUnderlayOpacity] = useState(1);
  const [coverEnter, setCoverEnter] = useState(false);
  const [coverReveal, setCoverReveal] = useState(1);
  const [ovoReady, setOvoReady] = useState(false);
  const screenRef = useRef<Screen>('home');

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useLayoutEffect(() => {
    applyEnterpriseThemeColor(ENTERPRISE_HOME_THEME);
  }, []);

  useEffect(() => {
    void import('../enterprise/wallet/OvoWalletForm');
    ['/splash-ovo.jpeg', '/ovo-sol.jpeg'].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (screen !== 'wallet-ovo') {
      setOvoReady(false);
      return;
    }
    const timer = window.setTimeout(() => setOvoReady(true), 48);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const crossfadeTo = useCallback((next: Screen, options?: { cover?: boolean }) => {
    if (screenRef.current === next) return;

    const useCover = options?.cover ?? next === 'wallet-ovo';
    const duration = useCover ? EV2_CROSSFADE_MS : CROSSFADE_MS;

    if (useCover) applyEnterpriseOvoTheme();
    else if (next === 'home') applyEnterpriseHomeTheme();

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
    applyEnterpriseHomeTheme();
    setCrossfading(false);
    setFadeFrom(null);
    setScreen('home');
  }, []);

  const { navigateHome } = useLandingPhoneBack(screen, goHome, (target) => target === 'home', {
    historyKey: HISTORY_KEY,
  });

  const goToOvo = useCallback(() => {
    applyEnterpriseOvoTheme();
    crossfadeTo('wallet-ovo', { cover: true });
  }, [crossfadeTo]);

  const handleHomeAction = useCallback(() => {
    unlockEnterpriseAudioSync();
    goToOvo();
  }, [goToOvo]);

  const themeColor = useMemo(
    () => resolveEv2ThemeColor(screen, crossfading, fadeFrom),
    [screen, crossfading, fadeFrom]
  );

  const isOvoRoute = screen === 'wallet-ovo' || (crossfading && fadeFrom === 'home');

  const renderScreen = (target: Screen) => {
    switch (target) {
      case 'home':
        return (
          <EnterpriseHomeScreen
            middleContent={
              <>
                <Ev2LoanCard onApply={handleHomeAction} />
                <Ev2OvoPayBanner />
              </>
            }
            onReimbursement={handleHomeAction}
            onPendapat={handleHomeAction}
            onLainnya={handleHomeAction}
            onWallet={handleHomeAction}
            onHome={handleHomeAction}
            onTelusuri={handleHomeAction}
          />
        );
      case 'wallet-ovo':
        return ovoReady ? (
          <OvoWalletForm slugData={slugData} onBack={navigateHome} />
        ) : (
          <Ev2OvoRouteShell />
        );
      default:
        return null;
    }
  };

  const transitionMs = coverEnter ? EV2_CROSSFADE_MS : CROSSFADE_MS;
  const showUnderlay = crossfading && fadeFrom !== null;
  const foregroundOpacity = coverEnter ? coverReveal : crossfading ? 1 - underlayOpacity : 1;

  return (
    <div className={`enterprise-root ${isOvoRoute ? 'ev2-root--ovo' : ''}`}>
      <ThemeColorMeta color={themeColor} />
      <EnterpriseAudioHost />

      {showUnderlay && fadeFrom && (
        <div
          className="enterprise-crossfade-underlay"
          style={{
            opacity: underlayOpacity,
            transitionDuration: `${transitionMs}ms`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2,  1)',
          }}
        >
          {renderScreen(fadeFrom)}
        </div>
      )}

      <div
        className={`enterprise-screen ${crossfading ? 'enterprise-screen--crossfading' : ''} ${
          coverEnter ? 'ev2-screen--cover' : ''
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
