'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HumoraLogo } from '../../components/brand/HumoraLogo';
import { useAdmin } from '../../lib/context/AdminContext';
import { useToast } from '../../components/ui/Toast';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { adminProfile, admins } = useAdmin();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('admin@humora.id');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setFormError('Silakan masukkan alamat email akun administrator Anda.');
      return;
    }

    setIsLoading(true);

    // Simulate database lookup to verify administrator account existence
    setTimeout(() => {
      // Valid administrator accounts registered in system database
      const registeredAdminEmails = [
        ...(admins || []).filter((a) => a.status === 'active').map((a) => a.email.toLowerCase()),
        (adminProfile.email || 'admin@humora.id').toLowerCase(),
        'admin@humora.id',
      ];

      const isFoundInDatabase = registeredAdminEmails.includes(trimmedEmail);

      if (isFoundInDatabase) {
        setIsVerified(true);
        success('Akun Ditemukan', `Email ${trimmedEmail} terdaftar pada basis data administrator HUMORA.`);
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(trimmedEmail)}`);
        }, 800);
      } else {
        setIsLoading(false);
        setFormError(`Email "${trimmedEmail}" tidak ditemukan dalam basis data administrator HUMORA.`);
        toastError('Verifikasi Gagal', 'Alamat email tidak terdaftar dalam sistem.');
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA] text-[#24172B] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Subtle Decorative Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#4B0B7A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#FFD52E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Forgot Password Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#4B0B7A]/5 border border-[#EEE8F0] relative animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header with Centered Humora Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <HumoraLogo size="lg" showAdminBadge={true} showTagline={true} className="mb-4" />
            <h1 className="text-xl sm:text-2xl font-black text-[#24172B] tracking-tight">
              Lupa Kata Sandi
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#786F7D]">
              Masukkan email administrator Anda untuk verifikasi akun pada basis data sistem.
            </p>
          </div>

          {/* Success Banner if account verified */}
          {isVerified && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Email Berhasil Diverifikasi!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Mengarahkan ke halaman buat kata sandi baru...
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {formError && (
            <div className="mb-5 p-3 rounded-2xl bg-[#FEECEF] border border-[#FCD0D7] flex items-start gap-2.5 text-xs text-[#D94152] animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold leading-tight">{formError}</span>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#24172B] mb-1.5" htmlFor="email-verify-input">
                Alamat Email Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#786F7D]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-verify-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@humora.id"
                  disabled={isLoading || isVerified}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#EEE8F0] bg-[#FAF8FB] text-[#24172B] placeholder-[#786F7D]/60 focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] focus:ring-2 focus:ring-[#4B0B7A]/20 transition-all font-medium disabled:opacity-70"
                  autoComplete="email"
                  required
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#786F7D]">
                Sistem akan memvalidasi apakah akun terdaftar pada hak akses portal.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isLoading || isVerified}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#4B0B7A] hover:bg-[#3B0762] active:scale-[0.99] transition-all shadow-md shadow-[#4B0B7A]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Basis Data...</span>
                  </>
                ) : (
                  <>
                    <span>Verifikasi Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Login</span>
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Simple Clean Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-[#786F7D] border-t border-[#EEE8F0] bg-white/50 backdrop-blur-xs z-10">
        <p>© 2026 HUMORA Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  );
}
