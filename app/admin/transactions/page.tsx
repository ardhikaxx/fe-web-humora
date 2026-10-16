'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../lib/context/AdminContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Pagination } from '../../../components/ui/Pagination';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDateTime, formatRupiah, formatNumber } from '../../../lib/utils/formatters';
import { AdminTransaction } from '../../../lib/types/admin';
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';

export default function TransactionsPage() {
  const { transactions } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedTx, setSelectedTx] = useState<AdminTransaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = tx.id.toLowerCase().includes(q);
        const matchName = tx.userName.toLowerCase().includes(q);
        if (!matchId && !matchName) return false;
      }
      if (statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }
      if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, searchQuery, statusFilter, methodFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalSuccessAmount = transactions
    .filter((t) => t.status === 'success')
    .reduce((acc, t) => acc + t.total, 0) + 48450000;

  const successCount = transactions.filter((t) => t.status === 'success').length + 840;
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const failedCount = transactions.filter((t) => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat Transaksi (Simulasi)"
        description="Pantau seluruh transaksi pembayaran paket langganan demo HUMORA melalui berbagai kanal pembayaran."
        breadcrumbs={[{ label: 'Transaksi' }]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(totalSuccessAmount)}
          change={14.2}
          changeLabel="vs bln lalu"
          icon={<Receipt className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
        <StatCard
          title="Transaksi Berhasil"
          value={formatNumber(successCount)}
          subtitle="96.2% tingkat sukses"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-[#EAF8F1]"
          iconColor="text-[#21865B]"
        />
        <StatCard
          title="Menunggu Bayar"
          value={pendingCount.toString()}
          subtitle="Dalam batas waktu VA/QRIS"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-[#FFF5E8]"
          iconColor="text-[#E58A16]"
        />
        <StatCard
          title="Dibatalkan / Gagal"
          value={failedCount.toString()}
          subtitle="Kedaluwarsa atau dibatalkan"
          icon={<AlertCircle className="w-5 h-5" />}
          iconBg="bg-[#FEECEF]"
          iconColor="text-[#D94152]"
        />
      </div>

      {/* Filter and Search */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Cari ID transaksi (misal: TRX-2026) atau nama pengguna..."
        hasActiveFilters={statusFilter !== 'all' || methodFilter !== 'all' || !!searchQuery}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setMethodFilter('all');
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
          <option value="success">Berhasil</option>
          <option value="pending">Menunggu</option>
          <option value="failed">Gagal</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F8F7FA] border border-[#EEE8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#24172B] focus:outline-hidden"
        >
          <option value="all">Semua Metode</option>
          <option value="QRIS">QRIS</option>
          <option value="BCA Virtual Account">BCA Virtual Account</option>
          <option value="Mandiri VA">Mandiri VA</option>
          <option value="GoPay">GoPay</option>
          <option value="ShopeePay">ShopeePay</option>
        </select>
      </SearchFilterBar>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-7 h-7" />}
          title="Tidak Ada Transaksi"
          description="Tidak ada catatan transaksi yang sesuai dengan filter pencarian Anda."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#EEE8F0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8FB] text-[11px] font-bold text-[#786F7D] uppercase tracking-wider border-b border-[#EEE8F0]">
                  <th className="py-3 px-4">ID Transaksi</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Paket</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4 text-right">Total Bayar</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Waktu Transaksi</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8F0]">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF8FB] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#4B0B7A]">
                      {tx.id}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-[#24172B]">{tx.userName}</p>
                      <span className="text-[10px] text-[#786F7D] font-mono">{tx.userEmail}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-[#24172B]">
                      {tx.planName}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#F8F7FA] font-medium text-[#786F7D] border border-[#EEE8F0]">
                        {tx.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#24172B]">
                      {formatRupiah(tx.total)}
                      {tx.discount > 0 && (
                        <span className="block text-[10px] text-[#21865B] font-semibold">
                          Hemat {formatRupiah(tx.discount)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge type="transaction" value={tx.status} />
                    </td>

                    <td className="py-3 px-4 text-[#786F7D] font-medium">
                      {formatDateTime(tx.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F6F1F8] text-[#4B0B7A] hover:bg-[#E9DEEF] transition-colors"
                      >
                        Kuitansi
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
            totalItems={filteredTransactions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Simulated Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EEE8F0] transform animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE8F0]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#21865B]" />
                <h3 className="text-base font-bold text-[#24172B]">Kuitansi Pembayaran Demo</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 text-[#786F7D] hover:text-[#24172B] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 bg-[#FAF8FB] rounded-xl border border-[#EEE8F0]">
              <span className="text-[11px] text-[#786F7D] uppercase font-bold tracking-wider">
                Total Dibayar
              </span>
              <p className="text-2xl font-black text-[#24172B] mt-0.5">{formatRupiah(selectedTx.total)}</p>
              <div className="mt-1 flex items-center justify-center">
                <StatusBadge type="transaction" value={selectedTx.status} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">ID Transaksi:</span>
                <span className="font-mono font-bold text-[#4B0B7A]">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Pelanggan:</span>
                <span className="font-bold text-[#24172B]">{selectedTx.userName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Paket:</span>
                <span className="font-semibold text-[#24172B]">{selectedTx.planName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F6F1F8]">
                <span className="text-[#786F7D]">Metode Bayar:</span>
                <span className="font-semibold text-[#24172B]">{selectedTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#786F7D]">Waktu:</span>
                <span className="font-medium text-[#786F7D]">{formatDateTime(selectedTx.createdAt)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EEE8F0] flex items-center justify-between text-xs">
              <span className="text-[#786F7D] text-[10px] italic">*Simulasi prototype frontend</span>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-[#4B0B7A] text-white text-xs font-bold hover:bg-[#3B0762]"
              >
                Tutup Kuitansi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
