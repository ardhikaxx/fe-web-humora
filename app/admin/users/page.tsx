'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Pagination } from '../../../components/ui/Pagination';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';
import { formatDate, formatDateTime, formatNumber } from '../../../lib/utils/formatters';
import { AdminUser } from '../../../lib/types/admin';
import {
  Users,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Crown,
  Calendar,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function UsersPage() {
  const { users, updateUserStatus } = useAdmin();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [accountStatusFilter, setAccountStatusFilter] = useState('all');
  const [subStatusFilter, setSubStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Detail Modal / Drawer
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Status toggle confirmation
  const [userToToggleStatus, setUserToToggleStatus] = useState<AdminUser | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (accountStatusFilter !== 'all' && u.status !== accountStatusFilter) {
        return false;
      }
      if (subStatusFilter !== 'all' && u.subscriptionStatus !== subStatusFilter) {
        return false;
      }
      return true;
    });
  }, [users, searchQuery, accountStatusFilter, subStatusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = users.filter((u) => u.status === 'active').length;
  const premiumCount = users.filter((u) => u.subscriptionStatus === 'premium').length;

  const handleToggleStatusConfirm = () => {
    if (userToToggleStatus) {
      const nextStatus = userToToggleStatus.status === 'active' ? 'suspended' : 'active';
      updateUserStatus(userToToggleStatus.id, nextStatus);
      success(
        'Status Pengguna Diperbarui',
        `Akun ${userToToggleStatus.name} kini berstatus ${nextStatus === 'active' ? 'Aktif' : 'Ditangguhkan'}.`
      );
      if (selectedUser?.id === userToToggleStatus.id) {
        setSelectedUser({ ...userToToggleStatus, status: nextStatus });
      }
      setUserToToggleStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Pengguna Aplikasi"
        description="Pantau ringkasan profil pengguna demo aplikasi mobile HUMORA, riwayat tontonan, dan status akun."
        breadcrumbs={[{ label: 'Pengguna' }]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Pengguna"
          value="24.850"
          subtitle="Data simulasi terdaftar"
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-[#F6F1F8]"
          iconColor="text-[#4B0B7A]"
        />
        <StatCard
          title="Pengguna Aktif"
          value="18.920"
          change={12.4}
          changeLabel="aktif bln ini"
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
        <StatCard
          title="Pengguna Baru"
          value="3.410"
          change={8.2}
          changeLabel="vs bln lalu"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF5E8]"
          iconColor="text-[#E58A16]"
        />
        <StatCard
          title="Pelanggan Premium"
          value={formatNumber(premiumCount + 3270)}
          subtitle="Memiliki akses penuh"
          icon={<Crown className="w-5 h-5" />}
          iconBg="bg-[#F3E8FF]"
          iconColor="text-[#6B21A8]"
        />
      </div>

      {/* Filters and Search */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari nama atau email pengguna demo..."
        hasActiveFilters={accountStatusFilter !== 'all' || subStatusFilter !== 'all' || !!searchQuery}
        onResetFilters={() => {
          setSearchQuery('');
          setAccountStatusFilter('all');
          setSubStatusFilter('all');
          setCurrentPage(1);
        }}
      >
        <select
          value={accountStatusFilter}
          onChange={(e) => {
            setAccountStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Status Akun</option>
          <option value="active">Aktif</option>
          <option value="suspended">Ditangguhkan</option>
        </select>

        <select
          value={subStatusFilter}
          onChange={(e) => {
            setSubStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Langganan</option>
          <option value="free">Akun Gratis</option>
          <option value="premium">Premium</option>
          <option value="expired">Expired</option>
        </select>
      </SearchFilterBar>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title="Pengguna Tidak Ditemukan"
          description="Tidak ada profil pengguna yang cocok dengan filter pencarian."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Kontak Tersamar</th>
                  <th className="py-3 px-4">Bergabung</th>
                  <th className="py-3 px-4 text-center">Status Akun</th>
                  <th className="py-3 px-4 text-center">Subscription</th>
                  <th className="py-3 px-4 text-right">Ditonton</th>
                  <th className="py-3 px-4">Aktivitas Terakhir</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF8FB] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-[#EEE8F0]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-[#24172B] text-sm">{u.name}</p>
                          <span className="text-[10px] text-[#786F7D]">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#786F7D]">
                      <p>{u.email}</p>
                      <span className="text-[10px]">{u.phone}</span>
                    </td>

                    <td className="py-3 px-4 text-[#786F7D]">
                      {formatDate(u.joinedDate)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge type="account" value={u.status} />
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge type="subscription" value={u.subscriptionStatus} />
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#24172B]">
                      {u.episodesWatched} Ep ({u.totalWatchHours} jam)
                    </td>

                    <td className="py-3 px-4 text-[#786F7D]">
                      {formatDateTime(u.lastActiveAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F6F1F8] text-[#4B0B7A] hover:bg-[#E9DEEF] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <h3 className="text-base font-bold text-[#24172B]">Detail Pengguna Demo</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-[#786F7D] hover:text-[#24172B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF8FB] border border-[#EEE8F0]">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black/10 shrink-0 border border-[#EEE8F0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-[#24172B] truncate">{selectedUser.name}</h4>
                  <StatusBadge type="account" value={selectedUser.status} />
                </div>
                <p className="text-xs text-[#786F7D] font-mono mt-0.5">{selectedUser.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge type="subscription" value={selectedUser.subscriptionStatus} />
                  <span className="text-[11px] text-[#786F7D]">
                    Bergabung: {formatDate(selectedUser.joinedDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F7FA] border border-[#EEE8F0]">
                <span className="text-[11px] text-[#786F7D]">Total Episode Ditonton</span>
                <p className="text-lg font-black text-[#24172B] mt-0.5">
                  {selectedUser.episodesWatched} Episode
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8F7FA] border border-[#EEE8F0]">
                <span className="text-[11px] text-[#786F7D]">Total Durasi Tonton</span>
                <p className="text-lg font-black text-[#4B0B7A] mt-0.5">
                  {selectedUser.totalWatchHours} Jam
                </p>
              </div>
            </div>

            {/* Watch History */}
            <div>
              <h5 className="text-xs font-bold text-[#24172B] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-[#4B0B7A]" /> Riwayat Tontonan Terakhir
              </h5>

              {selectedUser.watchHistory.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F8F7FA] text-center text-xs text-[#786F7D]">
                  Belum ada riwayat tontonan tersimpan untuk pengguna ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {selectedUser.watchHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#F8F7FA] border border-[#EEE8F0] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-10 rounded-md overflow-hidden bg-black/10 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.seriesPoster} alt={item.seriesTitle} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#24172B] truncate">{item.seriesTitle}</p>
                          <p className="text-[11px] text-[#786F7D]">
                            Ep {item.episodeNumber}: {item.episodeTitle}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded font-bold bg-[#EAF8F1] text-[#21865B] text-[10px]">
                        {item.progressPercent}% Selesai
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#EEE8F0] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setUserToToggleStatus(selectedUser)}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                  selectedUser.status === 'active'
                    ? 'text-[#D94152] bg-[#FEECEF] hover:bg-[#FCD8DF]'
                    : 'text-[#21865B] bg-[#EAF8F1] hover:bg-[#D5EFE2]'
                }`}
              >
                {selectedUser.status === 'active' ? 'Tangguhkan Akun' : 'Aktifkan Kembali'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Toggle Confirmation */}
      <ConfirmDialog
        isOpen={!!userToToggleStatus}
        title={
          userToToggleStatus?.status === 'active'
            ? `Tangguhkan Akun ${userToToggleStatus?.name}?`
            : `Aktifkan Kembali Akun ${userToToggleStatus?.name}?`
        }
        message={
          userToToggleStatus?.status === 'active'
            ? 'Akun yang ditangguhkan tidak akan dapat mengakses konten premium pada simulasi aplikasi mobile.'
            : 'Akun akan diaktifkan kembali dengan hak akses normal.'
        }
        confirmLabel={userToToggleStatus?.status === 'active' ? 'Ya, Tangguhkan' : 'Ya, Aktifkan'}
        cancelLabel="Batal"
        variant={userToToggleStatus?.status === 'active' ? 'danger' : 'info'}
        onConfirm={handleToggleStatusConfirm}
        onCancel={() => setUserToToggleStatus(null)}
      />
    </div>
  );
}
