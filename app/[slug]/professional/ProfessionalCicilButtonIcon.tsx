'use client';

function CicilBillIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <circle cx="24" cy="24" r="22" fill="#108EE9" />
      <path
        fill="#fff"
        d="M11 19.5c2.2-1.5 4.4-1.5 6.6 0 2.2 1.5 4.4 1.5 6.6 0 2.2-1.5 4.4-1.5 6.6 0 2.2 1.5 4.4 1.5 6.6 0v10c-2.2 1.5-4.4 1.5-6.6 0-2.2-1.5-4.4-1.5-6.6 0-2.2 1.5-4.4 1.5-6.6 0-2.2-1.5-4.4-1.5-6.6 0v-10z"
      />
    </svg>
  );
}

export function ProfessionalCicilButtonIcon() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center">
      <div className="professional-cicil-logo-pulse">
        <CicilBillIcon size={44} className="drop-shadow-sm" />
      </div>

      <div className="absolute -right-0.5 -top-1 z-10 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-full bg-[#ff8a80]/35 blur-[2px]" />
          <div className="relative rounded-full ring-2 ring-[#ff6b6b]">
            <CicilBillIcon size={18} />
            <svg
              viewBox="0 0 18 10"
              className="absolute -right-0.5 -top-1.5 h-2.5 w-4"
              aria-hidden
            >
              <path d="M2 10 L5 2 L9 10 Z" fill="#ff5252" />
              <path d="M6 10 L9 2 L13 10 Z" fill="#ff5252" />
              <path d="M10 10 L13 2 L16 10 Z" fill="#ff5252" />
            </svg>
          </div>
        </div>
        <span className="mt-0.5 rounded-sm bg-[#ff5252] px-1 py-[1px] text-[4.5px] font-extrabold leading-none tracking-wide text-white">
          POPULAR
        </span>
      </div>
    </div>
  );
}
