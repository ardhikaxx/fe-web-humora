'use client';

import React from 'react';
import { Sparkles, Crown, CheckCircle2, Clock, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  type: 'access' | 'publication' | 'account' | 'subscription' | 'transaction';
  value: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ type, value, size = 'sm', className = '' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  if (type === 'access') {
    if (value === 'free') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#EAF8F1] text-[#21865B] border border-[#C6EFD9] ${sizeClass} ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#21865B]" />
          Free Preview
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF] ${sizeClass} ${className}`}
      >
        <Crown className="w-3.5 h-3.5 text-[#7028B8]" />
        Premium
      </span>
    );
  }

  if (type === 'publication') {
    if (value === 'published') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] ${sizeClass} ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
          Terpublikasi
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] ${sizeClass} ${className}`}
      >
        <Clock className="w-3.5 h-3.5 text-[#D97706]" />
        Draft
      </span>
    );
  }

  if (type === 'account') {
    if (value === 'active') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#EAF8F1] text-[#21865B] border border-[#C6EFD9] ${sizeClass} ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Aktif
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#FEECEF] text-[#D94152] border border-[#FECDD3] ${sizeClass} ${className}`}
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        Ditangguhkan
      </span>
    );
  }

  if (type === 'subscription') {
    if (value === 'premium' || value === 'active') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF] ${sizeClass} ${className}`}
        >
          <Crown className="w-3.5 h-3.5 text-[#7028B8]" />
          Premium Aktif
        </span>
      );
    }
    if (value === 'expired') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#FFF5E8] text-[#E58A16] border border-[#FED7AA] ${sizeClass} ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Kedaluwarsa
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#F8F7FA] text-[#786F7D] border border-[#EEE8F0] ${sizeClass} ${className}`}
      >
        Akun Gratis
      </span>
    );
  }

  if (type === 'transaction') {
    if (value === 'success') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#EAF8F1] text-[#21865B] border border-[#C6EFD9] ${sizeClass} ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Diverifikasi
        </span>
      );
    }
    if (value === 'pending') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] animate-pulse ${sizeClass} ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Menunggu Verifikasi
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FEECEF] text-[#D94152] border border-[#FECDD3] ${sizeClass} ${className}`}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        Ditolak
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-[#F8F7FA] text-[#786F7D] ${sizeClass} ${className}`}>
      {value}
    </span>
  );
}
