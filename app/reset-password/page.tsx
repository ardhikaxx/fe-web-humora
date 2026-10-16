'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HumoraLogo } from '../../components/brand/HumoraLogo';
import { useToast } from '../../components/ui/Toast';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success } = useToast();

  const userEmail = searchParams.get('email') || 'admin@humora.id';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!newPassword) {
      setFormError('Silakan masukkan kata sandi baru.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('Kata sandi baru minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (!confirmPassword) {
      setFormError('Silakan masukkan konfirmasi kata sandi baru.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Konfirmasi kata sandi tidak cocok. Pastikan kedua kata sandi sama persis.');
      return;
    }

    setIsLoading(true);

    // Simulate saving new password to database
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      success('Kata Sandi Berhasil Diperbarui!', 'Kata sandi baru Anda telah aktif. Mengarahkan ke halaman login...');

      // Redirect to login after brief success notification
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    }, 700);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#4B0B7A]/5 border border-[#EEE8F0] relative animate-in fade-in zoom-in-95 duration-200">
      {/* Card Header with Centered Humora Logo */}
      <div className="flex flex-col items-center text-center mb-6">
        <HumoraLogo size="lg" showAdminBadge={true} showTagline={true} className="mb-4" />
        <h1 className="text-xl sm:text-2xl font-black text-[#24172B] tracking-tight">
          Ubah Kata Sandi Baru
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#786F7D]">
          Buat kata sandi baru yang aman untuk akun administrator Anda.
        </p>

        {/* Verified Email Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] border border-[#E9D5FF] text-[11px] font-semibold text-[#4B0B7A]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4B0B7A]" />
          <span>Akun: {userEmail}</span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Kata Sandi Berhasil Diubah!</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Mengarahkan kembali ke halaman login dalam beberapa detik...
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

      {/* Reset Password Form */}
      <form onSubmit={handleResetPassword} className="space-y-4">
        {/* Input 1: Kata Sandi Baru */}
        <div>
          <label className="block text-xs font-bold text-[#24172B] mb-1.5" htmlFor="new-password">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#786F7D]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="new-password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              disabled={isLoading || isSuccess}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#EEE8F0] bg-[#FAF8FB] text-[#24172B] placeholder-[#786F7D]/60 focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] focus:ring-2 focus:ring-[#4B0B7A]/20 transition-all font-medium disabled:opacity-70"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#786F7D] hover:text-[#24172B] transition-colors"
              aria-label={showNewPassword ? 'Sembunyikan kata sandi baru' : 'Tampilkan kata sandi baru'}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Input 2: Konfirmasi Kata Sandi Baru */}
        <div>
          <label className="block text-xs font-bold text-[#24172B] mb-1.5" htmlFor="confirm-password">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#786F7D]">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              disabled={isLoading || isSuccess}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#EEE8F0] bg-[#FAF8FB] text-[#24172B] placeholder-[#786F7D]/60 focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] focus:ring-2 focus:ring-[#4B0B7A]/20 transition-all font-medium disabled:opacity-70"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#786F7D] hover:text-[#24172B] transition-colors"
              aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-[#786F7D]">
            Pastikan kedua kata sandi yang Anda masukkan sama persis.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2.5">
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#4B0B7A] hover:bg-[#3B0762] active:scale-[0.99] transition-all shadow-md shadow-[#4B0B7A]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyimpan Kata Sandi Baru...</span>
              </>
            ) : (
              <>
                <span>Simpan Kata Sandi Baru</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Batal dan Kembali ke Login</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FA] text-[#24172B] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Subtle Decorative Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#4B0B7A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#FFD52E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Content Wrapped in Suspense */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <Suspense fallback={
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-[#EEE8F0] text-center text-xs text-[#786F7D]">
            Memuat formulir pembaruan kata sandi...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>

      {/* Simple Clean Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-[#786F7D] border-t border-[#EEE8F0] bg-white/50 backdrop-blur-xs z-10">
        <p>© 2026 HUMORA Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  );
}
