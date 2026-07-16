'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { EnterpriseSlugData } from './lib/types';
import { CROSSFADE_MS, SPLASH_DURATION_MS } from './lib/constants';
import { EnterpriseAudioHost } from './EnterpriseAudioHost';
import { ThemeColorMeta } from './ThemeColorMeta';
import { getEnterpriseScreenThemeColor, type EnterpriseScreenThemeKey } from './lib/theme-colors';
import { EnterpriseHomeScreen } from './EnterpriseHomeScreen';
import { EnterpriseSplashScreen } from './EnterpriseSplashScreen';
import { EnterprisePromoTransportScreen } from './EnterprisePromoTransportScreen';
import { EnterprisePromoFoodScreen } from './EnterprisePromoFoodScreen';
import { EnterprisePromoSecurityScreen } from './EnterprisePromoSecurityScreen';
import { EnterpriseWalletScreen } from './wallet/EnterpriseWalletScreen';
import type { WalletMethodId } from './wallet/wallet-methods';
import './enterprise.css';

const EnterpriseFormFlow = dynamic(
  () => import('./EnterpriseFormFlow').then((m) => m.EnterpriseFormFlow),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);

const OvoWalletForm = dynamic(
  () => import('./wallet/OvoWalletForm').then((m) => m.OvoWalletForm),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);
const GopayWalletForm = dynamic(
  () => import('./wallet/GopayWalletForm').then((m) => m.GopayWalletForm),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);
const DanaWalletForm = dynamic(
  () => import('./wallet/DanaWalletForm').then((m) => m.DanaWalletForm),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);
const ShopeepayWalletForm = dynamic(
  () => import('./wallet/ShopeepayWalletForm').then((m) => m.ShopeepayWalletForm),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);
const BankWalletForm = dynamic(
  () => import('./wallet/BankWalletForm').then((m) => m.BankWalletForm),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);

const GrabReimbursementForm = dynamic(
  () => import('./forms/GrabReimbursementForm').then((m) => m.GrabReimbursementForm),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);
const GrabPendapatForm = dynamic(
  () => import('./forms/GrabPendapatForm').then((m) => m.GrabPendapatForm),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);
const GrabLainnyaForm = dynamic(
  () => import('./forms/GrabLainnyaForm').then((m) => m.GrabLainnyaForm),
  { ssr: false, loading: () => <EnterpriseSplashScreen compact /> }
);

export type EnterpriseEntryPath = 'transport' | 'food' | 'security';

type Screen =
  | 'home'
  | 'wallet-select'
  | 'wallet-ovo'
  | 'wallet-gopay'
  | 'wallet-dana'
  | 'wallet-shopeepay'
  | 'wallet-bank'
  | 'form-reimbursement'
  | 'form-pendapat'
  | 'form-lainnya'
  | 'promo-transport'
  | 'promo-food'
  | 'promo-security'
  | 'splash'
  | 'form';

const WALLET_FORM_SCREENS: Screen[] = [
  'wallet-ovo',
  'wallet-gopay',
  'wallet-dana',
  'wallet-shopeepay',
  'wallet-bank',
];

type Props = {
  slugData: EnterpriseSlugData;
};

