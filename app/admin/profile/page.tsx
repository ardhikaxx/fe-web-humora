'use client';

import React, { useState } from 'react';
import { useAdmin, ActivityItem } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useToast } from '../../../components/ui/Toast';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Lock,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  RotateCcw,
  Clock,
  Calendar,
  Globe,
  LogOut,
  Sliders,
  Eye,
  EyeOff,
  Check,
  Building,
  Activity,
  FileCheck2,
} from 'lucide-react';

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const INITIAL_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-1',
    device: 'Desktop PC (Workstation)',
    browser: 'Chrome 134.0',
    os: 'Windows 11 Pro',
    ip: '182.253.14.88',
    location: 'Jakarta, Indonesia',
    lastActive: 'Sesi saat ini (Aktif)',
    isCurrent: true,
  },
  {
    id: 'sess-2',
    device: 'iPhone 15 Pro',
    browser: 'Mobile Safari 18.2',
    os: 'iOS 18.2',
    ip: '114.122.21.35',
    location: 'Bandung, Indonesia',
    lastActive: '4 jam yang lalu',
    isCurrent: false,
  },
  {
    id: 'sess-3',
    device: 'MacBook Pro 16"',
    browser: 'Firefox 133.0',
    os: 'macOS Sonoma',
    ip: '36.85.101.12',
    location: 'Surabaya, Indonesia',
    lastActive: '2 hari yang lalu',
    isCurrent: false,
  },
];

const PERMISSIONS_LIST = [
  {
    module: 'Manajemen Series & Konten',
    description: 'Akses penuh untuk membuat, mengedit, mempublikasikan, dan menghapus series komedi pendek.',
    level: 'Full Access',
  },
  {
    module: 'Manajemen Episode & Video',
    description: 'Akses unggah video vertikal, setting durasi, urutan episode, dan thumbnail preview.',
    level: 'Full Access',
  },
  {
    module: 'Kategori & Kurasi Genre',
    description: 'Mengatur kategori utama, tag komedi, dan rekomendasi konten spotlight.',
    level: 'Full Access',
  },
  {
    module: 'Subtitle & Lokalisasi',
    description: 'Mengelola file SRT/VTT subtitle multi-bahasa (ID, EN, JW, SU) untuk setiap episode.',
    level: 'Full Access',
  },
  {
    module: 'Verifikasi Transaksi & Pembayaran',
    description: 'Menyetujui atau menolak bukti transfer bank, QRIS, e-Wallet, dan aktivasi VIP instan.',
    level: 'Full Access',
  },
  {
    module: 'Pengguna & Manajemen Hak Akses',
    description: 'Melihat riwayat penonton, manajemen status akun (Aktif/Diblokir), dan riwayat langganan.',
    level: 'Full Access',
  },
  {
    module: 'Pengaturan Sistem & Branding',
    description: 'Mengubah nama aplikasi, tagline, batas gratis episode, dan harga paket VIP.',
    level: 'Super Admin Only',
  },
];

