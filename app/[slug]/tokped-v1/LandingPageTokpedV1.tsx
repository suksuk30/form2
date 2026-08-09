'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { TokpedSlugData } from './types';
import { CROSSFADE_MS } from '../enterprise/lib/constants';
import { ENTERPRISE_TOKPED_THEME } from '../enterprise/lib/theme-bootstrap';
import { EnterpriseAudioHost } from '../enterprise/EnterpriseAudioHost';
import { unlockEnterpriseAudioSync } from '../enterprise/lib/audio';
import {
  applyEnterpriseThemeColor,
  applyEnterpriseTokpedTheme,
  ThemeColorMeta,
} from '../enterprise/ThemeColorMeta';
import { useBrowserScreenHistory } from '../enterprise/hooks/useBrowserScreenHistory';
import { Tv1HomeScreen } from './Tv1HomeScreen';
import { Tv1RouteShell } from './Tv1RouteShell';
import '../enterprise/enterprise.css';
import './tokped-v1.css';

const TV1_CROSSFADE_MS = 680;
const TV1_HOME_THEME = '#ffffff';

const Tv1FormFlow = dynamic(
  () => import('./Tv1FormFlow').then((m) => m.Tv1FormFlow),
  { ssr: false, loading: () => <Tv1RouteShell variant="form" /> }
);

type Screen = 'home' | 'form';
const HISTORY_KEY = 'tv1Screen';

type Props = {
  slugData: TokpedSlugData;
};

function resolveTv1ThemeColor(
  screen: Screen,
  crossfading: boolean,
  fadeFrom: Screen | null
): string {
  if (screen === 'form') return ENTERPRISE_TOKPED_THEME;
  if (crossfading && fadeFrom === 'form') return ENTERPRISE_TOKPED_THEME;
  return TV1_HOME_THEME;
}

function applyTokpedHomeTheme() {
  applyEnterpriseThemeColor(TV1_HOME_THEME);
}

export default function LandingPageTokpedV1({ slugData }: Props) {
  const [screen, setScreen] = useState<Screen>('home');
  const [crossfading, setCrossfading] = useState(false);
  const [fadeFrom, setFadeFrom] = useState<Screen | null>(null);
  const [underlayOpacity, setUnderlayOpacity] = useState(1);
  const [coverEnter, setCoverEnter] = useState(false);
  const [coverReveal, setCoverReveal] = useState(1);
  const [formReady, setFormReady] = useState(false);
  const screenRef = useRef<Screen>('home');

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useLayoutEffect(() => {
    applyTokpedHomeTheme();
  }, []);

  useEffect(() => {
    void import('./Tv1FormFlow');
  }, []);

  useEffect(() => {
    if (screen !== 'form') {
      setFormReady(false);
      return;
    }
    const timer = window.setTimeout(() => setFormReady(true), 48);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const crossfadeTo = useCallback((next: Screen, options?: { cover?: boolean }) => {
    if (screenRef.current === next) return;

    const useCover = options?.cover ?? next === 'form';
    const duration = useCover ? TV1_CROSSFADE_MS : CROSSFADE_MS;

    if (useCover) applyEnterpriseTokpedTheme();
    else if (next === 'home') applyTokpedHomeTheme();

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

  const { pushHistory } = useBrowserScreenHistory(
    screen,
    (next) => crossfadeTo(next as Screen, { cover: next === 'form' }),
    { historyKey: HISTORY_KEY, initialScreen: 'home' }
  );

  const goToForm = useCallback(() => {
    applyEnterpriseTokpedTheme();
    crossfadeTo('form', { cover: true });
    pushHistory('form');
  }, [crossfadeTo, pushHistory]);

  const handleOpenForm = useCallback(() => {
    unlockEnterpriseAudioSync();
    goToForm();
  }, [goToForm]);

  const themeColor = useMemo(
    () => resolveTv1ThemeColor(screen, crossfading, fadeFrom),
    [screen, crossfading, fadeFrom]
  );

  const isFormRoute = screen === 'form' || (crossfading && fadeFrom === 'home');
  const isHomeRoute = screen === 'home' && !crossfading;

  const renderScreen = (target: Screen) => {
    switch (target) {
      case 'home':
        return (
          <Tv1HomeScreen onOpenForm={handleOpenForm} callCenterPhone={slugData.callCenterPhone} />
        );
      case 'form':
        return formReady ? (
          <Tv1FormFlow slugData={slugData} />
        ) : (
          <Tv1RouteShell variant="form" />
        );
      default:
        return null;
    }
  };

  const transitionMs = coverEnter ? TV1_CROSSFADE_MS : CROSSFADE_MS;
  const showUnderlay = crossfading && fadeFrom !== null;
  const foregroundOpacity = coverEnter ? coverReveal : crossfading ? 1 - underlayOpacity : 1;

  return (
    <div
      className={`enterprise-root ${isFormRoute ? 'tv1-root--form' : ''} ${
        isHomeRoute ? 'tv1-root--home' : ''
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
          coverEnter ? 'tv1-screen--cover' : ''
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