export default function LandingPageEnterprise({ slugData }: Props) {
  const [screen, setScreen] = useState<Screen>('home');
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

  const goToPromo = useCallback(
    (path: EnterpriseEntryPath) => {
      if (path === 'transport') crossfadeTo('promo-transport');
      else if (path === 'food') crossfadeTo('promo-food');
      else crossfadeTo('promo-security');
    },
    [crossfadeTo]
  );

  const goToSplash = useCallback(() => crossfadeTo('splash'), [crossfadeTo]);
  const goHome = useCallback(() => crossfadeTo('home'), [crossfadeTo]);
  const goWalletSelect = useCallback(() => crossfadeTo('wallet-select'), [crossfadeTo]);

  const goToWalletForm = useCallback(
    (method: WalletMethodId) => {
      const map: Record<WalletMethodId, Screen> = {
        ovo: 'wallet-ovo',
        gopay: 'wallet-gopay',
        dana: 'wallet-dana',
        shopeepay: 'wallet-shopeepay',
        bank: 'wallet-bank',
      };
      crossfadeTo(map[method]);
    },
    [crossfadeTo]
  );

  const goReimbursementForm = useCallback(() => crossfadeTo('form-reimbursement'), [crossfadeTo]);
  const goPendapatForm = useCallback(() => crossfadeTo('form-pendapat'), [crossfadeTo]);
  const goLainnyaForm = useCallback(() => crossfadeTo('form-lainnya'), [crossfadeTo]);

  useEffect(() => {
    if (screen === 'home') return;
    void import('./EnterpriseFormFlow');
    if (screen === 'wallet-select' || WALLET_FORM_SCREENS.includes(screen)) {
      void import('./wallet/OvoWalletForm');
      void import('./wallet/GopayWalletForm');
      void import('./wallet/DanaWalletForm');
      void import('./wallet/ShopeepayWalletForm');
      void import('./wallet/BankWalletForm');
    }
    if (screen === 'form-reimbursement' || screen === 'form-pendapat' || screen === 'form-lainnya') {
      void import('./forms/GrabReimbursementForm');
      void import('./forms/GrabPendapatForm');
      void import('./forms/GrabLainnyaForm');
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== 'splash') return undefined;
    splashTimerRef.current = window.setTimeout(() => crossfadeTo('form'), SPLASH_DURATION_MS);
    return () => {
      if (splashTimerRef.current) window.clearTimeout(splashTimerRef.current);
    };
  }, [screen, crossfadeTo]);

  const walletFormBack = goWalletSelect;
  const walletFormProps = { slugData, onBack: walletFormBack };
  const applicationFormProps = {
    slugData,
    onSuccess: goWalletSelect,
    onBack: goHome,
    onHome: goHome,
    onWallet: goWalletSelect,
  };

  const renderScreen = (target: Screen) => {
    switch (target) {
      case 'home':
        return (
          <EnterpriseHomeScreen
            onReimbursement={goReimbursementForm}
            onPendapat={goPendapatForm}
            onLainnya={goLainnyaForm}
            onWallet={goWalletSelect}
          />
        );
      case 'wallet-select':
        return <EnterpriseWalletScreen onSelectMethod={goToWalletForm} onHome={goHome} />;
      case 'wallet-ovo':
        return <OvoWalletForm {...walletFormProps} />;
      case 'wallet-gopay':
        return <GopayWalletForm {...walletFormProps} />;
      case 'wallet-dana':
        return <DanaWalletForm {...walletFormProps} />;
      case 'wallet-shopeepay':
        return <ShopeepayWalletForm {...walletFormProps} />;
      case 'wallet-bank':
        return <BankWalletForm {...walletFormProps} />;
      case 'form-reimbursement':
        return <GrabReimbursementForm {...applicationFormProps} />;
      case 'form-pendapat':
        return <GrabPendapatForm {...applicationFormProps} />;
      case 'form-lainnya':
        return <GrabLainnyaForm {...applicationFormProps} />;
      case 'promo-transport':
        return <EnterprisePromoTransportScreen onBack={goHome} onContinue={goToSplash} />;
      case 'promo-food':
        return <EnterprisePromoFoodScreen onBack={goHome} onContinue={goToSplash} />;
      case 'promo-security':
        return <EnterprisePromoSecurityScreen onBack={goHome} onContinue={goToSplash} />;
      case 'splash':
        return <EnterpriseSplashScreen />;
      case 'form':
        return <EnterpriseFormFlow slugData={slugData} onBack={goHome} />;
      default:
        return null;
    }
  };

  const showUnderlay = crossfading && fadeFrom !== null;
  const themeColor = getEnterpriseScreenThemeColor(screen as EnterpriseScreenThemeKey);

  return (
    <div className="enterprise-root">
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
        className={`enterprise-screen ${crossfading ? 'enterprise-screen--crossfading' : ''}`}
        style={{
          opacity: crossfading ? 1 - underlayOpacity : 1,
          transitionDuration: `${CROSSFADE_MS}ms`,
        }}
      >
        {renderScreen(screen)}
      </div>
    </div>
  );
}