export default function AdminProfilePage() {
  const { adminProfile, updateAdminProfile, recentActivities } = useAdmin();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions'>('profile');

  // Form states
  const [name, setName] = useState(adminProfile.name);
  const [username, setUsername] = useState(adminProfile.username);
  const [email, setEmail] = useState(adminProfile.email);
  const [phone, setPhone] = useState(adminProfile.phone);
  const [roleBadge, setRoleBadge] = useState(adminProfile.roleBadge);
  const [department, setDepartment] = useState(adminProfile.department);
  const [timezone, setTimezone] = useState(adminProfile.timezone);
  const [bio, setBio] = useState(adminProfile.bio);
  const [avatarInitials, setAvatarInitials] = useState(adminProfile.avatarInitials);

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(adminProfile.twoFactorEnabled);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);

  // Handle avatar initial auto-calculation if name changed
  const handleNameChange = (val: string) => {
    setName(val);
    if (!avatarInitials || avatarInitials === adminProfile.avatarInitials) {
      const parts = val.trim().split(/\s+/);
      if (parts.length >= 2) {
        setAvatarInitials((parts[0][0] + parts[1][0]).toUpperCase());
      } else if (parts.length === 1 && parts[0].length > 0) {
        setAvatarInitials(parts[0].slice(0, 2).toUpperCase());
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Validasi Gagal', 'Nama lengkap administrator tidak boleh kosong.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      error('Validasi Gagal', 'Alamat email administrator tidak valid.');
      return;
    }

    updateAdminProfile({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleBadge: roleBadge.trim(),
      department: department.trim(),
      timezone: timezone.trim(),
      bio: bio.trim(),
      avatarInitials: avatarInitials.trim().toUpperCase() || 'AD',
    });

    success(
      'Profil Admin Diperbarui',
      'Perubahan identitas dan informasi akun administrator berhasil disimpan.'
    );
  };

  const handleResetProfileForm = () => {
    setName(adminProfile.name);
    setUsername(adminProfile.username);
    setEmail(adminProfile.email);
    setPhone(adminProfile.phone);
    setRoleBadge(adminProfile.roleBadge);
    setDepartment(adminProfile.department);
    setTimezone(adminProfile.timezone);
    setBio(adminProfile.bio);
    setAvatarInitials(adminProfile.avatarInitials);
    info('Form Direset', 'Nilai input dikembalikan ke data profil yang tersimpan.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error('Kata Sandi Kosong', 'Harap masukkan kata sandi Anda saat ini.');
      return;
    }
    if (newPassword.length < 8) {
      error('Kata Sandi Kurang Kuat', 'Kata sandi baru minimal harus 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Konfirmasi Tidak Cocok', 'Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    success(
      'Kata Sandi Berhasil Diperbarui',
      'Kata sandi admin telah diganti. Sesi login saat ini tetap aman.'
    );
  };

  const handleToggle2FA = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    updateAdminProfile({ twoFactorEnabled: nextVal });
    if (nextVal) {
      success('2FA Diaktifkan', 'Autentikasi dua faktor via Authenticator App kini aktif.');
    } else {
      info('2FA Dinonaktifkan', 'Proteksi autentikasi dua faktor dinonaktifkan sementara.');
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    success('Sesi Dikeluarkan', 'Perangkat berhasil dikeluarkan dari akun administrator.');
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    success('Semua Sesi Lain Dikeluarkan', 'Seluruh perangkat lain telah dicabut hak aksesnya.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Profil Admin & Akun Pengelola"
        description="Kelola informasi identitas akun, kredensial keamanan, autentikasi 2 faktor, dan pantau hak akses operasional HUMORA."
        breadcrumbs={[{ label: 'Profil Admin' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetProfileForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EEE8F0] bg-white text-xs font-bold text-[#786F7D] hover:text-[#24172B] hover:bg-[#F6F1F8] transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset Form
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
            >
              <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan Profil
            </button>
          </div>
        }
      />

      {/* Top Banner / Hero Card */}
      <div className="bg-white rounded-2xl border border-[#EEE8F0] overflow-hidden shadow-xs">
        {/* Decorative Top Gradient Banner */}
        <div className="h-32 bg-gradient-to-r from-[#21052F] via-[#4B0B7A] to-[#7028B8] relative p-6 flex items-start justify-between">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD52E]" />
            <span>Administrator Portal Resmi HUMORA</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#21865B]/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span>Status: Aktif & Online</span>
          </div>
        </div>

        {/* Profile Identity Details Row */}
        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              {/* Avatar Box */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#4B0B7A] to-[#7028B8] text-[#FFD52E] font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                  {avatarInitials || 'AH'}
                </div>
                <span
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#21865B] border-2 border-white shadow-xs"
                  title="Online"
                />
              </div>

              {/* Identity text */}
              <div className="pb-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-[#24172B] tracking-tight">
                    {name || 'Admin HUMORA'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE]">
                    {roleBadge || adminProfile.roleBadge || 'Content Admin'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF7F2] text-[#21865B] border border-[#A7F3D0]">
                    {adminProfile.role}
                  </span>
                </div>
                <p className="text-xs text-[#786F7D] font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>@{username || 'admin_humora'}</span>
                  <span>•</span>
                  <span>{email || 'admin@humora.id'}</span>
                  <span>•</span>
                  <span className="text-[#4B0B7A] font-semibold">{department}</span>
                </p>
              </div>
            </div>

            {/* Quick Badges / Meta Info */}
            <div className="flex sm:flex-col items-start sm:items-end gap-1.5 text-xs text-[#786F7D] bg-[#FAF8FB] sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#4B0B7A]" />
                <span>Terdaftar: <strong className="text-[#24172B]">{adminProfile.joinedDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#21865B]" />
                <span>Login Terakhir: <span className="text-[#24172B] font-medium">{adminProfile.lastLogin}</span></span>
              </div>
            </div>
          </div>

          {/* Bio Preview */}
          {bio && (
            <p className="text-xs sm:text-sm text-[#786F7D] bg-[#FAF8FB] border border-[#EEE8F0] p-3.5 rounded-xl leading-relaxed">
              &quot;{bio}&quot;
            </p>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#EEE8F0] pt-6 mt-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-[#4B0B7A] text-[#4B0B7A] bg-[#F6F1F8]/50 rounded-t-lg'
                  : 'border-transparent text-[#786F7D] hover:text-[#24172B]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Data Diri & Identitas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-[#4B0B7A] text-[#4B0B7A] bg-[#F6F1F8]/50 rounded-t-lg'
                  : 'border-transparent text-[#786F7D] hover:text-[#24172B]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Keamanan & Sesi Login</span>
              {twoFactorEnabled && (
                <span className="w-2 h-2 rounded-full bg-[#21865B]" title="2FA Aktif" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('permissions')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'permissions'
                  ? 'border-[#4B0B7A] text-[#4B0B7A] bg-[#F6F1F8]/50 rounded-t-lg'
                  : 'border-transparent text-[#786F7D] hover:text-[#24172B]'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Hak Akses & Log Aktivitas</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENT: PROFILE DATA */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column: Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
                  <div>
                    <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                      Informasi Akun Administrator
                    </h3>
                    <p className="text-xs text-[#786F7D] mt-0.5">
                      Data ini akan muncul di sidebar navigasi, header atas, dan log kurasi konten.
                    </p>
                  </div>
                  <User className="w-5 h-5 text-[#4B0B7A]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Admin HUMORA"
                        className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                        required
                      />
                      <User className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Username / Handle *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. admin_humora"
                        className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                        required
                      />
                      <span className="text-[#786F7D] font-bold text-sm absolute left-3.5 top-2.5">@</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Email Resmi Administrator *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@humora.id"
                        className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                        required
                      />
                      <Mail className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* Telepon */}
                  <div>
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Nomor WhatsApp / Telepon
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +62 812-8899-7711"
                        className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                      />
                      <Phone className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* Departemen */}
                  <div>
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Departemen / Divisi
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Content Operations"
                        className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                      />
                      <Building className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* Zona Waktu */}
                  <div>
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Zona Waktu Operasional
                    </label>
                    <div className="relative">
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                      >
                        <option value="Asia/Jakarta (WIB, UTC+7)">Asia/Jakarta (WIB, UTC+7)</option>
                        <option value="Asia/Makassar (WITA, UTC+8)">Asia/Makassar (WITA, UTC+8)</option>
                        <option value="Asia/Jayapura (WIT, UTC+9)">Asia/Jayapura (WIT, UTC+9)</option>
                        <option value="Asia/Singapore (SGT, UTC+8)">Asia/Singapore (SGT, UTC+8)</option>
                      </select>
                      <Globe className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-3" />
                    </div>
                  </div>

                  {/* Bio Singkat */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Bio Singkat & Tanggung Jawab
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tuliskan ringkasan peran dan tanggung jawab Anda di platform HUMORA..."
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl p-3.5 text-sm font-medium text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
                  >
                    <Save className="w-4 h-4 text-[#FFD52E]" /> Simpan Perubahan Profil
                  </button>
                </div>
              </div>
            </div>

            {/* Side Column: Visual & Badge Customization */}
            <div className="space-y-6">
              {/* Badge & Avatar Customization */}
              <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider pb-2 border-b border-[#EEE8F0] flex items-center justify-between">
                  <span>Badge & Visual Inisial</span>
                  <Sparkles className="w-4 h-4 text-[#E58A16]" />
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Label Badge Sidebar / Topbar
                  </label>
                  <input
                    type="text"
                    value={roleBadge}
                    onChange={(e) => setRoleBadge(e.target.value)}
                    placeholder="e.g. Content Admin"
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-[#786F7D] mt-1">
                    Label singkat yang ditampilkan di sebelah nama admin pada header dan sidebar.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Inisial Avatar (Maksimal 2 Karakter)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={2}
                      value={avatarInitials}
                      onChange={(e) => setAvatarInitials(e.target.value.toUpperCase())}
                      placeholder="AH"
                      className="w-20 text-center uppercase bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2.5 text-sm font-black text-[#4B0B7A] tracking-wider focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all"
                    />
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4B0B7A] to-[#7028B8] text-[#FFD52E] font-black text-sm flex items-center justify-center border border-white shadow-xs">
                      {avatarInitials || 'AH'}
                    </div>
                    <span className="text-xs text-[#786F7D]">Preview avatar</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF8FB] rounded-xl border border-[#EEE8F0] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#786F7D]">
                    <span>Role Sistem:</span>
                    <strong className="text-[#4B0B7A]">{adminProfile.role}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#786F7D]">
                    <span>Status Verifikasi:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#21865B]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#786F7D]">
                    <span>Akses Level:</span>
                    <strong className="text-[#24172B]">Tingkat 1 (Full Control)</strong>
                  </div>
                </div>
              </div>

              {/* Quick Security Summary Widget */}
              <div className="bg-gradient-to-br from-[#21052F] to-[#4B0B7A] p-5 rounded-2xl text-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FFD52E]">
                    Keamanan Akun
                  </span>
                  <Lock className="w-4 h-4 text-[#FFD52E]" />
                </div>
                <h4 className="text-base font-bold">Autentikasi 2 Langkah</h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  {twoFactorEnabled
                    ? 'Akun Anda telah terlindungi dengan autentikasi 2FA TOTP. Kode rahasia diperlukan setiap kali login baru.'
                    : 'Aktifkan autentikasi 2 faktor untuk mencegah akses yang tidak diizinkan ke CMS platform.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="w-full mt-2 py-2 px-3 bg-white text-[#4B0B7A] hover:bg-[#F6F1F8] rounded-xl text-xs font-bold transition-all"
                >
                  Kelola Pengaturan Keamanan
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB CONTENT: SECURITY & SESSIONS */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Password & 2FA */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Ganti Password */}
            <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
                <div>
                  <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                    Ganti Kata Sandi
                  </h3>
                  <p className="text-xs text-[#786F7D] mt-0.5">
                    Gunakan kombinasi minimal 8 karakter dengan huruf kapital, angka, dan simbol.
                  </p>
                </div>
                <KeyRound className="w-5 h-5 text-[#4B0B7A]" />
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                    Kata Sandi Saat Ini *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama Anda"
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-medium text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#786F7D] hover:text-[#24172B]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Kata Sandi Baru *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-medium text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                      Konfirmasi Kata Sandi Baru *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-medium text-[#24172B] focus:outline-none focus:border-[#4B0B7A] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="p-3 bg-[#FAF8FB] rounded-xl border border-[#EEE8F0] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#786F7D]">Kekuatan Sandi:</span>
                      <span
                        className={
                          newPassword.length >= 10
                            ? 'text-[#21865B]'
                            : newPassword.length >= 8
                            ? 'text-[#E58A16]'
                            : 'text-[#D94152]'
                        }
                      >
                        {newPassword.length >= 10 ? 'Kuat & Aman' : newPassword.length >= 8 ? 'Sedang' : 'Terlalu Pendek'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EEE8F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          newPassword.length >= 10
                            ? 'w-full bg-[#21865B]'
                            : newPassword.length >= 8
                            ? 'w-2/3 bg-[#E58A16]'
                            : 'w-1/3 bg-[#D94152]'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
                  >
                    <KeyRound className="w-4 h-4 text-[#FFD52E]" /> Perbarui Kata Sandi
                  </button>
                </div>
              </form>
            </div>

            {/* 2FA Configuration Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
                <div>
                  <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                    Autentikasi Dua Langkah (2FA)
                  </h3>
                  <p className="text-xs text-[#786F7D] mt-0.5">
                    Tambahkan lapisan perlindungan ekstra menggunakan aplikasi Google Authenticator atau 1Password.
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    twoFactorEnabled ? 'bg-[#21865B]' : 'bg-[#786F7D]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FAF8FB] rounded-xl border border-[#EEE8F0]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      twoFactorEnabled ? 'bg-[#EBF7F2] text-[#21865B]' : 'bg-[#EEE8F0] text-[#786F7D]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#24172B]">
                      Aplikasi Autentikasi (TOTP)
                    </p>
                    <p className="text-[11px] text-[#786F7D]">
                      {twoFactorEnabled
                        ? 'Status: Aktif dan memverifikasi setiap login baru'
                        : 'Status: Nonaktif - akun rentan terhadap pembobolan'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    twoFactorEnabled
                      ? 'border border-[#D94152]/30 bg-[#FEECEF] text-[#D94152] hover:bg-[#FCD8DF]'
                      : 'bg-[#4B0B7A] text-white hover:bg-[#3B0762]'
                  }`}
                >
                  {twoFactorEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA Sekarang'}
                </button>
              </div>
            </div>
          </div>

          {/* Side Column: Sesi Aktif */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
                <div>
                  <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                    Sesi Login Aktif
                  </h3>
                  <p className="text-[11px] text-[#786F7D]">
                    {sessions.length} perangkat terhubung ke akun ini
                  </p>
                </div>
                <Laptop className="w-5 h-5 text-[#4B0B7A]" />
              </div>

              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      sess.isCurrent
                        ? 'bg-[#FBF9FD] border-[#4B0B7A]/30'
                        : 'bg-[#FAF8FB] border-[#EEE8F0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {sess.device.includes('iPhone') ? (
                          <Smartphone className="w-4 h-4 text-[#4B0B7A]" />
                        ) : (
                          <Laptop className="w-4 h-4 text-[#4B0B7A]" />
                        )}
                        <strong className="text-[#24172B]">{sess.device}</strong>
                      </div>

                      {sess.isCurrent ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#EBF7F2] text-[#21865B] border border-[#A7F3D0]">
                          Sesi Ini
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          className="text-[11px] font-bold text-[#D94152] hover:underline"
                        >
                          Keluarkan
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-[#786F7D]">
                      {sess.browser} • {sess.os}
                    </p>
                    <p className="text-[10px] text-[#786F7D] mt-1 flex items-center justify-between">
                      <span>{sess.location} ({sess.ip})</span>
                      <span className="text-[#4B0B7A] font-semibold">{sess.lastActive}</span>
                    </p>
                  </div>
                ))}
              </div>

              {sessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeAllOtherSessions}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 px-3 border border-[#D94152]/30 bg-[#FEECEF] text-[#D94152] hover:bg-[#FCD8DF] rounded-xl text-xs font-bold transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluarkan Semua Sesi Lain
                </button>
              )}
            </div>

            <div className="bg-[#FAF8FB] p-5 rounded-2xl border border-[#EEE8F0] space-y-2 text-xs text-[#786F7D]">
              <div className="flex items-center gap-2 font-bold text-[#24172B]">
                <AlertCircle className="w-4 h-4 text-[#E58A16]" />
                <span>Pusat Bantuan Kredensial</span>
              </div>
              <p className="leading-relaxed">
                Jika Anda mencurigai adanya aktivitas asing pada riwayat sesi di atas, segera ubah kata sandi Anda dan cabut seluruh sesi aktif lainnya.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PERMISSIONS & AUDIT LOG */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Hak Akses Matrix */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
                <div>
                  <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                    Matriks Hak Akses & Kewenangan CMS
                  </h3>
                  <p className="text-xs text-[#786F7D] mt-0.5">
                    Daftar kapabilitas operasional yang terasosiasi dengan peran Super Administrator.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#4B0B7A] text-[#FFD52E]">
                  Super Admin
                </span>
              </div>

              <div className="divide-y divide-[#EEE8F0]">
                {PERMISSIONS_LIST.map((perm, idx) => (
                  <div key={idx} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4B0B7A]" />
                        <h4 className="text-xs font-bold text-[#24172B]">{perm.module}</h4>
                      </div>
                      <p className="text-xs text-[#786F7D] pl-4">{perm.description}</p>
                    </div>

                    <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#EBF7F2] text-[#21865B] border border-[#A7F3D0] flex items-center gap-1">
                      <Check className="w-3 h-3" /> {perm.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column: Recent Log Activities */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EEE8F0]">
                <div>
                  <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                    Aktivitas Terbaru Anda
                  </h3>
                  <p className="text-[11px] text-[#786F7D]">
                    Riwayat interaksi Anda di platform
                  </p>
                </div>
                <Activity className="w-5 h-5 text-[#4B0B7A]" />
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto no-scrollbar">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.slice(0, 8).map((act: ActivityItem) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-[#FAF8FB] border border-[#EEE8F0] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-[#24172B] truncate">{act.title}</strong>
                        <span className="text-[10px] text-[#786F7D] shrink-0">
                          {new Date(act.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#786F7D] leading-snug">{act.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#786F7D] text-center py-4">Belum ada riwayat aktivitas tercatat.</p>
                )}
              </div>
            </div>

            <div className="bg-[#FAF8FB] p-5 rounded-2xl border border-[#EEE8F0] text-xs text-[#786F7D] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#24172B]">
                <Sliders className="w-4 h-4 text-[#4B0B7A]" />
                <span>Pengaturan Sistem Terkait</span>
              </div>
              <p>
                Perlu mengubah konfigurasi global seperti nama platform atau tier langganan VIP? Kunjungi halaman Pengaturan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
