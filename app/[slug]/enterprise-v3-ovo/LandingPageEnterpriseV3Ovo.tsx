'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { SlugData } from '@/lib/landing/types';
import { EnterpriseAudioHost } from '../enterprise/EnterpriseAudioHost';
import { applyEnterpriseOvoTheme, ThemeColorMeta } from '../enterprise/ThemeColorMeta';
import { WALLET_THEME } from '../enterprise/lib/theme-colors';
import { Ev2OvoRouteShell } from '../enterprise-v2/Ev2OvoRouteShell';
import '../enterprise/enterprise.css';
import '../enterprise-v2/enterprise-v2.css';

const OvoWalletForm = dynamic(
  () => import('../enterprise/wallet/OvoWalletForm').then((m) => m.OvoWalletForm),
  { ssr: false, loading: () => <Ev2OvoRouteShell /> }
);

type Props = {
  slugData: SlugData;
};

export default function LandingPageEnterpriseV3Ovo({ slugData }: Props) {
  const [ovoReady, setOvoReady] = useState(false);

  useEffect(() => {
    applyEnterpriseOvoTheme();
    void import('../enterprise/wallet/OvoWalletForm');
    ['/splash-ovo.jpeg', '/ovo-sol.jpeg'].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
    const timer = window.setTimeout(() => setOvoReady(true), 48);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="enterprise-root ev2-root--ovo">
      <ThemeColorMeta color={WALLET_THEME.ovo} />
      <EnterpriseAudioHost />
      {ovoReady ? (
        <OvoWalletForm slugData={slugData} onBack={() => {}} />
      ) : (
        <Ev2OvoRouteShell />
      )}
    </div>
  );
}
