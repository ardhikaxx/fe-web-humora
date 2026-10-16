'use client';

import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  children,
  onResetFilters,
  hasActiveFilters = false,
  className = '',
}: SearchFilterBarProps) {
  return (
    <div
      className={`bg-white p-4 rounded-2xl border border-[#EEE8F0] shadow-2xs flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex-1 min-w-[220px] relative">
        <Search className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl pl-9 pr-9 py-2 text-sm text-[#24172B] placeholder:text-[#786F7D] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#4B0B7A]/20 focus:border-[#4B0B7A] transition-all"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786F7D] hover:text-[#24172B]"
            aria-label="Bersihkan pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}

        {hasActiveFilters && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#D94152] bg-[#FEECEF] hover:bg-[#FCD8DF] rounded-xl transition-colors"
            title="Reset semua filter"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
