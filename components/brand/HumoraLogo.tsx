'use client';

import React from 'react';
import Image from 'next/image';

export interface HumoraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  type?: 'full' | 'icon';
  variant?: 'dark' | 'light' | 'white';
  showAdminBadge?: boolean;
  showTagline?: boolean;
  className?: string;
  priority?: boolean;
}

export function HumoraLogo({
  size = 'md',
  type = 'full',
  showAdminBadge = true,
  className = '',
  priority = true,
}: HumoraLogoProps) {
  // Mode Icon Saja (logo-humora.png, rasio 1:1 persegi)
  if (type === 'icon') {
    const iconDimensions =
      size === 'sm'
        ? { width: 36, height: 36, class: 'w-9 h-9 rounded-xl' }
        : size === 'md'
        ? { width: 44, height: 44, class: 'w-11 h-11 rounded-xl' }
        : { width: 72, height: 72, class: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl' };

    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        <div
          className={`relative overflow-hidden shadow-xs border border-[#EEE8F0] shrink-0 transition-transform hover:scale-105 active:scale-95 ${iconDimensions.class}`}
        >
          <Image
            src="/images/logo-humora.png"
            alt="HUMORA Logo"
            width={iconDimensions.width}
            height={iconDimensions.height}
            className="w-full h-full object-cover"
            priority={priority}
          />
        </div>
        {showAdminBadge && (
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider bg-[#4B0B7A] text-[#FFD52E] rounded-md uppercase shrink-0">
            Admin
          </span>
        )}
      </div>
    );
  }

  // Mode Logo Panjang dengan Tulisan (logo-humora-komersial.png, rasio 2:1 persegi panjang)
  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        <div className="h-9 w-[72px] sm:h-10 sm:w-[80px] rounded-xl overflow-hidden shadow-xs border border-[#EEE8F0] shrink-0 transition-transform hover:scale-[1.02]">
          <Image
            src="/images/logo-humora-komersial.png"
            alt="HUMORA Logo"
            width={80}
            height={40}
            className="w-full h-full object-cover"
            priority={priority}
          />
        </div>
        {showAdminBadge && (
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider bg-[#4B0B7A] text-[#FFD52E] rounded-md uppercase shrink-0">
            Admin
          </span>
        )}
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <div className="h-11 w-[88px] sm:h-12 sm:w-[96px] rounded-xl overflow-hidden shadow-xs border border-[#EEE8F0] shrink-0 transition-transform hover:scale-[1.02]">
          <Image
            src="/images/logo-humora-komersial.png"
            alt="HUMORA Logo"
            width={96}
            height={48}
            className="w-full h-full object-cover"
            priority={priority}
          />
        </div>
        {showAdminBadge && (
          <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider bg-[#4B0B7A] text-[#FFD52E] rounded-md uppercase shrink-0">
            Admin
          </span>
        )}
      </div>
    );
  }

  // size === 'lg' (tampilan kartu autentikasi: login, forgot-password, reset-password)
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="h-16 w-32 sm:h-20 sm:w-40 rounded-2xl overflow-hidden shadow-md shadow-[#4B0B7A]/5 border border-[#EEE8F0] shrink-0 transition-transform hover:scale-[1.02]">
        <Image
          src="/images/logo-humora-komersial.png"
          alt="HUMORA Logo"
          width={160}
          height={80}
          className="w-full h-full object-cover"
          priority={priority}
        />
      </div>
      {showAdminBadge && (
        <span className="mt-2.5 px-3 py-0.5 text-[10px] sm:text-xs font-black tracking-wider bg-[#4B0B7A] text-[#FFD52E] rounded-full uppercase shadow-xs">
          Portal Admin
        </span>
      )}
    </div>
  );
}
