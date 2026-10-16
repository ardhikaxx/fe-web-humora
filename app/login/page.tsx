'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HumoraLogo } from '../../components/brand/HumoraLogo';
import { useAdmin } from '../../lib/context/AdminContext';
import { useToast } from '../../components/ui/Toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { admins } = useAdmin();
  const { success, error: toastError } = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState('admin@humora.id');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If already logged in, show hint or let them continue
  const [hasExistingSession, setHasExistingSession] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedOut = localStorage.getItem('humora_admin_logged_out');
      const session = localStorage.getItem('humora_admin_session');
      if (session && isLoggedOut !== 'true') {
        setHasExistingSession(true);
      }
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    const trimmedInput = emailOrUsername.trim().toLowerCase();

    // Basic validation
    if (!trimmedInput) {
      setFormError('Silakan masukkan email atau username administrator.');
      return;
    }

    if (!password) {
      setFormError('Silakan masukkan kata sandi.');
      return;
    }

    setIsLoading(true);

    // Simulate authenticating administrator credentials
    setTimeout(() => {
      // Find matching active admin account
      const matchedAdmin = (admins || []).find(
        (a) =>
          (a.email.toLowerCase() === trimmedInput || a.username.toLowerCase() === trimmedInput) &&
          a.status === 'active'
      ) || (
        (trimmedInput === 'admin@humora.id' || trimmedInput === 'admin_humora' || trimmedInput === 'admin')
          ? { name: 'Admin HUMORA', email: 'admin@humora.id', role: 'Super Administrator', username: 'admin_humora' }
          : null
      );

      const isValid = Boolean(matchedAdmin) && (password === 'admin123' || password === 'humora2026' || password.length >= 4);

      if (isValid && matchedAdmin) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('humora_admin_logged_out');
          localStorage.setItem(
            'humora_admin_session',
            JSON.stringify({
              email: matchedAdmin.email,
              name: matchedAdmin.name,
              role: matchedAdmin.role,
              rememberMe,
              loginAt: new Date().toISOString(),
            })
          );
        }

        success('Login Berhasil!', `Selamat datang kembali, ${matchedAdmin.name}!`);
        router.push('/admin');
      } else {
        setIsLoading(false);
        setFormError('Kredensial administrator tidak valid atau akun dinonaktifkan. Silakan periksa kembali.');
        toastError('Gagal Masuk', 'Kombinasi email/username dan kata sandi salah.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA] text-[#24172B] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Subtle Decorative Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#4B0B7A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#FFD52E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#4B0B7A]/5 border border-[#EEE8F0] relative animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header with Centered Humora Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <HumoraLogo size="lg" showAdminBadge={true} showTagline={true} className="mb-4" />
            <h1 className="text-xl sm:text-2xl font-black text-[#24172B] tracking-tight">
              Masuk ke Akun Admin
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#786F7D]">
              Masukkan kredensial administrator Anda untuk mengelola portal HUMORA.
            </p>
          </div>

          {/* Existing Session Alert (if user had session) */}
          {hasExistingSession && (
            <div className="mb-5 p-3 rounded-2xl bg-[#F6F1F8] border border-[#E9D5FF] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4B0B7A] shrink-0" />
                <span className="text-[#24172B] font-medium">Sesi admin tersimpan.</span>
              </div>
              <Link
                href="/admin"
                className="font-bold text-[#4B0B7A] hover:underline shrink-0"
              >
                Buka Dashboard →
              </Link>
            </div>
          )}

          {/* Error Banner */}
          {formError && (
            <div className="mb-5 p-3 rounded-2xl bg-[#FEECEF] border border-[#FCD0D7] flex items-start gap-2.5 text-xs text-[#D94152] animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold leading-tight">{formError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-bold text-[#24172B] mb-1.5" htmlFor="email-input">
                Email atau Username Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#786F7D]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="admin@humora.id"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#EEE8F0] bg-[#FAF8FB] text-[#24172B] placeholder-[#786F7D]/60 focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] focus:ring-2 focus:ring-[#4B0B7A]/20 transition-all font-medium"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#24172B]" htmlFor="password-input">
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[#4B0B7A] hover:underline"
                >
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#786F7D]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#EEE8F0] bg-[#FAF8FB] text-[#24172B] placeholder-[#786F7D]/60 focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] focus:ring-2 focus:ring-[#4B0B7A]/20 transition-all font-medium"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#786F7D] hover:text-[#24172B] transition-colors"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4B0B7A] border-[#EEE8F0] focus:ring-[#4B0B7A]"
                />
                <span className="text-xs font-semibold text-[#24172B]">Ingat Sesi di Perangkat Ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#4B0B7A] hover:bg-[#3B0762] active:scale-[0.99] transition-all shadow-md shadow-[#4B0B7A]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
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
