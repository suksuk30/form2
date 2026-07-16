import Image from 'next/image';

const SOCIAL_ICONS = [
  {
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M13.5 9.5V7.7c0-.8.6-1 1-1h1.8V4h-2.5c-2.4 0-3.5 1.5-3.5 3.6v1.9H8v2.8h2.3V20h3.2v-7.7h2.2l.3-2.8h-2.5z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M18.2 7.5h-1.4l-3.1 3.6-3.6-3.6H6.5l4.8 5.7-5.1 5.8h1.4l3.5-4 3.9 4h3.6l-5-5.8 5.3-6.1z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C17.8 5 12 5 12 5s-5.8 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 9.2 2 12 2 12s0 2.8.4 4.8a2.5 2.5 0 0 0 1.8 1.8C6.2 19 12 19 12 19s5.8 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-2 .4-4.8.4-4.8s0-2.8-.4-4.8zM10 15.5V8.5l5.5 3.5L10 15.5z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M6.5 9.5H4v10h2.5V9.5zM5.3 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM9 9.5h2.4v1.4h.1c.3-.6 1.2-1.3 2.5-1.3 2.7 0 3.2 1.8 3.2 4.1V19.5H14.4v-5.6c0-1.3 0-3-1.8-3-1.8 0-2.1 1.4-2.1 2.9v5.7H9V9.5z" />
      </svg>
    ),
  },
] as const;

export function ProfessionalDanaFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-[#003d66] px-5 py-6 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <Image
        src="/dana_logo.svg"
        alt="DANA"
        width={96}
        height={30}
        className="h-7 w-auto brightness-0 invert"
      />
      <p className="mt-3 max-w-[300px] text-[11px] leading-relaxed text-white/85">
        © 2024 DANA - PT. Espay Debit Indonesia Koe. All Rights Reserved.
      </p>
      <div className="mt-4 flex items-center gap-4 opacity-90">
        {SOCIAL_ICONS.map(({ label, icon }) => (
          <span key={label} className="text-white" aria-hidden>
            {icon}
          </span>
        ))}
      </div>
    </footer>
  );
}
