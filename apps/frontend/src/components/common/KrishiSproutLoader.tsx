import React from 'react';

export interface KrishiSproutLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const KrishiSproutLoader: React.FC<KrishiSproutLoaderProps> = ({
  size = 'md',
  showLabel = false,
  label = 'लोड हो रहा है | Loading...',
  sublabel = 'KrishiSeva National Procurement Engine',
  className = '',
}) => {
  const dimensionMap = {
    sm: { box: 'w-12 h-12', svg: 48 },
    md: { box: 'w-20 h-20', svg: 80 },
    lg: { box: 'w-28 h-28', svg: 112 },
    xl: { box: 'w-36 h-36', svg: 144 },
  };

  const dim = dimensionMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${dim.box} flex items-center justify-center`}>
        {/* Ambient Breathing Aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 via-gold/20 to-emerald-400/20 blur-xl animate-aura-breathe pointer-events-none" />

        <svg
          viewBox="0 0 120 120"
          className="w-full h-full relative z-10 drop-shadow-md select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sproutGreenGrad" x1="60" y1="100" x2="60" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1A4A22" />
              <stop offset="45%" stopColor="#2A6B35" />
              <stop offset="100%" stopColor="#4C9E5A" />
            </linearGradient>

            <linearGradient id="wheatGoldGrad" x1="60" y1="85" x2="60" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B3800F" />
              <stop offset="50%" stopColor="#D4A017" />
              <stop offset="100%" stopColor="#F5D97A" />
            </linearGradient>

            <linearGradient id="ringGoldGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D4A017" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#4C9E5A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F5D97A" stopOpacity="0.9" />
            </linearGradient>

            <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Orbit Ring with 12 Sun Rays / Seed Nodes */}
          <g className="animate-orbit-cw origin-center">
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="url(#ringGoldGrad)"
              strokeWidth="1.2"
              strokeDasharray="4 6"
              strokeOpacity="0.75"
            />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const cx = 60 + 52 * Math.cos(rad);
              const cy = 60 + 52 * Math.sin(rad);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={i % 3 === 0 ? 2.5 : 1.5}
                  fill={i % 3 === 0 ? '#D4A017' : '#4C9E5A'}
                  opacity={0.9}
                />
              );
            })}
          </g>

          {/* Inner Counter-Rotating Golden Ring */}
          <g className="animate-orbit-ccw origin-center">
            <circle
              cx="60"
              cy="60"
              r="44"
              stroke="#2A6B35"
              strokeWidth="1"
              strokeDasharray="2 8"
              strokeOpacity="0.5"
            />
          </g>

          {/* Soil Base */}
          <path
            d="M40 92 C48 88, 72 88, 80 92 C74 97, 46 97, 40 92 Z"
            fill="#6B4A2A"
            opacity="0.85"
          />
          <path
            d="M46 92 C52 89, 68 89, 74 92 C70 95, 50 95, 46 92 Z"
            fill="#D4A017"
            opacity="0.6"
          />

          {/* Central Seed Node */}
          <ellipse
            cx="60"
            cy="88"
            rx="4.5"
            ry="6"
            fill="url(#wheatGoldGrad)"
            filter="url(#goldGlowFilter)"
            className="animate-grain-pulse origin-center"
          />

          {/* Main Sprout Stem */}
          <path
            d="M60 88 C60 76, 59 55, 60 38"
            stroke="url(#sproutGreenGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            style={{
              strokeDasharray: 60,
              animation: 'sprout-stem 2.4s ease-in-out infinite alternate',
            }}
          />

          {/* Left Leaf */}
          <path
            d="M60 70 C50 68, 38 60, 42 48 C48 56, 56 64, 60 70 Z"
            fill="url(#sproutGreenGrad)"
            className="origin-center"
            style={{
              transformOrigin: '60px 70px',
              animation: 'leaf-bloom-left 3s ease-in-out infinite alternate',
            }}
          />

          {/* Right Leaf */}
          <path
            d="M60 58 C70 56, 82 48, 78 36 C72 44, 64 52, 60 58 Z"
            fill="url(#sproutGreenGrad)"
            className="origin-center"
            style={{
              transformOrigin: '60px 58px',
              animation: 'leaf-bloom-right 3.2s ease-in-out infinite alternate',
            }}
          />

          {/* Top Golden Wheat Crown */}
          <g className="animate-grain-pulse origin-center" style={{ transformOrigin: '60px 32px' }}>
            <path d="M60 38 L60 22" stroke="#F5D97A" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M58 32 C54 28, 48 24, 46 22" stroke="#D4A017" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M62 32 C66 28, 72 24, 74 22" stroke="#D4A017" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="60" cy="30" r="3.2" fill="url(#wheatGoldGrad)" />
            <circle cx="56" cy="34" r="2.8" fill="url(#wheatGoldGrad)" />
            <circle cx="64" cy="34" r="2.8" fill="url(#wheatGoldGrad)" />
            <circle cx="60" cy="24" r="2.2" fill="#F5D97A" filter="url(#goldGlowFilter)" />
          </g>
        </svg>
      </div>

      {showLabel && (
        <div className="mt-4 text-center select-none animate-fade-in">
          <p className="text-sm font-semibold text-text-primary dark:text-emerald-100 tracking-wide">
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-text-muted dark:text-emerald-400/80 font-medium mt-0.5">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KrishiSproutLoader;
