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
  Save,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

export default function AdminProfilePage() {
  const { adminProfile, updateAdminProfile, admins, updateAdmin } = useAdmin();
  const { success, error: toastError } = useToast();

  // Form states: Nama Lengkap, Email, Nomor Telfon
  const [name, setName] = useState(adminProfile.name || 'Admin HUMORA');
  const [email, setEmail] = useState(adminProfile.email || 'admin@humora.id');
  const [phone, setPhone] = useState(adminProfile.phone || '0812-8899-7711');
  const [avatarInitials, setAvatarInitials] = useState(adminProfile.avatarInitials || 'AH');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      toastError('Validasi Gagal', 'Nama lengkap administrator tidak boleh kosong.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toastError('Validasi Gagal', 'Alamat email administrator tidak valid.');
      return;
    }
    if (!phone.trim()) {
      toastError('Validasi Gagal', 'Nomor telfon administrator tidak boleh kosong.');
      return;
    }

    const calculatedInitials = avatarInitials.trim().toUpperCase() || 'AH';

    // 1. Update general admin profile state
    updateAdminProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      avatarInitials: calculatedInitials,
    });

    // 2. Sync with primary admin in admins list
    const primaryAdmin = (admins || []).find((a) => a.isPrimary);
    if (primaryAdmin) {
      updateAdmin(primaryAdmin.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        avatarInitials: calculatedInitials,
      });
    }

    success(
      'Profil Admin Diperbarui',
      'Data Nama Lengkap, Email, dan Nomor Telfon berhasil disimpan.'
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toastError('Kata Sandi Kosong', 'Harap masukkan kata sandi saat ini.');
      return;
    }
    if (newPassword.length < 4) {
      toastError('Kata Sandi Kurang', 'Kata sandi baru minimal harus 4 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Konfirmasi Tidak Cocok', 'Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    // Sync new password to primary admin in admins list
    const primaryAdmin = (admins || []).find((a) => a.isPrimary);
    if (primaryAdmin) {
      updateAdmin(primaryAdmin.id, {
        password: newPassword,
      });
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    success(
      'Kata Sandi Diperbarui',
      'Kata sandi akun administrator berhasil diperbarui.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Profil Admin & Akun Pengelola"
        description="Kelola informasi akun administrator HUMORA: Nama Lengkap, Email, Password, dan Nomor Telfon."
        breadcrumbs={[{ label: 'Profil Admin' }]}
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bento Cell 1 (Span 3 cols): Profile Overview Hero Card */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-[#EEE8F0] p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col justify-between gap-5 transition-all hover:border-[#D8B4FE]/70">
          {/* Subtle Ambient Glow Decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#F3E8FF]/60 via-[#FAF5FF]/30 to-transparent pointer-events-none rounded-full blur-2xl" />

          {/* Profile Identity Row */}
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar Box */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#4B0B7A] via-[#5C0E99] to-[#7028B8] text-[#FFD52E] font-black text-2xl flex items-center justify-center shadow-md ring-4 ring-[#F6F1F8]">
                {avatarInitials || 'AH'}
              </div>
            </div>

            {/* Profile Info: Nama Lengkap, Email, Nomor Telfon */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-[#24172B] tracking-tight">
                {name || 'Admin HUMORA'}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#786F7D] font-medium pt-1">
                <span className="flex items-center gap-1.5 text-[#24172B] font-semibold">
                  <Mail className="w-3.5 h-3.5 text-[#4B0B7A]" />
                  <span>{email || 'admin@humora.id'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-[#24172B] font-semibold">
                  <Phone className="w-3.5 h-3.5 text-[#4B0B7A]" />
                  <span>{phone || '0812-8899-7711'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Cell 2 (Span 2 cols): Form Edit 3 Data: Nama Lengkap, Email, Nomor Telfon */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EEE8F0] shadow-xs space-y-5 transition-all hover:border-[#D8B4FE]/70"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                  Data Profil Administrator
                </h3>
                <p className="text-xs text-[#786F7D] mt-0.5">
                  Perbarui Nama Lengkap, Email, dan Nomor Telfon akun Anda.
                </p>
              </div>
              <User className="w-5 h-5 text-[#4B0B7A]" />
            </div>

            <div className="space-y-4">
              {/* 1. Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: Admin HUMORA"
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-hidden focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                    required
                  />
                  <User className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-3" />
                </div>
              </div>

              {/* 2. Email */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: admin@humora.id"
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-hidden focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                    required
                  />
                  <Mail className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-3" />
                </div>
              </div>

              {/* 3. Nomor Telfon */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                  Nomor Telfon *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 0812-8899-7711"
                    className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24172B] focus:outline-hidden focus:border-[#4B0B7A] focus:bg-white transition-all pl-10"
                    required
                  />
                  <Phone className="w-4 h-4 text-[#786F7D] absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#FFD52E]" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bento Cell 3 (Span 1 col): Form Ubah Password */}
        <div>
          <form
            onSubmit={handleChangePassword}
            className="bg-white p-6 rounded-3xl border border-[#EEE8F0] shadow-xs space-y-4 transition-all hover:border-[#D8B4FE]/70"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#24172B] uppercase tracking-wider">
                  Password Akun
                </h3>
                <p className="text-xs text-[#786F7D] mt-0.5">
                  Perbarui kata sandi login admin Anda.
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
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Kata sandi saat ini"
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-medium text-[#24172B] focus:outline-hidden focus:border-[#4B0B7A] focus:bg-white transition-all pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3 text-[#786F7D] hover:text-[#24172B]"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Kata Sandi Baru *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-medium text-[#24172B] focus:outline-hidden focus:border-[#4B0B7A] focus:bg-white transition-all pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-[#786F7D] hover:text-[#24172B]"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24172B] uppercase tracking-wide mb-1.5">
                Konfirmasi Kata Sandi Baru *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-4 py-2.5 text-sm font-medium text-[#24172B] focus:outline-hidden focus:border-[#4B0B7A] focus:bg-white transition-all pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-[#786F7D] hover:text-[#24172B]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#FFD52E]" />
                <span>Perbarui Kata Sandi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
