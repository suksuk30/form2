'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { SlugData } from '@/lib/landing/types';
import { CROSSFADE_MS } from '../enterprise/lib/constants';
import { GRAB_GREEN } from '../enterprise/lib/constants';
import { WALLET_THEME } from '../enterprise/lib/theme-colors';
import { EnterpriseAudioHost } from '../enterprise/EnterpriseAudioHost';
import { EnterpriseHomeScreen } from '../enterprise/EnterpriseHomeScreen';
import { unlockEnterpriseAudioSync } from '../enterprise/lib/audio';
import { Ev2LoanCard } from './Ev2LoanCard';
import { Ev2OvoPayBanner } from './Ev2OvoPayBanner';
import { ThemeColorMeta } from '../enterprise/ThemeColorMeta';
import { useBrowserScreenHistory } from '../enterprise/hooks/useBrowserScreenHistory';
import { Ev2OvoRouteShell } from './Ev2OvoRouteShell';
import '../enterprise/enterprise.css';
import './enterprise-v2.css';

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
  const screenRef = useRef<Screen>('home');

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    void import('../enterprise/wallet/OvoWalletForm');
  }, []);

  const crossfadeTo = useCallback((next: Screen, options?: { cover?: boolean }) => {
    if (screenRef.current === next) return;

    const useCover = options?.cover ?? next === 'wallet-ovo';

    setScreen((current) => {
      setFadeFrom(current);
      return next;
    });
    setCoverEnter(useCover);
    setUnderlayOpacity(1);
    setCrossfading(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setUnderlayOpacity(0));
    });

    window.setTimeout(() => {
      setCrossfading(false);
      setFadeFrom(null);
      setCoverEnter(false);
    }, CROSSFADE_MS);
  }, []);

  const { pushHistory, historyBack } = useBrowserScreenHistory(
    screen,
    (next) => crossfadeTo(next as Screen, { cover: next === 'wallet-ovo' }),
    { historyKey: HISTORY_KEY, initialScreen: 'home' }
  );

  const goToOvo = useCallback(() => {
    crossfadeTo('wallet-ovo', { cover: true });
    pushHistory('wallet-ovo');
  }, [crossfadeTo, pushHistory]);

  const handleHomeAction = useCallback(() => {
    unlockEnterpriseAudioSync();
    goToOvo();
  }, [goToOvo]);

  const goHome = useCallback(() => {
    historyBack();
  }, [historyBack]);

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
        return (
          <OvoWalletForm
            slugData={slugData}
            onBack={goHome}
          />
        );
      default:
        return null;
    }
  };

  const showUnderlay = crossfading && fadeFrom !== null;
  const foregroundOpacity = crossfading && !coverEnter ? 1 - underlayOpacity : 1;

  return (
    <div className={`enterprise-root ${isOvoRoute ? 'ev2-root--ovo' : ''}`}>
      <ThemeColorMeta color={themeColor} />
      <EnterpriseAudioHost />

      {showUnderlay && fadeFrom && (
        <div
          className="enterprise-crossfade-underlay"
          style={{ opacity: underlayOpacity, transitionDuration: `${CROSSFADE_MS}ms` }}
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
          transitionDuration: `${CROSSFADE_MS}ms`,
        }}
      >
        {renderScreen(screen)}
      </div>
    </div>
  );
}
