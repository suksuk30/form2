'use client';

import { useEffect, useRef, useState } from 'react';

type Phase = 'dots' | 'success';

const DOT_CYCLE_MS = 620;
const DOT_CYCLES = 2;
const DOTS_DURATION_MS = DOT_CYCLE_MS * DOT_CYCLES;

type Props = {
  visible: boolean;
  /** Step 3 OTP: hanya animasi titik, tanpa centang hijau */
  dotsOnly?: boolean;
};

export function OvoLoadingSpinnerOverlay({ visible, dotsOnly = false }: Props) {
  const [phase, setPhase] = useState<Phase>('dots');
  const [sessionDotsOnly, setSessionDotsOnly] = useState(false);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      wasVisibleRef.current = false;
      setPhase('dots');
      return undefined;
    }

    if (wasVisibleRef.current) {
      return undefined;
    }

    wasVisibleRef.current = true;
    setSessionDotsOnly(dotsOnly);
    setPhase('dots');
    if (dotsOnly) return undefined;

    const timer = window.setTimeout(() => setPhase('success'), DOTS_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [visible, dotsOnly]);

  if (!visible) return null;

  return (
    <div className="ovo-loading-overlay">
      <div className="ovo-loading-backdrop">
        <div className="ovo-loading-card">
          {phase === 'dots' || sessionDotsOnly ? (
            <div className="ovo-load-dots" aria-hidden>
              <span className="ovo-load-dot" />
              <span className="ovo-load-dot" />
              <span className="ovo-load-dot" />
            </div>
          ) : (
            <svg className="ovo-load-check" viewBox="0 0 52 52" aria-hidden>
              <circle className="ovo-load-check-circle" cx="26" cy="26" r="24" />
              <path className="ovo-load-check-mark" d="M15 27 L23 34.5 L38 18" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
