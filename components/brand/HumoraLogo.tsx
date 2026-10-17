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
        ? { width: 48, height: 48, class: 'w-12 h-12 rounded-xl' }
        : { width: 80, height: 80, class: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl' };

    return (
      <div className={`inline-flex items-center justify-center gap-2 select-none ${className}`}>
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
        <div className="h-10 w-[80px] rounded-xl overflow-hidden shadow-xs border border-[#EEE8F0] shrink-0 transition-transform hover:scale-[1.02]">
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
      <div className={`inline-flex items-center justify-center gap-2.5 select-none ${className}`}>
        <div className="h-12 w-24 sm:h-13 sm:w-[104px] rounded-xl overflow-hidden shadow-xs border border-[#EEE8F0] shrink-0 transition-transform hover:scale-[1.02]">
          <Image
            src="/images/logo-humora-komersial.png"
            alt="HUMORA Logo"
            width={104}
            height={52}
            className="w-full h-full object-cover"
            priority={priority}
          />
        </div>
        {showAdminBadge && (
          <span className="px-2 py-0.5 text-[10px] font-black tracking-wider bg-[#4B0B7A] text-[#FFD52E] rounded-md uppercase shrink-0">
            Admin
          </span>
        )}
      </div>
    );
  }

  // size === 'lg' (tampilan kartu autentikasi: login, forgot-password, reset-password)
  // Dibuat lebih besar, jelas, dan memikat sesuai permintaan
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="h-28 w-56 sm:h-36 sm:w-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-[#4B0B7A]/10 border border-[#EEE8F0] shrink-0 transition-transform hover:scale-[1.02]">
        <Image
          src="/images/logo-humora-komersial.png"
          alt="HUMORA Logo"
          width={288}
          height={144}
          className="w-full h-full object-cover"
          priority={priority}
        />
      </div>
      {showAdminBadge && (
        <span className="mt-3.5 px-4 py-1 text-xs font-black tracking-wider bg-[#4B0B7A] text-[#FFD52E] rounded-full uppercase shadow-xs">
          Portal Admin
        </span>
      )}
    </div>
  );
}
