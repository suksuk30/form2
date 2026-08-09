'use client';

import { useEffect } from 'react';
import {
  bindLandingAudioUnlock,
  LANDING_CHAT_SOUND,
  registerLandingAudioElement,
} from '@/lib/landing-audio';

export function LandingAudioHost() {
  useEffect(() => bindLandingAudioUnlock(), []);

  return (
    <div className="hidden" aria-hidden="true">
      <audio
        ref={(el) => registerLandingAudioElement(LANDING_CHAT_SOUND, el)}
        src={LANDING_CHAT_SOUND}
        preload="none"
        playsInline
      />
    </div>
  );
}
