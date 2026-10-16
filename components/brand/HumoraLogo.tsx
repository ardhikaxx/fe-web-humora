'use client';

import React from 'react';

interface HumoraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light' | 'white';
  showAdminBadge?: boolean;
  showTagline?: boolean;
  className?: string;
}

export function HumoraLogo({
  size = 'md',
  variant = 'dark',
  showAdminBadge = true,
  showTagline = false,
  className = '',
}: HumoraLogoProps) {
  const iconSize = size === 'sm' ? 26 : size === 'md' ? 34 : 44;
  const fontSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl';

  const textColor = variant === 'light' || variant === 'white' ? 'text-white' : 'text-[#24172B]';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Playful Laughing Play Button Icon */}
      <div
        style={{ width: iconSize, height: iconSize }}
        className="relative flex items-center justify-center shrink-0 drop-shadow-sm transition-transform hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer Rounded Triangle */}
          <path
            d="M26 15C19.3726 15 14 20.3726 14 27V73C14 79.6274 19.3726 85 26 85C29.2136 85 32.2905 83.7107 34.5445 81.4234L76.5445 58.4234C82.4851 55.1672 82.4851 44.8328 76.5445 41.5766L34.5445 18.5766C32.2905 16.2893 29.2136 15 26 15Z"
            fill={variant === 'white' ? '#FFFFFF' : '#FFD52E'}
            stroke="#21052F"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Eyes */}
          <path d="M32 39C32 39 36 34 40 39" stroke="#21052F" strokeWidth="5" strokeLinecap="round" />
          <path d="M48 39C48 39 52 34 56 39" stroke="#21052F" strokeWidth="5" strokeLinecap="round" />
          {/* Smile */}
          <path d="M34 51C34 60 54 60 54 51H34Z" fill="#D94152" stroke="#21052F" strokeWidth="4" strokeLinejoin="round" />
          {/* Tongue */}
          <ellipse cx="44" cy="54" rx="4.5" ry="3.5" fill="#FFA5B5" />
          {/* Sparkle */}
          <path d="M84 20L86 24L90 26L86 28L84 32L82 28L78 26L82 24L84 20Z" fill="#FFD52E" />
        </svg>
      </div>

      {/* Brand Text & Admin Console Label */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight leading-none ${fontSize} ${textColor}`}
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              letterSpacing: '-0.03em',
            }}
          >
            HUMORA
          </span>
          {showAdminBadge && (
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider bg-[#4B0B7A] text-[#FFD52E] rounded-md uppercase">
              Admin
            </span>
          )}
        </div>

        {showTagline && (
          <span className="text-[10px] text-[#786F7D] font-medium leading-tight mt-0.5">
            Scroll. laugh. repeat.
          </span>
        )}
      </div>
    </div>
  );
}
