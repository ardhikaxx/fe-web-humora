'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Pagination } from '../../../components/ui/Pagination';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDate, formatRupiah, formatNumber } from '../../../lib/utils/formatters';
import { AdminSubscriber } from '../../../lib/types/admin';
import {
  Crown,
  User,
  Clock,
  Sparkles,
  CreditCard,
  X,
} from 'lucide-react';

export default function SubscribersPage() {
  const { subscribers } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedSubscriber, setSelectedSubscriber] = useState<AdminSubscriber | null>(null);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = sub.userName.toLowerCase().includes(q);
        const matchEmail = sub.userEmail.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (statusFilter !== 'all' && sub.status !== statusFilter) {
        return false;
      }
      if (planFilter !== 'all' && sub.planId !== planFilter) {
        return false;
      }
      return true;
    });
  }, [subscribers, searchQuery, statusFilter, planFilter]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage) || 1;
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = subscribers.filter((s) => s.status === 'active').length + 3275;
  const expiredCount = subscribers.filter((s) => s.status === 'expired').length + 410;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pelanggan Premium (Subscribers)"
        description="Kelola dan pantau data pelanggan aktif yang memiliki akses tanpa batas ke seluruh episode premium HUMORA."
        breadcrumbs={[{ label: 'Pelanggan Premium' }]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Subscriber Aktif"
          value={formatNumber(activeCount)}
          change={8.5}
          changeLabel="vs bln lalu"
          icon={<Crown className="w-5 h-5" />}
          iconBg="bg-[#F3E8FF]"
          iconColor="text-[#6B21A8]"
        />
        <StatCard
          title="Subscriber Kedaluwarsa"
          value={formatNumber(expiredCount)}
          subtitle="Perlu pengingat perpanjangan"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF5E8]"
          iconColor="text-[#E58A16]"
        />
        <StatCard
          title="Paket Terfavorit"
          value="Paket 3 Bulan"
          subtitle="57% dari seluruh subscriber"
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-[#FFF9E0]"
          iconColor="text-[#D97706]"
        />
        <StatCard
          title="Rata-rata Nilai"
          value="Rp56.400"
          subtitle="per transaksi langganan"
          icon={<CreditCard className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
      </div>

      {/* Filters and Search */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari nama atau email pelanggan..."
        hasActiveFilters={statusFilter !== 'all' || planFilter !== 'all' || !!searchQuery}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setPlanFilter('all');
          setCurrentPage(1);
        }}
      >
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Status</option>
          <option value="active">Premium Aktif</option>
          <option value="expired">Kedaluwarsa</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Paket</option>
          <option value="monthly">Paket Bulanan</option>
          <option value="quarterly">Paket 3 Bulan</option>
          <option value="annual">Paket Tahunan</option>
        </select>
      </SearchFilterBar>

      {/* Subscribers Table */}
      {filteredSubscribers.length === 0 ? (
        <EmptyState
          icon={<Crown className="w-7 h-7" />}
          title="Pelanggan Tidak Ditemukan"
          description="Tidak ada data langganan yang cocok dengan filter pencarian."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Paket Langganan</th>
                  <th className="py-3 px-4">Mulai Aktif</th>
                  <th className="py-3 px-4">Berakhir Pada</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4 text-right">Total Belanja</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {paginatedSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#FAF8FB] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] border border-[#EEE8F0] shrink-0 flex items-center justify-center text-[#6B21A8]">
                          <User className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#24172B] text-sm">{sub.userName}</p>
                          <span className="text-[10px] text-[#786F7D] font-mono">{sub.userEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F3E8FF] text-[#6B21A8]">
                        {sub.planName}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#786F7D]">
                      {formatDate(sub.startDate)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#24172B]">
                      {formatDate(sub.endDate)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge type="subscription" value={sub.status} />
                    </td>

                    <td className="py-3 px-4 text-[#786F7D] font-medium">
                      {sub.paymentMethod}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#24172B]">
                      {formatRupiah(sub.totalSpent)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedSubscriber(sub)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F6F1F8] text-[#4B0B7A] hover:bg-[#E9DEEF] transition-colors"
                      >
                        Detail
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
            totalItems={filteredSubscribers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Subscriber Detail Modal */}
      {selectedSubscriber && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <h3 className="text-base font-bold text-[#24172B]">Rincian Langganan</h3>
              <button
                onClick={() => setSelectedSubscriber(null)}
                className="p-1 text-[#786F7D] hover:text-[#24172B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8FB] border border-[#EEE8F0]">
              <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] border border-[#EEE8F0] shrink-0 flex items-center justify-center text-[#6B21A8] shadow-2xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#24172B]">{selectedSubscriber.userName}</h4>
                <p className="text-xs text-[#786F7D] font-mono">{selectedSubscriber.userEmail}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Paket Terdaftar:</span>
                <span className="font-bold text-[#4B0B7A]">{selectedSubscriber.planName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Status Akses:</span>
                <StatusBadge type="subscription" value={selectedSubscriber.status} />
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Masa Aktif:</span>
                <span className="font-semibold text-[#24172B]">
                  {formatDate(selectedSubscriber.startDate)} — {formatDate(selectedSubscriber.endDate)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Metode Pembayaran:</span>
                <span className="font-semibold text-[#24172B]">{selectedSubscriber.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#786F7D]">Perpanjangan Otomatis:</span>
                <span className="font-bold text-[#21865B]">
                  {selectedSubscriber.autoRenew ? 'Aktif (Auto-renew)' : 'Manual'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EEE8F0] flex justify-end">
              <button
                onClick={() => setSelectedSubscriber(null)}
                className="px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
