'use client';

import { useEffect, useRef, useState } from 'react';

/** Step panel enter animation — skip delay when advancing forward after submit. */
export function useStepPanelReady(step: number) {
  const [stepReady, setStepReady] = useState(true);
  const prevStepRef = useRef(step);

  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = step;

    if (step > prev) {
      setStepReady(true);
      return;
    }

    setStepReady(false);
    const frame = window.requestAnimationFrame(() => setStepReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  return stepReady;
}
