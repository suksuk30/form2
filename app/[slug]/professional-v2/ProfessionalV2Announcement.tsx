'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

const ANNOUNCEMENT_TEXT =
  'Layanan Baru: Nikmati kemudahan Top Up Saldo DANA tanpa biaya admin melalui ATM manapun';

const CHAR_DELAY_MS = 28;
const RESTART_DELAY_MS = 4500;

export function ProfessionalV2Announcement() {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let charIndex = 0;
    let typingTimer: number | undefined;
    let restartTimer: number | undefined;
    let cursorTimer: number | undefined;
    let cancelled = false;

    const clearTyping = () => {
      if (typingTimer !== undefined) {
        window.clearTimeout(typingTimer);
        typingTimer = undefined;
      }
    };

    const clearRestart = () => {
      if (restartTimer !== undefined) {
        window.clearTimeout(restartTimer);
        restartTimer = undefined;
      }
    };

    const typeNextChar = () => {
      if (cancelled) return;

      charIndex += 1;
      setDisplayed(ANNOUNCEMENT_TEXT.slice(0, charIndex));

      if (charIndex >= ANNOUNCEMENT_TEXT.length) {
        restartTimer = window.setTimeout(() => {
          if (cancelled) return;
          charIndex = 0;
          setDisplayed('');
          typeNextChar();
        }, RESTART_DELAY_MS);
        return;
      }

      typingTimer = window.setTimeout(typeNextChar, CHAR_DELAY_MS);
    };

    cursorTimer = window.setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    typeNextChar();

    return () => {
      cancelled = true;
      clearTyping();
      clearRestart();
      if (cursorTimer !== undefined) window.clearInterval(cursorTimer);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
      <div className="border-l-4 border-[#108EE9] px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#108EE9] text-white">
            <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
          <p className="text-[12px] font-bold text-[#108EE9]">Pengumuman DANA</p>
        </div>

        <p className="mt-2 min-h-[2.6rem] pl-9 text-[10px] leading-relaxed text-gray-600">
          {displayed}
          <span
            className={`ml-0.5 inline-block h-[11px] w-[1.5px] translate-y-[1px] bg-[#108EE9] ${
              showCursor ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden
          />
        </p>
      </div>
    </div>
  );
}
