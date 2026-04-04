/**
 * Digital Heroes Golf — Brand Logo Component
 * Usage: <Logo size="md" /> — sizes: sm | md | lg | xl
 */

const SIZES = {
  sm: { svg: 24, text: 'text-sm',  gap: 'gap-1.5' },
  md: { svg: 32, text: 'text-base', gap: 'gap-2'   },
  lg: { svg: 40, text: 'text-xl',   gap: 'gap-2.5' },
  xl: { svg: 52, text: 'text-2xl',  gap: 'gap-3'   },
};

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const { svg, text, gap } = SIZES[size] || SIZES.md;

  return (
    <span className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* ── SVG Icon ── */}
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer glow ring */}
        <circle cx="24" cy="24" r="23" fill="url(#bg_grad)" opacity="0.15" />

        {/* Golf flag pole */}
        <line x1="20" y1="8" x2="20" y2="36" stroke="#2dd4bf" strokeWidth="2.2" strokeLinecap="round" />

        {/* Flag */}
        <path d="M20 8 L34 14 L20 20 Z" fill="url(#flag_grad)" />

        {/* Golf ball */}
        <circle cx="20" cy="40" r="5" fill="url(#ball_grad)" />
        {/* Ball dimples */}
        <circle cx="18.5" cy="39" r="0.8" fill="rgba(255,255,255,0.25)" />
        <circle cx="21.5" cy="41" r="0.8" fill="rgba(255,255,255,0.25)" />
        <circle cx="20"   cy="38" r="0.7" fill="rgba(255,255,255,0.2)"  />

        {/* Ground arc */}
        <path d="M12 40 Q16 37 20 40 Q24 43 28 40" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />

        {/* Star / hero sparkle — top right */}
        <g opacity="0.85">
          <path d="M37 10 L38.2 13.8 L42 15 L38.2 16.2 L37 20 L35.8 16.2 L32 15 L35.8 13.8 Z"
            fill="url(#star_grad)" />
        </g>

        {/* Small dot sparkle */}
        <circle cx="41" cy="8" r="1.4" fill="#f59e0b" opacity="0.7" />
        <circle cx="33" cy="7" r="0.9" fill="#2dd4bf" opacity="0.6" />

        {/* Gradient defs */}
        <defs>
          <linearGradient id="bg_grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="flag_grad" x1="20" y1="8" x2="34" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <radialGradient id="ball_grad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
          <linearGradient id="star_grad" x1="32" y1="10" x2="42" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <span className={`font-bold font-display leading-none ${text}`}>
          <span className="text-white">Digital </span>
          <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">Heroes</span>
        </span>
      )}
    </span>
  );
}
