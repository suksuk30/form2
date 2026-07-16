import Image from 'next/image';

type Props = {
  variant?: 'white' | 'green';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const HEIGHTS = { sm: 22, md: 28, lg: 38 } as const;

export function EnterpriseLogo({ variant = 'white', size = 'md', className = '' }: Props) {
  const height = HEIGHTS[size];

  return (
    <Image
      src="/enterprise/grab-logo.svg"
      alt="Grab"
      width={Math.round(height * 4)}
      height={height}
      className={`${variant === 'white' ? 'brightness-0 invert' : ''} ${className}`}
      style={{ height, width: 'auto' }}
      priority
    />
  );
}

export function EnterpriseGrabPayBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white ring-1 ring-white/30 ${className}`}
    >
      <GrabPayIcon className="h-3 w-3" />
      GrabPay
    </span>
  );
}

export function GrabPayIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="5" y="9" width="6" height="4" rx="1" fill="white" opacity="0.85" />
    </svg>
  );
}
