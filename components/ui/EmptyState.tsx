'use client';

import React from 'react';
import { Inbox, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`py-12 px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-[#EEE8F0] ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F6F1F8] text-[#4B0B7A] flex items-center justify-center mb-4">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-[#24172B]">{title}</h3>
      <p className="mt-1 text-sm text-[#786F7D] max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] text-white text-xs font-semibold hover:bg-[#3B0762] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
