'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { AdminAccount } from '../../../lib/types/admin';
import {
  UserPlus,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  X,
  Users,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function AdminManagementPage() {
  const { admins, addAdmin, updateAdmin, deleteAdmin } = useAdmin();
  const { success, error: toastError, warning } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  // Password visibility map for table rows (key: admin id)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminAccount | null>(null);

  // Form states (Only 4 fields: Nama Lengkap, Email, Password, Nomor Telfon)
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Compute metrics
  const totalAdmins = admins.length;
  const primaryAdmins = admins.filter((a) => a.isPrimary).length;
  const secondaryAdmins = admins.filter((a) => !a.isPrimary).length;

  // Filtered list
  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return admins;
    const q = searchQuery.toLowerCase().trim();
    return admins.filter((adm) => {
      const matchName = adm.name.toLowerCase().includes(q);
      const matchEmail = adm.email.toLowerCase().includes(q);
      const matchPhone = adm.phone.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone;
    });
  }, [admins, searchQuery]);

  // Toggle table row password visibility
  const toggleRowPasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('admin123');
    setFormPhone('');
    setShowFormPassword(false);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (adm: AdminAccount) => {
    setEditingAdmin(adm);
    setFormName(adm.name);
    setFormEmail(adm.email);
    setFormPassword(adm.password || 'admin123');
    setFormPhone(adm.phone);
    setShowFormPassword(false);
    setFormError(null);
  };

  // Submit Create
  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim().toLowerCase();
    const trimmedPassword = formPassword.trim();
    const trimmedPhone = formPhone.trim();

    if (!trimmedName) {
      setFormError('Nama lengkap administrator wajib diisi.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Email administrator yang valid wajib diisi.');
      return;
    }

    if (!trimmedPassword || trimmedPassword.length < 4) {
      setFormError('Password minimal harus terdiri dari 4 karakter.');
      return;
    }

    if (!trimmedPhone) {
      setFormError('Nomor telfon administrator wajib diisi.');
      return;
    }

    // Check unique email
    const emailExists = admins.some((a) => a.email.toLowerCase() === trimmedEmail);
    if (emailExists) {
      setFormError(`Email "${trimmedEmail}" sudah terdaftar pada akun admin lain.`);
      return;
    }

    addAdmin({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      phone: trimmedPhone,
    });

    setIsCreateModalOpen(false);
    success('Admin Baru Ditambahkan', `${trimmedName} berhasil ditambahkan ke daftar admin.`);
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setFormError(null);

    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim().toLowerCase();
    const trimmedPassword = formPassword.trim();
    const trimmedPhone = formPhone.trim();

    if (!trimmedName) {
      setFormError('Nama lengkap administrator wajib diisi.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Email administrator yang valid wajib diisi.');
      return;
    }

    if (!trimmedPassword || trimmedPassword.length < 4) {
      setFormError('Password minimal harus terdiri dari 4 karakter.');
      return;
    }

    if (!trimmedPhone) {
      setFormError('Nomor telfon administrator wajib diisi.');
      return;
    }

    // Check unique email among others
    const emailExists = admins.some(
      (a) => a.id !== editingAdmin.id && a.email.toLowerCase() === trimmedEmail
    );
    if (emailExists) {
      setFormError(`Email "${trimmedEmail}" sudah dipakai oleh akun admin lain.`);
      return;
    }

    updateAdmin(editingAdmin.id, {
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      phone: trimmedPhone,
    });

    setEditingAdmin(null);
    success('Data Admin Diperbarui', `Informasi akun ${trimmedName} berhasil diperbarui.`);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = () => {
    if (!adminToDelete) return;

    if (adminToDelete.isPrimary) {
      warning('Akses Terlindungi', 'Akun admin pertama tidak dapat dihapus.');
      setAdminToDelete(null);
      return;
    }

    const deleted = deleteAdmin(adminToDelete.id);
    if (deleted) {
      success('Admin Dihapus', `Data admin ${adminToDelete.name} telah berhasil dihapus.`);
    } else {
      toastError('Gagal Menghapus', 'Admin tidak dapat dihapus.');
    }
    setAdminToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Kelola Tim Admin"
        description="Kelola akun administrator HUMORA. Data yang dikelola meliputi Nama Lengkap, Email, Password, dan Nomor Telfon."
        breadcrumbs={[{ label: 'Sistem' }, { label: 'Kelola Admin' }]}
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4B0B7A]/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#FFD52E]" />
            <span>+ Tambah Admin Baru</span>
          </button>
        }
      />

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Admin"
          value={String(totalAdmins)}
          subtitle="Seluruh akun terdaftar"
          icon={<Users className="w-5 h-5 text-[#4B0B7A]" />}
        />
        <StatCard
          title="Admin Pertama (Utama)"
          value={String(primaryAdmins)}
          subtitle="Akun pengelola pertama"
          icon={<ShieldCheck className="w-5 h-5 text-[#21865B]" />}
        />
        <StatCard
          title="Admin Tambahan"
          value={String(secondaryAdmins)}
          subtitle="Admin baru yang ditambahkan"
          icon={<UserPlus className="w-5 h-5 text-[#2563EB]" />}
        />
      </div>

      {/* Search Bar */}
      <SearchFilterBar
        searchPlaceholder="Cari berdasarkan nama lengkap, email, atau nomor telfon..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={Boolean(searchQuery)}
        onResetFilters={() => setSearchQuery('')}
      />

      {/* Admin List Table */}
      <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
        {filteredAdmins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EEE8F0] bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Nama Lengkap</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Password</th>
                  <th className="py-3.5 px-4">Nomor Telfon</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0] text-xs">
                {filteredAdmins.map((adm) => {
                  const isPassVisible = Boolean(visiblePasswords[adm.id]);

                  return (
                    <tr key={adm.id} className="hover:bg-[#FAF8FB] transition-colors">
                      {/* 1. Nama Lengkap */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4B0B7A] to-[#7028B8] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                            {adm.avatarInitials || 'AD'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#24172B] truncate">{adm.name}</span>
                              {adm.isPrimary && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3E8FF] text-[#6B21A8]">
                                  Admin Pertama
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-[#24172B]">
                          <Mail className="w-3.5 h-3.5 text-[#786F7D] shrink-0" />
                          <span className="truncate">{adm.email}</span>
                        </div>
                      </td>

                      {/* 3. Password */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-2 bg-[#F8F7FA] px-2.5 py-1 rounded-lg border border-[#EEE8F0]">
                          <Lock className="w-3.5 h-3.5 text-[#786F7D] shrink-0" />
                          <span className="font-mono text-xs text-[#24172B]">
                            {isPassVisible ? adm.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRowPasswordVisibility(adm.id)}
                            className="text-[#786F7D] hover:text-[#24172B] p-0.5 transition-colors"
                            title={isPassVisible ? 'Sembunyikan password' : 'Lihat password'}
                          >
                            {isPassVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 4. Nomor Telfon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-[#24172B]">
                          <Phone className="w-3.5 h-3.5 text-[#786F7D] shrink-0" />
                          <span>{adm.phone}</span>
                        </div>
                      </td>

                      {/* Aksi: Edit & Hapus */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(adm)}
                            className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#4B0B7A] hover:bg-[#F6F1F8] transition-colors"
                            title="Edit Data Admin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (adm.isPrimary) {
                                warning('Akses Terlindungi', 'Akun admin pertama tidak dapat dihapus.');
                                return;
                              }
                              setAdminToDelete(adm);
                            }}
                            disabled={adm.isPrimary}
                            className={`p-1.5 rounded-lg transition-colors ${
                              adm.isPrimary
                                ? 'text-zinc-300 cursor-not-allowed'
                                : 'text-[#786F7D] hover:text-[#D94152] hover:bg-[#FEECEF]'
                            }`}
                            title={adm.isPrimary ? 'Admin pertama tidak bisa dihapus' : 'Hapus Admin'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Tidak Ada Data Admin Ditemukan"
            description="Tidak ada administrator yang cocok dengan pencarian."
            actionLabel="Reset Pencarian"
            onAction={() => setSearchQuery('')}
          />
        )}
      </div>

      {/* Modal: Tambah Admin Baru (Hanya 4 Input: Nama Lengkap, Email, Password, Nomor Telfon) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EEE8F0] animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-[#EEE8F0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F3E8FF] text-[#4B0B7A]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#24172B]">Tambah Admin Baru</h3>
                  <p className="text-xs text-[#786F7D]">Lengkapi 4 data administrator berikut.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#786F7D] hover:bg-[#F6F1F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-[#FEECEF] border border-[#FCD0D7] flex items-center gap-2 text-xs text-[#D94152]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCreate} className="mt-4 space-y-3.5">
              {/* 1. Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] transition-all"
                  required
                />
              </div>

              {/* 2. Email */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="budi@humora.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] transition-all"
                  required
                />
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#786F7D] hover:text-[#24172B]"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 4. Nomor Telfon */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Nomor Telfon *</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] transition-all"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EEE8F0] text-xs font-bold text-[#786F7D] hover:bg-[#FAF8FB]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-white text-xs font-bold shadow-md shadow-[#4B0B7A]/20 transition-all cursor-pointer"
                >
                  Simpan Admin Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Admin (Hanya 4 Input: Nama Lengkap, Email, Password, Nomor Telfon) */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EEE8F0] animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-[#EEE8F0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F3E8FF] text-[#4B0B7A]">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#24172B]">Edit Data Admin</h3>
                  <p className="text-xs text-[#786F7D]">Ubah data {editingAdmin.name}.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="p-1 rounded-lg text-[#786F7D] hover:bg-[#F6F1F8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-[#FEECEF] border border-[#FCD0D7] flex items-center gap-2 text-xs text-[#D94152]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              {/* 1. Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] transition-all"
                  required
                />
              </div>

              {/* 2. Email */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] transition-all"
                  required
                />
              </div>

              {/* 3. Password */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#786F7D] hover:text-[#24172B]"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 4. Nomor Telfon */}
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Nomor Telfon *</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] transition-all"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#EEE8F0] text-xs font-bold text-[#786F7D] hover:bg-[#FAF8FB]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4B0B7A] hover:bg-[#3B0762] text-white text-xs font-bold shadow-md shadow-[#4B0B7A]/20 transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Hapus Admin */}
      <ConfirmDialog
        isOpen={!!adminToDelete}
        title="Hapus Data Admin?"
        message={`Tindakan ini akan menghapus akun administrator ${adminToDelete?.name} (${adminToDelete?.email}). Akun ini tidak akan dapat digunakan lagi.`}
        confirmLabel="Ya, Hapus Admin"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAdminToDelete(null)}
      />
    </div>
  );
}
