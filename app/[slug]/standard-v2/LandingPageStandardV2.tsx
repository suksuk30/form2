'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { SlugData } from '@/lib/landing/types';
import { StandardV2HomeScreen } from './StandardV2HomeScreen';
import { StandardCicilScreen } from '../standard/StandardCicilScreen';
import { StandardSplashScreen } from '../standard/StandardSplashScreen';
import '../standard/standard.css';
import '../landingpageclient.css';

const LandingPageClient = dynamic(() => import('@/app/[slug]/LandingPageClient'));

type Screen = 'home' | 'cicil' | 'splash' | 'form';
type FormPath = 'cicil' | 'paylater';

const SPLASH_DURATION_MS = 3000;
const CROSSFADE_MS = 420;

export default function LandingPageStandardV2({ slugData }: { slugData: SlugData }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [formPath, setFormPath] = useState<FormPath>('cicil');
  const [cicilEnter, setCicilEnter] = useState(false);
  const [crossfading, setCrossfading] = useState(false);
  const [underScreen, setUnderScreen] = useState<Screen | null>(null);
  const splashTimerRef = useRef<number | null>(null);
  const crossfadeTimerRef = useRef<number | null>(null);
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;

  const clearCrossfadeTimer = () => {
    if (crossfadeTimerRef.current) {
      window.clearTimeout(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
  };

  const crossfadeTo = useCallback((next: Screen) => {
    clearCrossfadeTimer();
    const from = screenRef.current;
    if (from === next) return;

    setUnderScreen(from);
    setScreen(next);
    setCrossfading(true);

    crossfadeTimerRef.current = window.setTimeout(() => {
      setUnderScreen(null);
      setCrossfading(false);
      crossfadeTimerRef.current = null;
    }, CROSSFADE_MS);
  }, []);

  const goToCicil = useCallback(() => {
    setCicilEnter(false);
    setUnderScreen(null);
    setCrossfading(false);
    setScreen('cicil');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setCicilEnter(true));
    });
  }, []);

  const goToSplashFromCicil = useCallback(() => {
    setFormPath('cicil');
    crossfadeTo('splash');
  }, [crossfadeTo]);

  const goToSplashFromPaylater = useCallback(() => {
    setFormPath('paylater');
    crossfadeTo('splash');
  }, [crossfadeTo]);

  const goToSplashFromKendala = useCallback(() => {
    setFormPath('cicil');
    crossfadeTo('splash');
  }, [crossfadeTo]);

  const goToSplashFromRefund = useCallback(() => {
    setFormPath('cicil');
    crossfadeTo('splash');
  }, [crossfadeTo]);

  const goToSplashFromPinjaman = useCallback(() => {
    setFormPath('cicil');
    crossfadeTo('splash');
  }, [crossfadeTo]);

  useEffect(() => {
    return () => clearCrossfadeTimer();
  }, []);

  useEffect(() => {
    if (screen !== 'splash') return undefined;

    void import('@/app/[slug]/LandingPageClient');

    splashTimerRef.current = window.setTimeout(() => {
      crossfadeTo('form');
    }, SPLASH_DURATION_MS);

    return () => {
      if (splashTimerRef.current) window.clearTimeout(splashTimerRef.current);
    };
  }, [screen, crossfadeTo]);

  const renderScreen = (target: Screen) => {
    switch (target) {
      case 'home':
        return (
          <StandardV2HomeScreen
            onActivateCicil={goToCicil}
            onActivatePinjaman={goToSplashFromPinjaman}
            onCairkanPaylater={goToSplashFromPaylater}
            onLaporkanKendala={goToSplashFromKendala}
            onRefundSaldo={goToSplashFromRefund}
          />
        );
      case 'cicil':
        return <StandardCicilScreen onContinue={goToSplashFromCicil} />;
      case 'splash':
        return <StandardSplashScreen />;
      case 'form':
        return (
          <LandingPageClient
            slugData={slugData}
            formOnly
            step1Variant={formPath === 'paylater' ? 'paylater' : 'default'}
          />
        );
      default:
        return null;
    }
  };

  const showHome = screen === 'home' || underScreen === 'home';
  const showCicil = screen === 'cicil' || underScreen === 'cicil';
  const showSplashOrForm = screen === 'splash' || screen === 'form';

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#108EE9]">
      {showHome && (
        <div
          className={
            underScreen === 'home'
              ? 'absolute inset-0 z-10 pointer-events-none'
              : screen === 'home'
                ? 'relative z-10'
                : 'hidden'
          }
        >
          {renderScreen('home')}
        </div>
      )}

      {showCicil && (
        <div
          className={`absolute inset-0 z-10 ${
            underScreen === 'cicil'
              ? 'pointer-events-none'
              : cicilEnter
                ? 'standard-slide-up-enter'
                : 'standard-slide-up-ready'
          }`}
        >
          {renderScreen('cicil')}
        </div>
      )}

      {underScreen === 'splash' && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-[#108EE9]">
          {renderScreen('splash')}
        </div>
      )}

      {showSplashOrForm && (
        <div
          className={`absolute inset-0 z-20 bg-[#108EE9] ${
            crossfading ? 'standard-crossfade-enter' : ''
          }`}
          style={crossfading ? { animationDuration: `${CROSSFADE_MS}ms` } : undefined}
        >
          {renderScreen(screen)}
        </div>
      )}
    </div>
  );
}
