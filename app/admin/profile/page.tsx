'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useToast } from '../../../components/ui/Toast';
import {
  User,
  Mail,
  Phone,
  KeyRound,
  Sparkles,
  Save,
  Clock,
  Globe,
  Building,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminProfilePage() {
  const { adminProfile, updateAdminProfile } = useAdmin();
  const { success, error } = useToast();

  // Form states for admin identity
  const [name, setName] = useState(adminProfile.name);
  const [username, setUsername] = useState(adminProfile.username);
  const [email, setEmail] = useState(adminProfile.email);
  const [phone, setPhone] = useState(adminProfile.phone);
  const [department, setDepartment] = useState(adminProfile.department);
  const [timezone, setTimezone] = useState(adminProfile.timezone);
  const [bio, setBio] = useState(adminProfile.bio);
  const [avatarInitials, setAvatarInitials] = useState(adminProfile.avatarInitials);

  // Security / Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto calculate initials if admin edits their name
  const handleNameChange = (val: string) => {
    setName(val);
    const parts = val.trim().split(/\s+/);
    if (parts.length >= 2) {
      setAvatarInitials((parts[0][0] + parts[1][0]).toUpperCase());
    } else if (parts.length === 1 && parts[0].length > 0) {
      setAvatarInitials(parts[0].slice(0, 2).toUpperCase());
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
      department: department.trim(),
      timezone: timezone.trim(),
      bio: bio.trim(),
      avatarInitials: avatarInitials.trim().toUpperCase() || 'AH',
    });

    success(
      'Profil Admin Diperbarui',
      'Perubahan identitas dan informasi akun administrator berhasil disimpan.'
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error('Kata Sandi Kosong', 'Harap masukkan kata sandi saat ini.');
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
      'Kata Sandi Diperbarui',
      'Kata sandi admin berhasil diperbarui.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Profil Admin & Akun Pengelola"
        description="Kelola informasi identitas akun administrator, data kontak operasional HUMORA, dan pembaruan kata sandi."
        breadcrumbs={[{ label: 'Profil Admin' }]}
      />

      {/* Hero Banner / Header Identity Card */}
      <div className="bg-white rounded-2xl border border-[#EEE8F0] overflow-hidden shadow-xs">
        <div className="h-28 bg-gradient-to-r from-[#21052F] via-[#4B0B7A] to-[#7028B8] relative p-6 flex items-start justify-between">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD52E]" />
            <span>Administrator Portal Resmi HUMORA</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#21865B]/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span>Status: Aktif & Online</span>
          </div>
        </div>

        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-4">
            <div className="flex items-end gap-4">
              {/* Avatar Box */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#4B0B7A] to-[#7028B8] text-[#FFD52E] font-black text-2xl flex items-center justify-center border-4 border-white shadow-md">
                  {avatarInitials || 'AH'}
                </div>
                <span
                  className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#21865B] border-2 border-white shadow-xs"
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
                    {adminProfile.roleBadge || 'Content Admin'}
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

            {/* Quick Meta Info */}
            <div className="flex sm:flex-col items-start sm:items-end gap-1.5 text-xs text-[#786F7D] bg-[#FAF8FB] sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#21865B]" />
                <span>Login Terakhir: <span className="text-[#24172B] font-medium">{adminProfile.lastLogin}</span></span>
              </div>
            </div>
          </div>

          {bio && (
            <p className="text-xs sm:text-sm text-[#786F7D] bg-[#FAF8FB] border border-[#EEE8F0] p-3.5 rounded-xl leading-relaxed">
              &quot;{bio}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Main Grid: Data Diri Form & Ganti Kata Sandi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols): Informasi Akun Administrator */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                  Informasi Akun Administrator
                </h3>
                <p className="text-xs text-[#786F7D] mt-0.5">
                  Data ini disinkronkan langsung pada sidebar dan header navigasi admin.
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
          </form>
        </div>

        {/* Side Column (1 col): Ganti Kata Sandi */}
        <div>
          <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-[#EEE8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                  Ganti Kata Sandi
                </h3>
                <p className="text-xs text-[#786F7D] mt-0.5">
                  Perbarui kata sandi akun administrator.
                </p>
              </div>
              <KeyRound className="w-5 h-5 text-[#4B0B7A]" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Kata Sandi Saat Ini *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Kata sandi saat ini"
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

            {newPassword && (
              <div className="p-3 bg-[#FAF8FB] rounded-xl border border-[#EEE8F0] space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#786F7D]">Kekuatan:</span>
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

            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs"
              >
                <KeyRound className="w-4 h-4 text-[#FFD52E]" /> Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
