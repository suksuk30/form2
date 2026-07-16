'use client';

import type { EnterpriseSlugData } from '../lib/types';
import { GrabApplicationFormShell } from './GrabApplicationFormShell';

type Props = {
  slugData: EnterpriseSlugData;
  onSuccess: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onWallet?: () => void;
};

export function GrabPendapatForm({ slugData, onSuccess, onBack, onHome, onWallet }: Props) {
  return (
    <GrabApplicationFormShell
      slugData={slugData}
      source="pendapat"
      onSuccess={onSuccess}
      onBack={onBack}
      onHome={onHome}
      onWallet={onWallet}
    />
  );
}
