'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'danger',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmBtnBg =
    variant === 'danger'
      ? 'bg-[#D94152] hover:bg-[#C23142] text-white'
      : variant === 'warning'
      ? 'bg-[#E58A16] hover:bg-[#C9750E] text-white'
      : 'bg-[#4B0B7A] hover:bg-[#3B0762] text-white';

  const iconBg =
    variant === 'danger' ? 'bg-[#FEECEF] text-[#D94152]' : 'bg-[#FFF5E8] text-[#E58A16]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EEE8F0] transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>
            {icon ? icon : variant === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#24172B] leading-tight">{title}</h3>
            <p className="mt-2 text-sm text-[#786F7D] leading-relaxed">{message}</p>
          </div>

          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#EEE8F0] text-sm font-semibold text-[#24172B] hover:bg-[#F8F7FA] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${confirmBtnBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
