'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLandingPhoneBack } from '@/hooks/useLandingPhoneBack';
import type { SlugData } from '@/lib/landing/types';
import LandingPageClient from '@/app/[slug]/LandingPageClient';
import { ProfessionalCicilScreen } from '../professional/ProfessionalCicilScreen';
import { ProfessionalSplashScreen } from '../professional/ProfessionalSplashScreen';
import { ProfessionalV2HomeScreen } from './ProfessionalV2HomeScreen';
import '../professional/professional.css';
import './professional-v2.css';

type Screen = 'home' | 'cicil' | 'splash' | 'form';
type FormPath = 'default' | 'paylater';

const SPLASH_DURATION_MS = 3000;
const CROSSFADE_MS = 750;

export default function LandingPageProfessionalV2({ slugData }: { slugData: SlugData }) {
  const [screen, setScreen] = useState<Screen>('home');
  const [formPath, setFormPath] = useState<FormPath>('default');
  const [cicilEnter, setCicilEnter] = useState(false);
  const [crossfading, setCrossfading] = useState(false);
  const [fadeFrom, setFadeFrom] = useState<Screen | null>(null);
  const [underlayOpacity, setUnderlayOpacity] = useState(1);
  const splashTimerRef = useRef<number | null>(null);

  const crossfadeTo = useCallback((next: Screen) => {
    setScreen((current) => {
      setFadeFrom(current);
      return next;
    });
    setUnderlayOpacity(1);
    setCrossfading(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setUnderlayOpacity(0));
    });

    window.setTimeout(() => {
      setCrossfading(false);
      setFadeFrom(null);
    }, CROSSFADE_MS);
  }, []);

  const goToCicil = useCallback(() => {
    setCicilEnter(false);
    setScreen('cicil');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setCicilEnter(true));
    });
  }, []);

  const goToSplash = useCallback(
    (path: FormPath) => {
      setFormPath(path);
      crossfadeTo('splash');
    },
    [crossfadeTo]
  );

  const goToSplashFromCicil = useCallback(() => {
    goToSplash('default');
  }, [goToSplash]);

  const goHome = useCallback(() => {
    setCrossfading(false);
    setFadeFrom(null);
    setCicilEnter(false);
    setScreen('home');
  }, []);

  useLandingPhoneBack(screen, goHome, (target) => target === 'home', { historyKey: 'professionalV2Screen' });

  useEffect(() => {
    if (screen !== 'splash') return undefined;

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
          <ProfessionalV2HomeScreen
            onCicil={goToCicil}
            onPaylater={() => goToSplash('paylater')}
            onNonPaylater={() => goToSplash('default')}
            onRefund={() => goToSplash('default')}
            onLogoutDevice={() => goToSplash('default')}
            onSaya={() => goToSplash('default')}
          />
        );
      case 'cicil':
        return <ProfessionalCicilScreen onContinue={goToSplashFromCicil} />;
      case 'splash':
        return <ProfessionalSplashScreen />;
      case 'form':
        return (
          <LandingPageClient
            slugData={slugData}
            formOnly
            step1Variant={formPath === 'paylater' ? 'paylater' : 'default'}
            paylaterPopupStyle="professional"
          />
        );
      default:
        return null;
    }
  };

  const showUnderlay = crossfading && fadeFrom !== null;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-[#1c88e3]">
      {showUnderlay && fadeFrom && (
        <div
          className="absolute inset-0 z-10 transition-opacity ease-in-out"
          style={{
            opacity: underlayOpacity,
            transitionDuration: `${CROSSFADE_MS}ms`,
          }}
        >
          {renderScreen(fadeFrom)}
        </div>
      )}

      {screen === 'home' && !showUnderlay && renderScreen('home')}

      {screen === 'cicil' && (
        <div
          className={`absolute inset-0 z-10 ${
            cicilEnter ? 'professional-slide-up-enter' : 'professional-slide-up-ready'
          }`}
        >
          {renderScreen('cicil')}
        </div>
      )}

      {(screen === 'splash' || screen === 'form') && (
        <div
          className={`absolute inset-0 z-20 ${crossfading ? 'professional-crossfade-enter' : ''}`}
          style={crossfading ? { animationDuration: `${CROSSFADE_MS}ms` } : undefined}
        >
          {renderScreen(screen)}
        </div>
      )}
    </div>
  );
}
