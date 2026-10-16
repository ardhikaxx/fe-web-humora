'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { AdminAccount, AdminRole } from '../../../lib/types/admin';
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function AdminManagementPage() {
  const { admins, addAdmin, updateAdmin, deleteAdmin, toggleAdminStatus } = useAdmin();
  const { success, error: toastError, warning } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminAccount | null>(null);

  // Create Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('Content Admin');
  const [formDepartment, setFormDepartment] = useState('Video Editorial & Metadata');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);

  // Compute metrics
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((a) => a.status === 'active').length;
  const superAdmins = admins.filter((a) => a.role === 'Super Administrator').length;
  const operationalAdmins = admins.filter((a) => a.role !== 'Super Administrator').length;

  // Filtered List
  const filteredAdmins = useMemo(() => {
    return admins.filter((adm) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = adm.name.toLowerCase().includes(q);
        const matchEmail = adm.email.toLowerCase().includes(q);
        const matchUsername = adm.username.toLowerCase().includes(q);
        const matchDept = adm.department.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchUsername && !matchDept) return false;
      }

      if (roleFilter !== 'all' && adm.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== 'all' && adm.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [admins, searchQuery, roleFilter, statusFilter]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Content Admin');
    setFormDepartment('Video Editorial & Metadata');
    setFormStatus('active');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (adm: AdminAccount) => {
    setEditingAdmin(adm);
    setFormName(adm.name);
    setFormUsername(adm.username);
    setFormEmail(adm.email);
    setFormPhone(adm.phone);
    setFormRole(adm.role);
    setFormDepartment(adm.department);
    setFormStatus(adm.status);
    setFormError(null);
  };

  // Auto-fill department based on selected role
  const handleRoleChange = (selectedRole: AdminRole) => {
    setFormRole(selectedRole);
    if (selectedRole === 'Super Administrator') {
      setFormDepartment('Platform Governance & System Operations');
    } else if (selectedRole === 'Content Admin') {
      setFormDepartment('Video Editorial & Metadata');
    } else if (selectedRole === 'Finance Admin') {
      setFormDepartment('Revenue & Transaction Verification');
    } else if (selectedRole === 'Support Admin') {
      setFormDepartment('Audience & Subscriber Care');
    }
  };

  // Submit Create Admin
  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim().toLowerCase();
    const trimmedUsername = formUsername.trim().toLowerCase() || trimmedEmail.split('@')[0];

    if (!trimmedName) {
      setFormError('Nama administrator wajib diisi.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Alamat email valid wajib diisi.');
      return;
    }

    // Check email uniqueness
    const emailExists = admins.some((a) => a.email.toLowerCase() === trimmedEmail);
    if (emailExists) {
      setFormError(`Email "${trimmedEmail}" sudah terdaftar pada akun administrator lain.`);
      return;
    }

    const roleBadgeMap: Record<AdminRole, string> = {
      'Super Administrator': 'Super Admin',
      'Content Admin': 'Editor Konten',
      'Finance Admin': 'Billing & Finance',
      'Support Admin': 'Layanan Pelanggan',
    };

    addAdmin({
      name: trimmedName,
      username: trimmedUsername,
      email: trimmedEmail,
      phone: formPhone.trim() || '+62 812-0000-0000',
      role: formRole,
      roleBadge: roleBadgeMap[formRole] || 'Admin',
      department: formDepartment.trim() || 'Content Operations',
      status: formStatus,
    });

    setIsCreateModalOpen(false);
    success('Admin Baru Ditambahkan', `${trimmedName} telah berhasil didaftarkan sebagai administrator.`);
  };

  // Submit Edit Admin
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setFormError(null);

    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim().toLowerCase();
    const trimmedUsername = formUsername.trim().toLowerCase() || trimmedEmail.split('@')[0];

    if (!trimmedName) {
      setFormError('Nama administrator wajib diisi.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Alamat email valid wajib diisi.');
      return;
    }

    // Check email uniqueness among other admins
    const emailExists = admins.some((a) => a.id !== editingAdmin.id && a.email.toLowerCase() === trimmedEmail);
    if (emailExists) {
      setFormError(`Email "${trimmedEmail}" sudah dipakai oleh akun admin lain.`);
      return;
    }

    const roleBadgeMap: Record<AdminRole, string> = {
      'Super Administrator': 'Super Admin',
      'Content Admin': 'Editor Konten',
      'Finance Admin': 'Billing & Finance',
      'Support Admin': 'Layanan Pelanggan',
    };

    updateAdmin(editingAdmin.id, {
      name: trimmedName,
      username: trimmedUsername,
      email: trimmedEmail,
      phone: formPhone.trim() || editingAdmin.phone,
      role: formRole,
      roleBadge: roleBadgeMap[formRole] || editingAdmin.roleBadge,
      department: formDepartment.trim() || editingAdmin.department,
      status: editingAdmin.isPrimary ? 'active' : formStatus,
    });

    setEditingAdmin(null);
    success('Data Admin Diperbarui', `Informasi akun ${trimmedName} berhasil disimpan.`);
  };

  // Handle Delete
  const handleDeleteConfirm = () => {
    if (!adminToDelete) return;

    if (adminToDelete.isPrimary) {
      warning('Akses Dibatasi', 'Akun admin pertama (utama) tidak dapat dihapus.');
      setAdminToDelete(null);
      return;
    }

    const deleted = deleteAdmin(adminToDelete.id);
    if (deleted) {
      success('Admin Dihapus', `Akun administrator ${adminToDelete.name} telah dihapus dari sistem.`);
    } else {
      toastError('Gagal Menghapus', 'Akun admin tidak dapat dihapus.');
    }
    setAdminToDelete(null);
  };

  // Helper for role badge color
  const getRoleBadgeClasses = (role: AdminRole) => {
    switch (role) {
      case 'Super Administrator':
        return 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]';
      case 'Content Admin':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]';
      case 'Finance Admin':
        return 'bg-[#EAF8F1] text-[#166534] border-[#BBF7D0]';
      case 'Support Admin':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]';
      default:
        return 'bg-[#F8F7FA] text-[#24172B] border-[#EEE8F0]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Kelola Tim Admin"
        description="Kelola hak akses dan staf administrator portal HUMORA. Anda dapat menambahkan admin baru selain akun pengelola utama."
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Administrator"
          value={String(totalAdmins)}
          subtitle="Seluruh staf terdaftar"
          icon={<ShieldCheck className="w-5 h-5 text-[#4B0B7A]" />}
        />
        <StatCard
          title="Admin Aktif"
          value={String(activeAdmins)}
          subtitle="Memiliki akses login"
          icon={<CheckCircle2 className="w-5 h-5 text-[#21865B]" />}
        />
        <StatCard
          title="Super Administrator"
          value={String(superAdmins)}
          subtitle="Akses penuh sistem"
          icon={<Sparkles className="w-5 h-5 text-[#E58A16]" />}
        />
        <StatCard
          title="Admin Operasional"
          value={String(operationalAdmins)}
          subtitle="Konten, finance & support"
          icon={<Building className="w-5 h-5 text-[#2563EB]" />}
        />
      </div>

      {/* Search and Filter Bar */}
      <SearchFilterBar
        searchPlaceholder="Cari nama, email, username, atau divisi admin..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={roleFilter !== 'all' || statusFilter !== 'all'}
        onResetFilters={() => {
          setSearchQuery('');
          setRoleFilter('all');
          setStatusFilter('all');
        }}
      >
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs text-[#24172B] focus:bg-white focus:outline-hidden font-medium"
        >
          <option value="all">Semua Peran</option>
          <option value="Super Administrator">Super Administrator</option>
          <option value="Content Admin">Content Admin</option>
          <option value="Finance Admin">Finance Admin</option>
          <option value="Support Admin">Support Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs text-[#24172B] focus:bg-white focus:outline-hidden font-medium"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </SearchFilterBar>

      {/* Admin List Table */}
      <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
        {filteredAdmins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EEE8F0] bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                  <th className="py-3.5 px-4">Kontak Resmi</th>
                  <th className="py-3.5 px-4">Hak Akses & Divisi</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Terakhir Masuk</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0] text-xs">
                {filteredAdmins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-[#FAF8FB] transition-colors">
                    {/* Admin Name & Avatar */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4B0B7A] to-[#7028B8] text-white font-bold text-xs flex items-center justify-center shadow-xs border border-white">
                            {adm.avatarInitials || 'AD'}
                          </div>
                          {adm.isPrimary && (
                            <span
                              className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD52E] text-[#24172B] rounded-full flex items-center justify-center shadow-2xs text-[9px] font-black"
                              title="Admin Utama Pertama"
                            >
                              ★
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#24172B] truncate">{adm.name}</span>
                            {adm.isPrimary && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#F3E8FF] text-[#6B21A8]">
                                Admin Utama
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#786F7D] font-mono mt-0.5">@{adm.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <p className="font-medium text-[#24172B] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#786F7D] shrink-0" />
                          <span className="truncate">{adm.email}</span>
                        </p>
                        <p className="text-[11px] text-[#786F7D] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#786F7D] shrink-0" />
                          <span>{adm.phone}</span>
                        </p>
                      </div>
                    </td>

                    {/* Role & Department */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeClasses(
                            adm.role
                          )}`}
                        >
                          {adm.role}
                        </span>
                        <p className="text-[11px] text-[#786F7D] mt-1 flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#786F7D] shrink-0" />
                          <span className="truncate">{adm.department}</span>
                        </p>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (adm.isPrimary) {
                            warning('Status Terkunci', 'Admin pertama tidak dapat dinonaktifkan.');
                            return;
                          }
                          toggleAdminStatus(adm.id);
                          success(
                            'Status Diubah',
                            `Status ${adm.name} diubah menjadi ${adm.status === 'active' ? 'Nonaktif' : 'Aktif'}.`
                          );
                        }}
                        disabled={adm.isPrimary}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          adm.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                        } ${adm.isPrimary ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            adm.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'
                          }`}
                        />
                        <span>{adm.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 text-[#786F7D] text-[11px] font-medium">
                      {adm.lastLogin}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(adm)}
                          className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#4B0B7A] hover:bg-[#F6F1F8] transition-colors"
                          title="Edit Admin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (adm.isPrimary) {
                              warning('Akses Terkunci', 'Admin utama pertama tidak dapat dihapus.');
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Tidak Ada Administrator Ditemukan"
            description="Tidak ada data staf admin yang cocok dengan kriteria pencarian atau filter yang dipilih."
            actionLabel="Reset Filter"
            onAction={() => {
              setSearchQuery('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
          />
        )}
      </div>

      {/* Modal: Tambah Admin Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#EEE8F0] animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between pb-3 border-b border-[#EEE8F0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F3E8FF] text-[#4B0B7A]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#24172B]">Tambah Administrator Baru</h3>
                  <p className="text-xs text-[#786F7D]">Daftarkan staf baru untuk mengelola platform HUMORA.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#786F7D] hover:bg-[#F6F1F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-[#FEECEF] border border-[#FCD0D7] flex items-center gap-2 text-xs text-[#D94152]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Nama Lengkap Admin *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!formUsername) {
                      setFormUsername(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '_')
                          .slice(0, 15)
                      );
                    }
                  }}
                  placeholder="Contoh: Dimas Setiawan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#24172B] mb-1">Username Login *</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="dimas_admin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#24172B] mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Email Resmi Administrator *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="dimas@humora.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#24172B] mb-1">Hak Akses / Peran *</label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                  >
                    <option value="Content Admin">Content Admin (Kelola Video & Judul)</option>
                    <option value="Finance Admin">Finance Admin (Verifikasi Transaksi)</option>
                    <option value="Support Admin">Support Admin (Layanan Audiens)</option>
                    <option value="Super Administrator">Super Administrator (Akses Penuh)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#24172B] mb-1">Status Awal</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                  >
                    <option value="active">Aktif (Langsung Bisa Login)</option>
                    <option value="inactive">Nonaktif (Akses Ditahan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Divisi / Departemen</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="Video Editorial & Metadata"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8FB] border border-[#EEE8F0] text-[11px] text-[#786F7D] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#4B0B7A] shrink-0" />
                <span>Kata sandi bawaan awal adalah <strong>admin123</strong>. Admin dapat mengubahnya kapan saja.</span>
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

      {/* Modal: Edit Admin */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#EEE8F0] animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between pb-3 border-b border-[#EEE8F0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#F3E8FF] text-[#4B0B7A]">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#24172B]">Edit Administrator</h3>
                  <p className="text-xs text-[#786F7D]">Perbarui data profil dan hak akses {editingAdmin.name}.</p>
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
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Nama Lengkap Admin *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#24172B] mb-1">Username Login *</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#24172B] mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Email Resmi Administrator *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#24172B] mb-1">Hak Akses / Peran *</label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                    disabled={editingAdmin.isPrimary}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] disabled:opacity-70"
                  >
                    <option value="Content Admin">Content Admin</option>
                    <option value="Finance Admin">Finance Admin</option>
                    <option value="Support Admin">Support Admin</option>
                    <option value="Super Administrator">Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#24172B] mb-1">Status Akun</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    disabled={editingAdmin.isPrimary}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A] disabled:opacity-70"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172B] mb-1">Divisi / Departemen</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEE8F0] text-xs sm:text-sm bg-[#FAF8FB] focus:bg-white focus:outline-hidden focus:border-[#4B0B7A]"
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
        title="Hapus Hak Akses Admin?"
        message={`Tindakan ini akan mencabut akses ${adminToDelete?.name} (${adminToDelete?.email}) dari portal administrator HUMORA. Akun ini tidak akan dapat login kembali.`}
        confirmLabel="Ya, Hapus Admin"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setAdminToDelete(null)}
      />
    </div>
  );
}
