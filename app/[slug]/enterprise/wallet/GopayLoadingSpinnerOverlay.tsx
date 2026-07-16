'use client';

type Props = {
  visible: boolean;
};

export function GopayLoadingSpinnerOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="go-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="go-loading-backdrop">
        <div className="go-loading-spinner" aria-hidden />
      </div>
    </div>
  );
}
