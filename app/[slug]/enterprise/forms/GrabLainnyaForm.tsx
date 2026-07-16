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

export function GrabLainnyaForm({ slugData, onSuccess, onBack, onHome, onWallet }: Props) {
  return (
    <GrabApplicationFormShell
      slugData={slugData}
      source="lainnya"
      onSuccess={onSuccess}
      onBack={onBack}
      onHome={onHome}
      onWallet={onWallet}
    />
  );
}
