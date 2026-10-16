'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HumoraLogo } from '../../components/brand/HumoraLogo';
import { useToast } from '../../components/ui/Toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Film,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState('admin@humora.id');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

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
      // Allow standard admin credentials
      const isValid =
        (trimmedInput === 'admin@humora.id' || trimmedInput === 'admin_humora' || trimmedInput === 'admin') &&
        (password === 'admin123' || password === 'humora2026' || password.length >= 4);

      if (isValid) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('humora_admin_logged_out');
          localStorage.setItem(
            'humora_admin_session',
            JSON.stringify({
              email: trimmedInput.includes('@') ? trimmedInput : 'admin@humora.id',
              name: 'Admin HUMORA',
              role: 'Super Administrator',
              rememberMe,
              loginAt: new Date().toISOString(),
            })
          );
        }

        success('Login Berhasil!', 'Selamat datang kembali di HUMORA Admin Console.');
        router.push('/admin');
      } else {
        setIsLoading(false);
        setFormError('Kredensial tidak valid. Gunakan demo akun admin@humora.id / sandi admin123');
        toastError('Gagal Masuk', 'Kombinasi email/username dan kata sandi salah.');
      }
    }, 600);
  };

  const handleQuickDemoFill = () => {
    setEmailOrUsername('admin@humora.id');
    setPassword('admin123');
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA] text-[#24172B] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#4B0B7A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#FFD52E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Brand Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto z-10">
        <Link href="/login" className="inline-flex items-center gap-2">
          <HumoraLogo size="md" showAdminBadge={true} showTagline={false} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Siap
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Brand & Highlights */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E8FF] border border-[#E9D5FF] text-[#4B0B7A] text-xs font-bold w-fit">
              <Sparkles className="w-4 h-4 text-[#FFD52E]" />
              <span>Portal Pengelola & Kurasi Konten</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#24172B] tracking-tight leading-tight">
                Kelola Hiburan Pendek, <br />
                <span className="text-[#4B0B7A]">Publikasikan Tawa Tanpa Batas.</span>
              </h1>
              <p className="mt-3 text-sm text-[#786F7D] leading-relaxed">
                Akses pusat kendali katalog judul cerita, kurasi video thumbnail 16:9, pantau transaksi langganan, dan analitik streaming HUMORA secara terpusat.
              </p>
            </div>

            {/* Feature Bento Mini-Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-[#EEE8F0] shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F6F1F8] text-[#4B0B7A] shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#24172B]">Katalog Video 16:9</p>
                  <p className="text-[11px] text-[#786F7D]">Sinkron prototype mobile</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EEE8F0] shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#EAF8F1] text-[#21865B] shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#24172B]">Verifikasi Pembayaran</p>
                  <p className="text-[11px] text-[#786F7D]">Persetujuan mutasi instan</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EEE8F0] shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FFF8E6] text-[#E58A16] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#24172B]">Manajemen Pengguna</p>
                  <p className="text-[11px] text-[#786F7D]">Pelanggan bulanan & VIP</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EEE8F0] shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#24172B]">Hak Akses Admin</p>
                  <p className="text-[11px] text-[#786F7D]">Kredensial staf terenkripsi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#4B0B7A]/5 border border-[#EEE8F0] relative">
              {/* Card Header */}
              <div className="text-left mb-6">
                <div className="inline-block lg:hidden mb-4">
                  <HumoraLogo size="md" showAdminBadge={true} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#24172B] tracking-tight">
                  Masuk ke Akun Admin
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#786F7D]">
                  Masukkan kredensial administrator Anda untuk melanjutkan.
                </p>
              </div>

              {/* Existing Session Alert (if user had session) */}
              {hasExistingSession && (
                <div className="mb-5 p-3 rounded-2xl bg-[#F6F1F8] border border-[#E9D5FF] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4B0B7A] shrink-0" />
                    <span className="text-[#24172B] font-medium">Sesi admin sebelumnya masih tersimpan.</span>
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
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[11px] font-semibold text-[#4B0B7A] hover:underline"
                    >
                      Lupa sandi?
                    </button>
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

              {/* Quick Demo Autofill Box */}
              <div className="mt-5 pt-4 border-t border-[#EEE8F0]">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8FB] hover:bg-[#F6F1F8] border border-dashed border-[#D4C3E2] transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FFD52E] shadow-xs" />
                    <div>
                      <p className="text-[11px] font-bold text-[#24172B] group-hover:text-[#4B0B7A]">
                        Gunakan Kredensial Admin Demo
                      </p>
                      <p className="text-[10px] text-[#786F7D]">admin@humora.id • sandi: admin123</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#4B0B7A] bg-white px-2 py-1 rounded-md border border-[#EEE8F0] shadow-2xs">
                    Isi Otomatis
                  </span>
                </button>
              </div>

              {/* Bottom Security Note */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#786F7D] text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#21865B]" />
                <span>Koneksi aman SSL 256-bit • Portal internal HUMORA</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-[#786F7D] border-t border-[#EEE8F0] bg-white/50 backdrop-blur-xs z-10">
        <p>© 2026 HUMORA Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#EEE8F0] animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-[#F6F1F8] text-[#4B0B7A]">
                <HelpCircle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-[#786F7D] hover:bg-[#F6F1F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="mt-3 text-base font-bold text-[#24172B]">Bantuan Kredensial Administrator</h3>
            <p className="mt-2 text-xs text-[#786F7D] leading-relaxed">
              Karena alasan keamanan portal CMS internal, pengaturan ulang kata sandi admin utama dilakukan langsung oleh Super Administrator.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-[#FAF8FB] border border-[#EEE8F0] text-xs">
              <p className="font-bold text-[#24172B]">Kredensial Demo Saat Ini:</p>
              <p className="text-[#786F7D] mt-1 font-mono text-[11px]">
                Email: <span className="text-[#4B0B7A] font-bold">admin@humora.id</span><br />
                Sandi: <span className="text-[#4B0B7A] font-bold">admin123</span>
              </p>
            </div>

            <div className="mt-5">
              <button
                onClick={() => {
                  handleQuickDemoFill();
                  setIsForgotModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762] transition-colors"
              >
                Gunakan Kredensial Demo Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
