'use client';

type Props = {
  visible: boolean;
};

export function ShopeepayLoadingSpinnerOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="spay-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="spay-loading-backdrop">
        <div className="spay-loading-spinner" aria-hidden />
      </div>
    </div>
  );
}
