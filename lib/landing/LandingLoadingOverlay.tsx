'use client';

import { Loader2 } from 'lucide-react';

export function LandingLoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="flex flex-col items-center rounded-2xl bg-white/10 px-8 py-6 backdrop-blur-md">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
        <p className="mt-3 text-sm font-medium text-white/90">Memproses...</p>
      </div>
    </div>
  );
}
