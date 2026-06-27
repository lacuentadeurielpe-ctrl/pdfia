export function FoxLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="FoxPDF">
      <defs>
        <linearGradient id="foxg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* cara del zorro estilizada */}
      <path d="M24 6 L8 12 C8 24 12 36 24 44 C36 36 40 24 40 12 Z" fill="url(#foxg)" />
      <path d="M24 6 L8 12 L16 18 Z" fill="#fdba74" />
      <path d="M24 6 L40 12 L32 18 Z" fill="#fdba74" />
      <path d="M24 16 L17 21 C18 28 20 33 24 37 C28 33 30 28 31 21 Z" fill="#fff7ed" />
      <circle cx="19.5" cy="22" r="1.8" fill="#1f2937" />
      <circle cx="28.5" cy="22" r="1.8" fill="#1f2937" />
      <path d="M24 27 L21.5 30 H26.5 Z" fill="#1f2937" />
    </svg>
  );
}
