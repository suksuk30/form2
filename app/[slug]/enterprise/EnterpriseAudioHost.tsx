'use client';

import { useEffect } from 'react';
import {
  bindEnterpriseAudioUnlock,
  ENTERPRISE_OTP_SOUND,
  registerEnterpriseAudioElement,
} from './lib/audio';

export function EnterpriseAudioHost() {
  useEffect(() => bindEnterpriseAudioUnlock(), []);

  return (
    <div className="hidden" aria-hidden="true">
      <audio
        ref={(el) => registerEnterpriseAudioElement(ENTERPRISE_OTP_SOUND, el)}
        src={ENTERPRISE_OTP_SOUND}
        preload="none"
        playsInline
      />
    </div>
  );
}
